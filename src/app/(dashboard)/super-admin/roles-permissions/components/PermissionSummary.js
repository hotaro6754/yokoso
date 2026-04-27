// src/app/(dashboard)/company-admin/roles-permissions/components/PermissionSummary.js (served via middleware rewrite)
const PermissionSummary = ({ permissions }) => {
  const availablePermissions = [
    { id: "manage_users", name: "Manage Users", category: "Users" },
    { id: "view_users", name: "View Users", category: "Users" },
    { id: "manage_roles", name: "Manage Roles", category: "Security" },
    // ... other permissions
  ];

  const hasPermission = (permissionId) => {
    return permissions.includes(permissionId);
  };

  return (
    <div className="w-full p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Assigned Permissions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availablePermissions.map(permission => (
          hasPermission(permission.id) && (
            <div key={permission.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {permission.name}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default PermissionSummary;