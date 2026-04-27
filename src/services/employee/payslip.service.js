import { apiClient } from "@/lib/api";

export const employeePayslipService = {
    // Get payslips for a specific employee
    getPayslips: async (employeeId, params = {}) => {
        try {
            const response = await apiClient.get(`/payslips/employee/${employeeId}`, {
                params: {
                    year: params.year,
                    page: params.page || 1,
                    limit: params.limit || 100
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch payslips');
        }
    },

    // Download payslip
    downloadPayslip: async (id) => {
        try {
            const response = await apiClient.get(`/payslips/${id}/download`, {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to download payslip');
        }
    },

    // View payslip in new tab
    viewPayslip: async (id) => {
        try {
            const response = await apiClient.get(`/payslips/${id}/download`, {
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to view payslip');
        }
    }
};
