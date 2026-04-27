"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Briefcase, CheckCircle2, X, ArrowLeft, DollarSign, Users, Calendar, FileText, Filter, Search, Eye, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { deptHeadJobRequisitionService } from "@/services/dept-head-services/job-requisition.service";

export default function JobRequisitionsPage() {
  const [requisitions, setRequisitions] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "approved"
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [comment, setComment] = useState("");
  const [actionType, setActionType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [updating, setUpdating] = useState(null);

  // Fetch data on component mount and when tab changes
  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingRequisitions();
    } else {
      fetchApprovedJobs();
    }
  }, [activeTab]);

  const fetchPendingRequisitions = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100
      };
      
      // Only include search if it has a value
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      const response = await deptHeadJobRequisitionService.getPendingJobRequisitions(params);
      
      if (response.success) {
        setRequisitions(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching job requisitions:', error);
      toast.error('Failed to fetch job requisitions');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedJobs = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100
      };
      
      // Only include search if it has a value
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      const response = await deptHeadJobRequisitionService.getApprovedJobs(params);
      
      if (response.success) {
        setApprovedJobs(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching approved jobs:', error);
      toast.error('Failed to fetch approved jobs');
    } finally {
      setLoading(false);
    }
  };

  // Refetch when search changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (!loading) {
        if (activeTab === "pending") {
          fetchPendingRequisitions();
        } else {
          fetchApprovedJobs();
        }
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleApprove = async (id, commentText = "") => {
    try {
      setUpdating(id);
      await deptHeadJobRequisitionService.updateJobRequisitionStatus(id, 'APPROVED', commentText);
      
      setRequisitions(requisitions.map(req => 
        req.id === id ? { ...req, status: "APPROVED", comment: commentText } : req
      ));
      toast.success("Job requisition approved successfully");
      setShowCommentModal(false);
      setComment("");
      
      // Refresh approved jobs list
      if (activeTab === "approved") {
        fetchApprovedJobs();
      }
    } catch (error) {
      console.error('Error approving requisition:', error);
      toast.error(error.message || 'Failed to approve job requisition');
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (id, commentText = "") => {
    try {
      setUpdating(id);
      await deptHeadJobRequisitionService.updateJobRequisitionStatus(id, 'REJECTED', commentText);
      
      setRequisitions(requisitions.map(req => 
        req.id === id ? { ...req, status: "REJECTED", comment: commentText } : req
      ));
      toast.error("Job requisition rejected");
      setShowCommentModal(false);
      setComment("");
    } catch (error) {
      console.error('Error rejecting requisition:', error);
      toast.error(error.message || 'Failed to reject job requisition');
    } finally {
      setUpdating(null);
    }
  };

  const handleSendBack = async (id, commentText = "") => {
    try {
      setUpdating(id);
      await deptHeadJobRequisitionService.updateJobRequisitionStatus(id, 'SENT_BACK', commentText);
      
      setRequisitions(requisitions.map(req => 
        req.id === id ? { ...req, status: "SENT_BACK", comment: commentText } : req
      ));
      toast.success("Job requisition sent back");
      setShowCommentModal(false);
      setComment("");
    } catch (error) {
      console.error('Error sending back requisition:', error);
      toast.error(error.message || 'Failed to send back job requisition');
    } finally {
      setUpdating(null);
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
    } else if (actionType === "reject") {
      handleReject(selectedRequest.id, comment);
    } else if (actionType === "sendback") {
      handleSendBack(selectedRequest.id, comment);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
      APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
      REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800" },
      SENT_BACK: { label: "Sent Back", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
    };
    const statusInfo = statusMap[status] || statusMap.PENDING;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const currentData = activeTab === "pending" ? requisitions : approvedJobs;
  
  const filteredRequisitions = currentData.filter(req => {
    const matchesSearch = 
      req.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = requisitions.filter(req => req.status === "PENDING").length;
  const approvedCount = approvedJobs.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Breadcrumb
          items={[
            { label: "Department Head", href: "/dept-head" },
            { label: "Job Requisitions", href: "/dept-head/job-requisitions" },
          ]}
        />

        {/* Header Section */}
        <div className="mb-6 mt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[hsl(var(--primary))] rounded-2xl shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Requisition Approvals</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {activeTab === "pending" ? "Approve hiring needs raised by managers" : "View your approved job requisitions"}
                </p>
              </div>
            </div>
            {activeTab === "pending" && pendingCount > 0 && (
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

          {/* Tabs */}
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === "pending"
                    ? "bg-[hsl(var(--primary))] text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Pending Requisitions</span>
                  {pendingCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === "pending" 
                        ? "bg-white/20 text-white" 
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === "approved"
                    ? "bg-[hsl(var(--primary))] text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>My Approved Jobs</span>
                  {approvedCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === "approved" 
                        ? "bg-white/20 text-white" 
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    }`}>
                      {approvedCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job title, department, or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-[hsl(var(--primary))] animate-spin" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Justification
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Positions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Budget Band
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Requested By
                  </th>
                  {activeTab === "approved" && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Approved Date
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequisitions.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "approved" ? 9 : 8} className="px-6 py-16 text-center">
                      <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">
                        {activeTab === "pending" ? "No pending job requisitions found" : "No approved jobs found"}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequisitions.map((req) => (
                    <tr 
                      key={req.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center shadow-sm">
                            <Briefcase className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {req.jobTitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {req.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={req.justification}>
                          {req.justification}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[hsl(var(--primary))]" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {req.positionCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {req.budgetBand}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {req.requestedBy.split(' (')[0]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(req.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      {activeTab === "approved" && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {req.approvedAt 
                                ? new Date(req.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'N/A'}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {activeTab === "pending" && req.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => openActionModal(req, "approve")}
                                className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm hover:shadow"
                                title="Approve"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openActionModal(req, "reject")}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm hover:shadow"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openDetailsModal(req)}
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
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredRequisitions.length}</span> of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{currentData.length}</span> {activeTab === "pending" ? "pending requisitions" : "approved jobs"}
            </span>
            <div className="flex items-center gap-4">
              {activeTab === "pending" ? (
                <>
                  <span className="text-gray-600 dark:text-gray-400">
                    Pending: <span className="font-semibold text-amber-600 dark:text-amber-400">{pendingCount}</span>
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Approved: <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {requisitions.filter(r => r.status === "APPROVED").length}
                    </span>
                  </span>
                </>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">
                  Total Approved: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{approvedCount}</span>
                </span>
              )}
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
                {actionType === "approve" ? "Approve" : actionType === "reject" ? "Reject" : "Send Back"} Job Requisition
              </h3>
            </div>
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {selectedRequest.jobTitle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedRequest.department} • {selectedRequest.positionCount} position{selectedRequest.positionCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Add Comment {actionType === "sendback" ? "(Required)" : "(Optional)"}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment here..."
                rows={4}
                required={actionType === "sendback"}
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
                disabled={actionType === "sendback" && !comment.trim()}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === "approve"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : actionType === "reject"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                }`}
              >
                {actionType === "approve" ? "Approve" : actionType === "reject" ? "Reject" : "Send Back"}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Job Requisition Details</h3>
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
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Job Title</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedRequest.jobTitle}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedRequest.department}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Position Count</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.positionCount} position{selectedRequest.positionCount > 1 ? 's' : ''}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Budget Band</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.budgetBand}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Justification</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.justification}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Requested By</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.requestedBy}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Requested: {new Date(selectedRequest.requestDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {selectedRequest.approvedAt && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Approved: {new Date(selectedRequest.approvedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
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
