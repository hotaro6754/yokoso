import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export function usePayrollDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/payroll/dashboard');
        setData(response?.data?.data || []);
      } catch (err) {
        console.error('Error fetching payroll dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const refetch = () => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/payroll/dashboard');
        setData(response?.data?.data || []);
      } catch (err) {
        console.error('Error fetching payroll dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  };

  return { data, loading, error, refetch };
}
