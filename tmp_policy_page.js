// src/app/(dashboard)/company-admin/policy-rule/page.js (served via middleware rewrite)
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useFormik } from 'formik';
// import toast, { Toaster } from 'react-hot-toast';
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   MapPin,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   Filter,
//   FileJson,
// } from 'lucide-react';
// import {
//   Dialog,
//   DialogPanel,
//   DialogTitle,
//   Transition,
//   TransitionChild
// } from '@headlessui/react';
// import Select from 'react-select';
// import React from 'react';

// import { policyRuleService } from '@/services/super-admin-services/policy-rule.service';
// import { companyOrganizationService } from '@/services/super-admin-services/companyOrganization.service';
// import Breadcrumb from '@/components/common/Breadcrumb';

// // Modal Component for Assignment Only
// const Modal = ({ isOpen, onClose, title, children }) => {
//   return (
//     <Transition show={isOpen} as={React.Fragment}>
//       <Dialog as="div" className="relative z-50" onClose={onClose}>
//         <TransitionChild
//           as={React.Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/25 bg-opacity-75 transition-opacity" />
//         </TransitionChild>

//         <div className="fixed inset-0 z-10 overflow-y-auto">
//           <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//             <TransitionChild
//               as={React.Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//               enterTo="opacity-100 translate-y-0 sm:scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 translate-y-0 sm:scale-100"
//               leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//             >
//               <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
//                 <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
//                   <div className="sm:flex sm:items-start">
//                     <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
//                       <DialogTitle
//                         as="h3"
//                         className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4"
//                       >
//                         {title}
//                       </DialogTitle>
//                       <div className="mt-2 text-sm">{children}</div>
//                     </div>
//                   </div>
//                 </div>
//               </DialogPanel>
//             </TransitionChild>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };

// export default function PolicyRulePage() {
//   const router = useRouter(); // For navigation to Add/Edit pages
//   const [policies, setPolicies] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [params, setParams] = useState({ page: 1, limit: 10, type: '' });
//   const [totalDocs, setTotalDocs] = useState(0);

//   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
//   const [selectedPolicy, setSelectedPolicy] = useState(null);

//   // Fetch Policies
//   const fetchPolicies = async () => {
//     setLoading(true);
//     try {
//       const response = await policyRuleService.getPolicies(params);
//       if (response?.data?.policies) {
//         setPolicies(response.data.policies);
//         setTotalDocs(response.data.pagination?.total || 0);
//       } else {
//         setPolicies(response.docs || response.policies || []);
//         setTotalDocs(response.totalDocs || response.total || 0);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to fetch policies');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch Locations (for Assingment)
//   const fetchLocations = async () => {
//     try {
//       const response = await companyOrganizationService.getLocations();
//       const locs = Array.isArray(response) ? response : (response.docs || []);
//       setLocations(locs.map(l => ({ value: l.id, label: l.name })));
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to fetch locations');
//     }
//   };

//   useEffect(() => {
//     fetchPolicies();
//   }, [params]);

//   useEffect(() => {
//     fetchLocations();
//   }, []);

//   // Formik for Assign
//   const assignFormik = useFormik({
//     initialValues: {
//       locationIds: [], // array of objects {value, label}
//     },
//     onSubmit: async (values) => {
//       try {
//         const payload = {
//           policyId: selectedPolicy.id,
//           locationIds: values.locationIds.map((l) => l.value),
//         };
//         await policyRuleService.assignPolicy(payload);
//         toast.success('Policy assigned successfully');
//         setIsAssignModalOpen(false);
//       } catch (error) {
//         toast.error('Failed to assign policy');
//       }
//     },
//   });

//   // Navigate to Create Page
//   const handleCreate = () => {
//     router.push('/company-admin/policy-rule/add');
//   };

//   // Navigate to Edit Page
//   const handleEdit = (policy) => {
//     router.push(`/company-admin/policy-rule/edit/${policy.id}`);
//   };

//   const handleDelete = async (id) => {
//     if (confirm('Are you sure you want to delete this policy?')) {
//       try {
//         await policyRuleService.deletePolicy(id);
//         toast.success('Policy deleted successfully');
//         fetchPolicies();
//       } catch (error) {
//         toast.error('Failed to delete policy');
//       }
//     }
//   };

//   const handleAssignClick = (policy) => {
//     setSelectedPolicy(policy);
//     assignFormik.resetForm();
//     setIsAssignModalOpen(true);
//   };

//   return (
//     <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans">
//       <Toaster position="top-right" />
//       <Breadcrumb pageName="Policy & Rule Engine" />

