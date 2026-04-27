import { apiClient } from '@/lib/api';

class EmployeeHolidayService {
  static async getHolidays(params = {}) {
    const response = await apiClient.get('/holidays/get-all-holidays', { params });
    const payload = response.data || {};
    return {
      data: payload.data || [],
      pagination: payload.pagination || {}
    };
  }
}

export default EmployeeHolidayService;