'use client';



import React, { useState, useEffect } from "react";

import Link from 'next/link';

import Breadcrumb from '@/components/common/Breadcrumb';

import DatePicker from '@/components/common/DatePicker';

import ActionDropdown from '@/app/(dashboard)/master-admin/components/ActionDropdown';

import { apiClient } from '@/lib/api';

import {

  Calendar,

  Download,

  Search,

  Filter,

  X,

  Eye,

  ChevronLeft,

  ChevronRight,

  ChevronsLeft,

  ChevronsRight,

  User,

  Building,

  FileText,

  DollarSign,

  Clock,

  Shield,

  CheckCircle,

  XCircle,

  AlertTriangle,

  Info,

  Plus,

  Edit,

  Trash2,

  ThumbsUp,

  ThumbsDown,

  LogIn,

  Globe,

  Smartphone,

  Monitor

} from 'lucide-react';



export default function AuditLogsPage() {

  const [auditLogs, setAuditLogs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState(null);

  const [showDrawer, setShowDrawer] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    const fetchAuditLogs = async (page = 1, filters = {}) => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
          ...(searchTerm && { search: searchTerm }),
          // IMPORTANT: Must be "performedByRole" not "role" or "selectedRole"
          ...(selectedRole && { performedByRole: selectedRole }),
          ...(dateRange.from && { dateFrom: dateRange.from }),
          ...(dateRange.to && { dateTo: dateRange.to }),
        });

        // DEBUG: Log the exact URL being called
        console.log('Fetching audit logs with URL:', `/master-admin/audit-logs?${params}`);

        const response = await apiClient.get(`/master-admin/audit-logs?${params}`);

        // DEBUG: Log the response
        console.log('API Response:', response.data);

        if (response.data.success) {
          setAuditLogs(response.data.data || []);
          // setPagination(response.data.pagination || pagination); // Uncomment if pagination is in response
        } else {
          console.error('Failed to fetch audit logs:', response.data.message);
          setAuditLogs([]);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        // Fallback to mock data for development
        console.log('Using mock data due to API error');
        await new Promise(resolve => setTimeout(resolve, 1000));

        setAuditLogs([
          {
            id: 1,
            timestamp: '2024-01-20 10:30:45',
            event: 'Employee profile updated',
            module: 'Employee',
            actionType: 'Update',
            performedBy: { name: 'John Smith', email: 'john.smith@company.com', role: 'HR Admin' },
            target: { type: 'Employee', name: 'Sarah Johnson', id: 'EMP001' },
            status: 'Success',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            changes: {
              before: { department: 'Sales', salary: '$50,000' },
              after: { department: 'Marketing', salary: '$55,000' }
            }
          },
          {
            id: 2,
            timestamp: '2024-01-20 09:15:22',
            event: 'New employee created',
            module: 'Employee',
            actionType: 'Create',
            performedBy: { name: 'Emily Davis', email: 'emily.davis@company.com', role: 'HR Admin' },
            target: { type: 'Employee', name: 'Michael Brown', id: 'EMP002' },
            status: 'Success',
            ipAddress: '192.168.1.101',
            device: 'Safari on Mac',
            changes: {
              before: {},
              after: { name: 'Michael Brown', email: 'michael.brown@company.com', department: 'IT' }
            }
          },
          {
            id: 3,
            timestamp: '2024-01-20 08:45:10',
            event: 'Payroll processed',
            module: 'Payroll',
            actionType: 'Approve',
            performedBy: { name: 'Robert Wilson', email: 'robert.wilson@company.com', role: 'Payroll Admin' },
            target: { type: 'Payroll', name: 'January 2024 Payroll', id: 'PAY001' },
            status: 'Success',
            ipAddress: '192.168.1.102',
            device: 'Firefox on Windows',
            changes: {
              before: { status: 'Pending' },
              after: { status: 'Approved' }
            }
          },
          {
            id: 4,
            timestamp: '2024-01-19 16:20:33',
            event: 'Leave request rejected',
            module: 'Leave',
            actionType: 'Reject',
            performedBy: { name: 'Lisa Anderson', email: 'lisa.anderson@company.com', role: 'HR Admin' },
            target: { type: 'Leave Request', name: 'Annual Leave - James Taylor', id: 'LEAVE001' },
            status: 'Success',
            ipAddress: '192.168.1.103',
            device: 'Chrome on Windows',
            changes: {
              before: { status: 'Pending' },
              after: { status: 'Rejected', reason: 'Insufficient leave balance' }
            }
          },
          {
            id: 5,
            timestamp: '2024-01-19 14:10:15',
            event: 'Failed login attempt',
            module: 'Security',
            actionType: 'Login',
            performedBy: { name: 'Unknown', email: 'unknown@external.com', role: 'External' },
            target: { type: 'System', name: 'HRMS Portal', id: 'SYS001' },
            status: 'Failed',
            ipAddress: '192.168.1.200',
            device: 'Unknown Device',
            changes: {}
          },
          {
            id: 6,
            timestamp: '2024-01-19 11:30:45',
            event: 'Policy updated',
            module: 'Policy',
            actionType: 'Update',
            performedBy: { name: 'David Martinez', email: 'david.martinez@company.com', role: 'Master Admin' },
            target: { type: 'Policy', name: 'Remote Work Policy', id: 'POL001' },
            status: 'Success',
            ipAddress: '192.168.1.104',
            device: 'Chrome on Windows',
            changes: {
              before: { maxRemoteDays: '2' },
              after: { maxRemoteDays: '3' }
            }
          },
          {
            id: 7,
            timestamp: '2024-01-19 10:15:20',
            event: 'Company deleted',
            module: 'Company',
            actionType: 'Delete',
            performedBy: { name: 'Jennifer Lee', email: 'jennifer.lee@company.com', role: 'Master Admin' },
            target: { type: 'Company', name: 'Old Company Ltd', id: 'COMP001' },
            status: 'Success',
            ipAddress: '192.168.1.105',
            device: 'Safari on Mac',
            changes: {
              before: { name: 'Old Company Ltd', status: 'Active' },
              after: { name: 'Old Company Ltd', status: 'Deleted' }
            }
          },
          {
            id: 8,
            timestamp: '2024-01-18 15:45:30',
            event: 'Employee terminated',
            module: 'Employee',
            actionType: 'Delete',
            performedBy: { name: 'John Smith', email: 'john.smith@company.com', role: 'HR Admin' },
            target: { type: 'Employee', name: 'William Garcia', id: 'EMP003' },
            status: 'Success',
            ipAddress: '192.168.1.106',
            device: 'Chrome on Windows',
            changes: {
              before: { status: 'Active', employmentDate: '2020-01-15' },
              after: { status: 'Terminated', terminationDate: '2024-01-18' }
            }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, [searchTerm, selectedRole, dateRange, currentPage, itemsPerPage]);



  // Filter logic
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !selectedRole || log.performedBy.role === selectedRole;

    // Date range filtering
    const logDate = (log.timestamp || '').split(' ')[0]; // "YYYY-MM-DD"

    // Helper to convert dd-mm-yyyy to yyyy-mm-dd
    const convertDate = (d) => {
      if (!d) return null;
      const [day, month, year] = d.split('-');
      return `${year}-${month}-${day}`;
    };

    const fromDate = convertDate(dateRange.from);
    const toDate = convertDate(dateRange.to);

    const matchesFrom = !fromDate || (logDate && logDate >= fromDate);
    const matchesTo = !toDate || (logDate && logDate <= toDate);

    return (
      matchesSearch &&
      matchesRole &&
      matchesFrom &&
      matchesTo
    );
  });



  // Pagination

  const indexOfLastItem = currentPage * itemsPerPage;

  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);



  // Helper functions

  const getStatusColor = (status) => {

    switch (status) {

      case 'Success': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';

      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';

      case 'Warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';

      case 'Info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';

      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';

    }

  };



  const getActionColor = (action) => {

    switch (action) {

      case 'Create': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';

      case 'Update': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';

      case 'Delete': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';

      case 'Approve': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';

      case 'Reject': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';

      case 'Login': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';

      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';

    }

  };



  const getModuleIcon = (module) => {

    switch (module) {

      case 'Employee': return <User size={16} />;

      case 'Company': return <Building size={16} />;

      case 'Payroll': return <DollarSign size={16} />;

      case 'Leave': return <Clock size={16} />;

      case 'Policy': return <FileText size={16} />;

      case 'Security': return <Shield size={16} />;

      default: return <FileText size={16} />;

    }

  };



  const getActionIcon = (action) => {

    switch (action) {

      case 'Create': return <Plus size={16} />;

      case 'Update': return <Edit size={16} />;

      case 'Delete': return <Trash2 size={16} />;

      case 'Approve': return <ThumbsUp size={16} />;

      case 'Reject': return <ThumbsDown size={16} />;

      case 'Login': return <LogIn size={16} />;

      default: return <Info size={16} />;

    }

  };



  const handleViewDetails = (log) => {

    setSelectedLog(log);

    setShowDrawer(true);

  };



  const handleExportLogs = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        // IMPORTANT: Must be "performedByRole" 
        ...(selectedRole && { performedByRole: selectedRole }),
        ...(dateRange.from && { dateFrom: dateRange.from }),
        ...(dateRange.to && { dateTo: dateRange.to }),
        limit: '10000',
      });

      console.log('Exporting with URL:', `/master-admin/audit-logs/export?${params}`);

      const response = await apiClient.get(`/master-admin/audit-logs/export?${params}`, {
        responseType: 'blob',
      });

      // Create download link for the blob
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting audit logs:', error);
      // Fallback to client-side export with current filtered data
      console.log('Using client-side export due to API error');

      const rows = filteredLogs.map((log) => ({
        Timestamp: log.timestamp,
        Event: log.event,
        Module: log.module,
        Action: log.actionType,
        PerformedBy: log.performedBy?.name || '',
        PerformerEmail: log.performedBy?.email || '',
        PerformerRole: log.performedBy?.role || '',
        TargetType: log.target?.type || '',
        TargetName: log.target?.name || '',
        TargetId: log.target?.id || '',
        Status: log.status,
        IPAddress: log.ipAddress,
        Device: log.device,
      }));

      const headers = Object.keys(rows[0] || {
        Timestamp: '',
        Event: '',
        Module: '',
        Action: '',
        PerformedBy: '',
        PerformerEmail: '',
        PerformerRole: '',
        TargetType: '',
        TargetName: '',
        TargetId: '',
        Status: '',
        IPAddress: '',
        Device: '',
      });

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => headers.map((key) => `"${String(row[key]).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };



  const resetFilters = () => {
    setDateRange({ from: '', to: '' });
    setSelectedRole('');
    setSearchTerm('');
    setCurrentPage(1);
  };



  const activeFilterCount = [
    dateRange.from || dateRange.to,
    selectedRole,
    searchTerm
  ].filter(Boolean).length;



  if (isLoading) {

    return (

      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          <div className="flex items-center justify-between">

            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>

            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>

          </div>

          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            <div className="p-6 space-y-4">

              {[...Array(5)].map((_, i) => (

                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>

              ))}

            </div>

          </div>

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">



        <Breadcrumb

          items={[

            { label: 'Master Admin', href: '/master-admin/dashboard' },

            { label: 'Audit Logs', href: '/master-admin/audit-logs' }

          ]}

        />



        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>

            <p className="text-gray-600 dark:text-gray-400 mt-1">Track all administrative and system activities</p>

          </div>

          <button

            onClick={handleExportLogs}

            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors"

          >

            <Download size={16} />

            Export Logs

          </button>

        </div>



        {/* Filters Section */}

        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 p-6">

          <div className="flex items-center justify-between mb-4">

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>

            <button

              onClick={resetFilters}

              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"

            >

              Reset All

            </button>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
              <DatePicker
                name="from"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
                placeholder="dd-mm-yyyy"
                maxDate={dateRange.to ? new Date(dateRange.to) : null}
                className="rounded-sm border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
              <DatePicker
                name="to"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
                placeholder="dd-mm-yyyy"
                minDate={dateRange.from ? new Date(dateRange.from) : null}
                className="rounded-sm border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Roles</option>

                {/* Standard role values */}
                <option value="MASTER_ADMIN">Master Admin</option>
                <option value="COMPANY_ADMIN">Company Admin</option>
                <option value="HR_ADMIN">HR Admin</option>
                <option value="FINANCE_ADMIN">Finance Admin</option>
                <option value="PAYROLL_ADMIN">Payroll Admin</option>
                <option value="IT_ADMIN">IT Admin</option>
                <option value="L_AND_D_MANAGER">L&D Manager</option>
                <option value="MANAGER">Manager</option>
                <option value="DEPT_HEAD">Department Head</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="External">External</option>

                {/* Alternative formats - uncomment if needed */}
                {/* <option value="HR">HR</option>
                <option value="FINANCE">Finance</option>
                <option value="PAYROLL">Payroll</option>
                <option value="HR Admin">HR Admin (Display Format)</option>
                <option value="Master Admin">Master Admin (Display Format)</option>
                <option value="Payroll Admin">Payroll Admin (Display Format)</option> */}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="mt-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, email, ID, or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>



        {/* Audit Logs Table */}

        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">

          <div className="overflow-x-auto overflow-y-visible">

            <table className="w-full">

              <thead className="bg-primary-50 dark:bg-primary-900/20 border-b border-gray-200 dark:border-gray-700">

                <tr>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">Timestamp</th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">Event</th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">Module</th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">Action</th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">Performed By</th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">Target</th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">Status</th>

                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">Actions</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                {currentItems.length > 0 ? (

                  currentItems.map((log) => (

                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{log.timestamp}</td>

                      <td className="px-6 py-4">

                        <div className="text-sm font-medium text-gray-900 dark:text-white">{log.event}</div>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">

                            {getModuleIcon(log.module)}

                          </div>

                          <span className="text-sm text-gray-600 dark:text-gray-400">{log.module}</span>

                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.actionType)}`}>

                          {getActionIcon(log.actionType)}

                          {log.actionType}

                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="space-y-1">

                          <div className="text-sm font-medium text-gray-900 dark:text-white">{log.performedBy.name}</div>

                          <div className="text-xs text-gray-500 dark:text-gray-400">{log.performedBy.role}</div>

                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <div className="space-y-1">

                          <div className="text-sm font-medium text-gray-900 dark:text-white">{log.target.name}</div>

                          <div className="text-xs text-gray-500 dark:text-gray-400">{log.target.type} - {log.target.id}</div>

                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>

                          {log.status}

                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex items-center justify-end">

                          <ActionDropdown

                            customActions={[

                              {

                                label: "View Details",

                                icon: Eye,

                                onClick: () => handleViewDetails(log),

                                className: "text-gray-700 dark:text-gray-200",

                                iconClassName: "text-primary-600 dark:text-primary-400",

                              },

                            ]}

                          />

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">

                      No audit logs found

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>



          {/* Pagination */}

          {filteredLogs.length > 0 && (

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <span className="text-sm text-gray-700 dark:text-gray-300">

                    Rows per page

                  </span>

                  <select

                    value={itemsPerPage}

                    onChange={(e) => setItemsPerPage(Number(e.target.value))}

                    className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"

                  >

                    <option value={5}>5</option>

                    <option value={10}>10</option>

                    <option value={20}>20</option>

                    <option value={50}>50</option>

                  </select>

                  <span className="text-sm text-gray-700 dark:text-gray-300 ml-4">

                    Showing {indexOfFirstItem + 1} to{' '}

                    {Math.min(indexOfLastItem, filteredLogs.length)} of{' '}

                    {filteredLogs.length} results

                  </span>

                </div>

                <div className="flex items-center gap-1">

                  <button

                    onClick={() => setCurrentPage(1)}

                    disabled={currentPage === 1}

                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"

                  >

                    <ChevronsLeft size={16} />

                  </button>

                  <button

                    onClick={() => setCurrentPage(currentPage - 1)}

                    disabled={currentPage === 1}

                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"

                  >

                    <ChevronLeft size={16} />

                  </button>

                  <div className="flex items-center gap-1">

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {

                      let pageNumber;

                      if (totalPages <= 5) pageNumber = i + 1;

                      else if (currentPage <= 3) pageNumber = i + 1;

                      else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i;

                      else pageNumber = currentPage - 2 + i;



                      return (

                        <button

                          key={pageNumber}

                          onClick={() => setCurrentPage(pageNumber)}

                          className={`w-8 h-8 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${currentPage === pageNumber

                            ? 'bg-primary-600 text-white'

                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'

                            }`}

                        >

                          {pageNumber}

                        </button>

                      );

                    })}

                  </div>

                  <button

                    onClick={() => setCurrentPage(currentPage + 1)}

                    disabled={currentPage === totalPages}

                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"

                  >

                    <ChevronRight size={16} />

                  </button>

                  <button

                    onClick={() => setCurrentPage(totalPages)}

                    disabled={currentPage === totalPages}

                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"

                  >

                    <ChevronsRight size={16} />

                  </button>

                </div>

              </div>

            </div>

          )}

        </div>



        {/* View Details Drawer */}

        {showDrawer && selectedLog && (

          <div

            className="fixed inset-0 bg-black/50 z-50"

            onClick={() => setShowDrawer(false)}

            role="presentation"

          >

            <div

              className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 overflow-y-auto shadow-xl"

              onClick={(event) => event.stopPropagation()}

            >

              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">

                <div className="flex items-center justify-between">

                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audit Log Details</h2>

                  <button

                    onClick={() => setShowDrawer(false)}

                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"

                  >

                    <X size={20} className="text-gray-500 dark:text-gray-400" />

                  </button>

                </div>

              </div>



              <div className="p-6 space-y-6">

                {/* Summary Section */}

                <div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Event</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.event}</p>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Module</label>

                      <div className="flex items-center gap-2">

                        <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">

                          {getModuleIcon(selectedLog.module)}

                        </div>

                        <span className="text-gray-900 dark:text-white">{selectedLog.module}</span>

                      </div>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Action Type</label>

                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedLog.actionType)}`}>

                        {getActionIcon(selectedLog.actionType)}

                        {selectedLog.actionType}

                      </span>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>

                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedLog.status)}`}>

                        {selectedLog.status}

                      </span>

                    </div>

                    <div className="col-span-2">

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.timestamp}</p>

                    </div>

                  </div>

                </div>



                {/* Actor Details */}

                <div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actor Details</h3>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.performedBy.name}</p>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.performedBy.email}</p>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.performedBy.role}</p>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.ipAddress}</p>

                    </div>

                    <div className="col-span-2">

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Device / Browser</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.device}</p>

                    </div>

                  </div>

                </div>



                {/* Target Details */}

                <div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Target Details</h3>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.target.type}</p>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.target.name}</p>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ID</label>

                      <p className="text-gray-900 dark:text-white">{selectedLog.target.id}</p>

                    </div>

                  </div>

                </div>



                {/* Change Details */}

                {selectedLog.changes && (selectedLog.changes.before || selectedLog.changes.after) && (

                  <div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Details</h3>

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Before Values</label>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">

                          {Object.keys(selectedLog.changes.before).length > 0 ? (

                            <div className="space-y-2">

                              {Object.entries(selectedLog.changes.before).map(([key, value]) => (

                                <div key={key} className="flex justify-between">

                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}:</span>

                                  <span className="text-sm text-gray-900 dark:text-white">{value}</span>

                                </div>

                              ))}

                            </div>

                          ) : (

                            <p className="text-sm text-gray-500 dark:text-gray-400">No previous values</p>

                          )}

                        </div>

                      </div>

                      <div>

                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">After Values</label>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">

                          {Object.keys(selectedLog.changes.after).length > 0 ? (

                            <div className="space-y-2">

                              {Object.entries(selectedLog.changes.after).map(([key, value]) => (

                                <div key={key} className="flex justify-between">

                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}:</span>

                                  <span className={`text-sm ${selectedLog.changes.before[key] !== value

                                    ? 'text-orange-600 dark:text-orange-400 font-medium'

                                    : 'text-gray-900 dark:text-white'

                                    }`}>

                                    {value}

                                  </span>

                                </div>

                              ))}

                            </div>

                          ) : (

                            <p className="text-sm text-gray-500 dark:text-gray-400">No new values</p>

                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

