// src/app/(dashboard)/hr/leave/types/page.js
"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { PlusCircle, Calendar, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import LeaveTypeDetail from '../components/LeaveTypeDetail';
import Link from 'next/link';
import { leaveTypeService } from '@/services/hr-services/leaveTypeService';
import { toast } from 'sonner';

export default function LeaveTypes() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [openAction, setOpenAction] = useState(null);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await leaveTypeService.getAllLeaveTypes();
      setLeaveTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      toast.error(error.message || 'Failed to fetch leave types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!openAction) return;
      const target = event.target;
      if (target.closest('[data-action-toggle]') || target.closest('[data-action-menu]')) {
        return;
      }
      setOpenAction(null);
    };

    const handleScroll = () => {
      if (openAction) {
        setOpenAction(null);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [openAction]);

  const handleView = (leaveType) => {
    setSelectedType(leaveType);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
  };

  const handleEdit = (leaveType) => {
    router.push(`/hr/leave/types/edit/${leaveType.id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedType) return;

    setDeleting(true);
    try {
      await leaveTypeService.deleteLeaveType(selectedType.id);
      toast.success('Leave type deleted successfully');
      setLeaveTypes(prev => prev.filter(type => type.id !== selectedType.id));
      setShowDeleteConfirm(false);
      setShowDetail(false);
    } catch (error) {
      console.error('Error deleting leave type:', error);
      toast.error(error.message || 'Failed to delete leave type');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
        <Breadcrumb
          pages={[
            { name: 'HR', href: '/hr' },
            { name: 'Leave', href: '/hr/leave' },
            { name: 'Leave Types', href: '#' },
          ]}
          rightContent={
            <Link
              href="/hr/leave/types/add"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-white hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold"
            >
              <PlusCircle size={18} /> Add Leave Type
            </Link>
          }
        />

        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      {/* Breadcrumb with Add Leave Type button */}
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Leave", href: "/hr/leave" },
            { label: "Leave Types", href: "/hr/leave/types" },
          ]}
          rightContent={
            <Link
              href="/hr/leave/types/add"
              className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm hover:shadow-md font-semibold"
            >
              <PlusCircle size={18} /> Add Leave Type
            </Link>
          }
        />
      </div>

      {/* Leave Types Table */}
      {leaveTypes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-8 text-center">
          <Calendar className="w-12 h-12 text-brand-400 dark:text-brand-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Leave Types Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get started by creating your first leave type
          </p>
          <Link
            href="/hr/leave/types/add"
            className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm hover:shadow-md font-semibold"
          >
            <PlusCircle size={18} /> Add Leave Type
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Days / Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Deductible
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Docs Required
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaveTypes.map((leaveType) => {
                  const daysPerYear = leaveType.daysPerYear ?? leaveType.limitDays ?? 0;
                  const isPaid =
                    typeof leaveType.isPaid === "boolean" ? leaveType.isPaid : null;
                  const docsRequired =
                    leaveType.requiresDocumentation ?? leaveType.requiresAttachment ?? false;
                  const code = leaveType.code || leaveType.leaveCode || "-";

                  return (
                    <tr
                      key={leaveType.id}
                      className="border-t border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                        {leaveType.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {code}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {daysPerYear}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {isPaid === null ? "—" : isPaid ? "Paid" : "Unpaid"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {leaveType.isDeductible ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {docsRequired ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            leaveType.isActive
                              ? "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {leaveType.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            data-action-toggle
                            onClick={(event) => {
                              const rect = event.currentTarget.getBoundingClientRect();
                              setSelectedType(leaveType);
                              setOpenAction((prev) => {
                                if (prev?.id === leaveType.id) return null;
                                return {
                                  id: leaveType.id,
                                  top: rect.bottom + window.scrollY + 6,
                                  left: rect.right + window.scrollX - 160,
                                };
                              });
                            }}
                            className="p-2 rounded-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {openAction &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-action-menu
            className="absolute z-[9999] w-40 rounded-sm border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            style={{ top: `${openAction.top}px`, left: `${openAction.left}px` }}
          >
            <button
              onClick={() => {
                const row = leaveTypes.find((item) => item.id === openAction.id);
                if (row) {
                  handleView(row);
                }
                setOpenAction(null);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Eye className="h-4 w-4 text-brand-500" />
              View
            </button>
            <button
              onClick={() => {
                const row = leaveTypes.find((item) => item.id === openAction.id);
                if (row) {
                  handleEdit(row);
                }
                setOpenAction(null);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Edit className="h-4 w-4 text-emerald-500" />
              Edit
            </button>
            <button
              onClick={() => {
                const row = leaveTypes.find((item) => item.id === openAction.id);
                if (row) {
                  setSelectedType(row);
                }
                handleDeleteClick();
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

      {/* Leave Type Detail Modal */}
      <LeaveTypeDetail
        isOpen={showDetail}
        onClose={closeDetail}
        leaveType={selectedType}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Leave Type"
        message={`Are you sure you want to delete the leave type "${selectedType?.name}"?`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        isDestructive={true}
        closeOnConfirm={false}
      />
    </div>
  );
}