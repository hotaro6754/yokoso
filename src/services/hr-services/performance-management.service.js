// src/services/hr-services/performance-management.service.js
import { apiClient } from "@/lib/api";

export const performanceManagementService = {
  /* =========================
     APPRAISAL MANAGEMENT
  ========================= */

  // Get All Appraisals (for HR)
  getAllAppraisals: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/appraisals/all", { params });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch all appraisals"
      );
    }
  },

  // Get Appraisal by ID (for HR)
  getAppraisalById: async (appraisalId) => {
    try {
      const response = await apiClient.get(`/performance/appraisals/${appraisalId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch appraisal details"
      );
    }
  },

  /* =========================
     APPRAISAL CYCLE CONFIGURATION
  ========================= */

  // Create Appraisal Cycle
  createAppraisalCycle: async (data) => {
    try {
      const response = await apiClient.post("/performance/cycles", data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create appraisal cycle"
      );
    }
  },

  // Get Appraisal Cycles
  getAppraisalCycles: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/cycles", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch appraisal cycles"
      );
    }
  },

  // Get Appraisal Cycle by ID
  getAppraisalCycleById: async (cycleId) => {
    try {
      const response = await apiClient.get(`/performance/cycles/${cycleId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch appraisal cycle"
      );
    }
  },

  // Update Appraisal Cycle
  updateAppraisalCycle: async (cycleId, data) => {
    try {
      const response = await apiClient.put(`/performance/cycles/${cycleId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update appraisal cycle"
      );
    }
  },

  // Update Appraisal Cycle Status
  updateAppraisalCycleStatus: async (cycleId, status) => {
    try {
      const response = await apiClient.patch(`/performance/cycles/${cycleId}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update appraisal cycle status"
      );
    }
  },

  // Delete Appraisal Cycle
  deleteAppraisalCycle: async (cycleId) => {
    try {
      const response = await apiClient.delete(`/performance/cycles/${cycleId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete appraisal cycle"
      );
    }
  },

  /* =========================
     GOAL COMPLETION MONITORING
  ========================= */

  // Get Goal Completion Overview
  getGoalCompletionOverview: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/goals/overview", { params });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch goal completion overview"
      );
    }
  },

  // Update Goal Progress
  updateGoalProgress: async (goalId, data) => {
    try {
      const response = await apiClient.put(`/performance/goals/${goalId}/progress`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update goal progress"
      );
    }
  },

  /* =========================
     MANAGER FEEDBACK VIEW
  ========================= */

  // Get Manager Feedback
  getManagerFeedback: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/feedback", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch manager feedback"
      );
    }
  },

  /* =========================
     HR RATING MODERATION
  ========================= */

  // Get Reviews for HR Moderation
  getReviewsForModeration: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/reviews/moderation", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch reviews for moderation"
      );
    }
  },

  // Moderate Review Rating
  moderateReviewRating: async (reviewId, data) => {
    try {
      const response = await apiClient.put(`/performance/reviews/${reviewId}/moderate`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to moderate review rating"
      );
    }
  },

  /* =========================
     PERFORMANCE DASHBOARD
  ========================= */

  // Get Performance Dashboard
  getPerformanceDashboard: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/dashboard", { params });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch performance dashboard"
      );
    }
  },

  /* =========================
     KPI MANAGEMENT
  ========================= */

  // Create KPI
  createKpi: async (data) => {
    try {
      const response = await apiClient.post("/performance/kpis", data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create KPI"
      );
    }
  },

  // Get KPIs
  getKpis: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/kpis", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch KPIs"
      );
    }
  },

  // Get KPI by ID
  getKpiById: async (kpiId) => {
    try {
      const response = await apiClient.get(`/performance/kpis/${kpiId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch KPI"
      );
    }
  },

  // Update KPI
  updateKpi: async (kpiId, data) => {
    try {
      const response = await apiClient.put(`/performance/kpis/${kpiId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update KPI"
      );
    }
  },

  // Delete KPI
  deleteKpi: async (kpiId) => {
    try {
      const response = await apiClient.delete(`/performance/kpis/${kpiId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete KPI"
      );
    }
  },

  // Toggle KPI Status
  toggleKpiStatus: async (kpiId) => {
    try {
      const response = await apiClient.patch(`/performance/kpis/${kpiId}/toggle`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle KPI status"
      );
    }
  },

  /* =========================
     KPI ASSIGNMENT
  ========================= */

  // Assign KPI to Employee
  assignKpiToEmployee: async (data) => {
    try {
      const response = await apiClient.post("/performance/kpi-assignments", data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to assign KPI to employee"
      );
    }
  },

  // Get Employee KPI Assignments
  getEmployeeKpiAssignments: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/kpi-assignments", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch KPI assignments"
      );
    }
  },

  // Update KPI Assignment
  updateKpiAssignment: async (assignmentId, data) => {
    try {
      const response = await apiClient.put(`/performance/kpi-assignments/${assignmentId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update KPI assignment"
      );
    }
  },

  /* =========================
     NINE-BOX GRID
  ========================= */

  // Update Nine-Box Position
  updateNineBoxPosition: async (data) => {
    try {
      const response = await apiClient.post("/performance/nine-box-positions", data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update Nine-Box position"
      );
    }
  },

  // Get Nine-Box Grid Data
  getNineBoxGridData: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/nine-box-grid", { params });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch Nine-Box grid data"
      );
    }
  },

  // Create Automated Nine-Box Position
  createAutomatedNineBoxPosition: async (data) => {
    try {
      const response = await apiClient.post("/performance/nine-box-positions/automated", data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create automated Nine-Box position"
      );
    }
  },

  // Batch Create Nine-Box Positions
  batchCreateNineBoxPositions: async (data) => {
    try {
      const response = await apiClient.post("/performance/nine-box-positions/batch", data, {
        timeout: 120000 // 2 minutes for heavy batch operation
      });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to batch create Nine-Box positions"
      );
    }
  },

  // Update Nine-Box Position Potential
  updateNineBoxPositionPotential: async (positionId, potential) => {
    try {
      const potentialScores = { Low: 2, Medium: 3, High: 4 };
      const response = await apiClient.patch(`/performance/nine-box-positions/${positionId}`, {
        potentialScore: potentialScores[potential]
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update Nine-Box position potential"
      );
    }
  },

  /* =========================
     KPI ASSIGNMENTS
  ========================= */

  // Get KPI Assignments
  getKpiAssignments: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/kpi-assignments", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch KPI assignments"
      );
    }
  },

  // Create KPI Assignment
  createKpiAssignment: async (data) => {
    try {
      const response = await apiClient.post("/performance/kpi-assignments", data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create KPI assignment"
      );
    }
  },

  // Update KPI Assignment
  updateKpiAssignment: async (id, data) => {
    try {
      const response = await apiClient.put(`/performance/kpi-assignments/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update KPI assignment"
      );
    }
  },

  // Delete KPI Assignment
  deleteKpiAssignment: async (id) => {
    try {
      const response = await apiClient.delete(`/performance/kpi-assignments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete KPI assignment"
      );
    }
  },

  /* =========================
     QUARTERLY REVIEWS
  ========================= */

  getQuarterlyReviews: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/quarterly-reviews", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch quarterly reviews");
    }
  },

  createQuarterlyReview: async (data) => {
    try {
      const response = await apiClient.post("/performance/quarterly-reviews", data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create quarterly review");
    }
  },

  updateQuarterlyReview: async (reviewId, data) => {
    try {
      const response = await apiClient.put(`/performance/quarterly-reviews/${reviewId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update quarterly review");
    }
  },

  /* =========================
     1-ON-1 MEETINGS
  ========================= */

  scheduleOneOnOne: async (data) => {
    try {
      const response = await apiClient.post("/performance/meetings/schedule", data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to schedule meeting");
    }
  },

  updateOneOnOne: async (meetingId, data) => {
    try {
      const response = await apiClient.put(`/performance/meetings/${meetingId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update meeting");
    }
  },

  /* =========================
     PIP MANAGEMENT
  ========================= */

  createPIP: async (data) => {
    try {
      const response = await apiClient.post("/performance/pip", data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create PIP");
    }
  },

  updatePIP: async (pipId, data) => {
    try {
      const response = await apiClient.put(`/performance/pip/${pipId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update PIP");
    }
  },

  getPIPByEmployee: async (employeeId) => {
    try {
      const response = await apiClient.get(`/performance/pip/employee/${employeeId}`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch PIP records");
    }
  },

  getPIPs: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/pip-management/all", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch PIP records");
    }
  },

  /* =========================
     DASHBOARD EXTENSIONS
  ========================= */

  getQuarterlyDashboardStats: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/dashboard/quarterly-stats", { params });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch dashboard stats");
    }
  },

  /* =========================
     AUTOMATED SCHEDULING
  ========================= */

  autoScheduleConnects: async (cycleId) => {
    try {
      const response = await apiClient.post("/performance/meetings/auto-schedule", { cycleId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to auto-schedule connects");
    }
  },

  /* =========================
     TRAINING CERTIFICATES
  ========================= */

  uploadCertificate: async (data) => {
    try {
      const response = await apiClient.post("/performance/certificates", data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to upload certificate");
    }
  },

  getCertificates: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/certificates", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch certificates");
    }
  },

  /* =========================
     YEARLY APPRAISAL PROCESS
  ========================= */

  initiateAnnualAppraisals: async (cycleId) => {
    try {
      const response = await apiClient.post("/performance/annual-appraisals/initiate", { cycleId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to initiate annual appraisals");
    }
  },

  getAnnualAppraisals: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/annual-appraisals", { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch annual appraisals");
    }
  },

  getAnnualAppraisalDetails: async (id) => {
    try {
      const response = await apiClient.get(`/performance/annual-appraisals/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch appraisal details");
    }
  },

  updateAnnualAppraisal: async (id, data) => {
    try {
      const response = await apiClient.put(`/performance/annual-appraisals/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update annual appraisal");
    }
  },

  /* =========================
     BULK OPERATIONS & EXPORT
  ========================= */

  bulkUploadKpis: async (kpis) => {
    try {
      const response = await apiClient.post("/performance/kpis/bulk", { kpis });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to bulk upload KRAs");
    }
  },

  bulkUploadGoals: async (goals) => {
    try {
      const response = await apiClient.post("/performance/goals/bulk", { goals });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to bulk upload goals");
    }
  },

  exportQuarterlyReviews: async (params = {}) => {
    try {
      const response = await apiClient.get("/performance/quarterly-reviews/export", { params });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to export report");
    }
  }
};
