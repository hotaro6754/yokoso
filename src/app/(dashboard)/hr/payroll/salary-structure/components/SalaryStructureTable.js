// src/app/(dashboard)/hr/payroll/salary-structure/components/SalaryStructureTable.js
"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Eye, IndianRupee, FileText } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import SalaryStructureFilters from './SalaryStructureFilters';
import { payrollService } from '@/services/hr-services/payroll.service';
import { departmentService } from '@/services/hr-services/departmentService';

export default function SalaryStructureTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [totalItems, setTotalItems] = useState(0);
  const [departments, setDepartments] = useState(['all']);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAllDepartments();
        if (response.data) {
          const names = response.data.map(d => d.name);
          setDepartments(['all', ...names]);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchSalaryStructures = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getAllSalaryStructures({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter,
          status: statusFilter !== 'all' ? statusFilter : '',
          department: departmentFilter !== 'all' ? departmentFilter : ''
        });
        setData(response.data.salaryStructures || []);
        setTotalItems(response.data.pagination?.totalItems || 0);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching salary structures:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryStructures();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, statusFilter, departmentFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: info => <span className="text-xs font-medium text-brand-600 dark:text-brand-400">{info.row.original.publicId}</span>,
      },
      {
        accessorKey: 'employee',
        header: 'Employee',
        cell: info => (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {info.row.original.employee?.firstName} {info.row.original.employee?.lastName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {info.row.original.employee?.employeeId}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'designation',
        header: 'Designation',
        cell: info => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {info.row.original.employee?.designation?.name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: info => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {info.row.original.employee?.department?.name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'basicSalary',
        header: 'Basic',
        cell: info => (
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {payrollService.formatCurrency(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'totalCTC',
        header: 'Total CTC',
        cell: info => (
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {payrollService.formatCurrency(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'effectiveDate',
        header: 'Effective Date',
        cell: info => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {payrollService.formatDate(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const status = info.getValue()?.toUpperCase();
          let statusClass = '';
          if (status === 'ACTIVE') {
            statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
          } else {
            statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
          }
          return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${statusClass}`}>
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'View',
        cell: info => (
          <button
            onClick={() => handleView(info.row.original)}
            className="p-1.5 rounded-sm bg-gray-50 text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-colors border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
            title="View Details (Read-only)"
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
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
    manualPagination: true,
    pageCount: Math.ceil(totalItems / pagination.pageSize),
  });

  const statuses = ['all', 'ACTIVE', 'INACTIVE'];

  const router = useRouter();

  const clearFilters = () => {
    setStatusFilter('all');
    setDepartmentFilter('all');
    setGlobalFilter('');
  };

  const handleView = (structure) => {
    router.push(`/hr/payroll/salary-structure/view/${structure.id}`);
  };

  if (loading && data.length === 0) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-sm dark:bg-brand-900/20 dark:text-brand-400 text-sm font-medium border border-brand-100 dark:border-brand-800/30">
          <IndianRupee size={16} />
          <span>
            Total Records: {totalItems}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <SalaryStructureFilters
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          statuses={statuses}
          departments={departments}
          onClearFilters={clearFilters}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-sm text-sm font-medium text-left border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-700 relative">
        <div className="min-w-[1000px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-medium"
                    >
                      <div className="flex items-center gap-1 group cursor-pointer hover:text-brand-700 dark:hover:text-brand-200 transition-colors" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronUp size={10} className={header.column.getIsSorted() === 'asc' ? 'text-brand-600' : 'text-brand-400/50'} />
                            <ChevronDown size={10} className={header.column.getIsSorted() === 'desc' ? 'text-brand-600' : 'text-brand-400/50'} />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                      <p>No salary structures found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && data.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[1px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        )}
      </div>

      <Pagination
        currentPage={pagination.pageIndex + 1}
        totalItems={totalItems}
        itemsPerPage={pagination.pageSize}
        onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page - 1 }))}
        onItemsPerPageChange={(size) => setPagination({ pageIndex: 0, pageSize: size })}
        className="mt-6"
        showWhenEmpty={true}
      />
    </div>
  );
}
