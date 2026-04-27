"use client";

import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { CalendarCheck, CheckCircle2, X, Clock, MessageSquare, Filter, Search, Calendar, Eye, MoreVertical } from "lucide-react";
import { toast } from "react-hot-toast";
import { deptHeadLeaveService } from "@/services/dept-head-services/leave-approvals.service";

export default function LeaveApprovalsPage() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [comment, setComment] = useState("");
  const [actionType, setActionType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchLeaveRequests();
  }, [searchTerm, filterStatus]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || '',
        status: filterStatus === 'ALL' ? '' : filterStatus
      };
      const response = await deptHeadLeaveService.getLeaveRequests(params);
      setLeaveRequests(response?.data || response || []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Failed to load leave requests");
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, commentText = "") => {
    try {
      const updated = await deptHeadLeaveService.updateLeaveStatus(id, "APPROVED", commentText);
      setLeaveRequests((prev) => prev.map(req => req.id === id ? updated : req));
      toast.success("Leave request approved successfully");
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error("Failed to approve leave request");
    } finally {
      setShowCommentModal(false);
      setComment("");
    }
  };

  const handleReject = async (id, commentText = "") => {
    try {
      const updated = await deptHeadLeaveService.updateLeaveStatus(id, "REJECTED", commentText);
      setLeaveRequests((prev) => prev.map(req => req.id === id ? updated : req));
      toast.error("Leave request rejected");
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error("Failed to reject leave request");
    } finally {
      setShowCommentModal(false);
      setComment("");
    }
  };

  const openActionModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setShowCommentModal(true);
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleActionWithComment = () => {
    if (actionType === "approve") {
      handleApprove(selectedRequest.id, comment);
    } else {
      handleReject(selectedRequest.id, comment);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
      APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
      REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap.PENDING;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const filteredRequests = useMemo(() => leaveRequests, [leaveRequests]);

  const pendingCount = leaveRequests.filter(req => req.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Breadcrumb
          items={[
            { label: "Department Head", href: "/dept-head" },
            { label: "Leave Approvals", href: "/dept-head/leave-approvals" },
          ]}
        />

        {/* Header Section */}
        <div className="mb-6 mt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[hsl(var(--primary))] rounded-2xl shadow-lg">
                <CalendarCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave Approvals</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Review and manage leave requests from your team
                </p>
              </div>
            </div>
            {pendingCount > 0 && (
              <div className="px-5 py-2.5 bg-amber-500 rounded-xl shadow-md text-white">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold">
                    {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Leave Balance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <CalendarCheck className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">No leave requests found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">
                              {request.employeeName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {request.employeeName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {request.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.leaveType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {request.days} {request.days === 1 ? 'day' : 'days'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            S:{request.leaveBalance?.sick ?? 0}
                          </span>
                          <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                            C:{request.leaveBalance?.casual ?? 0}
                          </span>
                          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium">
                            E:{request.leaveBalance?.earned ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {request.unpaidDays > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {request.paidDays > 0 && <span className="text-[10px] font-bold text-green-600">{request.paidDays} Paid</span>}
                            <span className="text-[10px] font-bold text-red-600">{request.unpaidDays} Unpaid</span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide border bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30">
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {request.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => openActionModal(request, "approve")}
                                className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm hover:shadow"
                                title="Approve"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openActionModal(request, "reject")}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm hover:shadow"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openDetailsModal(request)}
                              className="p-2 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
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

        {/* Summary Footer */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredRequests.length}</span> of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{leaveRequests.length}</span> leave requests
            </span>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Pending: <span className="font-semibold text-amber-600 dark:text-amber-400">{pendingCount}</span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Approved: <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {leaveRequests.filter(r => r.status === "APPROVED").length}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {actionType === "approve" ? "Approve" : "Reject"} Leave Request
              </h3>
            </div>
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {selectedRequest.employeeName} ({selectedRequest.employeeId})
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedRequest.leaveType} • {selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Add Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment here..."
                rows={4}
                className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white resize-none transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setComment("");
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActionWithComment}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-md hover:shadow-lg ${actionType === "approve"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {actionType === "approve" ? "Approve" : "Reject"} Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20 rounded-lg">
                  <Eye className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leave Request Details</h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Employee</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.employeeName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{selectedRequest.employeeId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Leave Type</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.leaveType}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Days</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Duration</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(selectedRequest.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(selectedRequest.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Reason</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.reason}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Leave Balance</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">
                    Sick: {selectedRequest.leaveBalance.sick}
                  </span>
                  <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold">
                    Casual: {selectedRequest.leaveBalance.casual}
                  </span>
                  <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold">
                    Earned: {selectedRequest.leaveBalance.earned}
                  </span>
                </div>
              </div>
              {selectedRequest.comment && (
                <div className="p-4 bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20 rounded-xl">
                  <p className="text-xs font-semibold text-[hsl(var(--primary))] uppercase mb-2">Comment</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.comment}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
