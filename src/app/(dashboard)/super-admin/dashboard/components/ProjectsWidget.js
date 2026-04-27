"use client";
import React, { useState } from "react";

export default function ProjectsWidget() {
  const [period, setPeriod] = useState("This Week");

  const projects = [
    { id: "PRO-001", name: "Office Management App", team: 4, hours: "15/255 Hrs", deadline: "12 Sep 2024", priority: "High", progress: 35 },
    { id: "PRO-002", name: "Clinic Management", team: 3, hours: "10/200 Hrs", deadline: "24 Oct 2024", priority: "Low", progress: 20 },
    { id: "PRO-003", name: "Educational Platform", team: 5, hours: "40/350 Hrs", deadline: "18 Feb 2024", priority: "Medium", progress: 55 },
    { id: "PRO-004", name: "Chat & Call Mobile App", team: 6, hours: "50/450 Hrs", deadline: "18 Feb 2024", priority: "High", progress: 70 },
  ];

  const priorityBadge = (p) =>
    p === "High"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : p === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Projects
        </h5>
        <button
          onClick={() => setPeriod((p) => (p === "This Week" ? "This Month" : "This Week"))}
          className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          {period}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Team</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Hours</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Deadline</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{p.id}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{p.name}</div>
                  <div className="mt-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-blue-600" style={{ width: `${p.progress}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{p.team}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{p.hours}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{p.deadline}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityBadge(p.priority)}`}>
                    {p.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

