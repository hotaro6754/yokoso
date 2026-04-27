// // import { motion } from "framer-motion";
// // import { 
// //   Users, 
// //   CalendarCheck, 
// //   DollarSign, 
// //   TrendingUp,
// //   Bell,
// //   CheckCircle,
// //   Clock,
// //   BarChart3
// // } from "lucide-react";

// // const DashboardCard = ({ 
// //   children, 
// //   className = "",
// //   delay = 0 
// // }) => (
// //   <motion.div
// //     initial={{ opacity: 0, y: 20 }}
// //     animate={{ opacity: 1, y: 0 }}
// //     transition={{ delay, duration: 0.5 }}
// //     className={`bg-white rounded-2xl shadow-card-hover border border-border/50 ${className}`}
// //   >
// //     {children}
// //   </motion.div>
// // );

// // export const FloatingDashboard = () => {
// //   return (
// //     <div className="relative w-full h-[600px] perspective-1000">
// //       {/* Main Dashboard Container with 3D Transform */}
// //       <motion.div
// //         animate={{ 
// //           rotateY: [0, 2, 0],
// //           rotateX: [0, -2, 0],
// //         }}
// //         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
// //         className="relative w-full h-full"
// //         style={{ transformStyle: "preserve-3d" }}
// //       >
// //         {/* Main Dashboard */}
// //         <motion.div
// //           className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-3xl shadow-float border border-white/50 p-6 overflow-hidden"
// //           style={{ transform: "translateZ(0px)" }}
// //         >
// //           {/* Dashboard Header */}
// //           <div className="flex items-center justify-between mb-6">
// //             <div>
// //               <h3 className="font-display font-semibold text-lg text-foreground">HR Dashboard</h3>
// //               <p className="text-sm text-muted-foreground">Welcome back, Admin</p>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
// //                 <Bell className="w-5 h-5 text-muted-foreground" />
// //               </div>
// //               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70" />
// //             </div>
// //           </div>

// //           {/* Stats Grid */}
// //           <div className="grid grid-cols-2 gap-4 mb-6">
// //             <DashboardCard className="p-4" delay={0.1}>
// //               <div className="flex items-center gap-3">
// //                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
// //                   <Users className="w-5 h-5 text-primary" />
// //                 </div>
// //                 <div>
// //                   <p className="text-2xl font-bold text-foreground">2,847</p>
// //                   <p className="text-xs text-muted-foreground">Total Employees</p>
// //                 </div>
// //               </div>
// //             </DashboardCard>

// //             <DashboardCard className="p-4" delay={0.2}>
// //               <div className="flex items-center gap-3">
// //                 <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
// //                   <CalendarCheck className="w-5 h-5 text-green-600" />
// //                 </div>
// //                 <div>
// //                   <p className="text-2xl font-bold text-foreground">96.2%</p>
// //                   <p className="text-xs text-muted-foreground">Attendance Rate</p>
// //                 </div>
// //               </div>
// //             </DashboardCard>

// //             <DashboardCard className="p-4" delay={0.3}>
// //               <div className="flex items-center gap-3">
// //                 <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
// //                   <DollarSign className="w-5 h-5 text-accent" />
// //                 </div>
// //                 <div>
// //                   <p className="text-2xl font-bold text-foreground">₹24.5L</p>
// //                   <p className="text-xs text-muted-foreground">Payroll This Month</p>
// //                 </div>
// //               </div>
// //             </DashboardCard>

// //             <DashboardCard className="p-4" delay={0.4}>
// //               <div className="flex items-center gap-3">
// //                 <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
// //                   <TrendingUp className="w-5 h-5 text-purple-600" />
// //                 </div>
// //                 <div>
// //                   <p className="text-2xl font-bold text-foreground">+12.4%</p>
// //                   <p className="text-xs text-muted-foreground">Growth Rate</p>
// //                 </div>
// //               </div>
// //             </DashboardCard>
// //           </div>

// //           {/* Chart Placeholder */}
// //           <DashboardCard className="p-4 mb-4" delay={0.5}>
// //             <div className="flex items-center justify-between mb-4">
// //               <span className="text-sm font-medium text-foreground">Weekly Attendance</span>
// //               <BarChart3 className="w-4 h-4 text-muted-foreground" />
// //             </div>
// //             <div className="flex items-end gap-2 h-24">
// //               {[65, 80, 45, 90, 75, 85, 70].map((height, i) => (
// //                 <motion.div
// //                   key={i}
// //                   initial={{ height: 0 }}
// //                   animate={{ height: `${height}%` }}
// //                   transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
// //                   className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-md"
// //                 />
// //               ))}
// //             </div>
// //           </DashboardCard>
// //         </motion.div>

