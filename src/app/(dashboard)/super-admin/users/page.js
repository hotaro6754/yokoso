// src/app/(dashboard)/company-admin/users/page.js (served via middleware rewrite)
// "use client";
// import Breadcrumb from '@/components/common/Breadcrumb';
// import UserTable from './components/UserTable';
// import { PlusCircle } from 'lucide-react';
// import Link from 'next/link';

// export default function UsersPage() {
//   return (
//     <div className="">
//       {/* Breadcrumb with Add User button */}
//       <Breadcrumb
//         rightContent={
//           <Link
//             href="/company-admin/users/add"
//             className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
//           >
//             <PlusCircle size={18} /> Add User
//           </Link>
//         }
//       />

//       <div className="bg-white rounded-lg shadow dark:bg-gray-800 mt-4">
//         <UserTable />
//       </div>
//     </div>
//   );
// }

"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Filter, Search, UserPlus, Users } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import UserTable from "./components/UserTable";

// Reuse existing dashboard widgets (UI only)
import WelcomeWrap from "../dashboard/components/WelcomeWrap";
import SystemStats from "../dashboard/components/SystemStats";
import SystemHealth from "../dashboard/components/SystemHealth";
import SecurityOverview from "../dashboard/components/SecurityOverview";
import ApiUsage from "../dashboard/components/ApiUsage";
import AuditLogs from "../dashboard/components/AuditLogs";
import UserActivity from "../dashboard/components/UserActivity";

export default function UsersPage() {
  const pathname = usePathname();
  const { user } = useAuth();

  const userName =
    user?.employee?.firstName || user?.email?.split("@")?.[0] || "Admin";

  // /company-admin/dashboard (served via middleware rewrite)
  if (pathname === "/company-admin/dashboard") {
    const pendingTasks = 6; // UI-only demo values
    const alerts = 2; // UI-only demo values

    return (
      <div className="space-y-6 pb-6">
        <Toaster position="top-right" />
        <WelcomeWrap userName={userName} systemAlerts={alerts} pendingTasks={pendingTasks} />
        <SystemStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <SystemHealth />
          <SecurityOverview />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ApiUsage />
          <AuditLogs />
        </div>
        <UserActivity />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 pt-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb />
        </div>

        {/* Primary Action */}
        <Link
          href="/company-admin/users/add"
          className="group inline-flex items-center gap-2 rounded-sm bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
        </Link>
      </div>

      {/* Main Content */}
      <UserTable />
    </div>
  );
}