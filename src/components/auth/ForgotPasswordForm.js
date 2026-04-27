"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2, LifeBuoy } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/auth-services/authService";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError("");
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const maskEmail = (rawEmail) => {
        const normalizedEmail = (rawEmail || "").trim();
        const atIndex = normalizedEmail.indexOf("@");

        if (atIndex <= 0) return normalizedEmail;

        const localPart = normalizedEmail.slice(0, atIndex);
        const domainPart = normalizedEmail.slice(atIndex + 1);
        const firstChar = localPart.charAt(0);
        const lastChar = localPart.charAt(localPart.length - 1);

        if (localPart.length === 1) {
            return `${firstChar}****@${domainPart}`;
        }

        if (localPart.length === 2) {
            return `${firstChar}****${lastChar}@${domainPart}`;
        }

        return `${firstChar}****${lastChar}@${domainPart}`;
    };

    const formatCooldown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        if (!success || resendCooldown <= 0) return undefined;

        const timer = setInterval(() => {
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [success, resendCooldown]);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const resetToFormState = () => {
            setSuccess(false);
            setSubmittedEmail("");
            setEmail("");
            setResendCooldown(0);
            setResending(false);
            setError("");
        };

        // Always insert a local history guard so first browser-back stays on this form.
        window.history.pushState(
            { forgotPasswordGuard: true },
            "",
            `${window.location.pathname}${window.location.search}`
        );

        const handlePopState = () => {
            if (window.location.pathname !== "/forgot-password") return;
            resetToFormState();

            // Keep user on forgot-password form for re-entry when pressing back.
            window.history.pushState(
                { forgotPasswordGuard: true },
                "",
                `${window.location.pathname}${window.location.search}`
            );
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    useEffect(() => {
        if (!success || typeof window === "undefined") return;
        window.history.pushState(
            { forgotPasswordGuard: true, forgotPasswordSuccess: true },
            "",
            `${window.location.pathname}${window.location.search}#sent`
        );
    }, [success]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Client-side validation
        if (!email.trim()) {
            setError("Please enter your email address");
            setLoading(false);
            return;
        }

        const normalizedEmail = email.trim();

        if (!validateEmail(normalizedEmail)) {
            setError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        try {
            // Call the real forgot password API
            const response = await authService.forgotPassword(normalizedEmail);
            
            if (response.success) {
                setSubmittedEmail(normalizedEmail);
                setSuccess(true);
            } else {
                setError("Failed to send reset link. Please try again.");
            }
        } catch (err) {
            // Handle different types of errors with specific messages
            let errorMessage = "Failed to send reset link. Please try again.";
            
            if (err.message) {
                // Check for specific error patterns
                if (err.message.toLowerCase().includes('email configuration') || 
                    err.message.toLowerCase().includes('email service')) {
                    errorMessage = "Email service is currently unavailable. Please contact support or try again later.";
                } else if (err.message.toLowerCase().includes('network') || 
                          err.message.toLowerCase().includes('connection') ||
                          err.message.toLowerCase().includes('fetch')) {
                    errorMessage = "Network error. Please check your internet connection and try again.";
                } else if (err.message.toLowerCase().includes('server error') || 
                          err.message.toLowerCase().includes('internal server')) {
                    errorMessage = "Server error occurred. Please try again later.";
                } else if (err.message.toLowerCase().includes('too many requests') || 
                          err.message.toLowerCase().includes('rate limit')) {
                    errorMessage = "Too many requests. Please wait a few minutes before trying again.";
                } else if (err.message.toLowerCase().includes('valid email')) {
                    errorMessage = "Please enter a valid email address.";
                } else {
                    // Use the actual error message if it's user-friendly
                    errorMessage = err.message;
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resending || resendCooldown > 0 || !submittedEmail) return;

        try {
            setResending(true);
            await authService.forgotPassword(submittedEmail);
            setResendCooldown(60);
        } catch (err) {
            setError(err.message || "Failed to resend reset link. Please try again.");
            setSuccess(false);
        } finally {
            setResending(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
            >
                {/* Success Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                        Check your email
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        We've sent a password reset link to<br />
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                            <Mail className="h-4 w-4 text-indigo-500" />
                            {maskEmail(submittedEmail)}
                        </span>
                    </p>
                </div>

                {/* Instructions */}
                <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        Check your email for reset instructions. (Check spam if it&apos;s missing)
                    </p>
                </div>

                {/* Back to Sign In */}
                <Link
                    href="/signin"
                    className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Sign In
                </Link>

                {/* Resend Link */}
                <div className="mt-6">
                    <button
                        onClick={handleResend}
                        disabled={resending || resendCooldown > 0}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {resending
                            ? "Resending..."
                            : resendCooldown > 0
                                ? `Resend in ${formatCooldown(resendCooldown)}`
                                : "Didn't receive the email? Try again"}
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Forgot password?
                </h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                    No worries, we'll send you reset instructions.
                </p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="email@company.com"
                            required
                            disabled={loading}
                        />
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
                            Sending reset link...
                        </>
                    ) : (
                        <>
                            Reset password
                            <ArrowRight className="ml-2" size={20} />
                        </>
                    )}
                </button>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                        >
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            {/* Back to Sign In Link */}
            <div className="mt-6 text-center">
                <Link
                    href="/signin"
                    className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                    <ArrowLeft className="mr-1" size={16} />
                    Back to Sign In
                </Link>
            </div>

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Need help accessing your account?
                    </p>
                    <a
                        href="mailto:support@zodeck.com"
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-semibold transition-colors"
                    >
                        <LifeBuoy className="h-3.5 w-3.5" />
                        Contact Support
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
