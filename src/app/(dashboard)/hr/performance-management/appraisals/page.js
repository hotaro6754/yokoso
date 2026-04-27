"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Building, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Eye,
  Download,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";

export default function HRAppraisals() {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    cycle: 'all',
    department: 'all',
    search: ''
  });
  const [cycles, setCycles] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchAppraisals();
    fetchCycles();
    fetchDepartments();
  }, [filters]);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const response = await performanceManagementService.getAllAppraisals(filters);
      setAppraisals(response.data || []);
    } catch (error) {
      console.error("Failed to fetch appraisals:", error);
      toast.error("Failed to load appraisals");
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    try {
      const response = await performanceManagementService.getAppraisalCycles();
      setCycles(response.data || []);
    } catch (error) {
      console.error("Failed to fetch cycles:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, using mock data
      setDepartments([
        { id: 1, name: "Engineering" },
        { id: 2, name: "Sales" },
        { id: 3, name: "HR" },
        { id: 4, name: "Marketing" },
        { id: 5, name: "Finance" }
      ]);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
      'PENDING_MANAGER_REVIEW': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Manager Review' },
      'PENDING_EMPLOYEE_ACKNOWLEDGMENT': { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Pending Acknowledgment' },
      'PENDING_HR_MODERATION': { color: 'bg-purple-100 text-purple-800', icon: AlertCircle, label: 'Pending HR Moderation' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig['DRAFT'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return "text-emerald-600 bg-emerald-50";
    if (score >= 4.0) return "text-green-600 bg-green-50";
    if (score >= 3.5) return "text-blue-600 bg-blue-50";
    if (score >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    toast.success("Export functionality coming soon!");
  };

  const handleViewDetails = (appraisal) => {
    // Navigate to detailed view
    window.location.href = `/hr/performance-management/appraisals/${appraisal.id}`;
  };

  const stats = {
    total: appraisals.length,
    completed: appraisals.filter(a => a.status === 'COMPLETED').length,
    pending: appraisals.filter(a => a.status.includes('PENDING')).length,
    avgScore: appraisals.filter(a => a.overallRating).reduce((sum, a) => sum + a.overallRating, 0) / appraisals.filter(a => a.overallRating).length || 0
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Employee Appraisals
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage all employee performance appraisals across the organization
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Appraisals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore.toFixed(1)}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by employee name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>



            <select
              value={filters.cycle}
              onChange={(e) => handleFilterChange('cycle', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Cycles</option>
              {cycles.map(cycle => (
                <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
              ))}
            </select>

            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Appraisals Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : appraisals.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center dark:bg-gray-700">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Appraisals Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No appraisals match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Cycle</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Emp. Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Mgr. Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Final Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Submitted</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {appraisals.map((appraisal) => (
                    <tr key={appraisal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center dark:bg-gray-600">
                            <User size={16} className="text-gray-600 dark:text-gray-300" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {appraisal.employee?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {appraisal.employee?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {appraisal.appraisalCycle?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {appraisal.appraisalCycle?.startDate && appraisal.appraisalCycle?.endDate ? 
                            `${new Date(appraisal.appraisalCycle.startDate).toLocaleDateString()} - ${new Date(appraisal.appraisalCycle.endDate).toLocaleDateString()}` 
                            : 'N/A'
                          }
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Building size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {appraisal.employee?.department || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {appraisal.employeeSelfRating ? (
                          <span className={`inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full ${getScoreColor(appraisal.employeeSelfRating)}`}>
                            {appraisal.employeeSelfRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {appraisal.overallRating ? (
                          <span className={`inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full ${getScoreColor(appraisal.overallRating)}`}>
                            {appraisal.overallRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {appraisal.finalScore ? (
                          <span className={`inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full ${getScoreColor(appraisal.finalScore)}`}>
                            {appraisal.finalScore.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {appraisal.submittedAt ? new Date(appraisal.submittedAt).toLocaleDateString() : 'N/A'}
                        </div>
                        {appraisal.completedAt && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Completed: {new Date(appraisal.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(appraisal)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye size={16} />
                          </button>
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
    </div>
  );
}
