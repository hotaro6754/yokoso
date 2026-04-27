// src/app/(dashboard)/hr/attendance/components/AttendanceTable.js
"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Edit, Clock, MoreVertical, Trash2 } from 'lucide-react';

import Pagination from "@/components/common/Pagination";
import EditAttendanceModal from "./EditAttendanceModal";
import AttendanceFilters from "./AttendanceFilters";

// Mock attendance data
const defaultData = [
  { id: "Att-001", employee: { id: "Emp-010", name: "Lori Broaddus", image: "/images/users/user-01.png", departmentId: "3" }, date: "17 Dec 2024", checkIn: "09:15 AM", checkOut: "06:30 PM", break: "01:00", late: "00:15", productionHours: "08:15", status: "Present" },
  { id: "Att-002", employee: { id: "Emp-011", name: "John Smith", image: "/images/users/user-02.png", departmentId: "2" }, date: "17 Dec 2024", checkIn: "08:45 AM", checkOut: "05:30 PM", break: "00:45", late: "00:00", productionHours: "08:45", status: "Present" },
  { id: "Att-003", employee: { id: "Emp-012", name: "Sarah Johnson", image: "/images/users/user-03.png", departmentId: "1" }, date: "17 Dec 2024", checkIn: "10:30 AM", checkOut: "06:45 PM", break: "01:00", late: "01:30", productionHours: "07:15", status: "Late" },
  { id: "Att-004", employee: { id: "Emp-013", name: "Michael Brown", image: "/images/users/user-04.png", departmentId: "2" }, date: "17 Dec 2024", checkIn: "09:00 AM", checkOut: "12:30 PM", break: "00:30", late: "00:00", productionHours: "03:00", status: "Half Day" },
  { id: "Att-005", employee: { id: "Emp-014", name: "Emily Davis", image: "/images/users/user-05.jpg", departmentId: "4" }, date: "17 Dec 2024", checkIn: "--", checkOut: "--", break: "--", late: "--", productionHours: "00:00", status: "Absent" },
];

// Mock departments
const mockDepartments = [
  { id: "all", name: "All Departments" },
  { id: "1", name: "Human Resources" },
  { id: "2", name: "Information Technology" },
  { id: "3", name: "Finance" },
  { id: "4", name: "Marketing" },
  { id: "5", name: "Sales" },
  { id: "6", name: "Operations" },
  { id: "7", name: "Research & Development" },
  { id: "8", name: "Customer Service" },
  { id: "9", name: "Quality Assurance" },
  { id: "10", name: "Administration" },
];

export default function AttendanceTable() {
  const [data, setData] = useState(defaultData);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if production hours are completed
  const isProductionHoursCompleted = (hours, status) => {
    if (["Absent", "Leave"].includes(status) || ["--", "00:00"].includes(hours)) return false;
    const [h, m] = hours.split(":").map(Number);
    const totalMinutes = h * 60 + m;
    return status === "Half Day" ? totalMinutes >= 240 : totalMinutes >= 480;
  };

  const columns = useMemo(() => [
    {
      accessorKey: "employee",
      header: "Employee",
      cell: info => (
        <div className="flex items-center">
          <img src={info.getValue().image} alt={info.getValue().name} className="w-8 h-8 rounded-full mr-3 object-cover" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{info.getValue().name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{info.getValue().id}</div>
          </div>
        </div>
      ),
    },
    { 
      accessorKey: "date", 
      header: "Date",
      cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>
    },
    { 
      accessorKey: "checkIn", 
      header: "Check In",
      cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>
    },
    { 
      accessorKey: "checkOut", 
      header: "Check Out",
      cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>
    },
    { 
      accessorKey: "break", 
      header: "Break",
      cell: info => <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>
    },
    { 
      accessorKey: "late", 
      header: "Late", 
      cell: info => <span className="text-sm text-red-600 dark:text-red-400">{info.getValue()}</span> 
    },
    {
      accessorKey: "productionHours",
      header: "Production Hours",
      cell: info => {
        const hours = info.getValue();
        const status = info.row.original.status;
        const completed = isProductionHoursCompleted(hours, status);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${completed ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
            <Clock className="w-3 h-3 mr-1.5" /> {hours}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: info => {
        const status = info.getValue();
        const statusMap = {
          Present: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          Late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          Absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          "Half Day": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          Overtime: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          default: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return <span className={`px-2.5 py-0.5 rounded-xs text-xs font-medium ${statusMap[status] || statusMap.default}`}>{status}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: info => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleEdit(info.row.original)} 
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 group relative"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Edit
            </span>
          </button>
          <button 
            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 group relative"
            title="Clock"
          >
            <Clock className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Clock
            </span>
          </button>
          <button 
            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 group relative"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Delete
            </span>
          </button>
        </div>
      ),
    },
  ], []);

  const filteredData = useMemo(() => {
    return data.filter(r => {
      const matchesGlobal = !globalFilter || [r.employee.name, r.employee.id, r.status, r.date].some(field => field.toLowerCase().includes(globalFilter.toLowerCase()));
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesDept = departmentFilter === "all" || r.employee.departmentId === departmentFilter;
      return matchesGlobal && matchesStatus && matchesDept;
    });
  }, [data, globalFilter, statusFilter, departmentFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleEdit = attendance => {
    setEditingAttendance(attendance);
    setIsEditModalOpen(true);
  };

  const handleSave = updatedAttendance => {
    setData(prev => prev.map(d => d.id === updatedAttendance.id ? updatedAttendance : d));
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6">
      <AttendanceFilters
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        statuses={["all", "Present", "Late", "Absent", "Half Day", "Overtime", "Leave"]}
        departments={mockDepartments}
        onClearFilters={() => { setStatusFilter("all"); setDepartmentFilter("all"); setGlobalFilter(""); }}
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mt-4">
        <div className="min-w-[800px] md:min-w-full">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className={`px-3 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300 ${header.column.getCanSort() ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150" : ""}`}
                      {...(header.column.getCanSort() ? { onClick: header.column.getToggleSortingHandler() } : {})}
                    >
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div className="ml-1 flex flex-col">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="w-3 h-3 -mb-0.5 text-gray-400" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="w-3 h-3 -mt-0.5 text-gray-400" />
                            ) : (
                              <>
                                <ChevronUp className="w-3 h-3 -mb-0.5 text-gray-400" />
                                <ChevronDown className="w-3 h-3 -mt-0.5 text-gray-400" />
                              </>
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
              {table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalItems={filteredData.length}
        itemsPerPage={table.getState().pagination.pageSize}
        onPageChange={page => table.setPageIndex(page - 1)}
        onItemsPerPageChange={size => { table.setPageSize(size); table.setPageIndex(0); }}
        className="mt-4"
      />

      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        attendance={editingAttendance}
        onSave={handleSave}
      />
    </div>
  );
}