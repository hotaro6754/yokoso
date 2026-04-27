import { apiClient } from "@/lib/api";

class EmployeeReimbursementService {
  static async getMyReimbursements(params = {}) {
    try {
      const response = await apiClient.get("/employee/reimbursements", { params });
      const payload = response.data || {};
      return {
        data: payload.data || [],
        pagination: payload.pagination || {}
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch reimbursements");
    }
  }

  static async getReimbursement(id) {
    try {
      const response = await apiClient.get(`/employee/reimbursements/${id}`);
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch reimbursement");
    }
  }

  static async createReimbursement(data) {
    try {
      const response = await apiClient.post("/employee/reimbursements", data);
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to submit reimbursement");
    }
  }

  static async updateReimbursement(id, data) {
    try {
      const response = await apiClient.put(`/employee/reimbursements/${id}`, data);
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update reimbursement");
    }
  }

  static async deleteReimbursement(id) {
    try {
      const response = await apiClient.delete(`/employee/reimbursements/${id}`);
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete reimbursement");
    }
  }
}

export default EmployeeReimbursementService;
