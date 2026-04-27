"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { employeeService } from "@/services/hr-services/employeeService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/components/common/Breadcrumb";
import DatePicker from "@/components/common/DatePicker";
import {
  AlertTriangle,
  CheckCircle2,
  UserX,
  ArrowRight,
  ShieldAlert,
  CalendarDays,
  MoreHorizontal,
  Search,
  Filter,
  BarChart3,
  Clock,
  PlusCircle,
  X,
  Save,
  Loader2,
  MoreVertical,
} from "lucide-react";

const PIPManagementPage = () => {
  const router = useRouter();
  const [pips, setPips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPip, setSelectedPip] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    reason: "",
    goals: "",
    startDate: "",
    endDate: "",
    status: "DRAFT"
  });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    fetchPIPs();
    fetchEmployees();
  }, [filterStatus]);

  const fetchEmployees = async () => {
    try {
      const resp = await employeeService.getAllEmployees();
      const emps = resp?.data || resp?.employees || resp || [];
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (error) {
      console.warn("Failed to load employees via getAllEmployees, attempting fallback:", error.message);
      try {
        const fallbackResp = await employeeService.getCompanyUsers();
        const emps = fallbackResp?.data || fallbackResp?.users || fallbackResp || [];
        setEmployees(Array.isArray(emps) ? emps : []);
      } catch (fallbackError) {
        console.warn("Fallback failed as well:", fallbackError.message);
        toast.error("Could not fetch the employees list for new PIP.");
      }
    }
  };

  const readCachedPips = () => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("zodeck_pip_cache");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const fetchPIPs = async () => {
    setLoading(true);
    try {
      const data = await performanceManagementService.getPIPs({ status: filterStatus });
      const resolved = Array.isArray(data) ? data : [];
      const fallback = readCachedPips();
      const base = resolved.length ? resolved : fallback;
      if (typeof window !== "undefined" && resolved.length) {
        window.localStorage.setItem("zodeck_pip_cache", JSON.stringify(resolved));
      }
      const filtered = filterStatus === "all" ? base : base.filter((pip) => pip.status === filterStatus);
      setPips(filtered);
    } catch (error) {
      const fallback = readCachedPips();
      const filtered = filterStatus === "all" ? fallback : fallback.filter((pip) => pip.status === filterStatus);
      setPips(filtered);
      toast.error("Failed to fetch PIP records");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error("Please select an employee");
      return;
    }
    setSubmitting(true);
    try {
      await performanceManagementService.createPIP({
        ...formData,
        employeeId: parseInt(formData.employeeId),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      });
      toast.success("PIP initiated successfully!");
      setIsModalOpen(false);
      setFormData({ employeeId: "", reason: "", goals: "", startDate: "", endDate: "", status: "DRAFT" });
      fetchPIPs();
    } catch (error) {
      toast.error(error.message || "Failed to create PIP");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = pips.filter((pip) => pip.status === "ACTIVE").length;
  const successCount = pips.filter((pip) => pip.status === "COMPLETED_SUCCESS").length;
  const failureCount = pips.filter((pip) => pip.status === "COMPLETED_FAILURE").length;
  const draftCount = pips.filter((pip) => pip.status === "DRAFT").length;

  const filteredPips = pips.filter((pip) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const employeeName = `${pip.employee.firstName} ${pip.employee.lastName}`.toLowerCase();
    const managerName = `${pip.manager.firstName} ${pip.manager.lastName}`.toLowerCase();
    const email = pip.employee.email.toLowerCase();
    const reason = pip.reason.toLowerCase();
    return (
      employeeName.includes(query) ||
      managerName.includes(query) ||
      email.includes(query) ||
      reason.includes(query)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            <AlertTriangle size={12} /> Active
          </span>
        );
      case "COMPLETED_SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <CheckCircle2 size={12} /> Closed Successfully
          </span>
        );
      case "COMPLETED_FAILURE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            <UserX size={12} /> Closed Unsuccessful
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            <Clock size={12} /> Draft
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressColor = (status) => {
    if (status === "ACTIVE") return "bg-amber-500";
    if (status === "COMPLETED_SUCCESS") return "bg-green-500";
    if (status === "COMPLETED_FAILURE") return "bg-red-500";
    return "bg-gray-400";
  };

  const openDetails = (pip) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("zodeck_pip_selected", JSON.stringify(pip));
    }
    router.push(`/hr/performance/pip/${pip.id}`);
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <ToastContainer />

      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr/dashboard" },
            { label: "Performance Management", href: "/hr/performance-management/appraisals" },
            { label: "PIP Management" },
          ]}
        />

        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Performance Improvement Plans
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor critical performance cases, track plan progress, and review intervention outcomes.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search employee, manager, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  className="h-10 min-w-[180px] appearance-none rounded-sm border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Cases</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="DRAFT">Drafts</option>
                  <option value="COMPLETED">Closed</option>
                </select>
                <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={() => router.push("/hr/performance/pip/create")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0b1220] bg-[var(--color-primary)] rounded-sm hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm w-fit"
            >
              <ShieldAlert size={14} />
              Initiate New PIP
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Plans</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <BarChart3 size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{pips.length}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Intervention</span>
              <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Closed Successfully</span>
              <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{successCount}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Draft / Unsuccessful</span>
              <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-full">
                <UserX size={14} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{draftCount + failureCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">PIP Cases</h2>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading PIP records...</p>
            </div>
          ) : filteredPips.length === 0 ? (
            <div className="py-16 text-center px-6">
              <div className="mx-auto h-20 w-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No improvement plans found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">That&apos;s good news. No active performance plans match the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead className="bg-[var(--color-primary-hover)]/70 dark:bg-[var(--color-primary)]/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {filteredPips.map((pip) => (
                    <tr key={pip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-sm bg-[var(--color-primary-hover)] text-[#0b1220] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                            {pip.employee.firstName[0]}{pip.employee.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {pip.employee.firstName} {pip.employee.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{pip.employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {pip.manager.firstName} {pip.manager.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-[320px]">
                        {pip.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {new Date(pip.startDate).toLocaleDateString()} - {new Date(pip.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getProgressColor(pip.status)}`}
                              style={{ width: `${pip.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{pip.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pip.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const MENU_WIDTH = 176;
                              const gap = 6;
                              const nextTop = rect.bottom + gap;
                              let nextLeft = rect.right - MENU_WIDTH;
                              if (nextLeft < 8) nextLeft = 8;
                              setMenuPos({ top: nextTop, left: nextLeft });
                              setOpenMenuId(openMenuId === pip.id ? null : pip.id);
                            }}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-sm bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            title="Actions"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenuId === pip.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div
                                className="fixed w-44 origin-top-right rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-20"
                                style={{ top: menuPos.top, left: menuPos.left }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => openDetails(pip)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <ArrowRight size={14} />
                                  View Details
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Initiate PIP Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Initiate Improvement Plan
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Employee</label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white outline-none"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.employee?.id || emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason for PIP</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Describe the performance issue clearly..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <DatePicker
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="!rounded-md focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                  <DatePicker
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="!rounded-md focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Improvement Goals <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Specific measurable goals..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50 transition-colors"
                >
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Creating...</>
                    : <><Save size={16} /> Create Plan</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isDetailsModalOpen && selectedPip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                PIP Details
              </h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="h-12 w-12 rounded-sm bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 flex items-center justify-center font-bold text-lg">
                  {selectedPip.employee?.firstName?.[0] || ''}{selectedPip.employee?.lastName?.[0] || ''}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedPip.employee?.firstName} {selectedPip.employee?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPip.employee?.email}</p>
                </div>
                <div className="ml-auto">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${selectedPip.status === "ACTIVE" 
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" 
                      : selectedPip.status === "COMPLETED_SUCCESS" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : selectedPip.status === "COMPLETED_FAILURE" || selectedPip.status === "TERMINATED"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                    {selectedPip.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reason for PIP</h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                  {selectedPip.reason || "No reason provided."}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Improvement Goals</h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 whitespace-pre-wrap">
                  {typeof selectedPip.goals === 'string' ? selectedPip.goals : (selectedPip.goals?.[0] || "No specific goals outlined.")}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(selectedPip.startDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(selectedPip.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedPip.finalOutcome && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Final Outcome & Notes</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 whitespace-pre-wrap">
                    {selectedPip.finalOutcome}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
               <button
                 onClick={() => setIsDetailsModalOpen(false)}
                 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PIPManagementPage;
