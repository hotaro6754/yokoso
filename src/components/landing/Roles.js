"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const roles = [
  {
    id: "admin",
    label: "Company Admin",
    title: "Total Control",
    desc: "Manage org setup, RBAC, policy rules, workflows, and security for your company.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "hr",
    label: "HR Admin",
    title: "Operational Efficiency",
    desc: "Handle onboarding, exits, attendance corrections, and employee queries.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: "payroll",
    label: "Payroll Officer",
    title: "Accuracy & Compliance",
    desc: "Process salaries, manage tax deductions, and ensure statutory filings.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "employee",
    label: "Employees",
    title: "Self Service",
    desc: "Apply for leaves, view payslips, and mark attendance from anywhere.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
  }
];

export default function Roles() {
  const [activeTab, setActiveTab] = useState(roles[0]);

  return (
    <section id="roles" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Built for every role</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Granular access control for your entire organization.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Tabs */}
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:w-1/3 pb-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveTab(role)}
                className={`p-4 text-left rounded-xl border transition-all duration-300 flex items-center gap-4 ${
                  activeTab.id === role.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md transform scale-105"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className={`w-2 h-12 rounded-full ${activeTab.id === role.id ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}></div>
                <div>
                  <h4 className={`font-bold ${activeTab.id === role.id ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                    {role.label}
                  </h4>
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:w-2/3 relative h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {/* Background Image with Overlay */}
                <img 
                  src={activeTab.image} 
                  alt={activeTab.label} 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-white mb-4"
                  >
                    {activeTab.title}
                  </motion.h3>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-200 text-lg max-w-xl"
                  >
                    {activeTab.desc}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}