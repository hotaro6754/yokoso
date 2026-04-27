"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquareText,
  MoreVertical,
} from "lucide-react";
import { managerAttendanceApprovalsService } from "@/services/manager-services/attendance-approvals.service";
import { toast } from "react-hot-toast";

export default function ManagerAttendanceApprovalsPage() {
  const [openMenu, setOpenMenu] = useState({ id: null });
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [attendanceCorrections, setAttendanceCorrections] = useState([]);
  const [actionState, setActionState] = useState({ open: false, action: null, id: null });
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "Attendance Approvals", href: "/manager/attendance-approvals" },
  ];

  const summary = useMemo(() => {
    const attendancePending = attendanceCorrections.length;
    return { attendancePending };
  }, [attendanceCorrections]);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    if (openMenu.id === id) {
      setOpenMenu({ id: null });
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdownWidth = 176; // w-44
      let left = rect.right - dropdownWidth;
      if (left < 10) left = rect.left;

      setMenuPosition({
        top: rect.bottom + 5,
        left: left
      });
      setOpenMenu({ id });
    }
  };

  const openAction = (action, id) => {
    setActionState({ open: true, action, id });
    setComment("");
    setOpenMenu({ id: null });
  };

  const closeAction = () => {
    setActionState({ open: false, action: null, id: null });
    setComment("");
  };

  const confirmAction = async () => {
    try {
      if (actionState.action === "Approve") {
        await managerAttendanceApprovalsService.approveCorrection(actionState.id, comment.trim());
      } else if (actionState.action === "Reject") {
        await managerAttendanceApprovalsService.rejectCorrection(actionState.id, comment.trim());
      } else {
        await managerAttendanceApprovalsService.requestClarification(actionState.id, comment.trim());
      }

      setAttendanceCorrections((prev) =>
        prev.filter((item) => item.id !== actionState.id)
      );
      toast.success(
        actionState.action === "Approve"
          ? "Attendance approved"
          : actionState.action === "Reject"
            ? "Attendance rejected"
            : "Clarification requested"
      );

      setRefreshTrigger(prev => prev + 1);
      closeAction();
    } catch (err) {
      setError(err?.message || "Unable to update attendance approval");
    }
  };

  useEffect(() => {
    let active = true;

    const fetchApprovals = async () => {
      try {
        const data = await managerAttendanceApprovalsService.getApprovals();
        if (!active) return;
        setAttendanceCorrections(data?.attendanceCorrections || []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load attendance approvals");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    fetchApprovals();

    const closeMenu = () => setOpenMenu({ id: null });
    window.addEventListener('click', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);

    return () => {
      active = false;
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('resize', closeMenu);
    };
  }, [refreshTrigger]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending Attendance</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{summary.attendancePending}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
              <Clock className="text-primary-600 dark:text-primary-400" size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Attendance Corrections</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Regularization & late entry</p>
            </div>
          </div>

          <div className="overflow-x-auto lg:overflow-visible pb-10">
            <table className="min-w-full text-sm">
              <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Request</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceCorrections.map((item) => (
                  <tr key={item.id} className="border-t border-gray-200/60 dark:border-gray-700/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{item.employee}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-100 dark:border-rose-500/20">
                          {item.impact}
                        </span>
                      </div>
                      <p className="text-xs">
                        <span className="text-gray-400">Reason:</span> {item.reason}
                      </p>
                      <p className="text-xs mt-1 font-medium bg-gray-50 dark:bg-gray-800 inline-block px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                        {item.original}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => toggleMenu(e, item.id)}
                          className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && attendanceCorrections.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No pending corrections.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {openMenu.id && (
          <div
            className="fixed w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1 z-[99]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg"
              onClick={() => openAction("Approve", openMenu.id)}
            >
              <CheckCircle2 size={14} /> Approve
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"
              onClick={() => openAction("Reject", openMenu.id)}
            >
              <XCircle size={14} /> Reject
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg"
              onClick={() => openAction("Clarify", openMenu.id)}
            >
              <MessageSquareText size={14} /> Request Info
            </button>
          </div>
        )}

        {actionState.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {actionState.action} Attendance Request
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Add an optional comment for the employee.
              </p>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Add a short note (optional)"
                className="mt-4 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 p-3 text-sm"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={closeAction}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                  onClick={confirmAction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
