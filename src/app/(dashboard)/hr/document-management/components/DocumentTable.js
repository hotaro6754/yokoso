"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import DocumentFilters from "./DocumentFilters";
import { documentsService } from "@/services/hr-services/documents.service";
import { toast } from "react-hot-toast";
import { userManagementService } from "@/services/userManagementService";
import EditDocumentModal from "./EditDocumentModal";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

export default function DocumentTable() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [expiringSoonFilter, setExpiringSoonFilter] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    document: null,
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

  // Fetch users for filter dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Use max limit of 100 as per API validation (max: 100)
        const response = await userManagementService.getAllUsers({ limit: 100, page: 1 });
        const usersList = response.success
          ? response.data || []
          : response.data?.users || response.data || [];
        const mappedUsers = (usersList || []).map((user) => ({
          id: user.id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          employeeId: user.employeeCode || "N/A",
        }));
        setEmployees(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // Ensure limit doesn't exceed API maximum of 100
        const validLimit = Math.min(Math.max(1, pagination.pageSize), 100);
        const params = {
          page: pagination.pageIndex + 1,
          limit: validLimit,
          search: globalFilter || "",
          type: typeFilter !== "all" ? typeFilter : "",
          status: statusFilter !== "all" ? statusFilter : "",
          employeeId: employeeFilter !== "all" ? employeeFilter : "",
          expiringSoon: expiringSoonFilter ? "true" : "",
        };

        // Remove empty params
        Object.keys(params).forEach(
          (key) => params[key] === "" && delete params[key]
        );

        const response = await documentsService.getAllDocuments(params);

        // Handle API response structure: { success: true, data: [...], pagination: {...} }
        // or { success: true, data: { documents: [...], pagination: {...} } }
        let documents = [];
        let paginationInfo = {};

        if (response.success) {
          // Check if response.data is an array directly
          if (Array.isArray(response.data)) {
            documents = response.data;
            paginationInfo = response.pagination || {};
          } else if (response.data && typeof response.data === 'object') {
            // Check if data has documents array
            if (Array.isArray(response.data.documents)) {
              documents = response.data.documents;
              paginationInfo = response.data.pagination || response.pagination || {};
            } else if (Array.isArray(response.data.data)) {
              documents = response.data.data;
              paginationInfo = response.data.pagination || response.pagination || {};
            } else {
              // If data is an object but not array, try to use it as single item array
              documents = [];
            }
          }
        } else {
          // Handle non-success responses
          if (Array.isArray(response.data)) {
            documents = response.data;
          } else if (response.data?.documents && Array.isArray(response.data.documents)) {
            documents = response.data.documents;
            paginationInfo = response.data.pagination || {};
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            documents = response.data.data;
            paginationInfo = response.data.pagination || {};
          }
          paginationInfo = response.pagination || response.data?.pagination || paginationInfo;
        }

        // Ensure documents is always an array
        if (!Array.isArray(documents)) {
          console.warn("Documents is not an array:", documents);
          documents = [];
        }

        const formattedData = documents.map((doc) => {
          const rawUrl = doc.fileUrl || doc.url || doc.filePath || null;
          const fileUrl = rawUrl
            ? rawUrl.startsWith("http")
              ? rawUrl
              : `${fileBaseUrl}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`
            : null;

          return {
            id: doc.id,
            name: doc.name || "Unnamed Document",
            type: doc.type || "OTHER",
            status: doc.status || "PENDING",
            employeeName: doc.user
              ? `${doc.user.firstName || ""} ${doc.user.lastName || ""}`.trim() || doc.user.email || "N/A"
              : doc.employeeName || "N/A",
            employeeId: doc.user?.id || doc.employeeId || null,
            employeeEmployeeId: doc.user?.employeeCode || doc.employeeEmployeeId || "N/A",
            uploadedDate: doc.createdAt
              ? new Date(doc.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              : "-",
            expiryDate: doc.expiresAt
              ? new Date(doc.expiresAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              : null,
            isExpiringSoon: doc.isExpiringSoon || false,
            isExpired: doc.isExpired || false,
            description: doc.description || "",
            fileUrl,
            raw: doc, // Keep full object for actions
          };
        });

        setData(formattedData);
        setTotalItems(paginationInfo.totalItems || paginationInfo.total || documents.length);
        setTotalPages(
          paginationInfo.totalPages ||
          Math.ceil(
            (paginationInfo.totalItems || paginationInfo.total || documents.length) /
            pagination.pageSize
          )
        );
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
        });
        toast.error(error.message || "Failed to fetch documents");
        setData([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    typeFilter,
    statusFilter,
    employeeFilter,
    expiringSoonFilter,
  ]);

  // Column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Document Name",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-sm">
              <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {info.getValue()}
              </p>
              {info.row.original.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {info.row.original.description}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: (info) => {
          const type = info.getValue();
          const typeLabels = {
            ID_PROOF: "ID Proof",
            ADDRESS_PROOF: "Address Proof",
            AADHAAR: "Aadhaar",
            PAN: "PAN",
            EDUCATION: "Education",
            EMPLOYMENT_LETTER: "Employment",
            OFFER_LETTER: "Offer Letter",
            CONTRACT: "Contract",
            RESUME: "Resume",
            PHOTO: "Photo",
            EXPERIENCE: "Experience",
            OTHER: "Other",
          };
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
              {typeLabels[type] || type}
            </span>
          );
        },
      },
      {
        accessorKey: "employeeName",
        header: "Employee",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm">
              <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {info.getValue()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {info.row.original.employeeEmployeeId}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const statusConfig = {
            PENDING: {
              label: "Pending",
              style:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            },
            VERIFIED: {
              label: "Verified",
              style:
                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            },
            REJECTED: {
              label: "Rejected",
              style:
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            },
            EXPIRED: {
              label: "Expired",
              style:
                "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
            },
          };
          const config = statusConfig[status] || {
            label: status,
            style:
              "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          };

          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.style}`}
            >
              {config.label}
            </span>
          );
        },
      },
      {
        accessorKey: "uploadedDate",
        header: "Uploaded",
      },
      {
        accessorKey: "expiryDate",
        header: "Expires",
        cell: (info) => {
          const expiryDate = info.getValue();
          const isExpiringSoon = info.row.original.isExpiringSoon;
          const isExpired = info.row.original.isExpired;

          if (!expiryDate) {
            return (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                No expiry
              </span>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span
                className={`text-xs font-medium ${isExpired
                  ? "text-red-600 dark:text-red-400"
                  : isExpiringSoon
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                {expiryDate}
              </span>
              {(isExpired || isExpiringSoon) && (
                <AlertCircle
                  className={`w-3.5 h-3.5 ${isExpired
                    ? "text-red-600 dark:text-red-400"
                    : "text-orange-600 dark:text-orange-400"
                    }`}
                />
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: (info) => (
          <div className="flex items-center gap-2">
            {info.row.original.fileUrl && (
              <>
                <button
                  onClick={() => handleView(info.row.original)}
                  className="p-2 rounded-sm bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 transition-colors shadow-sm hover:shadow"
                  title="View Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(info.row.original)}
                  className="p-2 rounded-sm bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                  title="Download Document"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => handleEdit(info.row.original)}
              className="p-2 rounded-sm bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 transition-colors"
              title="Edit Document"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(info.row.original)}
              className="p-2 rounded-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Table instance
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

  // Action handlers
  const handleView = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, "_blank");
    } else {
      toast.error("Document URL not available");
    }
  };

  const handleDownload = async (doc) => {
    if (doc.fileUrl) {
      try {
        const response = await fetch(doc.fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.name || "document";
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        toast.success("Document download started");
      } catch (error) {
        console.error("Download failed:", error);
        // Fallback to opening in new tab if fetch fails (e.g. due to CORS)
        window.open(doc.fileUrl, "_blank");
      }
    } else {
      toast.error("Document URL not available");
    }
  };

  const handleEdit = (doc) => {
    setEditingDocument(doc);
    setIsEditModalOpen(true);
  };

  const handleEditUpdate = () => {
    // Refresh data after update
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setIsEditModalOpen(false);
    setEditingDocument(null);
  };

  const handleDelete = (document) => {
    setDeleteConfirmation({
      isOpen: true,
      document,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.document) return;

    try {
      await documentsService.deleteDocument(deleteConfirmation.document.id);
      toast.success("Document deleted successfully");
      // Refresh data
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    } catch (error) {
      console.error("Delete failed:", error.message);
      toast.error(error.message || "Failed to delete document");
    } finally {
      setDeleteConfirmation({ isOpen: false, document: null });
    }
  };

  const clearFilters = () => {
    setGlobalFilter("");
    setTypeFilter("all");
    setStatusFilter("all");
    setEmployeeFilter("all");
    setExpiringSoonFilter(false);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <DocumentFilters
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        employeeFilter={employeeFilter}
        setEmployeeFilter={setEmployeeFilter}
        expiringSoonFilter={expiringSoonFilter}
        setExpiringSoonFilter={setExpiringSoonFilter}
        onClearFilters={clearFilters}
        employees={employees}
      />

      <div className="overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-700 mt-6">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${header.column.getCanSort()
                          ? "cursor-pointer select-none hover:text-gray-900 dark:hover:text-white"
                          : ""
                          }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="flex flex-col">
                            <ChevronUp
                              className={`w-3 h-3 ${header.column.getIsSorted() === "asc"
                                ? "text-brand-600 dark:text-brand-400"
                                : "text-gray-400"
                                }`}
                            />
                            <ChevronDown
                              className={`w-3 h-3 -mt-1 ${header.column.getIsSorted() === "desc"
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
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">No documents found</p>
                  <p className="text-xs mt-1">
                    Try adjusting your filters or upload a new document
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
        className="mt-6"
      />

      {/* Edit Document Modal */}
      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDocument(null);
        }}
        document={editingDocument}
        onUpdate={handleEditUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, document: null })}
        onConfirm={confirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteConfirmation.document?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
