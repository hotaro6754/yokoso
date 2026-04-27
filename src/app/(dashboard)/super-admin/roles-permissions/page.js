// src/app/(dashboard)/company-admin/roles-permissions/page.js (served via middleware rewrite)
// "use client";
// import Breadcrumb from '@/components/common/Breadcrumb';
// import RoleTable from './components/RoleTable';
// import { PlusCircle } from 'lucide-react';
// import Link from 'next/link';

// export default function RolesPermissionsPage() {
//   return (
//     <div className="">
//       {/* Breadcrumb with Add Role button */}
//       <Breadcrumb
//         rightContent={
//           <Link
//             href="/company-admin/roles-permissions/add"
//             className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
//           >
//             <PlusCircle size={18} /> Add New Role
//           </Link>
//         }
//       />

//       <div className="bg-white rounded-lg shadow dark:bg-gray-800">
//         <RoleTable />
//       </div>
//     </div>
//   );
// }

"use client";
import Breadcrumb from '@/components/common/Breadcrumb';
import RoleTable from './components/RoleTable';
import { Plus, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function RolesPermissionsPage() {
  return (
    <div className="min-h-screen space-y-8 pb-10 pt-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb />
        </div>

        {/* Primary Action */}
        <Link
          href="/company-admin/roles-permissions/add"
          className="group inline-flex items-center gap-2 rounded-sm bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Create New Role</span>
        </Link>
      </div>

      {/* Table Section */}
      <RoleTable />
    </div>
  );
}
