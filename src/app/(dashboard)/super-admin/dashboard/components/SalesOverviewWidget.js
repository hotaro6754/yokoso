"use client";
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function SalesOverviewWidget() {
  const [tab, setTab] = useState("income");

  const data = [
    { month: "Jan", income: 28, expenses: 18 },
    { month: "Feb", income: 24, expenses: 14 },
    { month: "Mar", income: 32, expenses: 22 },
    { month: "Apr", income: 55, expenses: 28 },
    { month: "May", income: 60, expenses: 30 },
    { month: "Jun", income: 70, expenses: 34 },
    { month: "Jul", income: 62, expenses: 29 },
    { month: "Aug", income: 58, expenses: 26 },
    { month: "Sep", income: 66, expenses: 31 },
    { month: "Oct", income: 72, expenses: 33 },
    { month: "Nov", income: 40, expenses: 20 },
    { month: "Dec", income: 68, expenses: 32 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Sales Overview
        </h5>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            All Departments
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTab("income")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md border ${
              tab === "income"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setTab("expenses")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md border ${
              tab === "expenses"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            Expenses
          </button>
          <div className="ml-auto text-xs text-gray-500 dark:text-gray-300">
            Last updated at 11:30PM
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              {tab === "income" ? (
                <Bar dataKey="income" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              ) : (
                <Bar dataKey="expenses" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

