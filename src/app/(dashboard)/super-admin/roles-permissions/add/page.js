// src/app/(dashboard)/company-admin/roles-permissions/add/page.js (served via middleware rewrite)
// "use client";
// import Breadcrumb from '@/components/common/Breadcrumb';
// import RoleForm from '../components/RoleForm';

// export default function AddRolePage() {
//   return (
//     <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
//       {/* Breadcrumb */}
//       <Breadcrumb 
//         items={[
//           { label: 'Dashboard', href: '/dashboard' },
//           { label: 'Company Admin', href: '/company-admin/dashboard' },
//           { label: 'Roles & Permissions', href: '/company-admin/roles-permissions' },
//           { label: 'Add Role', href: '#' }
//         ]}
//         rightContent={null} 
//       />
      
//       <div className="bg-white rounded-lg shadow dark:bg-gray-800 mt-4">
//         <RoleForm />
//       </div>
//     </div>
//   );
// }

"use client";
import Breadcrumb from '@/components/common/Breadcrumb';
import RoleForm from '../components/RoleForm';
import { ShieldPlus } from 'lucide-react';

export default function AddRolePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { label: 'Company Admin', href: '/company-admin/dashboard' },
              { label: 'Roles & Permissions', href: '/company-admin/roles-permissions' },
              { label: 'New Role', href: '#' }
            ]}
          />
         
        </div>

        {/* Content */}
        <RoleForm />
      </div>
    </div>
  );
}