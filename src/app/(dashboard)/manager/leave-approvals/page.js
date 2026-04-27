"use client";

import { useEffect, useMemo, useState } from "react";

import Breadcrumb from "@/components/common/Breadcrumb";

import {

  CalendarCheck,

  Paperclip,

  CheckCircle2,

  XCircle,

  MessageSquareText,

  Search,

  MoreVertical,

} from "lucide-react";

import { managerLeaveApprovalsService } from "@/services/manager-services/leave-approvals.service";
import { toast } from "react-hot-toast";



export default function ManagerLeaveApprovalsPage() {

  const [requests, setRequests] = useState([]);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [actionState, setActionState] = useState({ open: false, action: null, id: null });

  const [comment, setComment] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);



  const breadcrumbItems = [

    { label: "Manager", href: "/manager" },

    { label: "Leave Approvals", href: "/manager/leave-approvals" },

  ];



  const normalizeStatus = (value = "") => {

    const raw = String(value).trim();

    if (!raw) return "Pending";

    if (/sent\s*back/i.test(raw)) return "Sent Back";

    if (/approved/i.test(raw)) return "Approved";

    if (/rejected/i.test(raw)) return "Rejected";

    if (/pending/i.test(raw)) return "Pending";

    return raw;

  };



  const stripSentBackPrefix = (value = "") => {

    return String(value).replace(/^\s*sent\s*back\s*:\s*/i, "").trim();

  };



  const summary = useMemo(() => {

    const pending = requests.filter((item) => item.status === "Pending").length;

    const approved = requests.filter((item) => item.status === "Approved").length;

    const rejected = requests.filter((item) => item.status === "Rejected").length;

    const sentBack = requests.filter((item) => item.status === "Sent Back").length;

    return { pending, approved, rejected, sentBack };

  }, [requests]);



  const filteredRequests = useMemo(() => {

    return requests.filter((item) => {

      const matchesQuery =

        item.employee.toLowerCase().includes(query.toLowerCase()) ||

        item.type.toLowerCase().includes(query.toLowerCase()) ||

        item.id.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      return matchesQuery && matchesStatus;

    });

  }, [requests, query, statusFilter]);



  const openAction = (action, id) => {
    setActionState({ open: true, action, id });
    setComment("");
    setOpenMenuId(null);
  };

  const handleActionClick = (e, id) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdownWidth = 176; // w-44
      let left = rect.right - dropdownWidth;
      if (left < 10) left = rect.left;

      setMenuPosition({
        top: rect.bottom + 5,
        left: left
      });
      setOpenMenuId(id);
    }
  };

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('resize', closeMenu);
    };
  }, []);



  const closeAction = () => {

    setActionState({ open: false, action: null, id: null });

    setComment("");

  };



  const confirmAction = async () => {

    try {

      if (actionState.action === "Approve") {

        await managerLeaveApprovalsService.approveLeave(actionState.id);

      } else if (actionState.action === "Reject") {

        await managerLeaveApprovalsService.rejectLeave(actionState.id, comment.trim());

      } else {

        await managerLeaveApprovalsService.sendBackLeave(actionState.id, comment.trim());

      }



      setRequests((prev) =>

        prev.map((item) =>

          item.id === actionState.id

            ? {

              ...item,

              status:

                actionState.action === "Approve"

                  ? "Approved"

                  : actionState.action === "Reject"

                    ? "Rejected"

                    : "Sent Back",

              managerComment: comment.trim() || null,

            }

            : item

        )

      );

      toast.success(
        actionState.action === "Approve"
          ? "Leave approved"
          : actionState.action === "Reject"
            ? "Leave rejected"
            : "Sent back for clarification"
      );

      setRefreshTrigger(prev => prev + 1);
      closeAction();

    } catch (err) {

      setError(err?.message || "Unable to update leave request");

    }

  };



  useEffect(() => {

    let active = true;



    const fetchRequests = async () => {

      try {

        const data = await managerLeaveApprovalsService.getLeaveRequests();

        if (!active) return;

        const normalized = (data || []).map((item) => ({

          ...item,

          status: normalizeStatus(item.status),

          reason: stripSentBackPrefix(item.reason),

        }));

        setRequests(normalized);

      } catch (err) {

        if (!active) return;

        setError(err?.message || "Unable to load leave approvals");

      } finally {

        if (!active) return;

        setLoading(false);

      }

    };



    fetchRequests();



    return () => {
      active = false;
    };
  }, [refreshTrigger]);



  return (

    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <Breadcrumb items={breadcrumbItems} />



        {error ? (

          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">

            {error}

          </div>

        ) : null}



        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">

                <CalendarCheck className="text-primary-600 dark:text-primary-400" size={18} />

              </div>

              <div>

                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Leave Approval Queue</h2>

                <p className="text-xs text-gray-600 dark:text-gray-400">Review leave requests from your team</p>

              </div>

            </div>

            <div className="flex flex-wrap gap-2 text-xs">

              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700">Pending: {summary.pending}</span>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">Approved: {summary.approved}</span>

              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700">Rejected: {summary.rejected}</span>

              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">Sent Back: {summary.sentBack}</span>

            </div>

          </div>



          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-3">

            <div className="lg:col-span-2 relative">

              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input

                type="text"

                value={query}

                onChange={(e) => setQuery(e.target.value)}

                placeholder="Search by employee, leave type, or ID"

                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"

              />

            </div>

            <select

              value={statusFilter}

              onChange={(e) => setStatusFilter(e.target.value)}

              className="w-full py-2 px-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"

            >

              <option value="All">All Status</option>

              <option value="Pending">Pending</option>

              <option value="Approved">Approved</option>

              <option value="Rejected">Rejected</option>

              <option value="Sent Back">Sent Back</option>

            </select>

          </div>



          <div className="mt-6 overflow-x-auto lg:overflow-visible pb-10">

            <table className="min-w-full text-sm">

              <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
                <tr className="text-left text-xs uppercase tracking-wide">

                  <th className="px-4 py-3 font-medium">Employee</th>

                  <th className="px-4 py-3 font-medium">Leave Type</th>

                  <th className="px-4 py-3 font-medium">Date Range</th>

                  <th className="px-4 py-3 font-medium">Balance</th>

                  <th className="px-4 py-3 font-medium">Status</th>

                  <th className="px-4 py-3 font-medium text-right">Actions</th>

                </tr>

              </thead>

              <tbody>

                {filteredRequests.map((request) => (

                  <tr key={request.id} className="border-t border-gray-200/60 dark:border-gray-700/60">

                    <td className="px-4 py-3">

                      <p className="font-medium text-gray-900 dark:text-white">{request.employee}</p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">{request.employeeCode}</p>

                    </td>

                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">

                      <p className="font-medium">{request.type}</p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">{request.reason}</p>

                    </td>

                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{request.dates}</td>

                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{request.balance} days</td>

                    <td className="px-4 py-3">

                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">

                        {request.status}

                      </span>

                    </td>

                    <td className="px-4 py-3">

                      <div className="relative flex justify-end">

                        <button

                          type="button"

                          onClick={(e) => handleActionClick(e, request.id)}

                          className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"

                          aria-label="Open actions"

                        >

                          <MoreVertical size={16} />

                        </button>

                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredRequests.length === 0 && (

                  <tr>

                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">

                      No leave requests found.

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {openMenuId && (
          <div
            className="fixed w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1 z-[99]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const activeRequest = requests.find(r => r.id === openMenuId);
              if (!activeRequest) return null;

              return (
                <>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                    disabled={!activeRequest.attachmentUrl}
                    onClick={() => {
                      if (activeRequest.attachmentUrl) {
                        window.open(activeRequest.attachmentUrl, "_blank", "noopener");
                      }
                      setOpenMenuId(null);
                    }}
                  >
                    <Paperclip size={14} /> Attachment
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg disabled:opacity-50"
                    onClick={() => openAction("Approve", openMenuId)}
                    disabled={activeRequest.status !== "Pending"}
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg disabled:opacity-50"
                    onClick={() => openAction("Reject", openMenuId)}
                    disabled={activeRequest.status !== "Pending"}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                    onClick={() => openAction("Send Back", openMenuId)}
                    disabled={activeRequest.status !== "Pending"}
                  >
                    <MessageSquareText size={14} /> Send Back
                  </button>
                </>
              );
            })()}
          </div>
        )}

        {actionState.open && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-6">

              <h3 className="text-base font-semibold text-gray-900 dark:text-white">

                {actionState.action} Leave Request

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

