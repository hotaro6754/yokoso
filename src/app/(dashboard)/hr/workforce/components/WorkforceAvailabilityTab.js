"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, CheckCircle, XCircle, Loader2, RefreshCw, User } from "lucide-react";
import { workforceService } from "@/services/hr-services/workforce.service";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function WorkforceAvailabilityTab() {
  const [availabilityData, setAvailabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    departmentId: "all",
    workMode: "all",
    shift: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const response = await organizationService.getAllDepartments({ limit: 100 });
      const deptData = response.success ? response.data?.departments || response.data : response.data || [];
      setDepartments(deptData);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const params = {
        date: filters.date,
        departmentId: filters.departmentId !== "all" ? filters.departmentId : "all",
        workMode: filters.workMode !== "all" ? filters.workMode : "all",
      };
      if (filters.shift) {
        params.shift = filters.shift;
      }

      const response = await workforceService.getAvailability(params);
      const data = response.success ? response.data : response;
      setAvailabilityData(data);
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error(error.message || "Failed to fetch workforce availability");
      setAvailabilityData(null);
    } finally {
      setLoading(false);
    }
  };

  const summary = availabilityData?.summary || {};
  const availability = availabilityData?.availability || [];

  const getAvailabilityBadge = (status) => {
    if (status === "AVAILABLE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          Available
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="w-3 h-3" />
        On Leave
      </span>
    );
  };

  const getWorkModeBadge = (workMode) => {
    const config = {
      WFO: {
        label: "WFO",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      WFH: {
        label: "WFH",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      WFA: {
        label: "WFA",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      },
    };

    const modeConfig = config[workMode] || {
      label: workMode,
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${modeConfig.className}`}>
        {modeConfig.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <DatePickerField
              value={filters.date}
              onChange={(value) => setFilters({ ...filters, date: value })}
              placeholder="Select date"
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <select
              value={filters.departmentId}
              onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Mode
            </label>
            <select
              value={filters.workMode}
              onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value="all">All Modes</option>
              <option value="WFO">Work From Office</option>
              <option value="WFH">Work From Home</option>
              <option value="WFA">Work From Anywhere</option>
            </select>
          </div>

          <button
            onClick={fetchAvailability}
            className="px-4 py-2.5 bg-brand-500 text-white rounded-sm hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-500/20 dark:to-brand-500/10 rounded-sm border-2 border-brand-200 dark:border-brand-500/30 shadow-sm hover:shadow-md transition-all p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Total Employees</p>
                <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  {summary.total || 0}
                </p>
              </div>
              <div className="p-2 bg-brand-100 dark:bg-brand-500/20 rounded-sm">
                <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/20 dark:to-emerald-500/10 rounded-sm border-2 border-emerald-200 dark:border-emerald-500/30 shadow-sm hover:shadow-md transition-all p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Available</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.available || 0}
                </p>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-sm">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/20 dark:to-rose-500/10 rounded-sm border-2 border-rose-200 dark:border-rose-500/30 shadow-sm hover:shadow-md transition-all p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">On Leave</p>
                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                  {summary.onLeave || 0}
                </p>
              </div>
              <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-sm">
                <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-accent-50 to-accent-100/50 dark:from-accent-500/20 dark:to-accent-500/10 rounded-sm border-2 border-accent-200 dark:border-accent-500/30 shadow-sm hover:shadow-md transition-all p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Date</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(filters.date).toLocaleDateString()}
                </p>
              </div>
              <div className="p-2 bg-accent-100 dark:bg-accent-500/20 rounded-sm">
                <Calendar className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Availability Table */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : availability.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-brand-500 dark:text-brand-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No availability data found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Work Mode
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Shift
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Availability
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Work Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {availability.map((item) => (
                  <tr
                    key={item.employee?.id || item.employee?.publicId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.employee?.profileImage ? (
                          <img
                            src={item.employee.profileImage}
                            alt={item.employee?.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-10 w-10 rounded-full mr-3 bg-gray-200 dark:bg-gray-600 flex items-center justify-center ${
                            item.employee?.profileImage ? 'hidden' : 'flex'
                          }`}
                          style={{ display: item.employee?.profileImage ? 'none' : 'flex' }}
                        >
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.employee?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.employee?.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.employee?.department || "-"}
                    </td>
                    <td className="px-4 py-3">{getWorkModeBadge(item.workMode)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.shift || "-"}
                    </td>
                    <td className="px-4 py-3">{getAvailabilityBadge(item.availability)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.workLocation || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
