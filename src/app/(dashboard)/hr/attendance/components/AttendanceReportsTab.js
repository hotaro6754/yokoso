"use client";

import React, { useState, useEffect } from "react";
import { attendanceService } from "@/services/hr-services/attendace.service";
import { employeeService } from "@/services/hr-services/employeeService";
import DatePickerField from "@/components/form/input/DatePickerField";
import { Calendar, Users, Clock, AlertCircle, Search, BarChart3, ChevronRight, FileText, Loader2, Activity, Fingerprint, ChevronDown, ChevronUp } from "lucide-react";

export default function AttendanceReportsTab() {
  const [activeSegment, setActiveSegment] = useState("employee"); // "employee" | "company"
  const [loading, setLoading] = useState(false);
  
  // Date states (default current month)
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const [startDate, setStartDate] = useState(`${currentYear}-${currentMonth}-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // Employee history states
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [empHistory, setEmpHistory] = useState([]);
  const [empStats, setEmpStats] = useState({ present: 0, absent: 0, avgHours: 0 });
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (dateId) => {
    setExpandedRows(prev => ({
      ...prev,
      [dateId]: !prev[dateId]
    }));
  };

  // Company summary states
  const [companySummary, setCompanySummary] = useState([]);

  // Fetch employees on load
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeeService.getAllEmployees({ limit: 1000 });
        if (res.success && res.data) {
          setEmployees(res.data.data || res.data); // depending on standard format
        }
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (activeSegment === "employee" && !selectedEmpId) {
        setEmpHistory([]);
        setEmpStats({ present: 0, absent: 0 });
        return;
      }

      setLoading(true);
      try {
        if (activeSegment === "employee") {
          const res = await attendanceService.getEmployeeAttendance(selectedEmpId, {
            startDate,
            endDate,
            limit: 100, // Show more for history
          });
          
          if (res.success) {
            setEmpHistory(res.data || []);
            // Extract stats if returned or calculate manually
            const stats = res.stats || { present: 0, absent: 0 };
            
            if (!res.stats) {
               let p = 0; let a = 0;
               (res.data || []).forEach(r => {
                 if (r.status.toUpperCase().includes("PRESENT") || r.status.toUpperCase().includes("LATE")) p++;
                 if (r.status.toUpperCase() === "ABSENT") a++;
               });
               stats.present = p;
               stats.absent = a;
            }
            setEmpStats(stats);
          }
        } 
        else if (activeSegment === "company") {
          const res = await attendanceService.getAttendanceSummary({
            startDate,
            endDate,
            groupBy: "daily"
          });
          if (res.success) {
            setCompanySummary(res.data?.summary || res.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch reports", err);
        toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSegment, selectedEmpId, startDate, endDate]);

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            Historical Reports & Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track daily strength and audit individual employee attendance behavior.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-md dark:bg-gray-800 flex">
            <button
              onClick={() => setActiveSegment("employee")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeSegment === "employee" 
                ? "bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-brand-400" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Employee Audit
            </button>
            <button
              onClick={() => setActiveSegment("company")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeSegment === "company" 
                ? "bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-brand-400" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Daily Company Strength
            </button>
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-sm flex flex-wrap gap-4 items-end">
        {activeSegment === "employee" && (
          <div className="w-full sm:w-auto min-w-[250px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Select Employee</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp.id || emp._id} value={emp.id || emp._id}>
                  {emp.employeeId} - {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Start Date</label>
          <DatePickerField
            value={startDate}
            onChange={(val) => setStartDate(val)}
            className="px-3 py-2 border border-gray-300 rounded-sm dark:bg-gray-900 dark:border-gray-700"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">End Date</label>
          <DatePickerField
            value={endDate}
            onChange={(val) => setEndDate(val)}
            className="px-3 py-2 border border-gray-300 rounded-sm dark:bg-gray-900 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Content Render */}
      {loading ? (
        <div className="flex justify-center items-center h-48 border border-gray-200 border-dashed rounded-sm dark:border-gray-700">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        </div>
      ) : activeSegment === "employee" ? (
        // ==========================
        // EMPLOYEE HISTORY SEGMENT
        // ==========================
        <div className="space-y-4">
          {!selectedEmpId ? (
            <div className="text-center p-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Please select an employee to view their detailed attendance map.</p>
            </div>
          ) : (
            <>
              {/* Employee Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 border-t-2 border-t-green-500 border border-gray-200 shadow-sm rounded-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Days Present</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{empStats.present}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border-t-2 border-t-red-500 border border-gray-200 shadow-sm rounded-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Days Absent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{empStats.absent}</p>
                </div>
              </div>

              {/* Employee Data Table */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full whitespace-nowrap text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Check In</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Check Out</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Net Hours</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Logs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {empHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No records found for this period.</td>
                        </tr>
                      ) : (
                        empHistory.map((record, i) => {
                          const isExpanded = expandedRows[record.date];
                          const punches = record.punches || [];
                          
                          return (
                            <React.Fragment key={i}>
                              <tr className={`hover:bg-gray-50 ${record.status?.toUpperCase() === 'ABSENT' ? 'bg-red-50/20' : ''}`}>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {record.date}
                                </td>
                                <td className="px-6 py-3">
                                  {record.status?.toUpperCase() === "PRESENT" ? (
                                    <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Present</span>
                                  ) : record.status?.toUpperCase() === "ABSENT" ? (
                                    <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Absent</span>
                                  ) : (
                                    <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">{record.status}</span>
                                  )}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-600">{record.checkIn}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{record.checkOut}</td>
                                <td className="px-6 py-3">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-brand-600">{record.totalHours !== '--' ? record.totalHours : '-'}</span>
                                    {record.breakHours && record.breakHours !== '0h 0m' && (
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Break: {record.breakHours}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3 text-center whitespace-nowrap align-middle">
                                  {punches.length > 0 ? (
                                    <button 
                                      onClick={() => toggleRow(record.date)}
                                      className={`group/btn inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                                        isExpanded 
                                          ? 'bg-brand-600 text-white shadow-brand-500/20 shadow-sm' 
                                          : 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-brand-900/50 dark:hover:text-brand-300'
                                      }`}
                                    >
                                      {punches.length} Logs
                                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 group-hover/btn:translate-y-0.5 transition-transform" />}
                                    </button>
                                  ) : (
                                    <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Logs</span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                              {/* Expanded Timeline View */}
                              {isExpanded && punches.length > 0 && (
                                <tr>
                                  <td colSpan={6} className="p-0 border-none">
                                    <div className="mx-6 mb-6 mt-1 p-6 bg-gray-50 dark:bg-gray-900/30 rounded-sm border border-gray-200/50 dark:border-gray-700/50 shadow-inner overflow-hidden">
                                      <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                          <Activity className="w-4 h-4 text-brand-500" />
                                          Biometric Terminal Timeline
                                        </h4>
                                        <div className="h-px flex-1 mx-6 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent"></div>
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-4">
                                        {punches.map((punch, idx) => (
                                          <div 
                                            key={idx} 
                                            className={`relative z-10 flex flex-col items-center group/punch`}
                                          >
                                            <div className={`flex items-center gap-3 px-4 py-3 rounded-sm border shadow-sm transition-all hover:scale-105 ${
                                              punch.type === 'IN' 
                                                ? 'bg-white border-emerald-100 text-emerald-900 dark:bg-gray-800 dark:border-emerald-900/30' 
                                                : 'bg-white border-red-100 text-red-900 dark:bg-gray-800 dark:border-red-900/30'
                                            }`}>
                                              <div className={`p-1.5 rounded-sm ${punch.type === 'IN' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                                <Fingerprint className={`w-4 h-4 ${punch.type === 'IN' ? 'text-emerald-500' : 'text-red-500'}`} />
                                              </div>
                                              <div className="flex flex-col">
                                                <span className="text-sm font-black tracking-tight leading-none">
                                                  {punch.timeFormatted || punch.time}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase mt-1 tracking-widest ${punch.type === 'IN' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                  Punch {punch.type}
                                                </span>
                                              </div>
                                            </div>
                                            {idx < punches.length - 1 && (
                                              <div className="hidden lg:block absolute top-1/2 left-full w-4 h-px bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        // ==========================
        // COMPANY SUMMARY SEGMENT
        // ==========================
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Total Staff</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Present</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Absent</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Late/Early</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Presence Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                 {companySummary.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">No organizational data for this range.</td>
                    </tr>
                 ) : (
                      companySummary.map((day, i) => {
                        const presentCount = day.present || 0;
                        const absentCount = day.absent || 0;
                        const halfDayCount = day.halfDay || 0;
                        const lateCount = day.late || 0;
                        const earlyLeaveCount = day.earlyLeave || 0;
                        
                        // Total staff should be provided by backend, or fallback to count
                        const totalEmployees = day.totalStaff || (presentCount + absentCount + halfDayCount);
                        const effectivePresent = presentCount + halfDayCount + lateCount;
                        const rate = totalEmployees > 0 ? Math.round((effectivePresent / totalEmployees) * 100) : 0;
                        
                        return (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">{day.date}</td>
                            <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">{totalEmployees}</td>
                            <td className="px-6 py-4 text-sm text-center text-green-600 font-bold">{effectivePresent}</td>
                            <td className="px-6 py-4 text-sm text-center text-red-600 font-bold">{totalEmployees - effectivePresent}</td>
                            <td className="px-6 py-4 text-sm text-center text-orange-500 font-bold">{lateCount + earlyLeaveCount}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden min-w-[100px]">
                                  <div className={`h-full transition-all duration-500 ${rate > 85 ? 'bg-emerald-500' : rate > 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${rate}%` }}></div>
                                </div>
                                <span className={`text-[10px] font-black w-8 ${rate > 85 ? 'text-emerald-600' : rate > 70 ? 'text-amber-600' : 'text-rose-600'}`}>{rate}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                 )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
