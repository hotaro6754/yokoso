"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Loader2, Lock, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function PayrollSummaryWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/finance-role/payroll-cost/summary");
        setData(response.data?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load payroll summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 h-full flex items-center justify-center premium-shadow"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </motion.div>
    );
  }
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 h-full flex items-center justify-center premium-shadow"
      >
        <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 h-full flex items-center justify-center premium-shadow"
      >
        <p className="text-sm text-muted-foreground">No payroll data available</p>
      </motion.div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const previousMonth = data.previousMonth || 0;
  const costChange = previousMonth
    ? ((data.totalPayrollCost - previousMonth) / previousMonth) * 100
    : 0;
  const isIncrease = costChange > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 premium-shadow relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-primary/10"></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-6 relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-md border border-primary/10"
          >
            <DollarSign className="w-6 h-6" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Payroll Summary</h3>
            <p className="text-sm text-muted-foreground">Read-only overview for {data.period}</p>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border"
        >
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Read Only</span>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Total Payroll Cost */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">Total Payroll Cost</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                isIncrease ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
              }`}
            >
              {isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isIncrease ? '+' : ''}{costChange.toFixed(1)}%
            </motion.div>
          </div>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-2xl font-extrabold text-foreground"
          >
            {formatCurrency(data.totalPayrollCost)}
          </motion.p>
        </motion.div>

        {/* Total Earnings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20"
        >
          <p className="text-xs font-semibold text-muted-foreground mb-2">Total Earnings</p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="text-2xl font-extrabold text-success"
          >
            {formatCurrency(data.totalEarnings)}
          </motion.p>
        </motion.div>

        {/* Total Deductions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20"
        >
          <p className="text-xs font-semibold text-muted-foreground mb-2">Total Deductions</p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="text-2xl font-extrabold text-destructive"
          >
            {formatCurrency(data.totalDeductions)}
          </motion.p>
        </motion.div>

        {/* Net Payout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20"
        >
          <p className="text-xs font-semibold text-muted-foreground mb-2">Net Payout</p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="text-2xl font-extrabold text-accent"
          >
            {formatCurrency(data.netPayout)}
          </motion.p>
        </motion.div>
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 pt-6 border-t border-border flex items-center justify-between"
      >
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Employees</p>
            <p className="text-lg font-bold text-foreground">{data.employeeCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pay Period</p>
            <p className="text-lg font-bold text-foreground">{data.period}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 text-success text-xs font-bold border border-success/30"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            Ready for Review
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
