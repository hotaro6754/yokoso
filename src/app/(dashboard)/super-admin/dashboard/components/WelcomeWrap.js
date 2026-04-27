// src/app/(dashboard)/company-admin/dashboard/components/WelcomeWrap.js (served via middleware rewrite)
// import React from "react";
// import Link from "next/link";

// const WelcomeWrap = ({ userName, systemAlerts, pendingTasks, avatarUrl }) => {
//   return (
//     <div className="card bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg shadow-sm border-0 overflow-hidden text-white">
//       <div className="card-body p-6">
//         <div className="flex flex-col md:flex-row items-center justify-between">
//           <div className="mb-4 md:mb-0">
//             <h4 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h4>
//             <p className="opacity-90">
//               System Overview & Administration Dashboard
//             </p>
//           </div>

//           <div className="flex space-x-4">
//             <div className="text-center">
//               <div className="bg-white/20 rounded-lg px-4 py-2">
//                 <span className="block text-xl font-bold">{systemAlerts}</span>
//                 <span className="block text-sm">System Alerts</span>
//               </div>
//             </div>

//             <div className="text-center">
//               <div className="bg-white/20 rounded-lg px-4 py-2">
//                 <span className="block text-xl font-bold">{pendingTasks}</span>
//                 <span className="block text-sm">Pending Tasks</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 pt-4 border-t border-white/20">
//           <div className="flex flex-wrap gap-2">
//             <Link
//               href="/company-admin/roles-permissions"
//               className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
//             >
//               Manage Roles
//             </Link>
//             <Link
//               href="/company-admin/notification-settings"
//               className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
//             >
//               System Settings
//             </Link>
//             <Link
//               href="/company-admin/security-audit-logs"
//               className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
//             >
//               View Audit Logs
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WelcomeWrap;

import React from "react";
import Link from "next/link";
import { Shield, Settings, FileText, Bell } from "lucide-react";

const WelcomeWrap = ({ userName, systemAlerts, pendingTasks }) => {
  // Current Date Formatter
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-transparent dark:bg-transparent border">
      {" "}
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px]  rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>
      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        {/* Left: Greeting */}
        <div className="space-y-4 w-full">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-700 tracking-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {userName}
              </span>
            </h1>

            <p className="text-slate-400 text-sm md:text-base">
              System overview for{" "}
              <span className="text-slate-400 font-medium">{today}</span>. You
              have{" "}
              <span className="text-indigo-400 font-semibold">
                {pendingTasks} pending tasks
              </span>{" "}
              requiring attention.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// Sub-component for buttons
const QuickAction = ({ href, icon: Icon, label }) => (
  <Link
    href={href}
    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-sm text-sm font-medium text-white transition-all hover:scale-105 active:scale-95"
  >
    <Icon size={16} className="text-indigo-300" />
    {label}
  </Link>
);

export default WelcomeWrap;
