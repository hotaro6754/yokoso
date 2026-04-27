"use client";

import { useState, useEffect, useMemo } from "react";
import { CalendarDays, Loader2, Download, Printer } from "lucide-react";
import { leaveReportsService } from "@/services/hr-services/leaveReports.service";
import { organizationService } from "@/services/hr-services/organization.service";
import leaveTypeService from "@/services/hr-services/leaveTypeService";
import { toast } from "react-hot-toast";
import CustomDropdown from "../../leave/components/CustomDropdown";
import DatePickerField from "@/components/form/input/DatePickerField";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "./reportExport";

export default function LeaveUtilizationTab({ globalFilters }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: "all",
    leaveTypeId: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    fetchLeaveUtilization();
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

  const fetchLeaveTypes = async () => {
    try {
      const response = await leaveTypeService.getLeaveTypesDropdown();
      const data = response.success ? response.data : response.data || response || [];
      setLeaveTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      setLeaveTypes([]);
    }
  };

  const fetchLeaveUtilization = async () => {
    try {
      setLoading(true);
      const params = {};
      const departmentValue =
        (filters.departmentId !== "all" ? filters.departmentId : globalFilters?.departmentId) || "all";
      if (departmentValue) params.department = departmentValue;
      if (filters.leaveTypeId && filters.leaveTypeId !== "all") {
        params.leaveTypeId = filters.leaveTypeId;
      }
      const startDateValue = filters.startDate || globalFilters?.startDate;
      const endDateValue = filters.endDate || globalFilters?.endDate;
      if (startDateValue) params.startDate = startDateValue;
      if (endDateValue) params.endDate = endDateValue;

      const [statsRes, trendsRes, byTypeRes, byDeptRes, employeeRes] = await Promise.all([
        leaveReportsService.getLeaveStats(params),
        leaveReportsService.getLeaveTrends(params),
        leaveReportsService.getLeaveByType(params),
        leaveReportsService.getLeaveByDepartment(params),
        leaveReportsService.getEmployeeLeaveSummary({ ...params, page: 1, limit: 100 }),
      ]);

      const stats = statsRes?.data || statsRes || {};
      const trends = trendsRes?.data || trendsRes || {};
      const byType = byTypeRes?.data || byTypeRes || {};
      const byDept = byDeptRes?.data || byDeptRes || {};
      const employeeRows = employeeRes?.data || employeeRes || [];

      const byMonth = Array.isArray(trends.categories) && Array.isArray(trends.series)
        ? trends.categories.map((month, idx) => ({
            month,
            totalDays: trends.series?.[0]?.data?.[idx] || 0,
          }))
        : [];

      const byLeaveType = Array.isArray(byType.labels) && Array.isArray(byType.series)
        ? byType.labels.map((label, idx) => ({
            leaveType: label,
            totalDays: byType.series?.[idx] || 0,
            totalRequests: 0,
            employeesCount: 0,
          }))
        : [];

      const byDepartment = Array.isArray(byDept.categories) && Array.isArray(byDept.series)
        ? byDept.categories.map((dept, idx) => ({
            department: dept,
            employees: byDept.series?.[0]?.data?.[idx] || 0,
            totalAllocated: 0,
            totalUsed: byDept.series?.[0]?.data?.[idx] || 0,
            utilizationRate: byDept.series?.[1]?.data?.[idx] || 0,
          }))
        : [];

      const employeeUtilization = Array.isArray(employeeRows)
        ? employeeRows.map((row) => ({
            employee: {
              id: row.id || row.employeeId || row.employeeCode,
              name: row.name || row.employeeName || "N/A",
              employeeId: row.employeeId || row.employeeCode || "-",
            },
            leaveType: row.leaveType || row.type || "-",
            summary: {
              totalDaysUsed: row.usedLeaves || row.totalUsed || 0,
              totalDaysRemaining: row.remainingLeaves || row.totalRemaining || 0,
            },
          }))
        : [];

      setReportData({
        overallSummary: {
          totalDaysUsed: stats.totalLeaves || 0,
          averageLeavePerEmployee: stats.averageLeaveDuration || 0,
          unusedLeaveBalance: stats.unusedLeaveBalance || stats.totalDaysRemaining || 0,
          overallUtilizationRate: stats.leaveUtilization || 0,
        },
        byLeaveType,
        byMonth,
        byDepartment,
        employeeUtilization,
      });
    } catch (error) {
      console.error("Error fetching leave utilization:", error);
      toast.error(error.message || "Failed to fetch leave utilization report");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportRows = useMemo(() => {
    return (reportData?.employeeUtilization || []).map((item) => ({
      employee: item.employee?.name || "-",
      leaveType: item.leaveType || item.summary?.leaveType || "-",
      daysTaken: item.summary?.totalDaysUsed || 0,
      remainingBalance: item.summary?.totalDaysRemaining || 0,
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
              Leave Type
            </label>
            <CustomDropdown
              value={filters.leaveTypeId}
              onChange={(value) => setFilters({ ...filters, leaveTypeId: value })}
              options={[
                { value: "all", label: "All Leave Types" },
                ...leaveTypes.map((type) => ({
                  value: type.id || type.publicId,
                  label: type.name || type.label,
                })),
              ]}
              placeholder="All Leave Types"
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Utilization</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track leave usage across type, department, and employee.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  downloadCsv({
                    columns: ["employee", "leaveType", "daysTaken", "remainingBalance"],
                    rows: exportRows,
                    fileName: "leave-utilization.csv",
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
                    columns: ["employee", "leaveType", "daysTaken", "remainingBalance"],
                    rows: exportRows,
                    fileName: "leave-utilization.xlsx",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={() => downloadPdf({ fileName: "leave-utilization.pdf" })}
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Leave Taken</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {reportData.overallSummary.totalDaysUsed || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Leave / Employee</p>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                  {reportData.overallSummary.averageLeavePerEmployee || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Unused Leave Balance</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {reportData.overallSummary.unusedLeaveBalance || reportData.overallSummary.totalDaysRemaining || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Utilization Rate</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {reportData.overallSummary.overallUtilizationRate ? `${reportData.overallSummary.overallUtilizationRate.toFixed(2)}%` : "0%"}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Leave Type Distribution</h4>
              <div className="mt-4 space-y-2">
                {(reportData.byLeaveType || []).length > 0 ? (
                  reportData.byLeaveType.map((item) => (
                    <div key={item.leaveType} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{item.leaveType}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.totalDays || 0}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No leave type data.</p>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Leave Usage by Month</h4>
              <div className="mt-4 space-y-2">
                {(reportData.byMonth || []).length > 0 ? (
                  reportData.byMonth.map((item) => (
                    <div key={item.month} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-gray-500 dark:text-gray-400">{item.month}</span>
                      <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-brand-500"
                          style={{ width: `${Math.min(item.totalDays || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.totalDays || 0}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No monthly data.</p>
                )}
              </div>
            </div>
          </div>

          {/* By Leave Type */}
          {reportData.byLeaveType && reportData.byLeaveType.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">By Leave Type</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Leave Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total Days</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total Requests</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Employees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.byLeaveType.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.leaveType}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.totalDays || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.totalRequests || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.employeesCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* By Department */}
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total Allocated</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total Used</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Utilization Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.byDepartment.map((dept, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.department}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.employees || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.totalAllocated || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.totalUsed || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {dept.utilizationRate ? `${dept.utilizationRate.toFixed(2)}%` : "0%"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Employee Utilization */}
          {reportData.employeeUtilization && reportData.employeeUtilization.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Leave Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Leave Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Days Taken</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.employeeUtilization.map((item, index) => (
                      <tr key={item.employee?.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.employee?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.employee?.employeeId}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.leaveType || item.summary?.leaveType || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.summary?.totalDaysUsed || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.summary?.totalDaysRemaining || 0}</td>
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
          <CalendarDays className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No leave utilization data available</p>
        </div>
      )}
    </div>
  );
}
