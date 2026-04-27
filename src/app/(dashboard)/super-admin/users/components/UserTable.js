// src/app/(dashboard)/company-admin/users/components/UserTable.js (served via middleware rewrite)
// "use client";
// import { useState, useMemo, useEffect } from 'react';
// import Link from 'next/link';
// import {
//   useReactTable,
//   getCoreRowModel,
//   getSortedRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   flexRender,
// } from '@tanstack/react-table';
// import { ChevronUp, ChevronDown, Edit, Trash2, User, Mail, Shield, Loader2, Key, Eye, UserCheck, UserX, UserCog } from 'lucide-react';
// import Pagination from '@/components/common/Pagination';
// import UserFilters from './UserFilters';
// import { userManagementService } from '@/services/userManagementService';
// import { toast } from 'sonner';
// import ConfirmationDialog from '@/components/common/ConfirmationDialog';

// export default function UserTable() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sorting, setSorting] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);
//   const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
//   const [userToDeactivate, setUserToDeactivate] = useState(null);
//   const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
//   const [userToAssignRole, setUserToAssignRole] = useState(null);
//   const [selectedRoleForAssign, setSelectedRoleForAssign] = useState('');

//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [totalItems, setTotalItems] = useState(0);
//   const [availableRoles, setAvailableRoles] = useState([]);
//   const [systemRoles, setSystemRoles] = useState([]);

//   // Fetch users and roles
//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       // Fetch users with filters
//       const params = {
//         page: pagination.pageIndex + 1,
//         limit: pagination.pageSize,
//         search: globalFilter,
//         status: statusFilter !== 'all' ? statusFilter.toUpperCase() : '',
//         role: roleFilter !== 'all' ? roleFilter : ''
//       };

//       const [usersResponse, companyRolesResponse, systemRolesResponse] = await Promise.all([
//         userManagementService.getAllUsers(params),
//         userManagementService.getCompanyRoles(),
//         userManagementService.getSystemRoles()
//       ]);

//       if (usersResponse.success) {
//         const transformedData = usersResponse.data.map(user => ({
//           id: user.id,
//           publicId: user.publicId,
//           name: user.employee
//             ? `${user.employee.firstName} ${user.employee.lastName}`
//             : user.email.split('@')[0],
//           email: user.email,
//           employeeId: user.employee?.employeeId || 'N/A',
//           systemRole: user.systemRole,
//           companyRole: user.companyRole?.displayName || 'No role assigned',
//           status: user.isActive ? 'Active' : 'Inactive',
//           createdAt: new Date(user.createdAt).toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric'
//           }),
//           isActive: user.isActive,
//           hasEmployee: !!user.employee,
//           employee: user.employee,
//           companyRoleId: user.companyRoleId
//         }));

//         setData(transformedData);
//         setTotalItems(usersResponse.pagination?.totalItems || transformedData.length);
//       }

//       if (companyRolesResponse.status || companyRolesResponse.success) {
//         setAvailableRoles(companyRolesResponse.data?.roles || companyRolesResponse.data || []);
//       }

//       if (systemRolesResponse.status || systemRolesResponse.success) {
//         setSystemRoles(systemRolesResponse.data || []);
//       }

//     } catch (error) {
//       console.error('Error fetching data:', error);
//       toast.error(error.message || 'Failed to fetch data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [pagination.pageIndex, pagination.pageSize, globalFilter, statusFilter, roleFilter]);

//   // Get unique roles for filter
//   const roleOptions = useMemo(() => {
//     const roles = ['all'];
//     const roleMap = {};

//     // Add system roles
//     systemRoles.forEach(role => {
//       const displayName = role.displayName || role.name;
//       if (displayName && !roleMap[displayName]) {
//         roleMap[displayName] = true;
//         roles.push(displayName);
//       }
//     });

//     // Add company roles
//     availableRoles.forEach(role => {
//       const displayName = role.displayName || role.name;
//       if (displayName && !roleMap[displayName]) {
//         roleMap[displayName] = true;
//         roles.push(displayName);
//       }
//     });

//     return roles;
//   }, [availableRoles, systemRoles]);

//   // Handle delete click
//   const handleDeleteClick = (user) => {
//     setUserToDelete(user);
//     setDeleteDialogOpen(true);
//   };

//   // Handle deactivate/activate click
//   const handleStatusClick = (user) => {
//     setUserToDeactivate(user);
//     setDeactivateDialogOpen(true);
//   };

