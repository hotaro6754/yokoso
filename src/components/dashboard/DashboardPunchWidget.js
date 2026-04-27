"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock, LogIn, LogOut, Coffee } from "lucide-react";
import { employeeAttendanceService } from "@/services/employee/attendance.service";
import { toast } from "react-hot-toast";

export default function DashboardPunchWidget({ onPunchSuccess }) {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await employeeAttendanceService.getTodayStatus();
                setStatusData(response);
            } catch (error) {
                console.error("Failed to fetch attendance status", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handlePunch = async () => {
        try {
            setActionLoading(true);
            const isPunchedInNow = Boolean(statusData?.checkInTime && !statusData?.checkOutTime);

            let response;
            if (isPunchedInNow) {
                response = await employeeAttendanceService.punchOut();
                toast.success("Punched out successfully");
            } else {
                response = await employeeAttendanceService.punchIn();
                toast.success("Punched in successfully");
            }

            // The service already unwraps response.data.data
            // So response is the status object { checkInTime, checkOutTime, ... }
            if (response) {
                setStatusData(response);
                if (onPunchSuccess) onPunchSuccess();
            } else {
                // fallback fetch
                const refresh = await employeeAttendanceService.getTodayStatus();
                setStatusData(refresh);
                if (onPunchSuccess) onPunchSuccess();
            }

        } catch (error) {
            toast.error(error.message || "Failed to update attendance");
        } finally {
            setActionLoading(false);
        }
    };

    const isPunchedIn = Boolean(statusData?.checkInTime && !statusData?.checkOutTime);

    const workingHours = useMemo(() => {
        if (!statusData?.checkInTime) return "00:00";
        const start = new Date(statusData.checkInTime);
        const end = statusData.checkOutTime ? new Date(statusData.checkOutTime) : currentTime;

        if (isNaN(start.getTime())) return "00:00";

        const diffMs = end - start;
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
        const minutes = String(totalMinutes % 60).padStart(2, "0");
        return `${hours}:${minutes}`;
    }, [statusData, currentTime]);

    const greeting = useMemo(() => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, [currentTime]);

    if (loading) {
        return (
            <div className="glass-premium p-6 h-full animate-pulse flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between w-full">
                    <div className="space-y-3">
                        <div className="h-6 bg-white/10 rounded w-32"></div>
                        <div className="h-4 bg-white/5 rounded w-24"></div>
                    </div>
                    <div className="h-10 w-32 bg-white/10 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden glass-premium hairline-border p-6 transition-all duration-300 hover:bg-white/[0.04] group">

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left Side: Time & Status */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`h-2 w-2 rounded-full ${isPunchedIn ? 'bg-brand-400 animate-pulse' : 'bg-gray-300 dark:bg-white/20'}`} />
                        <span className="text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase font-display">
                            {isPunchedIn ? "Currently Working" : "Not Punched In"}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tighter tabular-nums">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </h2>
                        <p className="text-base font-medium text-gray-500 dark:text-gray-400 tracking-tight">
                            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 tracking-tight">
                            {greeting}! You've been working for <span className="font-bold text-brand-600 dark:text-brand-400">{workingHours} Hours</span> today.
                        </p>
                    </div>
                </div>

                {/* Right Side: Action Button */}
                <div className="flex-shrink-0 w-full md:w-auto">
                    <button
                        onClick={handlePunch}
                        disabled={actionLoading}
                        className={`
                            relative w-full md:w-48 py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300
                            flex items-center justify-center gap-3 active:scale-95
                            ${isPunchedIn
                                ? "bg-white/5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 shadow-none"
                                : "magnetic-btn bg-brand-500 text-white border-transparent hover:bg-brand-400 shadow-[0_0_20px_rgba(var(--brand-500-rgb),0.3)]"
                            }
                            ${actionLoading ? "opacity-75 cursor-wait" : ""}
                        `}
                    >
                        {actionLoading ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isPunchedIn ? (
                            <>
                                <LogOut size={18} />
                                <span>Punch Out</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                <span>Punch In</span>
                            </>
                        )}
                    </button>
                    {isPunchedIn && (
                        <p className="text-[10px] text-center text-gray-400 mt-2 font-medium tracking-tight">
                            Don't forget to take a break! <Coffee size={10} className="inline ml-0.5" />
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
