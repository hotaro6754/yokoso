"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Calculator, Info, Percent, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { payrollSalaryComponentsService } from "@/services/payroll-role-services/salary-components.service";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";

export default function SalaryComponentsModal({ isOpen, onClose, onSuccess, editData = null }) {
  const initialFormData = useMemo(() => ({
    salary_structure_id: "",
    name: "",
    type: "EARNING",
    amount: "",
    is_percentage: false,
    percentage_of: "",
    is_taxable: true,
    description: "",
    company_id: ""
  }), []);

  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(false);
  const [salaryStructures, setSalaryStructures] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      return;
    }

    if (editData) {
      setFormData({
        ...initialFormData,
        ...editData
      });
    } else {
      setFormData(initialFormData);
    }

    fetchSalaryStructures();
  }, [editData, initialFormData, isOpen]);

  const fetchSalaryStructures = async () => {
    try {
      const response = await payrollSalaryStructureService.getAllSalaryStructures({ limit: 100, page: 1 });
      const structures = response.data?.salaryStructures || response.data?.data || response.data || [];
      setSalaryStructures(Array.isArray(structures) ? structures : []);
    } catch (error) {
      console.error("Error fetching salary structures:", error);
      toast.error(error.message || "Failed to fetch salary structures");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateAmount = () => {
    if (formData.is_percentage && formData.percentage_of && formData.amount) {
      const baseAmount = parseFloat(formData.percentage_of) || 0;
      const percentage = parseFloat(formData.amount) || 0;
      return (baseAmount * percentage / 100).toFixed(2);
    }
    return formData.amount || "0";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.type || (!formData.amount && !formData.is_percentage)) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const payload = {
        salaryStructureId: formData.salary_structure_id ? Number(formData.salary_structure_id) : null,
        name: formData.name,
        type: formData.type,
        amount: parseFloat(formData.amount) || 0,
        isPercentage: Boolean(formData.is_percentage),
        percentageOf: formData.is_percentage ? String(formData.percentage_of || "") : null,
        isTaxable: Boolean(formData.is_taxable),
        description: formData.description
      };

      if (!payload.salaryStructureId) {
        toast.error("Please select a salary structure");
        setLoading(false);
        return;
      }

      if (editData?.id) {
        await payrollSalaryComponentsService.updateSalaryComponent(editData.id, payload);
      } else {
        await payrollSalaryComponentsService.createSalaryComponent(payload);
      }

      toast.success(editData ? "Component updated successfully!" : "Component created successfully!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || "Failed to save component");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editData ? "Edit Component" : "Add New Component"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure earnings and deductions components
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Component Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                    placeholder="e.g., House Rent Allowance"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Component Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                    required
                  >
                    <option value="EARNING">Earning</option>
                    <option value="DEDUCTION">Deduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salary Structure
                  </label>
                  <select
                    name="salary_structure_id"
                    value={formData.salary_structure_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                  >
                    <option value="">Select Structure (Optional)</option>
                    {salaryStructures.map(structure => (
                      <option key={structure.id} value={structure.id}>
                        {structure.name || structure.public_id || structure.publicId}{" "}
                        {structure.employee
                          ? `- ${structure.employee.firstName || ""} ${structure.employee.lastName || ""}`.trim()
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                    placeholder="Describe this component..."
                  />
                </div>
              </div>

              {/* Amount Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Amount Configuration
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_percentage"
                      checked={formData.is_percentage}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Percentage based component
                    </span>
                    <Percent className="w-4 h-4 text-gray-400" />
                  </label>
                </div>

                {formData.is_percentage ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Percentage (%) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                        placeholder="e.g., 12"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Percentage Of *
                      </label>
                      <input
                        type="number"
                        name="percentage_of"
                        value={formData.percentage_of}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                        placeholder="e.g., Basic Salary Amount"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-500/20 rounded-lg border border-blue-200 dark:border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Calculated Amount</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{calculateAmount()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fixed Amount *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_taxable"
                      checked={formData.is_taxable}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Taxable Component
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.is_percentage 
                      ? "This percentage-based component will be calculated based on the specified amount."
                      : "This is a fixed amount component that will be added to the salary structure."}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : (editData ? "Update Component" : "Add Component")}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
