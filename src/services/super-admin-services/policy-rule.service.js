import { apiClient } from '@/lib/api';

const createPolicyPayload = (data) => {
    const hasFile = data?.policyDocumentFile instanceof File;

    if (!hasFile) {
        const { policyDocumentFile, ...plainData } = data || {};
        return plainData;
    }

    const formData = new FormData();
    Object.entries(data || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'policyDocumentFile') {
            formData.append('policyDocument', value);
            return;
        }
        formData.append(key, value);
    });
    return formData;
};

export const policyRuleService = {
    // ==========================================
    // POLICY & RULE ENGINE MODULE
    // ==========================================

    // 1. Create Policy
    // supports types: ATTENDANCE, LEAVE, PAYROLL, EXPENSE with their specific fields
    createPolicy: async (data) => {
        try {
            const payload = createPolicyPayload(data);
            const response = await apiClient.post('/company-admin/policy-rules', payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 2. Update Policy
    updatePolicy: async (id, data) => {
        try {
            const payload = createPolicyPayload(data);
            const response = await apiClient.put(`/company-admin/policy-rules/${id}`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 3. List Policies (Filter by Type)
    // params: type, page, limit
    getPolicies: async (params = {}) => {
        try {
            const response = await apiClient.get('/company-admin/policy-rules', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 4. Get Policy Details
    getPolicyById: async (id) => {
        try {
            const response = await apiClient.get(`/company-admin/policy-rules/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 5. Assign Policy to Location(s)
    assignPolicy: async (data) => {
        try {
            const response = await apiClient.post('/company-admin/policy-rules/assign', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 6. Delete Policy
    deletePolicy: async (id) => {
        try {
            const response = await apiClient.delete(`/company-admin/policy-rules/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
