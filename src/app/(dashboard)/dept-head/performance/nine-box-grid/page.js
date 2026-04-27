'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import {
  Grid3X3,
  Search,
  Download,
  User,
  Users
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";

export default function DeptHeadNineBoxGridPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState([]);
  
  // Get current year for dynamic options
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const [filters, setFilters] = useState({
    search: "",
    cycle: ""
  });

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await performanceManagementService.getNineBoxGridData({
        cycleId: filters.cycle
        // departmentId is auto-handled by backend for Dept Head
      });
      
      if (response.data && response.data.gridData) {
        setEmployees(response.data.gridData);
        setUnassignedEmployees(response.data.unassignedEmployees || []);
      } else if (response.gridData) {
        setEmployees(response.gridData);
        setUnassignedEmployees(response.unassignedEmployees || []); 
      } else {
        setEmployees(Array.isArray(response.data) ? response.data : []);
        setUnassignedEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching Nine-Box grid data:", error);
      toast.error(error.message || "Failed to load Nine-Box grid data");
      setEmployees([]);
      setUnassignedEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const getBoxColor = (performance, potential) => {
    if (performance >= 4.0 && potential >= 4.0) return "bg-emerald-500 text-white"; // Top Right - Stars
    if (performance >= 4.0 && potential >= 3.0) return "bg-blue-500 text-white"; // Top Middle - Solid Performers
    if (performance >= 4.0 && potential < 3.0) return "bg-purple-500 text-white"; // Top Left - Future Stars
    if (performance >= 3.0 && potential >= 4.0) return "bg-orange-500 text-white"; // Middle Right - High Potentials
    if (performance >= 3.0 && potential >= 3.0) return "bg-brand-500 text-white"; // Middle Middle - Core (Brand Color)
    if (performance >= 3.0 && potential < 3.0) return "bg-yellow-500 text-white"; // Middle Left - Steady Performers
    if (performance < 3.0 && potential >= 4.0) return "bg-red-500 text-white"; // Bottom Right - Problem Performers
    if (performance < 3.0 && potential >= 3.0) return "bg-indigo-500 text-white"; // Bottom Middle - Potential Issue
    return "bg-gray-400 text-white"; // Bottom Left - Underperformers
  };

  const getBoxLabel = (performance, potential) => {
    if (performance >= 4.0 && potential >= 4.0) return "Stars";
    if (performance >= 4.0 && potential >= 3.0) return "Solid Performers";
    if (performance >= 4.0 && potential < 3.0) return "Future Stars";
    if (performance >= 3.0 && potential >= 4.0) return "High Potentials";
    if (performance >= 3.0 && potential >= 3.0) return "Core";
    if (performance >= 3.0 && potential < 3.0) return "Steady Performers";
    if (performance < 3.0 && potential >= 4.0) return "Problem Performers";
    if (performance < 3.0 && potential >= 3.0) return "Potential Issue";
    return "Underperformers";
  };

  const getPerformanceColor = (score) => {
    if (score >= 4.5) return "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400";
    if (score >= 4.0) return "text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
    if (score >= 3.5) return "text-brand-700 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400";
    if (score >= 3.0) return "text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
    return "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
  };

  const getPotentialColor = (score) => {
    if (score >= 4) return "text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400";
    if (score >= 3) return "text-brand-700 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400";
    if (score >= 2) return "text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400";
    return "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
  };

  const filteredEmployees = employees.filter(employee => {
    const emp = employee.employee || employee;
    const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    const email = emp.email || '';
    const department = emp.department?.name || emp.department || '';

    return name.toLowerCase().includes(filters.search.toLowerCase()) ||
      email.toLowerCase().includes(filters.search.toLowerCase()) ||
      department.toLowerCase().includes(filters.search.toLowerCase());
  });

  const getEmployeesInBox = (row, col) => {
    return filteredEmployees.filter(emp => 
      emp.boxPosition && emp.boxPosition.row === row && emp.boxPosition.col === col
    );
  };

  const getEmployeeDisplayData = (employee) => {
    const emp = employee.employee || employee;
    return {
      name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown Employee',
      designation: emp.designation || emp.designation?.name || emp.position || 'Employee',
      department: emp.department || emp.department?.name || 'N/A',
      performanceScore: employee.performanceScore ?? 3.0,
      potentialScore: employee.potentialScore ?? 3.0,
      potential: employee.potential || 'N/A',
      managerName: employee.managerName || 'Not assigned',
      lastReviewDate: employee.lastReviewDate || 'No reviews',
      recommendedActions: employee.recommendedActions || null
    };
  };

  const handleBoxClick = (row, col) => {
    router.push(`/dept-head/performance/nine-box-grid/${row}/${col}`);
  };

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";
    return `"${String(value).replace(/"/g, '""')}"`;
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const assignedRows = filteredEmployees.map((employee) => {
        const displayData = getEmployeeDisplayData(employee);
        return [
          displayData.name,
          displayData.designation,
          displayData.department,
          displayData.performanceScore,
          displayData.potentialScore,
          displayData.potential,
          getBoxLabel(displayData.performanceScore, displayData.potentialScore),
          displayData.managerName,
          displayData.lastReviewDate,
          displayData.recommendedActions || "",
          "Assigned",
        ];
      });

      const unassignedRows = unassignedEmployees.map((employee) => [
        employee.name || "Unknown Employee",
        employee.designation || "N/A",
        employee.department || "N/A",
        "",
        "",
        "",
        "Unassigned",
        employee.managerName || "Not assigned",
        employee.lastReviewDate || "",
        "",
        "Unassigned",
      ]);

      const rows = [
        [
          "Employee Name",
          "Designation",
          "Department",
          "Performance Score",
          "Potential Score",
          "Potential",
          "9-Box Category",
          "Manager",
          "Last Review Date",
          "Recommended Actions",
          "Assignment Status",
        ],
        ...assignedRows,
        ...unassignedRows,
      ];

      const csvContent = rows
        .map((row) => row.map(escapeCsvValue).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `dept-head-nine-box-grid-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("9-Box grid exported");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const getBoxLabelForPosition = (row, col) => {
    const labels = {
      '1,1': 'Stars',
      '1,2': 'High Performers',
      '1,3': 'Solid Performers',
      '2,1': 'Future Stars',
      '2,2': 'Core',
      '2,3': 'Steady Performers',
      '3,1': 'High Potentials',
      '3,2': 'Potential Issues',
      '3,3': 'Problem Performers'
    };
    return labels[`${col},${row}`] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Department Head", href: "/dept-head" },
            { label: "Performance", href: "/dept-head/performance" },
            { label: "9-Box Grid", href: "/dept-head/performance/nine-box-grid" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              9-Box Grid
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Talent placement matrix based on performance and potential
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={loading || exporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              {exporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap lg:flex-nowrap items-center gap-4">
        <div className="relative w-full lg:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>
        <div className="flex w-full lg:w-auto overflow-x-auto gap-4">
          <select
            value={filters.cycle}
            onChange={(e) => setFilters({ ...filters, cycle: e.target.value })}
            className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-w-[140px]"
          >
            <option value="">All Cycles</option>
            <option value={`Q4 ${previousYear}`}>Q4 {previousYear}</option>
            <option value={`Q3 ${previousYear}`}>Q3 {previousYear}</option>
            <option value={`Q1 ${currentYear}`}>Q1 {currentYear}</option>
          </select>
        </div>
      </div>

      {/* 9-Box Grid */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-full">
                <Grid3X3 size={16} className="text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance vs Potential Matrix</h3>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Click on a box to view details
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs mt-3 px-1">
            {[
              { color: 'bg-emerald-500', label: 'Stars' },
              { color: 'bg-blue-500', label: 'Solid Performers' },
              { color: 'bg-purple-500', label: 'Future Stars' },
              { color: 'bg-orange-500', label: 'High Potentials' },
              { color: 'bg-brand-500', label: 'Core' },
              { color: 'bg-yellow-500', label: 'Steady Performers' },
              { color: 'bg-red-500', label: 'Problem Performers' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${item.color} rounded-sm`}></div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Header Row */}
          <div className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">High Potential</div>
          <div className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Medium Potential</div>
          <div className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Low Potential</div>

          {/* Grid Rows */}
          {/* Row 1: High Performance */}
          <div className="space-y-4">
            <div className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 rotate-0 md:-rotate-90 md:absolute md:-left-8 md:top-24 mb-2 md:mb-0">High Perf</div>
            <div className="grid grid-cols-3 gap-4 relative">
              {[1, 2, 3].map(col => {
                const boxEmployees = getEmployeesInBox(1, col);
                const employeeCount = boxEmployees.length;
                return (
                  <div
                    key={col}
                    onClick={() => handleBoxClick(1, col)}
                    className={`h-32 rounded-sm p-4 ${getBoxColor(4.5, 4)} flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border border-white/10`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{employeeCount}</div>
                      <div className="text-xs font-medium text-white/90 uppercase tracking-wide">{getBoxLabelForPosition(1, col)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2: Medium Performance */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(col => {
                const boxEmployees = getEmployeesInBox(2, col);
                const employeeCount = boxEmployees.length;
                return (
                  <div
                    key={col}
                    onClick={() => handleBoxClick(2, col)}
                    className={`h-32 rounded-sm p-4 ${getBoxColor(3.5, 3)} flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border border-white/10`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{employeeCount}</div>
                      <div className="text-xs font-medium text-white/90 uppercase tracking-wide">{getBoxLabelForPosition(2, col)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 3: Low Performance */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(col => {
                const boxEmployees = getEmployeesInBox(3, col);
                const employeeCount = boxEmployees.length;
                return (
                  <div
                    key={col}
                    onClick={() => handleBoxClick(3, col)}
                    className={`h-32 rounded-sm p-4 ${getBoxColor(2.5, 2)} flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border border-white/10`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{employeeCount}</div>
                      <div className="text-xs font-medium text-white/90 uppercase tracking-wide">{getBoxLabelForPosition(3, col)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Employee Details Cards */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-brand-600" />
            Recent Employee Updates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.slice(0, 6).map((employee) => {
              const displayData = getEmployeeDisplayData(employee);

              return (
                <div key={employee.id} className="border border-gray-200 dark:border-gray-700 rounded-sm p-4 bg-gray-50/30 dark:bg-gray-800/50 hover:border-brand-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{displayData.name}</div>
                      <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">{displayData.designation}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{displayData.department}</div>
                    </div>
                    <div className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm text-white ${getBoxColor(displayData.performanceScore, displayData.potentialScore).split(" ")[0]}`}>
                      {getBoxLabel(displayData.performanceScore, displayData.potentialScore)}
                    </div>
                  </div>

                  <div className="space-y-2 bg-white dark:bg-gray-900 p-3 rounded-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Performance</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 font-bold rounded-sm ${getPerformanceColor(displayData.performanceScore)}`}>
                        {displayData.performanceScore}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Potential</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 font-bold rounded-sm ${getPotentialColor(displayData.potentialScore)}`}>
                        {displayData.potential}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unassigned Employees Section */}
        {unassignedEmployees.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-brand-600" />
              Unassigned Employees (No Performance/Potential Data)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedEmployees.map((employee) => (
                <div key={employee.id} className="border border-gray-200 dark:border-gray-700 rounded-sm p-4 bg-gray-50/30 dark:bg-gray-800/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.designation}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
