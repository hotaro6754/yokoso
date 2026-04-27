// src/app/(dashboard)/hr/payroll/process/components/EmployeeSelectionTable.js
"use client";
import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function EmployeeSelectionTable({ selectedEmployees, onChange, onNext, onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const fetchEmployeesWithSalary = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getAllSalaryStructures({
          status: 'ACTIVE',
          limit: 100 // Get all active employees for selection
        });
        setData(response.data.salaryStructures || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesWithSalary();
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-100 text-blue-600 focus:ring-blue-500"
              onChange={(e) => {
                if (e.target.checked) {
                  onChange(data);
                } else {
                  onChange([]);
                }
              }}
              checked={data.length > 0 && selectedEmployees.length === data.length}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-100 text-blue-600 focus:ring-blue-500"
              checked={selectedEmployees.some(emp => emp.id === row.original.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selectedEmployees, row.original]);
                } else {
                  onChange(selectedEmployees.filter(emp => emp.id !== row.original.id));
                }
              }}
            />
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'employee.employeeId',
        header: 'Emp ID',
        cell: info => <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{info.getValue()}</span>,
      },
      {
        accessorKey: 'employee',
        header: 'Name',
        cell: info => (
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {info.getValue()?.firstName} {info.getValue()?.lastName}
          </span>
        ),
      },
      {
        accessorKey: 'employee.designation.name',
        header: 'Designation',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue() || '-'}</span>,
      },
      {
        accessorKey: 'employee.department.name',
        header: 'Department',
        cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue() || '-'}</span>,
      },
      {
        accessorKey: 'totalCTC',
        header: 'Monthly CTC',
        cell: info => <span className="text-sm font-bold text-green-600 dark:text-green-400">{payrollService.formatCurrency(info.getValue())}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const status = info.getValue()?.toUpperCase();
          let statusClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
          return (
            <span className={`px-2.5 py-0.5 rounded-xs text-xs font-medium ${statusClass}`}>
              {status}
            </span>
          );
        },
      },
    ],
    [selectedEmployees, onChange, data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleNext = () => {
    if (selectedEmployees.length > 0) {
      onNext();
    } else {
      alert('Please select at least one employee');
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2 sm:gap-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Select Employees</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedEmployees.length} of {data.length} employees selected
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-left">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md w-full ml-0">
          <input
            placeholder="Search employees..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <div className="min-w-[800px]">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300"
                    >
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div
                            className="ml-1 cursor-pointer"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {{
                              asc: <ChevronUp className="w-4 h-4 text-brand-600" />,
                              desc: <ChevronDown className="w-4 h-4 text-brand-600" />,
                            }[header.column.getIsSorted()] ?? (
                                <div className="flex flex-col">
                                  <ChevronUp className="w-3 h-3 -mb-0.5 text-gray-400" />
                                  <ChevronDown className="w-3 h-3 -mt-0.5 text-gray-400" />
                                </div>
                              )}
                          </div>
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
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-4 whitespace-nowrap text-left border-gray-100 dark:border-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    No active employees with salary structure found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 gap-3 sm:gap-0">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-5 py-2.5 text-gray-800 hover:bg-gray-300 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 w-full sm:w-auto font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 transition w-full sm:w-auto font-medium"
        >
          Next: Review & Process
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
