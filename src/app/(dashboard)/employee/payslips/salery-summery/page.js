"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  ArrowDownToLine,
  Banknote,
  CalendarDays,
  CreditCard,
  LineChart,
  PiggyBank,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export default function SalarySummaryPage() {
  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Payslips", href: "/employee/payslips" },
    { label: "Salary Summary", href: "/employee/payslips/salery-summery" },
  ];

  const [payrollData] = useState({
    salarySummary: {
      grossPay: "₹6,350.00",
      deductions: "₹1,350.00",
      netPay: "₹5,000.00",
    },
    paymentDate: "July 30, 2024",
    breakdown: {
      earnings: [
        { label: "Basic Salary", value: "₹4,200.00" },
        { label: "HRA", value: "₹1,300.00" },
        { label: "Conveyance", value: "₹200.00" },
        { label: "Medical Allowance", value: "₹150.00" },
        { label: "Performance Bonus", value: "₹500.00", highlight: true },
      ],
      deductions: [
        { label: "PF", value: "₹650.00" },
        { label: "Professional Tax", value: "₹200.00" },
        { label: "Income Tax", value: "₹420.00" },
        { label: "Health Insurance", value: "₹80.00" },
      ],
    },
    paymentMethod: {
      type: "Direct Deposit",
      account: "**** **** **** 4567",
    },
    ytd: {
      earnings: "₹57,150.00",
      taxes: "₹11,340.00",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Summary</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View your detailed salary breakdown</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium">
              <CalendarDays className="w-4 h-4" />
              July 2024
            </span>
            <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
              <ArrowDownToLine className="w-4 h-4" />
              Download Payslip
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gross Pay */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                +2.5%
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gross Pay</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{payrollData.salarySummary.grossPay}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">From last month</p>
          </div>

          {/* Deductions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Deductions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{payrollData.salarySummary.deductions}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-1 rounded">Tax: ₹420</span>
              <span className="text-xs bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-1 rounded">PF: ₹230</span>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Paid
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Pay</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{payrollData.salarySummary.netPay}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Paid on {payrollData.paymentDate}</p>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              Earnings
            </h3>
            <div className="space-y-3">
              {payrollData.breakdown.earnings.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span
                    className={`text-sm font-medium ${
                      item.highlight
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-primary-200 dark:border-gray-700 mt-4 pt-4 flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>Total Earnings</span>
              <span>{payrollData.salarySummary.grossPay}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Deductions
            </h3>
            <div className="space-y-3">
              {payrollData.breakdown.deductions.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>Total Deductions</span>
              <span>{payrollData.salarySummary.deductions}</span>
            </div>
            <div className="border-t border-primary-200 dark:border-primary-700 mt-3 pt-3 flex justify-between font-bold text-primary-600 dark:text-primary-400">
              <span>Net Pay</span>
              <span>{payrollData.salarySummary.netPay}</span>
            </div>
          </div>
        </div>

        {/* Payment & YTD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
            <h4 className="text-md font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-4">
              <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Payment Method
            </h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{payrollData.paymentMethod.type}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{payrollData.paymentMethod.account}</p>
              </div>
            </div>
          </div>

          {/* YTD Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
            <h4 className="text-md font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-4">
              <LineChart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Year-to-Date Summary
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="font-semibold text-gray-900 dark:text-white">{payrollData.ytd.earnings}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Taxes Paid</p>
                <p className="font-semibold text-gray-900 dark:text-white">{payrollData.ytd.taxes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
