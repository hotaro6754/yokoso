// src/app/(dashboard)/company-admin/roles-permissions/components/PermissionManager.js (served via middleware rewrite)
// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Save, ArrowLeft, Loader2 } from "lucide-react";
// import { roleService } from '@/services/super-admin-services/user-roleService';
// import { toast } from 'sonner';

// const PermissionManager = ({ roleId, roleName, isSystem = false }) => {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [permissions, setPermissions] = useState({});

//   useEffect(() => {
//     fetchRolePermissions();
//   }, [roleId, isSystem]);

//   const fetchRolePermissions = async () => {
//     try {
//       setIsLoading(true);
//       // Fetch role details which includes permissions
//       const response = await roleService.getRoleById(roleId);

//       if ((response.status || response.success) && response.data) {
//         // Transform API response (list of permission assignments) to UI format (object by module)
//         const permissionsArray = response.data.permissions || [];
//         const transformedPermissions = {};



//         permissionsArray.forEach(item => {
//           // Handle flat structure where item is like { module: 'XYZ', READ: true, ... }
//           if (item.module) {
//             const module = item.module;

//             if (!transformedPermissions[module]) {
//               transformedPermissions[module] = {};
//             }

//             // Map uppercase API keys to lowercase internal keys
//             permissionTypes.forEach(type => {
//               if (item[type.toUpperCase()] === true) {
//                 transformedPermissions[module][type] = true;
//               }
//             });
//           }
//           // Fallback for nested structure if API still returns that in some cases
//           else if (item.permission && item.isAllowed) {
//             const module = item.permission.module;
//             const action = item.permission.action.toLowerCase();

//             if (!transformedPermissions[module]) {
//               transformedPermissions[module] = {};
//             }
//             transformedPermissions[module][action] = true;
//           }
//         });

//         // Set default empty permissions structure based on your PermissionModule enum
//         const defaultPermissions = {
//           EMPLOYEE: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           HOLIDAYS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           LEAVES: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           EVENTS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           SALES: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           TRAINING: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           REPORTS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           TICKETS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           PAYROLL: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           ASSETS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           ATTENDANCE: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           DOCUMENTS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           SETTINGS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           ROLES: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           DEPARTMENT: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//           DESIGNATION: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false }
//         };

//         // Deep merge fetched permissions with defaults
//         const mergedPermissions = { ...defaultPermissions };
//         Object.keys(transformedPermissions).forEach(module => {
//           if (mergedPermissions[module]) {
//             mergedPermissions[module] = { ...mergedPermissions[module], ...transformedPermissions[module] };
//           } else {
//             mergedPermissions[module] = transformedPermissions[module];
//           }
//         });

//         console.log("Fetched permissions map:", mergedPermissions);
//         setPermissions(mergedPermissions);
//       } else {
//         throw new Error(response.message || 'Failed to fetch permissions');
//       }
//     } catch (error) {
//       console.error("Error fetching permissions:", error);
//       toast.error(error.message || 'Failed to fetch permissions');

//       // Set default empty permissions structure based on your PermissionModule enum
//       const defaultPermissions = {
//         EMPLOYEE: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         HOLIDAYS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         LEAVES: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         EVENTS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         SALES: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         TRAINING: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         REPORTS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         TICKETS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         PAYROLL: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         ASSETS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         ATTENDANCE: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         DOCUMENTS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         SETTINGS: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         ROLES: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         DEPARTMENT: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false },
//         DESIGNATION: { read: false, write: false, create: false, delete: false, import: false, export: false, approve: false, manage: false }
//       };

//       setPermissions(defaultPermissions);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePermissionChange = (module, permission, value) => {
//     setPermissions(prev => ({
//       ...prev,
//       [module]: {
//         ...prev[module],
//         [permission]: value
//       }
//     }));
//   };

//   const handleModuleAllChange = (module, value) => {
//     setPermissions(prev => ({
//       ...prev,
//       [module]: Object.keys(prev[module]).reduce((acc, key) => {
//         // Only update permission flags, preserve other fields
//         if (permissionTypes.includes(key)) {
//           acc[key] = value;
//         } else {
//           acc[key] = prev[module][key];
//         }
//         return acc;
//       }, {})
//     }));
//   };

//   const handleSubmit = async () => {
//     setIsSubmitting(true);

