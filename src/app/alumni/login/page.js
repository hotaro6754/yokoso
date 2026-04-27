"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LogIn, Mail, Lock, ShieldCheck } from "lucide-react";

export default function AlumniLoginPage() {
    const [tempId, setTempId] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/alumni-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempId, tempPassword })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('alumni_token', result.data.token);
                localStorage.setItem('alumni_user', JSON.stringify(result.data.user));
                toast.success("Welcome back to the Portal");
                router.push("/alumni/dashboard");
            } else {
                toast.error(result.message || "Invalid credentials");
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error("An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-brand-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg rotate-3">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Portal Access</h1>
                    <p className="text-gray-500 dark:text-gray-400">Access your professional records & onboarding documents.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Temporary ID"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                                value={tempId}
                                onChange={(e) => setTempId(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Temporary Password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                                value={tempPassword}
                                onChange={(e) => setTempPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:shadow-brand-500/20 transition-all active:scale-95 flex justify-center items-center gap-2"
                    >
                        {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Explore Alumni Portal
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-6 border-t dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-400">
                        Having trouble logging in? Contact <a href="#" className="text-brand-500 font-semibold">hr@zodeck.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
