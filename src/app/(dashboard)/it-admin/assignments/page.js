"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter,
  Eye,
  X,
  MoreVertical,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';
import Pagination from '@/components/common/Pagination';

export default function DeviceAssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusParam = useMemo(() => {
    return statusFilter === 'Active'
      ? 'active'
      : statusFilter === 'Pending Return'
      ? 'pending_return'
      : statusFilter === 'Returned'
      ? 'returned'
      : 'all';
  }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await itDeviceService.getAssignments({
          page: currentPage,
          limit: itemsPerPage,
          status: statusParam,
          search: searchTerm?.trim() || undefined
        });

        if (res?.success) {
          setAssignments(res.data?.assignments || []);
          setPagination(
            res.data?.pagination || {
              currentPage,
              totalPages: 1,
              totalItems: (res.data?.assignments || []).length,
              itemsPerPage
            }
          );
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [statusParam, searchTerm, currentPage, itemsPerPage]);

  // Reset to first page on filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusParam, searchTerm]);

  const getStatusBadge = (status) => {
    const badges = {
      'Active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Pending Return': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Returned': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

  const AssignmentRowActions = ({ assignment }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    const MENU_WIDTH = 208; // w-52
    const GAP = 8;

    useEffect(() => {
      const onMouseDown = (e) => {
        if (!isOpen) return;
        const target = e.target;
        if (target?.closest?.(`[data-assignment-actions="${assignment.id}"]`)) return;
        setIsOpen(false);
      };
      const onKeyDown = (e) => {
        if (e.key === 'Escape') setIsOpen(false);
      };

      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [isOpen, assignment.id]);

    useEffect(() => {
      if (!isOpen) return;
      const btn = buttonRef?.current;
      if (!btn) return;

      const compute = () => {
        const rect = btn.getBoundingClientRect();
        let left = rect.right - MENU_WIDTH;
        let top = rect.bottom + GAP;

        const minLeft = 8;
        const maxLeft = window.innerWidth - MENU_WIDTH - 8;
        left = Math.min(Math.max(left, minLeft), Math.max(maxLeft, minLeft));

        const approxMenuHeight = assignment.status === 'Active' ? 104 : 56;
        if (top + approxMenuHeight > window.innerHeight - 8) {
          top = rect.top - approxMenuHeight - GAP;
        }
        top = Math.max(top, 8);

        setMenuPos({ top, left });
      };

      compute();
      window.addEventListener('resize', compute);
      window.addEventListener('scroll', compute, true);
      return () => {
        window.removeEventListener('resize', compute);
        window.removeEventListener('scroll', compute, true);
      };
    }, [isOpen, assignment.status]);

    return (
      <div className="relative inline-block" data-assignment-actions={assignment.id}>
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((v) => !v);
          }}
          className="p-2 text-gray-600 hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 rounded-lg transition-all"
          title="Actions"
        >
          <MoreVertical size={18} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />

            <div
              className="fixed z-[100] w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
            >
              <button
                type="button"
                onClick={() => {
                  handleViewDetails(assignment);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Eye size={16} />
                View
              </button>

              {assignment.status === 'Active' && (
                <Link
                  href={`/it-admin/returns/new?assignmentId=${assignment.id}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <RotateCcw size={16} />
                  Process Return
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Breadcrumb
          items={[
            { label: "IT Admin", href: "/it-admin" },
            { label: "Device Assignments", href: "/it-admin/assignments" },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[hsl(var(--primary))] rounded-xl">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Device Assignments
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Track all device assignments to employees
              </p>
            </div>
            <Link
              href="/it-admin/assignments/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              New Assignment
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by device or employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending Return">Pending Return</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading && (
            <div className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Loading assignments...
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Expected Return
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {assignment.deviceSerial}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {assignment.deviceBrand} {assignment.deviceModel}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {assignment.employeeName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {assignment.employeeId}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(assignment.assignedDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {assignment.expectedReturnDate ? new Date(assignment.expectedReturnDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {assignment.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AssignmentRowActions assignment={assignment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={pagination.currentPage || currentPage}
              totalItems={pagination.totalItems || 0}
              itemsPerPage={pagination.itemsPerPage || itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
              itemsPerPageOptions={[10, 20, 30, 40, 50, 100, 200]}
            />
          </div>
        </div>

        {/* Assignment Details Modal */}
        {showDetailsModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Assignment Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Device</label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{selectedAssignment.deviceSerial}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedAssignment.deviceBrand} {selectedAssignment.deviceModel}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Employee</label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{selectedAssignment.employeeName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedAssignment.employeeId}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Assigned Date</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedAssignment.assignedDate ? new Date(selectedAssignment.assignedDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Expected Return</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedAssignment.expectedReturnDate ? new Date(selectedAssignment.expectedReturnDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Condition</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedAssignment.condition || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedAssignment.status || '—'}</p>
                  </div>
                </div>

                {selectedAssignment.notes && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Notes</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedAssignment.notes}</p>
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
