"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  FileText,
  ChevronRight,
  Sun,
  Moon,
  Plus,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Breadcrumb from "../../../../../components/common/Breadcrumb";
import Pagination from "../../../../../components/common/Pagination";

export default function EmployeeOvertimePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ASSIGNED"); // ASSIGNED | REQUESTS
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Completion Modal
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [workSummary, setWorkSummary] = useState("");

  // Request Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: "",
    reason: "",
    details: ""
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [currentPage, statusFilter, activeTab]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // We use the same endpoint, but could filter on client side or backend if needed.
      // Currently getMyRecords returns all. We might need to filter by `managerId` presence on client side 
      // if backend doesn't support tab-specific filtering yet. 
      // Or we accept all and just display differently.

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/employee/overtime/my-records`, {
        params: { page: currentPage, status: statusFilter },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      const data = response.data;
      const recs = data.records || data.data?.records || [];
      const pagination = data.pagination || data.data?.pagination || {};

      // Client-side filtering for now based on 'activeTab' logic if backend returns mixed
      // ASSIGNED => managerId is NOT null
      // REQUESTS => managerId is NULL (User requested it)
      // Note: `managerName` is returned by service. If it exists/is not "-", it's assigned.

      const filteredRecs = recs.filter(r => {
        if (activeTab === "ASSIGNED") return r.managerId !== null;
        if (activeTab === "REQUESTS") return r.managerId === null;
        return true;
      });

      setRecords(filteredRecs);

      // Pagination might be off if we filter client side, but it works for small datasets. 
      // For large datasets, backend support for `type=ASSIGNED|REQUEST` param is better.
      setTotalPages(pagination.totalPages || 1);
    } catch (error) {
      console.error("Fetch error", error);
      toast.error("Failed to load overtime records");
    } finally {
      setLoading(false);
    }
  };

  const openCompleteModal = (record) => {
    setSelectedRecord(record);
    setWorkSummary("");
    setIsCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/employee/overtime/complete/${selectedRecord.id}`,
        { workSummary },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success("Overtime marked as completed!");
      setIsCompleteModalOpen(false);
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit completion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/employee/overtime/request`,
        requestForm,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success("Overtime request submitted!");
      setIsRequestModalOpen(false);
      setRequestForm({
        date: new Date().toISOString().split('T')[0],
        hours: "",
        reason: "",
        details: ""
      });
      // Switch to requests tab to see it
      if (activeTab !== "REQUESTS") setActiveTab("REQUESTS");
      else fetchRecords();

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED': return <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">Assigned</span>;
      case 'PENDING': return <span className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold border border-yellow-200">Pending Approval</span>;
      case 'COMPLETED': return <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">Completed (Pending Review)</span>;
      case 'APPROVED': return <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">Approved</span>;
      case 'REJECTED': return <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200">Rejected</span>;
      default: return <span className="px-2 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          customTitle="My Overtime"
          subtitle="Manage assigned tasks and request overtime"
        />

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("ASSIGNED")}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === "ASSIGNED"
                ? "bg-primary-50 text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            Assigned Tasks
          </button>
          <button
            onClick={() => setActiveTab("REQUESTS")}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === "REQUESTS"
                ? "bg-primary-50 text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            My Requests
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
            >
              <option value="ALL">All Status</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {activeTab === "REQUESTS" && (
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm shadow-primary-600/20 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              New Request
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Clock className="mx-auto h-16 w-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No records found</h3>
              <p className="text-gray-500 mt-1">
                {activeTab === "ASSIGNED"
                  ? "You don't have any assigned overtime tasks."
                  : "You haven't submitted any overtime requests yet."}
              </p>
            </div>
          ) : (
            records.map(record => (
              <div key={record.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 transition-all hover:shadow-md flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(record.status)}
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${record.type === 'NIGHT' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                      {record.type === 'NIGHT' ? <Moon size={10} /> : <Sun size={10} />}
                      {record.type}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                    {record.hours && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        <Clock size={12} />
                        {record.hours} Hours
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">{record.task}</h3>
                    {activeTab === "ASSIGNED" && (
                      <p className="text-xs text-primary-600 font-medium">Assigned By: {record.managerName || "Manager"}</p>
                    )}
                  </div>

                  {record.details && <p className="text-gray-600 text-sm line-clamp-2">{record.details}</p>}

                  {record.workSummary && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm mt-3">
                      <span className="font-semibold text-gray-700 text-xs uppercase tracking-wide">My Summary</span>
                      <p className="mt-1 text-gray-600">{record.workSummary}</p>
                    </div>
                  )}

                  {record.rejectionReason && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm mt-3 text-red-700">
                      <span className="font-semibold">Rejection Reason:</span> {record.rejectionReason}
                    </div>
                  )}
                </div>

                {activeTab === "ASSIGNED" && (
                  <div>
                    {(record.status === 'ASSIGNED' || record.status === 'PENDING') && (
                      <button
                        onClick={() => openCompleteModal(record)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm shadow-primary-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <CheckCircle size={18} />
                        Complete Task
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={totalPages * 10}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Completion Modal */}
        {isCompleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            {/* ... reuse existing modal structure ... */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Complete Overtime</h3>
                <button onClick={() => setIsCompleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Summary</label>
                  <textarea
                    required
                    rows="4"
                    value={workSummary}
                    onChange={e => setWorkSummary(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none"
                    placeholder="Describe what you accomplished..."
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCompleteModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-md shadow-primary-600/20 transition-all disabled:opacity-70"
                  >
                    {submitting ? "Submitting..." : "Submit Completion"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Request Modal */}
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Request Overtime</h3>
                <button onClick={() => setIsRequestModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      value={requestForm.date}
                      onChange={e => setRequestForm({ ...requestForm, date: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={requestForm.hours}
                      onChange={e => setRequestForm({ ...requestForm, hours: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                      placeholder="e.g. 2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
                  <input
                    type="text"
                    required
                    value={requestForm.reason}
                    onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                    placeholder="Brief reason for overtime"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Details</label>
                  <textarea
                    rows="3"
                    value={requestForm.details}
                    onChange={e => setRequestForm({ ...requestForm, details: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none"
                    placeholder="Describe specific tasks..."
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-md shadow-primary-600/20 transition-all disabled:opacity-70"
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
