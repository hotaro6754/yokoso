"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { FileCheck, ArrowLeft, User, Calendar, Briefcase, DollarSign } from "lucide-react";
import Link from "next/link";

export default function ViewOfferPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchOffer();
    }
  }, [params.id]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getOfferById(params.id);
      setOffer(response.data || response);
    } catch (error) {
      console.error("Error fetching offer:", error);
      toast.error("Failed to load offer details");
      setOffer(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
      PENDING_APPROVAL: { label: "Pending Approval", color: "bg-amber-100 text-amber-800" },
      SENT: { label: "Sent to Candidate", color: "bg-blue-100 text-blue-800" },
      ACCEPTED: { label: "Accepted", color: "bg-emerald-100 text-emerald-800" },
      DECLINED: { label: "Declined", color: "bg-red-100 text-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap.DRAFT;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Offer not found</p>
          <Link
            href="/recruiter/offers"
            className="mt-4 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Offers", href: "/recruiter/offers" },
          { label: `Offer - ${offer.candidateName}`, href: `/recruiter/offers/${params.id}` },
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
                Offer Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View offer information and status
              </p>
            </div>
          </div>
          <Link
            href="/recruiter/offers"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Offer Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Candidate</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {offer.candidateName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Job Title</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {offer.jobTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Designation</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {offer.designation}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">CTC</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {offer.ctc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Joining Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {offer.joiningDate}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reporting Manager</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {offer.reportingManager}
                  </p>
                </div>
              </div>
              {offer.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {offer.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status
            </h3>
            <div className="flex items-center justify-center py-4">
              {getStatusBadge(offer.status)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
