"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Loader2, Search, UserPlus, User } from "lucide-react";
import employeeService from "@/services/hr-services/employeeService";
import { organizationService } from "@/services/hr-services/organization.service";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function OnboardingTab() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    departmentId: "all",
    startDate: "",
    endDate: "",
    search: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeeRes, deptRes] = await Promise.allSettled([
          employeeService.getAllEmployees({ limit: 100, status: "ACTIVE" }),
          organizationService.getAllDepartments({ limit: 100 }),
        ]);

        const employeeList = employeeRes.status === "fulfilled"
          ? employeeRes.value?.data?.employees || employeeRes.value?.data || employeeRes.value || []
          : [];
        const deptList = deptRes.status === "fulfilled"
          ? deptRes.value?.data?.departments || deptRes.value?.data || deptRes.value || []
          : [];

        setEmployees(Array.isArray(employeeList) ? employeeList : []);
        setDepartments(Array.isArray(deptList) ? deptList : []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const name = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
      const department = typeof employee.department === "string"
        ? employee.department
        : employee.department?.name || "";
      const jobTitle = employee.jobTitle || employee.designation?.name || employee.role || "";
      const joiningDate = employee.joiningDate || employee.dateOfJoining || employee.startDate || "";

      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matches =
          name.toLowerCase().includes(query) ||
          employee.employeeId?.toLowerCase().includes(query) ||
          jobTitle.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filters.departmentId !== "all") {
        const deptMatch = employee.department?.id || employee.departmentId || "";
        if (deptMatch?.toString() !== filters.departmentId) return false;
      }

      if (filters.startDate || filters.endDate) {
        const dateOnly = joiningDate ? new Date(joiningDate).toISOString().split("T")[0] : "";
        if (!dateOnly) return false;
        if (filters.startDate && dateOnly < filters.startDate) return false;
        if (filters.endDate && dateOnly > filters.endDate) return false;
      }

      return true;
    });
  }, [employees, filters]);

  const getProgress = (employee) => {
    const value =
      employee.onboardingProgress ??
      employee.onboarding?.progress ??
      employee.onboardingStatus?.percent ??
      employee.onboardingCompletion ??
      0;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.min(Math.max(numeric, 0), 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Filters</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Department
            </label>
            <select
              value={filters.departmentId}
              onChange={(e) => setFilters((prev) => ({ ...prev, departmentId: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
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
                placeholder="Name, ID, role"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Onboarding Employees</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track joining progress from offer acceptance to Day 1.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {filteredEmployees.length} records
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-16 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No onboarding employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold">Job Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Department</th>
                  <th className="px-4 py-3 text-left font-semibold">Joining Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Onboarding Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.map((employee) => {
                  const name = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
                  const department = typeof employee.department === "string"
                    ? employee.department
                    : employee.department?.name || "-";
                  const jobTitle = employee.jobTitle || employee.designation?.name || employee.role || "-";
                  const joiningDate = employee.joiningDate || employee.dateOfJoining || employee.startDate;
                  const progress = getProgress(employee);
                  const employeeId = employee.id || employee.employeeId || employee.publicId;
                  const hrName =
                    employee.hrOwner?.name ||
                    `${employee.hrOwner?.firstName || ""} ${employee.hrOwner?.lastName || ""}`.trim() ||
                    employee.hrName ||
                    "-";

                  return (
                    <tr key={employeeId} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {employee.profileImage ? (
                            <img
                              src={employee.profileImage}
                              alt={name}
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
                            <p className="font-medium text-gray-900 dark:text-white">{name || "Unknown"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {employee.employeeId || employee.publicId || "ID pending"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{jobTitle}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{department}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {joiningDate ? new Date(joiningDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {employeeId ? (
                          <Link
                            href={`/hr/onboarding-exit/onboarding/${employeeId}`}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">Unavailable</span>
                        )}
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