//   const handleAssignRoleClick = (user) => {
//     setUserToAssignRole(user);
//     // Determine initial selected value
//     // Priority: Company Role -> System Role -> empty
//     if (user.companyRoleId) {
//       setSelectedRoleForAssign(`company:${user.companyRoleId}`);
//     } else if (user.systemRole) {
//       setSelectedRoleForAssign(`system:${user.systemRole}`);
//     } else {
//       setSelectedRoleForAssign('');
//     }
//     setAssignRoleDialogOpen(true);
//   };

//   // Handle delete confirmation
//   const handleDeleteConfirm = async () => {
//     if (userToDelete) {
//       try {
//         await userManagementService.deleteUser(userToDelete.id);
//         toast.success('User deleted successfully');
//         fetchData(); // Refresh the list
//       } catch (error) {
//         console.error('Error deleting user:', error);
//         toast.error(error.message || 'Failed to delete user');
//       } finally {
//         setDeleteDialogOpen(false);
//         setUserToDelete(null);
//       }
//     }
//   };

//   // Handle status change confirmation
//   const handleStatusConfirm = async () => {
//     if (userToDeactivate) {
//       try {
//         const newStatus = !userToDeactivate.isActive;
//         await userManagementService.changeUserStatus(userToDeactivate.id, newStatus);
//         toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
//         fetchData(); // Refresh the list
//       } catch (error) {
//         console.error('Error changing user status:', error);
//         toast.error(error.message || 'Failed to change user status');
//       } finally {
//         setDeactivateDialogOpen(false);
//         setUserToDeactivate(null);
//       }
//     }
//   };

//   // Handle validation and submission for Assign Role
//   const handleAssignRoleSubmit = async () => {
//     if (!userToAssignRole || !selectedRoleForAssign) {
//       toast.error("Please select a role");
//       return;
//     }

//     try {
//       const [type, roleValue] = selectedRoleForAssign.split(':');

//       if (type === 'system') {
//         // For system roles, update the user object
//         const payload = {
//           email: userToAssignRole.email,
//           systemRole: roleValue,
//           companyRoleId: userToAssignRole.companyRoleId || null,
//           employeeId: userToAssignRole.employee?.id || null, // Ensure ID is extracted
//           isActive: userToAssignRole.isActive
//         };

//         await userManagementService.updateUser(userToAssignRole.id, payload);
//       } else {
//         // For company roles, use Assign Role
//         await userManagementService.assignRoleToUser(userToAssignRole.id, {
//           companyRoleId: roleValue
//         });
//       }

//       toast.success("Role assigned successfully");
//       fetchData();
//     } catch (error) {
//       console.error("Error assigning role:", error);
//       toast.error(error.message || "Failed to assign role");
//     } finally {
//       setAssignRoleDialogOpen(false);
//       setUserToAssignRole(null);
//       setSelectedRoleForAssign('');
//     }
//   };

//   // Handle reset password
//   const handleResetPassword = async (user) => {
//     try {
//       const confirmReset = window.confirm(`Reset password for ${user.email}? A temporary password will be generated.`);
//       if (!confirmReset) return;

//       const response = await userManagementService.resetUserPassword(user.id);
//       if (response.success) {
//         toast.success('Password reset successful. Temporary password sent to user.');
//       }
//     } catch (error) {
//       console.error('Error resetting password:', error);
//       toast.error(error.message || 'Failed to reset password');
//     }
//   };

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: 'name',
//         header: 'User',
//         cell: info => (
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
//                 <User size={16} />
//               </div>
//             </div>
//             <div className="ml-3">
//               <Link
//                 href={`/company-admin/users/${info.row.original.id}`}
//                 className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block"
//               >
//                 {info.getValue()}
//               </Link>
//               {info.row.original.employeeId !== 'N/A' && (
//                 <span className="text-xs text-gray-500 dark:text-gray-400">
//                   Emp ID: {info.row.original.employeeId}
//                 </span>
//               )}
//             </div>
//           </div>
//         ),
//       },
//       {
//         accessorKey: 'email',
//         header: 'Email',
//         cell: info => (
//           <div className="flex items-center">
//             <Mail size={14} className="text-gray-400 mr-2" />
//             <span className="text-sm text-gray-700 dark:text-gray-300">{info.getValue()}</span>
//           </div>
//         ),
//       },

