import { apiClient } from "@/lib/api";

const resolvePayload = (response) => {
  const payload = response.data;

  if (payload?.success === false) {
    throw new Error(payload.message || "Failed to fetch data");
  }

  return payload?.data || payload;
};

export const subscriptionService = {
  // Get Current Subscription Details
  getSubscriptionDetails: async () => {
    try {
      const response = await apiClient.get("/company-admin/subscription/current");
      return resolvePayload(response);
    } catch (error) {
       throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch subscription details"
      );
    }
  },

  // Get Subscription History
  getSubscriptionHistory: async () => {
    try {
      const response = await apiClient.get("/company-admin/subscription/history");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch subscription history"
      );
    }
  },

  // Get Available Subscription Plans
  getAvailablePlans: async () => {
    try {
      const response = await apiClient.get("/company-admin/subscription/available-plans");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch available plans"
      );
    }
  },

  createRazorpayOrder: async (planId) => {
    try {
      const response = await apiClient.post("/company-admin/subscription/create-order", { planId });
      return resolvePayload(response);
    } catch (error) {
       throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create Razorpay order"
      );
    }
  },

  verifyRazorpayPayment: async (paymentData) => {
    try {
      const response = await apiClient.post("/company-admin/subscription/verify-payment", paymentData);
      return resolvePayload(response);
    } catch (error) {
       throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to verify Razorpay payment"
      );
    }
  }
};


export default subscriptionService;
