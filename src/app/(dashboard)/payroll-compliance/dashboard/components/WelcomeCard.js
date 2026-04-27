"use client";

import { motion } from "framer-motion";
import { Shield, Settings, FileText, Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function WelcomeCard() {
  const userName = "Admin"; // You can get this from user context/state
  const pendingTasks = 0;
  const systemAlerts = 0;
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const quickActions = [
    {
      id: 1,
      label: "Manage Payroll",
      icon: Shield,
      href: "/payroll-compliance/payroll",
      color: "bg-brand-500 hover:bg-brand-600"
    },
    {
      id: 2,
      label: "Settings",
      icon: Settings,
      href: "/payroll-compliance/settings",
      color: "bg-brand-500 hover:bg-brand-600"
    },
    {
      id: 3,
      label: "Reports",
      icon: FileText,
      href: "/payroll-compliance/reports",
      color: "bg-brand-500 hover:bg-brand-600"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 dark:from-brand-700 dark:via-brand-600 dark:to-brand-800 p-6 sm:p-8 shadow-xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl -ml-40 -mb-40"></div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Section - Welcome Message */}
          <div className="flex-1">
            {/* System Status */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-300" />
                <span className="text-sm font-medium text-white">System Operational</span>
              </div>
            </div>

            {/* Welcome Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              Welcome back, {userName}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-white/90 mb-6">
              Here is your system overview for <span className="font-semibold">{currentDate}</span>. 
              You have{" "}
              <span className="font-bold text-white bg-white/20 px-2 py-1 rounded-lg">
                {pendingTasks} pending tasks
              </span>{" "}
              requiring attention.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={action.href}
                      className={`${action.color} text-white px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200`}
                    >
                      <Icon className="w-5 h-5" />
                      {action.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Section - System Alerts */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:ml-6"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl min-w-[200px]">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="mb-4"
                >
                  <div className="p-4 bg-yellow-400/20 rounded-xl">
                    <Bell className="w-8 h-8 text-yellow-300" />
                  </div>
                </motion.div>
                <div className="text-4xl font-bold text-white mb-1">
                  {systemAlerts}
                </div>
                <div className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                  System Alerts
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
