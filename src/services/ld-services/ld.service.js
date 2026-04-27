// src/services/ld-services/ld.service.js
import { apiClient } from '@/lib/api';

export const ldService = {
  /* =========================
     DASHBOARD APIs
  ========================= */
  
  // Get Dashboard Stats
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/ld/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch dashboard stats'
      );
    }
  },

  // Get Training Overview
  getTrainingOverview: async () => {
    try {
      const response = await apiClient.get('/ld/dashboard/training-overview');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch training overview'
      );
    }
  },

  // Get Employee Learning Status
  getEmployeeLearningStatus: async () => {
    try {
      const response = await apiClient.get('/ld/dashboard/employee-learning-status');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch employee learning status'
      );
    }
  },

  // Get Upcoming Learning Activities
  getUpcomingActivities: async () => {
    try {
      const response = await apiClient.get('/ld/dashboard/upcoming-activities');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch upcoming activities'
      );
    }
  },

  // Get Skills Coverage Snapshot
  getSkillsCoverageSnapshot: async () => {
    try {
      const response = await apiClient.get('/ld/dashboard/skills-coverage');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch skills coverage'
      );
    }
  },

  /* =========================
     COURSE MANAGEMENT APIs
  ========================= */

  // Get All Courses
  getAllCourses: async (params = {}) => {
    try {
      const response = await apiClient.get('/ld/courses', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch courses'
      );
    }
  },

  // Get Course by ID
  getCourseById: async (id) => {
    try {
      const response = await apiClient.get(`/ld/courses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch course'
      );
    }
  },

  // Create Course
  createCourse: async (courseData) => {
    try {
      const response = await apiClient.post('/ld/courses', courseData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create course'
      );
    }
  },

  // Update Course
  updateCourse: async (id, courseData) => {
    try {
      const response = await apiClient.put(`/ld/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update course'
      );
    }
  },

  // Upload Course Material
  uploadCourseMaterial: async (courseId, file, materialType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('materialType', materialType);
      const response = await apiClient.post(`/ld/courses/${courseId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to upload material'
      );
    }
  },

  // Update Course Status
  updateCourseStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/ld/courses/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update course status'
      );
    }
  },

  // Delete Course
  deleteCourse: async (id) => {
    try {
      const response = await apiClient.delete(`/ld/courses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete course'
      );
    }
  },

  /* =========================
     TRAINING ASSIGNMENT APIs
  ========================= */

  // Get All Training Assignments
  getAllTrainingAssignments: async (params = {}) => {
    try {
      const response = await apiClient.get('/ld/training-assignments', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch training assignments'
      );
    }
  },

  // Create Training Assignment
  createTrainingAssignment: async (assignmentData) => {
    try {
      const response = await apiClient.post('/ld/training-assignments', assignmentData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create training assignment'
      );
    }
  },

  // Get Assignment by ID
  getAssignmentById: async (id) => {
    try {
      const response = await apiClient.get(`/ld/training-assignments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch assignment'
      );
    }
  },

  // Update Training Assignment
  updateTrainingAssignment: async (id, assignmentData) => {
    try {
      const response = await apiClient.put(`/ld/training-assignments/${id}`, assignmentData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update assignment'
      );
    }
  },

  /* =========================
     LEARNING PROGRESS APIs
  ========================= */

  // Get Employee-wise Progress
  getEmployeeProgress: async (params = {}) => {
    try {
      const response = await apiClient.get('/ld/progress/employee-wise', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch employee progress'
      );
    }
  },

  // Get Course-wise Progress
  getCourseProgress: async (params = {}) => {
    try {
      const response = await apiClient.get('/ld/progress/course-wise', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch course progress'
      );
    }
  },

  // Get Course Progress Detail
  getCourseProgressDetail: async (id) => {
    try {
      const response = await apiClient.get(`/ld/progress/course-wise/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch course progress detail'
      );
    }
  },

  // Get Employee Progress Detail
  getEmployeeProgressDetail: async (id) => {
    try {
      const response = await apiClient.get(`/ld/progress/employee-wise/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch employee progress detail'
      );
    }
  },

  // Update Progress Status
  updateProgressStatus: async (assignmentId, status) => {
    try {
      const response = await apiClient.patch(`/ld/progress/${assignmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update progress status'
      );
    }
  },

  /* =========================
     SKILLS & COMPETENCY APIs
  ========================= */

  // Get All Skills
  getAllSkills: async (params = {}) => {
    try {
      const response = await apiClient.get('/ld/skills', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch skills'
      );
    }
  },

  // Create Skill
  createSkill: async (skillData) => {
    try {
      const response = await apiClient.post('/ld/skills', skillData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create skill'
      );
    }
  },

  // Get Skill by ID
  getSkillById: async (id) => {
    try {
      const response = await apiClient.get(`/ld/skills/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch skill'
      );
    }
  },

  // Update Skill
  updateSkill: async (id, skillData) => {
    try {
      const response = await apiClient.put(`/ld/skills/${id}`, skillData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update skill'
      );
    }
  },

  // Get Role-Skill Mapping
  getRoleSkillMapping: async (roleId) => {
    try {
      const response = await apiClient.get(`/ld/skills/role-skills/${roleId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch role-skill mapping'
      );
    }
  },

  // Update Role-Skill Mapping
  updateRoleSkillMapping: async (roleId, skills) => {
    try {
      const response = await apiClient.put(`/ld/skills/role-skills/${roleId}`, { skills });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update role-skill mapping'
      );
    }
  },

  // Get Employee Skills
  getEmployeeSkills: async (employeeId) => {
    try {
      const response = await apiClient.get(`/ld/skills/employee-skills/${employeeId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch employee skills'
      );
    }
  },

  // Tag Employee Skill
  tagEmployeeSkill: async (employeeId, skillData) => {
    try {
      const response = await apiClient.post(`/ld/skills/employee-skills/${employeeId}`, skillData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to tag employee skill'
      );
    }
  },

  // Update Employee Skill Proficiency
  updateEmployeeSkillProficiency: async (employeeId, skillId, proficiencyLevel) => {
    try {
      const response = await apiClient.patch(`/ld/skills/employee-skills/${employeeId}/${skillId}`, { proficiencyLevel });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update skill proficiency'
      );
    }
  },

  // Remove Employee Skill
  removeEmployeeSkill: async (employeeId, skillId) => {
    try {
      const response = await apiClient.delete(`/ld/skills/employee-skills/${employeeId}/${skillId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to remove employee skill'
      );
    }
  },

  // Get Roles for Skill Mapping
  getLdRoles: async () => {
    try {
      const response = await apiClient.get('/ld/skills/roles/list');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch roles'
      );
    }
  },

  // Get Employee Skills Summary
  getEmployeeSkillsSummary: async (params = {}) => {
    try {
      const response = await apiClient.get('/ld/skills/employee-skills', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch employee skills'
      );
    }
  },

  /* =========================
     TALENT & SUCCESSION APIs
  ========================= */

  // Get Succession Roles
  getSuccessionRoles: async (params = {}) => {
    try {
      const response = await apiClient.get('/ld/succession/roles', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch succession roles'
      );
    }
  },

  // Mark Role as Critical
  markRoleAsCritical: async (roleId, isCritical, roleType) => {
    try {
      const response = await apiClient.patch(`/ld/succession/roles/${roleId}`, { isCritical, roleType });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to mark role as critical'
      );
    }
  },

  // Get Successor Mapping
  getSuccessorMapping: async (roleId) => {
    try {
      const response = await apiClient.get(`/ld/succession/roles/${roleId}/successors`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch successor mapping'
      );
    }
  },

  // Add Successor
  addSuccessor: async (roleId, successorData) => {
    try {
      const response = await apiClient.post(`/ld/succession/roles/${roleId}/successors`, successorData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to add successor'
      );
    }
  },

  // Update Successor Readiness
  updateSuccessorReadiness: async (roleId, successorId, readinessLevel) => {
    try {
      const response = await apiClient.patch(`/ld/succession/roles/${roleId}/successors/${successorId}`, { readinessLevel });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update successor readiness'
      );
    }
  },

  // Get Succession Role by ID
  getSuccessionRoleById: async (roleId) => {
    try {
      const response = await apiClient.get(`/ld/succession/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch succession role'
      );
    }
  },

  // Get Employees for Succession
  getSuccessionEmployees: async (params = {}) => {
    try {
      const response = await apiClient.get('/ld/succession/employees', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch employees'
      );
    }
  },
};
