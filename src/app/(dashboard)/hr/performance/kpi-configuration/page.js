"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Target,
  TrendingUp,
  BarChart3,
  Pause,
  Play,
  Eye,
  ArrowLeft
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import ActionDropdown from "@/app/(dashboard)/master-admin/components/ActionDropdown";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function KPIConfigurationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kpiToDelete, setKpiToDelete] = useState(null);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const response = await performanceManagementService.getKpis();
      const list = Array.isArray(response) ? response : response?.data || [];
      setKpis(list);
      console.log('Fetched KPIs:', response); // Debug log
      setKpis(response || []);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      toast.error(error.message || "Failed to load KPI configuration");
      setKpis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (kpi) => {
    setViewingKpi(kpi);
  };

  const handleEdit = (kpi) => {
    console.log('Edit clicked with KPI:', kpi); // Debug log
    if (!kpi) {
      console.error('KPI object is undefined');
      return;
    }

    setEditingId(kpi.id ?? kpi._id);
    setFormData({
      name: kpi.name || "",
      description: kpi.description || "",
      kpiType: kpi.kpiType || "",
      targetValue: kpi.targetValue?.toString() || "",
      minAcceptable: kpi.minAcceptable?.toString() || "",
      stretchTarget: kpi.stretchTarget?.toString() || "",
      weight: kpi.weight?.toString() || "",
      ratingScale: kpi.ratingScale || "",
      autoScore: kpi.autoScore || false,
      whoUpdates: kpi.whoUpdates || "",
      frequency: kpi.frequency || "",
      evidenceRequired: kpi.evidenceRequired || false,
      appliesTo: kpi.appliesTo || [],
      status: kpi.status || "ACTIVE"
    });
  };

  const handleSave = async () => {
    try {
      // Convert string values back to numbers for API
      const submitData = {
        ...formData,
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : null,
        minAcceptable: formData.minAcceptable ? parseFloat(formData.minAcceptable) : null,
        stretchTarget: formData.stretchTarget ? parseFloat(formData.stretchTarget) : null,
        weight: formData.weight ? parseFloat(formData.weight) : 0
      };

      let response;
      if (editingId === 'new') {
        response = await performanceManagementService.createKpi(submitData);
        toast.success("KPI created successfully");
      } else {
        response = await performanceManagementService.updateKpi(editingId, submitData);
        toast.success("KPI updated successfully");
      }

      await fetchKPIs();
      setEditingId(null);
      setFormData({});
    } catch (error) {
      toast.error(error.message || "Failed to save KPI");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleToggleActive = async (kpiId) => {
    try {
      await performanceManagementService.toggleKpiStatus(kpiId);
      toast.success("KPI status updated successfully");
      await fetchKPIs();
    } catch (error) {
      toast.error(error.message || "Failed to update KPI status");
    }
  };

  const handleDelete = (kpiId) => {
    setKpiToDelete(kpiId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!kpiToDelete) return;
    try {
      await performanceManagementService.deleteKpi(kpiToDelete);
      toast.success("KPI deleted successfully");
      await fetchKPIs();
    } catch (error) {
      toast.error(error.message || "Failed to delete KPI");
    } finally {
      setShowDeleteModal(false);
      setKpiToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setKpiToDelete(null);
  };

  const getTotalWeightage = () => {
    return kpis.filter(kpi => kpi.status === 'ACTIVE').reduce((sum, kpi) => sum + (kpi.weight || 0), 0);
  };

  const filteredKpis = kpis.filter(kpi =>
    kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kpi.description && kpi.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (kpi.kpiType && kpi.kpiType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Performance", href: "/hr/performance" },
            { label: "KPI Configuration", href: "/hr/performance/kpi-configuration" },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              KPI Configuration
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure key performance indicators and weightage settings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editingId && (
              <button
                onClick={() => {
                  setEditingId('new');
                  setFormData({
                    name: "",
                    description: "",
                    kpiType: "Performance",
                    targetValue: "",
                    minAcceptable: "",
                    stretchTarget: "",
                    weight: 0,
                    ratingScale: "1-5",
                    autoScore: true,
                    whoUpdates: "Manager",
                    frequency: "MONTHLY",
                    evidenceRequired: false,
                    appliesTo: [],
                    status: "ACTIVE"
                  });
                }}
                className="inline-flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-[#0b1220] shadow-sm transition bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
              >
                <Plus className="h-4 w-4" />
                Add KPI
              </button>
            )}
          </div>
        </div>
      </div>

      {editingId && (
        <div className="mb-2">
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({});
            }}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {!editingId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total KPIs</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <Target size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active KPIs</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <Play size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpis.filter(k => k.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Weightage</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <BarChart3 size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${getTotalWeightage() === 100 ? 'text-green-600' : 'text-amber-600'}`}>
              {getTotalWeightage()}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Should sum to 100%</div>
          </div>
        </div>
      )}

      {/* KPIs Table - Show only when not editing any KPI */}
      {!editingId && (
        <>
          {/* Toolbar */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search KPIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />
            </div>
          </div>

          {/* KPIs Table */}
          <div className="rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
            {filteredKpis.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No KPIs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-primary-hover)]/70 text-xs uppercase tracking-wide text-gray-700 dark:bg-[var(--color-primary)]/10 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">KPI Name</th>
                      <th className="px-6 py-3 text-left font-medium">Type</th>
                      <th className="px-6 py-3 text-left font-medium">Weight</th>
                      <th className="px-6 py-3 text-left font-medium">Target</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                      <th className="px-6 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredKpis.map((kpi) => {
                      const kpiId = kpi.id ?? kpi._id;
                      return (
                      <tr key={kpiId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {kpi.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {kpi.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {kpi.kpiType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {kpi.weight || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {kpi.targetValue || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${kpi.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                            {kpi.status || 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionDropdown
                            customActions={[
                              {
                                label: "Edit",
                                icon: Edit,
                                onClick: () => handleEdit(kpi),
                                className: "text-gray-700 dark:text-gray-200",
                                iconClassName: "text-[var(--color-primary)]"
                              },
                              {
                                label: kpi.status === 'ACTIVE' ? "Deactivate" : "Activate",
                                icon: kpi.status === 'ACTIVE' ? Pause : Play,
                                onClick: () => handleToggleActive(kpiId),
                                className: kpi.status === 'ACTIVE' ? "text-amber-700 dark:text-amber-200" : "text-green-700 dark:text-green-200",
                                iconClassName: kpi.status === 'ACTIVE' ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400",
                                hoverClassName: kpi.status === 'ACTIVE' ? "hover:bg-amber-50 dark:hover:bg-amber-900/20" : "hover:bg-green-50 dark:hover:bg-green-900/20"
                              },
                              {
                                label: "Delete",
                                icon: Trash2,
                                onClick: () => handleDelete(kpiId),
                                className: "text-red-700 dark:text-red-300",
                                iconClassName: "text-red-600 dark:text-red-400",
                                hoverClassName: "hover:bg-red-50 dark:hover:bg-red-900/20"
                              }
                            ]}
                          />
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit KPI Form - Show only when adding new or editing */}
      {editingId && (
        <div className="my-6 rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Header with back button for new KPI */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId === 'new' ? 'Create New KPI' : 'Edit KPI'}
            </h3>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({});
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                KPI Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter KPI name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Type
              </label>
              <select
                value={formData.kpiType}
                onChange={(e) => setFormData(prev => ({ ...prev, kpiType: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Performance">Performance</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Development">Development</option>
                <option value="Quality">Quality</option>
                <option value="Compliance">Compliance</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={2}
                placeholder="Enter KPI description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Target Value
              </label>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter target value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Weight (%)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter weight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Rating Scale
              </label>
              <select
                value={formData.ratingScale}
                onChange={(e) => setFormData(prev => ({ ...prev, ratingScale: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select rating scale</option>
                <option value="1-5">1-5 Scale</option>
                <option value="1-10">1-10 Scale</option>
                <option value="1-100">1-100 Scale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="HALF_YEARLY">Half Yearly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Who Updates
              </label>
              <select
                value={formData.whoUpdates}
                onChange={(e) => setFormData(prev => ({ ...prev, whoUpdates: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select who updates</option>
                <option value="Manager">Manager</option>
                <option value="Self">Self (Employee)</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div className="col-span-2 flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoScore: e.target.checked }))}
                className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                Auto Score
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.evidenceRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, evidenceRequired: e.target.checked }))}
                className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                Evidence Required
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.status === 'ACTIVE'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' }))}
                className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({});
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[var(--color-primary-hover)] rounded-sm border border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-[var(--color-primary)]/15 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-bold text-[#0b1220] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-sm shadow-sm transition-colors"
            >
              {editingId === 'new' ? 'Create KPI' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete KPI"
        description="Are you sure you want to delete this KPI? This action cannot be undone."
        confirmText="Delete KPI"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};
