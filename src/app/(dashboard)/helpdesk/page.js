"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import helpdeskService from "@/services/helpdesk.service";
import HRMSLoader from "@/components/common/HRMSLoader";
import {
  Plus, MessageSquare, Clock, AlertCircle,
  CheckCircle2, BarChart3, LayoutList, Download
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import TicketList from "@/components/helpdesk/TicketList";
import AnalyticsDashboard from "@/components/helpdesk/AnalyticsDashboard";
import Breadcrumb from "@/components/common/Breadcrumb";
import { usePathname, useSearchParams } from "next/navigation";

export default function HelpdeskPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, new, in-progress, resolved
  const [viewMode, setViewMode] = useState("list"); // list, analytics

  const rawRole = user?.systemRole || user?.role || 'EMPLOYEE';
  const normalizedRole = String(rawRole).toUpperCase().replace(/[\s-]+/g, "_");
  const isAgentOrAdmin = [
    'HR_ADMIN',
    'HR',
    'IT_ADMIN',
    'FINANCE_ADMIN',
    'COMPANY_ADMIN',
    'SUPER_ADMIN',
    'MANAGER',
    'DEPT_HEAD',
    'DEPARTMENT_HEAD'
  ].includes(normalizedRole);
  const payrollPrefix = pathname?.startsWith('/payroll') ? '/payroll' : '';
  const ldPrefix = pathname?.startsWith('/ld') ? '/ld' : '';
  const deptHeadPrefix = pathname?.startsWith('/dept-head') ? '/dept-head' : '';
  const financePrefix = pathname?.startsWith('/finance-role') ? '/finance-role' : '';
  const managerPrefix = pathname?.startsWith('/manager') ? '/manager' : '';
  const itAdminPrefix = pathname?.startsWith('/it-admin') ? '/it-admin' : '';
  const helpdeskBase = `${payrollPrefix || ldPrefix || deptHeadPrefix || financePrefix || managerPrefix || itAdminPrefix}/helpdesk`;
  const dashboardHref = payrollPrefix
    ? '/payroll/dashboard'
    : ldPrefix
      ? '/ld/dashboard'
      : deptHeadPrefix
        ? '/dept-head/dashboard'
        : financePrefix
          ? '/finance-role/dashboard'
          : managerPrefix
            ? '/manager/dashboard'
            : itAdminPrefix
              ? '/it-admin/dashboard'
              : '/employee/dashboard';

  const refreshKey = searchParams?.toString() || "";
  useEffect(() => {
    fetchData();
  }, [user?.id, refreshKey]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        helpdeskService.getTickets(),
        isAgentOrAdmin ? helpdeskService.getDashboardStats() : Promise.resolve(null)
      ]);
      const ticketsList = Array.isArray(ticketsRes) ? ticketsRes : ticketsRes?.data || [];
      setTickets(ticketsList);
      if (statsRes) setStats(statsRes.data ?? statsRes);
    } catch (error) {
      console.error("Failed to fetch helpdesk data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.loading("Preparing export...");
      const blob = await helpdeskService.exportTickets();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `helpdesk-tickets-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.dismiss();
      toast.success("Export successful");
    } catch (error) {
      console.error("Export failed", error);
      toast.dismiss();
      toast.error("Export failed");
    }
  };

  if (isLoading) return <HRMSLoader text="Loading Tickets..." variant="fullscreen" />;

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,90%,28%)] [--color-primary-hover:hsl(238,90%,22%)] [--color-secondary:hsl(238,90%,95%)]">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: dashboardHref },
          { label: "Helpdesk", href: helpdeskBase },
        ]}
      />

      <div className="w-full space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg border border-[var(--color-primary)] p-3 text-[var(--color-primary)] bg-transparent">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Help Desk
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Support and request management center
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAgentOrAdmin && (
                <button
                  onClick={() => setViewMode(viewMode === "list" ? "analytics" : "list")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary)] bg-transparent border border-[var(--color-primary)] rounded-lg hover:border-[var(--color-primary-hover)] transition-colors"
                >
                  {viewMode === "list" ? (
                    <><BarChart3 size={16} /> Analytics</>
                  ) : (
                    <><LayoutList size={16} /> Ticket List</>
                  )}
                </button>
              )}
              {isAgentOrAdmin && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary)] bg-transparent border border-[var(--color-primary)] rounded-lg hover:border-[var(--color-primary-hover)] transition-colors"
                >
                  <Download size={16} /> Export
                </button>
              )}
              <Link
                href={`${helpdeskBase}/new`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:border-[var(--color-primary-hover)] transition-colors"
              >
                <Plus size={16} /> New Ticket
              </Link>
            </div>
          </div>
        </div>

        {viewMode === "analytics" ? (
          <AnalyticsDashboard stats={stats} />
        ) : (
          <div className="space-y-6">
            {/* Quick Stats (Mini) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Open Tickets", count: tickets.filter(t => ['NEW', 'IN_PROGRESS', 'ESCALATED'].includes(t.status)).length, icon: <Clock className="text-[var(--color-primary)]" />, bg: "bg-transparent border border-[var(--color-primary)]" },
                { label: "Unassigned", count: tickets.filter(t => t.status === 'NEW').length, icon: <AlertCircle className="text-[var(--color-primary)]" />, bg: "bg-transparent border border-[var(--color-primary)]" },
                { label: "Resolved", count: tickets.filter(t => t.status === 'RESOLVED').length, icon: <CheckCircle2 className="text-[var(--color-primary)]" />, bg: "bg-transparent border border-[var(--color-primary)]" },
                { label: "SLA Breached", count: tickets.filter(t => t.slaBreached).length, icon: <AlertCircle className="text-[var(--color-primary)]" />, bg: "bg-transparent border border-[var(--color-primary)]" },
              ].map((item, idx) => (
                <div key={idx} className="bg-transparent p-4 rounded-xl border border-[var(--color-primary)]/70 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.count}</p>
                  </div>
                  <div className="p-3 bg-transparent border border-[var(--color-primary)] rounded-lg">
                    {item.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* List and Filters */}
            <TicketList 
              tickets={tickets} 
              isAgentOrAdmin={isAgentOrAdmin} 
              onUpdate={fetchData}
              basePath={helpdeskBase}
            />
          </div>
        )}
      </div>
    </div>
  );
}
