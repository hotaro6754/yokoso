// src/services/hr-services/organization.service.js
import { apiClient } from "@/lib/api";

const isAccessDenied = (error) => {
  const status = error?.response?.status;
  const message = (
    error?.response?.data?.message ||
    error?.message ||
    ""
  ).toString();
  return status === 403 || /access denied|insufficient permissions/i.test(message);
};

export const organizationService = {
  /* =========================
     DEPARTMENT MANAGEMENT APIs
  ========================= */

  // Get All Departments with Pagination and Filters
  // Query Parameters:
  // - page: Page number (default: 1)
  // - limit: Items per page (default: 10, max: 100)
  // - search: Search by name, head of department, email, or phone
  // - status: Filter by status (ACTIVE, INACTIVE, all)
  getAllDepartments: async (params = {}) => {
    try {
      const response = await apiClient.get("/organization-structure/departments", { params });
      return response.data;
    } catch (error) {
      if (isAccessDenied(error)) {
        return {
          success: false,
          accessDenied: true,
          data: [],
          pagination: { totalItems: 0, totalPages: 1 },
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch departments"
      );
    }
  },

  // Get Department Statistics
  // Returns department statistics including:
  // - Total departments
  // - Active/Inactive departments
  // - Total employees
  // - Department-wise employee counts
  getDepartmentStats: async () => {
    try {
      const response = await apiClient.get("/organization-structure/departments/stats");
      return response.data;
    } catch (error) {
      if (isAccessDenied(error)) {
        return {
          success: false,
          accessDenied: true,
          data: {
            totalDepartments: 0,
            activeDepartments: 0,
            inactiveDepartments: 0,
            totalEmployees: 0,
            byStatus: { active: 0, inactive: 0 },
          },
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch department statistics"
      );
    }
  },

  // Get Department by ID
  // Returns complete department details including:
  // - Parent and child departments
  // - Department manager
  // - All designations in the department
  // - All employees in the department
  getDepartmentById: async (departmentId) => {
    try {
      const response = await apiClient.get(`/organization-structure/departments/${departmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch department"
      );
    }
  },

  // Get Employees in a Department
  // Query Parameters:
  // - page: Page number (default: 1)
  // - limit: Items per page (default: 10)
  getDepartmentEmployees: async (departmentId, params = {}) => {
    try {
      const response = await apiClient.get(
        `/organization-structure/departments/${departmentId}/employees`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch department employees"
      );
    }
  },

  // Create New Department
  // Required Fields: name, headOfDepartment, phone, email
  // Optional Fields: status, parentId, managerId, code
  createDepartment: async (departmentData) => {
    try {
      const response = await apiClient.post(
        "/organization-structure/departments",
        departmentData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create department"
      );
    }
  },

  // Update Department
  // All fields are optional - only update provided fields
  updateDepartment: async (departmentId, departmentData) => {
    try {
      const response = await apiClient.put(
        `/organization-structure/departments/${departmentId}`,
        departmentData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update department"
      );
    }
  },

  // Delete Department
  // Note: Cannot delete if department has:
  // - Assigned employees
  // - Assigned designations
  // - Child departments
  deleteDepartment: async (departmentId) => {
    try {
      const response = await apiClient.delete(
        `/organization-structure/departments/${departmentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete department"
      );
    }
  },

  /* =========================
     LOCATION MANAGEMENT APIs
  ========================= */

  // Get All Locations
  getAllLocations: async (params = {}) => {
    try {
      const response = await apiClient.get("/company-admin/organization-structure/locations", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch locations"
      );
    }
  },

  /* =========================
     DESIGNATION MANAGEMENT APIs
  ========================= */

  // Get All Designations with Pagination and Filters
  // Query Parameters:
  // - page: Page number (default: 1)
  // - limit: Items per page (default: 10, max: 100)
  // - search: Search by name or level
  // - status: Filter by status (ACTIVE, INACTIVE, all)
  // - department: Filter by department ID (or "all")
  getAllDesignations: async (params = {}) => {
    try {
      const response = await apiClient.get("/organization-structure/designations", { params });
      return response.data;
    } catch (error) {
      if (isAccessDenied(error)) {
        return {
          success: false,
          accessDenied: true,
          data: [],
          pagination: { totalItems: 0, totalPages: 1 },
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch designations"
      );
    }
  },

  // Get Designations by Department
  // Returns all active designations for a specific department
  getDesignationsByDepartment: async (departmentId) => {
    try {
      const response = await apiClient.get(
        `/organization-structure/designations/department/${departmentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch designations by department"
      );
    }
  },

  // Get Designation by ID
  // Returns complete designation details including:
  // - Department information
  // - All employees with this designation
  // - Reporting relationships
  getDesignationById: async (designationId) => {
    try {
      const response = await apiClient.get(
        `/organization-structure/designations/${designationId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch designation"
      );
    }
  },

  // Create New Designation
  // Required Fields: name, level (L1-L6), departmentId
  // Optional Fields: minExperience, maxExperience, status, code, grade, reportingLevel, orgLevel
  createDesignation: async (designationData) => {
    try {
      const response = await apiClient.post(
        "/organization-structure/designations",
        designationData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create designation"
      );
    }
  },

  // Update Designation
  // All fields are optional - only update provided fields
  updateDesignation: async (designationId, designationData) => {
    try {
      const response = await apiClient.put(
        `/organization-structure/designations/${designationId}`,
        designationData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update designation"
      );
    }
  },

  // Delete Designation
  // Note: Cannot delete if designation has assigned employees
  deleteDesignation: async (designationId) => {
    try {
      const response = await apiClient.delete(
        `/organization-structure/designations/${designationId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete designation"
      );
    }
  },

  /* =========================
     REPORTING STRUCTURE MAPPING APIs
  ========================= */

  // Get Reporting Structure Mapping
  // Returns complete reporting hierarchy including:
  // - Top-level managers (employees without reporting managers)
  // - All reporting lines (who reports to whom)
  // - Direct reports for each manager
  // - Department and designation information for each employee
  getReportingStructure: async () => {
    try {
      const response = await apiClient.get("/organization-structure/reporting-structure");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch reporting structure"
      );
    }
  },

  /* =========================
     ORG CHART VIEW APIs
  ========================= */

  // Get Organization Chart View
  // Returns hierarchical structure for visualization including:
  // - All departments with hierarchy (parent-child relationships)
  // - Department managers
  // - Designations within each department (grouped by org level)
  // - Employees grouped by designation within each department
  // - Reporting relationships (who reports to whom)
  // - Summary statistics (total departments, designations, employees)
  getOrgChart: async () => {
    try {
      const response = await apiClient.get("/organization-structure/org-chart");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch organization chart"
      );
    }
  },
};

export default organizationService;
