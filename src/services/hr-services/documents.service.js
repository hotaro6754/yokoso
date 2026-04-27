// src/services/hr-services/documents.service.js
import { apiClient } from "@/lib/api";

export const documentsService = {
  /* =========================
     DOCUMENT STATISTICS APIs
  ========================= */

  // Get Document Statistics
  // Returns statistics about documents (total, by type, by status, etc.)
  getDocumentStats: async () => {
    try {
      const response = await apiClient.get("/documents/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch document statistics"
      );
    }
  },

  /* =========================
     GET ALL DOCUMENTS APIs
  ========================= */

  // Get All Documents (Document Management Page)
  // Query Parameters:
  // - page: Page number (default: 1)
  // - limit: Items per page (default: 10, max: 100)
  // - search: Search by document name, description, or employee name
  // - type: Filter by document type (AADHAAR, PAN, RESUME, PHOTO, EDUCATION, etc.)
  // - status: Filter by status (PENDING, VERIFIED, REJECTED, EXPIRED)
  // - employeeId: Filter by employee ID
  // - expiringSoon: Filter documents expiring soon (true/false)
  getAllDocuments: async (params = {}) => {
    try {
      const response = await apiClient.get("/documents", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch documents"
      );
    }
  },

  /* =========================
     EXPIRING DOCUMENTS APIs
  ========================= */

  // Get Documents Expiring Soon
  // Query Parameters:
  // - days: Number of days to check for expiry (default: 30)
  getExpiringDocuments: async (params = {}) => {
    try {
      const response = await apiClient.get("/documents/expiring", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch expiring documents"
      );
    }
  },

  /* =========================
     EMPLOYEE DOCUMENTS APIs
  ========================= */

  // Get All Documents for an Employee
  getEmployeeDocuments: async (employeeId) => {
    try {
      const response = await apiClient.get(`/documents/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch employee documents"
      );
    }
  },

  // Get Document by ID
  getDocumentById: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch document"
      );
    }
  },

  /* =========================
     UPLOAD DOCUMENTS APIs
  ========================= */

  // Upload Document
  // Document Types: AADHAAR, PAN, RESUME, PHOTO, EDUCATION, EXPERIENCE,
  //                 ID_PROOF, ADDRESS_PROOF, OFFER_LETTER, EMPLOYMENT_LETTER, CONTRACT, OTHER
  // Form Data:
  // - file: File to upload (multipart/form-data)
  // - type: Document type (required)
  // - name: Document name (required)
  // - description: Document description (optional)
  // - status: Document status - PENDING, VERIFIED, REJECTED (default: PENDING)
  // - expiresAt: Expiry date in ISO 8601 format (optional, for contracts)
  uploadDocument: async (employeeId, formData) => {
    try {
      const response = await apiClient.post(
        `/documents/upload/${employeeId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to upload document"
      );
    }
  },

  /* =========================
     UPDATE DOCUMENTS APIs
  ========================= */

  // Update Document
  // Can update: status, type, name, description, expiresAt
  updateDocument: async (documentId, data) => {
    try {
      const response = await apiClient.put(`/documents/${documentId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update document"
      );
    }
  },

  // Update Document Status
  updateDocumentStatus: async (documentId, status, description = "") => {
    try {
      const response = await apiClient.put(`/documents/${documentId}`, {
        status,
        description,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update document status"
      );
    }
  },

  // Set Document Expiry Date
  setDocumentExpiry: async (documentId, expiresAt, description = "") => {
    try {
      const response = await apiClient.put(`/documents/${documentId}`, {
        expiresAt,
        description,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to set document expiry"
      );
    }
  },

  /* =========================
     DELETE DOCUMENTS APIs
  ========================= */

  // Delete Document
  deleteDocument: async (documentId) => {
    try {
      const response = await apiClient.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete document"
      );
    }
  },
};

export default documentsService;
