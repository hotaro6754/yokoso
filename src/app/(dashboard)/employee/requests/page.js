"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Filter, Search, Clock } from "lucide-react";
import { employeeRequestsService } from "@/services/employee/requests.service";

const statusOptions = ["All", "Open", "In Progress", "Awaiting Employee", "Resolved", "Closed"];
const categoryOptions = ["All", "Document Request", "Salary Query", "HR Policy Query", "IT Asset Request"];

export default function RequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTickets();
    }, 300);

    return () => clearTimeout(timeout);
  }, [statusFilter, categoryFilter, searchQuery]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await employeeRequestsService.getMyRequests({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery
      });
      setTickets(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || ticket.category === categoryFilter;
      const matchesSearch = !searchQuery
        || ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
        || ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [statusFilter, categoryFilter, searchQuery, tickets]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Requests</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track submitted requests, status, and responses.
              </p>
            </div>
            <Link
              href="/employee/requests/create"
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium text-center"
            >
              Create Request
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by ticket ID or subject..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative min-w-[180px]">
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <div className="relative min-w-[160px]">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-primary-100/50 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Request History</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredTickets.length} tickets
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-primary-100/50 dark:border-gray-700">
                <tr>
                  {["Ticket ID", "Category", "Subject", "Status", "Last Updated", "Handler", "Action"].map((header) => (
                    <th key={header} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100/30 dark:divide-gray-700">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      Loading requests...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-red-600 dark:text-red-400">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredTickets.map((ticket) => {
                  const statusStyles =
                    ticket.status === "Resolved" || ticket.status === "Closed"
                      ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                      : ticket.status === "Open"
                      ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300"
                      : "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300";
                  return (
                    <tr key={ticket.id} className="hover:bg-primary-50/40 dark:hover:bg-gray-700/30">
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{ticket.id}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{ticket.category}</td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-200">{ticket.subject}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                        {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{ticket.handler}</td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/employee/requests/${ticket.id}`}
                          className="text-primary-600 hover:text-primary-700 text-xs font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {!loading && !error && filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No requests found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
