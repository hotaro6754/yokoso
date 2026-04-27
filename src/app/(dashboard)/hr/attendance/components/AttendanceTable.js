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
import { ChevronUp, ChevronDown, Edit, Clock, MoreVertical, RefreshCw } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import EditAttendanceModal from './EditAttendanceModal';
import AttendanceFilters from './AttendanceFilters';
import { attendanceService } from '../../../../../services/hr-services/attendace.service';
import { toast } from 'react-hot-toast';

export default function AttendanceTable({ selectedDate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    designations: [],
    statuses: []
  });

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getAttendanceRecords({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
        designationId: designationFilter !== 'all' ? designationFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter.toLowerCase() : undefined,
        startDate: selectedDate.toISOString().split('T')[0],
        endDate: selectedDate.toISOString().split('T')[0]
      });

      const records = response?.success ? response.data || [] : response.data?.records || response.data || [];
      const paginationInfo = response.pagination || response.data?.pagination || {};

      setData(Array.isArray(records) ? records : []);
      setTotalRecords(paginationInfo.totalItems || 0);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast.error(error.message || 'Failed to fetch attendance records');
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await attendanceService.getFilterOptions();
      setFilterOptions(response.data || { departments: [], designations: [], statuses: [] });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch data when filters or pagination changes
  useEffect(() => {
    fetchAttendanceRecords();
  }, [globalFilter, departmentFilter, designationFilter, statusFilter, pagination.pageIndex, pagination.pageSize, selectedDate]);

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendanceRecords();
  };

  // Function to determine if production hours are completed
  const isProductionHoursCompleted = (productionHours, status) => {
    if (status === 'Absent' || status === 'Leave') {
      return false;
    }

    if (productionHours === '--' || productionHours === '00:00') {
      return false;
    }

    const [hours, minutes] = productionHours.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    if (status === 'Half Day') {
      return totalMinutes >= 240;
    }

    return totalMinutes >= 480;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'employee',
        header: 'Employee',
        cell: info => {
          const employee = info.getValue();
          return (
            <div className="flex items-center">
              <img
                src={employee.image || '/images/users/user-default.png'}
                alt={employee.name}
                className="w-8 h-8 rounded-full mr-3 object-cover"
                onError={(e) => {
                  e.target.src = '/images/users/user-default.png';
                }}
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {employee.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {employee.id}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      },
      {
        accessorKey: 'checkIn',
        header: 'Check In',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      },
      {
        accessorKey: 'checkOut',
        header: 'Check Out',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      },
      {
        accessorKey: 'break',
        header: 'Break',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      },
      {
        accessorKey: 'late',
        header: 'Late',
        cell: info => {
          const late = info.getValue();
          if (late === '--') return <span className="text-sm text-gray-600 dark:text-gray-400">{late}</span>;

          return (
            <span className="text-sm text-red-600 dark:text-red-400">
              {late}
            </span>
          );
        },
      },
      {
        accessorKey: 'productionHours',
        header: 'Production Hours',
        cell: info => {
          const hours = info.getValue();
          const status = info.row.original.status;
          const isCompleted = isProductionHoursCompleted(hours, status);

          if (hours === '00:00' || hours === '--') {
            return (
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                  <Clock className="w-3 h-3 text-gray-400 mr-1.5" />
                  {hours}
                </span>
              </div>
            );
          }

          return (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isCompleted
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                <Clock className={`w-3 h-3 mr-1.5 ${isCompleted ? 'text-green-500' : 'text-red-500'
                  }`} />
                {hours}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          let statusClass = '';
          let dotColor = '';

          if (status === 'Present') {
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            dotColor = 'bg-green-500';
          } else if (status === 'Late') {
            statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            dotColor = 'bg-yellow-500';
          } else if (status === 'Absent') {
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            dotColor = 'bg-red-500';
          } else if (status === 'Half Day') {
            statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            dotColor = 'bg-blue-500';
          } else if (status === 'Overtime') {
            statusClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            dotColor = 'bg-purple-500';
          } else if (status === 'Leave') {
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            dotColor = 'bg-gray-500';
          } else if (status === 'Early Leave') {
            statusClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            dotColor = 'bg-orange-500';
          }

          return (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                <span className={`w-1 h-1 rounded-full mr-1.5 ${dotColor}`}></span>
                {status}
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: info => {
          const record = info.row.original;
          const isRegularizable = record.originalStatus === 'ABSENT' || record.originalStatus === 'LATE';

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(record)}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                title="Edit Attendance"
              >
                <Edit className="w-4 h-4" />
              </button>
              {isRegularizable && (
                <button
                  onMouseEnter={() => setHoveredAction(`${info.row.id}-regularize`)}
                  onMouseLeave={() => setHoveredAction(null)}
                  onClick={() => handleRegularize(record)}
                  className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 group relative"
                  title="Regularize"
                >
                  <Clock className="w-4 h-4" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Regularize
                  </span>
                </button>
              )}
            </div>
          );
        },
        enableSorting: false,
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
    manualPagination: true,
    pageCount: Math.ceil(totalRecords / pagination.pageSize),
  });

  // Handle actions
  const handleEdit = (attendance) => {
    setEditingAttendance({ ...attendance, date: selectedDate?.toISOString?.().split('T')[0] || attendance.date });
    setIsEditModalOpen(true);
  };

  const handleRegularize = async (attendance) => {
    try {
      await attendanceService.regularizeAttendance(attendance.id, 'Regularized by user');
      toast.success('Attendance regularized successfully');
      fetchAttendanceRecords();
    } catch (error) {
      toast.error(error.message || 'Failed to regularize attendance');
    }
  };

  const handleSave = async (updatedAttendance) => {
    try {
      // Convert frontend data to API format
      const apiData = {
        date: updatedAttendance.date,
        checkIn: updatedAttendance.checkIn.replace(/ AM$| PM$/i, ''),
        checkOut: updatedAttendance.checkOut.replace(/ AM$| PM$/i, ''),
        status: updatedAttendance.status.toLowerCase(),
        notes: updatedAttendance.notes || ''
      };

      await attendanceService.updateAttendance(updatedAttendance.id, apiData);
      toast.success('Attendance updated successfully');
      setIsEditModalOpen(false);
      setEditingAttendance(null);
      fetchAttendanceRecords();
    } catch (error) {
      toast.error(error.message || 'Failed to update attendance');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setDepartmentFilter('all');
    setDesignationFilter('all');
    setGlobalFilter('');
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  // Loading skeleton
  if (loading && data.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="min-w-[1000px] md:min-w-full">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {[...Array(9)].map((_, i) => (
                    <th key={i} className="px-3 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-3 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Filters Section with Refresh Button */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Attendance Records
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <AttendanceFilters
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          designationFilter={designationFilter}
          setDesignationFilter={setDesignationFilter}
          statuses={['all', ...filterOptions.statuses]}
          departments={filterOptions.departments}
          designations={filterOptions.designations}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {data.length} of {totalRecords} attendance records
        {(statusFilter !== 'all' || departmentFilter !== 'all' || globalFilter) && (
          <span> (filtered)</span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="min-w-[1000px] md:min-w-full">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-3 py-4 text-left text-[15px] font-semibold text-gray-700 tracking-wider dark:text-gray-300"
                      {...(header.column.getCanSort() ? {
                        onClick: header.column.getToggleSortingHandler(),
                        className: "px-3 py-4 text-left text-[15px] font-semibold text-gray-700 tracking-wider cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150"
                      } : {})}
                    >
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <>
                            {{
                              asc: <ChevronUp className="ml-1 w-4 h-4 text-blue-500" />,
                              desc: <ChevronDown className="ml-1 w-4 h-4 text-blue-500" />,
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
              {data.length > 0 ? (
                data.map((record, index) => (
                  <tr
                    key={record.id || index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                    onMouseEnter={() => setHoveredRow(record.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {columns.map(column => {
                      const cell = table.getCoreRowModel().rows[index]?.getCell(column.id || column.accessorKey);
                      return cell ? (
                        <td key={column.id || column.accessorKey} className="px-3 py-3 whitespace-nowrap">
                          {flexRender(column.cell, { ...cell.getContext(), row: { original: record } })}
                        </td>
                      ) : (
                        <td key={column.id || column.accessorKey} className="px-3 py-3 whitespace-nowrap">
                          {record[column.accessorKey]}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    {loading ? 'Loading attendance records...' : 'No attendance records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Component */}
      {totalRecords > 0 && (
        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalItems={totalRecords}
          itemsPerPage={pagination.pageSize}
          onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page - 1 }))}
          onItemsPerPageChange={(size) => {
            setPagination({ pageIndex: 0, pageSize: size });
          }}
          className="mt-6"
        />
      )}

      {/* Edit Attendance Modal */}
      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAttendance(null);
        }}
        attendance={editingAttendance}
        onSave={handleSave}
      />
    </div>
  );
}