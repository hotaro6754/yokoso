// src/app/(dashboard)/company-admin/roles-permissions/components/RoleFilters.js (served via middleware rewrite)
// "use client";
// import { Search, Filter, X } from 'lucide-react';

// export default function RoleFilters({
//   globalFilter,
//   setGlobalFilter,
//   statusFilter,
//   setStatusFilter,
//   statuses,
//   onClearFilters,
// }) {
//   const hasActiveFilters = statusFilter !== 'all' || globalFilter;

//   return (
//     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//         {/* Search Input */}
//         <div className="relative flex-1 min-w-[250px]">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search roles..."
//             value={globalFilter}
//             onChange={(e) => setGlobalFilter(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//           />
//         </div>

//         {/* Status Filter */}
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2">
//             <Filter className="w-4 h-4 text-gray-400" />
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//             >
//               {statuses.map(status => (
//                 <option key={status} value={status}>
//                   {status === 'all' ? 'All Status' : status}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Clear Filters Button */}
//           {hasActiveFilters && (
//             <button
//               onClick={onClearFilters}
//               className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
//             >
//               <X className="w-4 h-4" />
//               Clear
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { Search, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleFilters({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  statuses,
  onClearFilters,
}) {
  const hasActiveFilters = statusFilter !== 'all' || globalFilter;

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-1 rounded-sm border border-gray-100 dark:border-gray-700 shadow-sm">

      {/* 1. Status Tabs (Pill Design) */}
      <div className="flex p-1 gap-1 bg-gray-50 dark:bg-gray-700/50 rounded-sm w-full lg:w-auto overflow-x-auto">
        {statuses.map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? 'text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-white dark:bg-gray-600 rounded-sm shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {status === 'all' ? 'All Roles' : status}
                {isActive && <Check size={12} className="opacity-50" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Search & Clear Actions */}
      <div className="flex items-center gap-3 w-full lg:w-auto px-2 pb-2 lg:pb-0 lg:pr-2">
        <div className="relative flex-1 lg:min-w-[300px] group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by role name or description..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-sm text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder:text-gray-400"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="p-2.5 rounded-sm text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all border border-transparent hover:border-red-100"
            title="Clear filters"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}