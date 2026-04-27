"use client";

import { useState, useMemo } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Search, MessageSquare, User, X, ThumbsUp, MessageCircle, AlertCircle } from "lucide-react";

// --- Hardcoded Feedback Data
const initialFeedback = [
  { id: 1, from: "Manager", comment: "Excellent work on Project A. Keep up the great effort!", type: "Positive" },
  { id: 2, from: "Peer", comment: "Great collaboration in team tasks. Very reliable and proactive.", type: "Positive" },
  { id: 3, from: "Manager", comment: "Timely updates on documentation and reports are appreciated.", type: "Neutral" },
  { id: 4, from: "Peer", comment: "Strong communication skills and attention to detail.", type: "Positive" },
  { id: 5, from: "Manager", comment: "Exceeded expectations in handling customer tickets efficiently.", type: "Positive" },
  { id: 6, from: "Manager", comment: "Needs improvement in time management.", type: "Improvement" },
];

// --- Filters Component
function FeedbackFilters({ searchQuery, setSearchQuery, onClearFilters }) {
  const hasActiveFilters = searchQuery !== "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        {hasActiveFilters && (
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            onClick={onClearFilters}
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// --- Single Feedback Card
function FeedbackCard({ feedback, delay = 0 }) {
  const typeColors = {
    Positive: {
      border: "border-l-green-500",
      bg: "bg-green-50 dark:bg-green-500/10",
      text: "text-green-700 dark:text-green-400",
      badge: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      icon: ThumbsUp,
    },
    Neutral: {
      border: "border-l-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-500/10",
      text: "text-yellow-700 dark:text-yellow-400",
      badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      icon: MessageCircle,
    },
    Improvement: {
      border: "border-l-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
      text: "text-red-700 dark:text-red-400",
      badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
      icon: AlertCircle,
    },
  };

  const colors = typeColors[feedback.type] || typeColors.Neutral;
  const Icon = colors.icon;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 ${colors.border} border-r border-t border-b border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              {feedback.from}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
          {feedback.type}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feedback.comment}</p>
    </div>
  );
}

// --- Main Feedback Page
export default function FeedbackPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Performance", href: "/employee/performance" },
    { label: "Feedback", href: "/employee/performance/feedback" },
  ];

  const filteredFeedback = useMemo(
    () =>
      initialFeedback.filter(
        (f) =>
          f.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.type.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const stats = {
    total: initialFeedback.length,
    positive: initialFeedback.filter(f => f.type === "Positive").length,
    neutral: initialFeedback.filter(f => f.type === "Neutral").length,
    improvement: initialFeedback.filter(f => f.type === "Improvement").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Positive</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.positive}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Neutral</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.neutral}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Improvement</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.improvement}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <FeedbackFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClearFilters={() => setSearchQuery("")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((f, index) => (
              <FeedbackCard key={f.id} feedback={f} delay={index * 100} />
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No feedback found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
