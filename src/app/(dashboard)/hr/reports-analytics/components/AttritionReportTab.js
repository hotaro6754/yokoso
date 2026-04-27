"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingDown, Loader2, Download, Printer } from "lucide-react";
import { reportsAnalyticsService } from "@/services/hr-services/reports-analytics.service";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import CustomDropdown from "../../leave/components/CustomDropdown";
import DatePickerField from "@/components/form/input/DatePickerField";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "./reportExport";

export default function AttritionReportTab({ globalFilters }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAttritionReport();
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

  const fetchAttritionReport = async () => {
    try {
      setLoading(true);
      const params = {
        departmentId: (filters.departmentId !== "all" ? filters.departmentId : globalFilters?.departmentId) || "all",
        location: globalFilters?.location || undefined,
        employmentType: globalFilters?.employmentType !== "all" ? globalFilters?.employmentType : undefined,
      };
      const startDate = filters.startDate || globalFilters?.startDate;
      const endDate = filters.endDate || globalFilters?.endDate;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await reportsAnalyticsService.getAttritionReport(params);
      const data = response.success ? response.data : response;
      setReportData(data);
    } catch (error) {
      console.error("Error fetching attrition report:", error);
      toast.error(error.message || "Failed to fetch attrition report");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportRows = useMemo(() => {
    return (reportData?.employees || []).map((employee) => ({
      employee: employee.name || "-",
      department: employee.department || "-",
      joiningDate: employee.joiningDate || "",
      exitDate: employee.exitDate || "",
      tenure: employee.tenure || employee.tenureLabel || "-",
      reason: employee.reason || employee.exitReason || "-",
    }));
  }, [reportData]);

  const monthlyTrend = reportData?.monthlyTrend || reportData?.byMonth || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      ) : (reportData && (reportData.totalAttrition > 0 || (reportData.employees && reportData.employees.length > 0) || (reportData.summary && reportData.summary.totalExits > 0))) ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attrition Report</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track exits and identify attrition patterns.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  downloadCsv({
                    columns: ["employee", "department", "joiningDate", "exitDate", "tenure", "reason"],
                    rows: exportRows,
                    fileName: "attrition-report.csv",
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
                    columns: ["employee", "department", "joiningDate", "exitDate", "tenure", "reason"],
                    rows: exportRows,
                    fileName: "attrition-report.xlsx",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={() => downloadPdf({ fileName: "attrition-report.pdf" })}
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

          {/* Summary Cards */}
          {reportData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(() => {
                const exits = reportData.summary.exits || reportData.summary.totalAttrition || 0;
                const avgHeadcount = reportData.summary.averageHeadcount || reportData.summary.totalAtStart || 0;
                const attritionRate =
                  reportData.summary.attritionRate ??
                  (avgHeadcount ? (exits / avgHeadcount) * 100 : 0);
                return (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Attrition</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {exits}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Attrition Rate</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                        {attritionRate ? `${attritionRate.toFixed(2)}%` : "0%"}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">New Joiners</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {reportData.summary.newJoiners || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Average Headcount</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {avgHeadcount}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Attrition Trend</h4>
              <div className="mt-4 space-y-3">
                {monthlyTrend.length > 0 ? (
                  monthlyTrend.map((item) => (
                    <div key={item.month || item.label} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-gray-500 dark:text-gray-400">
                        {item.month || item.label}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-brand-500"
                          style={{ width: `${Math.min(item.count || item.value || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.count || item.value || 0}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No trend data.</p>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Attrition by Department</h4>
              <div className="mt-4 space-y-2">
                {(reportData.byDepartment || []).length > 0 ? (
                  reportData.byDepartment.map((item) => (
                    <div key={item.department} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{item.department}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No department data.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Attrition by Tenure</h4>
              <div className="mt-4 space-y-2">
                {(reportData.byTenure || []).length > 0 ? (
                  reportData.byTenure.map((item) => (
                    <div key={item.tenure} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{item.tenure}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No tenure data.</p>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Top Reasons for Leaving</h4>
              <div className="mt-4 space-y-2">
                {(reportData.byReason || []).length > 0 ? (
                  reportData.byReason.map((item) => (
                    <div key={item.reason} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{item.reason}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No exit reasons captured.</p>
                )}
              </div>
            </div>
          </div>

          {/* Exited Employees */}
          {reportData.employees && reportData.employees.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exited Employees</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Joining Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Exit Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Tenure</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{employee.employeeId}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{employee.department || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {employee.exitDate ? new Date(employee.exitDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{employee.tenure || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{employee.reason || "-"}</td>
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
          <TrendingDown className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No attrition data available</p>
        </div>
      )}
    </div>
  );
}
