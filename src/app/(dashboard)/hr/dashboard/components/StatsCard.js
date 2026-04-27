import React from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  comparison,
  trend,
  icon,
  iconBgColor,
  href
}) => {
  // Professional color palette with green-teal as primary
  const gradientMap = {
    "bg-brand-500": "bg-gradient-to-br from-brand-500 to-brand-600 shadow-brand-500/30",
    "bg-brand-400": "bg-gradient-to-br from-brand-400 to-brand-500 shadow-brand-400/30",
    "bg-accent-500": "bg-gradient-to-br from-accent-500 to-accent-600 shadow-accent-500/30",
    "bg-indigo-500": "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30",
    "bg-amber-500": "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/30",
    "bg-rose-500": "bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/30",
    "bg-violet-500": "bg-gradient-to-br from-violet-500 to-violet-600 shadow-violet-500/30",
    "bg-emerald-500": "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30",
    "bg-slate-600": "bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-600/30",
    // Legacy support
    "bg-blue-500": "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30",
    "bg-gray-600": "bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-600/30",
    "bg-blue-400": "bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-400/30",
    "bg-pink-500": "bg-gradient-to-br from-pink-500 to-pink-600 shadow-pink-500/30",
    "bg-purple-500": "bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30",
    "bg-red-500": "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30",
    "bg-green-500": "bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/30",
    "bg-gray-800": "bg-gradient-to-br from-gray-800 to-gray-900 shadow-gray-800/30"
  };

  // Get the gradient class or use the original if not in map
  const gradientClass = gradientMap[iconBgColor] || iconBgColor;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-5 hover:shadow-md hover:shadow-brand-500/5 hover:-translate-y-0.5 hover:border-brand-200 dark:hover:border-brand-500/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Icon Side */}
        <div className={`rounded-sm p-2 ${gradientClass} shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>

        {/* Text Side */}
        <div className="flex-1 min-w-0 text-right ml-2">
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="flex items-baseline justify-end gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {value}
            </h3>
          </div>
        </div>
      </div>

      {/* Footer Side - Comparisons & Link */}
      <div className="mt-2 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        {comparison ? (
          <div className="flex items-center">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm ${trend === 'up'
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
              }`}>
              {trend === 'up' ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
              {comparison}
            </span>
          </div>
        ) : (
          <div></div> // Spacer if no comparison
        )}

        {href && (
          <Link
            href={href}
            className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-[10px] ml-auto flex items-center gap-1 group/link transition-colors"
          >
            View Details
            <svg
              className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};

export default StatsCard;