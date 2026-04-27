"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Laptop, Smartphone, Tablet, Monitor, LogOut, MapPin, Clock, Globe, CheckCircle2, XCircle } from "lucide-react";

export default function ConnectedDevicesPage() {
  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Settings", href: "/employee/settings" },
    { label: "Active Sessions", href: "/employee/settings/connected-devices" },
  ];

  // Hardcoded devices data
  const [devices, setDevices] = useState([
    {
      id: 1,
      type: "Laptop",
      name: "MacBook Pro",
      os: "macOS Monterey",
      browser: "Chrome 140",
      location: "Ahmedabad, India",
      lastActive: "Today, 10:20 AM",
      connected: true,
      ipAddress: "192.168.1.100",
    },
    {
      id: 2,
      type: "Smartphone",
      name: "iPhone 14",
      os: "iOS 17",
      browser: "Safari",
      location: "Ahmedabad, India",
      lastActive: "Yesterday, 8:45 PM",
      connected: true,
      ipAddress: "192.168.1.101",
    },
    {
      id: 3,
      type: "Tablet",
      name: "iPad Air",
      os: "iPadOS 17",
      browser: "Chrome",
      location: "Mumbai, India",
      lastActive: "2 days ago",
      connected: false,
      ipAddress: "192.168.1.102",
    },
  ]);

  const handleDisconnect = (id) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, connected: false } : d
      )
    );
  };

  const activeDevices = devices.filter(d => d.connected).length;
  const totalDevices = devices.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Sessions</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monitor and control devices currently accessing your account
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Devices</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{activeDevices}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDevices}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Devices List */}
        <div className="space-y-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Device Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    device.connected 
                      ? "bg-primary-100 dark:bg-primary-500/20" 
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}>
                    <DeviceIcon type={device.type} connected={device.connected} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {device.name}
                      </h3>
                      {device.connected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span>{device.os}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{device.browser}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{device.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{device.lastActive}</span>
                      </div>
                    </div>
                    {device.ipAddress && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        IP: {device.ipAddress}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {device.connected && (
                    <button
                      onClick={() => handleDisconnect(device.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security Note */}
        <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-primary-700 dark:text-primary-400">Security Tip:</strong> If you notice any suspicious activity or unrecognized devices, disconnect them immediately and change your password.
          </p>
        </div>
      </div>
    </div>
  );
}

// Device icon component
function DeviceIcon({ type, connected }) {
  const iconClass = connected 
    ? "w-7 h-7 text-primary-600 dark:text-primary-400" 
    : "w-7 h-7 text-gray-400 dark:text-gray-500";

  switch (type) {
    case "Laptop":
      return <Laptop className={iconClass} />;
    case "Smartphone":
      return <Smartphone className={iconClass} />;
    case "Tablet":
      return <Tablet className={iconClass} />;
    default:
      return <Monitor className={iconClass} />;
  }
}
