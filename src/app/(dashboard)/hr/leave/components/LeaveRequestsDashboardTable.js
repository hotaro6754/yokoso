import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, XCircle, Loader2, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import leaveRequestService from "@/services/hr-services/leaveRequestService";

const LeaveRequestsDashboardTable = ({ requests = [] }) => {
  const router = useRouter();
  const [localRequests, setLocalRequests] = useState(requests || []);
  const [processingMap, setProcessingMap] = useState({});
  const [confirmState, setConfirmState] = useState({
    open: false,
    action: "",
    request: null,
  });

  useEffect(() => {
    setLocalRequests(requests || []);
  }, [requests]);

  const normalizeStatus = (status) => String(status || "").toLowerCase();

  const getStatusIcon = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "approved") {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (normalized === "rejected") {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "approved") {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
    if (normalized === "rejected") {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  const getStatusText = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "approved") return "Approved";
    if (normalized === "rejected") return "Rejected";
    return "Pending";
  };

  const openConfirm = (request, action) => {
    setConfirmState({ open: true, action, request });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, action: "", request: null });
  };

  const updateRequestStatus = async () => {
    const request = confirmState.request;
    const action = confirmState.action;

    if (!request || !action) return;

    const requestId = request.publicId || request.id;
    if (!requestId) {
      toast.error("Unable to process this request");
      closeConfirm();
      return;
    }

    setProcessingMap((prev) => ({ ...prev, [requestId]: true }));
    try {
      if (action === "approve") {
        await leaveRequestService.approveLeaveRequest(requestId);
        toast.success("Leave request approved");
      } else {
        await leaveRequestService.rejectLeaveRequest(requestId, "Rejected from leave dashboard");
        toast.success("Leave request rejected");
      }

      setLocalRequests((prev) =>
        prev.map((item) => {
          const itemId = item.publicId || item.id;
          if (itemId !== requestId) return item;
          return {
            ...item,
            status: action === "approve" ? "approved" : "rejected",
          };
        })
      );
      closeConfirm();
    } catch (error) {
      toast.error(error?.message || "Failed to update leave request");
    } finally {
      setProcessingMap((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Leave Requests
          </h2>
          <button
            onClick={() => router.push('/hr/leave/requests')}
            className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Days</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {localRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No recent leave requests found
                  </td>
                </tr>
              ) : (
                localRequests.map((request) => {
                  const normalizedStatus = normalizeStatus(request.status);
                  const requestId = request.publicId || request.id;
                  const isProcessing = Boolean(processingMap[requestId]);
                  const canTakeAction = normalizedStatus === "pending";

                  return (
                    <tr key={requestId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {request.employee?.name || "-"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {request.employee?.department || "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-900 dark:text-white">{request.type || "-"}</td>
                      <td className="py-4 text-sm text-gray-900 dark:text-white">
                        {request.duration || (request.startDate && request.endDate ? `${request.startDate} to ${request.endDate}` : "-")}
                      </td>
                      <td className="py-4 text-sm text-gray-900 dark:text-white">{request.days || "-"}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{getStatusText(request.status)}</span>
                        </span>
                      </td>
                      <td className="py-4">
                        {canTakeAction ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => openConfirm(request, "approve")}
                              title="Approve" aria-label="Approve leave request" className="inline-flex items-center justify-center rounded-full bg-green-100 p-1.5 text-green-700 hover:bg-green-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => openConfirm(request, "reject")}
                              title="Reject" aria-label="Reject leave request" className="inline-flex items-center justify-center rounded-full bg-red-100 p-1.5 text-red-700 hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmState.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Confirm {confirmState.action === "approve" ? "Approval" : "Rejection"}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to {confirmState.action} leave request for
              <span className="font-semibold"> {confirmState.request?.employee?.name || "this employee"}</span>?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateRequestStatus}
                className={`rounded-md px-3 py-1.5 text-sm text-white ${confirmState.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveRequestsDashboardTable;

