// src/services/employeeService.js
import { apiClient } from '@/lib/api';

export const employeeService = {

  getManagers: async () => {
    try {
      const response = await apiClient.get('/employees/get-managers');
      return response.data;
    } catch (error) {
      console.error('Error fetching managers:', error);
      throw error;
    }
  },
  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      const response = await apiClient.post('/employees/create-employee', employeeData);
      return response.data;
    } catch (error) {
      console.error('Create employee error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to create employee';
      const validationErrors = error.response?.data?.errors;
      
      const err = new Error(errorMessage);
      err.errors = validationErrors;
      throw err;
    }
  },

  // Get all employees
  getAllEmployees: async (params = {}) => {
    try {
      const response = await apiClient.get('/employees/get-employees', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch employees';
      throw new Error(errorMessage);
    }
  },

  // Get employee hierarchy
  getHierarchy: async () => {
    try {
      const response = await apiClient.get('/employees/hierarchy');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch employee hierarchy';
      throw new Error(errorMessage);
    }
  },

  // Get all users for company
  getCompanyUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('company-admin/users/get-all-users', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      throw new Error(errorMessage);
    }
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    try {
      const response = await apiClient.get(`/employees/view-employee/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch employee';
      throw new Error(errorMessage);
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      let data = employeeData;
      let headers = {};

      const hasFile = employeeData.profileImage instanceof File;
      
      if (hasFile) {
        data = new FormData();
        Object.keys(employeeData).forEach(key => {
          if (employeeData[key] !== undefined && employeeData[key] !== null) {
            if (Array.isArray(employeeData[key]) || typeof employeeData[key] === 'object' && !(employeeData[key] instanceof File)) {
              data.append(key, JSON.stringify(employeeData[key]));
            } else {
              data.append(key, employeeData[key]);
            }
          }
        });
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await apiClient.put(`/employees/update-employee/${id}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error('Update employee error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to update employee';
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        console.error('Validation errors:', validationErrors);
      }
      throw new Error(errorMessage);
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await apiClient.delete(`/employees/delete-employee/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete employee';
      throw new Error(errorMessage);
    }
  },

  // Get next employee ID
  getNextEmployeeId: async () => {
    try {
      const response = await apiClient.get('/employees/next-id');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to generate employee ID';
      throw new Error(errorMessage);
    }
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    try {
      const response = await apiClient.get('/employees/stats');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch employee statistics';
      throw new Error(errorMessage);
    }
  },

  // Upload employee document
  uploadDocument: async (employeeId, formData) => {
    try {
      const response = await apiClient.post(`/employees/${employeeId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload document';
      throw new Error(errorMessage);
    }
  },
  
  // Get employee documents
  getDocuments: async (employeeId) => {
    try {
      const response = await apiClient.get(`/employees/get-documents/${employeeId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch documents';
      throw new Error(errorMessage);
    }
  },
  
  // Download employee document (gets a signed URL with attachment headers)
  downloadDocument: async (employeeId, docId) => {
    try {
      const response = await apiClient.get(`/employees/download-document/${employeeId}/${docId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to download document';
      throw new Error(errorMessage);
    }
  },

  // Delete employee document
  deleteDocument: async (employeeId, docId) => {
    try {
      const response = await apiClient.delete(`/employees/delete-document/${employeeId}/${docId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete document';
      throw new Error(errorMessage);
    }
  },

  // Get departments for dropdown
  getDepartments: async () => {
    try {
      const response = await apiClient.get('/organization-structure/departments');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch departments';
      throw new Error(errorMessage);
    }
  },

  // Get designations for dropdown
  getDesignations: async () => {
    try {
      const response = await apiClient.get('/organization-structure/designations');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch designations';
      throw new Error(errorMessage);
    }
  },

  // Alias for getDocuments (for backward compatibility)
  getEmployeeDocuments: async (employeeId) => {
    return employeeService.getDocuments(employeeId);
  },

  // Upload multiple employee documents (aadhaar, pan, resume) with descriptions
  uploadEmployeeDocuments: async (employeeId, documentsData) => {
    try {
      const response = await apiClient.post(`/employees/upload-document/${employeeId}`, documentsData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload documents error:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Failed to upload documents';
      throw new Error(errorMessage);
    }
  },

  // Get upcoming birthdays (next 7 days)
  getUpcomingBirthdays: async () => {
    try {
      const response = await apiClient.get('/employees/birthdays');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch upcoming birthdays';
      throw new Error(errorMessage);
    }
  },
  importEmployees: async (employeesData, uploadType) => {
    try {
      const response = await apiClient.post('/employees/import-employees',
        { employees: employeesData, uploadType },
        { timeout: 120000 } // Increase timeout for bulk import to 2 minutes
      );
      return response.data;
    } catch (error) {
      console.error('Import employees error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to import employees';
      throw new Error(errorMessage);
    }
  },

  getLeaveBalances: async (id) => {
    try {
      const response = await apiClient.get(`/employees/${id}/leave-balances`);
      return response.data; // Response format: { success: true, data: { ... } }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leave balances';
      throw new Error(errorMessage);
    }
  }
};

export default employeeService;
