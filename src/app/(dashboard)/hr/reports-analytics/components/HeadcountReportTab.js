"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, Loader2, Download, Printer } from "lucide-react";
import { reportsAnalyticsService } from "@/services/hr-services/reports-analytics.service";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import CustomDropdown from "../../leave/components/CustomDropdown";
import DatePickerField from "@/components/form/input/DatePickerField";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "./reportExport";

export default function HeadcountReportTab({ globalFilters }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchHeadcountReport();
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

  const fetchHeadcountReport = async () => {
    try {
      setLoading(true);
      const params = {
        departmentId: (filters.departmentId !== "all" ? filters.departmentId : globalFilters?.departmentId) || "all",
        status: filters.status !== "all" ? filters.status : "all",
        location: globalFilters?.location || undefined,
        employmentType: globalFilters?.employmentType !== "all" ? globalFilters?.employmentType : undefined,
      };
      const startDate = filters.startDate || globalFilters?.startDate;
      const endDate = filters.endDate || globalFilters?.endDate;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await reportsAnalyticsService.getHeadcountReport(params);
      const data = response.success ? response.data : response;
      setReportData(data);
    } catch (error) {
      console.error("Error fetching headcount report:", error);
      toast.error(error.message || "Failed to fetch headcount report");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportRows = useMemo(() => {
    return (reportData?.employees || []).map((employee) => ({
      employeeId: employee.employeeId || "-",
      name: employee.name || "-",
      department: employee.department || "-",
      location: employee.location || "-",
      joiningDate: employee.joiningDate || "",
      status: employee.status || "-",
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
              Status
            </label>
            <CustomDropdown
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'PROBATION', label: 'Probation' },
                { value: 'NOTICE_PERIOD', label: 'Notice Period' }
              ]}
              placeholder="All Status"
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
      ) : (reportData && reportData.summary && (reportData.summary.total > 0 || (reportData.employees && reportData.employees.length > 0))) ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Headcount Report</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Workforce distribution and demographics snapshot.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  downloadCsv({
                    columns: ["employeeId", "name", "department", "location", "joiningDate", "status"],
                    rows: exportRows,
                    fileName: "headcount-report.csv",
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
                    columns: ["employeeId", "name", "department", "location", "joiningDate", "status"],
                    rows: exportRows,
                    fileName: "headcount-report.xlsx",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={() => downloadPdf({ fileName: "headcount-report.pdf" })}
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
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {reportData.summary.total || 0}
                </p>
              </div>
              {reportData.summary.byStatus && Object.entries(reportData.summary.byStatus).slice(0, 3).map(([status, count]) => (
                <div key={status} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Headcount by Department</h4>
              <div className="mt-4 space-y-3">
                {(reportData.byDepartment || []).length > 0 ? (
                  reportData.byDepartment.map((dept) => (
                    <div key={dept.department} className="flex items-center gap-3">
                      <span className="w-32 text-xs text-gray-500 dark:text-gray-400">
                        {dept.department}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-brand-500"
                          style={{ width: `${Math.min((dept.count / (reportData.summary?.total || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{dept.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No department data.</p>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Headcount by Location</h4>
              <div className="mt-4 space-y-2">
                {(reportData.byLocation || []).length > 0 ? (
                  reportData.byLocation.map((item) => (
                    <div key={item.location} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{item.location}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No location data.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Employment Type</h4>
              <div className="mt-4 space-y-2">
                {(reportData.byEmploymentType || []).length > 0 ? (
                  reportData.byEmploymentType.map((item) => (
                    <div key={item.type} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{item.type}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No employment type data.</p>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Gender Distribution</h4>
              <div className="mt-4 space-y-2">
                {(reportData.genderDistribution || []).length > 0 ? (
                  reportData.genderDistribution.map((item) => (
                    <div key={item.gender} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{item.gender}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No gender data.</p>
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
                  <thead className="bg-secondary-50 dark:bg-secondary-900/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-100">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-100">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.byDepartment.map((dept, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.department}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Employees List */}
          {reportData.employees && reportData.employees.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employees List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50 dark:bg-secondary-900/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-100">Employee</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-100">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-100">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-100">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-100">Joining Date</th>
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
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{employee.location || "-"}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
                            {employee.status || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "-"}
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
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No headcount data available</p>
        </div>
      )}
    </div>
  );
}