//       {/* Header & Controls */}
//       <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row shadow-sm p-4 bg-white rounded-lg border border-gray-100">
//         <div className="relative w-full sm:w-72">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search policies..."
//               className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
//           <div className="flex items-center gap-2">
//             <Filter className="h-4 w-4 text-gray-500" />
//             <select
//               className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
//               value={params.type}
//               onChange={(e) => setParams({ ...params, type: e.target.value, page: 1 })}
//             >
//               <option value="">All Types</option>
//               <option value="ATTENDANCE">Attendance</option>
//               <option value="LEAVE">Leave</option>
//               <option value="PAYROLL">Payroll</option>
//               <option value="EXPENSE">Expense</option>
//             </select>
//           </div>
//           <button
//             onClick={handleCreate}
//             className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
//           >
//             <Plus className="h-4 w-4" />
//             Create Policy
//           </button>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex h-64 items-center justify-center">
//             <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
//           </div>
//         ) : policies.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20 text-gray-500">
//             <FileJson className="h-16 w-16 text-gray-300 mb-4" />
//             <p className="text-lg font-medium">No policies found</p>
//             <p className="text-sm">Create a new policy to get started</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm text-gray-500">
//               <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold tracking-wider border-b border-gray-100">
//                 <tr>
//                   <th className="px-6 py-4">Name</th>
//                   <th className="px-6 py-4">Type</th>
//                   <th className="px-6 py-4">Summary</th>
//                   <th className="px-6 py-4">Version</th>
//                   <th className="px-6 py-4">Status</th>
//                   <th className="px-6 py-4 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {policies.map((policy) => (
//                   <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4">
//                       <div className="font-medium text-gray-900">{policy.name}</div>
//                       <div className="text-xs text-gray-400 mt-0.5 max-w-xs">{policy.description}</div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
//                         {policy.type}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex flex-col gap-1 text-xs text-gray-500">
//                         {policy.type === 'ATTENDANCE' && (
//                           <>
//                             <span>Shift: {policy.shiftStart || (policy.rules && policy.rules.shiftStart)} - {policy.shiftEnd || (policy.rules && policy.rules.shiftEnd)}</span>
//                             <span>Grace: {policy.gracePeriodMinutes || (policy.rules && policy.rules.gracePeriodMinutes) || 0}m</span>
//                           </>
//                         )}
//                         {policy.type === 'LEAVE' && (
//                           <>
//                             <span>Annual: {policy.annualLeaveCount || (policy.rules && policy.rules.annualLeaveCount)} days</span>
//                             <span>Sick: {policy.sickLeaveCount || (policy.rules && policy.rules.sickLeaveCount)} days</span>
//                           </>
//                         )}
//                         {policy.type === 'PAYROLL' && (
//                           <>
//                             <span>Cycle: {policy.salaryCycleStartDay || (policy.rules && policy.rules.salaryCycleStartDay)}-{policy.salaryCycleEndDay || (policy.rules && policy.rules.salaryCycleEndDay)}</span>
//                             <span>Tax: {policy.taxDeductionMethod || (policy.rules && policy.rules.taxDeductionMethod)}</span>
//                           </>
//                         )}
//                         {policy.type === 'EXPENSE' && (
//                           <>
//                             <span>Travel: {policy.travelClassAllowed || (policy.rules && policy.rules.travelClassAllowed)}</span>
//                             <span>Limit: {policy.autoApprovalLimit || (policy.rules && policy.rules.autoApprovalLimit)}</span>
//                           </>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-gray-600">v{policy.version}</td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${policy.isActive
//                           ? 'bg-green-50 text-green-700'
//                           : 'bg-red-50 text-red-700'
//                           }`}
//                       >
//                         <span className={`h-1.5 w-1.5 rounded-full ${policy.isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
//                         {policy.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <button
//                           onClick={() => handleAssignClick(policy)}
//                           className="rounded-md p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
//                           title="Assign to Locations"
//                         >
//                           <MapPin className="h-4 w-4" />
//                         </button>
//                         <button
//                           onClick={() => handleEdit(policy)}
//                           className="rounded-md p-1.5 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
//                           title="Edit"
//                         >
//                           <Edit2 className="h-4 w-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(policy.id)}
//                           className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
//                           title="Delete"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//         <div className="border-t border-gray-200 px-4 py-3 sm:px-6 flex justify-between items-center">
//           <div className="text-sm text-gray-700">
//             Showing <span className="font-medium">{(params.page - 1) * params.limit + 1}</span> to <span className="font-medium">{Math.min(params.page * params.limit, totalDocs)}</span> of <span className="font-medium">{totalDocs}</span> results
//           </div>
//           <div className="flex gap-2">
//             <button
//               disabled={params.page <= 1}
//               onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}
//               className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </button>
//             <button
//               disabled={params.page * params.limit >= totalDocs}
//               onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
//               className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Assign Modal */}
//       <Modal
//         isOpen={isAssignModalOpen}
//         onClose={() => setIsAssignModalOpen(false)}
//         title="Assign Policy to Locations"
//       >
//         <form onSubmit={assignFormik.handleSubmit} className="space-y-4 text-left">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Select Locations</label>
//             <Select
//               isMulti
//               options={locations}
//               value={assignFormik.values.locationIds}
//               onChange={(option) => assignFormik.setFieldValue('locationIds', option)}
//               className="text-sm"
//             />
//             <p className="text-xs text-gray-500 mt-1">Select one or more locations to apply this policy.</p>
//           </div>

//           <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//             <button
//               type="submit"
//               className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
//             >
//               Assign Policy
//             </button>
//             <button
//               type="button"
//               className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
//               onClick={() => setIsAssignModalOpen(false)}
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </Modal>

//     </div>
//   );
// }


// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useFormik } from 'formik';
// import toast, { Toaster } from 'react-hot-toast';
// import {
//   Plus, Edit2, Trash2, MapPin, Search,
//   ChevronLeft, ChevronRight, Filter, Clock, Calendar, DollarSign, Receipt, LayoutGrid, List
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Select from 'react-select';
// import React from 'react';

// // Custom Services & Components
// import { policyRuleService } from '@/services/super-admin-services/policy-rule.service';
// import { companyOrganizationService } from '@/services/super-admin-services/companyOrganization.service';
// import Breadcrumb from '@/components/common/Breadcrumb';
// import ConfirmationDialog from '@/components/common/ConfirmationDialog'; // Reusing your existing dialog

// // --- Helper: Policy Type Config ---
// const POLICY_CONFIG = {
//   ATTENDANCE: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
//   LEAVE: { icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
//   PAYROLL: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
//   EXPENSE: { icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
// };

// // --- Modal Component (Styled) ---
// const Modal = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//       <motion.div 
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700"
//       >
//         <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
//           <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
//         </div>
//         <div className="p-6">{children}</div>
//       </motion.div>
//     </div>
//   );
// };

// export default function PolicyRulePage() {
//   const router = useRouter();
//   const [policies, setPolicies] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [params, setParams] = useState({ page: 1, limit: 9, type: '' }); // Limit 9 for Grid View
//   const [totalDocs, setTotalDocs] = useState(0);
//   const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

//   // Modal States
//   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [selectedPolicy, setSelectedPolicy] = useState(null);

//   // Fetch Policies
//   const fetchPolicies = async () => {
//     setLoading(true);
//     try {
//       const response = await policyRuleService.getPolicies(params);
//       if (response?.data?.policies) {
//         setPolicies(response.data.policies);
//         setTotalDocs(response.data.pagination?.total || 0);
//       } else {
//         setPolicies(response.docs || response.policies || []);
//         setTotalDocs(response.totalDocs || response.total || 0);
//       }
//     } catch (error) {
//       toast.error('Failed to fetch policies');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch Locations
//   useEffect(() => {
//     const fetchLocs = async () => {
//       try {
//         const response = await companyOrganizationService.getLocations();
//         const locs = Array.isArray(response) ? response : (response.docs || []);
//         setLocations(locs.map(l => ({ value: l.id, label: l.name })));
//       } catch (error) { console.error(error); }
//     };
//     fetchLocs();
//   }, []);

//   useEffect(() => { fetchPolicies(); }, [params]);

//   // Formik for Assignment
//   const assignFormik = useFormik({
//     initialValues: { locationIds: [] },
//     onSubmit: async (values) => {
//       try {
//         await policyRuleService.assignPolicy({
//           policyId: selectedPolicy.id,
//           locationIds: values.locationIds.map((l) => l.value),
//         });
//         toast.success('Policy assigned successfully');
//         setIsAssignModalOpen(false);
//       } catch (error) {
//         toast.error('Failed to assign policy');
//       }
//     },
//   });

//   // Handlers
//   const handleAssignClick = (policy) => {
//     setSelectedPolicy(policy);
//     assignFormik.resetForm();
//     setIsAssignModalOpen(true);
//   };

