// src/app/(dashboard)/hr/organization-management/designations/edit/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Briefcase } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "sonner";

export default function DesignationEditPage() {
  const { id } = useParams();
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
    level: "",
    departmentId: "",
    orgLevel: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (isItAdminView && id) {
      router.replace(`${baseOrgPath}/designations/view/${id}`);
    }
  }, [isItAdminView, router, baseOrgPath, id]);

  useEffect(() => {
    if (isItAdminView || !id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [desigResponse, deptResponse] = await Promise.all([
          organizationService.getDesignationById(id),
          organizationService.getAllDepartments({ page: 1, limit: 100 }),
        ]);

        const desig = desigResponse.success
          ? desigResponse.data
          : desigResponse.data?.designation || desigResponse.data;
        const deptList = deptResponse.success
          ? deptResponse.data
          : deptResponse.data?.departments || deptResponse.data || [];

        setFormData({
          name: desig?.name || "",
          code: desig?.code || "",
          level: desig?.level || "",
          departmentId: desig?.department?.id ? String(desig.department.id) : "",
          orgLevel: desig?.orgLevel?.toString() || "",
          status: desig?.status || "ACTIVE",
        });

        setDepartments(Array.isArray(deptList) ? deptList : []);
      } catch (error) {
        console.error("Error loading designation:", error);
        toast.error("Failed to load designation details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isItAdminView]);

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
        level: formData.level || null,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        orgLevel: formData.orgLevel ? Number(formData.orgLevel) : null,
        status: formData.status || "ACTIVE",
      };

      await organizationService.updateDesignation(id, payload);
      toast.success("Designation updated successfully");
      router.push(`${baseOrgPath}/designations/view/${id}`);
    } catch (error) {
      console.error("Error updating designation:", error);
      toast.error(error.message || "Failed to update designation");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <Breadcrumb
        items={[
          { label: baseLabel, href: baseLabelHref },
          { label: "Organization Management", href: baseOrgPath },
          { label: "Edit Designation", href: `${baseOrgPath}/designations/edit/${id}` },
        ]}
        rightContent={
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <ArrowLeft size={18} /> Cancel
            </button>
          </div>
        }
      />

      <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-500/20">
              <Briefcase className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Designation Information
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update designation details and mapping.
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <InputField
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Select Level</option>
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                  <option value="L4">L4</option>
                  <option value="L5">L5</option>
                  <option value="L6">L6</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgLevel">Org Level</Label>
                <InputField
                  id="orgLevel"
                  type="number"
                  value={formData.orgLevel}
                  onChange={(e) => handleChange("orgLevel", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId" required>
                  Department
                </Label>
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
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm disabled:opacity-70"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
