// src/app/(dashboard)/employee/dashboard/components/OfficeHoursTracker.js
"use client";

import React, { useState, useEffect, useRef } from "react";

// Simple icons (Using SVG directly to avoid dependency issues)
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

export default function OfficeHoursTracker() {
  const [status, setStatus] = useState("IDLE"); // IDLE, ACTIVE, COMPLETED
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  // Stores the history of punches for the day
  const [sessions, setSessions] = useState([]); 

  const timerRef = useRef(null);

  // Timer Logic
  useEffect(() => {
    if (status === "ACTIVE") {
      timerRef.current = setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const handleToggleStatus = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (status === "ACTIVE") {
      // PUNCH OUT
      setStatus("IDLE");
      
      // Update the last session with an end time
      setSessions(prev => {
        const newSessions = [...prev];
        if (newSessions.length > 0) {
          newSessions[0] = { ...newSessions[0], end: formattedTime, isActive: false };
        }
        return newSessions;
      });

    } else {
      // PUNCH IN
      setStatus("ACTIVE");
      setSessionStartTime(Date.now());
      
      // Add new session to top of list
      setSessions(prev => [
        { start: formattedTime, end: "Now", isActive: true },
        ...prev
      ]);
    }
  };

  const formatTime = (totalSecs) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return {
      h: h.toString().padStart(2, "0"),
      m: m.toString().padStart(2, "0"),
      s: s.toString().padStart(2, "0")
    };
  };

  const timeDisplay = formatTime(totalSeconds);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-0 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden relative">
      
      {/* --- Top Section: Header & Status --- */}
      <div className="px-6 pt-6 pb-2 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Attendance Tracker
          </h2>
          <p className="text-sm text-gray-400 mt-1">Track your daily work hours</p>
        </div>
        
        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
          status === "ACTIVE" 
            ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" 
            : "bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-700/30 dark:border-gray-600 dark:text-gray-400"
        }`}>
          <span className={`w-2 h-2 rounded-full ${status === "ACTIVE" ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
          {status === "ACTIVE" ? "ON DUTY" : "OFF DUTY"}
        </div>
      </div>

      {/* --- Middle Section: Big Timer --- */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative">
           {/* Decorative blurred background behind timer */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 transition-colors duration-700 ${
             status === "ACTIVE" ? "bg-blue-500" : "bg-gray-300"
           }`}></div>

           <div className="relative text-5xl md:text-6xl font-mono font-bold text-gray-800 dark:text-white tracking-wider flex items-baseline gap-1">
             <span>{timeDisplay.h}</span>
             <span className="text-gray-300 text-4xl">:</span>
             <span>{timeDisplay.m}</span>
             <span className="text-gray-300 text-4xl">:</span>
             <span className="text-blue-600 dark:text-blue-400 w-[70px] inline-block text-center">
               {timeDisplay.s}
             </span>
           </div>
           <p className="text-center text-gray-400 text-sm mt-2 font-medium tracking-widest uppercase">
             Total Hours
           </p>
        </div>
      </div>

      {/* --- Action Button --- */}
      <div className="px-6 pb-6">
        <button
          onClick={handleToggleStatus}
          className={`w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 transform hover:-translate-y-1 shadow-lg ${
            status === "ACTIVE"
              ? "bg-white border-2 border-red-100 text-red-600 hover:border-red-200 hover:bg-red-50 dark:bg-gray-800 dark:border-red-900/50 dark:text-red-400"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 dark:shadow-none"
          }`}
        >
          <div className="flex items-center justify-center gap-3 relative z-10">
            {status === "ACTIVE" ? <PauseIcon /> : <PlayIcon />}
            <span className="font-bold text-lg">
              {status === "ACTIVE" ? "Punch Out" : "Punch In"}
            </span>
          </div>
          
          {/* Fill Animation Effect on Hover (only for punch in) */}
          {status !== "ACTIVE" && (
             <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </button>
      </div>

      {/* --- Bottom Section: Timeline / History --- */}
      <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-1 overflow-y-auto max-h-[160px] p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Today's Activity
        </h3>
        
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-4 italic">
              No activity recorded yet today.
            </div>
          ) : (
            sessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between text-sm bg-white dark:bg-gray-700 p-3 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${session.isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <ClockIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {session.isActive ? "Currently Working" : "Work Session"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {session.start} - {session.end}
                    </span>
                  </div>
                </div>
                {session.isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}