"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Loader2, LogOut, Search, User } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function SeparationDashboardTab() {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    search: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resignationRes] = await Promise.allSettled([
          onboardingExitService.getResignations({}),
        ]);
        const resignationList = resignationRes.status === "fulfilled"
          ? resignationRes.value?.data || resignationRes.value || []
          : [];
        setResignations(Array.isArray(resignationList) ? resignationList : []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const normalizeStatus = (status) => {
    const value = (status || "").toString().toLowerCase();
    if (["completed", "exit_completed"].includes(value)) return "completed";
    if (["clearance_pending", "clearance"].includes(value)) return "clearance_pending";
    if (["notice_period", "pending", "initiated", "approved"].includes(value)) return "notice_period";
    return value || "notice_period";
  };

  const getStatusBadge = (status) => {
    const config = {
      notice_period: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      clearance_pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    const className = config[status] || config.notice_period;
    const label = status
      .replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{label}</span>;
  };

  const filteredResignations = useMemo(() => {
    return resignations.filter((resignation) => {
      const employee = resignation.employee || {};
      const employeeName = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
      const lastWorkingDate = resignation.lastWorkingDate || resignation.lastWorkingDay;

      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (
          !employeeName.toLowerCase().includes(query) &&
          !employee.employeeId?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (filters.startDate || filters.endDate) {
        const dateOnly = lastWorkingDate ? new Date(lastWorkingDate).toISOString().split("T")[0] : "";
        if (!dateOnly) return false;
        if (filters.startDate && dateOnly < filters.startDate) return false;
        if (filters.endDate && dateOnly > filters.endDate) return false;
      }

      return true;
    });
  }, [resignations, filters]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Filters</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Start Date
            </label>
            <DatePickerField
              value={filters.startDate}
              onChange={(value) => setFilters((prev) => ({ ...prev, startDate: value }))}
              placeholder="Start date"
              className="w-full px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              End Date
            </label>
            <DatePickerField
              value={filters.endDate}
              onChange={(value) => setFilters((prev) => ({ ...prev, endDate: value }))}
              placeholder="End date"
              className="w-full px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Name or ID"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Separation Dashboard</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track exits, clearance, and approvals through completion.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {filteredResignations.length} records
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : filteredResignations.length === 0 ? (
          <div className="py-16 text-center">
            <LogOut className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No separation records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold">Department</th>
                  <th className="px-4 py-3 text-left font-semibold">Resignation Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Working Day</th>
                  <th className="px-4 py-3 text-left font-semibold">Exit Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredResignations.map((resignation) => {
                  const employee = resignation.employee || {};
                  const employeeName = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
                  const department = typeof employee.department === "string"
                    ? employee.department
                    : employee.department?.name || "-";
                  const statusValue = normalizeStatus(resignation.exitProcess?.status || resignation.status);
                  return (
                    <tr key={resignation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {employee.profileImage ? (
                            <img
                              src={employee.profileImage}
                              alt={employeeName}
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ${
                              employee.profileImage ? 'hidden' : 'flex'
                            }`}
                            style={{ display: employee.profileImage ? 'none' : 'flex' }}
                          >
                            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{employeeName || "Unknown"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {employee.employeeId || employee.publicId || "ID pending"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{department}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {resignation.resignationDate
                          ? new Date(resignation.resignationDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {resignation.lastWorkingDate || resignation.lastWorkingDay
                          ? new Date(resignation.lastWorkingDate || resignation.lastWorkingDay).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(statusValue)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/hr/onboarding-exit/separation/${resignation.id}`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
