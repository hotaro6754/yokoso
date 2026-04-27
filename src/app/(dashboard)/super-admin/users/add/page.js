// src/app/(dashboard)/company-admin/users/add/page.js (served via middleware rewrite)
// "use client";
// import Breadcrumb from '@/components/common/Breadcrumb';
// import UserForm from '../components/UserForm';

// export default function AddUserPage() {
//   return (
//     <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
//       {/* Breadcrumb */}
//       <Breadcrumb 
//         items={[
//           { label: 'Dashboard', href: '/dashboard' },
//           { label: 'Company Admin', href: '/company-admin/dashboard' },
//           { label: 'User Management', href: '/company-admin/users' },
//           { label: 'Add User', href: '#' }
//         ]}
//         rightContent={null} 
//       />
      
//       <div className="bg-white rounded-lg shadow dark:bg-gray-800 mt-4">
//         <UserForm />
//       </div>
//     </div>
//   );
// }

"use client";
import Breadcrumb from '@/components/common/Breadcrumb';
import UserForm from '../components/UserForm';
import { UserPlus } from 'lucide-react';

export default function AddUserPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12 relative">
      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { label: 'Company Admin', href: '/company-admin/dashboard' },
              { label: 'User Management', href: '/company-admin/users' },
              { label: 'New User', href: '#' }
            ]}
          />
          <div className="mt-4 flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-sm shadow-lg shadow-blue-600/20 text-white">
              <UserPlus className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Create New User
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Create a new user, assign role access, and set reporting manager (if applicable).
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <UserForm />
      </div>
    </div>
  );
}
