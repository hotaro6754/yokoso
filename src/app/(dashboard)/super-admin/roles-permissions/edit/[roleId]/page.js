// src/app/(dashboard)/company-admin/roles-permissions/edit/[roleId]/page.js (served via middleware rewrite)
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import RoleForm from '../../components/RoleForm';
import roleService from '@/services/super-admin-services/user-roleService';
import { toast } from 'sonner';

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch role data for editing
    const fetchRole = async () => {
      try {
        const response = await roleService.getRoleById(params.roleId);
        console.log(response);
        if (response.status || response.success) {
          setRole(response.data);
        } else {
          toast.error('Failed to fetch role details');
          router.push('/company-admin/roles-permissions');
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        toast.error(error.message || 'Failed to fetch role details');
        router.push('/company-admin/roles-permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [params.roleId, router]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <Breadcrumb rightContent={null} />
        <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
      <Breadcrumb
        items={[
          { label: "Roles & Permissions", href: "/company-admin/roles-permissions" },
          { label: role?.displayName || role?.name || "Edit Role" }
        ]}
      />

      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <RoleForm role={role} isEdit={true} />
      </div>
    </div>
  );
}