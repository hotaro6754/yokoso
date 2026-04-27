"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  BadgeCheck, Clock, AlertTriangle, MessageSquare, 
  ChevronRight, Filter, Search, User, UserPlus, Eye, CheckCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import helpdeskService from "@/services/helpdesk.service";
import ActionDropdown from "@/app/(dashboard)/master-admin/components/ActionDropdown";

export default function TicketList({ tickets, isAgentOrAdmin, onUpdate, basePath = "/helpdesk" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const prevTicketCountRef = useRef(Array.isArray(tickets) ? tickets.length : 0);

  // If new tickets arrive (e.g., after creation), jump to page 1 so the latest is visible.
  useEffect(() => {
    const nextCount = Array.isArray(tickets) ? tickets.length : 0;
    if (nextCount > prevTicketCountRef.current) setPage(1);
    prevTicketCountRef.current = nextCount;
  }, [tickets]);

  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const filteredTickets = useMemo(() => {
    const list = Array.isArray(tickets) ? tickets : [];

    // Defensive: keep newest on top even if backend ordering changes.
    const sorted = [...list].sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return (b?.id || 0) - (a?.id || 0);
    });

    return sorted.filter((t) => {
      const subject = String(t?.subject || "").toLowerCase();
      const ticketId = String(t?.ticketId || "").toLowerCase();
      const matchesSearch =
        !normalizedSearch || subject.includes(normalizedSearch) || ticketId.includes(normalizedSearch);
      const matchesStatus = filterStatus === "ALL" || t?.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, normalizedSearch, filterStatus]);

  const totalTickets = Array.isArray(tickets) ? tickets.length : 0;
  const totalFiltered = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'NEW': return 'bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)]';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400';
      case 'ESCALATED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 dark:text-red-400';
      case 'MEDIUM': return 'text-amber-600 dark:text-amber-400';
      case 'LOW': return 'text-[var(--color-primary)]';
      default: return 'text-gray-600';
    }
  };

  const handleClaim = async (e, id) => {
    if (e) e.stopPropagation();
    try {
      await helpdeskService.claimTicket(id);
      toast.success("Ticket claimed successfully!");
      onUpdate();
    } catch (error) {
      console.error("Failed to claim ticket", error);
      toast.error(error.response?.data?.message || "Failed to claim ticket");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      
      {/* Controls */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Total Tickets:{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {totalTickets}
            </span>
            {totalFiltered !== totalTickets && (
              <span className="ml-2">
                Filtered:{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {totalFiltered}
                </span>
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or Subject..." 
              className="w-full h-11 pl-12 pr-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 mr-2" />
          {['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'].map(status => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                ${filterStatus === status 
                  ? 'border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent' 
                  : 'text-gray-500 border border-transparent hover:border-[var(--color-primary-hover)]'
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table/List */}
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full text-sm">
          <thead className="bg-[color:var(--color-secondary)] border-b border-[var(--color-primary)]/30 dark:bg-[#2a2e4a] dark:border-[#3a4063]">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#2f3350] dark:text-gray-200 uppercase tracking-widest">Ticket Info</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#2f3350] dark:text-gray-200 uppercase tracking-widest">Department</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold text-[#2f3350] dark:text-gray-200 uppercase tracking-widest">Status</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold text-[#2f3350] dark:text-gray-200 uppercase tracking-widest">Priority</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-[#2f3350] dark:text-gray-200 uppercase tracking-widest">Agent</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold text-[#2f3350] dark:text-gray-200 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.length > 0 ? paginatedTickets.map((ticket) => {
              const customActions = [];
              if (isAgentOrAdmin && !ticket.assignedToId && ticket.status === 'NEW') {
                customActions.push({
                  label: "Assign to me",
                  icon: UserPlus,
                  onClick: () => handleClaim(null, ticket.id),
                  className: "text-emerald-700 dark:text-emerald-300",
                  iconClassName: "text-emerald-600 dark:text-emerald-400",
                });
              }

              if (isAgentOrAdmin && ticket.status === 'IN_PROGRESS' && ticket.assignedToId === (ticket.assignedToId)) { // Simplified check
                customActions.push({
                  label: "Resolve Ticket",
                  icon: CheckCircle,
                  onClick: () => alert("Resolve functionality coming soon"),
                  className: "text-blue-700 dark:text-blue-300",
                  iconClassName: "text-blue-600 dark:text-blue-400",
                });
              }

              return (
                <tr key={ticket.id} className="border-t border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {ticket.ticketId}
                        {ticket.slaBreached && (
                          <AlertTriangle size={14} className="text-red-500" title="SLA Breached" />
                        )}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">{ticket.subject}</span>
                      <span className="text-[11px] text-gray-400 mt-1">
                        {new Date(ticket.createdAt).toLocaleString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          hour12: true 
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{ticket.department?.name}</span>
                      <span className="text-xs text-gray-500">{ticket.category?.name}</span>
                    </div>
                  </td>
                    <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${ticket.priority === 'HIGH' ? 'bg-red-500' : ticket.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-[var(--color-primary)]'}`} />
                      <span className={`text-xs font-bold ${getPriorityStyle(ticket.priority)}`}>{ticket.priority}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {ticket.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[var(--color-primary-hover)] rounded-lg flex items-center justify-center text-[#0b1220] border border-[var(--color-primary)]">
                          <User size={14} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {ticket.assignedTo.firstName} {ticket.assignedTo.lastName.charAt(0)}.
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right w-40">
                    <div className="relative flex items-center justify-end gap-2">
                      <ActionDropdown 
                        viewUrl={`${basePath}/${ticket.id}`} 
                        customActions={customActions}
                      />
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className="px-4 py-16 text-center">
                   <div className="flex flex-col items-center gap-3">
                     <MessageSquare size={40} className="text-gray-300" />
                     <p className="text-gray-500 dark:text-gray-400 font-medium">No tickets found matches your criteria</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {totalFiltered === 0 ? (
            <>Showing 0 results</>
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {startIndex + 1}
              </span>
              -
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {endIndex}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {totalFiltered}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/30"
            >
              Prev
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Page{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {safePage}
              </span>{" "}
              /{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {totalPages}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/30"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
