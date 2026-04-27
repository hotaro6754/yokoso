// src/app/(dashboard)/company-admin/roles-permissions/[roleId]/page.js (served via middleware rewrite)
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from '@/components/common/Breadcrumb';
import RoleHeader from "../components/RoleHeader";
import PermissionSummary from "../components/PermissionSummary";
import { Settings, Users } from "lucide-react";

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        // Mock data - replace with API call
        const mockRole = {
          id: parseInt(params.roleId),
          name: "Admin",
          description: "Full system administration access",
          userCount: 3,
          status: "Active",
          createdDate: "12 Sep 2024",
          isSystem: true,
          permissions: ["manage_users", "view_users", "manage_roles"]
        };
        setRole(mockRole);
      } catch (error) {
        console.error("Error fetching role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [params.roleId]);

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

  if (!role) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <Breadcrumb rightContent={null} />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Role Not Found
          </h1>
          <button
            onClick={() => router.push('/company-admin/roles-permissions')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Roles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
      <Breadcrumb 
        items={[
          { label: "Roles & Permissions", href: "/company-admin/roles-permissions" },
          { label: role.name }
        ]}
        rightContent={
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/company-admin/roles-permissions/${role.id}/permissions`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings size={16} />
              Manage Permissions
            </button>
            <button
              onClick={() => router.push(`/company-admin/roles-permissions/${role.id}/users`)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Users size={16} />
              View Users
            </button>
          </div>
        }
      />
      
      <div className="space-y-6">
        {/* Role Header */}
        <div className="bg-white rounded-lg shadow dark:bg-gray-800">
          <RoleHeader role={role} loading={loading} />
        </div>

        {/* Permission Summary (Read-only) */}
        <div className="bg-white rounded-lg shadow dark:bg-gray-800">
          <PermissionSummary permissions={role.permissions} />
        </div>
      </div>
    </div>
  );
}