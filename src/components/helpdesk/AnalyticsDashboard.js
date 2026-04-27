"use client";

import React from "react";
import { 
  BarChart3, PieChart, TrendingUp, AlertCircle, 
  CheckCircle2, Clock, Users 
} from "lucide-react";

export default function AnalyticsDashboard({ stats }) {
  if (!stats) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="SLA Quality Index" 
          value={`${stats.slaQuality}%`} 
          sub="Percentage of in-SLA resolutions"
          icon={<TrendingUp className="text-emerald-500" />} 
          trend="+2.4%"
        />
        <StatCard 
          label="Total Volume" 
          value={stats.totalTickets} 
          sub="Total tickets raised this period"
          icon={<BarChart3 className="text-blue-500" />} 
        />
        <StatCard 
          label="SLA Breaches" 
          value={stats.breachedTickets} 
          sub="Critical breaches needing attention"
          icon={<AlertCircle className="text-red-500" />} 
          color="text-red-600"
        />
        <StatCard 
          label="Resolved Tickets" 
          value={stats.closedTickets} 
          sub="Total tickets closed successfully"
          icon={<CheckCircle2 className="text-indigo-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dept Metrics */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Users className="text-primary" size={20} /> Department Distribution
          </h3>
          <div className="space-y-6">
            {Object.entries(stats.deptMetrics).map(([dept, data]) => (
              <div key={dept} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-700 dark:text-gray-300">{dept}</span>
                  <span className="text-gray-500">{data.closed} / {data.raised} Resolved</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(data.closed / data.raised) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heat Map / Breaches */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} /> Breach Heat Map (By Category)
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(stats.breachHeatMap).length > 0 ? Object.entries(stats.breachHeatMap).map(([cat, count]) => (
              <div key={cat} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800 flex justify-between items-center">
                <span className="text-sm font-bold text-red-700 dark:text-red-400">{cat}</span>
                <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">{count} Breaches</span>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-400 italic">No SLA breaches recorded. Great job!</div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Clock className="text-amber-500" size={20} /> Average Resolution Time (ART) per Agent
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.artPerAgent.map((agent, idx) => (
            <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
               <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-xl font-bold text-primary shadow-sm">
                 {agent.agentName.charAt(0)}
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-900 dark:text-white">{agent.agentName}</p>
                 <p className="text-2xl font-black text-primary mt-1">{agent.averageResolutionTime}<span className="text-xs text-gray-400 font-bold ml-1">hrs</span></p>
               </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function StatCard({ label, value, sub, icon, trend, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">{label}</p>
        <h4 className={`text-3xl font-black mt-1 ${color || 'text-gray-900 dark:text-white'}`}>{value}</h4>
        <p className="text-[10px] text-gray-400 mt-2 font-medium">{sub}</p>
      </div>
    </div>
  );
}
