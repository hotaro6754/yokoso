// src/app/(dashboard)/company-admin/users/components/UserFilters.js (served via middleware rewrite)
// "use client";
// import { useState } from 'react';
// import { Search, Filter, X, ChevronDown, ChevronUp, User, Shield } from 'lucide-react';

// const UserFilters = ({
//   globalFilter,
//   setGlobalFilter,
//   statusFilter,
//   setStatusFilter,
//   roleFilter,
//   setRoleFilter,
//   statuses,
//   roles,
//   onClearFilters
// }) => {
//   const [isFiltersOpen, setIsFiltersOpen] = useState(false);

//   const hasActiveFilters = statusFilter !== 'all' ||
//     roleFilter !== 'all' ||
//     globalFilter;

//   return (
//     <div className="space-y-4">
//       {/* Search Bar - Always visible */}
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//         <input
//           placeholder="Search users by name, email, employee ID..."
//           value={globalFilter}
//           onChange={e => setGlobalFilter(e.target.value)}
//           className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//         />
//       </div>

//       {/* Filters Toggle for Mobile */}
//       <div className="md:hidden">
//         <button
//           onClick={() => setIsFiltersOpen(!isFiltersOpen)}
//           className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
//         >
//           <span className="flex items-center gap-2">
//             <Filter className="w-4 h-4" />
//             Filters {hasActiveFilters && '(Active)'}
//           </span>
//           {isFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//         </button>
//       </div>

//       {/* Filters Container */}
//       <div className={`${isFiltersOpen ? 'block' : 'hidden'} md:block`}>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
//           {/* Status Filter */}
//           <div className="space-y-1">
//             <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
//               <User className="w-3 h-3 mr-1" /> Status
//             </label>
//             <div className="relative">
//               <select
//                 value={statusFilter}
//                 onChange={e => setStatusFilter(e.target.value)}
//                 className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
//               >
//                 <option value="all">All Status</option>
//                 {statuses.filter(s => s !== 'all').map(status => (
//                   <option key={status} value={status}>{status}</option>
//                 ))}
//               </select>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                 <Filter className="w-4 h-4 text-gray-400" />
//               </div>
//             </div>
//           </div>

//           {/* Role Filter */}
//           <div className="space-y-1">
//             <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
//               <Shield className="w-3 h-3 mr-1" /> Role
//             </label>
//             <div className="relative">
//               <select
//                 value={roleFilter}
//                 onChange={e => setRoleFilter(e.target.value)}
//                 className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
//               >
//                 <option value="all">All Roles</option>
//                 {roles.filter(r => r !== 'all').map(role => (
//                   <option key={role} value={role}>{role}</option>
//                 ))}
//               </select>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                 <Filter className="w-4 h-4 text-gray-400" />
//               </div>
//             </div>
//           </div>

//           {/* Clear Filters Button */}
//           <div className="flex items-end">
//             <button
//               onClick={onClearFilters}
//               disabled={!hasActiveFilters}
//               className="w-full px-4 py-2 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 dark:text-gray-400 dark:hover:text-gray-200 disabled:dark:text-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
//             >
//               <X className="w-4 h-4" />
//               Clear Filters
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Active Filters Badges */}
//       {hasActiveFilters && (
//         <div className="flex flex-wrap gap-2">
//           {globalFilter && (
//             <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900/30 dark:text-blue-400">
//               Search: "{globalFilter}"
//               <button onClick={() => setGlobalFilter('')} className="ml-1">
//                 <X className="w-3 h-3" />
//               </button>
//             </span>
//           )}
//           {statusFilter !== 'all' && (
//             <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-400">
//               Status: {statusFilter}
//               <button onClick={() => setStatusFilter('all')} className="ml-1">
//                 <X className="w-3 h-3" />
//               </button>
//             </span>
//           )}
//           {roleFilter !== 'all' && (
//             <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full dark:bg-purple-900/30 dark:text-purple-400">
//               Role: {roleFilter}
//               <button onClick={() => setRoleFilter('all')} className="ml-1">
//                 <X className="w-3 h-3" />
//               </button>
//             </span>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserFilters;

"use client";
import { Search, X, Check, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserFilters({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  statuses,
  roles,
  onClearFilters,
}) {
  const hasActiveFilters = statusFilter !== 'all' || roleFilter !== 'all' || globalFilter;

  return (
    <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      
      {/* 1. Filter Chips Group */}
      <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto p-1">
        {/* Status Filter */}
        <div className="flex bg-gray-50 dark:bg-gray-700/50 rounded-xl p-1 gap-1">
           {statuses.map((status) => {
             const isActive = statusFilter === status;
             return (
               <button
                 key={status}
                 onClick={() => setStatusFilter(status)}
                 className={`
                   relative px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                   ${isActive 
                     ? 'text-gray-900 dark:text-white shadow-sm' 
                     : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                 `}
               >
                 {isActive && (
                   <motion.div
                     layoutId="statusFilter"
                     className="absolute inset-0 bg-white dark:bg-gray-600 rounded-lg shadow-sm"
                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                   />
                 )}
                 <span className="relative z-10 flex items-center gap-1.5 capitalize">
                   {status === 'all' ? 'All Status' : status}
                 </span>
               </button>
             );
           })}
        </div>

        {/* Role Filter (Dropdown style for many roles) */}
        <div className="relative">
           <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
           >
              <option value="all">All Roles</option>
              {roles.filter(r => r !== 'all').map(role => (
                 <option key={role} value={role}>{role}</option>
              ))}
           </select>
           <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* 2. Search & Clear */}
      <div className="flex items-center gap-2 w-full xl:w-auto px-1 pb-1 xl:pb-0">
        <div className="relative flex-1 xl:min-w-[300px] group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email or employee ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder:text-gray-400"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="p-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
            title="Clear filters"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}