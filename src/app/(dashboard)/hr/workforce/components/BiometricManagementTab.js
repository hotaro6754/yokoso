"use client";

import { useState, useEffect } from "react";
import { 
  Fingerprint, 
  Plus, 
  RefreshCw, 
  Settings, 
  Trash2, 
  Activity, 
  Signal, 
  SignalLow, 
  History, 
  CheckCircle2, 
  XCircle, 
  Search,
  Monitor,
  Calendar,
  Clock,
  User as UserIcon
} from "lucide-react";
import { toast } from "sonner";
import biometricService from "@/services/hr-services/biometric.service";
import InputField from "@/components/form/input/InputField";

export default function BiometricManagementTab() {
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(null); // ID of device being synced
  
  // New Device Form
  const [newDevice, setNewDevice] = useState({
    name: "",
    ipAddress: "",
    port: "4370"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [devicesRes, logsRes] = await Promise.all([
        biometricService.getDevices(),
        biometricService.getLogs({ limit: 10 })
      ]);
      setDevices(devicesRes.data?.data || []);
      setLogs(logsRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching biometric data:", error);
      toast.error("Failed to load biometric data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    try {
      await biometricService.createDevice(newDevice);
      toast.success("Device added successfully");
      setShowAddModal(false);
      setNewDevice({ name: "", ipAddress: "", port: "4370" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add device");
    }
  };

  const handleSync = async (deviceId) => {
    try {
      setIsSyncing(deviceId);
      toast.info("Starting synchronization...");
      const response = await biometricService.syncDevice(deviceId);
      toast.success(response.data?.message || "Sync completed successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Synchronization failed");
    } finally {
      setIsSyncing(null);
    }
  };

  const handleDelete = async (deviceId) => {
    if (!confirm("Are you sure you want to delete this device?")) return;
    try {
      await biometricService.deleteDevice(deviceId);
      toast.success("Device deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete device");
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
            <Monitor size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Devices</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.length}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Logs Processed (Last 24h)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {logs.filter(l => l.isProcessed).length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Sync</p>
            <p className="text-md font-semibold text-gray-900 dark:text-white">
              {devices.some(d => d.lastSyncAt) 
                ? new Date(Math.max(...devices.filter(d => d.lastSyncAt).map(d => new Date(d.lastSyncAt)))).toLocaleTimeString() 
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Management Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Fingerprint className="text-brand-500" size={20} />
              Hardware Devices
            </h3>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-sm text-sm font-medium"
            >
              <Plus size={18} />
              Add Device
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${device.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      <Signal size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white underline-offset-4 decoration-brand-500">{device.name}</h4>
                      <p className="text-xs text-gray-500">{device.ipAddress}:{device.port}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-brand-600"><Settings size={16} /></button>
                    <button onClick={() => handleDelete(device.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="text-xs flex items-center gap-1 text-gray-500">
                    <History size={14} />
                    Sync: {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString() : 'Never'}
                  </div>
                  <button 
                    disabled={isSyncing === device.id}
                    onClick={() => handleSync(device.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSyncing === device.id 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                    }`}
                  >
                    <RefreshCw size={14} className={isSyncing === device.id ? 'animate-spin' : ''} />
                    {isSyncing === device.id ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              </div>
            ))}

            {devices.length === 0 && (
              <div className="col-span-full py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-500">
                <Monitor className="mb-3 opacity-20" size={48} />
                <p>No biometric devices configured</p>
                <button onClick={() => setShowAddModal(true)} className="text-brand-600 font-bold text-sm mt-2">Connect your first device</button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Punches</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Latest Activity</span>
              <button 
                onClick={fetchData}
                className="text-gray-400 hover:text-brand-600 transition-colors"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                        <UserIcon size={14} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">User #{log.biometricId}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.isProcessed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {log.isProcessed ? 'PROCESSED' : 'RAW'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-gray-500 mt-2">
                    <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(log.punchTime).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1"><Clock size={12} /> {new Date(log.punchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">No recent punch logs</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-brand-600">
              <h4 className="text-xl font-bold text-white">Add Biometric Device</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white hover:scale-110 transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateDevice} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Device Name</label>
                <InputField 
                  placeholder="Office Main Entry"
                  required
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">IP Address</label>
                  <InputField 
                    placeholder="192.168.1.201"
                    required
                    value={newDevice.ipAddress}
                    onChange={(e) => setNewDevice({...newDevice, ipAddress: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Port</label>
                  <InputField 
                    type="number"
                    placeholder="4370"
                    required
                    value={newDevice.port}
                    onChange={(e) => setNewDevice({...newDevice, port: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 bg-gray-50 dark:bg-gray-700/30 -mx-6 -mb-6 p-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30 transition-all"
                >
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
