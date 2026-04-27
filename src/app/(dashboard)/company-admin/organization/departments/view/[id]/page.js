"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Users, Crown, Mail, Phone, Calendar, GitFork } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "sonner";
import HRMSLoader from "@/components/common/HRMSLoader";

export default function DepartmentViewPage() {
    const { id } = useParams();
    const router = useRouter();
    const [department, setDepartment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                setLoading(true);
                const response = await organizationService.getDepartmentById(id);
                const data = response.success ? response.data : response.data?.department || response.data;
                setDepartment(data);
            } catch (error) {
                console.error("Error loading department:", error);
                toast.error("Failed to load department details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDepartment();
    }, [id]);

    if (loading) {
        return <HRMSLoader />;
    }

    if (!department) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
                <Building2 size={48} className="mb-4 text-gray-300" />
                <p className="text-lg font-medium">Department not found</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-brand-600 hover:text-brand-700 font-medium"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            <Breadcrumb
                items={[
                    { label: "Company Admin", href: "/company-admin" },
                    { label: "Organization", href: "/company-admin/company-orgranization" },
                    { label: "View Department", href: `/company-admin/organization/departments/view/${id}` },
                ]}
                rightContent={
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                }
            />

            <div className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 mb-6">
                    <div className="bg-gradient-to-r from-brand-500/10 to-transparent px-8 py-8 dark:from-brand-500/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800 flex items-center justify-center">
                                    <Building2 className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {department.name}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Code: {department.code || "N/A"}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${department.status === "ACTIVE"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                            }`}>
                                            {department.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-center px-6 py-2 border-l border-gray-200 dark:border-gray-700">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {department.employeeCount || 0}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Employees
                                    </div>
                                </div>
                                <div className="text-center px-6 py-2 border-l border-gray-200 dark:border-gray-700">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {department.designationCount || 0}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Designations
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Overview */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Crown size={20} className="text-brand-500" /> Department Overview
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="mb-1 text-xs font-medium text-gray-500 uppercase">Head of Department</div>
                                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                                            {department.headOfDepartment ? department.headOfDepartment.charAt(0) : "?"}
                                        </div>
                                        {department.headOfDepartment || "Not Assigned"}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="mb-1 text-xs font-medium text-gray-500 uppercase">Parent Department</div>
                                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <GitFork size={16} className="text-gray-400" />
                                        {department.parentDepartment?.name || "None (Top Level)"}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="mb-1 text-xs font-medium text-gray-500 uppercase">Contact Email</div>
                                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        {department.email || "N/A"}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="mb-1 text-xs font-medium text-gray-500 uppercase">Phone</div>
                                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <Phone size={16} className="text-gray-400" />
                                        {department.phone || "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Users size={20} className="text-brand-500" /> Employees
                            </h3>
                            <p className="text-gray-500 text-sm italic">Employee list will be displayed here.</p>
                        </div>
                    </div>

                    {/* Sidebar / Meta */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-xs">
                                Timestamps
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-full bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Created On</div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {department.createdAt ? new Date(department.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-full bg-orange-50 p-1.5 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Last Updated</div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {department.updatedAt ? new Date(department.updatedAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
