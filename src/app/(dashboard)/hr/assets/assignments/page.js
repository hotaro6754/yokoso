"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  UserCheck
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import ReturnAssetModal from "./components/ReturnAssetModal";
import AssignmentStats from "./components/AssignmentStats";
import { assetService } from "../../../../../services/hr-services/asset.service";
import CustomDropdown from "../../leave/components/CustomDropdown";

export default function AssetAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: ""
  });

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  /* ======================
     FETCH DATA
  ====================== */
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, statsRes] = await Promise.all([
        assetService.getAllAssignments(),
        assetService.getAssignmentStats(),
      ]);

      // ✅ IMPORTANT FIX
      setAssignments(assignmentsRes.data?.assignments || []);
      setStats(statsRes.data || {});
    } catch (error) {
      alert(error.message);
      setAssignments([]); // safety
    } finally {
      setLoading(false);
    }
  };


  /* ======================
     FILTER HANDLERS
  ====================== */
  const handleStatusChange = async (status) => {
    setFilters({ ...filters, status });
    setLoading(true);

    try {
      let res;
      if (status === "active") {
        res = await assetService.getActiveAssignments();
      } else {
        res = await assetService.getAllAssignments();
      }

      // ✅ IMPORTANT FIX
      setAssignments(res.data?.assignments || []);
    } catch (error) {
      alert(error.message);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };


  const filteredAssignments = assignments.filter((a) => {
    if (
      filters.search &&
      !a.assetName.toLowerCase().includes(filters.search.toLowerCase()) &&
      !a.employeeName.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  /* ======================
     RETURN ASSET
  ====================== */
  const handleOpenReturnModal = (assignment) => {
    setSelectedAssignment(assignment);
    setReturnModalOpen(true);
  };

  const handleReturnAsset = (assignmentId, returnData) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
            ...a,
            status: "returned",
            actualReturnDate: returnData.returnDate,
            conditionReturned: returnData.conditionReturned,
            notes: returnData.notes || a.notes
          }
          : a
      )
    );
  };

  /* ======================
     DELETE ASSIGNMENT
  ====================== */
  const handleDeleteAssignment = (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    setAssignments((prev) =>
      prev.filter((a) => a.id !== assignmentId)
    );
  };

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    returned:
      "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400",
    overdue:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
        <Breadcrumb />
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        rightContent={
          <div className="flex gap-2">
            <Link
              href="/hr/assets/assignments/assign"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm hover:shadow-md font-semibold"
            >
              <Plus size={18} /> Assign Asset
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 bg-white dark:bg-gray-800">
              <Download size={18} /> Export
            </button>
          </div>
        }
      />

      {/* STATS */}
      <AssignmentStats stats={stats} />

      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        {/* FILTERS */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0 relative">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <CustomDropdown
                  value={filters.status}
                  onChange={(value) => handleStatusChange(value)}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'returned', label: 'Returned' }
                  ]}
                  placeholder="All Status"
                  className="min-w-[150px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Assigned</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Return</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssignments.map((a) => (
                <tr key={a.id} className="border-t dark:border-gray-700">
                  <td className="px-6 py-4">
                    <p className="font-medium">{a.assetName}</p>
                    <p className="text-sm text-gray-500">{a.assetCategory}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{a.employeeName}</p>
                    <p className="text-sm text-gray-500">{a.employeeId}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">{a.assignedDate}</td>
                  <td className="px-6 py-4 text-sm">
                    {a.actualReturnDate || a.expectedReturnDate}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusColors[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400 cursor-pointer hover:text-brand-700 dark:hover:text-brand-300" />
                    {a.status === "active" && (
                      <UserCheck
                        className="w-4 h-4 text-green-600 cursor-pointer"
                        onClick={() => handleOpenReturnModal(a)}
                      />
                    )}
                    <Trash2
                      className="w-4 h-4 text-red-600 cursor-pointer"
                      onClick={() => handleDeleteAssignment(a.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReturnAssetModal
        assignment={selectedAssignment}
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onReturn={handleReturnAsset}
      />
    </div>
  );
}
