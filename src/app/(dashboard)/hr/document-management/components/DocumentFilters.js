"use client";
import { useState } from "react";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import CustomDropdown from "./CustomDropdown";

const DocumentFilters = ({
  globalFilter,
  setGlobalFilter,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  employeeFilter,
  setEmployeeFilter,
  expiringSoonFilter,
  setExpiringSoonFilter,
  onClearFilters,
  employees = [],
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const hasActiveFilters =
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    employeeFilter !== "all" ||
    expiringSoonFilter ||
    globalFilter;

  // Document type options
  const documentTypes = [
    { value: "all", label: "All Types" },
    { value: "ID_PROOF", label: "ID Proof" },
    { value: "ADDRESS_PROOF", label: "Address Proof" },
    { value: "AADHAAR", label: "Aadhaar Card" },
    { value: "PAN", label: "PAN Card" },
    { value: "EDUCATION", label: "Educational Credentials" },
    { value: "EMPLOYMENT_LETTER", label: "Employment Letters" },
    { value: "OFFER_LETTER", label: "Offer Letters" },
    { value: "CONTRACT", label: "Contracts" },
    { value: "RESUME", label: "Resume" },
    { value: "PHOTO", label: "Photo" },
    { value: "EXPERIENCE", label: "Experience Certificate" },
    { value: "OTHER", label: "Other" },
  ];

  // Document status options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "VERIFIED", label: "Verified" },
    { value: "REJECTED", label: "Rejected" },
    { value: "EXPIRED", label: "Expired" },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar - Always visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          placeholder="Search documents by name, description, or employee name..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
        />
      </div>

      {/* Filters Toggle for Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-sm"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters {hasActiveFilters && "(Active)"}
          </span>
          {isFiltersOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Filters Container */}
      <div className={`${isFiltersOpen ? "block" : "hidden"} md:block`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-sm">
          {/* Document Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Document Type
            </label>
            <CustomDropdown
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
              options={documentTypes}
              placeholder="All Types"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <CustomDropdown
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={statusOptions}
              placeholder="All Status"
            />
          </div>

          {/* Employee Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Employee
            </label>
            <CustomDropdown
              value={employeeFilter}
              onChange={(value) => setEmployeeFilter(value)}
              options={[
                { value: "all", label: "All Employees" },
                ...employees.map((emp) => ({
                  value: emp.id,
                  label: `${emp.firstName} ${emp.lastName} (${emp.employeeId})`,
                })),
              ]}
              placeholder="All Employees"
            />
          </div>

          {/* Expiring Soon Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Expiring Soon
            </label>
            <CustomDropdown
              value={expiringSoonFilter ? "true" : "false"}
              onChange={(value) => setExpiringSoonFilter(value === "true")}
              options={[
                { value: "false", label: "All Documents" },
                { value: "true", label: "Expiring Soon" },
              ]}
              placeholder="All Documents"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="w-full px-4 py-2 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 dark:text-gray-400 dark:hover:text-gray-200 disabled:dark:text-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {globalFilter && (
            <span className="inline-flex items-center px-2 py-1 bg-brand-100 text-brand-800 text-xs rounded-full dark:bg-brand-900/30 dark:text-brand-400">
              Search: "{globalFilter}"
              <button
                onClick={() => setGlobalFilter("")}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full dark:bg-purple-900/30 dark:text-purple-400">
              Type: {documentTypes.find((t) => t.value === typeFilter)?.label}
              <button
                onClick={() => setTypeFilter("all")}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-400">
              Status: {statusOptions.find((s) => s.value === statusFilter)?.label}
              <button
                onClick={() => setStatusFilter("all")}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {employeeFilter !== "all" && (
            <span className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
              Employee: {employees.find((e) => e.id.toString() === employeeFilter)?.firstName || "Selected"}
              <button
                onClick={() => setEmployeeFilter("all")}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {expiringSoonFilter && (
            <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/30 dark:text-orange-400">
              Expiring Soon
              <button
                onClick={() => setExpiringSoonFilter(false)}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentFilters;
