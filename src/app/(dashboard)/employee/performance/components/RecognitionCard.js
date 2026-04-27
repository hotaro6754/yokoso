"use client";

import React from "react";

export default function RecognitionCard({ recognitions }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recognition</h3>
      {recognitions && recognitions.length > 0 ? (
        <ul className="space-y-2">
          {recognitions.map((rec, index) => (
            <li key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm">
              <span className="text-gray-800 dark:text-gray-100">{rec.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-300">No recognition yet.</p>
      )}
    </div>
  );
}
