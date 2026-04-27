"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Download, Loader2, Printer } from "lucide-react";
import { employeeService } from "@/services/hr-services/employeeService";
import { managerTimesheetApprovalsService } from "@/services/manager-services/timesheet-approvals.service";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "./reportExport";

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return { start: monday, end: friday };
};

const normalizeEmployees = (payload) => {
  const raw = payload?.data?.employees || payload?.data || payload?.employees || payload || [];
  return Array.isArray(raw) ? raw : [];
};

const normalizeTimesheets = (payload) => {
  const raw = payload?.timesheets || payload?.data?.timesheets || payload?.data || payload || [];
  return Array.isArray(raw) ? raw : [];
};

export default function MissingTimesheetsReportTab({ globalFilters }) {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [employeesResponse, timesheetsResponse] = await Promise.all([
          employeeService.getAllEmployees({ limit: 1000 }),
          managerTimesheetApprovalsService.getApprovals(),
        ]);

        setEmployees(normalizeEmployees(employeesResponse));
        setTimesheets(normalizeTimesheets(timesheetsResponse));
      } catch (err) {
        setError(err?.message || "Failed to load timesheet data");
        setEmployees([]);
        setTimesheets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dateRange = useMemo(() => {
    if (globalFilters?.startDate && globalFilters?.endDate) {
      return {
        start: new Date(globalFilters.startDate),
        end: new Date(globalFilters.endDate),
      };
    }
    return getWeekRange();
  }, [globalFilters]);

  const submittedEmployeeIds = useMemo(() => {
    const start = dateRange.start?.getTime();
    const end = dateRange.end?.getTime();
    const ids = new Set();
    timesheets.forEach((sheet) => {
      const sheetDate = sheet?.date ? new Date(sheet.date).getTime() : null;
      if (!sheetDate || (start && sheetDate < start) || (end && sheetDate > end)) return;
      if (sheet.employeeId) ids.add(String(sheet.employeeId));
      if (sheet.employee?.id) ids.add(String(sheet.employee.id));
      if (sheet.employeeCode) ids.add(String(sheet.employeeCode));
      if (sheet.employee) ids.add(String(sheet.employee));
    });
    return ids;
  }, [timesheets, dateRange]);

  const missingEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const id = emp.id || emp.employeeId || emp.publicId || emp.employeeCode;
      const key = id ? String(id) : emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
      if (!key) return false;
      return !submittedEmployeeIds.has(key);
    });
  }, [employees, submittedEmployeeIds]);

  const exportRows = useMemo(() => {
    return missingEmployees.map((emp) => ({
      employeeId: emp.employeeId || emp.employeeCode || emp.id || "-",
      name: emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "-",
      department: emp.department?.name || emp.department || "-",
      designation: emp.designation?.name || emp.designation || "-",
      location: emp.location || emp.branch || "-",
      email: emp.email || "-",
    }));
  }, [missingEmployees]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Missing Timesheets</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Employees without any timesheet submissions in the selected range.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  downloadCsv({
                    columns: ["employeeId", "name", "department", "designation", "location", "email"],
                    rows: exportRows,
                    fileName: "missing-timesheets.csv",
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
                    columns: ["employeeId", "name", "department", "designation", "location", "email"],
                    rows: exportRows,
                    fileName: "missing-timesheets.xlsx",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={() => downloadPdf({ fileName: "missing-timesheets.pdf" })}
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

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Missing Timesheet List</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Designation</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {missingEmployees.length > 0 ? (
                    missingEmployees.map((emp, idx) => (
                      <tr key={emp.id || emp.employeeId || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{emp.employeeId || emp.employeeCode || "-"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {emp.department?.name || emp.department || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {emp.designation?.name || emp.designation || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {emp.location || emp.branch || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        All employees have submitted timesheets in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

