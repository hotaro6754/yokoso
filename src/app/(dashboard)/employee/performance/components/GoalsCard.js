"use client";

import React from "react";

export default function GoalsCard({ goals }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Goals</h3>
      {goals && goals.length > 0 ? (
        <ul className="space-y-2">
          {goals.map((goal, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm">
              <span className="text-gray-800 dark:text-gray-100">{goal.name}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{goal.progress}%</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-300">No goals assigned yet.</p>
      )}
    </div>
  );
}
