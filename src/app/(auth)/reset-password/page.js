"use client";
import React from 'react';
import AuthGuard from "@/components/auth/AuthGuard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Lock, Zap, Shield, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ResetPassword() {
    return (
        <AuthGuard requireAuth={false}>
            <div className="h-screen w-full flex overflow-hidden bg-white dark:bg-black">

                {/* --- LEFT COLUMN: Brand Experience (Desktop Only) --- */}
                <div className="hidden lg:flex w-[60%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#2f32a8]">

                    {/* Abstract Animated Background */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        {/* Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                    </div>

                    {/* Header: Logo */}
                    <Link href="/" className="relative z-10 flex items-center gap-3 w-fit cursor-pointer transition-transform hover:scale-105">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center overflow-hidden shadow-xl shadow-white/10 bg-white">
                            <Image
                                src="/images/logo/zodeck_logo.jpeg"
                                alt="Zodeck Logo"
                                width={48}
                                height={48}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-3xl font-bold text-white tracking-tight">Zodeck</span>
                    </Link>

                    {/* Center: Value Proposition */}
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-5xl font-medium text-white leading-[1.1] mb-8 tracking-tight">
                            Set a new password to <br />
                            <span className="text-white">
                                secure your account.
                            </span>
                        </h1>

                        <div className="grid grid-cols-2 gap-12 border-t border-white/25 pt-8 mt-12">
                            <div>
                                <p className="text-white font-medium text-lg">Secure Reset</p>
                                <p className="text-white text-sm mt-1">Your password will be updated securely.</p>
                            </div>
                            <div>
                                <p className="text-white font-medium text-lg">Instant Access</p>
                                <p className="text-white text-sm mt-1">Login immediately with your new password.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Trust Badges */}
                    <div className="relative z-10 flex gap-8 text-sm text-white font-medium items-center">
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm transition-colors">
                            <Shield className="w-4 h-4 text-emerald-500" /> Enhanced Security
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm transition-colors">
                            <Zap className="w-4 h-4 text-amber-500" /> Quick Process
                        </span>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Reset Password Interface --- */}
                <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-4 md:p-5 xl:p-6 relative z-20 bg-white dark:bg-gray-950 shadow-2xl overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-[420px]">
                        <ResetPasswordForm />
                    </div>
                </div>

            </div>
        </AuthGuard>
    );
}
