"use client";

import { useState, useEffect } from "react";
import { Edit, Calendar, Clock, User, FileText, Loader2, Search, Filter, Eye, CheckCircle2, XCircle, MessageSquareText } from "lucide-react";
import { attendanceService } from "@/services/hr-services/attendace.service";
import { hrAttendanceApprovalsService } from "@/services/hr-services/attendance-approvals.service";
import { toast } from "react-hot-toast";
import Pagination from "@/components/common/Pagination";
import CorrectAttendanceModal from "./CorrectAttendanceModal";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function AttendanceCorrectionsTab() {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [actionState, setActionState] = useState({ open: false, action: null, id: null });
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchCorrections();
  }, [pagination.pageIndex, pagination.pageSize, startDate, endDate]);

  const handleAction = (action, id) => {
    setActionState({ open: true, action, id });
    setComment("");
  };

  const confirmAction = async () => {
    try {
      if (actionState.action === "Approve") {
        await hrAttendanceApprovalsService.approveCorrection(actionState.id, comment.trim());
      } else if (actionState.action === "Reject") {
        await hrAttendanceApprovalsService.rejectCorrection(actionState.id, comment.trim());
      } else {
        await hrAttendanceApprovalsService.requestClarification(actionState.id, comment.trim());
      }

      toast.success(`${actionState.action} successful`);
      setActionState({ open: false, action: null, id: null });
      fetchCorrections();
    } catch (error) {
      toast.error(error.message || `Failed to ${actionState.action.toLowerCase()} request`);
    }
  };

  const fetchCorrections = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const response = await attendanceService.getAttendanceCorrections(params);
      const correctionsData = response?.success
        ? response.data || []
        : response.data?.corrections || response.data?.data || response.data || [];
      const paginationInfo = response.pagination || response.data?.pagination || {};

      // Filter by search term if provided
      const filtered = searchTerm
        ? correctionsData.filter((correction) => {
          const empName = `${correction.employee?.firstName || ""} ${correction.employee?.lastName || ""}`.toLowerCase();
          const reason = (correction.reason || "").toLowerCase();
          return empName.includes(searchTerm.toLowerCase()) || reason.includes(searchTerm.toLowerCase());
        })
        : correctionsData;

      setCorrections(Array.isArray(filtered) ? filtered : []);
      setTotalItems(paginationInfo.totalItems || filtered.length || 0);
      setTotalPages(paginationInfo.totalPages || Math.ceil((paginationInfo.totalItems || filtered.length || 0) / pagination.pageSize));
    } catch (error) {
      console.error("Error fetching corrections:", error);
      toast.error("Failed to load attendance corrections");
      setCorrections([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && corrections.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Policy Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-500/30 rounded-sm p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-sm flex-shrink-0">
            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
              Regularization Policy (Employee Side)
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Employees are restricted to raising regularization requests within a <strong>5-day window</strong> of the attendance date.
              As an HR admin, you can review and approve these requests here.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by employee name or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchCorrections();
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
            />
          </div>
        </div>
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
      </div>

      {/* Corrections Table */}
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
                  Original
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Corrected
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Corrected At
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {corrections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Edit className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No attendance corrections found</p>
                  </td>
                </tr>
              ) : (
                corrections.map((correction) => (
                  <tr key={correction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {correction.employee?.firstName} {correction.employee?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {correction.employee?.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {correction.date
                        ? new Date(correction.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2 mb-1">
                          <p>Status: {correction.originalStatus || correction.status || "-"}</p>
                          {(correction.originalStatus === 'LOP' || (correction.originalStatus === 'ABSENT' && correction.originalNotes?.includes('[LOP]'))) && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[9px] font-bold border border-amber-100 dark:border-amber-500/20 uppercase">
                              LOP
                            </span>
                          )}
                        </div>
                        <p>
                          {correction.originalCheckIn && `In: ${correction.originalCheckIn}`}
                          {correction.originalCheckOut && ` Out: ${correction.originalCheckOut}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(correction.status === 'LOP' || (correction.status === 'ABSENT' && (correction.reason?.includes('[LOP]') || correction.notes?.includes('[LOP]'))))
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400"
                            }`}>
                            {correction.status || correction.currentStatus}
                          </span>
                          {(correction.status === 'LOP' || (correction.status === 'ABSENT' && (correction.reason?.includes('[LOP]') || correction.notes?.includes('[LOP]')))) && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 text-[10px] font-bold border border-red-100 dark:border-red-500/20 uppercase">
                              LOP
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {correction.checkIn && <p>In: {correction.checkIn}</p>}
                          {correction.checkOut && <p>Out: {correction.checkOut}</p>}
                          {correction.totalHours && <p>Hours: {correction.totalHours}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {correction.reason || correction.notes || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {correction.updatedAt
                        ? new Date(correction.updatedAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCorrection(correction);
                            setIsCorrectionModalOpen(true);
                          }}
                          className="p-2 rounded-sm bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors shadow-sm hover:shadow dark:bg-brand-900/30 dark:text-brand-400"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(correction.status === 'PENDING' || correction.status === 'REQUESTED') && (
                          <>
                            <button
                              onClick={() => handleAction("Approve", correction.id)}
                              className="p-2 rounded-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm hover:shadow dark:bg-emerald-900/30 dark:text-emerald-400"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction("Reject", correction.id)}
                              className="p-2 rounded-sm bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shadow-sm hover:shadow dark:bg-rose-900/30 dark:text-rose-400"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction("Clarify", correction.id)}
                              className="p-2 rounded-sm bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors shadow-sm hover:shadow dark:bg-amber-900/30 dark:text-amber-400"
                              title="Request Clarification"
                            >
                              <MessageSquareText className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correct Attendance Modal */}
      <CorrectAttendanceModal
        isOpen={isCorrectionModalOpen}
        onClose={() => {
          setIsCorrectionModalOpen(false);
          setSelectedCorrection(null);
        }}
        attendance={selectedCorrection}
        onUpdate={() => {
          fetchCorrections();
          setIsCorrectionModalOpen(false);
          setSelectedCorrection(null);
        }}
      />

      {actionState.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {actionState.action === 'Approve' ? <CheckCircle2 className="text-emerald-500" /> : actionState.action === 'Reject' ? <XCircle className="text-rose-500" /> : <MessageSquareText className="text-amber-500" />}
              {actionState.action} Attendance Request
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Add a comment for the employee (optional).
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Enter your notes here..."
              className="mt-4 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setActionState({ open: false, action: null, id: null })}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-sm font-bold rounded-lg text-white transition-all shadow-sm hover:shadow-md ${actionState.action === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionState.action === 'Reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                onClick={confirmAction}
              >
                Confirm {actionState.action}
              </button>
            </div>
          </div>
        </div>
      )}

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
