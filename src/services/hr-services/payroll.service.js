// src/services/payrollService.js
import { apiClient } from "../../lib/api";

export const payrollService = {
  /* =========================
     PAYROLL DASHBOARD APIs
  ========================= */

  // Get payroll dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get("/payroll/dashboard/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll dashboard statistics"
      );
    }
  },

  // Get recent payroll runs
  getRecentPayrollRuns: async (params = {}) => {
    try {
      const response = await apiClient.get("/payroll/dashboard/runs", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status || '',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch recent payroll runs"
      );
    }
  },

  /* =========================
     PAYROLL RUN MANAGEMENT APIs
  ========================= */

  // Get payroll run by ID
  getPayrollRunById: async (id) => {
    try {
      const response = await apiClient.get(`/payroll/runs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll run"
      );
    }
  },

  // Create payroll run
  createPayrollRun: async (data) => {
    try {
      const response = await apiClient.post("/payroll/runs", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create payroll run"
      );
    }
  },

  // Process payroll run
  processPayrollRun: async (id) => {
    try {
      const response = await apiClient.put(`/payroll/runs/${id}/process`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to process payroll run"
      );
    }
  },

  // Delete payroll run
  deletePayrollRun: async (id) => {
    try {
      const response = await apiClient.delete(`/payroll/runs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete payroll run"
      );
    }
  },

  // Get payroll items for a run
  getPayrollItems: async (payrollRunId, params = {}) => {
    try {
      const response = await apiClient.get(`/payroll/runs/${payrollRunId}/items`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll items"
      );
    }
  },

  // Update payroll item
  updatePayrollItem: async (id, data) => {
    try {
      const response = await apiClient.put(`/payroll/items/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update payroll item"
      );
    }
  },

  // Get payroll history
  getPayrollHistory: async (params = {}) => {
    try {
      const response = await apiClient.get("/payroll/history", {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          year: params.year,
          month: params.month,
          department: params.department,
          status: params.status,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll history"
      );
    }
  },

  /* =========================
     SALARY STRUCTURE APIs
  ========================= */

  // Get all salary structures
  getAllSalaryStructures: async (params = {}) => {
    try {
      const response = await apiClient.get("/salary-structures", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || '',
          department: params.department || '',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch salary structures"
      );
    }
  },

  // Get salary structure by ID
  getSalaryStructureById: async (id) => {
    try {
      const response = await apiClient.get(`/salary-structures/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch salary structure"
      );
    }
  },

  // Get salary structure by employee
  getSalaryStructureByEmployee: async (employeeId) => {
    try {
      const response = await apiClient.get(`/salary-structures/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch employee salary structure"
      );
    }
  },

  // Create salary structure
  createSalaryStructure: async (data) => {
    try {
      const response = await apiClient.post("/salary-structures", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create salary structure"
      );
    }
  },

  // Update salary structure
  updateSalaryStructure: async (id, data) => {
    try {
      const response = await apiClient.put(`/salary-structures/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update salary structure"
      );
    }
  },

  // Delete salary structure
  deleteSalaryStructure: async (id) => {
    try {
      const response = await apiClient.delete(`/salary-structures/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete salary structure"
      );
    }
  },

  // Get salary structure stats
  getSalaryStructureStats: async () => {
    try {
      const response = await apiClient.get("/salary-structures/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch salary structure statistics"
      );
    }
  },

  // Bulk create salary structures
  bulkCreateSalaryStructures: async (structures) => {
    try {
      const response = await apiClient.post("/salary-structures/bulk", { structures });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to bulk create salary structures"
      );
    }
  },

  /* =========================
     TAX SETTINGS APIs
  ========================= */

  // Get tax settings
  getTaxSettings: async (taxYear = null) => {
    try {
      const response = await apiClient.get("/tax-settings", {
        params: { taxYear }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch tax settings"
      );
    }
  },

  // Update tax settings
  updateTaxSettings: async (data) => {
    try {
      const response = await apiClient.put("/tax-settings", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update tax settings"
      );
    }
  },

  // Get tax brackets
  getTaxBrackets: async (params = {}) => {
    try {
      const response = await apiClient.get("/tax-settings/brackets", {
        params: {
          taxSettingId: params.taxSettingId,
          status: params.status,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch tax brackets"
      );
    }
  },

  // Create tax bracket
  createTaxBracket: async (data) => {
    try {
      const response = await apiClient.post("/tax-settings/brackets", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create tax bracket"
      );
    }
  },

  // Update tax bracket
  updateTaxBracket: async (id, data) => {
    try {
      const response = await apiClient.put(`/tax-settings/brackets/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update tax bracket"
      );
    }
  },

  // Delete tax bracket
  deleteTaxBracket: async (id) => {
    try {
      const response = await apiClient.delete(`/tax-settings/brackets/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete tax bracket"
      );
    }
  },

  // Get tax exemptions
  getTaxExemptions: async (taxSettingId = null) => {
    try {
      const response = await apiClient.get("/tax-settings/exemptions", {
        params: { taxSettingId }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch tax exemptions"
      );
    }
  },

  // Create tax exemption
  createTaxExemption: async (data) => {
    try {
      const response = await apiClient.post("/tax-settings/exemptions", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create tax exemption"
      );
    }
  },

  // Update tax exemption
  updateTaxExemption: async (id, data) => {
    try {
      const response = await apiClient.put(`/tax-settings/exemptions/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update tax exemption"
      );
    }
  },

  // Delete tax exemption
  deleteTaxExemption: async (id) => {
    try {
      const response = await apiClient.delete(`/tax-settings/exemptions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete tax exemption"
      );
    }
  },

  // Calculate tax
  calculateTax: async (data) => {
    try {
      const response = await apiClient.post("/tax-settings/calculate", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to calculate tax"
      );
    }
  },

  /* =========================
     PAYSLIP APIs
  ========================= */

  // Get all payslips
  getAllPayslips: async (params = {}) => {
    try {
      const response = await apiClient.get("/payslips", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || '',
          period: params.period || '',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payslips"
      );
    }
  },

  // Get payslip by ID
  getPayslipById: async (id) => {
    try {
      const response = await apiClient.get(`/payslips/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payslip"
      );
    }
  },

  // Generate payslip
  generatePayslip: async (data) => {
    try {
      const response = await apiClient.post("/payslips", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to generate payslip"
      );
    }
  },

  // Bulk generate payslips
  bulkGeneratePayslips: async (payrollRunId) => {
    try {
      const response = await apiClient.post("/payslips/bulk", { payrollRunId });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to bulk generate payslips"
      );
    }
  },

  // Update payslip status
  updatePayslipStatus: async (id, status) => {
    try {
      const response = await apiClient.put(`/payslips/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update payslip status"
      );
    }
  },

  // Send payslip via email
  sendPayslipEmail: async (id, email) => {
    try {
      const response = await apiClient.post(`/payslips/${id}/send`, { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to send payslip email"
      );
    }
  },

  // Download payslip
  downloadPayslip: async (id) => {
    try {
      const response = await apiClient.get(`/payslips/${id}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to download payslip"
      );
    }
  },

  // Get employee payslips
  getEmployeePayslips: async (employeeId, params = {}) => {
    try {
      const response = await apiClient.get(`/payslips/employee/${employeeId}`, {
        params: {
          year: params.year,
          page: params.page || 1,
          limit: params.limit || 10,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch employee payslips"
      );
    }
  },

  /* =========================
     REPORTS APIs
  ========================= */

  // Get payroll reports
  getPayrollReports: async (params = {}) => {
    try {
      const response = await apiClient.get("/reports", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          type: params.type || '',
          period: params.period || '',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll reports"
      );
    }
  },

  // Get payroll analytics
  getPayrollAnalytics: async (year = null) => {
    try {
      const response = await apiClient.get("/reports/analytics", {
        params: { year }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll analytics"
      );
    }
  },

  // Get report by ID
  getReportById: async (id) => {
    try {
      const response = await apiClient.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch report"
      );
    }
  },

  // Download report
  downloadReport: async (id, format = 'pdf') => {
    try {
      const response = await apiClient.get(`/reports/${id}/download`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to download report"
      );
    }
  },

  // Delete report
  deleteReport: async (id) => {
    try {
      const response = await apiClient.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete report"
      );
    }
  },

  // Get report by ID
  getReportById: async (id) => {
    try {
      const response = await apiClient.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch report"
      );
    }
  },

  // Download report (server returns report data)
  downloadReport: async (id, format = "pdf") => {
    try {
      const response = await apiClient.get(`/reports/${id}/download`, {
        params: { format }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to download report"
      );
    }
  },

  // Get report by ID
  getReportById: async (id) => {
    try {
      const response = await apiClient.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch report"
      );
    }
  },

  // Download report (returns report data for now)
  downloadReport: async (id, format = "pdf") => {
    try {
      const response = await apiClient.get(`/reports/${id}/download`, {
        params: { format }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to download report"
      );
    }
  },

  // Generate payroll summary report
  generatePayrollSummary: async (data) => {
    try {
      const response = await apiClient.post("/reports/summary", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to generate payroll summary report"
      );
    }
  },

  // Generate tax report
  generateTaxReport: async (data) => {
    try {
      const response = await apiClient.post("/reports/tax", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to generate tax report"
      );
    }
  },

  // Generate department-wise report
  generateDepartmentWiseReport: async (data) => {
    try {
      const response = await apiClient.post("/reports/department", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to generate department-wise report"
      );
    }
  },

  // Generate employee-wise report
  generateEmployeeWiseReport: async (data) => {
    try {
      const response = await apiClient.post("/reports/employee", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to generate employee-wise report"
      );
    }
  },

  // Generate statutory report
  generateStatutoryReport: async (data) => {
    try {
      const response = await apiClient.post("/reports/statutory", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to generate statutory report"
      );
    }
  },

  // Generate reimbursement report
  generateReimbursementReport: async (data) => {
    try {
      const response = await apiClient.post("/reports/reimbursement", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to generate reimbursement report"
      );
    }
  },

  /* =========================
     BONUS MANAGEMENT APIs
  ========================= */

  getBonuses: async (params = {}) => {
    try {
      const response = await apiClient.get("/bonuses", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch bonuses");
    }
  },

  createBonus: async (data) => {
    try {
      const response = await apiClient.post("/bonuses", data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create bonus");
    }
  },

  updateBonus: async (id, data) => {
    try {
      const response = await apiClient.put(`/bonuses/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update bonus");
    }
  },

  deleteBonus: async (id) => {
    try {
      const response = await apiClient.delete(`/bonuses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete bonus");
    }
  },

  /* =========================
     BANK EXPORT APIs
  ========================= */

  generateBankExport: async (data) => {
    try {
      const response = await apiClient.post("/finance-role/account-bank-export/exports", data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to generate bank export");
    }
  },

  getBankExports: async (params = {}) => {
    try {
      const response = await apiClient.get("/finance-role/account-bank-export/exports", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch bank exports");
    }
  },

  downloadBankExport: async (id) => {
    try {
      const response = await apiClient.get(`/finance-role/account-bank-export/exports/${id}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to download bank export");
    }
  },

  /* =========================
     UTILITY FUNCTIONS
  ========================= */

  // Format currency
  formatCurrency: (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  },

  // Format date
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };

    return new Date(date).toLocaleDateString('en-IN', {
      ...defaultOptions,
      ...options
    });
  },

  // Format date and time
  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  // Get month name
  getMonthName: (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  },

  // Get current fiscal year
  getCurrentFiscalYear: () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const fiscalYearStart = new Date(currentYear, 3, 1); // April 1st
    return now >= fiscalYearStart ? currentYear : currentYear - 1;
  },

  // Calculate net salary
  calculateNetSalary: (basicSalary, allowances = {}, deductions = {}) => {
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    return (basicSalary || 0) + totalAllowances - totalDeductions;
  },

  // Generate payroll ID
  generatePayrollId: (month, year) => {
    return `PR-${year}-${month.toString().padStart(2, '0')}`;
  },

  // Generate payslip ID
  generatePayslipId: (period, employeeId) => {
    const formattedPeriod = period.replace(' ', '-').toLowerCase();
    return `PS-${formattedPeriod}-${employeeId}`;
  }
};