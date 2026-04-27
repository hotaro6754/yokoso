"use client";

import { useState, useEffect } from "react";
import { Clock, User, AlertCircle, Search, Calendar, Loader2 } from "lucide-react";
import { attendanceService } from "@/services/hr-services/attendace.service";
import { toast } from "react-hot-toast";
import Pagination from "@/components/common/Pagination";
import DatePickerField from "@/components/form/input/DatePickerField";
import ExportButtons from "./ExportButtons";

export default function LateArrivalsTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchLateArrivals();
    fetchDepartments();
  }, [pagination.pageIndex, pagination.pageSize, startDate, endDate, departmentFilter]);

  const fetchDepartments = async () => {
    try {
      const { organizationService } = await import("@/services/hr-services/organization.service");
      const response = await organizationService.getAllDepartments({ limit: 100, page: 1 });
      const depts = response.success ? response.data || [] : response.data?.departments || [];
      setDepartments(depts);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchLateArrivals = async () => {
    try {
      setLoading(true);
      const validLimit = Math.min(Math.max(1, pagination.pageSize), 100);
      const params = {
        page: pagination.pageIndex + 1,
        limit: validLimit,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        departmentId: departmentFilter !== "all" ? departmentFilter : "all",
      };

      const response = await attendanceService.getLateArrivals(params);
      const recordsData = response?.success
        ? response.data || []
        : response.data?.records || response.data?.data || response.data || [];
      const paginationInfo = response.pagination || response.data?.pagination || {};

      setRecords(Array.isArray(recordsData) ? recordsData : []);
      setTotalItems(paginationInfo.totalItems || recordsData.length || 0);
      setTotalPages(
        paginationInfo.totalPages ||
          Math.ceil((paginationInfo.totalItems || recordsData.length || 0) / validLimit)
      );
    } catch (error) {
      console.error("Error fetching late arrivals:", error);
      toast.error("Failed to load late arrivals");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <DatePickerField
            value={startDate}
            onChange={(value) => setStartDate(value)}
            placeholder="Start Date"
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
          />
        </div>
        <div>
          <DatePickerField
            value={endDate}
            onChange={(value) => setEndDate(value)}
            placeholder="End Date"
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
          />
        </div>
        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Card & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-sm border border-orange-200 dark:border-orange-800 flex-grow w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Late Arrivals: {totalItems}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Records showing employees who arrived after standard start time (9:00 AM)
              </p>
            </div>
          </div>
        </div>
        
        <ExportButtons 
          columns={["employeeName", "employeeId", "date", "standardTime", "checkIn", "lateDuration", "status"]} 
          rows={records.map((record) => ({
            employeeName: record.employee?.name || `${record.employee?.firstName || ""} ${record.employee?.lastName || ""}`.trim() || "-",
            employeeId: record.employee?.employeeId || "-",
            date: record.date ? new Date(record.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-",
            standardTime: record.standardStartTime || "09:00",
            checkIn: record.checkIn || "-",
            lateDuration: record.lateFormatted || `${record.lateMinutes || 0} min`,
            status: record.status || "LATE"
          }))} 
          fileNamePrefix="late-arrivals-report" 
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Standard Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Check In
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Late Duration
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No late arrivals found</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {record.employee?.name || `${record.employee?.firstName} ${record.employee?.lastName}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {record.employee?.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {record.date
                        ? new Date(record.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {record.standardStartTime || "09:00"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {record.checkIn || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                        {record.lateFormatted || `${record.lateMinutes || 0} min`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {record.status || "LATE"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalItems={totalItems}
          totalPages={totalPages}
          itemsPerPage={pagination.pageSize}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
          }}
          onItemsPerPageChange={(size) => {
            const validSize = Math.min(Math.max(1, size), 100);
            setPagination({ pageIndex: 0, pageSize: validSize });
          }}
        />
      )}
    </div>
  );
}
