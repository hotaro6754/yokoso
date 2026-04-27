"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Award } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import { companyOrganizationService } from "@/services/super-admin-services/companyOrganization.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function DesignationAddPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState([]);

    // Get companyId from user context or localStorage
    const companyId = user?.companyId || user?.company?.id || (typeof window !== 'undefined' ? Number(localStorage.getItem('company_id')) : null);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        departmentId: "",
        level: "",
        grade: "",
        reportingLevel: "",
        minExperience: "",
        maxExperience: "",
        status: "ACTIVE",
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            if (!companyId) return;

            try {
                setLoading(true);
                // Use companyOrganizationService to be consistent with company admin flow
                const listResponse = await companyOrganizationService.getDepartments(companyId);
                const list = listResponse.data || listResponse.departments || listResponse || [];
                setDepartments(Array.isArray(list) ? list : []);
            } catch (error) {
                console.error("Error loading departments:", error);
                toast.error("Failed to load department list");
            } finally {
                setLoading(false);
            }
        };

        if (companyId) {
            fetchDepartments();
        } else if (user) {
            // If user is loaded but no companyId found, stop loading
            setLoading(false);
            toast.error("Could not determine Company ID");
        }
    }, [companyId, user]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!companyId) {
            toast.error("Company ID missing. Try refreshing the page.");
            return;
        }

        if (!formData.departmentId) {
            toast.error("Please select a Department");
            return;
        }

        if (!formData.level) {
            toast.error("Please enter a Level");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                companyId: Number(companyId),
                name: formData.name,
                code: formData.code || "",
                departmentId: Number(formData.departmentId),
                level: formData.level,
                grade: formData.grade || "",
                reportingLevel: formData.reportingLevel ? Number(formData.reportingLevel) : null,
                minExperience: formData.minExperience ? Number(formData.minExperience) : null,
                maxExperience: formData.maxExperience ? Number(formData.maxExperience) : null,
                status: formData.status || "ACTIVE",
            };

            await companyOrganizationService.createDesignation(payload);
            toast.success("Designation created successfully");
            router.push("/company-admin/company-orgranization?tab=designations");
        } catch (error) {
            console.error("Error creating designation:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to create designation";
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!companyId && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Company ID not found</h3>
                    <p className="text-gray-500">Please try refreshing or contact support.</p>
                    <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 pt-6">
            <Breadcrumb
                items={[
                    { label: "Company Admin", href: "/company-admin" },
                    { label: "Organization", href: "/company-admin/company-orgranization" },
                    { label: "Add Designation", href: "/company-admin/organization/designations/add" },
                ]}
                rightContent={
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <ArrowLeft size={18} /> Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm disabled:opacity-70"
                        >
                            <Save size={18} /> Create Designation
                        </button>
                    </div>
                }
            />

            <div className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                        <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-500/20">
                            <Award className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Designation Information
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Add a new designation and its details.
                            </p>
                        </div>
                    </div>

                    <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" required>
                                    Designation Name
                                </Label>
                                <InputField
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">
                                    Code
                                </Label>
                                <InputField
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => handleChange("code", e.target.value)}
                                    placeholder="e.g. SSE"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="departmentId" required>Department</Label>
                                <select
                                    id="departmentId"
                                    value={formData.departmentId}
                                    onChange={(e) => handleChange("departmentId", e.target.value)}
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="level" required>Level</Label>
                                <InputField
                                    id="level"
                                    value={formData.level}
                                    onChange={(e) => handleChange("level", e.target.value)}
                                    placeholder="e.g. L3"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade">Grade</Label>
                                <InputField
                                    id="grade"
                                    value={formData.grade}
                                    onChange={(e) => handleChange("grade", e.target.value)}
                                    placeholder="e.g. A"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reportingLevel">Reporting Level</Label>
                                <InputField
                                    id="reportingLevel"
                                    type="number"
                                    value={formData.reportingLevel}
                                    onChange={(e) => handleChange("reportingLevel", e.target.value)}
                                    placeholder="e.g. 2"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                <div className="space-y-2">
                                    <Label htmlFor="minExperience">Min Exp (Yrs)</Label>
                                    <InputField
                                        id="minExperience"
                                        type="number"
                                        value={formData.minExperience}
                                        onChange={(e) => handleChange("minExperience", e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxExperience">Max Exp (Yrs)</Label>
                                    <InputField
                                        id="maxExperience"
                                        type="number"
                                        value={formData.maxExperience}
                                        onChange={(e) => handleChange("maxExperience", e.target.value)}
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
