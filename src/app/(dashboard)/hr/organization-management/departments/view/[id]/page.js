// src/app/(dashboard)/hr/organization-management/departments/view/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Building2,
  Users,
  MapPin,
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function DepartmentViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isManagerView = pathname.startsWith("/manager");
  const isRecruiterView = pathname.startsWith("/recruiter");
  const isDeptHeadView = pathname.startsWith("/dept-head");
  const isItAdminView = pathname.startsWith("/it-admin");
  const baseOrgPath = isManagerView
    ? "/manager/organization-management"
    : isRecruiterView
      ? "/recruiter/organization-management"
      : isItAdminView
        ? "/it-admin/organization-management"
      : isDeptHeadView
        ? "/dept-head/organization-management"
        : "/hr/organization-management";
  const baseLabel = isManagerView ? "Manager" : isRecruiterView ? "Recruiter" : isItAdminView ? "IT Admin" : isDeptHeadView ? "Dept Head" : "HR";
  const baseLabelHref = isManagerView ? "/manager/dashboard" : isRecruiterView ? "/recruiter/dashboard" : isItAdminView ? "/it-admin/dashboard" : isDeptHeadView ? "/dept-head/dashboard" : "/hr";
  const rawUserRole = user?.systemRole || user?.role || "";
  const userRole = String(rawUserRole).toUpperCase().replace(/[\s-]+/g, "_");
  const isViewOnly = isManagerView
    || isRecruiterView
    || isDeptHeadView
    || isItAdminView
    || ["L_AND_D_MANAGER", "PAYROLL_ADMIN", "FINANCE_ADMIN", "MANAGER", "RECRUITER", "IT_ADMIN", "DEPT_HEAD", "DEPARTMENT_HEAD"].includes(userRole);
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
        console.error("Error fetching department:", error);
        toast.error("Failed to load department details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDepartment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Department not found
        </h2>
        <button
          onClick={() => router.push(baseOrgPath)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition"
        >
          <ArrowLeft size={18} /> Back to Organization
        </button>
      </div>
    );
  }

  const statusTone =
    department.status === "ACTIVE"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 pt-4">
      <Breadcrumb
        items={[
          { label: baseLabel, href: baseLabelHref },
          { label: "Organization Management", href: baseOrgPath },
          { label: "Department Details", href: `${baseOrgPath}/departments/view/${id}` },
        ]}
        rightContent={
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push(baseOrgPath)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <ArrowLeft size={18} /> Back
            </button>
            {!isManagerView && !isViewOnly && (
              <button
                onClick={() => router.push(`${baseOrgPath}/departments/edit/${id}`)}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm"
              >
                <Edit size={18} /> Edit Department
              </button>
            )}
          </div>
        }
      />

      <div className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{department.name}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
                      {department.status || "INACTIVE"}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">Code: {department.code || "-"}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/15 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-white/70">Employees</p>
                  <p className="text-sm font-semibold text-white">
                    {department.employeeCount ?? department.totalEmployees ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-white/70">Designations</p>
                  <p className="text-sm font-semibold text-white">
                    {department.designationCount ?? department.totalDesignations ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 dark:border-gray-700 dark:bg-gray-900/20">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Department Overview
              </h3>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">

                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-brand-500" />
                  <span>Manager: {department.manager?.name || department.manager || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  <span>Parent Department: {department.parent?.name || "-"}</span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
