'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Box,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Globe,
  LayoutGrid,
  MoreHorizontal,
  PieChart,
  Plug,
  Settings,
  Shield,
  ShieldAlert,
  Ticket,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { masterAdminDashboardService } from '@/services/master-admin/dashboard.service';

// --- Design System Components ---

const PageShell = ({ children }) => (
  <div className="min-h-screen bg-gray-50/40 dark:bg-transparent pb-10">
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {children}
    </div>
  </div>
);

const GlassCard = ({ children, className = '', noPadding = false }) => (
  <div
    className={`
      relative overflow-hidden
      bg-white dark:bg-gray-900 
      border border-gray-100 dark:border-gray-800
      shadow-sm hover:shadow-md transition-all duration-300
      rounded-2xl
      ${className}
    `}
  >
    <div className={noPadding ? 'h-full' : 'p-6'}>{children}</div>
  </div>
);

const SectionHeader = ({ title, action }) => (
  <div className="flex items-center justify-between px-1">
    <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
      {title}
    </h2>
    {action}
  </div>
);

const MetricCard = ({ title, value, trend, trendValue, icon: Icon, color = 'blue', subtext }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400',
  };

  return (
    <GlassCard className="flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${colors[color]} transition-colors group-hover:scale-105 duration-300`}>
            <Icon size={20} />
          </div>
          {trend && (
            <div className={`
              flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full
              ${trend === 'up'
                ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400'}
            `}>
              {trend === 'up' ? <ArrowUpRight size={14} /> : <TrendingUp size={14} className="rotate-180" />}
              {trendValue}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {value}
            </span>
          </div>
          {subtext && <p className="mt-2 text-xs text-gray-400 line-clamp-1">{subtext}</p>}
        </div>
      </div>
    </GlassCard>
  );
};

const StatusRow = ({ label, count, color = 'gray', icon: Icon }) => (
  <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
    <div className="flex items-center gap-3">
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-lg 
        ${color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
        ${color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
        ${color === 'rose' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : ''}
      `}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">{label}</div>
        <div className="text-[11px] text-gray-500 group-hover:text-gray-600 dark:text-gray-400 transition-colors">Action Required</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold text-gray-900 dark:text-white">{count}</span>
      <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors opacity-0 group-hover:opacity-100" />
    </div>
  </div>
);

const ProgressBar = ({ label, value, colorClass = 'bg-blue-500', icon: Icon }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 font-medium">
        {Icon && <Icon size={12} />}
        {label}
      </div>
      <span className="font-semibold text-gray-900 dark:text-gray-200">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default function MasterAdminDashboard() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    trialsExpiringSoon: 0,
    activeIntegrations: 0,
    integrationErrors: 0,
    openTickets: 0,
    totalEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [expiringTrials, setExpiringTrials] = useState([]);
  const [growthData, setGrowthData] = useState([]);

  const getTimeAgo = (dateRequest) => {
    const now = new Date();
    const date = new Date(dateRequest);
    const seconds = Math.floor((now - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + "y ago";
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + "mo ago";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + "d ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + "h ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + "m ago";
    return "Just now";
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API delay for smoothness
        // await new Promise(r => setTimeout(r, 600)); // Removed artificial delay

        const dashboardData = await masterAdminDashboardService.getDashboardStats().catch(() => ({}));

        const totalCompanies = dashboardData.totalCompanies || 0;
        const activeCompanies = dashboardData.activeCompanies || 0;

        setStats({
          totalCompanies: totalCompanies,
          activeCompanies: activeCompanies,
          inactiveCompanies: totalCompanies - activeCompanies,
          totalUsers: dashboardData.totalUsers || 0,
          pendingApprovals: dashboardData.pendingOnboarding || 0,
          trialsExpiringSoon: dashboardData.expiringTrials?.length || 0,
          activeIntegrations: 45, // Placeholder
          integrationErrors: 3, // Placeholder
          openTickets: 8, // Placeholder
          totalEarnings: dashboardData.totalEarnings || 0,
        });

        setAuditLogs((dashboardData.recentAuditLogs || []).map(log => ({
          id: log.id,
          action: log.action || 'System Event',
          detail: log.detail,
          user: log.user,
          time: getTimeAgo(log.createdAt),
          icon: log.action?.includes('Error') ? XCircle : (log.action?.includes('Alert') ? ShieldAlert : CheckCircle2),
          color: log.action?.includes('Error') ? 'text-rose-500' : (log.action?.includes('Alert') ? 'text-orange-500' : 'text-emerald-500'),
          bg: log.action?.includes('Error') ? 'bg-rose-500/10' : (log.action?.includes('Alert') ? 'bg-orange-500/10' : 'bg-emerald-500/10')
        })));

        setExpiringTrials(dashboardData.expiringTrials || []);
        setGrowthData(dashboardData.weeklyData || []);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/20 dark:bg-transparent flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-primary-600 animate-ping opacity-20 absolute inset-0" />
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30 text-white">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <PageShell>
      {/* 1. Top Navigation / Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, here's what's happening today.</p>
        </div>

      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${(stats.totalEarnings / 1000).toFixed(0)}k`}
          trend="up"
          trendValue="12.5%"
          icon={CreditCard}
          color="emerald"
          subtext="Monthly Recurring Revenue"
        />
        <MetricCard
          title="Total Companies"
          value={stats.totalCompanies}
          trend="up"
          trendValue="8.2%"
          icon={Building2}
          color="blue"
          subtext={`${stats.activeCompanies} Active, ${stats.inactiveCompanies} Inactive`}
        />
        <MetricCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend="up"
          trendValue="24%"
          icon={Users}
          color="indigo"
          subtext="Across all platforms"
        />
        <MetricCard
          title="Integrations"
          value={stats.activeIntegrations}
          trend="down"
          trendValue="1.2%"
          icon={Plug}
          color="purple"
          subtext={`${stats.integrationErrors} Sync Errors Detected`}
        />
      </div>

      <div className="space-y-6">
        {/* Row 2: Operational Attention & Platform Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Operational Attention */}
          <div className="lg:col-span-1">
            <GlassCard className="h-full">
              <SectionHeader
                title="Operational Attention"
                action={<div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />}
              />
              <div className="space-y-3 mt-6">
                <StatusRow
                  label="Pending Approvals"
                  count={stats.pendingApprovals}
                  icon={Box}
                  color="orange"
                />
                <StatusRow
                  label="Support Tickets"
                  count={stats.openTickets}
                  icon={Ticket}
                  color="rose"
                />
                <StatusRow
                  label="Expiring Trials"
                  count={stats.trialsExpiringSoon}
                  icon={Clock}
                  color="blue"
                />
              </div>
            </GlassCard>
          </div>

          {/* Platform Growth */}
          <div className="lg:col-span-2">
            <GlassCard className="h-full">
              <SectionHeader
                title="Platform Growth"
                action={
                  <select className="bg-transparent text-xs font-semibold text-gray-500 outline-none cursor-pointer">
                    <option>Last 30 Days</option>
                  </select>
                }
              />
              <div className="h-[240px] w-full mt-4 relative group">
                {growthData.length > 1 ? (
                  (() => {
                    const maxVal = Math.max(...growthData, 5);
                    const ticks = [maxVal, Math.round(maxVal / 2), 0];
                    
                    const dataPoints = growthData.map((val, i) => ({
                      x: (i / (growthData.length - 1)) * 100,
                      y: 100 - (val / maxVal) * 80 - 10, // 10% padding bottom, 10% top
                      val,
                      label: new Date(Date.now() - (growthData.length - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }));
                    
                    const polylinePoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
                    const areaPath = `M0,100 ${dataPoints.map(p => `L${p.x},${p.y}`).join(' ')} L100,100 Z`;

                    return (
                      <div className="flex h-full w-full">
                        {/* Y-Axis Labels */}
                        <div className="flex flex-col justify-between text-[10px] text-gray-400 font-medium py-2 pr-2 h-full w-8 shrink-0 select-none">
                            <span>{ticks[0]}</span>
                            <span>{ticks[1]}</span>
                            <span>{ticks[2]}</span>
                        </div>
                        
                        {/* Chart Area */}
                        <div className="relative flex-1 h-full">
                          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className="text-primary-500" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary-500" />
                              </linearGradient>
                            </defs>
                            
                            {/* Grid Lines */}
                            <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                            <line x1="0" y1="90" x2="100" y2="90" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

                            <path d={areaPath} fill="url(#growthGradient)" />
                            <polyline
                              points={polylinePoints}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                              className="text-primary-500"
                            />
                          </svg>
                          
                          {/* Interactive Points & Labels Overlay */}
                          <div className="absolute inset-0 flex justify-between items-end pb-6 pointer-events-none">
                             {dataPoints.map((p, i) => (
                               <div key={i} className="relative flex flex-col items-center justify-end h-full" style={{ width: '1px' }}>
                                  {/* Label at bottom - Show every 5th label + last one */}
                                  {(i % 5 === 0 || i === dataPoints.length - 1) && (
                                    <div className="absolute bottom-[-24px] text-[10px] text-gray-400 font-medium transform -translate-x-1/2 whitespace-nowrap">
                                      {p.label}
                                    </div>
                                  )}
                                  
                                  {/* Point on line (Invisible unless hovered) */}
                                <div 
                                  className="absolute w-4 h-4 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/point transition-all"
                                  style={{ top: `${p.y}%`, left: '50%' }}
                                >
                                  {/* Visible dot on hover */}
                                  <div className="w-2 h-2 bg-white border-2 border-primary-500 rounded-full shadow-sm opacity-0 group-hover/point:opacity-100 transition-opacity" />

                                  {/* Tooltip */}
                                  <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/point:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                    {p.val} Companies
                                  </div>
                                </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No growth data available</div>
                )}
              </div>
              <div className="h-4"></div> {/* Spacer for negative margin labels */}
            </GlassCard>
          </div>
        </div>

        {/* Row 3: Recent Audit Logs & Expiring Trials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Logs */}
          {/* Audit Logs */}
          <GlassCard noPadding className="h-[375px]">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <SectionHeader title="Recent Audit Logs" />
              </div>
              <div className="flex-1 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                    <div className={`mt-0.5 p-2 rounded-full ${log.bg} ${log.color} shrink-0`}>
                      <log.icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{log.action}</p>
                      <p className="text-xs text-gray-500 truncate">{log.detail}</p>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap">
                      {log.time}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
                <Link href="/master-admin/audit-logs" className="text-xs font-bold text-primary-600 hover:text-primary-700">View All Logs</Link>
              </div>
            </div>
          </GlassCard>

          {/* Expiring Trials */}
          <GlassCard noPadding className="h-[375px]">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <SectionHeader title="Expiring Trials" />
              </div>
              <div className="flex-1 overflow-y-auto">
              {expiringTrials.length > 0 ? (
                expiringTrials.map((trial) => (
                  <div key={trial.id} className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 flex items-center justify-center text-xs font-bold">
                        {trial.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{trial.name}</p>
                        <p className="text-[10px] font-medium text-rose-500">Expiring in {trial.daysLeft} days</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">No trials expiring soon</div>
              )}
            </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
                <Link href="/master-admin/company" className="text-xs font-bold text-primary-600 hover:text-primary-700">All Trials</Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}