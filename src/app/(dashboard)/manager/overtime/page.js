"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Users,
    Calendar,
    Clock,
    FileText,
    CheckCircle,
    XCircle,
    Search,
    Plus,
    Filter,
    Moon,
    Sun
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

const ManagerOvertimePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("records"); // 'assign' or 'records'
    const [employees, setEmployees] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Form State
    const [formData, setFormData] = useState({
        employeeId: "",
        task: "",
        details: "",
        date: "",
        type: "DAY", // DAY or NIGHT
        hours: "",
    });

    const [submissionLoading, setSubmissionLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
        fetchRecords();
    }, [currentPage, statusFilter]);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/manager/overtime/employees`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.data.success) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching employees", error);
        }
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/manager/overtime`, {
                params: { page: currentPage, status: statusFilter },
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.data.success) {
                setRecords(response.data.records);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            toast.error("Failed to load overtime records");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setSubmissionLoading(true);
        try {
            const payload = {
                ...formData,
                employeeId: parseInt(formData.employeeId),
                hours: formData.hours ? parseFloat(formData.hours) : undefined
            };

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/manager/overtime`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (response.data.success) {
                toast.success("Overtime assigned successfully!");
                setFormData({
                    employeeId: "",
                    task: "",
                    details: "",
                    date: "",
                    type: "DAY",
                    hours: "",
                });
                setActiveTab("records");
                fetchRecords();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to assign overtime");
        } finally {
            setSubmissionLoading(false);
        }
    };

    const handleReview = async (id, status) => {
        let rejectionReason = null;
        if (status === 'REJECTED') {
            rejectionReason = prompt("Enter rejection reason:");
            if (!rejectionReason) return; // Cancel if no reason
        }

        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/manager/overtime/${id}/status`,
                { status, rejectionReason },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            toast.success(`Overtime ${status.toLowerCase()} successfully`);
            fetchRecords();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Overtime Management</h1>
                    <p className="text-gray-500 mt-1">Assign and manage overtime for your team.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveTab("records")}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "records"
                            ? "bg-white text-primary-600 shadow-sm ring-1 ring-gray-200"
                            : "text-gray-600 hover:bg-white hover:shadow-sm"
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("assign")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "assign"
                            ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                            : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:text-primary-600"
                            }`}
                    >
                        <Plus size={18} />
                        Assign Overtime
                    </button>
                </div>
            </div>

            {activeTab === "assign" && (
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Clock className="text-primary-500" />
                        Assign New Overtime
                    </h2>
                    <form onSubmit={handleAssignSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee</label>
                                <select
                                    required
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                    className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all bg-gray-50/50"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <Calendar
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                                    />
                                    <Flatpickr
                                        value={formData.date}
                                        onChange={(dates) => {
                                            const iso = dates[0]
                                                ? dates[0].toISOString().split("T")[0]
                                                : "";
                                            setFormData({ ...formData, date: iso });
                                        }}
                                        options={{
                                            dateFormat: "Y-m-d",
                                            altInput: true,
                                            altFormat: "d-m-Y",
                                            allowInput: false,
                                            clickOpens: true,
                                            disableMobile: true,
                                        }}
                                        placeholder="dd-mm-yyyy"
                                        className="w-full h-11 pl-9 pr-4 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all bg-gray-50/50 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "DAY" })}
                                        className={`h-11 flex items-center justify-center gap-2 rounded-lg border transition-all ${formData.type === "DAY"
                                            ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Sun size={18} /> Day
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "NIGHT" })}
                                        className={`h-11 flex items-center justify-center gap-2 rounded-lg border transition-all ${formData.type === "NIGHT"
                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Moon size={18} /> Night
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Critical Bug Fix"
                                    value={formData.task}
                                    onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                                    className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all bg-gray-50/50"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Details / Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-4 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all bg-gray-50/50 resize-none"
                                    placeholder="Describe the overtime requirements..."
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab("records")}
                                className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submissionLoading}
                                className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-md shadow-primary-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submissionLoading ? "Assigning..." : "Assign Overtime"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === "records" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 text-sm border-gray-200 rounded-lg focus:border-primary-500 focus:ring-0 bg-white"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="PENDING">Pending (Requests)</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
                                <tr className="border-b border-primary-100 dark:border-primary-800">
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date & Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Task Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading records...</td></tr>
                                ) : records.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No overtime records found.</td></tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-xs">
                                                        {record.employeeName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{record.employeeName}</p>
                                                        <p className="text-xs text-gray-500">{record.employeeCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</span>
                                                    <span className={`text-xs inline-flex items-center gap-1 mt-0.5 ${record.type === 'NIGHT' ? 'text-indigo-600' : 'text-amber-600'}`}>
                                                        {record.type === 'NIGHT' ? <Moon size={12} /> : <Sun size={12} />}
                                                        {record.type}
                                                    </span>
                                                    {record.isRequest && (
                                                        <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 mt-1 w-fit">
                                                            Employee Request
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">{record.task}</p>
                                                {record.workSummary && (
                                                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-600 border border-gray-100">
                                                        <span className="font-semibold text-gray-700">Summary:</span> {record.workSummary}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${record.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    record.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        record.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {(record.status === 'COMPLETED' || record.status === 'PENDING') && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleReview(record.id, 'APPROVED')}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReview(record.id, 'REJECTED')}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="px-3 py-1 rounded border disabled:opacity-50"
                                >Prev</button>
                                <span className="px-3 py-1 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="px-3 py-1 rounded border disabled:opacity-50"
                                >Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManagerOvertimePage;
