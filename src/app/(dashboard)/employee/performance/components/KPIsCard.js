"use client";

import React from "react";

export default function KPIsCard({ kpis }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">KPIs</h3>
      {kpis && kpis.length > 0 ? (
        <ul className="space-y-2">
          {kpis.map((kpi, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm">
              <span className="text-gray-800 dark:text-gray-100">{kpi.name}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{kpi.value} / {kpi.target}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-300">No KPI data available.</p>
      )}
    </div>
  );
}
