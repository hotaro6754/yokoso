// src/services/payroll-role-services/payroll-process.service.js
import { apiClient } from "@/lib/api";

const API_BASE_URL = "/payroll-compliance/payroll-process";

export const payrollProcessService = {
  /* =========================
     PAYROLL RUNS APIs
  ========================= */

  // Get All Payroll Runs
  // Returns paginated list of payroll runs with status and details
  //
  // Query Parameters (optional):
  // - page: Integer (min: 1) - Page number (default: 1)
  // - limit: Integer (min: 1, max: 100) - Items per page (default: 10)
  // - status: String - Filter by status (e.g., "DRAFT", "PROCESSING", "PROCESSED", "PAID", "FAILED")
  getAllPayrollRuns: async (params = {}) => {
    try {
      const response = await apiClient.get("/payroll-compliance/payroll-process/runs", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status,
        },
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch payroll runs');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn("Payroll runs API timeout, returning empty array");
        return {
          success: true,
          data: [],
          pagination: { currentPage: 1, totalPages: 0, totalItems: 0 }
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll runs"
      );
    }
  },

  /* =========================
     GET PAYROLL RUN BY ID APIs
  ========================= */

  // Get Payroll Run by ID
  // Returns detailed information about a specific payroll run including:
  // - Run details (period, dates, status, totals)
  // - Processed by employee information
  // - Payroll items count
  // 
  // Path Parameters:
  // - id: Integer - Payroll run ID
  getPayrollRunById: async (id) => {
    try {
      const response = await apiClient.get(`/payroll-compliance/payroll-process/runs/${id}`, {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch payroll run');
      }

      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll run"
      );
    }
  },

  /* =========================
     UPDATE PAYROLL RUN APIs
  ========================= */

  // Update Existing Payroll Run
  // Updates current step, notes, or other details of a payroll run
  updatePayrollRun: async (id, data) => {
    try {
      const response = await apiClient.put(`/payroll-compliance/payroll-process/runs/${id}`, data, {
        timeout: 15000,
      });
      const resData = response.data;
      if (resData.success === false) {
        throw new Error(resData.message || 'Failed to update payroll run');
      }
      return resData;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update payroll run"
      );
    }
  },

  /* =========================
     CREATE PAYROLL RUN APIs
  ========================= */

  // Create New Payroll Run
  // Creates a new payroll run for the specified period and employees
  // 
  // Request Body:
  // - period: String (required) - Payroll period (e.g., "January 2026")
  // - startDate: ISO8601 Date (required) - Start date of payroll period
  // - endDate: ISO8601 Date (required) - End date of payroll period
  // - paymentDate: ISO8601 Date (required) - Payment date
  // - employeeIds: Array of Integers (required, min: 1) - Array of employee IDs to include
  // - notes: String (optional) - Additional notes
  createPayrollRun: async (data) => {
    try {
      const response = await apiClient.post("/payroll-compliance/payroll-process/runs", data, {
        timeout: 15000,
      });
      const responseData = response.data;

      if (responseData.success === false) {
        throw new Error(responseData.message || 'Failed to create payroll run');
      }

      return responseData;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create payroll run"
      );
    }
  },

  /* =========================
     PROCESS PAYROLL RUN APIs
  ========================= */

  // Process Payroll Run
  // Processes a payroll run (calculates salaries, deductions, net pay)
  // This will move the run from DRAFT to PROCESSING to PROCESSED status
  // 
  // Path Parameters:
  // - id: Integer - Payroll run ID
  processPayrollRun: async (id) => {
    try {
      const response = await apiClient.put(`/payroll-compliance/payroll-process/runs/${id}/process`, {}, {
        timeout: 30000, // Longer timeout for processing operations
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to process payroll run');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error("Processing timeout. The payroll run may still be processing. Please check again later.");
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to process payroll run"
      );
    }
  },

  /* =========================
     LOCK & APPROVE APIs
  ========================= */

  // Lock Payroll Run
  lockPayrollRun: async (id) => {
    try {
      const response = await apiClient.put(`/payroll-compliance/payroll-process/runs/${id}/lock`, {}, {
        timeout: 15000,
      });
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || 'Failed to lock payroll run');
      }
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to lock payroll run");
    }
  },

  // HR Approve Payroll Run
  hrApprovePayrollRun: async (id) => {
    try {
      const response = await apiClient.put(`/payroll-compliance/payroll-process/runs/${id}/hr-approve`, {}, {
        timeout: 15000,
      });
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || 'Failed to approve payroll run by HR');
      }
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to approve payroll run by HR");
    }
  },

  // Finance Approve Payroll Run
  financeApprovePayrollRun: async (id) => {
    try {
      const response = await apiClient.put(`/payroll-compliance/payroll-process/runs/${id}/finance-approve`, {}, {
        timeout: 15000,
      });
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || 'Failed to approve payroll run by Finance');
      }
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to approve payroll run by Finance");
    }
  },

  /* =========================
     SEND PAYSLIP EMAILS APIs
  ========================= */

  // Send Payslip Emails (Bulk)
  sendPayslipEmails: async (id) => {
    try {
      const response = await apiClient.post(`/payroll-compliance/payroll-process/runs/${id}/send-emails`, {}, {
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to send payslip emails");
    }
  },

  // Send Single Payslip Email
  sendSinglePayslipEmail: async (runId, employeeId) => {
    try {
      const response = await apiClient.post(`/payroll-compliance/payroll-process/runs/${runId}/employees/${employeeId}/send-email`, {}, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to send individual payslip email");
    }
  },

  // Delete Payroll Run
  deletePayrollRun: async (id) => {
    try {
      const response = await apiClient.delete(`/payroll-compliance/payroll-process/runs/${id}`, {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to delete payroll run');
      }

      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete payroll run"
      );
    }
  },
};
