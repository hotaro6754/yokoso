"use client";

import React from "react";

export default function TrainingCard({ trainings }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Training & Development</h3>
      {trainings && trainings.length > 0 ? (
        <ul className="space-y-2">
          {trainings.map((training, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm">
              <span className="text-gray-800 dark:text-gray-100">{training.name}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{training.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-300">No trainings available.</p>
      )}
    </div>
  );
}
