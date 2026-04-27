"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import { Filter, Search, Clock, Receipt, Trash2, PencilLine, Eye, MoreVertical } from "lucide-react";
import { toast } from "react-hot-toast";
import EmployeeReimbursementService from "@/services/employee/reimbursement.service";

const statusOptions = ["All", "Pending", "Approved", "Rejected", "Paid"];
const categoryOptions = ["All", "Travel", "Meals", "Office Supplies", "Medical", "Other"];

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function ReimbursementListPage() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const basePath = pathname.startsWith("/manager")
    ? "/manager"
    : pathname.startsWith("/it-admin")
      ? "/it-admin"
    : pathname.startsWith("/dept-head")
      ? "/dept-head"
    : pathname.startsWith("/ld")
      ? "/ld"
      : "/employee";
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-menu-root='reimbursement-actions']")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const handleReposition = () => {
      const trigger = document.querySelector(`[data-action-button='${openMenuId}']`);
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 160,
        width: 160
      });
    };
    handleReposition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [openMenuId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchReimbursements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, debouncedSearch, page, pageSize]);

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await EmployeeReimbursementService.getMyReimbursements({
        status: statusFilter,
        category: categoryFilter,
        search: debouncedSearch,
        page,
        limit: pageSize,
      });
      setItems(result.data || []);
      setPagination(result.pagination || { currentPage: page, totalPages: 1, totalItems: 0, itemsPerPage: pageSize });
    } catch (err) {
      setError(err.message || "Failed to load reimbursements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const totalPages = Math.max(1, Number(pagination?.totalPages || 1));
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.totalPages]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reimbursement request?")) return;
    try {
      await EmployeeReimbursementService.deleteReimbursement(id);
      toast.success("Reimbursement deleted");
      fetchReimbursements();
    } catch (err) {
      toast.error(err.message || "Failed to delete reimbursement");
    }
  };

  const menu =
    openMenuId && menuPosition ? (
      <div
        className="fixed z-[9999]"
        style={{ top: menuPosition.top, left: menuPosition.left, width: menuPosition.width }}
        data-menu-root="reimbursement-actions"
      >
        <div className="rounded-xl border border-primary-100/70 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
          <Link
            href={`${basePath}/reimbursement/${openMenuId}`}
            onClick={() => setOpenMenuId(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50/70 dark:hover:bg-gray-700/60"
          >
            <Eye size={14} />
            View
          </Link>
          <Link
            href={`${basePath}/reimbursement/${openMenuId}/edit`}
            onClick={() => setOpenMenuId(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 dark:text-amber-300 hover:bg-amber-50/70 dark:hover:bg-amber-500/10"
          >
            <PencilLine size={14} />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              handleDelete(openMenuId);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50/70 dark:hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Breadcrumb customTitle="Reimbursements" subtitle="Track and manage reimbursement claims" />

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  <Receipt size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Reimbursements</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View submitted claims, statuses, and actions.
                  </p>
                </div>
              </div>
              <Link
                href={`${basePath}/reimbursement/create`}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium text-center"
              >
                Raise Reimbursement
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by reference or description..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative min-w-[180px]">
                  <select
                    value={categoryFilter}
                    onChange={(event) => {
                      setCategoryFilter(event.target.value);
                      setPage(1);
                    }}
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
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setPage(1);
                    }}
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

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm overflow-visible">
            <div className="px-5 py-4 border-b border-primary-100/50 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Reimbursement History</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Number(pagination?.totalItems || 0)} requests
              </span>
            </div>
            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-primary-100/50 dark:border-gray-700">
                  <tr>
                    {["Reference", "Category", "Amount", "Expense Date", "Status", "Actions"].map((header) => (
                      <th key={header} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100/30 dark:divide-gray-700">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading reimbursements...
                      </td>
                    </tr>
                  )}
                  {!loading && error && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-red-600 dark:text-red-400">
                        {error}
                      </td>
                    </tr>
                  )}
                  {!loading && !error && items.map((item) => {
                    const statusLabel = item.status || "Pending";
                    const statusStyles =
                      statusLabel.toLowerCase() === "approved" || statusLabel.toLowerCase() === "paid"
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                        : statusLabel.toLowerCase() === "rejected"
                        ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
                    return (
                      <tr key={item.id} className="hover:bg-primary-50/40 dark:hover:bg-gray-700/30">
                        <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                          {item.reference || item.id}
                        </td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.category || "-"}</td>
                        <td className="px-5 py-4 text-gray-700 dark:text-gray-200">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {item.expenseDate ? new Date(item.expenseDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 relative overflow-visible">
                          <div className="relative inline-flex" data-menu-root="reimbursement-actions">
                            <button
                              type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (openMenuId === item.id) {
                                setOpenMenuId(null);
                                return;
                              }
                              const rect = event.currentTarget.getBoundingClientRect();
                              setMenuPosition({
                                top: rect.bottom + 8,
                                left: rect.right - 160,
                                width: 160
                              });
                              setOpenMenuId(item.id);
                            }}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-primary-200/70 text-gray-500 hover:text-primary-600 hover:border-primary-300 transition"
                            aria-label="Open actions menu"
                            data-action-button={item.id}
                          >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && !error && items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No reimbursements found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalItems={Number(pagination?.totalItems || 0)}
            itemsPerPage={pageSize}
            itemsPerPageOptions={[5, 10, 20, 50]}
            onPageChange={(next) => setPage(next)}
            onItemsPerPageChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            className="mt-6"
          />
        </div>
      </div>
      {portalReady && menu ? createPortal(menu, document.body) : null}
    </>
  );
}
