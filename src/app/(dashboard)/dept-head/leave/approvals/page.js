"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  Check,
  X,
  Undo2,
  MoreVertical,
  Paperclip,
  Loader2,
  MessageSquareText
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerLeaveApprovalsService } from "@/services/manager-services/leave-approvals.service";
import { toast } from "react-hot-toast";

export default function LeaveApprovalsPage() {
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState({ open: false, action: null, id: null });
  const [comment, setComment] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const normalizeStatus = (value = "") => {
    const raw = String(value).trim();
    if (!raw) return "Pending";
    if (/sent\s*back/i.test(raw)) return "Sent Back";
    if (/approved/i.test(raw)) return "Approved";
    if (/rejected/i.test(raw)) return "Rejected";
    if (/pending/i.test(raw)) return "Pending";
    return raw;
  };

  const stripSentBackPrefix = (value = "") => {
    return String(value).replace(/^\s*sent\s*back\s*:\s*/i, "").trim();
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await managerLeaveApprovalsService.getLeaveRequests();
        const normalized = (data || []).map((item) => ({
          ...item,
          status: normalizeStatus(item.status),
          reason: stripSentBackPrefix(item.reason),
        }));
        setRequests(normalized);
      } catch (err) {
        toast.error(err?.message || "Unable to load leave approvals");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [refreshTrigger]);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const name = item.employee || "";
      const type = item.type || "";
      const id = item.id || "";
      
      const matchesQuery =
        name.toLowerCase().includes(query.toLowerCase()) ||
        type.toLowerCase().includes(query.toLowerCase()) ||
        id.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [requests, query, statusFilter]);

  const openAction = (action, id) => {
    setActionState({ open: true, action, id });
    setComment("");
    setOpenMenuId(null);
  };

  const handleActionClick = (e, id) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdownWidth = 176;
      let left = rect.right - dropdownWidth;
      if (left < 10) left = rect.left;

      setMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: left
      });
      setOpenMenuId(id);
    }
  };

  const confirmAction = async () => {
    try {
      if (actionState.action === "Approve") {
        await managerLeaveApprovalsService.approveLeave(actionState.id);
      } else if (actionState.action === "Reject") {
        await managerLeaveApprovalsService.rejectLeave(actionState.id, comment.trim());
      } else {
        await managerLeaveApprovalsService.sendBackLeave(actionState.id, comment.trim());
      }

      toast.success(`${actionState.action} successful`);
      setRefreshTrigger(prev => prev + 1);
      setActionState({ open: false, action: null, id: null });
    } catch (err) {
      toast.error(err?.message || "Operation failed");
    }
  };

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          customTitle="Leave Approvals"
          subtitle="Manage leave requests from your team"
        />

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                <input
                  type="text"
                  placeholder="Search Employee..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 focus:border-brand-500 outline-none text-xs"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-40 appearance-none px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 focus:border-brand-500 outline-none text-xs cursor-pointer font-bold uppercase tracking-wider"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Sent Back">Sent Back</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-brand-600" size={32} />
                <p className="text-xs text-gray-500 font-medium">Fetching approvals...</p>
              </div>
            ) : (
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Leave Type</th>
                    <th className="px-4 py-3">Date Range</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs border border-brand-100 uppercase">
                              {request.employee?.charAt(0) || "E"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-900 dark:text-gray-100 font-semibold text-xs whitespace-nowrap">
                                {request.employee}
                              </span>
                              <span className="text-[10px] text-gray-500 uppercase tracking-tight">
                                {request.employeeCode || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{request.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{request.dates}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{request.balance} days</span>
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const status = request.status;
                            const config = {
                              "Approved": { bg: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
                              "Pending": { bg: "bg-orange-50 text-orange-700 border-orange-200", icon: Clock },
                              "Rejected": { bg: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
                              "Sent Back": { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: Undo2 }
                            }[status] || { bg: "bg-gray-50 text-gray-700 border-gray-200", icon: Clock };
                            
                            const Icon = config.icon;
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wide border ${config.bg}`}>
                                <Icon size={10} />
                                {status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => handleActionClick(e, request.id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                          >
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={40} className="text-gray-200" />
                          <p className="text-sm text-gray-400 font-medium">No leave requests found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {openMenuId && (
        <div
          className="fixed w-44 rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1 z-[99]"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const activeRequest = requests.find(r => r.id === openMenuId);
            if (!activeRequest) return null;

            return (
              <>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-sm disabled:opacity-50"
                  disabled={!activeRequest.attachmentUrl}
                  onClick={() => {
                    if (activeRequest.attachmentUrl) {
                      window.open(activeRequest.attachmentUrl, "_blank", "noopener");
                    }
                    setOpenMenuId(null);
                  }}
                >
                  <Paperclip size={14} /> Attachment
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-sm disabled:opacity-50"
                  onClick={() => openAction("Approve", openMenuId)}
                  disabled={activeRequest.status !== "Pending"}
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm disabled:opacity-50"
                  onClick={() => openAction("Reject", openMenuId)}
                  disabled={activeRequest.status !== "Pending"}
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm disabled:opacity-50"
                  onClick={() => openAction("Send Back", openMenuId)}
                  disabled={activeRequest.status !== "Pending"}
                >
                  <MessageSquareText size={14} /> Send Back
                </button>
              </>
            );
          })()}
        </div>
      )}

      {actionState.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {actionState.action} Leave Request
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add an optional comment for the employee.
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Add a short note (optional)"
              className="mt-4 w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 p-3 text-sm focus:border-brand-500 outline-none"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setActionState({ open: false, action: null, id: null })}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                onClick={confirmAction}
              >
                Confirm {actionState.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
