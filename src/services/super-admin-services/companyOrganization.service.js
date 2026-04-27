import { apiClient } from '@/lib/api';


export const companyOrganizationService = {
    // ==========================================
    // 1. COMPANY MANAGEMENT
    // ==========================================

    // Create Company
    createCompany: async (data) => {
        try {
            const response = await apiClient.post('/company-admin/organization-structure/companies', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get All Companies
    getAllCompanies: async () => {
        try {
            const response = await apiClient.get('/company-admin/organization-structure/companies');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get Specific Company Profile
    getCompanyById: async (id) => {
        try {
            const response = await apiClient.get(`/company-admin/organization-structure/company/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update Specific Company Profile
    updateCompany: async (id, data) => {
        try {
            const response = await apiClient.patch(`/company-admin/organization-structure/company/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update Current Company Profile (Self)
    updateCurrentCompany: async (data) => {
        try {
            const response = await apiClient.patch('/company-admin/organization-structure/company', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete Company
    deleteCompany: async (id) => {
        try {
            const response = await apiClient.delete(`/company-admin/organization-structure/companies/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ==========================================
    // 2. LOCATION MANAGEMENT
    // ==========================================

    // Create Location
    createLocation: async (data) => {
        try {
            const response = await apiClient.post('/company-admin/organization-structure/locations', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // List Locations (Filter by companyId)
    getLocations: async (companyId) => {
        try {
            const url = companyId
                ? `/company-admin/organization-structure/locations?companyId=${companyId}`
                : '/company-admin/organization-structure/locations';
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update Location
    updateLocation: async (id, data) => {
        try {
            const response = await apiClient.patch(`/company-admin/organization-structure/locations/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete Location
    deleteLocation: async (id, companyId) => {
        try {
            const response = await apiClient.delete(`/company-admin/organization-structure/locations/${id}`, {
                data: { companyId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ==========================================
    // 3. DEPARTMENT MANAGEMENT
    // ==========================================

    // Create Department
    createDepartment: async (data) => {
        try {
            const response = await apiClient.post('/company-admin/organization-structure/departments', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // List Departments
    getDepartments: async (companyId) => {
        try {
            const url = companyId
                ? `/organization-structure/departments?companyId=${companyId}`
                : '/organization-structure/departments';
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update Department
    updateDepartment: async (id, data) => {
        try {
            const response = await apiClient.patch(`/company-admin/organization-structure/departments/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete Department
    deleteDepartment: async (id, companyId) => {
        try {
            const response = await apiClient.delete(`/company-admin/organization-structure/departments/${id}`, {
                data: { companyId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ==========================================
    // 4. DESIGNATION MANAGEMENT
    // ==========================================

    // Create Designation
    createDesignation: async (data) => {
        try {
            const response = await apiClient.post('/company-admin/organization-structure/designations', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // List Designations
    getDesignations: async (companyId) => {
        try {
            const url = companyId
                ? `/company-admin/organization-structure/designations?companyId=${companyId}`
                : '/company-admin/organization-structure/designations';
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update Designation
    updateDesignation: async (id, data) => {
        try {
            const response = await apiClient.patch(`/company-admin/organization-structure/designations/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete Designation
    deleteDesignation: async (id, companyId) => {
        try {
            const response = await apiClient.delete(`/company-admin/organization-structure/designations/${id}`, {
                data: { companyId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
