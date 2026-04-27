"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { hrOfferService } from "@/services/hr-services/offer-management.service";
import { toast } from "react-hot-toast";
import { FileCheck, CheckCircle2, XCircle, Eye, Mail, Search, Users } from "lucide-react";
import Link from "next/link";

export default function HROffersPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [search, setSearch] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [uploadDocsLink, setUploadDocsLink] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingOffers();
  }, [pagination.currentPage, search]);

  const fetchPendingOffers = async () => {
    try {
      setLoading(true);
      const response = await hrOfferService.getPendingOffers({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search
      });
      if (response.success) {
        setOffers(response.data?.data || response.data || []);
        setPagination(response.data?.pagination || response.pagination || pagination);
      } else {
        setOffers(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching pending offers:", error);
      toast.error(error.message || "Failed to load pending offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedOffer) return;
    try {
      setLoading(true);
      await hrOfferService.approveOffer(selectedOffer.id, uploadDocsLink);
      toast.success("Offer approved and email sent to candidate successfully");
      setShowApproveModal(false);
      setSelectedOffer(null);
      setUploadDocsLink("");
      fetchPendingOffers();
    } catch (error) {
      toast.error(error.message || "Failed to approve offer");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOffer) return;
    try {
      setLoading(true);
      await hrOfferService.rejectOffer(selectedOffer.id, rejectionReason);
      toast.success("Offer rejected successfully");
      setShowRejectModal(false);
      setSelectedOffer(null);
      setRejectionReason("");
      fetchPendingOffers();
    } catch (error) {
      toast.error(error.message || "Failed to reject offer");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING_APPROVAL: { label: "Pending Approval", color: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400" },
      SENT: { label: "Sent", color: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400" },
      ACCEPTED: { label: "Offer Accepted", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400" },
      DECLINED: { label: "Declined", color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleRetriggerOffer = async (offerId) => {
    try {
      toast.loading("Resending offer email...");
      await hrOfferService.retriggerOfferEmail(offerId);
      toast.dismiss();
      toast.success("Offer email resent successfully");
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Failed to resend offer email");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Offers", href: "/hr/offers" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Offers
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Review and approve/reject offers created by recruiters
              </p>
            </div>
          </div>
          <Link
            href="/hr/offers/candidates"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Users className="h-4 w-4" />
            View Candidate Pipeline
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by candidate name, job title, or offer ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">No pending offers</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">All offers have been reviewed</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Offer ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">CTC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Joining Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{offer.tempId || `OFF-${offer.id}`}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{offer.candidateName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{offer.candidateEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{offer.jobTitle}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{offer.ctc}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {new Date(offer.joiningDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{offer.createdBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(offer.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {offer.status === 'SENT' && (
                            <button
                              onClick={() => handleRetriggerOffer(offer.id)}
                              className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                              title="Resend Offer Email"
                            >
                              <Mail className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedOffer(offer);
                              setShowApproveModal(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                            title="Approve"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOffer(offer);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} offers
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl relative z-10">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Approve Offer</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Approve offer for <strong>{selectedOffer.candidateName}</strong> - {selectedOffer.jobTitle}?
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Documents Link (Optional)
              </label>
              <input
                type="url"
                value={uploadDocsLink}
                onChange={(e) => setUploadDocsLink(e.target.value)}
                placeholder="https://example.com/upload-docs"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If not provided, a default link will be generated
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedOffer(null);
                  setUploadDocsLink("");
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Approving..." : "Approve & Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl relative z-10">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Reject Offer</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Reject offer for <strong>{selectedOffer.candidateName}</strong> - {selectedOffer.jobTitle}?
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedOffer(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Rejecting..." : "Reject Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
