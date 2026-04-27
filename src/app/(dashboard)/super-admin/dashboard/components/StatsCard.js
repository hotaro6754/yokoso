import React from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatsCard({
  title,
  value,
  comparison,
  trend,
  icon,
  iconBgColor = "bg-blue-600",
  href,
}) {
  const trendMeta =
    trend === "up"
      ? { Icon: TrendingUp, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : trend === "down"
      ? { Icon: TrendingDown, cls: "bg-rose-50 text-rose-700 border-rose-200" }
      : { Icon: Minus, cls: "bg-gray-50 text-gray-700 border-gray-200" };

  return (
    <div className="group flex flex-col h-full bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-3 sm:p-3 md:p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col justify-between h-full min-h-[112px] md:min-h-[120px]">
        <div className="flex items-start justify-between mb-2.5">
          <div className={`rounded-xl p-2.5 sm:p-3 ${iconBgColor} shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <div className="text-white">{icon}</div>
          </div>
        </div>

        <div className="mb-2 flex-1">
          <h6 className="text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
          </h6>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
            {value}
          </h3>
        </div>

        {/* Footer: keep single-line layout so cards stay same height */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
          {comparison ? (
            <div className="flex items-center">
              <span className={`max-w-[160px] text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border ${trendMeta.cls}`}>
                <trendMeta.Icon className="h-3.5 w-3.5" />
                <span className="truncate">{comparison}</span>
              </span>
            </div>
          ) : (
            <span />
          )}

          {href ? (
            <Link
              href={href}
              className="ml-auto whitespace-nowrap text-right text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-xs inline-flex items-center justify-end gap-1 group/link transition-colors"
            >
              View Details
              <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