//     try {
//       // Create clean payload for API - strip metadata fields
//       const payload = Object.entries(permissions).map(([module, perms]) => {
//         const cleanPerm = { module };

//         // Only include valid permission flags and convert keys to uppercase
//         permissionTypes.forEach(type => {
//           cleanPerm[type.toUpperCase()] = !!perms[type]; // Ensure boolean and uppercase key
//         });

//         return cleanPerm;
//       });

//       console.log('Submitting permissions:', payload);

//       // Update permissions
//       await roleService.updateRolePermissions(roleId, payload);
//       toast.success('Permissions updated successfully');

//       // Redirect back to roles list after successful submission
//       router.push('/company-admin/roles-permissions');
//       router.refresh();
//     } catch (error) {
//       console.error('Error saving permissions:', error);
//       toast.error(error.message || 'Failed to save permissions');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // All possible permission types based on your PermissionAction enum
//   const permissionTypes = ["read", "write", "create", "delete", "import", "export", "approve", "manage"];
//   const permissionLabels = {
//     read: "Read",
//     write: "Write",
//     create: "Create",
//     delete: "Delete",
//     import: "Import",
//     export: "Export",
//     approve: "Approve",
//     manage: "Manage"
//   };

//   // Get all modules from permissions object and sort them alphabetically
//   const modules = Object.keys(permissions).sort();

//   if (isLoading) {
//     return (
//       <div className="w-full p-4 sm:p-6">
//         <div className="flex items-center justify-center h-64">
//           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
//           <span className="ml-2 text-gray-600 dark:text-gray-400">Loading permissions...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full p-4 sm:p-6">
//       {/* Header with title and back button */}
//       <div className="flex items-center mb-6">
//         <button
//           onClick={() => router.push('/company-admin/roles-permissions')}
//           className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//           aria-label="Go back"
//           disabled={isSubmitting}
//         >
//           <ArrowLeft size={20} />
//         </button>
//         <div>
//           <h1 className="text-xl font-bold text-gray-900 dark:text-white">
//             Permission Management
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Role: {roleName} {isSystem && "(System Role)"}
//           </p>
//           {isSystem && (
//             <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
//               Note: System roles have predefined permissions that may be partially editable.
//             </p>
//           )}
//         </div>
//       </div>

//       <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
//         <div className="overflow-x-auto">
//           <table className="w-full table-auto">
//             <thead>
//               <tr className="bg-gray-50 dark:bg-gray-700">
//                 <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Modules
//                 </th>
//                 <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Allow All
//                 </th>
//                 {permissionTypes.map(permission => (
//                   <th key={permission} className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {permissionLabels[permission]}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {modules.map(module => {
//                 const modulePermissions = permissions[module] || {};
//                 const allChecked = Object.values(modulePermissions).every(Boolean);
//                 const someChecked = Object.values(modulePermissions).some(Boolean);

//                 return (
//                   <tr key={module} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
//                     <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
//                       {module}
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       <input
//                         type="checkbox"
//                         checked={allChecked}
//                         ref={(input) => {
//                           if (input) {
//                             input.indeterminate = someChecked && !allChecked;
//                           }
//                         }}
//                         onChange={(e) => handleModuleAllChange(module, e.target.checked)}
//                         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
//                         disabled={isSubmitting}
//                       />
//                     </td>
//                     {permissionTypes.map(permission => (
//                       <td key={permission} className="px-4 py-3 text-center">
//                         <input
//                           type="checkbox"
//                           checked={modulePermissions[permission] || false}
//                           onChange={(e) => handlePermissionChange(module, permission, e.target.checked)}
//                           className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
//                           disabled={isSubmitting}
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
//           <button
//             type="button"
//             onClick={() => router.push('/company-admin/roles-permissions')}
//             className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-center"
//             disabled={isSubmitting}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors shadow-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
//           >
//             {isSubmitting ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Save size={18} />
//             )}
//             {isSubmitting ? 'Saving...' : 'Save Permissions'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PermissionManager;

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check, AlertCircle } from "lucide-react";
import { roleService } from '@/services/super-admin-services/user-roleService';
import { toast } from 'sonner';

