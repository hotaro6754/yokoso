// src/app/(dashboard)/company-admin/roles-permissions/[roleId]/permissions/page.js (served via middleware rewrite)
// "use client";
// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Breadcrumb from '@/components/common/Breadcrumb';
// import PermissionManager from "../../components/PermissionManager";
// import RoleHeader from "../../components/RoleHeader";
// import roleService from "@/services/super-admin-services/user-roleService";
// import { toast } from "sonner";

// export default function RolePermissionsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const [role, setRole] = useState(null);
//   const [isSystemRole, setIsSystemRole] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchRole = async () => {
//       try {
//         const response = await roleService.getRoleById(params.roleId);
//         if (response.status || response.success) {
//           const roleData = response.data;

//           // Determine if this is a system role
//           const systemRole = roleData.isSystem === true || roleData.isEditable !== undefined;
//           setIsSystemRole(systemRole);

//           let status = 'Active';

//           // Check if it's a system role
//           if (systemRole) {
//             // System role - use isEditable to determine status
//             status = roleData.isEditable === false ? 'System' : 'Active';
//           } else {
//             // Company role - has status field
//             if (roleData.status) {
//               status = roleData.status.charAt(0) + roleData.status.slice(1).toLowerCase();
//             } else {
//               // Fallback to isActive
//               status = roleData.isActive ? 'Active' : 'Inactive';
//             }
//           }

//           setRole({
//             ...roleData,
//             createdDate: new Date(roleData.createdAt).toLocaleDateString('en-GB', {
//               day: '2-digit',
//               month: 'short',
//               year: 'numeric'
//             }),
//             status: status
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching role:", error);
//         toast.error(error.message || 'Failed to fetch role');
//         router.push('/company-admin/roles-permissions');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRole();
//   }, [params.roleId, router]);

//   if (loading) {
//     return (
//       <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
//         <Breadcrumb rightContent={null} />
//         <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow p-6">
//           <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
//           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
//           <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
//       <Breadcrumb
//         items={[
//           { label: "Roles & Permissions", href: "/company-admin/roles-permissions" },
//           { label: role?.name || "Role", href: `/company-admin/roles-permissions/${params.roleId}` },
//           { label: "Permissions" }
//         ]}
//       />

//       <div className="space-y-6">
//         {/* Role Header */}
//         <div className="bg-white rounded-lg shadow dark:bg-gray-800">
//           <RoleHeader role={role} loading={loading} />
//         </div>

//         {/* Permission Manager (Editable) */}
//         <div className="bg-white rounded-lg shadow dark:bg-gray-800">
//           <PermissionManager
//             roleId={params.roleId}
//             roleName={role?.name}
//             isSystem={isSystemRole}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from '@/components/common/Breadcrumb';
import PermissionManager from "../../components/PermissionManager";
import RoleHeader from "../../components/RoleHeader";
import { roleService } from "@/services/super-admin-services/user-roleService";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function RolePermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [isSystemRole, setIsSystemRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await roleService.getRoleById(params.roleId);
        if (response.status || response.success) {
          const roleData = response.data;

          // Determine if this is a system role
          const systemRole = roleData.isSystem === true || roleData.isEditable !== undefined;
          setIsSystemRole(systemRole);

          let status = 'Active';

          if (systemRole) {
            status = roleData.isEditable === false ? 'System' : 'Active';
          } else {
            if (roleData.status) {
              status = roleData.status.charAt(0) + roleData.status.slice(1).toLowerCase();
            } else {
              status = roleData.isActive ? 'Active' : 'Inactive';
            }
          }

          setRole({
            ...roleData,
            createdDate: new Date(roleData.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
            status: status
          });
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        toast.error(error.message || 'Failed to fetch role');
        router.push('/company-admin/roles-permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [params.roleId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 space-y-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header Navigation */}
        <div className="flex flex-col gap-4">
          <Breadcrumb
            items={[
              { label: "Company Admin", href: "/company-admin/dashboard" },
              { label: "Roles", href: "/company-admin/roles-permissions" },
              { label: role?.displayName || role?.name || "Role Details", href: "#" }
            ]}
          />
        </div>

        {/* Role Identity Card */}
        <RoleHeader role={role} loading={loading} />

        {/* Permissions Matrix */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Access Control Matrix
            </h2>
          </div>

          <PermissionManager
            roleId={params.roleId}
            roleName={role?.name}
            isSystem={isSystemRole}
          />
        </div>
      </div>
    </div>
  );
}