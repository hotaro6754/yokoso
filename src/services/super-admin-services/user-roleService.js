// src/services/super-admin-services/user-roleService.js
import { apiClient } from '@/lib/api';

export const roleService = {
  // 1. List All Roles
  getAllRoles: async (params = {}) => {
    try {
      const finalParams = { roleType: 'all', ...params };
      const response = await apiClient.get('/company-admin/user-roles/roles', { params: finalParams });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch roles';
      throw new Error(errorMessage);
    }
  },

  // 2. Create Role
  createRole: async (roleData) => {
    try {
      const response = await apiClient.post('/company-admin/user-roles/roles', roleData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create role';
      throw new Error(errorMessage);
    }
  },

  // 3. Get Role Details
  getRoleById: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/company-admin/user-roles/roles/${id}`, { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch role';
      throw new Error(errorMessage);
    }
  },

  // 4. Update Role
  updateRole: async (id, roleData) => {
    try {
      const response = await apiClient.patch(`/company-admin/user-roles/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update role';
      throw new Error(errorMessage);
    }
  },

  // 5. Delete Role
  deleteRole: async (id) => {
    try {
      const response = await apiClient.delete(`/company-admin/user-roles/roles/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete role';
      throw new Error(errorMessage);
    }
  },

  // 6. Get Permissions Matrix
  getPermissionsMatrix: async () => {
    try {
      const response = await apiClient.get('/company-admin/user-roles/permissions/matrix');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch permissions matrix';
      throw new Error(errorMessage);
    }
  },

  // 7. Update User Permissions (Role Permissions)
  // Note: The endpoint is PUT /user-roles/roles/:id/permissions
  updateRolePermissions: async (id, permissions) => {
    try {
      const payload = Array.isArray(permissions) ? { permissions } : permissions;
      const response = await apiClient.put(`/company-admin/user-roles/roles/${id}/permissions`, payload);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update role permissions';
      throw new Error(errorMessage);
    }
  },

  // 8. Assign Role to User
  assignRoleToUser: async (data) => {
    try {
      // data: { userId, roleId }
      const response = await apiClient.post('/company-admin/user-roles/users/assign-role', data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to assign role to user';
      throw new Error(errorMessage);
    }
  },

  // 9. Get Available System Roles
  getSystemRoles: async () => {
    try {
      const response = await apiClient.get('/company-admin/user-roles/roles/system');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch system roles';
      throw new Error(errorMessage);
    }
  },

  // 10. Clone System Role
  cloneSystemRole: async (systemRoleId) => {
    try {
      const response = await apiClient.post('/company-admin/user-roles/roles/system/clone', { systemRoleId });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to clone system role';
      throw new Error(errorMessage);
    }
  }
};

export default roleService;