//       {
//         accessorKey: 'companyRole',
//         header: 'Assigned Role',
//         cell: info => {
//           const companyRole = info.row.original.companyRole;
//           const systemRole = info.row.original.systemRole;

//           let roleDisplay = 'No role assigned';
//           let isCompanyRole = false;

//           // Check for company role first (as it's more specific)
//           if (companyRole && companyRole !== 'No role assigned') {
//             roleDisplay = companyRole;
//             isCompanyRole = true;
//           } else if (systemRole) {
//             // Fallback to system role
//             roleDisplay = systemRole;
//           }

//           return roleDisplay !== 'No role assigned' ? (
//             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isCompanyRole
//                 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
//                 : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
//               }`}>
//               {roleDisplay}
//             </span>
//           ) : (
//             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
//               {roleDisplay}
//             </span>
//           );
//         },
//       },
//       {
//         accessorKey: 'status',
//         header: 'Status',
//         cell: info => {
//           const status = info.getValue();
//           const isActive = info.row.original.isActive;
//           return (
//             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
//               ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
//               : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
//               }`}>
//               {isActive ? <UserCheck size={12} className="mr-1" /> : <UserX size={12} className="mr-1" />}
//               {status}
//             </span>
//           );
//         },
//       },

//       {
//         id: 'actions',
//         header: 'Actions',
//         cell: info => {
//           const user = info.row.original;
//           const isCurrentUser = false;

//           return (
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => handleAssignRoleClick(user)}
//                 className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all duration-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 group relative"
//                 title="Assign Role"
//               >
//                 <UserCog className="w-4 h-4" />
//                 <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
//                   Assign Role
//                 </span>
//               </button>

//               <Link
//                 href={`/company-admin/users/${user.id}`}
//                 className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 group relative"
//                 title="View Details"
//               >
//                 <Eye className="w-4 h-4" />
//                 <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
//                   View
//                 </span>
//               </Link>

//               <button
//                 onClick={() => handleResetPassword(user)}
//                 className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-all duration-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50 group relative"
//                 title="Reset Password"
//               >
//                 <Key className="w-4 h-4" />
//                 <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
//                   Reset Password
//                 </span>
//               </button>

//               <button
//                 onClick={() => handleStatusClick(user)}
//                 className={`p-1.5 rounded-lg transition-all duration-200 group relative ${user.isActive
//                   ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
//                   : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
//                   }`}
//                 title={user.isActive ? 'Deactivate User' : 'Activate User'}
//                 disabled={isCurrentUser}
//               >
//                 {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
//                 <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
//                   {user.isActive ? 'Deactivate' : 'Activate'}
//                 </span>
//               </button>

//               {!isCurrentUser && (
//                 <button
//                   onClick={() => handleDeleteClick(user)}
//                   className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 group relative"
//                   title="Delete User"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
//                     Delete
//                   </span>
//                 </button>
//               )}
//             </div>
//           );
//         },
//         enableSorting: false,
//       },
//     ],
//     []
//   );

//   // Clear all filters
//   const clearFilters = () => {
//     setStatusFilter('all');
//     setRoleFilter('all');
//     setGlobalFilter('');
//   };

//   const table = useReactTable({
//     data,
//     columns,
//     state: {
//       sorting,
//       globalFilter,
//       pagination,
//     },
//     onSortingChange: setSorting,
//     onGlobalFilterChange: setGlobalFilter,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     pageCount: Math.ceil(totalItems / pagination.pageSize),
//     manualPagination: true,
//   });

//   return (
//     <div className="p-4 sm:p-6">
//       {loading && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
//         </div>
//       )}

//       {/* Filters Section */}
//       <div className="mb-6">
//         <UserFilters
//           globalFilter={globalFilter}
//           setGlobalFilter={setGlobalFilter}
//           statusFilter={statusFilter}
//           setStatusFilter={setStatusFilter}
//           roleFilter={roleFilter}
//           setRoleFilter={setRoleFilter}
//           statuses={['all', 'Active', 'Inactive']}
//           roles={roleOptions}
//           onClearFilters={clearFilters}
//         />
//       </div>

