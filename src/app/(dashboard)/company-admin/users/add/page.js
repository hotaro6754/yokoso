"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Shield, UploadCloud, UserPlus, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { usersService } from "@/services/company-admin-services/users.service";
import { userManagementService } from "@/services/userManagementService";

export default function AddUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [systemRoles, setSystemRoles] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    systemRole: "",
    companyRole: "No specific role",
    isActive: true,
  });

  const fetchSystemRoles = async () => {
    try {
      const response = await userManagementService.getSystemRoles();
      
      if (response.success) {
        // Filter out MASTER_ADMIN and SUPER_ADMIN roles
        const filteredRoles = response.data?.filter(role => 
          role.name !== 'MASTER_ADMIN' && 
          role.name !== 'SUPER_ADMIN'
        ) || [];
        setSystemRoles(filteredRoles);
      }
    } catch (error) {
      console.error("Error fetching system roles:", error);
    }
  };

  useEffect(() => {
    fetchSystemRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.systemRole) {
      toast.error("System role is required");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API
      const apiData = {
        email: formData.email.trim(),
        systemRole: formData.systemRole.toUpperCase(), // Convert to uppercase for backend
        isActive: formData.isActive,
      };

      // Call API to create user
      await usersService.createUser(apiData);

      toast.success("User created successfully!");

      // Redirect after success
      router.push("/company-admin/users");
    } catch (error) {
      console.error("Error creating user:", error);

      // Handle specific error cases
      if (error.message.includes("already exists")) {
        toast.error("Email already exists");
      } else if (error.message.includes("invalid")) {
        toast.error("Invalid data provided");
      } else {
        toast.error(error.message || "Failed to create user");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-transparent p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Header */}
        <div className="space-y-4">
          <nav className="text-sm text-gray-500 dark:text-[#BBBDEC]">
            <Link
              href="/company-admin/dashboard"
              className="hover:text-primary-600 dark:hover:text-[#E0E2FE]"
            >
              Company Admin
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/company-admin/users"
              className="hover:text-primary-600 dark:hover:text-[#E0E2FE]"
            >
              User Management
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-[#E0E2FE] font-medium">New User</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm dark:bg-[#BBBDEC] dark:text-[#111827]">
              <UserPlus size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E0E2FE]">
                Create New User
              </h1>
              <p className="text-gray-500 dark:text-[#BBBDEC] text-sm mt-1">
                Create a new user, assign role access, and set reporting manager
                (if applicable).
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Left Column: Credentials & Access */}
          <div className="bg-white dark:bg-[rgba(187,189,236,0.06)] rounded-xl shadow-sm border border-gray-200 dark:border-[rgba(187,189,236,0.2)] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-primary-600 dark:text-[#E0E2FE]" size={24} />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#E0E2FE]">
                  Credentials & Access
                </h3>
                <p className="text-sm text-gray-500 dark:text-[#BBBDEC]">
                  Define login details and system-level permissions.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#E0E2FE] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@company.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-[rgba(187,189,236,0.25)] bg-gray-50/50 dark:bg-[rgba(187,189,236,0.06)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm text-gray-900 dark:text-[#E0E2FE]"
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-[#BBBDEC] mt-1 flex items-center gap-1">
                  <span className="inline-block w-3 h-3 text-center rounded-full border border-gray-400 text-[9px] leading-tight">
                    i
                  </span>
                  This will be used as the username for login.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#E0E2FE] mb-1.5">
                  System Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </span>
                  <select
                    name="systemRole"
                    value={formData.systemRole}
                    required
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-[rgba(187,189,236,0.25)] bg-gray-50/50 dark:bg-[rgba(187,189,236,0.06)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none text-gray-900 dark:text-[#E0E2FE]"
                  >
                    <option value="">Select Access Level</option>
                    {systemRoles.map((role) => (
                      <option key={role.id || role.name} value={role.name}>
                        {role.displayName || role.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Account Toggle */}
              <div className="bg-green-50/50 dark:bg-[rgba(187,189,236,0.08)] rounded-lg border border-green-100 dark:border-[rgba(187,189,236,0.2)] p-4">
                <div className="flex items-start gap-3">
                  <label className="relative inline-flex items-center cursor-pointer mt-0.5">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                  </label>
                  <div>
                    <h4 className="text-sm font-bold text-green-800 dark:text-[#E0E2FE]">
                      Active Account
                    </h4>
                    <p className="text-xs text-green-700 dark:text-[#BBBDEC] mt-0.5 leading-tight">
                      User is permitted to log in and access the system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 dark:bg-[rgba(187,189,236,0.08)] border border-primary-100 dark:border-[rgba(187,189,236,0.2)] rounded-lg p-4 flex gap-3">
                <div className="text-primary-600 dark:text-[#E0E2FE] mt-0.5">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-800 dark:text-[#E0E2FE]">
                    Secure Access Setup
                  </h4>
                  <p className="text-xs text-primary-600 dark:text-[#BBBDEC] mt-1 leading-relaxed">
                    A temporary password will be automatically generated and
                    emailed to the user. They will be required to set a new
                    password upon their first login.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[rgba(187,189,236,0.2)] mt-8">
                <Link href="/company-admin/users">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors dark:border-[rgba(187,189,236,0.25)] dark:text-[#E0E2FE] dark:hover:bg-[rgba(187,189,236,0.08)]"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200/50 dark:bg-[#BBBDEC] dark:text-[#111827] dark:hover:bg-[#E0E2FE]"
                >
                  {isLoading ? (
                    "Creating..."
                  ) : (
                    <span className="flex items-center gap-2">
                      <UploadCloud size={18} />
                      Create
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
