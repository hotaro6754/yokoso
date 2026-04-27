// src/app/(dashboard)/employee/dashboard/components/AttendanceCalendar.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon, 
  Clock, 
  MapPin, 
  Briefcase,
  AlertCircle,
  ChevronDown,
  X
} from "lucide-react";

export default function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [animationClass, setAnimationClass] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // State for the temporary date inside the picker (before applying)
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update picker year when main date changes
  useEffect(() => {
    setPickerYear(currentDate.getFullYear());
  }, [currentDate]);

  // --- Configuration ---
  const statusConfig = {
    OnTime: {
      color: "bg-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "On Time",
      dot: "bg-emerald-500"
    },
    Late: {
      color: "bg-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-400",
      label: "Late",
      dot: "bg-amber-500"
    },
    Absent: {
      color: "bg-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      text: "text-rose-700 dark:text-rose-400",
      label: "Absent",
      dot: "bg-rose-500"
    },
    WFH: {
      color: "bg-sky-500",
      bg: "bg-sky-50 dark:bg-sky-900/20",
      text: "text-sky-700 dark:text-sky-400",
      label: "WFH",
      dot: "bg-sky-500"
    },
    Weekend: {
      color: "bg-gray-200",
      bg: "bg-gray-50 dark:bg-gray-800",
      text: "text-gray-400 dark:text-gray-500",
      label: "Weekend",
      dot: "bg-gray-300"
    }
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // --- Mock Data Logic ---
  const getDayData = (day) => {
    if (!day) return null;
    
    // Weekends
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return { status: 'Weekend', hours: '0h', in: '-', out: '-' };

    // Specific Statuses
    if ([3, 15, 25].includes(day)) return { status: 'Absent', hours: '0h', in: '-', out: '-' };
    if ([5, 12, 17].includes(day)) return { status: 'WFH', hours: '9h 10m', in: '08:55 AM', out: '06:05 PM' };
    if ([2, 10, 18].includes(day)) return { status: 'Late', hours: '8h 45m', in: '09:45 AM', out: '06:30 PM' };
    
    // Default On Time
    return { status: 'OnTime', hours: '9h 05m', in: '08:58 AM', out: '06:03 PM' };
  };

  // --- Calendar Math ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = Array(firstDayOfMonth).fill(null).concat([...Array(daysInMonth).keys()].map(i => i + 1));

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const handleDateClick = (day) => {
    if(!day) return;
    setAnimationClass("animate-pulse-short");
    setSelectedDate(new Date(year, month, day));
    setTimeout(() => setAnimationClass(""), 300);
  };

  // --- Picker Logic ---
  const togglePicker = () => setIsDatePickerOpen(!isDatePickerOpen);
  
  const handleMonthSelect = (monthIndex) => {
    setCurrentDate(new Date(pickerYear, monthIndex, 1));
    setIsDatePickerOpen(false);
  };

  const changePickerYear = (direction) => {
    setPickerYear(prev => prev + direction);
  };

  // Derived state for selected view
  const selectedDayNum = selectedDate.getDate();
  const selectedData = getDayData(selectedDayNum);
  const selectedConfig = statusConfig[selectedData?.status] || statusConfig.OnTime;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col md:flex-row gap-8 relative">
      
      {/* --- LEFT SIDE: Calendar Grid --- */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Header with Date Picker Trigger */}
        <div className="flex items-center justify-between mb-6 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <CalIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Attendance</h2>
              <p className="text-xs text-gray-400">Select a date to view details</p>
            </div>
          </div>
          
          <div className="relative" ref={pickerRef}>
            <button 
                onClick={togglePicker}
                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-600 transition-all text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
                <span>{currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* --- DROPDOWN POPUP --- */}
            {isDatePickerOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {/* Year Switcher */}
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <button onClick={() => changePickerYear(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="font-bold text-gray-800 dark:text-white">{pickerYear}</span>
                        <button onClick={() => changePickerYear(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Months Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {monthNames.map((m, idx) => {
                            const isCurrentMonth = idx === new Date().getMonth() && pickerYear === new Date().getFullYear();
                            const isSelectedMonth = idx === month && pickerYear === year;
                            
                            return (
                                <button
                                    key={m}
                                    onClick={() => handleMonthSelect(idx)}
                                    className={`
                                        py-2 px-1 text-xs rounded-lg font-medium transition-colors
                                        ${isSelectedMonth 
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                            : isCurrentMonth 
                                                ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        }
                                    `}
                                >
                                    {m}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Legend Bar */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 px-1">
           {['OnTime', 'Late', 'Absent', 'WFH'].map((key) => (
             <div key={key} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-[3px] ${statusConfig[key].dot}`}></span>
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  {statusConfig[key].label}
                </span>
             </div>
           ))}
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 auto-rows-fr">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            
            const data = getDayData(day);
            const config = statusConfig[data.status];
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month;
            const isToday = day === new Date().getDate() && month === new Date().getMonth();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 aspect-square
                  ${config.bg} ${config.text}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 shadow-lg transform scale-105 z-10' : 'hover:opacity-80'}
                  ${isToday && !isSelected ? 'border border-blue-400' : 'border border-transparent'}
                `}
              >
                <span className={`text-sm font-bold ${isSelected ? 'scale-110' : ''}`}>{day}</span>
                {/* Small indicator dot for status */}
                <span className={`w-1 h-1 rounded-full mt-1 ${config.dot} opacity-70`}></span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- RIGHT SIDE: Detail Panel --- */}
      <div className="w-full md:w-72 bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-5 flex flex-col border border-gray-100 dark:border-gray-700">
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Selected Date</h3>
            <p className={`text-xl font-bold text-gray-800 dark:text-white transition-opacity ${animationClass}`}>
              {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Status Card */}
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${selectedConfig.bg} ${selectedConfig.text} border-opacity-50`}>
            <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20`}>
              {selectedData?.status === 'WFH' ? <MapPin size={20} /> : 
               selectedData?.status === 'Absent' ? <AlertCircle size={20} /> :
               <Briefcase size={20} />}
            </div>
            <div>
              <p className="text-xs opacity-70 font-semibold uppercase">Status</p>
              <p className="font-bold text-lg leading-tight">{selectedConfig.label}</p>
            </div>
          </div>

          {/* Timings */}
          {selectedData?.status !== 'Absent' && selectedData?.status !== 'Weekend' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Punch In</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{selectedData.in}</p>
                    </div>
                 </div>
                 <Clock size={16} className="text-gray-300" />
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Punch Out</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{selectedData.out}</p>
                    </div>
                 </div>
                 <Clock size={16} className="text-gray-300" />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                 <span className="text-sm text-gray-500 font-medium">Total Production</span>
                 <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedData.hours}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-2 opacity-60">
               <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                 <Clock size={24} />
               </div>
               <p className="text-sm">No working hours recorded <br/> for this date.</p>
            </div>
          )}
      </div>

      <style jsx>{`
        .animate-pulse-short {
          animation: pulse-short 0.3s ease-in-out;
        }
        @keyframes pulse-short {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}