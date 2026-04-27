"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, DollarSign, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ExpenseStatsCards({ refreshKey = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/hr-management/expense-reimbursements/stats");
        setData(response.data?.data || null);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load reimbursement stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card flex h-full items-center justify-center rounded-xl p-4 premium-shadow">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  const safeData = data || {
    pending: 0,
    totalPendingAmount: 0,
    approved: 0,
    totalApprovedAmount: 0,
    rejected: 0,
    totalRejectedAmount: 0,
    paid: 0,
    totalPaidAmount: 0,
  };

  const stats = [
    {
      label: "Pending Approvals",
      value: safeData.pending,
      amount: safeData.totalPendingAmount,
      icon: Clock,
      color: "warning",
      bgGradient: "from-warning/20 to-warning/5",
      borderColor: "border-warning/20",
      textColor: "text-warning",
    },
    {
      label: "Approved",
      value: safeData.approved,
      amount: safeData.totalApprovedAmount,
      icon: CheckCircle2,
      color: "success",
      bgGradient: "from-success/20 to-success/5",
      borderColor: "border-success/20",
      textColor: "text-success",
    },
    {
      label: "Rejected",
      value: safeData.rejected,
      amount: safeData.totalRejectedAmount,
      icon: XCircle,
      color: "destructive",
      bgGradient: "from-destructive/20 to-destructive/5",
      borderColor: "border-destructive/20",
      textColor: "text-destructive",
    },
    {
      label: "Paid",
      value: safeData.paid,
      amount: safeData.totalPaidAmount,
      icon: DollarSign,
      color: "primary",
      bgGradient: "from-primary/20 to-primary/5",
      borderColor: "border-primary/20",
      textColor: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -3 }}
            className={`glass-card glass-card-hover relative overflow-hidden rounded-xl border p-4 premium-shadow premium-shadow-hover group ${stat.borderColor}`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:opacity-75`}></div>

            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`rounded-lg border bg-gradient-to-br p-2.5 shadow-md ${stat.bgGradient} ${stat.textColor} ${stat.borderColor}`}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                <motion.p
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                  className={`text-2xl font-extrabold ${stat.textColor}`}
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs font-bold text-foreground">
                  {formatCurrency(stat.amount)}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