//       {/* Results Count */}
//       <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
//         Showing {data.length} of {totalItems} users
//         {(statusFilter !== 'all' || roleFilter !== 'all' || globalFilter) && (
//           <span> (filtered)</span>
//         )}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
//         <div className="min-w-[1000px] md:min-w-full">
//           <table className="w-full">
//             <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
//               {table.getHeaderGroups().map(headerGroup => (
//                 <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
//                   {headerGroup.headers.map(header => (
//                     <th
//                       key={header.id}
//                       className="px-3 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300"
//                       {...(header.column.getCanSort() ? {
//                         onClick: header.column.getToggleSortingHandler(),
//                         className: "px-3 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150"
//                       } : {})}
//                     >
//                       <div className="flex items-center">
//                         {flexRender(header.column.columnDef.header, header.getContext())}
//                         {header.column.getCanSort() && (
//                           <>
//                             {{
//                               asc: <ChevronUp className="ml-1 w-4 h-4 text-blue-500" />,
//                               desc: <ChevronDown className="ml-1 w-4 h-4 text-blue-500" />,
//                             }[header.column.getIsSorted()] ?? (
//                                 <div className="ml-1 flex flex-col">
//                                   <ChevronUp className="w-3 h-3 -mb-0.5 text-gray-400" />
//                                   <ChevronDown className="w-3 h-3 -mt-0.5 text-gray-400" />
//                                 </div>
//                               )}
//                           </>
//                         )}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {table.getRowModel().rows.length > 0 ? (
//                 table.getRowModel().rows.map(row => (
//                   <tr
//                     key={row.id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
//                   >
//                     {row.getVisibleCells().map(cell => (
//                       <td key={cell.id} className="px-3 py-4 whitespace-nowrap">
//                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
//                     <div className="flex flex-col items-center justify-center py-8">
//                       <div className="text-gray-400 dark:text-gray-500 mb-4">
//                         <User className="w-16 h-16 mx-auto" />
//                       </div>
//                       <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
//                         {loading ? 'Loading users...' : 'No users found'}
//                       </h3>
//                       <p className="text-gray-500 dark:text-gray-500">
//                         {loading ? 'Please wait while we fetch users' : 'Try adjusting your search criteria'}
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       <Pagination
//         currentPage={table.getState().pagination.pageIndex + 1}
//         totalItems={totalItems}
//         itemsPerPage={table.getState().pagination.pageSize}
//         onPageChange={(page) => table.setPageIndex(page - 1)}
//         onItemsPerPageChange={(size) => {
//           table.setPageSize(size);
//           table.setPageIndex(0);
//         }}
//         className="mt-6"
//       />

//       {/* Assign Role Dialog */}
//       {assignRoleDialogOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
//             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
//               Assign Role to {userToAssignRole?.name}
//             </h3>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Select Role
//               </label>
//               <select
//                 value={selectedRoleForAssign}
//                 onChange={(e) => setSelectedRoleForAssign(e.target.value)}
//                 className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
//               >
//                 <option value="">Select a role...</option>
//                 <optgroup label="System Roles">
//                   {systemRoles.map(role => (
//                     <option key={`system-${role.name}`} value={`system:${role.name}`}>
//                       {role.displayName || role.name}
//                     </option>
//                   ))}
//                 </optgroup>
//                 <optgroup label="Company Roles">
//                   {availableRoles.map(role => (
//                     <option key={`company-${role.id}`} value={`company:${role.id}`}>
//                       {role.displayName || role.name}
//                     </option>
//                   ))}
//                 </optgroup>
//               </select>
//             </div>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setAssignRoleDialogOpen(false)}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAssignRoleSubmit}
//                 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
//               >
//                 Assign Role
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Confirmation Dialogs */}
//       <ConfirmationDialog
//         isOpen={deleteDialogOpen}
//         onClose={() => setDeleteDialogOpen(false)}
//         onConfirm={handleDeleteConfirm}
//         title="Delete User"
//         message={`Are you sure you want to delete "${userToDelete?.name || userToDelete?.email}"? This action cannot be undone.`}
//         confirmText="Delete User"
//         cancelText="Cancel"
//         isDestructive={true}
//       />

//       <ConfirmationDialog
//         isOpen={deactivateDialogOpen}
//         onClose={() => setDeactivateDialogOpen(false)}
//         onConfirm={handleStatusConfirm}
//         title={userToDeactivate?.isActive ? 'Deactivate User' : 'Activate User'}
//         message={`Are you sure you want to ${userToDeactivate?.isActive ? 'deactivate' : 'activate'} "${userToDeactivate?.name || userToDeactivate?.email}"?`}
//         confirmText={userToDeactivate?.isActive ? 'Deactivate' : 'Activate'}
//         cancelText="Cancel"
//         isDestructive={userToDeactivate?.isActive}
//       />
//     </div>
//   );
// }

