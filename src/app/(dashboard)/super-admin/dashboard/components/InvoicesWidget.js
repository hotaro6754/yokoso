"use client";
import React, { useState } from "react";

export default function InvoicesWidget() {
  const [period, setPeriod] = useState("This Week");

  const invoices = [
    { id: "INV0002", title: "Redesign Website", client: "Logistics", amount: "$3560", status: "Unpaid" },
    { id: "INV0005", title: "Module Completion", client: "Yip Corp", amount: "$4175", status: "Unpaid" },
    { id: "INV0003", title: "Change on Emp Module", client: "GHR", amount: "$6985", status: "Unpaid" },
    { id: "INV0004", title: "Changes on the Board", client: "LLP", amount: "$1457", status: "Paid" },
    { id: "INV0006", title: "Hospital Management", client: "HCL Corp", amount: "$6458", status: "Paid" },
  ];

  const badge = (s) =>
    s === "Paid"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full h-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Invoices
        </h5>
        <button
          onClick={() => setPeriod((p) => (p === "This Week" ? "This Month" : "This Week"))}
          className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          {period}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {inv.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {inv.id} • {inv.client}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-gray-900 dark:text-white">{inv.amount}</div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge(inv.status)}`}>
                {inv.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <button className="w-full px-3 py-2 text-xs font-semibold rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
          View All
        </button>
      </div>
    </div>
  );
}

