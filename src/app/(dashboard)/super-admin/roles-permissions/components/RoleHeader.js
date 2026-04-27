// src/app/(dashboard)/company-admin/roles-permissions/components/RoleHeader.js (served via middleware rewrite)
// import { useRouter } from "next/navigation";
// import { Edit, Trash2, Loader } from "lucide-react";

// const RoleHeader = ({ role, loading = false }) => {
//   const router = useRouter();

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="w-full p-4 sm:p-6">
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-center py-8">
//             <Loader className="animate-spin text-blue-600 dark:text-blue-400" size={24} />
//             <span className="ml-3 text-gray-600 dark:text-gray-400">Loading role information...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Show error state if role is null/undefined
//   if (!role) {
//     return (
//       <div className="w-full p-4 sm:p-6">
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
//           <div className="text-center py-8">
//             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//               Role Not Found
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               The requested role could not be loaded.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full p-4 sm:p-6">
//       <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
//         <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
//           <div className="flex-1">
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//               {role.name || "Unnamed Role"}
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-2">
//               {role.description || "No description provided."}
//             </p>
//             <div className="flex flex-wrap items-center gap-3 mt-4">
//               <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                 role.status === "Active"
//                   ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
//                   : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
//               }`}>
//                 {role.status || "Unknown"}
//               </span>
//               <span className="text-sm text-gray-600 dark:text-gray-400">
//                 Created: {role.createdDate || "Unknown date"}
//               </span>
//               <span className="text-sm text-gray-600 dark:text-gray-400">
//                 {role.userCount || 0} users
//               </span>
//               {role.isSystem && (
//                 <span className="text-sm text-blue-600 dark:text-blue-400">
//                   System Role
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button 
//               onClick={() => router.push(`/company-admin/roles-permissions/edit/${role.id}`)}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
//             >
//               <Edit size={16} />
//               Edit Role
//             </button>
//             {!role.isSystem && (
//               <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
//                 <Trash2 size={16} />
//                 Delete Role
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoleHeader;

"use client";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Calendar, Users, LayoutGrid, Lock } from "lucide-react";

const RoleHeader = ({ role, loading = false }) => {
  const router = useRouter();

  if (loading || !role) return null; // Handled by parent skeleton

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        {role.isSystem ? <Lock size={120} /> : <LayoutGrid size={120} />}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        
        {/* Left: Role Info */}
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {role.displayName || role.name || "Unnamed Role"}
            </h1>
            {role.isSystem && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                System Role
              </span>
            )}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              role.status === "Active"
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
            }`}>
              {role.status || "Unknown"}
            </span>
          </div>

          <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-base leading-relaxed">
            {role.description || "No description provided for this role."}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 pt-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Created: <span className="font-medium text-gray-900 dark:text-gray-200">{role.createdDate}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Assigned: <span className="font-medium text-gray-900 dark:text-gray-200">{role.userCount || 0} Users</span></span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap gap-3">
          {!role.isSystem && (
            <>
              <button 
                onClick={() => router.push(`/company-admin/roles-permissions/edit/${role.id}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow"
              >
                <Edit size={16} />
                Edit Details
              </button>
              
              {role.userCount === 0 && (
                <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={16} />
                  Delete Role
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleHeader;