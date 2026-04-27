"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import Breadcrumb from "@/components/common/Breadcrumb";

import OnboardingFlowForm from "../components/OnboardingFlowForm";

import { apiClient } from "@/lib/api";

import { toast } from "react-hot-toast";

export default function OnboardingFlowAddPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    try {
      // Validate required fields before making the API call

      if (!values.companyId) {
        toast.error("Company ID is required.");

        return;
      }

      setIsSubmitting(true);

      const normalizePlan = (plan) => {
        if (!plan) return plan;
        const key = String(plan).toUpperCase().trim();
        if (["FREE", "STANDARD", "PREMIUM", "ENTERPRISE"].includes(key)) return key;
        const map = {
          STARTER: "FREE",
          BASIC: "FREE",
          PROFESSIONAL: "STANDARD",
          PRO: "STANDARD",
          ADVANCE: "PREMIUM",
          ADVANCED: "PREMIUM",
          PREMIUM: "PREMIUM",
          BUSINESS: "PREMIUM",
          ENTERPRISE: "ENTERPRISE",
        };
        return map[key] || null;
      };

      // Map fields to match Company Schema for Update API
      const normalizedPlan = normalizePlan(values.subscriptionPlan);
      const payload = {
          ...values,
          name: values.companyName,
          contactEmail: values.companyEmail,
          phone: values.companyPhone,
          plan: normalizedPlan || undefined,
          industryType: values.industry,
          subscriptionStart: values.startDate,
          onboardingStatus: 'COMPLETED',
          onboardingProgress: 100,
          // Remove fields that shouldn't be sent or are duplicates
          companyId: undefined, // ID is in URL
          companyName: undefined,
          companyEmail: undefined,
          companyPhone: undefined,
          subscriptionPlan: undefined,
          industry: undefined,
          startDate: undefined,
          website: undefined, // Field not in Company schema
          step: undefined,
          // Ensure dates are string or null
          expectedGoLiveDate: values.expectedGoLiveDate || null,
      };

      // API call to update company directly (finish onboarding)
      const response = await apiClient.put(
        `/master-admin/company/${values.companyId}`,
        payload,
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Onboarding flow created successfully",
        );

        // Return success data instead of redirecting immediately
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error creating onboarding flow:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to create onboarding flow.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Master Admin", href: "/master-admin/dashboard" },

              {
                label: "Onboarding Flow",
                href: "/master-admin/onboarding-flow",
              },

              { label: "Add", href: "/master-admin/onboarding-flow/add" },
            ]}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Onboarding Flow
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Complete each step in order to finish the onboarding process for
              the new company.
            </p>
          </div>

          <OnboardingFlowForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/master-admin/onboarding-flow")}
          />
        </div>
      </div>
    </div>
  );
}
