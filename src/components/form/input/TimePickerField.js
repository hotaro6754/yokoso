"use client";
import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";

export default function TimePickerField({
    label,
    value,
    onChange,
    error,
    placeholder = "Select Time",
    disabled = false,
    className = "",
    required = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const hoursRef = useRef(null);
    const minutesRef = useRef(null);

    // Parse time
    const [selectedHours, selectedMinutes] = (value || "").split(":");

    // Hours array 00-23
    const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
    // Minutes array 00-59
    const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll to selected items when opening
    useEffect(() => {
        if (isOpen) {
            if (hoursRef.current && selectedHours) {
                const selectedHourEl = hoursRef.current.querySelector(`[data-value="${selectedHours}"]`);
                if (selectedHourEl) {
                    selectedHourEl.scrollIntoView({ block: "center" });
                }
            }
            if (minutesRef.current && selectedMinutes) {
                const selectedMinuteEl = minutesRef.current.querySelector(`[data-value="${selectedMinutes}"]`);
                if (selectedMinuteEl) {
                    selectedMinuteEl.scrollIntoView({ block: "center" });
                }
            }
        }
    }, [isOpen, selectedHours, selectedMinutes]);

    const handleHourSelect = (h) => {
        const m = selectedMinutes || "00";
        onChange(`${h}:${m}`);
    };

    const handleMinuteSelect = (m) => {
        const h = selectedHours || "00";
        onChange(`${h}:${m}`);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div
                className={`flex items-center justify-between w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-lg cursor-pointer transition-all ${error
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 hover:border-brand-400 focus:border-brand-500"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : "focus-within:ring-2 focus-within:ring-brand-500/20"}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className={!value ? "text-gray-400" : ""}>{value || placeholder}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Hours Column */}
                    <div className="flex-1 h-60 overflow-y-auto border-r border-gray-200 dark:border-gray-700" ref={hoursRef}>
                        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center border-b border-gray-200 dark:border-gray-700">
                            Hours
                        </div>
                        <div className="p-1">
                            {hoursList.map((h) => (
                                <div
                                    key={h}
                                    data-value={h}
                                    onClick={() => handleHourSelect(h)}
                                    className={`px-4 py-2 text-center text-sm rounded-md cursor-pointer transition-colors mb-0.5 ${selectedHours === h
                                            ? "bg-brand-500 text-white font-medium"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {h}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Minutes Column */}
                    <div className="flex-1 h-60 overflow-y-auto" ref={minutesRef}>
                        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center border-b border-gray-200 dark:border-gray-700">
                            Minutes
                        </div>
                        <div className="p-1">
                            {minutesList.map((m) => (
                                <div
                                    key={m}
                                    data-value={m}
                                    onClick={() => handleMinuteSelect(m)}
                                    className={`px-4 py-2 text-center text-sm rounded-md cursor-pointer transition-colors mb-0.5 ${selectedMinutes === m
                                            ? "bg-brand-500 text-white font-medium"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
