"use client";

import { useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  Bell,
  Clock,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  Save,
  RefreshCw,
} from "lucide-react";

export default function ManagerNotificationsPage() {
  const [approvalReminders, setApprovalReminders] = useState({
    enabled: true,
    frequency: "Daily",
    time: "10:00",
    digest: true,
    channels: { email: true, inApp: true, push: false },
  });
  const [slaEscalations, setSlaEscalations] = useState({
    enabled: true,
    duration: 48,
    unit: "Hours",
    escalateTo: "HR Admin",
    notifyManager: true,
    levelTwo: "Company Admin",
  });
  const [performanceNudges, setPerformanceNudges] = useState({
    enabled: true,
    frequency: "Weekly",
    riskThreshold: 40,
    inactivityDays: 14,
    channels: { email: true, inApp: true },
  });
  const [probationAlerts, setProbationAlerts] = useState({
    enabled: true,
    alertBefore: 15,
    reminderFrequency: "Every 3 days",
    escalate: true,
    escalationAfter: 7,
  });
  const [lastSaved, setLastSaved] = useState(null);
  const [confirmSaveAll, setConfirmSaveAll] = useState(false);

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "Smart Automations", href: "/manager/notifications" },
  ];

  const summary = useMemo(
    () => [
      { label: "Approval Reminders", value: approvalReminders.enabled ? "Enabled" : "Disabled" },
      { label: "SLA Escalations", value: slaEscalations.enabled ? "Enabled" : "Disabled" },
      { label: "Performance Nudges", value: performanceNudges.enabled ? "Enabled" : "Disabled" },
      { label: "Probation Alerts", value: probationAlerts.enabled ? "Enabled" : "Disabled" },
    ],
    [approvalReminders.enabled, slaEscalations.enabled, performanceNudges.enabled, probationAlerts.enabled]
  );

  const handleSave = () => {
    setLastSaved(new Date().toLocaleString());
  };

  const handleReset = () => {
    setApprovalReminders({
      enabled: true,
      frequency: "Daily",
      time: "10:00",
      digest: true,
      channels: { email: true, inApp: true, push: false },
    });
    setSlaEscalations({
      enabled: true,
      duration: 48,
      unit: "Hours",
      escalateTo: "HR Admin",
      notifyManager: true,
      levelTwo: "Company Admin",
    });
    setPerformanceNudges({
      enabled: true,
      frequency: "Weekly",
      riskThreshold: 40,
      inactivityDays: 14,
      channels: { email: true, inApp: true },
    });
    setProbationAlerts({
      enabled: true,
      alertBefore: 15,
      reminderFrequency: "Every 3 days",
      escalate: true,
      escalationAfter: 7,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {summary.map((item) => (
            <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                <Bell className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Smart Automations</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Configure approval, performance, and probation automation</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={handleReset}
              >
                <RefreshCw size={12} /> Reset
              </button>
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                onClick={() => setConfirmSaveAll(true)}
              >
                <Save size={12} /> Save All
              </button>
            </div>
          </div>

          {lastSaved && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Last saved: {lastSaved}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-xl border border-gray-200/70 dark:border-gray-700 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Approval Reminders</h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={approvalReminders.enabled}
                  onChange={() =>
                    setApprovalReminders((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                />
                Enable Approval Reminders
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Reminder Frequency</label>
                  <select
                    value={approvalReminders.frequency}
                    onChange={(e) =>
                      setApprovalReminders((prev) => ({ ...prev, frequency: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  >
                    <option>Daily</option>
                    <option>Every 2 days</option>
                    <option>Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Reminder Time</label>
                  <input
                    type="time"
                    value={approvalReminders.time}
                    onChange={(e) =>
                      setApprovalReminders((prev) => ({ ...prev, time: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={approvalReminders.digest}
                  onChange={() =>
                    setApprovalReminders((prev) => ({ ...prev, digest: !prev.digest }))
                  }
                />
                Include Summary Digest
              </label>
              <div className="flex flex-wrap gap-3 text-sm text-gray-700 dark:text-gray-300">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={approvalReminders.channels.email}
                    onChange={() =>
                      setApprovalReminders((prev) => ({
                        ...prev,
                        channels: { ...prev.channels, email: !prev.channels.email },
                      }))
                    }
                  />
                  Email
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={approvalReminders.channels.inApp}
                    onChange={() =>
                      setApprovalReminders((prev) => ({
                        ...prev,
                        channels: { ...prev.channels, inApp: !prev.channels.inApp },
                      }))
                    }
                  />
                  In-app
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={approvalReminders.channels.push}
                    onChange={() =>
                      setApprovalReminders((prev) => ({
                        ...prev,
                        channels: { ...prev.channels, push: !prev.channels.push },
                      }))
                    }
                  />
                  Push
                </label>
              </div>
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700"
                onClick={handleSave}
              >
                <Save size={12} /> Save Approval Reminders
              </button>
            </section>

            <section className="rounded-xl border border-gray-200/70 dark:border-gray-700 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">SLA & Escalations</h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={slaEscalations.enabled}
                  onChange={() => setSlaEscalations((prev) => ({ ...prev, enabled: !prev.enabled }))}
                />
                Enable Escalation
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">SLA Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={slaEscalations.duration}
                      onChange={(e) =>
                        setSlaEscalations((prev) => ({ ...prev, duration: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                    />
                    <select
                      value={slaEscalations.unit}
                      onChange={(e) => setSlaEscalations((prev) => ({ ...prev, unit: e.target.value }))}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                    >
                      <option>Hours</option>
                      <option>Days</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Escalation To</label>
                  <select
                    value={slaEscalations.escalateTo}
                    onChange={(e) =>
                      setSlaEscalations((prev) => ({ ...prev, escalateTo: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  >
                    <option>HR Admin</option>
                    <option>Manager’s Manager</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={slaEscalations.notifyManager}
                    onChange={() =>
                      setSlaEscalations((prev) => ({ ...prev, notifyManager: !prev.notifyManager }))
                    }
                  />
                  Notify Manager on Escalation
                </label>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Escalation Level 2</label>
                  <select
                    value={slaEscalations.levelTwo}
                    onChange={(e) =>
                      setSlaEscalations((prev) => ({ ...prev, levelTwo: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  >
                    <option>Company Admin</option>
                    <option>None</option>
                  </select>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700"
                onClick={handleSave}
              >
                <Save size={12} /> Save SLA Settings
              </button>
            </section>

            <section className="rounded-xl border border-gray-200/70 dark:border-gray-700 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Performance Nudges</h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={performanceNudges.enabled}
                  onChange={() =>
                    setPerformanceNudges((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                />
                Enable Nudges
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Nudge Frequency</label>
                  <select
                    value={performanceNudges.frequency}
                    onChange={(e) =>
                      setPerformanceNudges((prev) => ({ ...prev, frequency: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  >
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Risk Threshold (%)</label>
                  <input
                    type="number"
                    value={performanceNudges.riskThreshold}
                    onChange={(e) =>
                      setPerformanceNudges((prev) => ({
                        ...prev,
                        riskThreshold: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Progress Inactivity Days</label>
                  <input
                    type="number"
                    value={performanceNudges.inactivityDays}
                    onChange={(e) =>
                      setPerformanceNudges((prev) => ({
                        ...prev,
                        inactivityDays: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-700 dark:text-gray-300">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={performanceNudges.channels.email}
                    onChange={() =>
                      setPerformanceNudges((prev) => ({
                        ...prev,
                        channels: { ...prev.channels, email: !prev.channels.email },
                      }))
                    }
                  />
                  Email
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={performanceNudges.channels.inApp}
                    onChange={() =>
                      setPerformanceNudges((prev) => ({
                        ...prev,
                        channels: { ...prev.channels, inApp: !prev.channels.inApp },
                      }))
                    }
                  />
                  In-app
                </label>
              </div>
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700"
                onClick={handleSave}
              >
                <Save size={12} /> Save Nudges
              </button>
            </section>

            <section className="rounded-xl border border-gray-200/70 dark:border-gray-700 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-primary-600 dark:text-primary-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Probation Alerts</h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={probationAlerts.enabled}
                  onChange={() =>
                    setProbationAlerts((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                />
                Enable Probation Alerts
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Alert Before (Days)</label>
                  <input
                    type="number"
                    value={probationAlerts.alertBefore}
                    onChange={(e) =>
                      setProbationAlerts((prev) => ({
                        ...prev,
                        alertBefore: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Reminder Frequency</label>
                  <select
                    value={probationAlerts.reminderFrequency}
                    onChange={(e) =>
                      setProbationAlerts((prev) => ({
                        ...prev,
                        reminderFrequency: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  >
                    <option>Once</option>
                    <option>Every 3 days</option>
                    <option>Weekly</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={probationAlerts.escalate}
                    onChange={() =>
                      setProbationAlerts((prev) => ({ ...prev, escalate: !prev.escalate }))
                    }
                  />
                  Escalate if No Action
                </label>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Escalation After (Days)</label>
                  <input
                    type="number"
                    value={probationAlerts.escalationAfter}
                    onChange={(e) =>
                      setProbationAlerts((prev) => ({
                        ...prev,
                        escalationAfter: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  />
                </div>
              </div>
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700"
                onClick={handleSave}
              >
                <Save size={12} /> Save Probation Alerts
              </button>
            </section>
          </div>
        </div>

        {confirmSaveAll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Save Smart Automation Settings
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                This will apply all changes across approval reminders, SLA escalations, performance nudges,
                and probation alerts.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setConfirmSaveAll(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                  onClick={() => {
                    handleSave();
                    setConfirmSaveAll(false);
                  }}
                >
                  Confirm Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
