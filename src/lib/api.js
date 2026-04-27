// src/lib/api.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30s default for normal requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Auto-extend timeout for file uploads (FormData)
    if (config.data instanceof FormData) {
      config.timeout = 10 * 60 * 1000; // 10 minutes for uploads
    }
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('company_id');
    let storedRole = '';
    try {
      const storedUser = localStorage.getItem('hrms_user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      storedRole = parsedUser?.systemRole?.toUpperCase?.() || '';
    } catch (err) {
      storedRole = '';
    }
    // const subdomain = localStorage.getItem('company_subdomain');

    const isPayrollUI =
      typeof window !== 'undefined' &&
      window.location?.pathname?.startsWith('/payroll');

    const isStringUrl = typeof config.url === 'string';
    const isAbsoluteUrl = isStringUrl && /^https?:\/\//i.test(config.url);
    const isAuthRoute = isStringUrl && config.url.startsWith('/auth/');

    if (isPayrollUI && isStringUrl && !isAbsoluteUrl && !isAuthRoute && !config.url.startsWith('/payroll/')) {
      config.url = `/payroll${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }

    // Check if it's a public auth route (no token/company context yet)
    const publicAuthRoutes = ['/auth/login', '/auth/register', '/auth/company/', '/auth/verify-company'];
    const isPublicAuthRoute = publicAuthRoutes.some(route => config.url?.includes(route));

    // Attach Authorization for real sessions. Skip known UI bypass tokens.
    const isBypassToken =
      typeof token === 'string' &&
      (token.startsWith('master-admin-bypass-token-') || token.startsWith('manager-bypass-token-'));
    if (token && !isBypassToken) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add company ID to requests except public auth routes
    if (companyId && !isPublicAuthRoute) {
      config.headers['x-company-id'] = companyId;
    }

    const isGlobalAdmin = storedRole === 'MASTER_ADMIN' || storedRole === 'SUPER_ADMIN';
    const requiresCompanyContext = !isPublicAuthRoute && !isGlobalAdmin;

    // Don't block public auth routes or master admin without company context
    // Block other routes without company context if a token is present
    if (requiresCompanyContext && token && !companyId && !isBypassToken) {
      console.error('Company context missing! Redirecting to login.');
      localStorage.removeItem('token');
      localStorage.removeItem('hrms_user');
      localStorage.removeItem('company_id');
      localStorage.removeItem('company_subdomain');
      window.location.href = '/signin';
      return Promise.reject(new Error('Company context required'));
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('hrms_user');
      // window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // GET request
  get: (url, config = {}) => api.get(url, config),

  // POST request  
  post: (url, data, config = {}) => api.post(url, data, config),

  // PUT request
  put: (url, data, config = {}) => api.put(url, data, config),

  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),

  // PATCH request
  patch: (url, data, config = {}) => api.patch(url, data, config),
};

export default api;
