"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Search, Plus, DollarSign, Percent, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { payrollSalaryComponentsService } from "@/services/payroll-role-services/salary-components.service";
import SalaryComponentsModal from "./SalaryComponentsModal";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function SalaryComponentsList({ refreshKey = 0, onAddComponent }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState(null);

  useEffect(() => {
    fetchComponents();
  }, [refreshKey]);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await payrollSalaryComponentsService.getAllSalaryComponents({ limit: 100, page: 1 });
      const list = response.data?.components || response.data?.data || response.data || [];
      setComponents(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch salary components");
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (component) => {
    setSelectedComponent({
      id: component.id,
      salary_structure_id: component.salaryStructureId || component.salary_structure_id,
      name: component.name,
      type: component.type,
      amount: component.amount,
      is_percentage: component.isPercentage ?? component.is_percentage ?? false,
      percentage_of: component.percentageOf ?? component.percentage_of ?? "",
      is_taxable: component.isTaxable ?? component.is_taxable ?? true,
      description: component.description || ""
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    setComponentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!componentToDelete) return;
    try {
      await payrollSalaryComponentsService.deleteSalaryComponent(componentToDelete);
      toast.success("Component deleted successfully");
      fetchComponents();
    } catch (error) {
      toast.error(error.message || "Failed to delete component");
    } finally {
      setShowDeleteModal(false);
      setComponentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setComponentToDelete(null);
  };

  const filteredComponents = components.filter(component => {
    const structureId = component.salaryStructure?.publicId || component.publicId || "";
    const employeeName = component.salaryStructure?.employee
      ? `${component.salaryStructure.employee.firstName || ""} ${component.salaryStructure.employee.lastName || ""}`.trim()
      : "";

    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(component.publicId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      structureId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || component.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const calculateDisplayAmount = (component) => {
    if ((component.isPercentage ?? component.is_percentage) && (component.percentageOf ?? component.percentage_of)) {
      const baseAmount = parseFloat(component.percentageOf ?? component.percentage_of) || 0;
      const percentage = parseFloat(component.amount) || 0;
      const calculated = (baseAmount * percentage / 100).toFixed(2);
      return `${component.amount}% of ₹${baseAmount} = ₹${calculated}`;
    }
    return `₹${parseFloat(component.amount).toLocaleString()}`;
  };

  const getTypeColor = (type) => {
    return type === "EARNING" 
      ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400";
  };

  const getTypeIcon = (type) => {
    return type === "EARNING" ? <Plus className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Salary Components
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage earnings and deductions components
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm"
          >
            <option value="ALL">All Types</option>
            <option value="EARNING">Earnings</option>
            <option value="DEDUCTION">Deductions</option>
          </select>

          {/* Add Component Button */}
          <button
            onClick={onAddComponent}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Component
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {components.filter(c => c.type === "EARNING").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Deductions</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {components.filter(c => c.type === "DEDUCTION").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Percentage Based</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {components.filter(c => c.isPercentage || c.is_percentage).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map((component, index) => (
          <motion.div
            key={component.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${getTypeColor(component.type)} flex items-center justify-center`}>
                  {getTypeIcon(component.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {component.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {component.publicId}
                  </p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(component.type)}`}>
                {component.type}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {component.isPercentage || component.is_percentage ? (
                    <div className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {calculateDisplayAmount(component)}
                    </div>
                  ) : (
                    `₹${parseFloat(component.amount).toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Taxable:</span>
                <span className="flex items-center gap-1">
                  {component.isTaxable || component.is_taxable ? (
                    <><CheckCircle className="w-3 h-3 text-green-500" /> Yes</>
                  ) : (
                    <><XCircle className="w-3 h-3 text-red-500" /> No</>
                  )}
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p className="truncate">{component.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {component.salaryStructure?.publicId || "-"}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(component)}
                  className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(component.id)}
                  className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || typeFilter !== "ALL" 
              ? "No components found matching your criteria" 
              : "No components found"}
          </p>
        </div>
      )}

      <SalaryComponentsModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedComponent(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedComponent(null);
          fetchComponents();
        }}
        editData={selectedComponent}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Salary Component"
        description="Are you sure you want to delete this component? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
