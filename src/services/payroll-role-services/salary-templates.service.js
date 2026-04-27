import { apiClient } from "@/lib/api";

export const salaryTemplateService = {
  getTemplates: (params) => apiClient.get("/payroll/payroll-compliance/salary-templates", { params }),
  getTemplateById: (id) => apiClient.get(`/payroll/payroll-compliance/salary-templates/${id}`),
  createTemplate: (data) => apiClient.post("/payroll/payroll-compliance/salary-templates", data),
  updateTemplate: (id, data) => apiClient.patch(`/payroll/payroll-compliance/salary-templates/${id}`, data),
  deleteTemplate: (id) => apiClient.delete(`/payroll/payroll-compliance/salary-templates/${id}`),
};
