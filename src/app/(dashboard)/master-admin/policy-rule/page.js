"use client";

import React, { useState, useEffect, useCallback } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import {
  Shield,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Loader2,
} from "lucide-react";
import ActionDropdown from '@/app/(dashboard)/master-admin/components/ActionDropdown';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import TablePagination from '@/components/common/TablePagination';
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";
import * as Yup from "yup";

// Validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Policy name is required"),
  category: Yup.string().required("Category is required"),
  description: Yup.string().required("Description is required"),
  content: Yup.string().required("Content is required"),
  effectiveDate: Yup.date()
    .transform((value, originalValue) => {
      // Transform DD-MM-YYYY to ISO string (YYYY-MM-DD)
      const [day, month, year] = originalValue.split("-");
      return new Date(`${year}-${month}-${day}`);
    })
    .required("Effective date is required"),
  expiryDate: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue) return null;
      const [day, month, year] = originalValue.split("-");
      return new Date(`${year}-${month}-${year}`);
    }),
});

export default function PolicyRulePage() {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    id: null,
    name: "",
  });

  // Form state
  const [formValues, setFormValues] = useState({
    name: "",
    category: "",
    description: "",
    content: "",
    effectiveDate: "",
    expiryDate: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // 1. Fetch Policies from API
  const fetchPolicies = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
      };

      const response = await apiClient.get("/master-admin/policy-rules", {
        params,
      });

      if (response.data.success) {
        setPolicies(response.data.policies || []);
        setTotalItems(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
      toast.error("Failed to load policies from server");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, selectedCategory, selectedStatus]);

  // 2. Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPolicies();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchPolicies]);

  // Pagination calculation based on total items from backend
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalItems);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const activeFiltersCount = [selectedCategory, selectedStatus].filter(Boolean)
    .length;

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-GB').replace(/\//g, '-');
  };

  const openDeleteDialog = (policy) => {
    setDeleteDialog({ isOpen: true, id: policy.id, name: policy.name });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, id: null, name: "" });
  };

  // 3. API Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await apiClient.delete(
        `/master-admin/policy-rules/${deleteDialog.id}`
      );

      if (response.data.success) {
        toast.success("Policy deleted successfully");
        fetchPolicies(); // Refresh the list
        closeDeleteDialog();
      }
    } catch (error) {
      console.error("Failed to delete policy:", error);
      toast.error("Failed to delete policy. Please try again.");
    }
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      setFormErrors({});
      return true;
    } catch (validationErrors) {
      const errors = {};
      validationErrors.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      setFormErrors(errors);
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      // Transform dates to ISO string format
      const payload = {
        ...formValues,
        effectiveDate: formValues.effectiveDate
          ? new Date(formValues.effectiveDate).toISOString().split("T")[0]
          : null,
        expiryDate: formValues.expiryDate
          ? new Date(formValues.expiryDate).toISOString().split("T")[0]
          : null,
      };

      console.log("Submitting payload:", payload); // Debugging

      const response = await apiClient.post('/master-admin/policy-rules', payload);

      if (response.data.success) {
        toast.success("Policy saved successfully");
        fetchPolicies(); // Refresh the list
      }
    } catch (error) {
      console.error("Error saving policy:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save policy.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Master Admin", href: "/master-admin/dashboard" },
              { label: "Policy & Rule", href: "/master-admin/policy-rule" },
            ]}
          />
          <Link
            href="/master-admin/policy-rule/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Policy</span>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter size={20} />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                size={16}
                className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-lg z-50">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      <option value="HR">HR</option>
                      <option value="Security">Security</option>
                      <option value="General">General</option>
                      <option value="Legal">Legal</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Policies Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
            <p className="text-gray-500 text-sm font-medium">
              Loading policies...
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50 dark:bg-primary-900/20 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Policy Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {policies.length > 0 ? (
                      policies.map((policy) => (
                        <tr
                          key={policy.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Shield
                                  size={20}
                                  className="text-indigo-600 dark:text-indigo-400"
                                />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {policy.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              {policy.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {policy.description}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}
                            >
                              {policy.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {formatDate(policy.updatedAt || policy.lastUpdated)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <ActionDropdown
                              viewUrl={`/master-admin/policy-rule/${policy.id}`}
                              editUrl={`/master-admin/policy-rule/${policy.id}/edit`}
                              onDelete={() => openDeleteDialog(policy)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          No policies found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
            {/* Pagination */}
            {policies.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(limit) => {
                  setItemsPerPage(limit);
                  setCurrentPage(1);
                }}
              />
            )}
          </>
        )}

        <ConfirmationDialog
          isOpen={deleteDialog.isOpen}
          title="Delete Policy"
          message={`Are you sure you want to delete ${deleteDialog.name}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onClose={closeDeleteDialog}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
        />
      </div>
    </div>
  );
}
