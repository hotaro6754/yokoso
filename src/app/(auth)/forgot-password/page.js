"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthGuard from "@/components/auth/AuthGuard";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { ShieldCheck, Globe, Zap, Star } from 'lucide-react';

export default function ForgotPassword() {
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-white text-sm font-medium mb-8">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>Trusted by 4,000+ Enterprises</span>
                        </div>
                        <h1 className="text-5xl font-medium text-white leading-[1.1] mb-8 tracking-tight">
                            The operating system for <br />
                            <span className="text-white">
                                modern workforce.
                            </span>
                        </h1>

                        <div className="grid grid-cols-2 gap-12 border-t border-white/25 pt-8 mt-12">
                            <div>
                                <p className="text-white font-medium text-lg">99.9% Uptime</p>
                                <p className="text-white text-sm mt-1">Enterprise-grade reliability guarantees.</p>
                            </div>
                            <div>
                                <p className="text-white font-medium text-lg">Payroll</p>
                                <p className="text-white text-sm mt-1">Automated compliance across 100+ regions.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Trust Badges */}
                    <div className="relative z-10 flex gap-8 text-sm text-white font-medium items-center">
                        <a
                            href="https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> SOC2 Type II
                        </a>
                        <a
                            href="https://www.iso.org/isoiec-27001-information-security.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <Globe className="w-4 h-4 text-blue-500" /> ISO 27001
                        </a>
                        <a
                            href="https://commission.europa.eu/law/law-topic/data-protection/data-protection-eu_en"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <Zap className="w-4 h-4 text-amber-500" /> GDPR Ready
                        </a>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Forgot Password Interface --- */}
                <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-4 md:p-5 xl:p-6 relative z-20 bg-white dark:bg-gray-950 shadow-2xl overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-[420px]">
                        <ForgotPasswordForm />
                    </div>
                </div>

            </div>
        </AuthGuard>
    );
}
