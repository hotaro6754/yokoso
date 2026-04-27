// // src/app/(dashboard)/employee/assets/page.js
// "use client";
// import { useState, useEffect } from 'react';
// import { Package, Settings, Download, Eye } from 'lucide-react';
// import Breadcrumb from '@/components/common/Breadcrumb';

// export default function EmployeeAssets() {
//   const [assets, setAssets] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Mock data - in real app, fetch from API based on logged-in employee
//     const mockAssets = [
//       {
//         id: 'AST-001',
//         name: 'Dell Latitude 5420',
//         category: 'Laptop',
//         serialNumber: 'DL5420X12345',
//         model: 'Latitude 5420',
//         status: 'assigned',
//         condition: 'excellent',
//         assignedDate: '2023-01-20',
//         warrantyExpiry: '2025-01-14',
//         notes: '15.6" FHD Display, 16GB RAM, 512GB SSD'
//       },
//       {
//         id: 'AST-002',
//         name: 'iPhone 13 Pro',
//         category: 'Mobile Phone',
//         serialNumber: 'IP13P67890',
//         model: 'iPhone 13 Pro',
//         status: 'assigned',
//         condition: 'good',
//         assignedDate: '2023-02-15',
//         warrantyExpiry: '2024-02-09',
//         notes: '128GB, Sierra Blue'
//       }
//     ];
//     setAssets(mockAssets);
//     setLoading(false);
//   }, []);

//   if (loading) {
//     return (
//       <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
//         <Breadcrumb />
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
//           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
//           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
//       <Breadcrumb />

//       <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Assets</h1>
//           <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">
//             <Download size={18} /> Export
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {assets.map((asset) => (
//             <div key={asset.id} className="border border-gray-200 rounded-lg p-6 dark:border-gray-700">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center">
//                   <Package className="w-8 h-8 text-blue-600 mr-3" />
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       {asset.name}
//                     </h3>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       {asset.category}
//                     </p>
//                   </div>
//                 </div>
//                 <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-400">
//                   {asset.status}
//                 </span>
//               </div>

//               <div className="space-y-2 mb-4">
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600 dark:text-gray-400">Model:</span>
//                   <span className="text-sm font-medium">{asset.model}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600 dark:text-gray-400">Serial No:</span>
//                   <span className="text-sm font-medium">{asset.serialNumber}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600 dark:text-gray-400">Assigned:</span>
//                   <span className="text-sm font-medium">{asset.assignedDate}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600 dark:text-gray-400">Warranty:</span>
//                   <span className="text-sm font-medium">{asset.warrantyExpiry}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600 dark:text-gray-400">Condition:</span>
//                   <span className="text-sm font-medium text-green-600 dark:text-green-400">
//                     {asset.condition}
//                   </span>
//                 </div>
//               </div>

//               {asset.notes && (
//                 <div className="mb-4">
//                   <p className="text-sm text-gray-600 dark:text-gray-400">{asset.notes}</p>
//                 </div>
//               )}

//               <div className="flex space-x-2">
//                 <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
//                   <Eye className="w-4 h-4 mr-1" /> View
//                 </button>
//                 <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
//                   <Settings className="w-4 h-4 mr-1" /> Request Service
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {assets.length === 0 && (
//           <div className="text-center py-12">
//             <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assets assigned</h3>
//             <p className="text-gray-500 dark:text-gray-400">
//               You don't have any assets assigned to you yet.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }