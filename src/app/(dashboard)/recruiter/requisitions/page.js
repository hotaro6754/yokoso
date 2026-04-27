"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { FileText, Search, Filter, Briefcase, MapPin, DollarSign, Users, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import ActionDropdown from "../components/ActionDropdown";

export default function JobRequisitionsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });
  const [filters, setFilters] = useState({
    jobStatus: "OPEN",
    departmentId: "",
    search: "",
    page: 1,
    limit: 50
  });

  useEffect(() => {
    fetchApprovedJobs();
  }, [filters]);

  const fetchApprovedJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit
      };

      // Only include filters if they have values
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.departmentId) {
        params.departmentId = filters.departmentId;
      }
      if (filters.jobStatus && filters.jobStatus !== 'all') {
        params.jobStatus = filters.jobStatus;
      }

      const response = await recruiterService.getApprovedJobs(params);
      
      if (response.success) {
        // Handle nested data structure: response.data.data or response.data
        setJobs(response.data?.data || response.data || []);
        setPagination(response.data?.pagination || response.pagination || pagination);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching approved jobs:", error);
      toast.error(error.message || "Failed to load approved jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const getJobStatusBadge = (status) => {
    const statusMap = {
      OPEN: { label: "Open", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400" },
      CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
    };
    const statusInfo = statusMap[status] || statusMap.OPEN;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getApprovalStatusBadge = (status) => {
    const statusMap = {
      APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400" },
      PENDING: { label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400" },
      REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400" },
    };
    const statusInfo = statusMap[status] || statusMap.APPROVED;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Job Requisitions", href: "/recruiter/requisitions" },
        ]}
      />

      {/* Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Approved Job Requisitions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and manage jobs approved by department heads
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title, department, or designation..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <select
            value={filters.jobStatus}
            onChange={(e) => setFilters({ ...filters, jobStatus: e.target.value, page: 1 })}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Job Status</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={filters.departmentId}
            onChange={(e) => setFilters({ ...filters, departmentId: e.target.value, page: 1 })}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Departments</option>
            {/* Department options will be populated dynamically if needed */}
          </select>
        </div>
      </div>

      {/* Approved Jobs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">No approved jobs found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Openings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Salary Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Job Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Approved Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {job.employmentType || 'Full-time'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {typeof job.department === 'string' 
                        ? job.department 
                        : typeof job.department === 'object' && job.department?.name 
                        ? job.department.name 
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {typeof job.designation === 'string' 
                        ? job.designation 
                        : typeof job.designation === 'object' && job.designation?.name 
                        ? job.designation.name 
                        : 'Not specified'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {job.location || 'Not specified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.openings || 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {job.salaryRange || 'Not specified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getJobStatusBadge(job.jobStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {job.approvedAt 
                            ? new Date(job.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : job.postedDate
                            ? new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/recruiter/requisitions/${job.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && jobs.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            </span> to <span className="font-semibold text-gray-900 dark:text-white">
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
            </span> of <span className="font-semibold text-gray-900 dark:text-white">
              {pagination.totalItems}
            </span> jobs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page >= pagination.totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
