"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Copy, ShieldCheck, Download, Smartphone, CheckCircle2, AlertCircle, QrCode } from "lucide-react";

export default function TwoFactorAuthPage() {
  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Settings", href: "/employee/settings" },
    { label: "Two-Factor Authentication", href: "/employee/settings/two-factor-auth" },
  ];

  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [message, setMessage] = useState("");

  // Hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleToggle = () => {
    setIs2FAEnabled((prev) => !prev);
    setMessage(is2FAEnabled ? "Two-Factor Authentication disabled" : "Two-Factor Authentication enabled");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("RecoveryCode-123456").then(() => {
      setMessage("Recovery codes copied to clipboard");
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob(["RecoveryCode-123456"], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "recovery-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setMessage("Recovery codes downloaded");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Enhance your account security by enabling two-factor authentication
          </p>
        </div>

        {/* Toggle Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {is2FAEnabled ? "Your account is protected with 2FA" : "Enable 2FA to add an extra layer of security"}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={is2FAEnabled}
                onChange={handleToggle}
              />
              <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-primary-600 relative transition-all duration-300">
                <span
                  className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    is2FAEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                ></span>
              </div>
            </label>
          </div>
        </div>

        {/* Notification */}
        {message && (
          <div
            className={`rounded-lg p-4 flex items-center gap-3 ${
              message.includes("enabled") || message.includes("copied") || message.includes("downloaded")
                ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30"
                : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30"
            }`}
          >
            {message.includes("enabled") || message.includes("copied") || message.includes("downloaded") ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <p className={`text-sm ${
              message.includes("enabled") || message.includes("copied") || message.includes("downloaded")
                ? "text-green-800 dark:text-green-300"
                : "text-red-800 dark:text-red-300"
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* QR Section */}
        {is2FAEnabled && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* QR Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-48 h-48 flex items-center justify-center overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <img
                      src="https://media.istockphoto.com/id/828088276/vector/qr-code-illustration.jpg?s=612x612&w=0&k=20&c=FnA7agr57XpFi081ZT5sEmxhLytMBlK4vzdQxt8A70M="
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <QrCode className="w-4 h-4" />
                    <span className="font-medium">Scan with authenticator app</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Setup Instructions
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <li>Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)</li>
                  <li>Scan the QR code displayed on the left using your app</li>
                  <li>Enter the 6-digit code generated by your app to verify and complete setup</li>
                  <li>Save your recovery codes in a secure location in case you lose access to your device</li>
                </ol>

                <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong className="text-primary-700 dark:text-primary-400">Security Tip:</strong> Keep your recovery codes safe. You'll need them if you lose access to your authenticator device.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Recovery Codes
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Recovery Codes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
