"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, Loader2, Download, Printer } from "lucide-react";
import { reportsAnalyticsService } from "@/services/hr-services/reports-analytics.service";
import { organizationService } from "@/services/hr-services/organization.service";
import employeeService from "@/services/hr-services/employeeService";
import { toast } from "react-hot-toast";
import CustomDropdown from "../../leave/components/CustomDropdown";
import DatePickerField from "@/components/form/input/DatePickerField";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "./reportExport";

export default function AttendanceSummaryTab({ globalFilters }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: "all",
    managerId: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  useEffect(() => {
    fetchAttendanceSummary();
  }, [filters, globalFilters]);

  const fetchDepartments = async () => {
    try {
      const response = await organizationService.getAllDepartments({ limit: 100 });
      const deptData = response.success ? response.data?.departments || response.data : response.data || [];
      setDepartments(deptData);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await employeeService.getManagers();
      const data = response?.data || response || [];
      setManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setManagers([]);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      setLoading(true);
      const params = {
        departmentId: (filters.departmentId !== "all" ? filters.departmentId : globalFilters?.departmentId) || "all",
        managerId: filters.managerId !== "all" ? filters.managerId : "all",
        location: globalFilters?.location || undefined,
        employmentType: globalFilters?.employmentType !== "all" ? globalFilters?.employmentType : undefined,
      };
      const startDate = filters.startDate || globalFilters?.startDate;
      const endDate = filters.endDate || globalFilters?.endDate;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await reportsAnalyticsService.getAttendanceSummaryReport(params);
      const data = response.success ? response.data : response;
      setReportData(data);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
      toast.error(error.message || "Failed to fetch attendance summary");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportRows = useMemo(() => {
    return (reportData?.employeeSummary || []).map((item) => ({
      employee: item.employee?.name || "-",
      present: item.summary?.present || 0,
      absent: item.summary?.absent || 0,
      late: item.summary?.late || 0,
      wfh: item.summary?.wfh || 0,
      attendanceRate: item.summary?.attendanceRate || 0,
    }));
  }, [reportData]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <CustomDropdown
              value={filters.departmentId}
              onChange={(value) => setFilters({ ...filters, departmentId: value })}
              options={[
                { value: 'all', label: 'All Departments' },
                ...departments.map(dept => ({ value: dept.id, label: dept.name }))
              ]}
              placeholder="All Departments"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Manager
            </label>
            <CustomDropdown
              value={filters.managerId}
              onChange={(value) => setFilters({ ...filters, managerId: value })}
              options={[
                { value: "all", label: "All Managers" },
                ...managers.map((manager) => ({
                  value: manager.id || manager._id,
                  label: manager.name || `${manager.firstName || ""} ${manager.lastName || ""}`.trim(),
                })),
              ]}
              placeholder="All Managers"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <DatePickerField
              value={filters.startDate}
              onChange={(value) => setFilters({ ...filters, startDate: value })}
              className="w-full px-3 py-2"
              placeholder="Start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <DatePickerField
              value={filters.endDate}
              onChange={(value) => setFilters({ ...filters, endDate: value })}
              className="w-full px-3 py-2"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Summary</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Attendance behavior, late logins, and WFH tracking.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  downloadCsv({
                    columns: ["employee", "present", "absent", "late", "wfh", "attendanceRate"],
                    rows: exportRows,
                    fileName: "attendance-summary.csv",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button
                onClick={() =>
                  downloadExcel({
                    columns: ["employee", "present", "absent", "late", "wfh", "attendanceRate"],
                    rows: exportRows,
                    fileName: "attendance-summary.xlsx",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={() => downloadPdf({ fileName: "attendance-summary.pdf" })}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Printer className="h-4 w-4" />
                PDF / Print
              </button>
              <button
                onClick={printReport}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>
          {/* Overall Summary Cards */}
          {reportData.overallSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance %</p>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                  {reportData.overallSummary.overallAttendanceRate ? `${reportData.overallSummary.overallAttendanceRate.toFixed(2)}%` : "0%"}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Present Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {reportData.overallSummary.totalPresent || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Absent Days</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {reportData.overallSummary.totalAbsent || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Late Logins</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {reportData.overallSummary.totalLate || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">WFH Days</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {reportData.overallSummary.totalWFH || 0}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Attendance Trend</h4>
              <div className="mt-4 space-y-2">
                {(reportData.monthlyTrend || []).length > 0 ? (
                  reportData.monthlyTrend.map((item) => (
                    <div key={item.month} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-gray-500 dark:text-gray-400">{item.month}</span>
                      <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-brand-500"
                          style={{ width: `${Math.min(item.attendanceRate || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.attendanceRate || 0}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No trend data.</p>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Department-wise Attendance</h4>
              <div className="mt-4 space-y-2">
                {(reportData.byDepartment || []).length > 0 ? (
                  reportData.byDepartment.map((dept) => (
                    <div key={dept.department} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{dept.department}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {dept.averageAttendanceRate ? `${dept.averageAttendanceRate.toFixed(2)}%` : "0%"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No department data.</p>
                )}
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          {reportData.byDepartment && reportData.byDepartment.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Employees</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Present</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Absent</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.byDepartment.map((dept, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.department}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.employees || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.totalPresent || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.totalAbsent || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {dept.averageAttendanceRate ? `${dept.averageAttendanceRate.toFixed(2)}%` : "0%"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Employee Summary */}
          {reportData.employeeSummary && reportData.employeeSummary.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Present</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Absent</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Late</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">WFH</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.employeeSummary.map((item, index) => (
                      <tr key={item.employee?.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.employee?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.employee?.employeeId}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.summary?.present || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.summary?.absent || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.summary?.late || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.summary?.wfh || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.summary?.attendanceRate ? `${item.summary.attendanceRate.toFixed(2)}%` : "0%"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No attendance data available</p>
        </div>
      )}
    </div>
  );
}
