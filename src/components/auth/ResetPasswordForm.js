"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/auth-services/authService";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryToken = searchParams.get('token');
    const [token, setToken] = useState(queryToken || "");

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Read token from query OR URL hash (preferred for security in email links)
    useEffect(() => {
        if (queryToken) {
            setToken(queryToken);
            return;
        }

        if (typeof window === "undefined") return;

        const hash = window.location.hash ? window.location.hash.slice(1) : "";
        const hashParams = new URLSearchParams(hash);
        const hashToken = hashParams.get("token");

        if (hashToken) {
            const decodedToken = decodeURIComponent(hashToken);
            setToken(decodedToken);
            // Remove token hash from address bar after reading it.
            window.history.replaceState({}, "", window.location.pathname + window.location.search);
        }
    }, [queryToken]);

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError("Invalid or missing reset token.");
                setTokenValid(false);
                setValidatingToken(false);
                return;
            }

            try {
                // For now, we'll accept any token format and let the backend validate it
                // The backend will validate the token when we try to reset the password
                setTokenValid(true);
                setValidatingToken(false);
            } catch (err) {
                setError("Invalid or expired reset token.");
                setTokenValid(false);
                setValidatingToken(false);
            }
        };

        validateToken();
    }, [token]);

    // Calculate password strength
    useEffect(() => {
        if (!formData.password) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;
        if (formData.password.length >= 8) strength += 25;
        if (formData.password.length >= 12) strength += 25;
        if (/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) strength += 25;
        if (/[0-9]/.test(formData.password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(formData.password)) strength += 10;

        setPasswordStrength(Math.min(strength, 100));
    }, [formData.password]);

    const getStrengthColor = () => {
        if (passwordStrength < 40) return "bg-red-500";
        if (passwordStrength < 70) return "bg-yellow-500";
        return "bg-emerald-500";
    };

    const getStrengthText = () => {
        if (passwordStrength < 40) return "Weak";
        if (passwordStrength < 70) return "Medium";
        return "Strong";
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            // Call the real reset password API
            const response = await authService.resetPassword(token, formData.password);
            
            if (response.success) {
                setSuccess(true);
                setLoading(false);

                // Redirect to sign in after 3 seconds
                setTimeout(() => {
                    router.push('/signin');
                }, 3000);
            } else {
                setError("Failed to reset password. Please try again.");
                setLoading(false);
            }
        } catch (err) {
            let errorMessage = "Failed to reset password. Please try again.";
            
            if (err.message) {
                if (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('expired')) {
                    errorMessage = "Password reset link is invalid or has expired. Please request a new password reset.";
                } else if (err.message.toLowerCase().includes('network') || 
                          err.message.toLowerCase().includes('connection')) {
                    errorMessage = "Network error. Please check your internet connection and try again.";
                } else if (err.message.toLowerCase().includes('server error')) {
                    errorMessage = "Server error occurred. Please try again later.";
                } else {
                    errorMessage = err.message;
                }
            }
            
            setError(errorMessage);
            setLoading(false);
        }
    };

    // Loading state while validating token
    if (validatingToken) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
            >
                <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                    Validating reset link...
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Please wait while we verify your reset token.
                </p>
            </motion.div>
        );
    }

    // Invalid token state
    if (!tokenValid) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
            >
                <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                    Invalid Reset Link
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    {error || "This password reset link is invalid or has expired."}
                </p>
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                >
                    Request New Reset Link
                    <ArrowRight className="ml-2" size={20} />
                </Link>
                <div className="mt-4">
                    <Link
                        href="/signin"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </motion.div>
        );
    }

    // Success state
    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
            >
                <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                    Password Reset Successful!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Your password has been successfully reset.<br />
                    Redirecting you to sign in...
                </p>
                <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                </div>
            </motion.div>
        );
    }

    // Main reset password form
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Header */}
            <div className="mb-8">
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-white">Z</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">odeck</span>
                    </div>
                </div>

                {/* Version badge (optional) */}
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight text-center">
                    Create new password
                </h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm text-center">
                    Enter your new password below.
                </p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password Input */}
                <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        New Password
                    </label>
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
                            placeholder="Enter new password"
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

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Password strength</span>
                                <span className={`text-xs font-medium ${passwordStrength < 40 ? 'text-red-600 dark:text-red-400' :
                                    passwordStrength < 70 ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                    {getStrengthText()}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                    style={{ width: `${passwordStrength}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password Input */}
                <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Confirm new password"
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* Password Requirements */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">Password Requirements:</p>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${formData.password.length >= 8
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {formData.password.length >= 8 && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            One uppercase letter (A-Z)
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${/[a-z]/.test(formData.password)
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {/[a-z]/.test(formData.password) && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            One lowercase letter (a-z)
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${/[0-9]/.test(formData.password)
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {/[0-9]/.test(formData.password) && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            One number (0-9)
                        </li>
                    </ul>
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
                            Resetting password...
                        </>
                    ) : (
                        <>
                            Reset Password
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
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                    Back to Sign In
                </Link>
            </div>
        </motion.div>
    );
}