// //         {/* Floating Card 1 - Notifications */}
// //         <motion.div
// //           animate={{ y: [0, -10, 0] }}
// //           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
// //           className="absolute -right-8 top-20 w-56 bg-white rounded-2xl shadow-float p-4 border border-border/50"
// //           style={{ transform: "translateZ(60px)" }}
// //         >
// //           <div className="flex items-start gap-3">
// //             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
// //               <CheckCircle className="w-4 h-4 text-green-600" />
// //             </div>
// //             <div>
// //               <p className="text-sm font-medium text-foreground">Leave Approved</p>
// //               <p className="text-xs text-muted-foreground">John's leave request approved</p>
// //             </div>
// //           </div>
// //         </motion.div>

// //         {/* Floating Card 2 - Quick Stats */}
// //         <motion.div
// //           animate={{ y: [0, 10, 0] }}
// //           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
// //           className="absolute -left-8 bottom-32 w-48 bg-white rounded-2xl shadow-float p-4 border border-border/50"
// //           style={{ transform: "translateZ(40px)" }}
// //         >
// //           <div className="flex items-center gap-3">
// //             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
// //               <Clock className="w-5 h-5 text-primary" />
// //             </div>
// //             <div>
// //               <p className="text-lg font-bold text-foreground">24</p>
// //               <p className="text-xs text-muted-foreground">Pending Approvals</p>
// //             </div>
// //           </div>
// //         </motion.div>

// //         {/* Decorative Elements */}
// //         <motion.div
// //           animate={{ rotate: 360 }}
// //           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
// //           className="absolute -right-16 -bottom-16 w-32 h-32 border-4 border-dashed border-primary/20 rounded-full"
// //         />
// //         <motion.div
// //           animate={{ scale: [1, 1.1, 1] }}
// //           transition={{ duration: 4, repeat: Infinity }}
// //           className="absolute -left-12 top-16 w-24 h-24 bg-accent/10 rounded-full blur-2xl"
// //         />
// //       </motion.div>
// //     </div>
// //   );
// // };

// "use client";

// import { motion } from "framer-motion";
// import { 
//   Users, 
//   CalendarCheck, 
//   DollarSign, 
//   TrendingUp,
//   Bell,
//   CheckCircle,
//   Clock,
//   BarChart3
// } from "lucide-react";

// const DashboardCard = ({ 
//   children, 
//   className = "",
//   delay = 0 
// }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ delay, duration: 0.5 }}
//     className={`bg-white rounded-2xl shadow-card-hover border border-border/50 ${className}`}
//   >
//     {children}
//   </motion.div>
// );

// export const FloatingDashboard = () => {
//   return (
//     <div className="relative w-full h-[600px] perspective-1000">
//       {/* Main Dashboard Container with 3D Transform */}
//       <motion.div
//         animate={{ 
//           rotateY: [0, 2, 0],
//           rotateX: [0, -2, 0],
//         }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         className="relative w-full h-full"
//         style={{ transformStyle: "preserve-3d" }}
//       >
//         {/* Main Dashboard */}
//         <motion.div
//           className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-3xl shadow-float border border-white/50 p-6 overflow-hidden"
//           style={{ transform: "translateZ(0px)" }}
//         >
//           {/* Dashboard Header */}
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h3 className="font-display font-semibold text-lg text-foreground">HR Dashboard</h3>
//               <p className="text-sm text-muted-foreground">Welcome back, Admin</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
//                 <Bell className="w-5 h-5 text-muted-foreground" />
//               </div>
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70" />
//             </div>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <DashboardCard className="p-4" delay={0.1}>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
//                   <Users className="w-5 h-5 text-primary" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-foreground">2,847</p>
//                   <p className="text-xs text-muted-foreground">Total Employees</p>
//                 </div>
//               </div>
//             </DashboardCard>

//             <DashboardCard className="p-4" delay={0.2}>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
//                   <CalendarCheck className="w-5 h-5 text-green-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-foreground">96.2%</p>
//                   <p className="text-xs text-muted-foreground">Attendance Rate</p>
//                 </div>
//               </div>
//             </DashboardCard>

//             <DashboardCard className="p-4" delay={0.3}>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
//                   <DollarSign className="w-5 h-5 text-accent" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-foreground">₹24.5L</p>
//                   <p className="text-xs text-muted-foreground">Payroll This Month</p>
//                 </div>
//               </div>
//             </DashboardCard>

//             <DashboardCard className="p-4" delay={0.4}>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
//                   <TrendingUp className="w-5 h-5 text-purple-600" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-foreground">+12.4%</p>
//                   <p className="text-xs text-muted-foreground">Growth Rate</p>
//                 </div>
//               </div>
//             </DashboardCard>
//           </div>

