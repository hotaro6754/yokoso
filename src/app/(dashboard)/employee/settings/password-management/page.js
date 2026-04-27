"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Lock, Key, Eye, EyeOff, CheckCircle2, AlertCircle, Shield } from "lucide-react";

export default function PasswordManagementPage() {
  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Settings", href: "/employee/settings" },
    { label: "Password Management", href: "/employee/settings/password-management" },
  ];

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { label: "Weak", color: "bg-red-500" },
      { label: "Fair", color: "bg-yellow-500" },
      { label: "Good", color: "bg-blue-500" },
      { label: "Strong", color: "bg-green-500" },
    ];

    return { strength, ...levels[Math.min(strength - 1, 3)] };
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);

  const handleSave = () => {
    // Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }
    if (passwords.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }

    // Simulate saving
    setMessage({ type: "success", text: "Password has been updated successfully!" });
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update your password to keep your account secure
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm space-y-6">
          <PasswordField
            label="Current Password"
            icon={<Lock className="w-4 h-4" />}
            value={passwords.currentPassword}
            show={showPassword.currentPassword}
            onChange={(v) => handleChange("currentPassword", v)}
            onToggle={() => toggleShowPassword("currentPassword")}
          />
          <PasswordField
            label="New Password"
            icon={<Key className="w-4 h-4" />}
            value={passwords.newPassword}
            show={showPassword.newPassword}
            onChange={(v) => handleChange("newPassword", v)}
            onToggle={() => toggleShowPassword("newPassword")}
          />

          {/* Password Strength Indicator */}
          {passwords.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Password Strength</span>
                <span className={`font-medium ${
                  passwordStrength.strength <= 1 ? "text-red-600 dark:text-red-400" :
                  passwordStrength.strength === 2 ? "text-yellow-600 dark:text-yellow-400" :
                  passwordStrength.strength === 3 ? "text-blue-600 dark:text-blue-400" :
                  "text-green-600 dark:text-green-400"
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                ></div>
              </div>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
                <li className={passwords.newPassword.length >= 8 ? "text-green-600 dark:text-green-400" : ""}>
                  {passwords.newPassword.length >= 8 ? "✓" : "•"} At least 8 characters
                </li>
                <li className={/[a-z]/.test(passwords.newPassword) && /[A-Z]/.test(passwords.newPassword) ? "text-green-600 dark:text-green-400" : ""}>
                  {/[a-z]/.test(passwords.newPassword) && /[A-Z]/.test(passwords.newPassword) ? "✓" : "•"} Mix of uppercase and lowercase
                </li>
                <li className={/\d/.test(passwords.newPassword) ? "text-green-600 dark:text-green-400" : ""}>
                  {/\d/.test(passwords.newPassword) ? "✓" : "•"} At least one number
                </li>
                <li className={/[^a-zA-Z\d]/.test(passwords.newPassword) ? "text-green-600 dark:text-green-400" : ""}>
                  {/[^a-zA-Z\d]/.test(passwords.newPassword) ? "✓" : "•"} At least one special character
                </li>
              </ul>
            </div>
          )}

          <PasswordField
            label="Confirm New Password"
            icon={<Key className="w-4 h-4" />}
            value={passwords.confirmPassword}
            show={showPassword.confirmPassword}
            onChange={(v) => handleChange("confirmPassword", v)}
            onToggle={() => toggleShowPassword("confirmPassword")}
          />

          {/* Match Indicator */}
          {passwords.confirmPassword && passwords.newPassword && (
            <div className={`flex items-center gap-2 text-sm ${
              passwords.newPassword === passwords.confirmPassword
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}>
              {passwords.newPassword === passwords.confirmPassword ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>
                {passwords.newPassword === passwords.confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </span>
            </div>
          )}

          {/* Security Tips */}
          <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <strong className="text-primary-700 dark:text-primary-400">Security Tips:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Use a unique password that you don't use elsewhere</li>
                  <li>Never share your password with anyone</li>
                  <li>Consider using a password manager</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`rounded-lg p-4 flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30"
                : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30"
            }`}>
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                message.type === "success"
                  ? "text-green-800 dark:text-green-300"
                  : "text-red-800 dark:text-red-300"
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-colors font-medium"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label, icon, value, onChange, show, onToggle }) {
  return (
    <div className="flex flex-col">
      <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {icon}
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          onClick={onToggle}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
