"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Download, Filter, Calendar, DollarSign, FileText, TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([
    { date: "Aug 28, 2025", method: "Bank Transfer", amount: 2500, status: "Completed" },
    { date: "Jul 28, 2025", method: "UPI", amount: 2450, status: "Completed" },
    { date: "Jun 28, 2025", method: "Bank Transfer", amount: 2490, status: "Pending" },
    { date: "May 28, 2025", method: "Cheque", amount: 2510, status: "Failed" },
  ]);

  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Payslips", href: "/employee/payslips" },
    { label: "Payment History", href: "/employee/payslips/payment-history" },
  ];

  const totalPaid = payments
    .filter(p => p.status === "Completed")
    .reduce((acc, p) => acc + p.amount, 0);
  const avgPayment = payments.length ? (totalPaid / payments.filter(p => p.status === "Completed").length).toFixed(2) : 0;

  const handleExport = () => alert("Exporting payment history...");
  const handleFilter = () => alert("Filter payments (dummy action)");

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "Failed":
        return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track all your payment transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFilter}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalPaid.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Payment</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{avgPayment}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-primary-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Recent Transactions
            </h4>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <div
                  key={index}
                  className="px-6 py-4 flex items-center justify-between hover:bg-primary-50/30 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{payment.date}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{payment.method}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Net pay</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No payment history found</p>
              </div>
            )}
          </div>
        </div>

        {/* View All */}
        {payments.length > 0 && (
          <div className="flex justify-center">
            <button className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              View All Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
