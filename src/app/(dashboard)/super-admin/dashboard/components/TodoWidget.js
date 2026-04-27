"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function TodoWidget() {
  const [items, setItems] = useState([
    { id: 1, text: "Review pending workflow approvals", done: false, href: "/company-admin/workflow-management" },
    { id: 2, text: "Publish Custom Policy update (v2)", done: false, href: "/company-admin/custom-policies" },
    { id: 3, text: "Audit recent permission changes", done: false, href: "/company-admin/security-audit-logs" },
    { id: 4, text: "Update reporting hierarchy", done: false, href: "/company-admin/company-orgranization?tab=hierarchy" },
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full w-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Todo
        </h5>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          Today
        </span>
      </div>

      <div className="p-4 space-y-2">
        {items.map((t) => (
          <div key={t.id} className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <input
              type="checkbox"
              checked={t.done}
              onChange={(e) => setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: e.target.checked } : x)))}
              className="mt-1 h-4 w-4"
            />
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-medium ${t.done ? "line-through text-gray-400" : "text-gray-800 dark:text-white"}`}>
                {t.text}
              </div>
              <Link
                href={t.href}
                className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

