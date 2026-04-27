"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import { CalendarDays, Clock, Save } from "lucide-react";
import { payrollAutomationService } from "@/services/payroll-role-services/payroll-automation.service";

const timezones = [
  "Asia/Kolkata",
  "UTC",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
];

export default function PayrollAutomationPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoSendPayslips: false,
    sendDay: 30,
    sendTime: "09:00",
    timezone: "Asia/Kolkata",
    lastRunAt: null,
  });
  const timeRef = useRef(null);

  const openPicker = (ref) => {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === "function") {
      ref.current.showPicker();
      return;
    }
    ref.current.focus();
    ref.current.click();
  };
  const daysInMonthOptions = useMemo(
    () => Array.from({ length: 31 }, (_, index) => index + 1),
    [],
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await payrollAutomationService.getSettings();
        const data = response.data || response?.data?.data || response;
        setSettings((prev) => ({
          ...prev,
          autoSendPayslips: Boolean(data.autoSendPayslips),
          sendDay: data.sendDay ?? prev.sendDay,
          sendTime: data.sendTime ?? prev.sendTime,
          timezone: data.timezone ?? prev.timezone,
          lastRunAt: data.lastRunAt || null,
        }));
      } catch (error) {
        toast.error(error.message || "Failed to load automation settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        autoSendPayslips: settings.autoSendPayslips,
        sendDay: Number(settings.sendDay),
        sendTime: settings.sendTime,
        timezone: settings.timezone,
      };
      const response = await payrollAutomationService.updateSettings(payload);
      const data = response.data || response?.data?.data || response;
      setSettings((prev) => ({
        ...prev,
        autoSendPayslips: Boolean(data.autoSendPayslips),
        sendDay: data.sendDay ?? prev.sendDay,
        sendTime: data.sendTime ?? prev.sendTime,
        timezone: data.timezone ?? prev.timezone,
        lastRunAt: data.lastRunAt || prev.lastRunAt,
      }));
      toast.success(response.message || "Automation settings updated");
    } catch (error) {
      toast.error(error.message || "Failed to update automation settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <Breadcrumb />

      <div className="mt-6 w-full space-y-6">
        <div className="rounded-3xl border border-gray-200/70 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/70 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-white/5 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/15 to-brand-600/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Payslip Automation
                </h2>
                <p className="text-sm text-muted-foreground">
                  Schedule when payslips are generated and emailed
                  automatically.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-50/60 dark:bg-brand-900/20 px-4 py-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-500" />
                Monthly schedule
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" />
                Uses selected timezone
              </span>
              <span className="inline-flex items-center gap-2 text-[11px]">
                Last run:{" "}
                <span className="font-semibold text-foreground">
                  {settings.lastRunAt
                    ? new Date(settings.lastRunAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-6 sm:p-8 text-sm text-muted-foreground">
              Loading settings...
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6">
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-gray-800/40 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Enable automatic payslip emails
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sends payslips automatically on the scheduled date.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSendPayslips}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoSendPayslips: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Send Day
                  </label>
                  <div className="relative">
                    <select
                      value={settings.sendDay}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          sendDay: Number(e.target.value),
                        }))
                      }
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-brand-500"
                    >
                      {daysInMonthOptions.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Payslips will send every month on day {settings.sendDay}.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Send Time
                  </label>
                  <div className="relative">
                    <input
                      ref={timeRef}
                      type="time"
                      value={settings.sendTime}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          sendTime: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-brand-500"
                    />
                    <Clock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={() => openPicker(timeRef)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        timezone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-brand-500"
                  >
                    {timezones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