//   const handleDeleteClick = (policy) => {
//     setSelectedPolicy(policy);
//     setDeleteDialogOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     try {
//       await policyRuleService.deletePolicy(selectedPolicy.id);
//       toast.success('Policy deleted');
//       fetchPolicies();
//     } catch (error) {
//       toast.error('Failed to delete');
//     } finally {
//       setDeleteDialogOpen(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12 relative">
//       {/* Background Decor */}
//       <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]"></div>

//            {/* Search & Filter */}
//            <div className="flex items-center gap-3 w-full sm:w-auto px-2">
//               <div className="relative flex-1 sm:w-64">
//                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                  <input 
//                     type="text" 
//                     placeholder="Search policies..." 
//                     className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all"
//                  />
//               </div>
//               <div className="relative">
//                  <select 
//                     className="appearance-none pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
//                     value={params.type}
//                     onChange={(e) => setParams({ ...params, type: e.target.value, page: 1 })}
//                  >
//                     <option value="">All Types</option>
//                     <option value="ATTENDANCE">Attendance</option>
//                     <option value="LEAVE">Leave</option>
//                     <option value="PAYROLL">Payroll</option>
//                     <option value="EXPENSE">Expense</option>
//                  </select>
//                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
//               </div>
//            </div>

//            {/* View Toggle */}
//            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
//               <button 
//                  onClick={() => setViewMode('grid')}
//                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600' : 'text-gray-500'}`}
//               >
//                  <LayoutGrid size={18} />
//               </button>
//               <button 
//                  onClick={() => setViewMode('list')}
//                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600' : 'text-gray-500'}`}
//               >
//                  <List size={18} />
//               </button>
//            </div>
//         </div>

//         {/* --- Content Grid --- */}
//         {loading ? (
//            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>)}
//            </div>
//         ) : policies.length === 0 ? (
//            <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
//               <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-full mb-4">
//                  <Filter size={32} />
//               </div>
//               <p className="text-lg font-medium text-gray-900 dark:text-white">No policies found</p>
//               <p className="text-sm">Try adjusting your filters or create a new one.</p>
//            </div>
//         ) : (
//            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
//               <AnimatePresence>
//                  {policies.map((policy, index) => {
//                     const config = POLICY_CONFIG[policy.type] || { icon: Filter, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
//                     const Icon = config.icon;

//                     return (
//                        <motion.div
//                           key={policy.id}
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.05 }}
//                           className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
//                        >
//                           {/* Card Header */}
//                           <div className="flex justify-between items-start mb-4">
//                              <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
//                                 <Icon size={24} />
//                              </div>
//                              <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${policy.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
//                                 {policy.isActive ? 'ACTIVE' : 'DRAFT'}
//                              </div>
//                           </div>

//                           {/* Content */}
//                           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{policy.name}</h3>
//                           <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 h-10">
//                              {policy.description || "No description provided."}
//                           </p>

//                           {/* Meta Data */}
//                           <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500">
//                              <span>v{policy.version}</span>
//                              <span>{new Date(policy.createdAt).toLocaleDateString()}</span>
//                           </div>

//                           {/* Quick Actions Overlay (Visible on Hover) */}
//                           <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 rounded-2xl">
//                              <div className="flex gap-2">
//                                 <button 
//                                    onClick={() => handleAssignClick(policy)}
//                                    className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all" 
//                                    title="Assign"
//                                 >
//                                    <MapPin size={20} />
//                                 </button>
//                                 <button 
//                                    onClick={() => router.push(`/company-admin/policy-rule/edit/${policy.id}`)}
//                                    className="p-3 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-110 transition-all" 
//                                    title="Edit"
//                                 >
//                                    <Edit2 size={20} />
//                                 </button>
//                                 <button 
//                                    onClick={() => handleDeleteClick(policy)}
//                                    className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all" 
//                                    title="Delete"
//                                 >
//                                    <Trash2 size={20} />
//                                 </button>
//                              </div>
//                              <span className="text-sm font-bold text-gray-900 dark:text-white">Manage Policy</span>
//                           </div>
//                        </motion.div>
//                     );
//                  })}
//               </AnimatePresence>
//            </div>
//         )}

//         {/* Pagination */}
//         <div className="mt-8 flex justify-center gap-2">
//            <button
//               disabled={params.page <= 1}
//               onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}
//               className="p-2 rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-50"
//            >
//               <ChevronLeft size={20} />
//            </button>
//            <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
//               Page {params.page}
//            </span>
//            <button
//               disabled={params.page * params.limit >= totalDocs}
//               onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
//               className="p-2 rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-50"
//            >
//               <ChevronRight size={20} />
//            </button>
//         </div>
//       </div>

//       {/* --- Modals --- */}
//       <Modal isOpen={isAssignModalOpen} title="Assign Policy" onClose={() => setIsAssignModalOpen(false)}>
//          <form onSubmit={assignFormik.handleSubmit} className="space-y-6">
//             <div>
//                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Locations</label>
//                <Select
//                   isMulti
//                   options={locations}
//                   value={assignFormik.values.locationIds}
//                   onChange={(option) => assignFormik.setFieldValue('locationIds', option)}
//                   className="text-sm"
//                   styles={{
//                      control: (base) => ({ ...base, borderRadius: '0.75rem', padding: '2px', borderColor: '#e5e7eb' })
//                   }}
//                />
//                <p className="text-xs text-gray-500 mt-2">The selected policy will be enforced at these locations.</p>
//             </div>
//             <div className="flex justify-end gap-3">
//                <button 
//                   type="button" 
//                   onClick={() => setIsAssignModalOpen(false)}
//                   className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//                >
//                   Cancel
//                </button>
//                <button 
//                   type="submit"
//                   className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/30 transition-all"
//                >
//                   Confirm Assignment
//                </button>
//             </div>
//          </form>
//       </Modal>

//       <ConfirmationDialog
//         isOpen={deleteDialogOpen}
//         onClose={() => setDeleteDialogOpen(false)}
//         onConfirm={handleDeleteConfirm}
//         title="Delete Policy"
//         message={`Are you sure you want to delete "${selectedPolicy?.name}"? This action cannot be undone.`}
//         confirmText="Delete"
//         isDestructive={true}
//       />
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus, Edit, Trash2, MapPin, Search,
  ChevronLeft, ChevronRight, Filter, Clock, Calendar,
  DollarSign, Receipt, FileText, Eye, History, ToggleLeft, ToggleRight, Upload, CheckCircle2, XCircle, BadgeCheck, MoreVertical
} from 'lucide-react';
import {
  Dialog, DialogPanel, DialogTitle, Transition, TransitionChild
} from '@headlessui/react';
import Select from 'react-select';
import React, { Fragment } from 'react';

import { policyRuleService } from '@/services/super-admin-services/policy-rule.service';
import { companyOrganizationService } from '@/services/super-admin-services/companyOrganization.service';
import Breadcrumb from '@/components/common/Breadcrumb';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { useAuth } from '@/context/AuthContext';

