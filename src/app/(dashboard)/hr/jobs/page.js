"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Plus, Search, Edit, Trash2 } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { jobService } from "@/services/hr-services/job.service";
import { toast } from "sonner";
import ActionDropdown from "@/app/(dashboard)/master-admin/components/ActionDropdown";

const approvalBadgeClass = (status) => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
    case "REJECTED":
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  }
};

const jobStatusClass = (status) => {
  switch (status) {
    case "CLOSED":
      return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
    case "HOLD":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
    default:
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300";
  }
};

export default function JobsListPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [confirmState, setConfirmState] = useState({ isOpen: false, job: null });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobs({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
        approvalStatus: approvalFilter,
        jobStatus: statusFilter,
      });

      const data = response.success ? response.data || [] : response.data?.jobs || response.data || [];
      const paginationInfo = response.pagination || response.data?.pagination || {};

      setJobs(Array.isArray(data) ? data : []);
      // Backends sometimes return `total` instead of `totalItems`
      setTotalItems(paginationInfo.totalItems || paginationInfo.total || data.length || 0);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error(error.message || "Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, approvalFilter, statusFilter, pagination.pageIndex, pagination.pageSize]);

  const handleDelete = async () => {
    if (!confirmState.job?.id) return;
    try {
      await jobService.deleteJob(confirmState.job.id);
      toast.success("Job deleted successfully");
      setConfirmState({ isOpen: false, job: null });
      fetchJobs();
    } catch (error) {
      toast.error(error.message || "Failed to delete job");
    }
  };

  const summary = useMemo(() => {
    return {
      pending: jobs.filter((job) => job.approvalStatus === "PENDING").length,
      approved: jobs.filter((job) => job.approvalStatus === "APPROVED").length,
      rejected: jobs.filter((job) => job.approvalStatus === "REJECTED").length,
      open: jobs.filter((job) => job.jobStatus === "OPEN").length,
    };
  }, [jobs]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[{ label: "HR", href: "/hr" }, { label: "Jobs", href: "/hr/jobs" }]}
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Job Listings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage open roles, track approvals, and oversee recruitment status.
            </p>
          </div>
          <div>
            <Link
              href="/hr/jobs/add"
              className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
            >
              <Plus size={18} /> Add Job
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-sm border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Pending: <span className="font-semibold text-amber-600">{summary.pending}</span>
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Approved: <span className="font-semibold text-emerald-600">{summary.approved}</span>
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Rejected: <span className="font-semibold text-rose-600">{summary.rejected}</span>
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Open Roles: <span className="font-semibold text-sky-600">{summary.open}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <select
            value={approvalFilter}
            onChange={(e) => {
              setApprovalFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-10 w-full sm:w-auto rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">All Approval</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-10 w-full sm:w-auto rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="HOLD">Hold</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/70 text-xs uppercase tracking-wide text-gray-700 dark:bg-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Department</th>
                <th className="px-4 py-3 text-left font-medium">Location</th>
                <th className="px-4 py-3 text-left font-medium">Openings</th>
                <th className="px-4 py-3 text-left font-medium">Approval</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    Loading jobs...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {job.designation?.name || "No designation"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {job.department?.name || "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{job.location || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{job.openings || 1}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${approvalBadgeClass(job.approvalStatus)}`}>
                        {job.approvalStatus || "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${jobStatusClass(job.jobStatus)}`}>
                        {job.jobStatus || "OPEN"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionDropdown
                        customActions={[
                          {
                            label: "Edit",
                            icon: Edit,
                            href: `/hr/jobs/edit/${job.id}`,
                            className: "text-gray-700 dark:text-gray-200",
                            iconClassName: "text-emerald-600 dark:text-emerald-400",
                          },
                          {
                            label: "Delete",
                            icon: Trash2,
                            onClick: () => setConfirmState({ isOpen: true, job }),
                            className: "text-red-700 dark:text-red-300",
                            iconClassName: "text-red-600 dark:text-red-400",
                            hoverClassName: "hover:bg-red-50 dark:hover:bg-red-900/20",
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalItems={totalItems}
          itemsPerPage={pagination.pageSize}
          showWhenEmpty={true}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))}
          onItemsPerPageChange={(size) => setPagination({ pageIndex: 0, pageSize: size })}
        />
      </div>

      <ConfirmationDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, job: null })}
        onConfirm={handleDelete}
        title="Delete job?"
        message={`Are you sure you want to delete "${confirmState.job?.title || "this job"}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
      />
    </div>
  );
}
