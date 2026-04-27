"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Loader2, MessageSquareWarning, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import projectService from "@/services/project.service";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [remarks, setRemarks] = useState({});

  const canApprove = useMemo(() => {
    const role = user?.role || user?.systemRole || "";
    return ["BU_HEAD", "PRACTICE_HEAD", "DEPT_HEAD", "COMPANY_ADMIN", "COMPANY_OWNER", "SUPER_ADMIN", "MASTER_ADMIN"].includes(role);
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getPendingApprovals();
      setProjects(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAction = async (projectId, action) => {
    try {
      setActioningId(projectId);
      const payload = { remarks: remarks[projectId] || "" };
      if (action === "approve") {
        await projectService.approveProject(projectId, payload);
      } else if (action === "reject") {
        await projectService.rejectProject(projectId, payload);
      } else {
        await projectService.requestChanges(projectId, payload);
      }
      toast.success(`Project ${action === "request" ? "sent back for changes" : `${action}d`} successfully`);
      await loadProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval action failed");
    } finally {
      setActioningId(null);
    }
  };

  if (!canApprove && !loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">Approval actions are only available to BU Head / Dept Head / Practice Head level users.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-8 dark:bg-transparent">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Approvals</h1>
          <Breadcrumb items={[{ label: "Approvals", path: "/approvals" }]} />
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-sm border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            No projects are waiting for approval right now.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">{project.projectCode}</p>
                    <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{project.projectName}</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{project.clientName}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <Clock3 size={14} />
                    Pending Approval
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <InfoRow label="Business Unit" value={project.businessUnit || "-"} />
                  <InfoRow label="Project Manager" value={project.projectManager ? `${project.projectManager.firstName} ${project.projectManager.lastName}` : "-"} />
                  <InfoRow label="Resource Manager" value={project.resourceManager ? `${project.resourceManager.firstName} ${project.resourceManager.lastName}` : "-"} />
                  <InfoRow label="Allocated Team" value={`${project.assignments?.length || 0} members`} />
                  <InfoRow label="Submitted On" value={project.resourcePlanSubmittedAt ? new Date(project.resourcePlanSubmittedAt).toLocaleString() : "-"} />
                </div>

                <textarea
                  value={remarks[project.publicId] || ""}
                  onChange={(event) => setRemarks((current) => ({ ...current, [project.publicId]: event.target.value }))}
                  rows={3}
                  className="mt-5 w-full rounded-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  placeholder="Approval remarks (optional)"
                />

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleAction(project.publicId, "approve")}
                    disabled={actioningId === project.publicId}
                    className="inline-flex items-center gap-2 rounded-sm bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {actioningId === project.publicId ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(project.publicId, "request")}
                    disabled={actioningId === project.publicId}
                    className="inline-flex items-center gap-2 rounded-sm border border-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60 dark:text-amber-300 dark:hover:bg-amber-950/40"
                  >
                    <MessageSquareWarning size={16} />
                    Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(project.publicId, "reject")}
                    disabled={actioningId === project.publicId}
                    className="inline-flex items-center gap-2 rounded-sm border border-red-500 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <Link
                    href={`/projects/${project.publicId}`}
                    className="inline-flex items-center gap-2 rounded-sm border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-gray-800 dark:text-gray-300"
                  >
                    <ShieldCheck size={16} />
                    Open Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-sm border border-gray-100 px-3 py-2 dark:border-gray-800">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-right text-sm text-gray-700 dark:text-gray-200">{value}</span>
    </div>
  );
}
