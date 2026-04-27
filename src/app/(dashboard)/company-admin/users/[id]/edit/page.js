"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Shield, Lock, User, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import { userManagementService } from "@/services/userManagementService";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [systemRoles, setSystemRoles] = useState([]);
    const [formData, setFormData] = useState({
        email: "",
        systemRole: "",
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
            toast.error("Failed to load roles");
        }
    };

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const response = await userManagementService.getUserById(params.id);
            if (response.success) {
                const user = response.data;
                setFormData({
                    email: user.email,
                    systemRole: user.systemRole,
                    isActive: user.isActive
                });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            toast.error("Failed to load user details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemRoles();
        if (params.id) {
            fetchUserData();
        }
    }, [params.id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.systemRole) {
            toast.error("System role is required");
            return;
        }

        setIsSaving(true);

        try {
            // Prepare data for API (exclude email usually, but checking backend expectations)
            const apiData = {
                systemRole: formData.systemRole,
                isActive: formData.isActive,
            };

            await userManagementService.updateUser(params.id, apiData);

            toast.success("User updated successfully!");
            router.push(`/company-admin/users/${params.id}`);
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error(error.message || "Failed to update user");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50/50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Breadcrumb & Header */}
                <div className="space-y-4">
                    <Breadcrumb
                        items={[
                            { label: 'Company Admin', href: '/company-admin/dashboard' },
                            { label: 'Users', href: '/company-admin/users' },
                            { label: formData.email || 'User Details', href: `/company-admin/users/${params.id}` },
                            { label: 'Edit', href: '#' }
                        ]}
                    />

                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <User size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Edit User
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Update user role access and status.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                    {/* Left Column: Credentials & Access */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-primary-600" size={24} />
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Credentials & Access
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Manage login details and system-level permissions.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail size={16} />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-500 focus:outline-none cursor-not-allowed text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Email address cannot be changed.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
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
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none"
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
                            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800 p-4">
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
                                        <h4 className="text-sm font-bold text-green-800 dark:text-green-400">
                                            Active Account
                                        </h4>
                                        <p className="text-xs text-green-700 dark:text-green-500 mt-0.5 leading-tight">
                                            User is permitted to log in and access the system.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-8">
                                <Link href={`/company-admin/users/${params.id}`}>
                                    <button
                                        type="button"
                                        className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200/50"
                                >
                                    {isSaving ? (
                                        "Saving..."
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save size={18} />
                                            Save Changes
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