const PermissionManager = ({ roleId, roleName, isSystem = false }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({});

  // --- LOGIC PRESERVED ---
  useEffect(() => { fetchRolePermissions(); }, [roleId, isSystem]);

  const permissionTypes = ["read", "write", "create", "delete", "import", "export", "approve", "manage"];
  const permissionLabels = {
    read: "Read", write: "Write", create: "Create", delete: "Delete",
    import: "Import", export: "Export", approve: "Approve", manage: "Manage"
  };

  const fetchRolePermissions = async () => {
    try {
      setIsLoading(true);
      const response = await roleService.getRoleById(roleId);

      if ((response.status || response.success) && response.data) {
        const permissionsArray = response.data.permissions || [];
        const transformedPermissions = {};

        permissionsArray.forEach(item => {
          if (item.module) {
            const module = item.module;
            if (!transformedPermissions[module]) transformedPermissions[module] = {};
            permissionTypes.forEach(type => {
              if (item[type.toUpperCase()] === true) transformedPermissions[module][type] = true;
            });
          }
        });

        const defaultPermissions = {
          EMPLOYEE: {}, HOLIDAYS: {}, LEAVES: {}, EVENTS: {}, SALES: {}, TRAINING: {},
          REPORTS: {}, TICKETS: {}, PAYROLL: {}, ASSETS: {}, ATTENDANCE: {}, DOCUMENTS: {},
          SETTINGS: {}, ROLES: {}, DEPARTMENT: {}, DESIGNATION: {}
        };

        // Initialize all keys to false
        Object.keys(defaultPermissions).forEach(key => {
          permissionTypes.forEach(type => defaultPermissions[key][type] = false);
        });

        const mergedPermissions = { ...defaultPermissions };
        Object.keys(transformedPermissions).forEach(module => {
          if (mergedPermissions[module]) {
            mergedPermissions[module] = { ...mergedPermissions[module], ...transformedPermissions[module] };
          }
        });
        setPermissions(mergedPermissions);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error('Failed to fetch permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (module, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: { ...prev[module], [permission]: value }
    }));
  };

  const handleModuleAllChange = (module, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: Object.keys(prev[module]).reduce((acc, key) => {
        if (permissionTypes.includes(key)) acc[key] = value;
        else acc[key] = prev[module][key];
        return acc;
      }, {})
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = Object.entries(permissions).map(([module, perms]) => {
        const cleanPerm = { module };
        permissionTypes.forEach(type => {
          cleanPerm[type.toUpperCase()] = !!perms[type];
        });
        return cleanPerm;
      });

      await roleService.updateRolePermissions(roleId, payload);
      toast.success('Permissions updated successfully');
      router.push('/company-admin/roles-permissions');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = Object.keys(permissions).sort();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading permission matrix...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold sticky left-0 bg-gray-50 dark:bg-gray-900 z-10 min-w-[200px]">
                Module Name
              </th>
              <th scope="col" className="px-4 py-4 text-center min-w-[80px]">
                <span className="sr-only">Select All</span>
                All
              </th>
              {permissionTypes.map(type => (
                <th key={type} scope="col" className="px-4 py-4 text-center font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                  {permissionLabels[type]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {modules.map((module) => {
              const modulePerms = permissions[module] || {};
              const allChecked = Object.values(modulePerms).every(Boolean);
              const someChecked = Object.values(modulePerms).some(Boolean);

              return (
                <tr key={module} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 transition-colors z-10 border-r border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-700">
                    {module.charAt(0) + module.slice(1).toLowerCase().replace(/_/g, ' ')}
                  </td>

                  {/* Select All Checkbox */}
                  <td className="px-4 py-4 text-center border-r border-dashed border-gray-100 dark:border-gray-700">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={input => { if (input) input.indeterminate = someChecked && !allChecked; }}
                        onChange={(e) => handleModuleAllChange(module, e.target.checked)}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        disabled={isSubmitting}
                      />
                    </div>
                  </td>

                  {/* Individual Permissions */}
                  {permissionTypes.map(type => (
                    <td key={type} className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={!!modulePerms[type]}
                          onChange={(e) => handlePermissionChange(module, type, e.target.checked)}
                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer disabled:opacity-50"
                          disabled={isSubmitting}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50/50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between sticky bottom-0 z-20 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <AlertCircle size={16} />
          <span>Changes are applied immediately after saving.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 rounded-xl shadow-lg shadow-gray-900/20 dark:shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionManager;