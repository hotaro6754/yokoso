"use client";
import { useEffect, useMemo, useState } from "react";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AttendanceWidget({ data }) {
    if (!data) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>;

    const [punchInTime, setPunchInTime] = useState(null);
    const [punchOutTime, setPunchOutTime] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const shiftTimings = data.shiftTimings || data.shiftTiming || "09:00 AM - 06:00 PM";
    const shiftStartLabel = shiftTimings.split("-")[0]?.trim() || "09:00 AM";

    const parseShiftStart = (label) => {
        const [time, meridian] = label.split(" ");
        if (!time || !meridian) return null;
        const [hoursStr, minutesStr] = time.split(":");
        let hours = Number(hoursStr);
        const minutes = Number(minutesStr || 0);
        if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const formatDuration = (ms) => {
        const totalMinutes = Math.max(0, Math.floor(ms / 60000));
        const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
        const minutes = String(totalMinutes % 60).padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    useEffect(() => {
        const checkIn = data.checkInTime ? new Date(data.checkInTime) : null;
        const checkOut = data.checkOutTime ? new Date(data.checkOutTime) : null;
        setPunchInTime(checkIn);
        setPunchOutTime(checkOut);
    }, [data.checkInTime, data.checkOutTime]);

    useEffect(() => {
        if (!punchInTime || punchOutTime) return;
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, [punchInTime, punchOutTime]);

    const workingHours = useMemo(() => {
        if (!punchInTime) return data.workingHours || data.todayHours || "00:00";
        const endTime = punchOutTime || currentTime;
        return formatDuration(endTime - punchInTime);
    }, [punchInTime, punchOutTime, currentTime, data.workingHours, data.todayHours]);

    const isPunchedIn = Boolean(punchInTime && !punchOutTime);
    const punchStatus = isPunchedIn
        ? "Punched In"
        : punchOutTime
            ? "Punched Out"
            : data.punchStatus || data.status || "Not Punched";

    const lateEarly = useMemo(() => {
        if (!punchInTime) return data.lateBy || data.earlyBy || data.lateEarly || "On Time";
        const shiftStart = parseShiftStart(shiftStartLabel);
        if (!shiftStart) return "On Time";
        const diffMs = punchInTime - shiftStart;
        if (diffMs > 0) {
            return `Late by ${formatDuration(diffMs)}`;
        }
        if (diffMs < 0) {
            return `Early by ${formatDuration(Math.abs(diffMs))}`;
        }
        return "On Time";
    }, [punchInTime, data.lateBy, data.earlyBy, data.lateEarly, shiftStartLabel]);

    const attendanceStatus = isPunchedIn
        ? "Present"
        : punchOutTime
            ? "Completed"
            : data.attendanceStatus || data.status || "Pending";
    const statusIsOnTime = attendanceStatus === "On Time" || attendanceStatus === "Present";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                    <Clock size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Attendance Stats</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily summary</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Punch Status</span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isPunchedIn ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {punchStatus}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Today Working Hours</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{workingHours}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Late / Early</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lateEarly}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Shift Timings</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{shiftTimings}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-primary-100/50 dark:border-gray-700">
                    <span className="text-sm text-gray-500">Attendance Status</span>
                    <div className="flex items-center gap-1">
                        {statusIsOnTime ? <CheckCircle size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-orange-500" />}
                        <span className={`text-sm font-medium ${statusIsOnTime ? "text-green-600" : "text-orange-600"}`}>{attendanceStatus}</span>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <Link
                    href="/employee/attendance/regularization"
                    className="flex w-full items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-primary-200/60 dark:border-primary-500/20 text-primary-700 dark:text-primary-300 hover:bg-primary-50/60 dark:hover:bg-primary-500/10 transition-colors"
                >
                    Raise Attendance Correction
                </Link>
            </div>
        </div>
    );
}
