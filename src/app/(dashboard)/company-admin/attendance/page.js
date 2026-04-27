'use client';
import React, { useState } from 'react';
import { Calendar, Search, Filter, Download, UserCheck, XCircle, Clock, AlertCircle, X, MapPin } from 'lucide-react';

const AttendanceModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock size={16} className="text-primary-600" />
                        Attendance Log
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg">
                            {data.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{data.name}</h4>
                            <p className="text-sm text-gray-500">{data.role}</p>
                        </div>
                        <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border ${data.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : data.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {data.status}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-6">
                        {/* Check In */}
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-gray-800" />
                            <p className="text-xs font-semibold text-gray-500 mb-0.5">Check In</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{data.timeIn !== '-' ? data.timeIn : 'Not Checked In'}</span>
                                {data.location !== '-' && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-2 py-0.5 rounded-md">
                                        <MapPin size={10} /> {data.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Check Out */}
                        <div className="relative">
                            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white dark:ring-gray-800 ${data.timeOut !== '-' ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            <p className="text-xs font-semibold text-gray-500 mb-0.5">Check Out</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{data.timeOut !== '-' ? data.timeOut : 'Still Working'}</p>
                        </div>
                    </div>

                    {/* Total Hours */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Working Hours</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {data.timeIn !== '-' && data.timeOut !== '-' ? '09h 03m' : '--'}
                        </span>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AttendancePage() {
    const [selectedLog, setSelectedLog] = useState(null);

    const attendanceData = [
        { id: 1, name: 'Amit Verma', role: 'Sales Executive', status: 'Present', timeIn: '09:02 AM', timeOut: '06:05 PM', location: 'Office' },
        { id: 2, name: 'Priya Singh', role: 'HR Manager', status: 'Late', timeIn: '09:45 AM', timeOut: '-', location: 'Office' },
        { id: 3, name: 'Rahul Sharma', role: 'Developer', status: 'Absent', timeIn: '-', timeOut: '-', location: '-' },
        { id: 4, name: 'Neha Gupta', role: 'Analyst', status: 'Present', timeIn: '08:55 AM', timeOut: '05:50 PM', location: 'Remote' },
        { id: 5, name: 'Vikram Malhotra', role: 'Team Lead', status: 'On Leave', timeIn: '-', timeOut: '-', location: '-' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'Late': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'On Leave': return 'bg-primary-100 text-primary-700 border-primary-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleViewLog = (record) => {
        setSelectedLog(record);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0B0F19] p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="text-primary-600" />
                            Attendance Overview
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Track daily attendance and employee movements.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <Download size={16} />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Present Today</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">118</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <UserCheck size={20} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Late Arrivals</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Absent</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">8</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                            <XCircle size={20} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">On Leave</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4</h3>
                        </div>
                        <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                                <Filter size={16} /> Filter
                            </button>
                            <input type="date" className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-secondary-900 dark:text-secondary-100 bg-secondary-50 dark:bg-secondary-900/20 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Employee</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Time In</th>
                                    <th className="px-6 py-3 font-medium">Time Out</th>
                                    <th className="px-6 py-3 font-medium">Location</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {attendanceData.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{record.name}</p>
                                                <p className="text-xs text-gray-500">{record.role}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                                            {record.timeIn}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                                            {record.timeOut}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {record.location}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewLog(record)}
                                                className="text-primary-600 hover:text-primary-700 font-medium text-xs"
                                            >
                                                View Log
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                        <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">Load More</button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AttendanceModal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                data={selectedLog}
            />
        </div>
    );
}
