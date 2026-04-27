'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import {
  Grid3X3,
  Search,
  Filter,
  Download,
  Star,
  TrendingUp,
  TrendingDown,
  User,
  Users,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { employeeService } from "@/services/hr-services/employeeService";

export default function NineBoxGridPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Get current year for dynamic options
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const [filters, setFilters] = useState({
    search: "",
    department: "",
    cycle: ""
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const response = await employeeService.getAllEmployees();
      const employees = response.data || [];
      const uniqueDepartments = [...new Set(employees.map(emp => emp.department?.name).filter(Boolean))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await performanceManagementService.getNineBoxGridData({
        cycleId: filters.cycle,
        departmentId: filters.department
      });
      
      if (response && response.gridData) {
        setEmployees(response.gridData);
        setUnassignedEmployees(response.unassignedEmployees || []);
      } else {
        setEmployees(Array.isArray(response) ? response : []);
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

  const getBoxColor = (row, col) => {
    // 1=High, 2=Medium, 3=Low
    const colors = {
      '1,1': 'bg-emerald-500', // Star
      '2,1': 'bg-blue-500',    // High Performer
      '3,1': 'bg-cyan-500',    // Core Performer
      
      '1,2': 'bg-blue-400',    // High Potential
      '2,2': 'bg-brand-500',   // Key Player
      '3,2': 'bg-yellow-500',  // Inconsistent (Mod Perf)
      
      '1,3': 'bg-indigo-400',  // Potential Star
      '2,3': 'bg-orange-500',  // Potential Issue
      '3,3': 'bg-red-500'      // Talent Risk
    };
    return `${colors[`${col},${row}`] || 'bg-gray-400'} text-white`;
  };

  const getBoxLabel = (row, col) => {
    const labels = {
      '1,1': 'Star',
      '2,1': 'High Performer',
      '3,1': 'Core Performer',
      '1,2': 'High Potential',
      '2,2': 'Key Player',
      '3,2': 'Inconsistent',
      '1,3': 'Potential Star',
      '2,3': 'Potential Issue',
      '3,3': 'Talent Risk'
    };
    return labels[`${col},${row}`] || 'Unknown';
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
    const result = filteredEmployees.filter(emp => {
      return emp.boxPosition && emp.boxPosition.row === row && emp.boxPosition.col === col;
    });
    return result;
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

  const handlePotentialChange = async (employeeId, newPotential) => {
    try {
      const potentialScores = { Low: 2, Medium: 3, High: 4 };
      const employeePosition = employees.find(emp => emp.id === employeeId);
      if (!employeePosition) throw new Error('Employee position not found');

      await performanceManagementService.updateNineBoxPositionPotential(
        employeePosition.id,
        newPotential
      );

      setEmployees(prev => {
        return prev.map(emp => {
          if (emp.id === employeeId) {
            return {
              ...emp,
              potential: newPotential,
              potentialScore: potentialScores[newPotential]
            };
          }
          return emp;
        });
      });
      toast.success("Potential updated successfully");
    } catch (error) {
      console.error('Error updating potential:', error);
      toast.error(error.message || 'Failed to update potential');
    }
  };

  const handleBatchCreate = async () => {
    try {
      setBatchLoading(true);
      const currentYear = new Date().getFullYear();
      const period = currentYear.toString();

      const response = await performanceManagementService.batchCreateNineBoxPositions({
        period,
        cycleId: filters.cycle || null,
        departmentId: filters.department || null
      });

      toast.success(`Created ${response?.length || 0} Nine-Box positions successfully`);
      fetchEmployees();
    } catch (error) {
      console.error('Error creating batch Nine-Box positions:', error);
      toast.error(error.message || 'Failed to create Nine-Box positions');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleExport = () => {
    try {
      if (employees.length === 0) {
        toast.error("No data available to export");
        return;
      }

      // Format data for CSV
    const exportData = employees.map(emp => {
      const display = getEmployeeDisplayData(emp);
      return {
        "Employee Name": display.name,
        "Employee ID": emp.employee?.employeeId || emp.employeeId || 'N/A',
        "Department": display.department,
        "Designation": display.designation,
        "Performance Score": display.performanceScore,
        "Potential Score": display.potentialScore,
        "Potential Level": display.potential,
        "Grid Position": getBoxLabel(emp.boxPosition?.row, emp.boxPosition?.col),
        "Manager": display.managerName,
        "Last Review": display.lastReviewDate
      };
    });

      // Convert to CSV string - simple implementation
      const headers = Object.keys(exportData[0]).join(",");
      const rows = exportData.map(obj => 
        Object.values(obj).map(val => {
          const stringVal = (val === null || val === undefined) ? "" : String(val);
          return stringVal.includes(',') ? `"${stringVal}"` : stringVal;
        }).join(",")
      ).join("\n");
      
      const csvContent = "\uFEFF" + headers + "\n" + rows;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Nine_Box_Grid_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Grid data exported successfully!");
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Export failed: " + error.message);
    }
  };

  const handleBoxClick = (row, col) => {
    router.push(`/hr/performance/nine-box-grid/${row}/${col}`);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Performance", href: "/hr/performance" },
            { label: "9-Box Grid", href: "/hr/performance/nine-box-grid" },
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
              onClick={handleBatchCreate}
              disabled={batchLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0b1220] bg-[var(--color-primary)] rounded-sm hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {batchLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Users size={16} />
              )}
              {batchLoading ? 'Creating...' : 'Auto-Generate Grid'}
            </button>
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={16} />
              Export
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
            className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>
        <div className="flex w-full lg:w-auto overflow-x-auto gap-4">
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-w-[160px]"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={filters.cycle}
            onChange={(e) => setFilters({ ...filters, cycle: e.target.value })}
            className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-w-[140px]"
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
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <Grid3X3 size={16} className="text-[var(--color-primary)]" />
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
              { color: 'bg-[var(--color-primary)]', label: 'Core' },
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
                    className={`h-32 rounded-sm p-4 ${getBoxColor(1, col)} flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border border-white/10`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{employeeCount}</div>
                      <div className="text-xs font-medium text-white/90 uppercase tracking-wide">{getBoxLabel(1, col)}</div>
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
                    className={`h-32 rounded-sm p-4 ${getBoxColor(2, col)} flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border border-white/10`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{employeeCount}</div>
                      <div className="text-xs font-medium text-white/90 uppercase tracking-wide">{getBoxLabel(2, col)}</div>
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
                    className={`h-32 rounded-sm p-4 ${getBoxColor(3, col)} flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border border-white/10`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{employeeCount}</div>
                      <div className="text-xs font-medium text-white/90 uppercase tracking-wide">{getBoxLabel(3, col)}</div>
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
              <User size={18} className="text-[var(--color-primary)]" />
              Recent Employee Updates
            </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.slice(0, 6).map((employee) => {
              const displayData = getEmployeeDisplayData(employee);

              return (
                <div key={employee.id} className="border border-gray-200 dark:border-gray-700 rounded-sm p-4 bg-gray-50/30 dark:bg-gray-800/50 hover:border-[var(--color-primary)]/60 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{displayData.name}</div>
                      <div className="text-xs text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium">{displayData.designation}</div>
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

                  {/* Potential Update Removed */}
                </div>
              );
            })}
          </div>
        </div>

        {/* Unassigned Employees Section */}
        {unassignedEmployees.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-[var(--color-primary)]" />
              Unassigned Employees (No Performance/Potential Data)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedEmployees.map((employee) => (
                <div key={employee.id} className="border border-gray-200 dark:border-gray-700 rounded-sm p-4 bg-gray-50/30 dark:bg-gray-800/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {employee.name || `${employee.firstName} ${employee.lastName}`}
                      </div>
                      <div className="text-xs text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium">
                        {employee.designation || employee.designation?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{employee.department || employee.department?.name || 'N/A'}</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Unassigned
                    </span>
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
