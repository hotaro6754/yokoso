// src/services/leavePolicyService.js
import api, { apiClient } from '../../lib/api';

const leavePolicyService = {
    // Get all leave policies with filtering and pagination
    getAllPolicies: async (params = {}) => {
        try {
            const response = await apiClient.get('/leave-policies/get-all-policies', { params });

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data.policies || response.data.data,
                    pagination: response.data.data.pagination
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to fetch policies'
            };
        } catch (error) {
            console.error('Error fetching policies:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Get policy by ID
    getPolicyById: async (policyId) => {
        try {
            const response = await apiClient.get(`/leave-policies/get-policy/${policyId}`);

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to fetch policy'
            };
        } catch (error) {
            console.error('Error fetching policy:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Create new policy
    createPolicy: async (policyData) => {
        try {
            const response = await apiClient.post('/leave-policies/create-policy', policyData);

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Policy created successfully'
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to create policy'
            };
        } catch (error) {
            console.error('Error creating policy:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Update policy
    updatePolicy: async (policyId, policyData) => {
        try {
            const response = await apiClient.put(`/leave-policies/update-policy/${policyId}`, policyData);

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Policy updated successfully'
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to update policy'
            };
        } catch (error) {
            console.error('Error updating policy:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Delete policy
    deletePolicy: async (policyId) => {
        try {
            const response = await apiClient.delete(`/leave-policies/delete-policy/${policyId}`);

            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message || 'Policy deleted successfully'
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to delete policy'
            };
        } catch (error) {
            console.error('Error deleting policy:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Update policy status
    updatePolicyStatus: async (policyId, status) => {
        try {
            const response = await apiClient.patch(`/leave-policies/update-status/${policyId}`, { status });

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Policy status updated successfully'
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to update policy status'
            };
        } catch (error) {
            console.error('Error updating policy status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },


    // Assign policy to departments
    assignPolicyToDepartments: async (policyId, departmentIds) => {
        try {
            const response = await apiClient.post(`/leave-policies/assign-departments/${policyId}`, {
                departmentIds
            });

            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message || 'Policy assigned to departments successfully'
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to assign policy to departments'
            };
        } catch (error) {
            console.error('Error assigning policy to departments:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Assign policy to employees
    assignPolicyToEmployees: async (policyId, employeeIds) => {
        try {
            const response = await apiClient.post(`/leave-policies/assign-employees/${policyId}`, {
                employeeIds
            });

            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message || 'Policy assigned to employees successfully'
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to assign policy to employees'
            };
        } catch (error) {
            console.error('Error assigning policy to employees:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Get policy statistics
    getPolicyStats: async (policyId = null) => {
        try {
            let url = '/leave-policies/stats';
            if (policyId) {
                url += `/${policyId}`;
            }

            const response = await apiClient.get(url);

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to fetch policy statistics'
            };
        } catch (error) {
            console.error('Error fetching policy statistics:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Get leave types for dropdown
    getLeaveTypesDropdown: async () => {
        try {
            const response = await apiClient.get('/leave-policies/leave-types/dropdown');

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to fetch leave types'
            };
        } catch (error) {
            console.error('Error fetching leave types:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Get departments for dropdown
    getDepartmentsDropdown: async () => {
        try {
            const response = await apiClient.get('/leave-policies/departments/dropdown');

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to fetch departments'
            };
        } catch (error) {
            console.error('Error fetching departments:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    },

    // Get employees for dropdown
    getEmployeesDropdown: async () => {
        try {
            const response = await apiClient.get('/leave-policies/employees/dropdown');

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to fetch employees'
            };
        } catch (error) {
            console.error('Error fetching employees:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Network error. Please try again.'
            };
        }
    }
};

export default leavePolicyService;