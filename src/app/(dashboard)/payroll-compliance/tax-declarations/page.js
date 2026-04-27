"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  Download,
  MoreVertical,
  Check,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import investmentDeclarationService from "@/services/investment-declaration.service";
import ReviewDeclarationModal from "./components/ReviewDeclarationModal";

export default function AdminTaxDeclarationsPage() {
  const [loading, setLoading] = useState(false);
  const [declarations, setDeclarations] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "ALL",
    month: "ALL"
  });
  
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    fetchDeclarations();
  }, [filters]);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      const resp = await investmentDeclarationService.getAllDeclarations(filters);
      setDeclarations(resp.declarations);
      setPagination(resp.pagination);
    } catch (err) {
      toast.error("Failed to load declarations");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await investmentDeclarationService.updateStatus(id, { status });
      toast.success(`Declaration ${status.toLowerCase()}ed`);
      fetchDeclarations();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const openReview = (decl) => {
    setSelectedDeclaration(decl);
    setIsReviewModalOpen(true);
  };

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Tax Declarations</h1>
          <p className="text-gray-500 mt-1">Review and manage investment declarations from your workforce.</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by Employee Name or ID..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select 
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending Review</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select 
          value={filters.month}
          onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value, page: 1 }))}
          className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 outline-none"
        >
          <option value="ALL">All Months</option>
          {["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Declarations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">FY / Month</th>
              <th className="px-6 py-4">HRA Rent</th>
              <th className="px-6 py-4">Sec 80C Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading declarations...</td></tr>
            ) : declarations.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No declarations found for the selected filters.</td></tr>
            ) : declarations.map((decl) => {
              const sec80CTotal = Object.values(decl.section80C || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
              
              return (
                <tr key={decl.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                        {decl.employee.firstName[0]}{decl.employee.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{decl.employee.firstName} {decl.employee.lastName}</p>
                        <p className="text-xs text-gray-500 font-medium">{decl.employee.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{decl.month}</p>
                    <p className="text-xs text-gray-500">{decl.financialYear}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">₹{(decl.hraRentPaid || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">₹{sec80CTotal.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      decl.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700' :
                      decl.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                      decl.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {decl.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openReview(decl)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="Review Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(decl.id, 'APPROVED')}
                        disabled={decl.status === 'APPROVED' || decl.status === 'REJECTED'}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Quick Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                         onClick={() => handleStatusUpdate(decl.id, 'REJECTED')}
                         disabled={decl.status === 'APPROVED' || decl.status === 'REJECTED'}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Quick Reject"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ReviewDeclarationModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        declaration={selectedDeclaration}
        onRefresh={fetchDeclarations}
      />
    </div>
  );
}
