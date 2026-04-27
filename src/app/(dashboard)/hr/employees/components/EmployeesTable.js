// src\app\(dashboard)\hr\employees\components\EmployeesTable.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import Pagination from "@/components/common/Pagination";
import EmployeeFilters from "./EmployeeFilters";
import employeeService from "@/services/hr-services/employeeService";
import userManagementService from "@/services/userManagementService";
import { departmentService } from "@/services/hr-services/departmentService";
import { designationService } from "@/services/hr-services/designationService";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import toast from "react-hot-toast";
import ActionDropdown from "../../../master-admin/components/ActionDropdown";
import { getFileUrl } from "@/utils/fileUrl";
import { downloadExcel } from "@/utils/exportUtils";

export default function EmployeeTable({ allowFetch = true }) {
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const basePath = pathname.startsWith('/finance-role')
    ? '/finance-role'
    : pathname.startsWith('/payroll')
      ? '/payroll'
      : pathname.startsWith('/it-admin')
        ? '/it-admin'
      : pathname.startsWith('/manager')
        ? '/manager'
        : pathname.startsWith('/dept-head')
          ? '/dept-head'
      : pathname.startsWith('/company-admin')
        ? '/company-admin'
        : pathname.startsWith('/ld')
          ? '/ld'
          : '/hr';
  const isCrudAllowed = pathname.startsWith('/hr') || pathname.startsWith('/company-admin') || pathname.startsWith('/it-admin');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const resolveImageUrl = (url) => getFileUrl(url, "/images/users/default-avatar.png");

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    employee: null,
  });
  const [debouncedSearch, setDebouncedSearch] = useState(globalFilter);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(globalFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Fetch departments and designations for filter dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        if (!allowFetch) {
          setDepartmentOptions([]);
          setDesignationOptions([]);
          return;
        }
        const [deptsResponse, designationsResponse] = await Promise.all([
          departmentService.getAllDepartments(),
          designationService.getAllDesignations()
        ]);

        const departments = deptsResponse.data?.departments || deptsResponse.data || [];
        const designations = designationsResponse.data?.designations || designationsResponse.data || [];

        setDepartmentOptions(departments);
        setDesignationOptions(designations);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, [allowFetch]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // =============================
  // FETCH EMPLOYEES
  // =============================
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!allowFetch) {
          setData([]);
          setTotalItems(0);
          setTotalPages(0);
          setLoading(false);
          return;
        }
        setLoading(true);
        // Build query parameters according to API
        // Find department ID if department name is selected
        let departmentId = "";
        if (departmentFilter !== "all") {
          const dept = departmentOptions.find(d => d.name === departmentFilter || d.id?.toString() === departmentFilter);
          departmentId = dept?.id?.toString() || departmentFilter;
        }

        // Find designation ID if designation name is selected
        let designationId = "";
        if (designationFilter !== "all") {
          const desig = designationOptions.find(d => d.name === designationFilter || d.id?.toString() === designationFilter);
          designationId = desig?.id?.toString() || designationFilter;
        }

        const params = {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== "all") params.status = statusFilter;
        if (departmentId) params.department = departmentId;
        if (designationId) params.designation = designationId;

        const response = await employeeService.getAllEmployees(params);

        // Handle API response structure: { success: true, data: [...], pagination: {...} }
        const employees = response.success ? (response.data || []) : (response.data?.users || response.data || []);
        const paginationInfo = response.pagination || response.data?.pagination || {};

        const formattedData = employees.map((emp) => {
          const profile = emp.employee || emp.profile || {};
          const firstName = emp.firstName || profile.firstName || "";
          const lastName = emp.lastName || profile.lastName || "";
          const employeeCode = emp.employeeCode || profile.employeeId || emp.employeeId || emp.id;

          return {
            id: employeeCode,
            name: `${firstName} ${lastName}`.trim() || emp.email || "-",
            department: (typeof emp.department === 'object' ? emp.department?.name : emp.department) || profile.department?.name || "-",
            designation: (typeof emp.designation === 'object' ? emp.designation?.name : emp.designation) || profile.designation?.name || "-",
            reportingManager:
              emp.reportingManager
                ? `${emp.reportingManager.firstName || ""} ${emp.reportingManager.lastName || ""}`.trim() || "-"
                : emp.manager
                  ? `${emp.manager.firstName || ""} ${emp.manager.lastName || ""}`.trim() || "-"
                  : emp.reportingManagerName || emp.managerName || "-",
            status: emp.status || (emp.isActive ? "ACTIVE" : "INACTIVE"),
            systemRole: emp.systemRole || "-",
            image: resolveImageUrl(emp.profileImage || profile.profileImage),
            raw: emp,
          };
        });

        setData(formattedData);
        setTotalItems(paginationInfo.totalItems || paginationInfo.total || employees.length);
        setTotalPages(paginationInfo.totalPages || Math.ceil((paginationInfo.totalItems || paginationInfo.total || employees.length) / (paginationInfo.itemsPerPage || pagination.pageSize)));
      } catch (error) {
        console.error("Failed to fetch employees:", error.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [allowFetch, pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter, designationFilter, departmentFilter, departmentOptions, designationOptions]);

  // =============================
  // COLUMNS
  // =============================
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Employee ID",
        cell: info => {
          const employeeId = info.row.original.raw?.id || info.row.original.id;
          return (
            <button
              type="button"
              onClick={() => router.push(`${basePath}/employees/${employeeId}`)}
              className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 cursor-pointer transition-colors"
            >
              {info.getValue()}
            </button>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: info => (
          <div className="flex items-center">
            <img
              src={info.row.original.image}
              alt={info.getValue()}
              className="w-8 h-8 rounded-full mr-3 object-cover"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {info.getValue()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "designation",
        header: "Designation",
      },
      {
        accessorKey: "department",
        header: "Department",
      },
      {
        accessorKey: "reportingManager",
        header: "Reporting Manager",
      },
      {
        accessorKey: "systemRole",
        header: "System Role",
        cell: info => {
          const role = info.getValue() || "-";
          // Function to format role (e.g. HR_ADMIN to HR Admin)
          const formatRole = (r) => {
            if (!r || r === "-") return "-";
            return r.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
          };
          
          return (
            <span className="text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-sm border border-slate-200 dark:border-slate-600">
              {formatRole(role)}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Employment Status",
        cell: info => {
          const status = info.getValue();
          // Map API status values to display labels
          const statusMap = {
            ACTIVE: { label: "Active", style: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30" },
            PROBATION: { label: "Probation", style: "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30" },
            NOTICE_PERIOD: { label: "Notice Period", style: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30" },
            RESIGNED: { label: "Resigned", style: "bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30" },
            TERMINATED: { label: "Terminated", style: "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30" },
            SUSPENDED: { label: "Suspended", style: "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30" },
            RETIRED: { label: "Retired", style: "bg-slate-50 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30" },
          };

          const statusInfo = statusMap[status] || { label: status, style: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" };

          return (
            <span className={`px-2.5 py-1 rounded-sm text-xs font-semibold ${statusInfo.style}`}>
              {statusInfo.label}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: info => {
          const employeeId = info.row.original.raw?.id || info.row.original.id;
          return (
            <div className="relative flex items-center justify-center">
              <ActionDropdown
                viewUrl={`${basePath}/employees/${employeeId}`}
                editUrl={isCrudAllowed ? `${basePath}/employees/edit/${employeeId}` : undefined}
                onDelete={isCrudAllowed ? () => setConfirmState({ isOpen: true, employee: info.row.original.raw || info.row.original }) : undefined}
              />
            </div>
          );
        },
      },
    ],
    [basePath, isCrudAllowed]
  );

  // Use data directly since filtering is done on backend
  const filteredData = data;

  // =============================
  // TABLE
  // =============================
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // =============================
  // FILTER OPTIONS
  // =============================
  // Status options from API (static list)
  const statuses = useMemo(() => {
    const apiStatuses = ["ACTIVE", "PROBATION", "NOTICE_PERIOD", "RESIGNED", "TERMINATED", "SUSPENDED", "RETIRED"];
    return ["all", ...apiStatuses];
  }, []);

  const designations = useMemo(() => {
    // Use designation options from API for filter dropdown
    return ["all", ...designationOptions.map(desig => desig.name)];
  }, [designationOptions]);

  const departments = useMemo(() => {
    // Use department options from API for filter dropdown
    return ["all", ...departmentOptions.map(dept => dept.name)];
  }, [departmentOptions]);

  const clearFilters = () => {
    setGlobalFilter("");
    setStatusFilter("all");
    setDesignationFilter("all");
    setDepartmentFilter("all");
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleDelete = async (employee) => {
    const emp = employee.raw || employee;
    try {
      // Use the numeric DB id from raw object (response has both id and employeeId)
      const employeeId = emp.id; // numeric id from API
      await employeeService.deleteEmployee(employeeId);

      // Remove from UI immediately
      setData(prev =>
        prev.filter(item => {
          const itemEmp = item.raw || item;
          return itemEmp.id !== employeeId;
        })
      );
      toast.success("Employee deleted successfully");

      // Refresh data to get updated list
      window.location.reload();
    } catch (error) {
      console.error("Delete failed:", error.message);
      alert(error.message || "Failed to delete employee");
    }
  };

  const handleExport = async () => {
    try {
      // Build query parameters for full fetch (no limit or high limit)
      let departmentId = "";
      if (departmentFilter !== "all") {
        const dept = departmentOptions.find(d => d.name === departmentFilter || d.id?.toString() === departmentFilter);
        departmentId = dept?.id?.toString() || departmentFilter;
      }

      let designationId = "";
      if (designationFilter !== "all") {
        const desig = designationOptions.find(d => d.name === designationFilter || d.id?.toString() === designationFilter);
        designationId = desig?.id?.toString() || designationFilter;
      }

      const params = {
        limit: 1000, // Reasonable limit for export
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== "all") params.status = statusFilter;
      if (departmentId) params.department = departmentId;
      if (designationId) params.designation = designationId;

      const response = await employeeService.getAllEmployees(params);
      const employees = response.success ? (response.data || []) : (response.data?.users || response.data || []);
      
      const columns = [
        { label: "Employee ID", key: "id" },
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Department", key: "department" },
        { label: "Designation", key: "designation" },
        { label: "Reporting Manager", key: "reportingManager" },
        { label: "Status", key: "status" },
        { label: "System Role", key: "systemRole" },
      ];

      const exportRows = employees.map(emp => {
        const profile = emp.employee || emp.profile || {};
        return {
          id: emp.employeeCode || profile.employeeId || emp.employeeId || emp.id,
          name: `${emp.firstName || profile.firstName || ""} ${emp.lastName || profile.lastName || ""}`.trim() || "-",
          email: emp.email || "-",
          department: (typeof emp.department === 'object' ? emp.department?.name : emp.department) || profile.department?.name || "-",
          designation: (typeof emp.designation === 'object' ? emp.designation?.name : emp.designation) || profile.designation?.name || "-",
          reportingManager: emp.reportingManager ? `${emp.reportingManager.firstName || ""} ${emp.reportingManager.lastName || ""}`.trim() : "-",
          status: emp.status || (emp.isActive ? "ACTIVE" : "INACTIVE"),
          systemRole: emp.systemRole || "-",
        };
      });

      downloadExcel({
        columns,
        rows: exportRows,
        fileName: `Employees_${new Date().toISOString().split('T')[0]}.xlsx`
      });

      toast.success("Export successful");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export employees");
    }
  };


  // =============================
  // UI
  // =============================
  if (loading && data.length === 0) {
    return <div className="p-6 text-gray-500">Loading employees...</div>;
  }

  return (
    <div className="p-3 sm:p-6">
      <EmployeeFilters
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        designationFilter={designationFilter}
        setDesignationFilter={setDesignationFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        statuses={statuses}
        designations={designations}
        departments={departments}
        onClearFilters={clearFilters}
        onExport={handleExport}
      />

      <div className="relative mt-6 rounded-sm border border-gray-200 dark:border-gray-700 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5 border-b border-brand-200 dark:border-brand-500/20">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={pagination.pageIndex + 1}
        totalItems={totalItems}
        totalPages={totalPages}
        itemsPerPage={pagination.pageSize}
        onPageChange={page => {
          setPagination(prev => ({ ...prev, pageIndex: page - 1 }));
        }}
        onItemsPerPageChange={size => {
          setPagination({ pageIndex: 0, pageSize: size });
        }}
        className="mt-6"
      />
      {isCrudAllowed && (
        <ConfirmationDialog
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, employee: null })}
          onConfirm={async () => {
            if (confirmState.employee) {
              await handleDelete(confirmState.employee);
            }
            setConfirmState({ isOpen: false, employee: null });
          }}
          title="Delete employee?"
          message={`Are you sure you want to delete ${confirmState.employee
            ? `${confirmState.employee.firstName || ""} ${confirmState.employee.lastName || ""}`.trim()
            : "this employee"
            }? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive
        />
      )}
    </div>
  );
}
