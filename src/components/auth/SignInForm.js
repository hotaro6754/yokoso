"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, KeyRound  } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function SignInForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

// In your SignInForm.js file, update the DEMO_PROFILES array:
const DEMO_PROFILES = [
  {
    id: "master-admin",
    label: "Master Admin",
    email: "masteradmin@zodeck.com",
    pass: "master123",
    badge: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white dark:from-purple-700 dark:to-indigo-700",
  },
  {
    id: "company-admin",
    label: "Company Admin",
    email: "companyadmin@globalhr.com",
    pass: "company123",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  {
    id: "hr-admin",
    label: "HR Admin",
    email: "hr@globalhr.com",
    pass: "hr123",
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    id: "payroll-admin",
    label: "Payroll Admin",
    email: "payroll@globalhr.com",
    pass: "payroll123",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    id: "finance-admin",
    label: "Finance Admin",
    email: "financeadmin@globalhr.com",
    pass: "finance123",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    id: "manager",
    label: "Manager (MSS)",
    email: "manager@globalhr.com",
    pass: "manager123",
    badge:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
  {
    id: "employee",
    label: "Employee",
    email: "marketing@globalhr.com",
    pass: "marketing123",
    badge:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  },
  {
    id: "recruiter",
    label: "Recruiter",
    email: "recruiter@globalhr.com",
    pass: "recruiter123",
    badge:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
  {
    id: "it-admin",
    label: "IT Admin",
    email: "itadmin@globalhr.com",
    pass: "it123",
    badge:
      "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  },
  {
    id: "ld-manager",
    label: "L&D Manager",
    email: "ldmanager@globalhr.com",
    pass: "ld123",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
  {
    id: "dept-head",
    label: "Department Head",
    email: "depthead@globalhr.com",
    pass: "dept123",
    badge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
];

  const handleDemoFill = (profile) => {
    setFormData({ email: profile.email, password: profile.pass });
    setError("");
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await login(formData);
      if (result.success) {
        console.log('✅ Login successful, redirecting to:', result.redirect);
        // Use window.location.href for a hard redirect to ensure middleware processes correctly
        // if (result.redirect) {
        //   window.location.href = result.redirect;
        // } else {
        //   router.push("/employee/dashboard");
        // }
        const redirectTo = result.redirect || "/employee/dashboard";
        window.location.href = redirectTo;
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError("Network connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Sign in</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
          Welcome back to Zodeck. Please enter your details.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email Input */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="email@company.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="group">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <Link 
              href="/forgot-password" 
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2" size={20} />
            </>
          )}
        </button>

        {/* Error Message (fixed space prevents login layout shift) */}
        <div className="min-h-[52px]">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Demo Credentials Section */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound size={14} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Demo Access</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEMO_PROFILES.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => handleDemoFill(profile)}
              className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all group"
            >
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full mb-0.5 text-center leading-tight ${profile.badge}`}>
                {profile.label}
              </span>
              <span className="text-[10px] text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">Autofill</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}