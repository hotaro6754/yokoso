'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Target,
  TrendingUp,
  Calendar,
  User,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { performanceManagementService } from '@/services/hr-services/performance-management.service';
import { employeeService } from '@/services/hr-services/employeeService';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function KpiAssignmentPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    status: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    kpiId: '',
    targetValue: '',
    potentialRating: '',
    actualValue: '',
    period: '',
    comments: '',
    status: 'NOT_STARTED'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, employeesRes, departmentsRes, kpisRes] = await Promise.all([
        performanceManagementService.getKpiAssignments(),
        employeeService.getAllEmployees(),
        employeeService.getDepartments(),
        performanceManagementService.getKpis()
      ]);

      const assignmentsList = Array.isArray(assignmentsRes) ? assignmentsRes : assignmentsRes?.data || [];
      setAssignments(assignmentsList);
      setEmployees(employeesRes.data || []);
      setDepartments(departmentsRes.data || []);
      const kpisList = Array.isArray(kpisRes) ? kpisRes : kpisRes?.data || [];
      setKpis(kpisList);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleKpiChange = (e) => {
    const selectedKpiId = e.target.value;
    const selectedKpi = kpis.find(k => (k.id ?? k._id) == selectedKpiId);
    
    setFormData(prev => ({
      ...prev,
      kpiId: selectedKpiId,
      targetValue: selectedKpi ? (selectedKpi.targetValue?.toString() || '') : ''
    }));
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);
    setFormData({
      employeeId: assignment.employee?.id || '',
      kpiId: assignment.kpi?.id || '',
      targetValue: assignment.targetValue?.toString() || '',
      potentialRating: assignment.potentialRating?.toString() || '',
      actualValue: assignment.actualValue?.toString() || '',
      period: assignment.period || '',
      comments: assignment.notes || '', // API uses 'notes' not 'comments'
      status: assignment.isActive ? 'IN_PROGRESS' : 'NOT_STARTED' // Map isActive to status
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.employeeId) {
        toast.error('Employee is required');
        return;
      }
      if (!formData.kpiId) {
        toast.error('KPI is required');
        return;
      }
      if (!formData.period) {
        toast.error('Period is required');
        return;
      }

      const submitData = {
        ...formData,
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : null,
        potentialRating: formData.potentialRating ? parseFloat(formData.potentialRating) : null,
        actualValue: formData.actualValue ? parseFloat(formData.actualValue) : null,
        notes: formData.comments, // Map comments to notes for API
        isActive: formData.status === 'IN_PROGRESS' || formData.status === 'COMPLETED' // Map status to isActive
      };

      if (editingId === 'new') {
        await performanceManagementService.createKpiAssignment(submitData);
        toast.success('KPI assigned successfully');
      } else {
        await performanceManagementService.updateKpiAssignment(editingId, submitData);
        toast.success('KPI assignment updated successfully');
      }

      setEditingId(null);
      setFormData({
        employeeId: '',
        kpiId: '',
        targetValue: '',
        potentialRating: '',
        actualValue: '',
        period: '',
        comments: '',
        status: 'NOT_STARTED'
      });
      fetchData();
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error(error.message || 'Failed to save assignment');
    }
  };

  const handleDelete = (id) => {
    setAssignmentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await performanceManagementService.deleteKpiAssignment(assignmentToDelete);
      toast.success('KPI assignment deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    } finally {
      setShowDeleteModal(false);
      setAssignmentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAssignmentToDelete(null);
  };

  const getAchievementLevel = (target, actual) => {
    if (!target || !actual) return 'NOT_STARTED';
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return 'EXCEEDED';
    if (percentage >= 90) return 'ACHIEVED';
    if (percentage >= 70) return 'PARTIALLY_ACHIEVED';
    return 'NOT_ACHIEVED';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'IN_PROGRESS': return 'bg-[var(--color-primary-hover)] text-[#0b1220] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)]';
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getAchievementColor = (level) => {
    switch (level) {
      case 'EXCEEDED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'ACHIEVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PARTIALLY_ACHIEVED': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'NOT_ACHIEVED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const employee = assignment.employee || {};
    const employeeName = (employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`).trim().toLowerCase();
    const kpiName = (assignment.kpi?.name || '').toLowerCase();
    const deptName = (employee.department?.name || '').toLowerCase();

    const matchesSearch = employeeName.includes(searchTerm.toLowerCase()) || kpiName.includes(searchTerm.toLowerCase());
    const matchesDept = !filters.department || deptName === filters.department.toLowerCase();
    const matchesStatus = !filters.status || (assignment.isActive ? 'ACTIVE' : 'INACTIVE') === filters.status;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Calculate summary stats
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.isActive).length;
  const completedAssignments = assignments.filter(a => {
    // logic for "completed" based on achievement or status
    return (a.actualValue / a.targetValue) >= 1;
  }).length;
  const completionRate = totalAssignments ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Performance", href: "/hr/performance" },
            { label: "KPI Assignment", href: "/hr/performance/kpi-assignment" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              KPI Assignment
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Assign and track Key Performance Indicators
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editingId && (
              <button
                onClick={() => {
                  setEditingId('new');
                  setFormData({
                    employeeId: '',
                    kpiId: '',
                    targetValue: '',
                    potentialRating: '',
                    actualValue: '',
                    period: '',
                    comments: '',
                    status: 'NOT_STARTED'
                  });
                }}
                className="inline-flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-[#0b1220] shadow-sm transition bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
              >
                <Plus className="h-4 w-4" />
                Assign KPI
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!editingId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assignments</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <Target size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalAssignments}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Goals</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <TrendingUp size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeAssignments}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <CheckCircle size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</div>
          </div>
        </div>
      )}

      {/* KPI Assignment Form */}
      {editingId && (
        <>
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
          <div className="my-6 rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId === 'new' ? 'Assign New KPI' : 'Edit KPI Assignment'}
            </h3>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData({});
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <User className="inline h-3 w-3 mr-1" />
                Employee *
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => {
                  const empId = emp.employee?.id || emp.id;
                  return (
                    <option key={emp.id} value={empId}>
                      {emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || `Employee ${emp.id}`} - {emp.employee?.department?.name || emp.department?.name || 'N/A'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Target className="inline h-3 w-3 mr-1" />
                KPI *
              </label>
              <select
                value={formData.kpiId}
                onChange={handleKpiChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select KPI</option>
                {kpis.map(kpi => {
                  const kpiId = kpi.id ?? kpi._id;
                  const status = (kpi.status || 'ACTIVE').toUpperCase();
                  return (
                  <option key={kpiId} value={kpiId}>
                    {kpi.name} ({kpi.weight}%){status === 'INACTIVE' ? ' - Inactive' : ''}
                  </option>
                )})}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Target className="inline h-3 w-3 mr-1" />
                Target Value *
              </label>
              <input
                type="number"
                value={formData.targetValue}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                placeholder="Auto-filled from KPI"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Target className="inline h-3 w-3 mr-1" />
                Potential Rating (1-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.potentialRating || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, potentialRating: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., 4.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Actual Value
              </label>
              <input
                type="number"
                value={formData.actualValue}
                onChange={(e) => setFormData(prev => ({ ...prev, actualValue: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., 85"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Calendar className="inline h-3 w-3 mr-1" />
                Period *
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Period</option>
                <option value={`Q1-${new Date().getFullYear()}`}>Q1 {new Date().getFullYear()}</option>
                <option value={`Q2-${new Date().getFullYear()}`}>Q2 {new Date().getFullYear()}</option>
                <option value={`Q3-${new Date().getFullYear()}`}>Q3 {new Date().getFullYear()}</option>
                <option value={`Q4-${new Date().getFullYear()}`}>Q4 {new Date().getFullYear()}</option>
                <option value={`H1-${new Date().getFullYear()}`}>H1 {new Date().getFullYear()}</option>
                <option value={`H2-${new Date().getFullYear()}`}>H2 {new Date().getFullYear()}</option>
                <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Comments
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={2}
                placeholder="Add comments or notes"
              />
            </div>
          </div>

          {/* Save and Cancel buttons */}
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
              {editingId === 'new' ? 'Assign KPI' : 'Save Changes'}
            </button>
          </div>
        </div>
        </>
      )}

      {/* KPI Assignments Table - Show only when not editing */}
      {!editingId && (
        <>
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />
            </div>

            <div className="flex w-full sm:w-auto gap-4">
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <option value="">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-primary-hover)]/70 text-xs uppercase tracking-wide text-gray-700 dark:bg-[var(--color-primary)]/10 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Employee</th>
                    <th className="px-6 py-3 text-left font-medium">KPI</th>
                    <th className="px-6 py-3 text-left font-medium">Target</th>
                    <th className="px-6 py-3 text-left font-medium">Actual</th>
                    <th className="px-6 py-3 text-left font-medium">Achievement</th>
                    <th className="px-6 py-3 text-left font-medium">Period</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredAssignments.map((assignment) => {
                    const achievementLevel = getAchievementLevel(assignment.targetValue, assignment.actualValue);
                    return (
                      <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {assignment.employee ?
                                `${assignment.employee.firstName || ''} ${assignment.employee.lastName || ''}`.trim() || 'Unknown Employee' :
                                'Unknown Employee'
                              }
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {assignment.employee?.department?.name || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {assignment.kpi?.name || 'Unknown KPI'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {assignment.kpi?.kpiType || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {assignment.targetValue !== null && assignment.targetValue !== undefined ? assignment.targetValue : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {assignment.actualValue !== null && assignment.actualValue !== undefined ? assignment.actualValue : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${getAchievementColor(achievementLevel)}`}>
                            {achievementLevel ? achievementLevel.replace(/_/g, ' ') : 'NOT STARTED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {assignment.period || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(assignment.isActive ? 'ACTIVE' : 'INACTIVE')}`}>
                            {assignment.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(assignment)}
                              className="text-gray-600 hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:text-[var(--color-primary)]"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(assignment.id)}
                              className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredAssignments.length === 0 && (
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">No KPI assignments found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by assigning a KPI to an employee.
                </p>
              </div>
            )}
          </div>
        </>
      )}
      
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete KPI Assignment"
        description="Are you sure you want to delete this KPI assignment? This action cannot be undone."
        confirmText="Delete Assignment"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
