"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  CheckCircle2,
  XCircle,
  Download,
  DollarSign,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ExpenseTable({ statusFilter, setStatusFilter, onActionComplete }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/hr-management/expense-reimbursements", {
          params: {
            page: 1,
            limit: 50,
            status: statusFilter,
            search: searchQuery
          }
        });
        setData(response.data?.data || []);
      } catch (error) {
        setError(error?.response?.data?.message || "Failed to load reimbursements");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        bg: "bg-warning/10",
        text: "text-warning",
        border: "border-warning/20",
        label: "Pending",
      },
      approved: {
        icon: CheckCircle2,
        bg: "bg-success/10",
        text: "text-success",
        border: "border-success/20",
        label: "Approved",
      },
      rejected: {
        icon: XCircle,
        bg: "bg-destructive/10",
        text: "text-destructive",
        border: "border-destructive/20",
        label: "Rejected",
      },
      paid: {
        icon: DollarSign,
        bg: "bg-primary/10",
        text: "text-primary",
        border: "border-primary/20",
        label: "Paid",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const filteredData = data;

  const handleApprove = async (id) => {
    try {
      await apiClient.patch(`/hr-management/expense-reimbursements/${id}/approve`);
      toast.success("Reimbursement approved");
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status: "approved" } : item)));
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve reimbursement");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await apiClient.patch(`/hr-management/expense-reimbursements/${selectedExpense?.id}/reject`, {
        reason: rejectReason
      });
      toast.success("Reimbursement rejected");
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedExpense?.id
            ? { ...item, status: "rejected", rejectionReason: rejectReason }
            : item
        )
      );
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedExpense(null);
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject reimbursement");
    }
  };

  const openRejectModal = (expense) => {
    setSelectedExpense(expense);
    setShowRejectModal(true);
  };

  const handleMarkPaid = async (id) => {
    try {
      await apiClient.patch(`/hr-management/expense-reimbursements/${id}/paid`);
      toast.success("Reimbursement marked as paid");
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status: "paid" } : item)));
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to mark reimbursement paid");
    }
  };

  const handleDownload = (expense) => {
    if (!expense?.attachmentUrl) {
      toast.error("No receipt attached");
      return;
    }
    window.open(expense.attachmentUrl, "_blank", "noopener,noreferrer");
  };

  const filterTabs = [
    { id: "all", label: "All", count: data.length },
    {
      id: "pending",
      label: "Pending",
      count: data.filter((e) => e.status === "pending").length,
    },
    {
      id: "approved",
      label: "Approved",
      count: data.filter((e) => e.status === "approved").length,
    },
    {
      id: "rejected",
      label: "Rejected",
      count: data.filter((e) => e.status === "rejected").length,
    },
    {
      id: "paid",
      label: "Paid",
      count: data.filter((e) => e.status === "paid").length,
    },
  ];

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 premium-shadow flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 premium-shadow"
      >
        {/* Header — single row: icon+title | divider | spacer | dropdown | search */}
        <div className="flex items-center gap-3 mb-6">

          {/* Left: icon + title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-md border border-primary/10 flex-shrink-0"
            >
              <FileText className="w-5 h-5" />
            </motion.div>
            <h3 className="text-base font-bold text-foreground whitespace-nowrap">Expense Reimbursements</h3>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border flex-shrink-0" />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Status Dropdown — right side, before search */}
          <div className="relative flex-shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-lg bg-background border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              {filterTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} ({tab.count})
                </option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-52 pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 dark:bg-secondary-900/20 text-secondary-900 dark:text-secondary-100 text-xs font-bold uppercase tracking-wider border-b border-secondary-100 dark:border-secondary-800">
              <tr>
                <th className="text-left py-3 px-4 rounded-tl-lg">Employee</th>
                <th className="text-left py-3 px-4">Expense Type</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      Loading reimbursements...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No expenses found</p>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold">
                            {(expense.employeeName || "U").charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {expense.employeeName || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {expense.employeeId || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-foreground">
                          {expense.expenseType || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-foreground max-w-xs truncate">
                          {expense.description}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-bold text-foreground">
                          {formatCurrency(expense.amount)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">
                          {expense.date ? formatDate(expense.date) : "-"}
                        </p>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(expense.status)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowDetailModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {expense.status === "pending" && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleApprove(expense.id)}
                                className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openRejectModal(expense)}
                                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}
                          {expense.status === "approved" && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleMarkPaid(expense.id)}
                              className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                              title="Mark Paid"
                            >
                              <DollarSign className="w-4 h-4" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                            title="Download Receipt"
                            onClick={() => handleDownload(expense)}
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto premium-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Expense Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Employee</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedExpense.employeeName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Employee ID</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedExpense.employeeId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expense Type</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedExpense.expenseType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="text-sm font-bold text-primary">
                      {formatCurrency(selectedExpense.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedExpense.date ? formatDate(selectedExpense.date) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Department</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedExpense.department}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{selectedExpense.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Receipt</p>
                  <button
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                    onClick={() => handleDownload(selectedExpense)}
                  >
                    <Download className="w-4 h-4" />
                    {selectedExpense.receipt || "Download"}
                  </button>
                </div>
                {selectedExpense.status === "approved" && (
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-muted-foreground mb-1">Approved By</p>
                    <p className="text-sm font-semibold text-success">
                      {selectedExpense.approvedBy || "Finance"}{selectedExpense.approvedDate ? ` on ${formatDate(selectedExpense.approvedDate)}` : ""}
                    </p>
                  </div>
                )}
                {selectedExpense.status === "rejected" && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-muted-foreground mb-1">Rejected By</p>
                    <p className="text-sm font-semibold text-destructive mb-2">
                      {selectedExpense.rejectedBy || "Finance"}{selectedExpense.rejectedDate ? ` on ${formatDate(selectedExpense.rejectedDate)}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">Reason</p>
                    <p className="text-sm text-foreground">
                      {selectedExpense.rejectionReason}
                    </p>
                  </div>
                )}
                {selectedExpense.status === "paid" && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Paid By</p>
                    <p className="text-sm font-semibold text-primary">
                      {selectedExpense.paidBy || "Finance"}{selectedExpense.paidDate ? ` on ${formatDate(selectedExpense.paidDate)}` : ""}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 max-w-md w-full premium-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-destructive/20 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Reject Expense</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to reject this expense claim? Please provide a reason.
              </p>

              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-destructive resize-none"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                    setSelectedExpense(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