//           {/* Chart Placeholder */}
//           <DashboardCard className="p-4 mb-4" delay={0.5}>
//             <div className="flex items-center justify-between mb-4">
//               <span className="text-sm font-medium text-foreground">Weekly Attendance</span>
//               <BarChart3 className="w-4 h-4 text-muted-foreground" />
//             </div>
//             <div className="flex items-end gap-2 h-24">
//               {[65, 80, 45, 90, 75, 85, 70].map((height, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ height: 0 }}
//                   animate={{ height: `${height}%` }}
//                   transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
//                   className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-md"
//                 />
//               ))}
//             </div>
//           </DashboardCard>
//         </motion.div>

//         {/* Floating Card 1 - Notifications */}
//         <motion.div
//           animate={{ y: [0, -10, 0] }}
//           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//           className="absolute -right-8 top-20 w-56 bg-white rounded-2xl shadow-float p-4 border border-border/50"
//           style={{ transform: "translateZ(60px)" }}
//         >
//           <div className="flex items-start gap-3">
//             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
//               <CheckCircle className="w-4 h-4 text-green-600" />
//             </div>
//             <div>
//               <p className="text-sm font-medium text-foreground">Leave Approved</p>
//               <p className="text-xs text-muted-foreground">John's leave request approved</p>
//             </div>
//           </div>
//         </motion.div>

//         {/* Floating Card 2 - Quick Stats */}
//         <motion.div
//           animate={{ y: [0, 10, 0] }}
//           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//           className="absolute -left-8 bottom-32 w-48 bg-white rounded-2xl shadow-float p-4 border border-border/50"
//           style={{ transform: "translateZ(40px)" }}
//         >
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
//               <Clock className="w-5 h-5 text-primary" />
//             </div>
//             <div>
//               <p className="text-lg font-bold text-foreground">24</p>
//               <p className="text-xs text-muted-foreground">Pending Approvals</p>
//             </div>
//           </div>
//         </motion.div>

//         {/* Decorative Elements */}
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//           className="absolute -right-16 -bottom-16 w-32 h-32 border-4 border-dashed border-primary/20 rounded-full"
//         />
//         <motion.div
//           animate={{ scale: [1, 1.1, 1] }}
//           transition={{ duration: 4, repeat: Infinity }}
//           className="absolute -left-12 top-16 w-24 h-24 bg-accent/10 rounded-full blur-2xl"
//         />
//       </motion.div>
//     </div>
//   );
// };

"use client";

import { motion } from "framer-motion";
import {
  Users,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Bell,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";

const DashboardCard = ({
  children,
  className = "",
  delay = 0
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}
  >
    {children}
  </motion.div>
);

export const FloatingDashboard = () => {
  return (
    <div className="relative w-full h-[450px] perspective-1000">
      {/* Main Dashboard Container with 3D Transform */}
      <motion.div
        animate={{
          rotateY: [0, 2, 0],
          rotateX: [0, -2, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Main Dashboard */}
        <motion.div
          className="absolute inset-0 bg-white backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-5 overflow-hidden"
          style={{ transform: "translateZ(0px)" }}
        >
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-gray-900">HR Dashboard</h3>
              <p className="text-xs text-gray-600">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary-50 flex items-center justify-center">
                <Bell className="w-4 h-4 text-gray-500" />
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-400" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <DashboardCard className="p-3" delay={0.1}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">2,847</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Employees</p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard className="p-3" delay={0.2}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4 text-success-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">96.2%</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Attendance</p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard className="p-3" delay={0.3}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-accent-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">₹24.5L</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Payroll</p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard className="p-3" delay={0.4}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">+12.4%</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Growth</p>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Chart Placeholder */}
          <DashboardCard className="p-3 mb-3" delay={0.5}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-900">Weekly Attendance</span>
              <BarChart3 className="w-3 h-3 text-gray-500" />
            </div>
            <div className="flex items-end gap-2 h-20">
              {[65, 80, 45, 90, 75, 85, 70].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-sm"
                />
              ))}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Floating Card 1 - Notifications */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-8 top-20 w-56 bg-white rounded-2xl shadow-2xl p-4 border border-gray-200"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-success-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Leave Approved</p>
              <p className="text-xs text-gray-600">John's leave request approved</p>
            </div>
          </div>
        </motion.div>

        {/* Floating Card 2 - Quick Stats */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -left-8 bottom-32 w-48 bg-white rounded-2xl shadow-2xl p-4 border border-gray-200"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">24</p>
              <p className="text-xs text-gray-600">Pending Approvals</p>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -right-16 -bottom-16 w-32 h-32 border-4 border-dashed border-brand-200 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -left-12 top-16 w-24 h-24 bg-accent-100 rounded-full blur-2xl"
        />
      </motion.div>
    </div>
  );
};

export default FloatingDashboard;