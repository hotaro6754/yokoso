
import React from 'react';
import Link from 'next/link';

export default function NineBoxSummaryWidget({ employees, viewMoreLink }) {
  // Filter out employees without valid performance data or box position
  const validEmployees = employees?.filter(emp =>
    emp && (
      (typeof emp.performanceScore === 'number' && emp.performanceScore > 0) ||
      (emp.boxPosition && emp.boxPosition.row)
    )
  ) || [];

  return (
    <div className="glass-premium hairline-border p-8 transition-all duration-300 hover:bg-white/[0.04]">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50 dark:border-white/10">
        <h2 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2 font-display">
          9-Box Summary Matrix
        </h2>
        {viewMoreLink && (
          <Link href={viewMoreLink} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-brand-500 flex items-center gap-1 transition-colors font-display">
            View Details
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">High Potential</div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Medium Potential</div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Low Potential</div>
        </div>

        {/* Grid */}
        <div className="space-y-2">
          {[1, 2, 3].map(row => (
            <div key={row} className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(col => {
                // Use boxPosition from API to ensure consistency with main grid page
                const count = validEmployees.filter(emp =>
                  emp.boxPosition &&
                  emp.boxPosition.row === row &&
                  emp.boxPosition.col === col
                ).length;

                let color = 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 border border-gray-100 dark:border-gray-800';
                let label = 'Empty';

                // Set color and label based on position
                if (count > 0) {
                  const positions = {
                    '1-1': { color: 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400', label: 'Stars' },
                    '1-2': { color: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400', label: 'Solid' },
                    '1-3': { color: 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400', label: 'Future' },
                    '2-1': { color: 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400', label: 'High Pot' },
                    '2-2': { color: 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-300', label: 'Core' },
                    '2-3': { color: 'bg-yellow-50 text-yellow-600 border border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400', label: 'Steady' },
                    '3-1': { color: 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400', label: 'Problem' },
                    '3-2': { color: 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400', label: 'Potential' },
                    '3-3': { color: 'bg-gray-100 text-gray-500 border border-gray-300 dark:bg-white/5 dark:border-white/10 dark:text-gray-400', label: 'Under' },
                  };

                  const position = positions[`${row}-${col}`];
                  color = position.color;
                  label = position.label;
                }

                return (
                  <div key={col} className={`p-4 rounded-sm text-center flex flex-col justify-center min-h-[80px] transition-all hover:scale-[1.02] ${color}`}>
                    <div className="text-xl font-black mb-1 leading-none tracking-tight">{count}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest">{label}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Row Labels */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">High Perf</div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Med Perf</div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Low Perf</div>
        </div>
      </div>
    </div>
  );
}
