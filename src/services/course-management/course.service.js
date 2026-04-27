import api from "@/lib/api";

// API Service for Course Management
const courseApi = {
  // Get auth token and company ID
  getAuthHeaders: () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const companyId = localStorage.getItem('companyId') || sessionStorage.getItem('companyId');

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId
    };
  },

  // Handle API errors
  handleApiError: async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  },

  // Get all courses for department head
  getCourses: async (filters = {}) => {
    const params = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await fetch(`http://localhost:3000/api/course-management/courses?${params}`, {
      headers: courseApi.getAuthHeaders()
    });

    return courseApi.handleApiError(response);
  },

  // Create new course
  createCourse: async (courseData) => {
    const response = await fetch('http://localhost:3000/api/course-management/courses', {
      method: 'POST',
      headers: courseApi.getAuthHeaders(),
      body: JSON.stringify(courseData)
    });

    return courseApi.handleApiError(response);
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    const response = await fetch(`http://localhost:3000/api/course-management/courses/${courseId}`, {
      method: 'PUT',
      headers: courseApi.getAuthHeaders(),
      body: JSON.stringify(courseData)
    });

    return courseApi.handleApiError(response);
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await fetch(`http://localhost:3000/api/course-management/courses/${courseId}`, {
      method: 'DELETE',
      headers: courseApi.getAuthHeaders()
    });

    return courseApi.handleApiError(response);
  },

  // Get course details
  getCourseDetails: async (courseId) => {
    const response = await fetch(`http://localhost:3000/api/course-management/courses/${courseId}`, {
      headers: courseApi.getAuthHeaders()
    });

    return courseApi.handleApiError(response);
  },

  // Get department employees for assignment
  getDepartmentEmployees: async (departmentId) => {
    const response = await fetch(`http://localhost:3000/api/course-management/department-employees${departmentId ? `?departmentId=${departmentId}` : ''}`, {
      headers: courseApi.getAuthHeaders()
    });

    return courseApi.handleApiError(response);
  },

  // Assign course to employees
  assignCourseToEmployees: async (courseId, employeeIds) => {
    const response = await fetch(`http://localhost:3000/api/course-management/courses/${courseId}/assign`, {
      method: 'POST',
      headers: courseApi.getAuthHeaders(),
      body: JSON.stringify({ employeeIds })
    });

    return courseApi.handleApiError(response);
  },

  // Change course status
  changeCourseStatus: async (courseId, status) => {
    const response = await fetch(`http://localhost:3000/api/course-management/courses/${courseId}/status`, {
      method: 'PATCH',
      headers: courseApi.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    return courseApi.handleApiError(response);
  },

  // Get course statistics
  getCourseStatistics: async () => {
    const response = await fetch('http://localhost:3000/api/course-management/statistics', {
      headers: courseApi.getAuthHeaders()
    });

    return courseApi.handleApiError(response);
  }
};

// Department Head Course Service
export const courseManagementService = {
  // Department Head: Create new course
  createCourse: async (courseData) => {
    const response = await api.post('/dept-head/courses', courseData);
    return response.data;
  },

  // Department Head: Get all courses created by them
  getDepartmentHeadCourses: async (params = {}) => {
    const response = await api.get('/dept-head/courses', { params });
    return response.data;
  },

  // Department Head: Update course
  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/dept-head/courses/${courseId}`, courseData);
    return response.data;
  },

  // Department Head: Delete course
  deleteCourse: async (courseId) => {
    const response = await api.delete(`/dept-head/courses/${courseId}`);
    return response.data;
  },

  // Department Head: Assign course to employees
  assignCourseToEmployees: async (courseId, employeeIds) => {
    const response = await api.post(`/dept-head/courses/${courseId}/assign`, { employeeIds });
    return response.data;
  },

  updateAssignmentStatus: async (assignmentId, status, rejectionReason) => {
    const response = await api.put(`/dept-head/courses/assignments/${assignmentId}/status`, { status, rejectionReason });
    return response.data;
  },

  // Employee: Get courses assigned to them
  getEmployeeCourses: async (params = {}) => {
    const response = await api.get('/employee/courses', { params });
    return response.data;
  },

  // Employee: Submit completion comment
  submitCompletionComment: async (assignmentId, comment) => {
    const response = await api.post(`/employee/courses/${assignmentId}/complete`, { comment });
    return response.data;
  },

  // Employee: Get certificates
  getEmployeeCertificates: async (params = {}) => {
    const response = await api.get('/certificates/employee', { params });
    return response.data;
  },

  // Manager: Get department courses for assignment
  getDepartmentCourses: async (params = {}) => {
    // Note: Actually fetching company/available courses for manager
    const response = await api.get('/manager/courses', { params });
    return response.data;
  },

  // Manager: Assign courses to team members
  assignCoursesToTeam: async (courseId, employeeIds) => {
    const response = await api.post(`/manager/courses/${courseId}/assign`, { employeeIds });
    return response.data;
  },

  // Manager: Get team course assignments for approval
  getTeamCourseAssignments: async (params = {}) => {
    const response = await api.get('/manager/courses/assignments', { params });
    return response.data;
  },

  // Manager: Approve/Reject course completion
  reviewCourseCompletion: async (assignmentId, status, rejectionReason) => {
    const response = await api.put(`/manager/courses/assignments/${assignmentId}/review`, { status, rejectionReason });
    return response.data;
  },

  // Manager: Get My Team Employees
  getMyTeamEmployees: async () => {
    const response = await api.get('/manager/courses/employees');
    return response.data;
  },

  // HR: Get pending certifications
  getPendingCertifications: async () => {
    const response = await api.get('/hr/certifications/pending');
    return response.data.data;
  },

  // HR: Get issued certifications
  getIssuedCertifications: async () => {
    const response = await api.get('/hr/certifications/issued');
    return response.data.data;
  },

  // HR: Issue certificate
  issueCertificate: async (assignmentId) => {
    // Increase timeout to 60s for PDF generation
    const response = await api.post(`/hr/certifications/${assignmentId}/issue`, {}, { timeout: 60000 });
    return response.data;
  },

  // HR: Get certificate details
  getCertificateDetails: async (certificateId) => {
    const response = await api.get(`/certificates/${certificateId}`);
    return response.data;
  },

  // Common: Download certificate PDF (employee + privileged roles)
  downloadCertificate: async (certificateId) => {
    const response = await api.get(`/employee/courses/certificates/${certificateId}/download`, {
      params: { action: 'download' },
      responseType: 'blob'
    });
    return response;
  },

  // Common: Get course categories
  getCourseCategories: async () => {
    const response = await api.get('/courses/categories');
    return response.data;
  },

  // Common: Get course details
  getCourseDetails: async (courseId) => {
    const response = await api.get(`/dept-head/courses/${courseId}`);
    return response.data;
  },

  // Common: Get department employees for assignment
  getDepartmentEmployees: async (departmentId) => {
    const response = await api.get(`/departments/${departmentId}/employees`);
    return response.data;
  },

  // Get department employees for current dept head (inferred from token)
  getMyDepartmentEmployees: async () => {
    const response = await api.get('/dept-head/courses/employees');
    return response.data;
  },

  // LD: Get Training Status
  getLearningTrainingStatus: async (params) => {
    const response = await api.get('/ld/training-status', { params });
    return response.data;
  },

  // LD: Get Training Status Details
  getLearningTrainingStatusDetails: async (id) => {
    const response = await api.get(`/ld/training-status/${id}`);
    return response.data;
  }
};

// Export the base API for other services to use
export { courseApi };