// --- Configuration ---
const POLICY_STYLES = {
  ATTENDANCE: {
    icon: Clock,
    label: 'Attendance',
    badge: 'bg-primary-50 text-primary-700 border-primary-200 ring-primary-600/20'
  },
  LEAVE: {
    icon: Calendar,
    label: 'Leave',
    badge: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20'
  },
  PAYROLL: {
    icon: DollarSign,
    label: 'Payroll',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20'
  },
  EXPENSE: {
    icon: Receipt,
    label: 'Expense',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20'
  },
};

// --- Assignment Modal ---
const AssignModal = ({ isOpen, onClose, title, children }) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100">
                <div className="bg-white px-6 py-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <DialogTitle as="h3" className="text-xl font-bold leading-6 text-gray-900 mb-1">
                        {title}
                      </DialogTitle>
                      <p className="text-sm text-gray-500 mb-6">Configure where this policy applies.</p>
                      {children}
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --------------------------------------------------
// Custom Policy (UI-only) - Step Form
// - Uses window.__zodeckCustomPolicyDraft as a lightweight draft store.
// - No backend calls, stored via localStorage in parent.
// --------------------------------------------------
const CustomPolicyStep = ({ step, action, existing, categories, statuses, scopes }) => {
  const isReadOnly = action === 'view';

  const ensureDraft = (patch) => {
    if (typeof window === 'undefined') return;
    window.__zodeckCustomPolicyDraft = {
      ...(window.__zodeckCustomPolicyDraft || {}),
      ...(patch || {}),
    };
  };

  useEffect(() => {
    // Initialize draft from existing once when entering edit/view
    if (typeof window === 'undefined') return;
    if ((action === 'edit' || action === 'view') && existing) {
      window.__zodeckCustomPolicyDraft = {
        id: existing.id,
        name: existing.name || '',
        code: existing.code || '',
        category: existing.category || 'HR',
        shortDescription: existing.shortDescription || '',
        status: existing.status || 'DRAFT',

        contentHtml: existing.contentHtml || '',
        attachments: existing.attachments || [],

        scope: existing.scope || { type: 'COMPANY', applyToAll: true, locations: [], departments: [], designations: [] },

        ack: existing.ack || { required: false, type: 'MANDATORY', deadline: '' },
        approval: existing.approval || { required: false, approver: 'COMPANY_ADMIN' },
        effectiveFrom: existing.effectiveFrom || '',
        effectiveTo: existing.effectiveTo || '',
        autoExpire: Boolean(existing.autoExpire),

        changeSummary: '',
      };
    }
    if (action === 'add') {
      window.__zodeckCustomPolicyDraft = {
        name: '',
        code: '',
        category: 'HR',
        shortDescription: '',
        status: 'DRAFT',
        contentHtml: '',
        attachments: [],
        scope: { type: 'COMPANY', applyToAll: true, locations: [], departments: [], designations: [] },
        ack: { required: false, type: 'MANDATORY', deadline: '' },
        approval: { required: false, approver: 'COMPANY_ADMIN' },
        effectiveFrom: '',
        effectiveTo: '',
        autoExpire: false,
        changeSummary: '',
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, existing?.id]);

  const draft = (typeof window !== 'undefined' && window.__zodeckCustomPolicyDraft) ? window.__zodeckCustomPolicyDraft : {};

  const setField = (key, value) => ensureDraft({ [key]: value });

  const autoCodeFromName = (name) =>
    String(name || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 24);

  const toolbarButton = (label, onClick) => (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      disabled={isReadOnly}
    >
      {label}
    </button>
  );

  const ScopeTagInput = ({ label, value = [], onChange, placeholder }) => {
    const [text, setText] = useState((value || []).join(', '));

    useEffect(() => {
      setText((value || []).join(', '));
    }, [value]);

    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">{label}</label>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const parts = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            onChange(parts);
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={isReadOnly}
        />
        <p className="text-xs text-gray-500">Enter comma-separated values.</p>
      </div>
    );
  };

  if (step === 1) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900">Section 1: Basic Policy Details</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-900">Policy Name *</label>
            <input
              value={draft.name || ''}
              onChange={(e) => {
                const name = e.target.value;
                ensureDraft({ name });
                if (!draft.code) ensureDraft({ code: autoCodeFromName(name) });
              }}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Policy Code</label>
            <input
              value={draft.code || ''}
              onChange={(e) => setField('code', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              disabled={isReadOnly}
            />
            <button
              type="button"
              onClick={() => setField('code', autoCodeFromName(draft.name))}
              className="text-xs font-semibold text-primary-600 hover:underline"
              disabled={isReadOnly}
            >
              Auto-generate
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Policy Category</label>
            <select
              value={draft.category || 'HR'}
              onChange={(e) => setField('category', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              disabled={isReadOnly}
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-900">Short Description</label>
            <textarea
              rows={3}
              value={draft.shortDescription || ''}
              onChange={(e) => setField('shortDescription', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Status</label>
            <select
              value={draft.status || 'DRAFT'}
              onChange={(e) => setField('status', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              disabled={isReadOnly}
            >
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900">Section 2: Policy Content</h3>
        <p className="text-sm text-gray-500 mt-1">Rich content + attachments (versioned on save).</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {toolbarButton('H1', () => document.execCommand('formatBlock', false, 'h1'))}
          {toolbarButton('H2', () => document.execCommand('formatBlock', false, 'h2'))}
          {toolbarButton('Bold', () => document.execCommand('bold'))}
          {toolbarButton('Italic', () => document.execCommand('italic'))}
          {toolbarButton('Bullets', () => document.execCommand('insertUnorderedList'))}
          {toolbarButton('Numbered', () => document.execCommand('insertOrderedList'))}
          {toolbarButton('Link', () => {
            const url = prompt('Enter URL');
            if (url) document.execCommand('createLink', false, url);
          })}
        </div>

        <div
          contentEditable={!isReadOnly}
          suppressContentEditableWarning
          onInput={(e) => setField('contentHtml', e.currentTarget.innerHTML)}
          className={`mt-3 min-h-[220px] rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'opacity-90' : ''}`}
          dangerouslySetInnerHTML={{ __html: draft.contentHtml || '' }}
        />

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="text-sm font-semibold text-gray-900">Attachments</div>
          <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold ${isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
            <Upload size={16} />
            Upload (PDF/DOC)
            <input
              type="file"
              className="hidden"
              multiple
              disabled={isReadOnly}
              onChange={(e) => {
                const files = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size }));
                setField('attachments', [...(draft.attachments || []), ...files]);
              }}
            />
          </label>
        </div>

        <div className="mt-3 space-y-2">
          {(draft.attachments || []).length === 0 ? (
            <div className="text-sm text-gray-500">No attachments uploaded.</div>
          ) : (
            (draft.attachments || []).map((a, idx) => (
              <div key={`${a.name}-${idx}`} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-2">
                <div className="text-sm text-gray-700">{a.name}</div>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => setField('attachments', (draft.attachments || []).filter((_, i) => i !== idx))}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (step === 3) {
    const scope = draft.scope || { type: 'COMPANY', applyToAll: true, locations: [], departments: [], designations: [] };
    return (
      <div className="rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900">Section 3: Applicability / Scope</h3>
        <p className="text-sm text-gray-500 mt-1">Single company by default, optionally narrow scope.</p>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 p-4">
          <div>
            <div className="font-semibold text-gray-900">Apply to all employees</div>
            <div className="text-sm text-gray-500">Entire company (default)</div>
          </div>
          <input
            type="checkbox"
            checked={Boolean(scope.applyToAll)}
            onChange={(e) => setField('scope', { ...scope, applyToAll: e.target.checked, type: e.target.checked ? 'COMPANY' : scope.type })}
            disabled={isReadOnly}
            className="h-5 w-5"
          />
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Applied Scope</label>
            <select
              value={scope.type || 'COMPANY'}
              onChange={(e) => setField('scope', { ...scope, type: e.target.value, applyToAll: e.target.value === 'COMPANY' })}
              disabled={isReadOnly || Boolean(scope.applyToAll)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {scopes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {!scope.applyToAll && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScopeTagInput
                label="Locations (optional)"
                value={scope.locations || []}
                onChange={(v) => setField('scope', { ...scope, locations: v })}
                placeholder="e.g. Bangalore HQ, Mumbai Branch"
              />
              <ScopeTagInput
                label="Departments (optional)"
                value={scope.departments || []}
                onChange={(v) => setField('scope', { ...scope, departments: v })}
                placeholder="e.g. Engineering, HR"
              />
              <ScopeTagInput
                label="Designations (optional)"
                value={scope.designations || []}
                onChange={(v) => setField('scope', { ...scope, designations: v })}
                placeholder="e.g. Senior Engineer, Manager"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 4) {
    const ack = draft.ack || { required: false, type: 'MANDATORY', deadline: '' };
    return (
      <div className="rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900">Section 4: Acknowledgement Settings</h3>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 p-4">
          <div>
            <div className="font-semibold text-gray-900">Acknowledgement Required</div>
            <div className="text-sm text-gray-500">Employees must read/accept the policy</div>
          </div>
          <input
            type="checkbox"
            checked={Boolean(ack.required)}
            onChange={(e) => setField('ack', { ...ack, required: e.target.checked })}
            disabled={isReadOnly}
            className="h-5 w-5"
          />
        </div>

        {ack.required && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Type</label>
              <select
                value={ack.type || 'MANDATORY'}
                onChange={(e) => setField('ack', { ...ack, type: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="MANDATORY">Mandatory (Read & Accept)</option>
                <option value="OPTIONAL">Optional (Read Only)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Acknowledgement Deadline (optional)</label>
              <input
                type="date"
                value={ack.deadline || ''}
                onChange={(e) => setField('ack', { ...ack, deadline: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="md:col-span-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              Tracking status (UI only): <span className="font-semibold">Pending</span> / <span className="font-semibold">Acknowledged</span> / <span className="font-semibold">Overdue</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 5) {
    const approval = draft.approval || { required: false, approver: 'COMPANY_ADMIN' };
    return (
      <div className="rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900">Section 5: Approval (Optional)</h3>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 p-4">
          <div>
            <div className="font-semibold text-gray-900">Approval Required</div>
            <div className="text-sm text-gray-500">Require approval before policy becomes active</div>
          </div>
          <input
            type="checkbox"
            checked={Boolean(approval.required)}
            onChange={(e) => setField('approval', { ...approval, required: e.target.checked })}
            disabled={isReadOnly}
            className="h-5 w-5"
          />
        </div>
        {approval.required && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-semibold text-gray-900">Approver</label>
            <select
              value={approval.approver || 'COMPANY_ADMIN'}
              onChange={(e) => setField('approval', { ...approval, approver: e.target.value })}
              disabled={isReadOnly}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="COMPANY_ADMIN">Company Admin</option>
              <option value="HR">HR</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
        )}
      </div>
    );
  }

  if (step === 6) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900">Section 6: Effective Period</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Effective From</label>
            <input
              type="date"
              value={draft.effectiveFrom || ''}
              onChange={(e) => setField('effectiveFrom', e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Effective To (optional)</label>
            <input
              type="date"
              value={draft.effectiveTo || ''}
              onChange={(e) => setField('effectiveTo', e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-gray-200 p-4">
            <div>
              <div className="font-semibold text-gray-900">Auto-expire</div>
              <div className="text-sm text-gray-500">Mark policy inactive after Effective To</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(draft.autoExpire)}
              onChange={(e) => setField('autoExpire', e.target.checked)}
              disabled={isReadOnly}
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>
    );
  }

  // step 7
  return (
    <div className="rounded-2xl border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-900">Section 7: Version Summary</h3>
      <p className="text-sm text-gray-500 mt-1">Every save creates a new version (UI only).</p>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-semibold text-gray-900">Change Summary</label>
        <textarea
          rows={3}
          value={draft.changeSummary || ''}
          onChange={(e) => setField('changeSummary', e.target.value)}
          disabled={isReadOnly}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          placeholder="e.g. Updated acknowledgement deadline, added new section..."
        />
      </div>
    </div>
  );
};

const DropdownPortal = ({ isOpen, onClose, position, children }) => {
  if (!isOpen) return null;
  // Position right side aligned roughly? Use left: pos.left - 200 is a bit risky.
  // Better use right-aligned if close to edge.
  // But let's stick to the previous implementation for consistency.
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px]"
        style={{
          top: position.top + position.height + 8,
          right: window.innerWidth - (position.left + position.width), // Position relative to right to align to end
          // Or left: position.left - 180 or so. Let's use right alignment relative to viewport.
        }}
      >
        {children}
      </div>
    </>
  );
};

export default function PolicyRulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.systemRole || user?.role || 'EMPLOYEE';

  const canManagePolicies = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_ADMIN', 'MASTER_ADMIN'].includes(userRole);

  const basePath = pathname?.startsWith('/hr') ? '/hr' : (pathname?.startsWith('/company-admin') ? '/company-admin' : (pathname?.split('/')[1] ? `/${pathname.split('/')[1]}` : '/company-admin'));
  const [policies, setPolicies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({ page: 1, limit: 10, type: '' });
  const [totalDocs, setTotalDocs] = useState(0);

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Dropdown States
  const [actionMenu, setActionMenu] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const handleActionButtonClick = (e, policyId) => {
    e.stopPropagation();
    const buttonRect = e.currentTarget.getBoundingClientRect();
    // Use fixed positioning so we don't need scrollY/scrollX
    // But buttonRect.top/left are relative to viewport, which is what 'fixed' expects.
    setButtonPosition({
      top: buttonRect.top,
      left: buttonRect.left,
      width: buttonRect.width,
      height: buttonRect.height
    });
    setActionMenu(actionMenu === policyId ? null : policyId);
  };

  // ------------------------------
  // Custom Policies (UI-only)
  // ------------------------------
  const isCustomPoliciesMode = searchParams?.get('customPolicies') === '1' || pathname?.startsWith(`${basePath}/custom-policies`);
  const customAction = searchParams?.get('action') || ''; // '', 'add', 'edit', 'view', 'versions'
  const customId = searchParams?.get('id') || '';

  const CUSTOM_POLICY_CATEGORIES = ['HR', 'IT', 'Compliance', 'Operations', 'Finance'];
  const CUSTOM_POLICY_STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE'];
  const CUSTOM_POLICY_SCOPES = ['COMPANY', 'LOCATION', 'DEPARTMENT', 'DESIGNATION'];

  const storageKey = 'zodeck_company_admin_custom_policies_v1';
  const loadCustomPolicies = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const saveCustomPolicies = (items) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };
  const upsertCustomPolicy = (next) => {
    const list = loadCustomPolicies();
    const idx = list.findIndex((p) => String(p.id) === String(next.id));
    if (idx >= 0) {
      list[idx] = next;
    } else {
      list.unshift(next);
    }
    saveCustomPolicies(list);
  };

  const [customPolicies, setCustomPolicies] = useState([]);
  const [customPolicy, setCustomPolicy] = useState(null);
  const [customStep, setCustomStep] = useState(1);
  const [customVersionModalOpen, setCustomVersionModalOpen] = useState(false);
  const [customFilter, setCustomFilter] = useState({ q: '', category: '', status: '' });
  const basePoliciesArray = [
    { key: "ATTENDANCE", title: "Attendance Policy", desc: "Shift, grace, biometric and rules", icon: Clock },
    { key: "LEAVE", title: "Leave Policy", desc: "Annual/sick, carry-forward, encashment", icon: Calendar },
    { key: "PAYROLL", title: "Payroll Policy", desc: "Salary cycle, tax method, overtime", icon: DollarSign },
    { key: "EXPENSE", title: "Expense Policy", desc: "Limits, receipts, travel class", icon: Receipt },
  ];

  const [policiesArray, setPoliciesArray] = useState(basePoliciesArray);

  const hydrateCustomPolicies = () => {
    const list = loadCustomPolicies();
    setCustomPolicies(list);
    if (customId) {
      const found = list.find((p) => String(p.id) === String(customId)) || null;
      setCustomPolicy(found);
    } else {
      setCustomPolicy(null);
    }
  };

  useEffect(() => {
    if (!isCustomPoliciesMode) return;
    hydrateCustomPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustomPoliciesMode, customId, customAction]);

  // Fetch Data
  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await policyRuleService.getPolicies(params);
      if (response?.data?.policies) {
        if (response?.data?.customPolicyExist) {
          setPoliciesArray([
            ...basePoliciesArray,
            ...(response?.data?.customPolicyExist
              ? [{
                key: 'CUSTOM',
                title: 'Custom Policy',
                desc: 'Custom policy rules',
                icon: FileText,
              }]
              : [])
          ]);
        };

        setPolicies(response.data.policies);
        setTotalDocs(response.data.pagination?.total || 0);
      } else {
        setPolicies(response.docs || response.policies || []);
        setTotalDocs(response.totalDocs || response.total || 0);
      }
    } catch (error) {
      toast.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    // Only roles with access to company-admin endpoints can fetch locations.
    // HR_ADMIN, FINANCE_ADMIN and others will receive a 403 — skip the call for them.
    const rolesAllowed = ['SUPER_ADMIN', 'MASTER_ADMIN', 'COMPANY_ADMIN'];
    if (!rolesAllowed.includes(userRole)) {
      setLocations([]);
      return;
    }
    try {
      const response = await companyOrganizationService.getLocations();
      const locs = Array.isArray(response) ? response : (response.docs || response.data || []);
      setLocations(locs.map(l => ({ value: l.id, label: l.name })));
    } catch (error) {
      // 403 = role not permitted; silently ignore and leave locations empty
      if (error?.response?.status !== 403) {
        console.error('fetchLocations error:', error);
      }
      setLocations([]);
    }
  };

  useEffect(() => { if (!isCustomPoliciesMode) fetchPolicies(); }, [params, isCustomPoliciesMode]);
  useEffect(() => { if (!isCustomPoliciesMode) fetchLocations(); }, [isCustomPoliciesMode]);

  // Keep filter in sync with URL (?type=ATTENDANCE|LEAVE|PAYROLL|EXPENSE)
  useEffect(() => {
    const urlType = searchParams?.get('type') || '';
    setParams((prev) => (prev.type === urlType ? prev : { ...prev, type: urlType, page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Custom policies don't use ?type filter
  useEffect(() => {
    if (!isCustomPoliciesMode) return;
    setParams((prev) => (prev.type ? { ...prev, type: '' } : prev));
  }, [isCustomPoliciesMode]);

  // UI-only labeling: "Common" policies are default/system policies available to every company.
  // We infer this from typical flags if present, otherwise fallback to name-based heuristic.
  const isCommonPolicy = (policy) => {
    const name = (policy?.name || '').toLowerCase();
    const scope = (policy?.scope || policy?.policyScope || '').toString().toLowerCase();
    return Boolean(
      policy?.isSystem ||
      policy?.isDefault ||
      policy?.isGlobal ||
      scope === 'global' ||
      scope === 'system' ||
      name.includes('default')
    );
  };

  // Formik for Assignment
  const assignFormik = useFormik({
    initialValues: { locationIds: [] },
    onSubmit: async (values) => {
      try {
        await policyRuleService.assignPolicy({
          policyId: selectedPolicy.id,
          locationIds: values.locationIds.map((l) => l.value),
        });
        toast.success('Policy assigned successfully');
        setIsAssignModalOpen(false);
      } catch (error) {
        toast.error('Failed to assign policy');
      }
    },
  });

  // Handlers
  const handleAssignClick = (policy) => {
    setSelectedPolicy(policy);
    assignFormik.resetForm();
    setIsAssignModalOpen(true);
  };

  const handleDeleteClick = (policy) => {
    setSelectedPolicy(policy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await policyRuleService.deletePolicy(selectedPolicy.id);
      toast.success('Policy deleted');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]"></div>

      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb pageName={isCustomPoliciesMode ? "Custom Policies" : "Policy & Rule Management"} />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3" />

            {canManagePolicies && (
              <button
                onClick={() => {
                  if (isCustomPoliciesMode) {
                    router.push(`${basePath}/custom-policies/add`);
                  } else {
                    router.push(`${basePath}/policy-rule/add`);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-sm bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:bg-primary-700 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>{isCustomPoliciesMode ? "Create Custom Policy" : "Add Policy"}</span>
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------
            Custom Policies UI (UI-only)
           ------------------------------ */}
        {isCustomPoliciesMode ? (
          <div className="space-y-6">
            {/* List */}
            {(!customAction || customAction === 'list') && (
              <div className="space-y-4">
                <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        value={customFilter.q}
                        onChange={(e) => setCustomFilter((p) => ({ ...p, q: e.target.value }))}
                        placeholder="Search by policy name..."
                        className="w-full pl-10 pr-3 py-2 bg-gray-50 rounded-sm text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <select
                      value={customFilter.category}
                      onChange={(e) => setCustomFilter((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">All Categories</option>
                      {CUSTOM_POLICY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={customFilter.status}
                      onChange={(e) => setCustomFilter((p) => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 rounded-sm text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">All Status</option>
                      {CUSTOM_POLICY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Policy Name</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied Scope</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Effective From</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acknowledgement</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customPolicies
                          .filter((p) => {
                            const q = customFilter.q.trim().toLowerCase();
                            const matchesQ = !q || (p.name || '').toLowerCase().includes(q);
                            const matchesCat = !customFilter.category || p.category === customFilter.category;
                            const matchesStatus = !customFilter.status || p.status === customFilter.status;
                            return matchesQ && matchesCat && matchesStatus;
                          })
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">{p.name}</div>
                                <div className="text-xs text-gray-500">{p.code}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">{p.category}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : p.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}>
                                  {p.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : p.status === 'DRAFT' ? <BadgeCheck size={12} /> : <XCircle size={12} />}
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">{p.scope?.type || 'COMPANY'}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{p.effectiveFrom || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{p.ack?.required ? 'Yes' : 'No'}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => router.push(`${basePath}/custom-policies/view/${p.id}`)}
                                    className="p-2 rounded-sm text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                                    title="View"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  {canManagePolicies && (
                                    <>
                                      <button
                                        onClick={() => router.push(`${basePath}/custom-policies/edit/${p.id}`)}
                                        className="p-2 rounded-sm text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                                        title="Edit"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                          const next = { ...p, status: nextStatus, updatedAt: new Date().toISOString() };
                                          upsertCustomPolicy(next);
                                          hydrateCustomPolicies();
                                          toast.success(`Policy ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
                                        }}
                                        className="p-2 rounded-sm text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                                        title="Activate / Deactivate"
                                      >
                                        {p.status === 'ACTIVE' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setCustomPolicy(p);
                                          setCustomVersionModalOpen(true);
                                        }}
                                        className="p-2 rounded-sm text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                                        title="View Versions"
                                      >
                                        <History size={16} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm('Delete this custom policy?')) {
                                            const list = loadCustomPolicies().filter((x) => String(x.id) !== String(p.id));
                                            saveCustomPolicies(list);
                                            hydrateCustomPolicies();
                                            toast.success('Policy deleted');
                                          }
                                        }}
                                        className="p-2 rounded-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        {customPolicies.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-14 text-center text-gray-500">
                              No custom policies yet. Click “Create Custom Policy” to add one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Create/Edit/View */}
            {(['add', 'edit', 'view'].includes(customAction)) && (
              <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {customAction === 'add' ? 'Create Custom Policy' : customAction === 'edit' ? 'Edit Custom Policy' : 'View Custom Policy'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Informational policy with acknowledgement + version history (UI only).
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`${basePath}/custom-policies`)}
                      className="px-4 py-2 rounded-sm border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Back to list
                    </button>
                    {customAction !== 'view' && (
                      <button
                        onClick={() => {
                          // Save (UI-only) - creates a new version on every save
                          const now = new Date();
                          const id = customAction === 'edit' ? (customPolicy?.id || customId) : `cp_${now.getTime()}`;
                          const existing = loadCustomPolicies().find((p) => String(p.id) === String(id));
                          const nextVersion = existing?.versions?.length ? (existing.versions.length + 1) : 1;
                          const base = existing || customPolicy || {
                            id,
                            versions: [],
                            createdAt: now.toISOString(),
                          };

                          const draft = (window.__zodeckCustomPolicyDraft || {});
                          const next = {
                            ...base,
                            ...draft,
                            id,
                            updatedAt: now.toISOString(),
                            versions: [
                              ...(base.versions || []),
                              {
                                version: `v${nextVersion}.0`,
                                summary: draft.changeSummary || 'Updated policy',
                                date: now.toISOString(),
                                snapshot: { ...draft },
                              },
                            ],
                          };

                          upsertCustomPolicy(next);
                          toast.success('Saved (UI only)');
                          router.push(`${basePath}/custom-policies`);
                        }}
                        className="inline-flex items-center gap-2 rounded-sm bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        <Plus className="h-4 w-4" />
                        Save
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Steps */}
                  <div className="lg:col-span-1">
                    <div className="rounded-sm border border-gray-200 p-4">
                      {[
                        { id: 1, title: 'Basic Details' },
                        { id: 2, title: 'Policy Content' },
                        { id: 3, title: 'Scope' },
                        { id: 4, title: 'Acknowledgement' },
                        { id: 5, title: 'Approval (Optional)' },
                        { id: 6, title: 'Effective Period' },
                        { id: 7, title: 'Version Summary' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setCustomStep(s.id)}
                          className={`w-full text-left px-3 py-2 rounded-sm text-sm font-semibold transition ${customStep === s.id ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                          <span className="mr-2 text-xs text-gray-500">0{s.id}</span>
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Store draft in window to avoid adding more global state in this huge file */}
                    <CustomPolicyStep
                      step={customStep}
                      action={customAction}
                      existing={customPolicy}
                      categories={CUSTOM_POLICY_CATEGORIES}
                      statuses={CUSTOM_POLICY_STATUSES}
                      scopes={CUSTOM_POLICY_SCOPES}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Version History Modal */}
            <Transition show={customVersionModalOpen} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => setCustomVersionModalOpen(false)}>
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4">
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2">
                      <DialogPanel className="w-full max-w-2xl rounded-sm bg-white p-6 shadow-2xl border border-gray-100">
                        <DialogTitle className="text-lg font-bold text-gray-900">Version History</DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">Compare, rollback (UI only).</p>

                        <div className="mt-4 space-y-3 max-h-[60vh] overflow-auto pr-1">
                          {(customPolicy?.versions || []).slice().reverse().map((v) => (
                            <div key={v.date} className="rounded-sm border border-gray-200 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-gray-900">{v.version}</div>
                                  <div className="text-xs text-gray-500 mt-1">{new Date(v.date).toLocaleString()}</div>
                                  <div className="text-sm text-gray-700 mt-2">{v.summary}</div>
                                </div>
                                <button
                                  onClick={() => toast.success('Rollback (UI only)')}
                                  className="px-3 py-1.5 rounded-sm border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  Rollback
                                </button>
                              </div>
                            </div>
                          ))}
                          {(customPolicy?.versions || []).length === 0 && (
                            <div className="text-sm text-gray-500 text-center py-10">No versions yet.</div>
                          )}
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setCustomVersionModalOpen(false)}
                            className="px-4 py-2 rounded-sm bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
                          >
                            Close
                          </button>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </div>
        ) : null}

        {/* If custom mode, stop rendering the system policy table below */}
        {isCustomPoliciesMode ? null : (
          <>
            {/* Policy Cards (Default categories + Custom) */}
            <div className="mb-6">
              <div className="mb-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Default policy categories</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    These categories are common for every company. Create custom policies for your company when needed.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(policiesArray).map((card) => {
                  const Icon = card.icon;
                  const active = (params.type || "") === card.key;
                  return (
                    <button
                      key={card.key}
                      onClick={() => router.push(`${basePath}/policy-rule?type=${card.key}`)}
                      className={`text-left rounded-sm border p-5 shadow-sm transition hover:shadow-md ${active
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`h-10 w-10 rounded-sm flex items-center justify-center ${active ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700"
                            }`}>
                            <Icon size={18} />
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900">{card.title}</div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{card.desc}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-xs font-semibold text-primary-600">
                        View policy →
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Policy Details (for selected card) */}
            {params.type ? (
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {POLICY_STYLES?.[params.type]?.label || params.type} Policy
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Common policies apply to every company. Your company can add custom policies under this category.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Table Content */}
            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600"></div>
                  <p className="mt-4 text-sm text-gray-500 font-medium">Loading policies...</p>
                </div>
              ) : policies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-full mb-4 border border-gray-100 dark:border-gray-800">
                    <FileText size={32} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No policies found</p>
                  <p className="text-sm">Create a new policy to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Policy Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created By</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scope</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration Summary</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {policies.map((policy) => {
                        const style = POLICY_STYLES[policy.type] || { badge: 'bg-gray-100 text-gray-600', icon: FileText };
                        const TypeIcon = style.icon;

                        return (
                          <tr key={policy.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">{policy.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">
                                  {policy.description || "No description provided"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold border ${style.badge}`}>
                                <TypeIcon size={12} />
                                {policy.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {policy.createdByUser ? `${policy.createdByUser.firstName} ${policy.createdByUser.lastName}` : 'Unknown'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {policy.creatorRole || policy.createdByUser?.systemRole || '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {isCommonPolicy(policy) ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500" /> Common
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Custom
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
                                {policy.type === 'ATTENDANCE' && (
                                  <>
                                    <span className="flex items-center gap-1"><Clock size={10} className="text-gray-400" /> Shift: {policy.shiftStart || policy.rules?.shiftStart || '-'} to {policy.shiftEnd || policy.rules?.shiftEnd || '-'}</span>
                                    <span>Grace: {policy.gracePeriodMinutes ?? policy.rules?.gracePeriodMinutes ?? 0}m</span>
                                  </>
                                )}
                                {policy.type === 'LEAVE' && (
                                  <>
                                    <span>Annual: {policy.annualLeaveCount ?? policy.rules?.annualLeaveCount ?? 0} days</span>
                                    <span>Sick: {policy.sickLeaveCount ?? policy.rules?.sickLeaveCount ?? 0} days</span>
                                  </>
                                )}
                                {policy.type === 'PAYROLL' && (
                                  <>
                                    <span>Cycle: {policy.salaryCycleStartDay || policy.rules?.salaryCycleStartDay || 1}-{policy.salaryCycleEndDay || policy.rules?.salaryCycleEndDay || 30}</span>
                                    <span>Tax: {policy.taxDeductionMethod || policy.rules?.taxDeductionMethod || 'PROJECTED'}</span>
                                  </>
                                )}
                                {policy.type === 'EXPENSE' && (
                                  <>
                                    <span>Limit: ${policy.autoApprovalLimit ?? policy.rules?.autoApprovalLimit ?? 0}</span>
                                    <span>Class: {policy.travelClassAllowed || policy.rules?.travelClassAllowed || 'ECONOMY'}</span>
                                  </>
                                )}
                                {policy.type === 'CUSTOM' && (
                                  <span className="line-clamp-2 italic text-gray-400">
                                    {policy.customRules || policy.rules?.customRules || 'No custom rules defined.'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {policy.isActive ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span> Inactive
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 rounded border border-gray-100 dark:border-gray-700">
                                  v{policy.version}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {/* Consistent Actions Buttons */}
                              <div className="flex items-center justify-end gap-2 relative">
                                <button
                                  onClick={(e) => handleActionButtonClick(e, policy.id)}
                                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                                  title="More Actions"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {actionMenu === policy.id && (
                                  <DropdownPortal
                                    isOpen={true}
                                    onClose={() => setActionMenu(null)}
                                    position={buttonPosition}
                                  >
                                    <div className="py-1 min-w-[160px]">
                                      <button
                                        onClick={() => {
                                          router.push(`${basePath}/policy-rule/view/${policy.id}`);
                                          setActionMenu(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                      >
                                        <div className="mr-3 text-gray-400">
                                          <Eye size={16} />
                                        </div>
                                        <span className="font-medium">View</span>
                                      </button>

                                      {canManagePolicies && (
                                        <>
                                          <button
                                            onClick={() => {
                                              router.push(`${basePath}/policy-rule/edit/${policy.id}`);
                                              setActionMenu(null);
                                            }}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                          >
                                            <div className="mr-3 text-gray-400">
                                              <Edit size={16} />
                                            </div>
                                            <span className="font-medium">Edit</span>
                                          </button>

                                          <hr className="my-1 border-gray-100 dark:border-gray-700" />

                                          <button
                                            onClick={() => {
                                              handleDeleteClick(policy);
                                              setActionMenu(null);
                                            }}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                                          >
                                            <div className="mr-3 text-red-500">
                                              <Trash2 size={16} />
                                            </div>
                                            <span className="font-medium">Delete</span>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </DropdownPortal>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer Pagination */}
              <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-900 dark:text-white">{(params.page - 1) * params.limit + 1}</span> - <span className="font-medium text-gray-900 dark:text-white">{Math.min(params.page * params.limit, totalDocs)}</span> of {totalDocs}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={params.page <= 1}
                    onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}
                    className="p-2 rounded-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={params.page * params.limit >= totalDocs}
                    onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
                    className="p-2 rounded-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- Assign Modal --- */}


      {/* --- Delete Confirmation --- */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Policy"
        message={`Are you sure you want to delete "${selectedPolicy?.name}"? This action cannot be undone.`}
        confirmText="Delete Policy"
        isDestructive={true}
      />
    </div>
  );
}
