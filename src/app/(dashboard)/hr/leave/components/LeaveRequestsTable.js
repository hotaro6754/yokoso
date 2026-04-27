"use client";
import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, Loader2, Check, X } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import LeaveRequestsFilters from './LeaveRequestsFilters';
import EditLeaveModal from './EditLeaveModal';
import { useRouter } from 'next/navigation';
import { leaveRequestService } from '@/services/hr-services/leaveRequestService';
import { toast } from 'react-hot-toast';

export default function LeaveRequestsTable({ onRefresh }) {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState(['all']);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch leave requests
  const fetchLeaveRequests = async (params = {}) => {
    try {
      setActionLoadingId(requestId);
      setLoading(true);
      setError(null);

      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        leaveType: leaveTypeFilter !== 'all' ? leaveTypeFilter : undefined,
        dateRange: dateRange.length === 2 ? {
          from: dateRange[0].toISOString().split('T')[0],
          to: dateRange[1].toISOString().split('T')[0]
        } : undefined
      };

      const response = await leaveRequestService.getAllLeaveRequests(queryParams);
      if (response.success && response.data) {
        setData(response.data || []);

        // Update pagination from API response
        if (response.data.pagination) {
          setPagination({
            pageIndex: response.data.pagination.currentPage - 1,
            pageSize: response.data.pagination.itemsPerPage,
          });
        }
      } else {
        setError(response.message || 'Failed to fetch leave requests');
      }
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError(err.message || 'Failed to fetch leave requests');
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave statistics
  const fetchLeaveStats = async () => {
    try {
      setActionLoadingId(requestId);
      const response = await leaveRequestService.getLeaveStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching leave stats:', err);
    }
  };

  // Fetch leave types for dropdown
  const fetchLeaveTypes = async () => {
    try {
      setActionLoadingId(requestId);
      const response = await leaveRequestService.getLeaveTypesDropdown();
      if (response.success && response.data) {
        setLeaveTypes(['all', ...response.data.map(type => type.name)]);
      }
    } catch (err) {
      console.error('Error fetching leave types:', err);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveStats();
    fetchLeaveTypes();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaveRequests();
    }, 300);

    return () => clearTimeout(timer);
  }, [globalFilter, statusFilter, leaveTypeFilter, dateRange, pagination.pageIndex, pagination.pageSize]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'employeeName',
        header: 'Employee Name',
        cell: info => (
          <div className="flex items-center">
            <img
              src={info.row.original.image || '/images/users/default-avatar.png'}
              alt={info.getValue()}
              className="w-8 h-8 rounded-full mr-3 object-cover"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white block">{info.getValue()}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">ID: {info.row.original.employeeId}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'leaveType',
        header: 'Leave Type',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      },
      {
        accessorKey: 'days',
        header: 'No Of Days',
        cell: info => <span className="text-sm font-medium text-gray-900 dark:text-white">{info.getValue()}</span>,
      },
      {
        accessorKey: 'fromDate',
        header: 'From',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      },
      {
        accessorKey: 'toDate',
        header: 'To',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      },
      {
        accessorKey: 'payment',
        header: 'Payment',
        cell: info => {
          const paid = info.row.original.paidDays || 0;
          const unpaid = info.row.original.unpaidDays || 0;

          if (unpaid === 0) {
            return (
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide border bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30">
                Paid
              </span>
            );
          } else if (paid === 0) {
            return (
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide border bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30">
                Unpaid
              </span>
            );
          } else {
            return (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-green-600">{paid} Paid</span>
                <span className="text-[10px] font-bold text-red-600">{unpaid} Unpaid</span>
              </div>
            );
          }
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          let statusClass = '';
          let statusIcon = null;

          if (status === 'approved') {
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            statusIcon = <CheckCircle className="w-3 h-3 mr-1" />;
          } else if (status === 'pending') {
            statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            statusIcon = <Clock className="w-3 h-3 mr-1" />;
          } else {
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            statusIcon = <XCircle className="w-3 h-3 mr-1" />;
          }

          return (
            <span className={`px-2.5 py-0.5 rounded-xs text-xs font-medium flex items-center ${statusClass}`}>
              {statusIcon}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(stats?.totalItems || 0 / pagination.pageSize),
  });

  // Get unique statuses for filter dropdown
  const statuses = useMemo(() => {
    const uniqueStatuses = new Set(data.map(req => req.status));
    return ['all', ...Array.from(uniqueStatuses)];
  }, [data]);

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setLeaveTypeFilter('all');
    setDateRange([]);
    setGlobalFilter('');
  };

  // Handle approve action
  const handleApprove = async (requestId) => {
    try {
      setActionLoadingId(requestId);
      const response = await leaveRequestService.approveLeaveRequest(requestId);
      if (response.success) {
        toast.success('Leave request approved successfully');
        fetchLeaveRequests(); // Refresh data
        fetchLeaveStats(); // Refresh stats
        onRefresh?.();
      } else {
        toast.error(response.message || 'Failed to approve leave request');
      }
    } catch (err) {
      console.error('Error approving leave request:', err);
      toast.error(err.message || 'Failed to approve leave request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoadingId(requestId);
      const response = await leaveRequestService.rejectLeaveRequest(selectedRequest.id, rejectionReason.trim());
      if (response.success) {
        toast.success('Leave request rejected successfully');
        fetchLeaveRequests(); // Refresh data
        fetchLeaveStats(); // Refresh stats
        closeRejectModal();
      } else {
        toast.error(response.message || 'Failed to reject leave request');
      }
    } catch (err) {
      console.error('Error rejecting leave request:', err);
      toast.error(err.message || 'Failed to reject leave request');
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    table.setPageIndex(page - 1);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (size) => {
    table.setPageSize(size);
    table.setPageIndex(0);
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => fetchLeaveRequests()}
            className="px-4 py-2.5 bg-brand-500 text-white rounded-sm hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-0">
      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
          <div className="flex items-center">
            <span>{error}</span>
            <button
              onClick={() => fetchLeaveRequests()}
              className="ml-auto text-sm font-medium hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-6 overflow-visible">
        <LeaveRequestsFilters
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          leaveTypeFilter={leaveTypeFilter}
          setLeaveTypeFilter={setLeaveTypeFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          statuses={statuses}
          leaveTypes={leaveTypes}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Loading overlay for table */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm relative">
        <div className="min-w-[1000px] md:min-w-full">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-3 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300"
                      {...(header.column.getCanSort() ? {
                        onClick: header.column.getToggleSortingHandler(),
                        className: "px-3 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150"
                      } : {})}
                    >
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <>
                            {{
                              asc: <ChevronUp className="ml-1 w-4 h-4 text-brand-600" />,
                              desc: <ChevronDown className="ml-1 w-4 h-4 text-brand-600" />,
                            }[header.column.getIsSorted()] ?? (
                                <div className="ml-1 flex flex-col">
                                  <ChevronUp className="w-3 h-3 -mb-0.5 text-gray-400" />
                                  <ChevronDown className="w-3 h-3 -mt-0.5 text-gray-400" />
                                </div>
                              )}
                          </>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalItems={stats?.totalItems || data.length}
        itemsPerPage={table.getState().pagination.pageSize}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        className="mt-6"
      />

      {/* Add the Edit Modal */}
      <EditLeaveModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        request={selectedRequest}
        onSave={fetchLeaveRequests}
      />

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-sm p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Reject Leave Request
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Request from: <span className="font-medium">{selectedRequest?.employeeName}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leave Type: <span className="font-medium">{selectedRequest?.leaveType}</span>
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for Rejection
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Please provide a reason for rejecting this leave request..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-sm hover:bg-red-700 transition-colors flex items-center"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
