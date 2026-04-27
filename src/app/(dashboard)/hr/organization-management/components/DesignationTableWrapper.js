"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Eye, Edit, Trash2, MoreVertical, Upload, Download } from "lucide-react";
import * as XLSX from "xlsx";
import Pagination from "@/components/common/Pagination";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import Link from "next/link";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

export default function DesignationTableWrapper({ viewOnly = false, allowFetch = true }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const baseOrgPath = pathname.startsWith("/manager")
    ? "/manager/organization-management"
    : pathname.startsWith("/recruiter")
      ? "/recruiter/organization-management"
      : pathname.startsWith("/it-admin")
        ? "/it-admin/organization-management"
      : pathname.startsWith("/dept-head")
        ? "/dept-head/organization-management"
        : pathname.startsWith("/it-admin")
          ? "/it-admin/organization-management"
          : "/hr/organization-management";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [openAction, setOpenAction] = useState(null);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    designation: null,
  });
  const [isImporting, setIsImporting] = useState(false);

  // Fetch departments for filter
  useEffect(() => {
    if (!allowFetch) {
      setDepartments([]);
      return;
    }

    const fetchDepartments = async () => {
      try {
        // Use max limit of 100 as per API validation (max: 100)
        const response = await organizationService.getAllDepartments({ limit: 100, page: 1 });
        const depts = response.success ? response.data || [] : response.data?.departments || [];
        setDepartments(depts);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        toast.error("Failed to load departments for filter");
      }
    };
    fetchDepartments();
  }, [allowFetch]);

  // Fetch designations from API
  const fetchDesignations = async () => {
    if (!allowFetch) {
      setData([]);
      setTotalItems(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Ensure limit doesn't exceed API maximum of 100
      const validLimit = Math.min(Math.max(1, pagination.pageSize), 100);
      const params = {
        page: pagination.pageIndex + 1,
        limit: validLimit,
        search: globalFilter || "",
        status: statusFilter !== "all" ? statusFilter : "all",
        department: departmentFilter !== "all" ? departmentFilter : "all",
      };

      const response = await organizationService.getAllDesignations(params);

      // Handle API response structure
      const designations = response.success
        ? response.data || []
        : response.data?.designations || response.data || [];
      const paginationInfo = response.pagination || response.data?.pagination || {};

      const formattedData = designations.map((desig) => ({
        id: desig.id,
        name: desig.name || "Unnamed Designation",
        level: desig.level || "-",
        code: desig.code || "-",
        departmentName: desig.department?.name || "-",
        departmentId: desig.department?.id || null,
        orgLevel: desig.orgLevel || 0,
        employeeCount: desig.employeeCount || 0,
        status: desig.status || "ACTIVE",
        raw: desig,
      }));

      setData(formattedData);
      setTotalItems(paginationInfo.totalItems || paginationInfo.total || 0);
      setTotalPages(
        paginationInfo.totalPages ||
          Math.ceil((paginationInfo.totalItems || paginationInfo.total || 0) / pagination.pageSize)
      );
    } catch (error) {
      console.error("Error fetching designations:", error);
      toast.error(error.message || "Failed to fetch designations");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!allowFetch) {
      setData([]);
      setTotalItems(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    fetchDesignations();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, statusFilter, departmentFilter, allowFetch]);

  useEffect(() => {
    if (!openAction) return;

    const handleClickOutside = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-action-menu]") || target.closest("[data-action-toggle]")) {
        return;
      }
      setOpenAction(null);
    };

    const handleScroll = () => setOpenAction(null);
    const handleResize = () => setOpenAction(null);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [openAction]);

  const handleDelete = async (designation) => {
    const desig = designation?.raw || designation;
    if (!desig?.id) return;

    try {
      await organizationService.deleteDesignation(desig.id);
      toast.success("Designation deleted successfully");
      fetchDesignations();
    } catch (error) {
      toast.error(error.message || "Failed to delete designation");
    }
  };

  const getNormalizedKey = (value) => {
    const key = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");

    if (key.startsWith("design")) return "designation_name";
    if (key.startsWith("depart")) return "department";
    if (key.startsWith("org_level") || key === "orglevel") return "org_level";
    return key;
  };

  const handleExport = () => {
    try {
      const rows = (Array.isArray(data) ? data : []).map((desig) => ({
        "Designation Name": desig.name || "",
        Department: desig.departmentName || "",
        Level: desig.level || "",
        Status: desig.status || "ACTIVE",
        Code: desig.code || "",
        "Org Level": desig.orgLevel ?? "",
        "Employee Count": desig.employeeCount ?? 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Designations");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "designations-export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Designations exported");
    } catch (error) {
      toast.error("Failed to export designations");
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      const headers = Array.isArray(rawRows?.[0]) ? rawRows[0] : [];
      const dataRows = Array.isArray(rawRows) ? rawRows.slice(1) : [];

      const departmentMap = new Map(
        (Array.isArray(departments) ? departments : [])
          .filter((dept) => dept?.id)
          .map((dept) => [String(dept.name).toLowerCase(), dept.id])
      );

      let createdCount = 0;
      let skippedCount = 0;
      const failedRows = [];

      const existingKeys = new Set(
        (Array.isArray(data) ? data : [])
          .filter((item) => item?.name)
          .map((item) => `${String(item.name).toLowerCase()}__${String(item.departmentName || "").toLowerCase()}`)
      );

      for (const row of dataRows) {
        if (!Array.isArray(row) || row.every((cell) => String(cell || "").trim() === "")) {
          continue;
        }
        const normalized = {};
        headers.forEach((header, idx) => {
          normalized[getNormalizedKey(header)] = row[idx];
        });

        const fallbackName = row?.[0] || "";
        const hasContent = Object.values(normalized).some((val) => String(val || "").trim() !== "");
        const name = normalized.designation_name || normalized.name || normalized.designation || fallbackName || "";
        const level = normalized.level || "L1";
        if (!hasContent && !name) {
          continue;
        }
        if (!name) {
          failedRows.push({
            name,
            reason: "Missing required field (Designation Name)",
          });
          continue;
        }

        const departmentValue = normalized.department || normalized.department_name || "";
        const departmentId = departmentValue
          ? departmentMap.get(String(departmentValue).toLowerCase()) || String(departmentValue).trim()
          : undefined;
        if (!departmentId) {
          failedRows.push({
            name,
            reason: "Missing or invalid Department",
          });
          continue;
        }

        const deptNameKey = String(departmentValue || "")
          .toLowerCase()
          .trim();
        const existingKey = `${String(name).toLowerCase()}__${deptNameKey}`;
        if (existingKeys.has(existingKey)) {
          skippedCount += 1;
          continue;
        }

        const payload = {
          name: String(name).trim(),
          departmentId,
          level: String(level).trim(),
          status: normalized.status ? String(normalized.status).trim() : "ACTIVE",
          code: normalized.code ? String(normalized.code).trim() : undefined,
          orgLevel: normalized.org_level ? Number(normalized.org_level) : undefined,
        };

        try {
          await organizationService.createDesignation(payload);
          createdCount += 1;
        } catch (error) {
          const message = error.message || "Validation failed";
          if (/already exists|duplicate/i.test(message)) {
            skippedCount += 1;
          } else {
            failedRows.push({
              name: payload.name,
              reason: message,
            });
          }
        }
      }

      if (createdCount > 0) {
        toast.success(`Imported ${createdCount} designations`);
      }
      if (skippedCount > 0) {
        toast(`Skipped ${skippedCount} existing designations`, { icon: "ℹ️" });
      }
      if (failedRows.length > 0) {
        if (createdCount > 0) {
          toast(`Skipped ${failedRows.length} invalid row(s). Check required fields.`, { icon: "⚠️" });
        } else {
          toast.error(`Validation failed for ${failedRows.length} row(s). Check required fields.`);
        }
        console.warn("Designation import failures:", failedRows);
      }
      await fetchDesignations();
    } catch (error) {
      toast.error(error.message || "Failed to import designations");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const columns = useMemo(
    () => {
      const baseColumns = [
      {
        accessorKey: "id",
        header: "#",
        cell: (info) => (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {info.row.index + 1 + pagination.pageIndex * pagination.pageSize}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Designation Name",
        cell: (info) => (
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: (info) => (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-500/30 dark:text-brand-400">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "departmentName",
        header: "Department",
        cell: (info) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: "orgLevel",
        header: "Org Level",
        cell: (info) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>
        ),
      },
      {
      accessorKey: "employeeCount",
      header: "Employees",
      cell: (info) => (
        <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
          {info.getValue()}
        </span>
      ),
    },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const statusClass =
            status === "ACTIVE"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
          return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
              {status}
            </span>
          );
        },
      },
      ];

      if (viewOnly) {
        return [
          ...baseColumns,
          {
            id: "view",
            header: "View",
            enableSorting: false,
            cell: (info) => (
              <Link
                href={`${baseOrgPath}/designations/view/${info.row.original.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>
            ),
          },
        ];
      }

      return [
        ...baseColumns,
        {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: (info) => (
          <div className="flex items-center justify-center">
            <button
              type="button"
              data-action-toggle
              onClick={(event) => {
                const rowId = info.row.original.id;
                const rect = event.currentTarget.getBoundingClientRect();
                setOpenAction((prev) => {
                  if (prev?.id === rowId) return null;
                  return {
                    id: rowId,
                    top: rect.bottom + window.scrollY + 6,
                    left: rect.right + window.scrollX - 160,
                  };
                });
              }}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ),
      },
      ];
    },
    [pagination.pageIndex, pagination.pageSize, viewOnly, baseOrgPath]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search designations..."
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          {!viewOnly && (
            <>
              <label className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-sm border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                <Upload className="w-4 h-4" />
                {isImporting ? "Importing..." : "Import"}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleImport}
                  disabled={isImporting}
                />
              </label>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-sm border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none hover:text-brand-600 dark:hover:text-brand-400"
                            : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="flex flex-col">
                            <ChevronUp
                              className={`w-3 h-3 ${
                                header.column.getIsSorted() === "asc"
                                  ? "text-brand-600 dark:text-brand-400"
                                  : "text-gray-400"
                              }`}
                            />
                            <ChevronDown
                              className={`w-3 h-3 -mt-1 ${
                                header.column.getIsSorted() === "desc"
                                  ? "text-brand-600 dark:text-brand-400"
                                  : "text-gray-400"
                              }`}
                            />
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  No designations found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.pageIndex + 1}
        totalItems={totalItems}
        totalPages={totalPages}
        itemsPerPage={pagination.pageSize}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
        }}
        onItemsPerPageChange={(size) => {
          // API limit validation: max 100 items per page
          const validSize = Math.min(Math.max(1, size), 100);
          setPagination({ pageIndex: 0, pageSize: validSize });
        }}
      />
      {!viewOnly && openAction &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-action-menu
            className="absolute z-[9999] w-40 rounded-sm border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            style={{ top: `${openAction.top}px`, left: `${openAction.left}px` }}
          >
            <Link
              href={`${baseOrgPath}/designations/view/${openAction.id}`}
              onClick={() => setOpenAction(null)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Eye className="h-4 w-4 text-brand-500" />
              View
            </Link>
            <Link
              href={`${baseOrgPath}/designations/edit/${openAction.id}`}
              onClick={() => setOpenAction(null)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Edit className="h-4 w-4 text-emerald-500" />
              Edit
            </Link>
            <button
              onClick={() => {
                const row = data.find((item) => item.id === openAction.id);
                setConfirmState({ isOpen: true, designation: row });
                setOpenAction(null);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>,
          document.body
        )}
      {!viewOnly && (
        <ConfirmationDialog
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, designation: null })}
          onConfirm={async () => {
            if (confirmState.designation) {
              await handleDelete(confirmState.designation);
            }
            setConfirmState({ isOpen: false, designation: null });
          }}
          title="Delete designation?"
          message={`Are you sure you want to delete "${
            confirmState.designation?.name || "this designation"
          }"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive
        />
      )}
    </div>
  );
}
