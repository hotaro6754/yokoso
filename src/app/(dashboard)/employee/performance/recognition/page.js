"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Award, Star, Crown, Trophy, Sparkles, Calendar } from "lucide-react";

/**
 * RecognitionItem
 * Certificate-style card with built-in stagger animation
 */
function RecognitionItem({ recognition, index = 0 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // stagger appearance by index
    const t = setTimeout(() => setVisible(true), index * 150);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-500/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col items-center text-center ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      aria-live="polite"
    >
      {/* Decorative crown */}
      <div className="absolute -top-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full p-2 shadow-lg">
        <Crown className="w-5 h-5 text-white" />
      </div>

      {/* Award icon */}
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20 mb-4 mt-2">
        <Award className="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {recognition.name}
      </h3>

      {/* Subtitle */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Star className="w-4 h-4 text-primary-500" />
        <span>Recognition of Excellence</span>
      </div>

      {/* Date if available */}
      {recognition.date && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 dark:text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>{recognition.date}</span>
        </div>
      )}
    </div>
  );
}

/**
 * RecognitionPage
 */
export default function RecognitionPage() {
  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Performance", href: "/employee/performance" },
    { label: "Recognition", href: "/employee/performance/recognition" },
  ];

  const [recognitions] = useState([
    { id: 1, name: "Employee of the Month - August", date: "August 2025" },
    { id: 2, name: "Best Team Player Award", date: "July 2025" },
    { id: 3, name: "Top Innovator Award", date: "June 2025" },
    { id: 4, name: "Leadership Excellence Award", date: "May 2025" },
  ]);

  const stats = {
    total: recognitions.length,
    thisYear: recognitions.filter(r => r.date?.includes("2025")).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recognition & Awards</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your achievements and recognitions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Awards</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Year</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.thisYear}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recognition Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recognitions.length > 0 ? (
            recognitions.map((rec, i) => (
              <RecognitionItem key={rec.id} recognition={rec} index={i} />
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-12 text-center">
              <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No recognitions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
