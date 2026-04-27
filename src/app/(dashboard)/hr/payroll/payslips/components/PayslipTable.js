// src/app/(dashboard)/hr/payroll/payslips/components/PayslipTable.js
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
import { ChevronUp, ChevronDown, FileText, Download, Loader2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/common/Pagination';
import PayslipFilters from './PayslipFilters';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function PayslipTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const [periodFilter, setPeriodFilter] = useState('all');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getAllPayslips({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter,
          period: periodFilter !== 'all' ? periodFilter : ''
        });
        console.log('Payslip Response:', response);
        setData(response.data || []);
        setTotalItems(response.pagination?.totalItems || 0);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching payslips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, periodFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Payslip ID',
        cell: info => <span className="text-xs font-medium text-brand-600 dark:text-brand-400">{info.getValue()}</span>,
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
        accessorKey: 'period',
        header: 'Period',
        cell: info => <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{info.getValue()}</span>,
      },
      {
        accessorKey: 'issueDate',
        header: 'Issue Date',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{payrollService.formatDate(info.getValue())}</span>,
      },
      {
        accessorKey: 'earnings.basicSalary',
        header: 'Basic Salary',
        cell: info => <span className="text-sm font-medium text-gray-900 dark:text-white">{payrollService.formatCurrency(info.getValue())}</span>,
      },
      {
        accessorKey: 'netSalary',
        header: 'Net Salary',
        cell: info => <span className="text-sm font-bold text-green-600 dark:text-green-400">{payrollService.formatCurrency(info.getValue())}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className="flex items-center">
            <button
              onClick={() => handleView(info.row.original)}
              disabled={downloadingId === info.row.original.id}
              className="p-1.5 rounded-sm bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white disabled:opacity-50 border border-blue-100 dark:border-blue-800/30"
              title="View Payslip"
            >
              {downloadingId === info.row.original.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => handleDownload(info.row.original)}
              disabled={downloadingId === info.row.original.id}
              className="p-1.5 ml-2 rounded-sm bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all duration-200 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-600 dark:hover:text-white disabled:opacity-50 border border-brand-100 dark:border-brand-800/30"
              title="Download Payslip"
            >
              {downloadingId === info.row.original.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [downloadingId]
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
    pageCount: Math.ceil(totalItems / pagination.pageSize),
  });

  const periods = useMemo(() => {
    const uniquePeriods = new Set(data.map(item => item.period));
    return ['all', ...Array.from(uniquePeriods)];
  }, [data]);

  const clearFilters = () => {
    setPeriodFilter('all');
    setGlobalFilter('');
  };

  const handleDownload = async (payslip) => {
    try {
      setDownloadingId(payslip.id);
      const blob = await payrollService.downloadPayslip(payslip.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${payslip.employee?.firstName || 'employee'}-${payslip.period}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
      toast.error('Failed to download payslip');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = async (payslip) => {
    try {
      setDownloadingId(payslip.id);
      const blob = await payrollService.downloadPayslip(payslip.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('View failed', err);
      toast.error('Failed to view payslip');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
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
    <div className="">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-sm dark:bg-brand-900/20 dark:text-brand-400 text-sm font-medium border border-brand-100 dark:border-brand-800/30">
          <FileText size={16} />
          <span>
            Total Records: {totalItems}
          </span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        <PayslipFilters
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          periodFilter={periodFilter}
          setPeriodFilter={setPeriodFilter}
          periods={periods}
          onClearFilters={clearFilters}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-sm border border-red-100 dark:border-red-900/50">
          Error: {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm relative bg-white dark:bg-gray-800">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 transition-opacity backdrop-blur-[1px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        )}
        <div className="min-w-[1000px] md:min-w-full text-center">
          <table className="w-full text-left">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-medium"
                    >
                      <div
                        className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer group hover:text-brand-700 dark:hover:text-brand-200 transition-colors' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
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
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-left text-sm">
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
                      <p>No payslips found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={pagination.pageIndex + 1}
        totalItems={totalItems}
        itemsPerPage={pagination.pageSize}
        onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page - 1 }))}
        onItemsPerPageChange={(size) => {
          setPagination({ pageIndex: 0, pageSize: size });
        }}
        className="mt-6"
        showWhenEmpty={true}
      />
    </div>
  );
}
