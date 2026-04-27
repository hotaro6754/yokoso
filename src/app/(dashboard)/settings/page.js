"use client";
import React, { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Mail, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { authService } from "@/services/auth-services/authService";
import toast from "react-hot-toast";
import Link from 'next/link';

export default function SettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await authService.forgotPassword(user?.email);
            if (response.success) {
                setSuccess(true);
                toast.success("Reset link sent successfully!");
            } else {
                setError(response.message || "Failed to send reset link.");
            }
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-8">
            <div className="w-full mx-auto">
                {/* Header Section */}
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/hr/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Update your account preferences and security</p>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-8">
                        {!success ? (
                            <div className="space-y-8">
                                {/* Feature Header */}
                                <div className="flex items-start gap-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                    <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Reset Password</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                            For security reasons, we send a password reset link to your registered email. 
                                            This ensures only the owner of the account can change the password.
                                        </p>
                                    </div>
                                </div>

                                {/* Form Section */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Registered Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                value={user?.email || ""}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 cursor-not-allowed text-sm font-medium"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">This is the email address associated with your Zodeck account.</p>
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-600 dark:text-red-400 flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-red-600"></div>
                                            {error}
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50 active:scale-95 group"
                                        >
                                            {loading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    Send Reset Link
                                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className="mb-8 flex justify-center">
                                    <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center animate-bounce shadow-xl shadow-emerald-100 dark:shadow-none">
                                        <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Email Sent Successfully!</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm mx-auto leading-relaxed">
                                    A password reset link has been dispatched to <br />
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{user?.email}</span>. <br />
                                    Please follow the link in your email to set a new password.
                                </p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold hover:text-indigo-600 transition-colors"
                                >
                                    <Lock size={18} />
                                    Request another link
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer Info */}
                    <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Your account data is secured with enterprise-grade encryption.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
