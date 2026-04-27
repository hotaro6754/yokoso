// src/app/(dashboard)/hr/organization-management/departments/add/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "sonner";

export default function DepartmentAddPage() {
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isItAdminView = pathname.startsWith("/it-admin");
  const baseOrgPath = isItAdminView ? "/it-admin/organization-management" : "/hr/organization-management";
  const baseLabel = isItAdminView ? "IT Admin" : "HR";
  const baseLabelHref = isItAdminView ? "/it-admin/dashboard" : "/hr";
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "ACTIVE",
    parentId: "",
  });

  useEffect(() => {
    if (isItAdminView) {
      router.replace(baseOrgPath);
    }
  }, [isItAdminView, router, baseOrgPath]);

  useEffect(() => {
    if (isItAdminView) {
      setLoading(false);
      return;
    }

    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const listResponse = await organizationService.getAllDepartments({ page: 1, limit: 100 });
        const list = listResponse.success
          ? listResponse.data
          : listResponse.data?.departments || listResponse.data || [];
        setDepartments(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error loading departments:", error);
        toast.error("Failed to load department list");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [isItAdminView]);

  if (isItAdminView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        code: formData.code || null,
        status: formData.status || "ACTIVE",
        parentId: formData.parentId ? Number(formData.parentId) : null,
      };

      const response = await organizationService.createDepartment(payload);
      const created = response.success ? response.data : response.data?.department || response.data;
      const createdId = created?.id;

      toast.success("Department created successfully");
      if (createdId) {
        router.push(`${baseOrgPath}/departments/view/${createdId}`);
      } else {
        router.push(baseOrgPath);
      }
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error(error.message || "Failed to create department");
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 pt-6">
      <Breadcrumb
        items={[
          { label: baseLabel, href: baseLabelHref },
          { label: "Organization Management", href: baseOrgPath },
          { label: "Add Department", href: `${baseOrgPath}/departments/add` },
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
              <Save size={18} /> Create Department
            </button>
          </div>
        }
      />

      <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-500/20">
              <Building2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Department Information
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add a new department and hierarchy.
              </p>
            </div>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" required>
                  Department Name
                </Label>
                <InputField
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" required>Code</Label>
                <InputField
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="parentId">Parent Department</Label>
                <select
                  id="parentId"
                  value={formData.parentId}
                  onChange={(e) => handleChange("parentId", e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">No Parent</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