"use client";
import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { CalendarDays, ChevronDown, ChevronUp, Eye, Key, Loader2, Mail, Phone, Search, Shield, Trash2, User, UserCheck, UserCog, UserPlus, UserX, Users } from 'lucide-react';
import ActionDropdown from '@/app/(dashboard)/master-admin/components/ActionDropdown';
import Pagination from '@/components/common/Pagination';
import { userManagementService } from '@/services/userManagementService';
import { toast } from 'sonner';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB').split('/').join('-');
}

function isWithinLastDays(dateString, days) {
  if (!dateString) return false;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return false;
  const ms = days * 24 * 60 * 60 * 1000;
  return Date.now() - d.getTime() <= ms;
}

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    blue: 'bg-primary-50 text-primary-700 border-primary-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const cls = colorMap[color] || colorMap.blue;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white leading-none">
            {value}
          </div>
        </div>
        <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${cls}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function UserTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  // Debounce search to avoid UI blinking (re-fetch + full overlay on every keypress)
  const [searchInput, setSearchInput] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('last30'); // UI-only sort

  // Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [userToAssignRole, setUserToAssignRole] = useState(null);
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState('');
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [systemRoles, setSystemRoles] = useState([]);

  // Fetch Logic (Preserved) - Memoized with useCallback to prevent stale closures
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter,
        status: statusFilter !== 'all' ? statusFilter.toUpperCase() : '',
        // Role filter removed from UI for Company Admin
        role: ''
      };

      console.log('fetching users', params);

      const [usersResponse, companyRolesResponse, systemRolesResponse] = await Promise.all([
        userManagementService.getAllUsers(params),
        userManagementService.getCompanyRoles(),
        userManagementService.getSystemRoles()
      ]);

      if (usersResponse.success) {
        const transformedData = usersResponse.data.map(user => ({
          id: user.id,
          publicId: user.publicId,
          name: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email.split('@')[0],
          email: user.email,
          employeeId: user.employee?.employeeId || 'N/A',
          systemRole: user.systemRole,
          companyRole: user.companyRole?.displayName || 'No role assigned',
          status: user.isActive ? 'Active' : 'Inactive',
          createdAt: formatDate(user.createdAt),
          createdAtRaw: user.createdAt,
          isActive: user.isActive,
          hasEmployee: !!user.employee,
          employee: user.employee,
          companyRoleId: user.companyRoleId,
          phone: user.employee?.phone || '',
          designation: user.employee?.designation?.name || '—',
          employmentStatus: user.employee?.employmentStatus || user.employee?.status || '—',
          joiningDate: user.employee?.joiningDate || user.createdAt,
        }));
        setRows(transformedData);
        setTotalItems(usersResponse.pagination?.totalItems || transformedData.length);
      }

      if (companyRolesResponse.status || companyRolesResponse.success) {
        setAvailableRoles(companyRolesResponse.data?.roles || companyRolesResponse.data || []);
      }
      if (systemRolesResponse.status || systemRolesResponse.success) {
        setSystemRoles(systemRolesResponse.data || []);
      }
    } catch (error) {
      // Avoid Next.js dev overlay; show a helpful UI message instead.
      console.warn('User list fetch failed:', error);
      if (error?.status === 403) {
        toast.error('Access denied (403). Your token/role does not have permission to call get-all-users.');
      } else if (error?.status === 401) {
        toast.error('Unauthorized (401). Please login again.');
      } else {
        toast.error(error.message || 'Failed to fetch users.');
      }
      // No static/demo data fallback. Keep UI and show empty state.
      setRows([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, statusFilter]);

  // Debounce search input -> globalFilter (used by API + table state)
  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchInput.trim();
      setGlobalFilter(next);
      setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteClick = (user) => { setUserToDelete(user); setDeleteDialogOpen(true); };
  const handleStatusClick = (user) => { setUserToDeactivate(user); setDeactivateDialogOpen(true); };
  const handleAssignRoleClick = (user) => {
    setUserToAssignRole(user);
    if (user.companyRoleId) setSelectedRoleForAssign(`company:${user.companyRoleId}`);
    else if (user.systemRole) setSelectedRoleForAssign(`system:${user.systemRole}`);
    else setSelectedRoleForAssign('');
    setAssignRoleDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await userManagementService.deleteUser(userToDelete.id);
        toast.success('User deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.message || 'Failed to delete user');
      } finally {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    }
  };

  const handleStatusConfirm = async () => {
    if (userToDeactivate) {
      try {
        const newStatus = !userToDeactivate.isActive;
        const statusString = newStatus ? 'ACTIVE' : 'INACTIVE';
        await userManagementService.changeUserStatus(userToDeactivate.id, statusString);
        toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
        fetchData();
      } catch (error) {
        toast.error(error.message || 'Failed to change status');
      } finally {
        setDeactivateDialogOpen(false);
        setUserToDeactivate(null);
      }
    }
  };

  const handleAssignRoleSubmit = async () => {
    if (!userToAssignRole || !selectedRoleForAssign) { toast.error("Please select a role"); return; }
    try {
      const [type, roleValue] = selectedRoleForAssign.split(':');
      if (type === 'system') {
        const payload = {
          email: userToAssignRole.email,
          systemRole: roleValue,
          companyRoleId: userToAssignRole.companyRoleId || null,
          employeeId: userToAssignRole.employeeId !== 'N/A' ? userToAssignRole.employee?.id : null,
          isActive: userToAssignRole.isActive
        };
        await userManagementService.updateUser(userToAssignRole.id, payload);
      } else {
        await userManagementService.assignRoleToUser(userToAssignRole.id, { companyRoleId: roleValue });
      }
      toast.success("Role assigned successfully");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to assign role");
    } finally {
      setAssignRoleDialogOpen(false);
      setUserToAssignRole(null);
      setSelectedRoleForAssign('');
    }
  };

  const designationOptions = useMemo(() => {
    const s = new Set();
    rows.forEach((r) => {
      const v = (r.designation || '').trim();
      if (v && v !== '—') s.add(v);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {

    const next = rows.filter((r) => {
      const desOk = designationFilter === 'all' || (r.designation || '') === designationFilter;
      if (!desOk) return false;
      const d = new Date(r.joiningDate || r.createdAtRaw || '');
      if (Number.isNaN(d.getTime())) return false;
      return true;
    });

    // UI-only sort (keeps server-side pagination untouched; for demo mode / small datasets)
    const sorted = [...next].sort((a, b) => {
      if (sortBy === 'az') return String(a.name || '').localeCompare(String(b.name || ''));
      if (sortBy === 'za') return String(b.name || '').localeCompare(String(a.name || ''));
      if (sortBy === 'newest') return new Date(b.joiningDate || b.createdAtRaw || 0) - new Date(a.joiningDate || a.createdAtRaw || 0);
      if (sortBy === 'oldest') return new Date(a.joiningDate || a.createdAtRaw || 0) - new Date(b.joiningDate || b.createdAtRaw || 0);
      // last7 / last30 are more like "focus" sorts by recency
      if (sortBy === 'last7' || sortBy === 'last30') {
        return new Date(b.joiningDate || b.createdAtRaw || 0) - new Date(a.joiningDate || a.createdAtRaw || 0);
      }
      return 0;
    });

    return sorted;
  }, [rows, designationFilter, sortBy]);

  const stats = useMemo(() => {
    const active = rows.filter((r) => r.isActive).length;
    const inactive = rows.filter((r) => !r.isActive).length;
    const newJoiners = rows.filter((r) => isWithinLastDays(r.joiningDate || r.createdAtRaw, 30)).length;
    return {
      total: totalItems || rows.length,
      active,
      inactive,
      newJoiners,
    };
  }, [rows, totalItems]);

  const handleResetPasswordClick = (user) => {
    setUserToResetPassword(user);
    setResetPasswordDialogOpen(true);
  };

  const handleResetPasswordConfirm = async () => {
    if (!userToResetPassword) return;
    try {
      const response = await userManagementService.resetUserPassword(userToResetPassword.id);
      if (response.success) toast.success('Password reset successful.');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setResetPasswordDialogOpen(false);
      setUserToResetPassword(null);
    }
  };

  // --- UI Columns ---
  const columns = useMemo(() => [
    {
      accessorKey: 'employeeId',
      header: 'Emp ID',
      cell: info => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {info.getValue() !== 'N/A' ? info.getValue() : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: info => (
        <div>
          <Link
            href={`/company-admin/users/${info.row.original.id}`}
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {info.getValue()}
          </Link>
          <div className="text-xs text-gray-500">{info.row.original.designation || '—'}</div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: info => {
        const r = info.row.original;
        const companyRole = r.companyRole;
        const systemRole = r.systemRole;
        let roleDisplay = 'No Role';
        let isSystem = false;

        if (companyRole && companyRole !== 'No role assigned') {
          roleDisplay = companyRole;
        } else if (systemRole) {
          roleDisplay = systemRole;
          isSystem = true;
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${isSystem
            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
            : roleDisplay !== 'No Role'
              ? 'bg-secondary-50 text-secondary-700 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-300 dark:border-secondary-800'
              : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
            }`}>
            {isSystem ? <Shield size={10} /> : <User size={10} />}
            {roleDisplay}
          </span>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: info => (
        <span className="text-sm text-gray-700 dark:text-gray-300 break-words">{info.getValue() || '—'}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: info => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{info.getValue() || '—'}</span>
      ),
    },
    {
      accessorKey: 'designation',
      header: 'Designation',
      cell: info => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{info.getValue() || '—'}</span>
      ),
    },
    {
      accessorKey: 'employmentStatus',
      header: 'Employment Status',
      cell: info => {
        const status = info.getValue();
        const statusMap = {
          ACTIVE: { label: 'Active', style: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400' },
          PROBATION: { label: 'Probation', style: 'bg-brand-50 text-brand-700 ring-1 ring-brand-600/20 dark:bg-brand-900/20 dark:text-brand-400' },
          NOTICE_PERIOD: { label: 'Notice Period', style: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400' },
          RESIGNED: { label: 'Resigned', style: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20 dark:bg-orange-900/20 dark:text-orange-400' },
          TERMINATED: { label: 'Terminated', style: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-900/20 dark:text-rose-400' },
          SUSPENDED: { label: 'Suspended', style: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-900/20 dark:text-rose-400' },
          RETIRED: { label: 'Retired', style: 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20 dark:bg-slate-900/20 dark:text-slate-400' }
        };
        const statusInfo = statusMap[status] || { label: status || '—', style: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300' };

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.style}`}>
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      accessorKey: 'joiningDate',
      header: 'Joining Date',
      cell: info => (
        <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {formatDate(info.getValue())}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const isActive = info.row.original.isActive;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400'
            : 'bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400'
            }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const user = info.row.original;
        return (
          <div className="flex items-center justify-end">
            <ActionDropdown
              customActions={[
                {
                  label: 'Assign Role',
                  icon: UserCog,
                  onClick: () => handleAssignRoleClick(user),
                  className: 'text-gray-700 dark:text-gray-200',
                  iconClassName: 'text-primary-600 dark:text-primary-400',
                },
                {
                  label: 'View Details',
                  icon: Eye,
                  href: `/company-admin/users/${user.id}`,
                  className: 'text-gray-700 dark:text-gray-200',
                  iconClassName: 'text-primary-600 dark:text-primary-400',
                },
                {
                  label: 'Reset Password',
                  icon: Key,
                  onClick: () => handleResetPasswordClick(user),
                  className: 'text-gray-700 dark:text-gray-200',
                  iconClassName: 'text-amber-600 dark:text-amber-400',
                },
                {
                  label: user.isActive ? 'Deactivate' : 'Activate',
                  icon: user.isActive ? UserX : UserCheck,
                  onClick: () => handleStatusClick(user),
                  className: user.isActive
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-emerald-700 dark:text-emerald-300',
                  iconClassName: user.isActive
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400',
                  hoverClassName: user.isActive
                    ? 'hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                },
                {
                  label: 'Delete Permanently',
                  icon: Trash2,
                  onClick: () => handleDeleteClick(user),
                  className: 'text-red-700 dark:text-red-300',
                  iconClassName: 'text-red-600 dark:text-red-400',
                  hoverClassName: 'hover:bg-red-50 dark:hover:bg-red-900/20',
                },
              ]}
            />
          </div>
        );
      },
      enableSorting: false,
    },
  ], []);

  const clearFilters = () => {
    setStatusFilter('all');
    setDesignationFilter('all');
    setSortBy('last30');
    setSearchInput('');
    setGlobalFilter('');
  };

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(totalItems / pagination.pageSize), manualPagination: true,
  });

  const colVis = {
    role: 'hidden lg:table-cell',
    email: 'hidden md:table-cell',
    phone: 'hidden lg:table-cell',
    designation: 'hidden md:table-cell',
    employmentStatus: 'hidden md:table-cell',
    joiningDate: 'hidden xl:table-cell',
  };
  const thClass = (colId) =>
    `px-6 py-4 text-left text-xs font-semibold text-secondary-900 dark:text-secondary-100 uppercase tracking-wider ${colVis[colId] || ''}`;
  const tdClass = (colId) => `px-6 py-4 ${colVis[colId] || ''}`;

  return (
    <div className="space-y-6">
      {/* Don't use full-screen overlay loader (causes blinking while typing). */}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={stats.total} color="blue" />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Active" value={stats.active} color="emerald" />
        <StatCard icon={<UserX className="h-5 w-5" />} label="Inactive" value={stats.inactive} color="rose" />
        <StatCard icon={<UserPlus className="h-5 w-5" />} label="New Joiners" value={stats.newJoiners} color="amber" />
      </div>

      {/* Filters bar (SmartHR style) */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        {/* Avoid clipped controls: stack on <= xl, single row only on very wide screens */}
        <div className="w-full">
          {/* Left controls */}
          <div className="flex flex-row items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {/* Search (before status) */}
            <div className="relative w-full lg:w-[340px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email or employee ID."
                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
              {loading ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              ) : null}
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Designation */}
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Designation</option>
              {designationOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="last7">Sort By: Last 7 Days</option>
              <option value="last30">Sort By: Last 30 Days</option>
              <option value="newest">Sort By: Newest</option>
              <option value="oldest">Sort By: Oldest</option>
              <option value="az">Sort By: A → Z</option>
              <option value="za">Sort By: Z → A</option>
            </select>

            <button
              onClick={clearFilters}
              className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full">
            {/* Company Admin primary color with opacity */}
            <thead className="bg-secondary-50 dark:bg-secondary-900/20">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className={thClass(header.column.id)}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={tdClass(cell.column.id)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 dark:text-white font-medium">No users found</h3>
                      <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/30">
          <Pagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalItems={totalItems}
            itemsPerPage={table.getState().pagination.pageSize}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            onItemsPerPageChange={(size) => { table.setPageSize(size); table.setPageIndex(0); }}
          />
        </div>
      </div>

      {/* Assign Role Modal */}
      {assignRoleDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Assign Role</h3>
            <p className="text-sm text-gray-500 mb-6">Select a role to assign to {userToAssignRole?.name}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role Type</label>
              <select
                value={selectedRoleForAssign}
                onChange={(e) => setSelectedRoleForAssign(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Select a role...</option>
                <optgroup label="System Roles">
                  {systemRoles.map(role => (
                    <option key={`system-${role.name}`} value={`system:${role.name}`}>
                      {role.displayName || role.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Company Roles">
                  {availableRoles.map(role => (
                    <option key={`company-${role.id}`} value={`company:${role.id}`}>
                      {role.displayName || role.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAssignRoleDialogOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRoleSubmit}
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-lg shadow-primary-600/20"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reused Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message={`This will permanently remove access for "${userToDelete?.name}". Are you sure?`}
        confirmText="Yes, Delete User"
        isDestructive={true}
      />

      <ConfirmationDialog
        isOpen={deactivateDialogOpen}
        onClose={() => setDeactivateDialogOpen(false)}
        onConfirm={handleStatusConfirm}
        title={userToDeactivate?.isActive ? 'Deactivate Access' : 'Reactivate Access'}
        message={`Are you sure you want to ${userToDeactivate?.isActive ? 'revoke' : 'restore'} access for "${userToDeactivate?.name}"?`}
        confirmText={userToDeactivate?.isActive ? 'Deactivate' : 'Activate'}
        isDestructive={userToDeactivate?.isActive}
      />

      <ConfirmationDialog
        isOpen={resetPasswordDialogOpen}
        onClose={() => {
          setResetPasswordDialogOpen(false);
          setUserToResetPassword(null);
        }}
        onConfirm={handleResetPasswordConfirm}
        title="Reset User Password"
        message={`Reset password for "${userToResetPassword?.email}"? A reset email will be sent to this user.`}
        confirmText="Yes, Reset Password"
        cancelText="Cancel"
      />
    </div>
  );
}
