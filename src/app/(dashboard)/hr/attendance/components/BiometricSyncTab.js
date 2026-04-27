"use client";

import { useState, useEffect, useRef } from "react";
import {
  Fingerprint,
  Plus,
  RefreshCw,
  Trash2,
  Activity,
  Signal,
  History,
  CheckCircle2,
  XCircle,
  Monitor,
  Calendar,
  Clock,
  User as UserIcon,
  ArrowRight,
  Server,
  MapPin,
  Cpu,
  Key,
  Copy,
  Download,
  Shield,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { integrationService } from "@/services/super-admin-services/integration.service";
import biometricService from "@/services/hr-services/biometric.service";
import BiometricAuditLog from "./BiometricAuditLog";

const ENVIRONMENTS = [
  { value: "PRODUCTION", label: "Production" },
  { value: "SANDBOX", label: "Sandbox / Test" },
];

const SYNC_FREQUENCIES = [
  { value: "MANUAL", label: "Manual Only" },
  { value: "HOURLY", label: "Hourly" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
];

const defaultForm = {
  name: "",
  device_id: "",
  vendor: "",
  location_id: "",
  environment: "PRODUCTION",
  syncFrequency: "MANUAL",
};

export default function BiometricSyncTab() {
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(null);
  const [syncResults, setSyncResults] = useState({}); // deviceId → { newLogs, processed }
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [generatingKey, setGeneratingKey] = useState(null);
  const [syncingDevice, setSyncingDevice] = useState(null); // full device object
  const [syncPhase, setSyncPhase] = useState(''); // 'signalling' | 'waiting' | 'processing'
  const [syncElapsed, setSyncElapsed] = useState(0);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const syncAbortRef = useRef(null);
  const [apiKeyModal, setApiKeyModal] = useState(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1 = Setup Guide, 2 = Form
  const [hasReadGuide, setHasReadGuide] = useState(false);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes — keeps device status and logs up to date
    const autoRefresh = setInterval(() => {
      // Don't refresh while a manual sync is in progress
      if (!isSyncing) fetchData();
    }, 5 * 60 * 1000);

    return () => clearInterval(autoRefresh);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [intRes, logsRes] = await Promise.all([
        integrationService.getAllIntegrations(),
        biometricService.getLogs({ limit: 50 }),
      ]);
      const all = intRes.data || intRes.integrations || intRes.docs || [];
      setDevices(all.filter((i) => i.type === "BIOMETRIC"));
      setLogs(logsRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching biometric data:", error);
      toast.error("Failed to load biometric data");
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.device_id.trim()) e.device_id = "Device ID is required";
    if (!form.vendor.trim()) e.vendor = "Vendor is required";
    if (!form.location_id || isNaN(Number(form.location_id)))
      e.location_id = "Valid Location ID is required";
    return e;
  };

  const handleConnectMachine = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    try {
      await integrationService.createIntegration({
        name: form.name.trim(),
        type: "BIOMETRIC",
        status: "ACTIVE",
        environment: form.environment,
        syncFrequency: form.syncFrequency,
        config: {
          device_id: form.device_id.trim(),
          vendor: form.vendor.trim(),
          location_id: Number(form.location_id),
        },
        ipWhitelist: [],
      });
      toast.success("Machine connected successfully");
      setShowAddModal(false);
      setForm(defaultForm);
      setErrors({});
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to connect machine");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async (device, isRetry = false) => {
    const deviceId = device.id;

    // Reset state
    setSyncingDevice(device);
    setSyncPhase('signalling');
    setSyncElapsed(0);
    setSyncAttempt(prev => isRetry ? prev + 1 : 1);
    setSyncResults(prev => ({ ...prev, [deviceId]: null }));
    setIsSyncing(deviceId);

    // Abort controller for cleanup
    let aborted = false;
    syncAbortRef.current = () => { aborted = true; };

    // Elapsed timer — ticks every second
    const elapsedTimer = setInterval(() => {
      setSyncElapsed(prev => prev + 1);
    }, 1000);

    try {
      // Step 1: Signal agent
      setSyncPhase('signalling');
      const triggerRes = await integrationService.syncIntegration(deviceId);
      const baseline = triggerRes?.data?.currentLogCount ?? 0;

      if (aborted) return;

      // Step 2: Poll indefinitely every 3s — no timeout, user can retry/cancel
      setSyncPhase('waiting');
      let newLogs = 0;
      let processed = 0;
      let namesFilled = 0;
      let done = false;
      let attempt = 0;

      while (!aborted) {
        await new Promise(r => setTimeout(r, 3000));
        if (aborted) break;

        attempt++;

        // Switch phase message after a while
        if (attempt >= 4) setSyncPhase('waiting');
        if (attempt >= 10) setSyncPhase('processing');

        try {
          const statusRes = await integrationService.getSyncStatus(deviceId, baseline);
          const status = statusRes?.data;

          if (status?.done) {
            newLogs = status.newLogs ?? 0;
            processed = status.processed ?? 0;
            namesFilled = status.namesFilled ?? 0;
            done = true;
            break;
          }

          // If agent cleared the flag but backend somehow didn't return 'done: true' (safety)
          if (status && !status.stillPending && attempt >= 5) {
             done = true;
             break;
          }

          // Timeout after ~2 minutes (40 attempts * 3s)
          if (attempt >= 40) {
            toast.error("Agent timed out — please check if the Zodeck Agent is running on your machine.");
            break;
          }
        } catch (err) {
          console.warn(`[Sync poll ${attempt}] error:`, err.message);
        }
      }

      if (aborted) return;

      clearInterval(elapsedTimer);
      setSyncingDevice(null);
      setSyncPhase('');

      if (done && newLogs > 0) {
        const parts = [`${newLogs} new punch${newLogs !== 1 ? 'es' : ''} received`];
        if (processed > 0) parts.push(`${processed} processed into attendance`);
        if (namesFilled > 0) parts.push(`${namesFilled} names resolved`);
        toast.success(parts.join(' · '), { duration: 6000 });
        setSyncResults(prev => ({ ...prev, [deviceId]: { newLogs, processed, namesFilled, at: new Date() } }));
      } else if (done) {
        toast.success('Up to date — no new punches from machine', { duration: 4000 });
        setSyncResults(prev => ({ ...prev, [deviceId]: { newLogs: 0, processed: 0, namesFilled: 0, at: new Date() } }));
      }

      fetchData();
    } catch (error) {
      clearInterval(elapsedTimer);
      setSyncingDevice(null);
      setSyncPhase('');
      toast.error(error.response?.data?.message || 'Sync failed — check agent is running');
    } finally {
      clearInterval(elapsedTimer);
      setIsSyncing(null);
    }
  };

  const handleCancelSync = () => {
    if (syncAbortRef.current) syncAbortRef.current();
    setSyncingDevice(null);
    setSyncPhase('');
    setSyncElapsed(0);
    setIsSyncing(null);
    toast.info('Sync cancelled');
  };

  const handleDelete = async (deviceId) => {
    if (!confirm("Are you sure you want to disconnect this machine?")) return;
    try {
      await integrationService.deleteIntegration(deviceId);
      toast.success("Device disconnected");
      fetchData();
    } catch (error) {
      toast.error("Failed to disconnect device");
    }
  };

  const handleGenerateKey = async (device) => {
    if (!confirm("Generating a new API Key will revoke the existing one. Continue?")) return;
    setGeneratingKey(device.id);
    try {
      const res = await integrationService.generateApiKey(device.id);
      const apiKey = res?.data?.apiKey || res?.apiKey;
      if (!apiKey) {
        toast.error("Key generated but not returned — check backend response");
        return;
      }
      toast.success("New API Key generated");
      setApiKeyModal({ key: apiKey, generatedAt: new Date(), deviceName: device.name });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate API Key");
    } finally {
      setGeneratingKey(null);
    }
  };

  const handleCopyKey = async () => {
    if (!apiKeyModal?.key) return;
    try {
      await navigator.clipboard.writeText(apiKeyModal.key);
      toast.success("API key copied to clipboard");
    } catch {
      toast.error("Failed to copy — please copy manually");
    }
  };

  const handleDownloadKey = () => {
    if (!apiKeyModal?.key) return;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
    const safeName = (apiKeyModal.deviceName || "device")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const content = [
      "Zodeck Biometric Integration API Key",
      "=====================================",
      `Device:       ${apiKeyModal.deviceName}`,
      `Generated At: ${apiKeyModal.generatedAt.toISOString()}`,
      "",
      `API Key:      ${apiKeyModal.key}`,
      `Backend URL:  ${baseUrl}`,
      "",
      "Keep this key secure. It will not be shown again.",
      "",
      "Agent Setup:",
      `  HRMS API URL : ${baseUrl}`,
      `  API Key      : ${apiKeyModal.key}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}-api-key.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("API key file downloaded");
  };

  const handleReprocess = async () => {
    if (!confirm("This will resolve all 'Unknown Employee' names and reprocess unprocessed logs into attendance records. Continue?")) return;
    setIsReprocessing(true);
    try {
      const res = await biometricService.reprocessLogs();
      const data = res.data?.data || res.data;
      toast.success(`Done — ${data?.namesFilled ?? 0} names resolved, ${data?.processed ?? 0} logs processed`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Reprocess failed");
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const stats = {
    totalDevices: devices.length,
    processedLogs: logs.filter((l) => l.isProcessed).length,
    activeDevices: devices.filter((d) => d.status === "ACTIVE").length,
    lastSync: devices.some((d) => d.lastSyncAt)
      ? new Date(
          Math.max(
            ...devices
              .filter((d) => d.lastSyncAt)
              .map((d) => new Date(d.lastSyncAt))
          )
        )
      : null,
  };

  if (showAuditLog) {
    return <BiometricAuditLog onBack={() => setShowAuditLog(false)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Fingerprint className="w-8 h-8" />
              Biometric Attendance Center
            </h2>
            <p className="text-brand-100 mt-1 text-sm max-w-xl">
              Connect your ZKTeco machines to Zodeck. Once linked via Biometric
              ID, employee punches will automatically create attendance records
              in real-time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {devices.length > 0 && (
              <button
                onClick={handleReprocess}
                disabled={isReprocessing}
                className="px-5 py-3 bg-white/20 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 text-sm disabled:opacity-60"
              >
                <RefreshCw size={16} className={isReprocessing ? "animate-spin" : ""} />
                {isReprocessing ? "Fixing..." : "Fix Names & Reprocess"}
              </button>
            )}
            <button
              onClick={() => { setShowAddModal(true); setModalStep(1); setHasReadGuide(false); }}
              className="px-6 py-3 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={20} />
              Connect New Machine
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Download Agent Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Download size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Agent Download</span>
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/agent/releases/latest/download`}
              download
              className="block w-full px-4 py-2.5 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-all text-center text-sm shadow-md mb-2"
            >
              Download Latest
            </a>
            <a
              href="/biometric-agent-setup"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-white/20 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/30 transition-all text-center text-xs"
            >
              📖 Setup Guide
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Monitor size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Active Devices</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeDevices}</span>
            <span className="text-xs text-gray-400">/ {stats.totalDevices} Total</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Logs Processed</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-600">{stats.processedLogs}</span>
            <span className="text-xs text-gray-400">Latest Batch</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <History size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Last Activity</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {stats.lastSync
                ? stats.lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "N/A"}
            </span>
            <span className="text-[10px] text-gray-400">
              {stats.lastSync ? stats.lastSync.toLocaleDateString() : "Never synced"}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Activity size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${stats.activeDevices > 0 ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {stats.activeDevices > 0 ? "Online & Listening" : "Waiting for Device"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware Inventory */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hardware Inventory</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm group relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${device.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                      <Signal size={22} className={device.status === "ACTIVE" ? "" : "opacity-40"} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{device.name}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {device.config?.vendor || "—"} · {device.config?.device_id || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleGenerateKey(device)}
                      disabled={generatingKey === device.id}
                      title="Generate API Key"
                      className="p-2 text-gray-400 hover:text-brand-600 transition-colors disabled:opacity-40"
                    >
                      <Key size={15} className={generatingKey === device.id ? "animate-pulse" : ""} />
                    </button>
                    <button
                      onClick={() => handleDelete(device.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Disconnect device"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Device meta */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    <MapPin size={10} /> Loc {device.config?.location_id ?? "—"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    <Cpu size={10} /> {device.syncFrequency}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
                    device.environment === "PRODUCTION"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    <Server size={10} /> {device.environment}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                    <span>Last Sync</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {device.lastSyncAt
                        ? new Date(device.lastSyncAt).toLocaleString()
                        : "Never Synced"}
                    </span>
                  </div>

                  {/* Show result of last manual sync */}
                  {syncResults[device.id] && (
                    <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                      syncResults[device.id].timedOut
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-green-50 dark:bg-green-900/20'
                    }`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${
                        syncResults[device.id].timedOut ? 'text-red-600' : 'text-green-700 dark:text-green-400'
                      }`}>
                        Last Result
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-semibold">
                        {syncResults[device.id].timedOut ? (
                          <span className="text-red-600">Agent offline</span>
                        ) : syncResults[device.id].newLogs > 0 ? (
                          <>
                            <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                              +{syncResults[device.id].newLogs} new
                            </span>
                            {syncResults[device.id].processed > 0 && (
                              <span className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                {syncResults[device.id].processed} processed
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500">Up to date</span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    disabled={isSyncing === device.id}
                    onClick={() => handleSync(device)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSyncing === device.id
                        ? "bg-gray-100 text-gray-400"
                        : "bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/10"
                    }`}
                  >
                    <RefreshCw size={14} className={isSyncing === device.id ? "animate-spin" : ""} />
                    {isSyncing === device.id ? "Fetching from machine..." : "Synchronize Now"}
                  </button>
                </div>
              </div>
            ))}

            {devices.length === 0 && (
              <div className="col-span-full py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
                  <Monitor className="text-gray-300" size={40} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Start Hardware Sync</h4>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                  Connecting your first ZKTeco machine takes less than 2 minutes.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-brand-600 font-bold hover:underline"
                >
                  Configure Hardware
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Punch Monitor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Monitor</h3>
            <button
              onClick={fetchData}
              className="p-2 text-gray-400 hover:text-brand-600 transition-all"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Punches</span>
              <Activity size={14} className="text-brand-500 animate-pulse" />
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600">
                        <UserIcon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {log.userName && log.userName !== 'Unknown Employee'
                            ? log.userName
                            : <span className="text-gray-500">Unknown</span>
                          }
                          <span className="text-[10px] text-gray-400 font-mono font-normal ml-2">
                            #{log.biometricId}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 font-medium">
                          <Calendar size={10} />
                          {new Date(log.punchTime).toLocaleDateString()}
                          <Clock size={10} className="ml-1" />
                          {new Date(log.punchTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      log.isProcessed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {log.isProcessed ? "Synced" : "Raw Data"}
                    </div>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-50">
                  <History size={40} className="mb-2" />
                  <p className="text-xs font-bold uppercase italic tracking-widest text-center px-6">
                    Establishing Connection...
                  </p>
                </div>
              )}
            </div>

            {logs.length > 0 && (
              <div className="p-3 bg-gray-50/50 border-t border-gray-100 dark:border-gray-700 text-center">
                <button
                  onClick={() => setShowAuditLog(true)}
                  className="text-[11px] font-bold text-gray-400 hover:text-brand-600 transition-all flex items-center justify-center gap-1 mx-auto"
                >
                  View Full Audit Log <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {apiKeyModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-8 py-5">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">API Key Generated</h4>
                <p className="text-xs text-gray-500 mt-0.5">{apiKeyModal.deviceName}</p>
              </div>
              <button
                onClick={() => setApiKeyModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5">
              {/* Warning */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <Shield size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 font-medium">
                  Save this key now. For security reasons, it will <strong>not be shown again</strong> after you close this dialog.
                </p>
              </div>

              {/* Backend URL */}
              <div className="bg-gray-900 rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Backend URL (for agent setup)</p>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-sm text-green-400 break-all flex-1">
                    {(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}
                  </p>
                  <button
                    onClick={() => {
                      const url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
                      navigator.clipboard.writeText(url);
                      toast.success('Backend URL copied!');
                    }}
                    className="flex-shrink-0 px-3 py-1.5 bg-gray-700 text-white text-xs font-semibold rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Key display */}
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">API Key</p>
                <p className="font-mono text-sm break-all text-gray-900 dark:text-white leading-relaxed select-all">
                  {apiKeyModal.key}
                </p>
              </div>

              <p className="text-xs text-gray-400">
                Generated at: {apiKeyModal.generatedAt.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 px-8 pb-8">
              <button
                onClick={handleCopyKey}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <Copy size={16} /> Copy Key
              </button>
              <button
                onClick={handleDownloadKey}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-brand-200 bg-brand-50 rounded-2xl text-sm font-bold text-brand-700 hover:bg-brand-100 transition-all"
              >
                <Download size={16} /> Download .txt
              </button>
              <button
                onClick={() => setApiKeyModal(null)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-600 rounded-2xl text-sm font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sync Loader Modal ─────────────────────────────────────────────── */}
      {syncingDevice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400 bg-[length:200%_100%] animate-shimmer-bar" />

            <div className="p-8 text-center space-y-6">
              {/* Spinner */}
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-gray-700" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint className="w-8 h-8 text-brand-600" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {syncPhase === 'signalling' && 'Connecting to Agent...'}
                  {syncPhase === 'waiting'    && 'Fetching Attendance Data'}
                  {syncPhase === 'processing' && 'Processing Records'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {syncPhase === 'signalling' && 'Sending sync request to your office agent...'}
                  {syncPhase === 'waiting'    && <>We are gathering data from your <strong className="text-gray-700 dark:text-gray-200">"{syncingDevice.name}"</strong> hardware. This may take a moment as the agent connects to your biometric device.</>}
                  {syncPhase === 'processing' && <>Still syncing from <strong className="text-gray-700 dark:text-gray-200">"{syncingDevice.name}"</strong>. Large attendance logs take longer — please wait.</>}
                </p>
              </div>

              {/* Elapsed time */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Clock size={14} />
                <span>
                  {syncElapsed < 60
                    ? `${syncElapsed}s elapsed`
                    : `${Math.floor(syncElapsed / 60)}m ${syncElapsed % 60}s elapsed`}
                </span>
              </div>

              {/* Steps indicator */}
              <div className="flex items-center justify-center gap-2 text-xs">
                {['signalling', 'waiting', 'processing'].map((phase, i) => (
                  <div key={phase} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-all ${
                      syncPhase === phase ? 'bg-brand-600 scale-125' :
                      ['signalling', 'waiting', 'processing'].indexOf(syncPhase) > i ? 'bg-green-500' :
                      'bg-gray-200 dark:bg-gray-700'
                    }`} />
                    {i < 2 && <div className="w-6 h-px bg-gray-200 dark:bg-gray-700" />}
                  </div>
                ))}
              </div>

              {/* Stuck? Retry — show after 20s */}
              {syncElapsed >= 20 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-left">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    🤔 Taking longer than usual?
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                    Make sure the agent is running on your office computer and the device is powered on and reachable on the network.
                  </p>
                  <button
                    onClick={() => {
                      handleCancelSync();
                      setTimeout(() => handleSync(syncingDevice, true), 300);
                    }}
                    className="w-full py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-all"
                  >
                    🔄 Retry Sync
                  </button>
                </div>
              )}

              {/* Cancel */}
              <button
                onClick={handleCancelSync}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all underline underline-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect New Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-8 bg-brand-600 text-white relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                  {modalStep}
                </div>
                <div>
                  <h4 className="text-2xl font-bold">
                    {modalStep === 1 ? "Setup Guide" : "New Machine Setup"}
                  </h4>
                  <p className="text-brand-100 text-sm mt-1">
                    {modalStep === 1 
                      ? "Download and configure the biometric agent first" 
                      : "Register your ZKTeco biometric device with Zodeck"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { 
                  setShowAddModal(false); 
                  setForm(defaultForm); 
                  setErrors({}); 
                  setModalStep(1);
                  setHasReadGuide(false);
                }}
                className="absolute top-8 right-8 text-white/60 hover:text-white transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Step 1: Setup Guide */}
            {modalStep === 1 && (
              <div className="p-8 space-y-6">
                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} />
                    Before You Continue
                  </h3>
                  <p className="text-blue-800 text-sm">
                    To connect a biometric device, you need to install the Zodeck Biometric Agent on a Windows computer 
                    in your office network. This agent syncs attendance data from your device to the cloud.
                  </p>
                </div>

                {/* Download Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                        <Download size={20} />
                        Download Biometric Agent
                      </h3>
                      <p className="text-blue-100 text-sm">Latest version for Windows</p>
                    </div>
                  </div>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/agent/releases/latest/download`}
                    download
                    className="block w-full px-6 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-all text-center shadow-lg mb-3"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Download size={18} />
                      Download zodeck-agent.exe
                    </div>
                  </a>
                  <p className="text-blue-100 text-xs text-center">
                    Size: ~52MB | Platform: Windows 7+ | Version: Latest
                  </p>
                </div>

                {/* Setup Guide Link */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Need Help with Setup?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Follow our detailed step-by-step guide to install and configure the agent.
                  </p>
                  <a
                    href="/biometric-agent-setup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all"
                  >
                    📖 Open Complete Setup Guide
                    <ExternalLink size={16} />
                  </a>
                </div>

                {/* API URL Info Card */}
                <div className="bg-gray-900 rounded-xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Your API URL (use this in agent setup)</p>
                  <div className="flex items-center gap-3">
                    <code className="text-green-400 text-sm break-all flex-1">
                      {(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, ''));
                        toast.success('API URL copied!');
                      }}
                      className="flex-shrink-0 px-3 py-1.5 bg-gray-700 text-white text-xs font-semibold rounded-lg hover:bg-gray-600 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Paste this exactly when the agent asks for "HRMS API URL"</p>
                </div>

                {/* Requirements Checklist */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Before Proceeding, Make Sure:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Agent is downloaded and installed on your office computer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Agent is configured with the API URL shown above and your API Key</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Agent is connected to your biometric device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Agent is running and showing "Agent running" status</span>
                    </li>
                  </ul>
                </div>

                {/* Confirmation Checkbox */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasReadGuide}
                      onChange={(e) => setHasReadGuide(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-white"
                    />
                    <div className="text-white">
                      <p className="font-semibold">I have installed and configured the agent</p>
                      <p className="text-blue-100 text-sm mt-1">
                        The agent is running on my office computer and ready to sync data
                      </p>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { 
                      setShowAddModal(false); 
                      setModalStep(1);
                      setHasReadGuide(false);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalStep(2)}
                    disabled={!hasReadGuide}
                    className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all ${
                      hasReadGuide
                        ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Device Setup →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Machine Configuration Form */}
            {modalStep === 2 && (
              <form onSubmit={handleConnectMachine} className="p-8 space-y-5">
              {/* Friendly Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Friendly Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reception K40 Pro"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500 ${
                    errors.name ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>

              {/* Device ID + Vendor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Device ID / Serial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ZKT-001"
                    value={form.device_id}
                    onChange={(e) => handleFieldChange("device_id", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all focus:ring-2 focus:ring-brand-500 ${
                      errors.device_id ? "border-red-400 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.device_id && <p className="text-red-500 text-xs">{errors.device_id}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ZKTeco"
                    value={form.vendor}
                    onChange={(e) => handleFieldChange("vendor", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500 ${
                      errors.vendor ? "border-red-400 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.vendor && <p className="text-red-500 text-xs">{errors.vendor}</p>}
                </div>
              </div>

              {/* Location ID + Sync Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Location ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={form.location_id}
                    onChange={(e) => handleFieldChange("location_id", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all focus:ring-2 focus:ring-brand-500 ${
                      errors.location_id ? "border-red-400 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.location_id && <p className="text-red-500 text-xs">{errors.location_id}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Sync Frequency</label>
                  <select
                    value={form.syncFrequency}
                    onChange={(e) => handleFieldChange("syncFrequency", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {SYNC_FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Environment */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Environment</label>
                <div className="flex gap-3">
                  {ENVIRONMENTS.map((env) => (
                    <button
                      key={env.value}
                      type="button"
                      onClick={() => handleFieldChange("environment", env.value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        form.environment === env.value
                          ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20"
                          : "border-gray-200 text-gray-500 hover:border-brand-300"
                      }`}
                    >
                      {env.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600 transition-all border border-gray-100 rounded-2xl"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Connecting...
                    </>
                  ) : (
                    "Save Connection"
                  )}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
