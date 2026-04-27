"use client";
import React, { useState, useEffect } from "react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { managerTeamService } from "@/services/manager-services/team.service";
import { toast } from "react-hot-toast";
import {
    ShieldCheck, AlertTriangle, Target, Clock,
    PlusCircle, X, Save, CheckCircle, Search,
    Filter, Users, TrendingUp, AlertCircle, Loader2,
    Calendar, ArrowRight
} from "lucide-react";

const ManagerPIPDashboard = () => {
    const [pips, setPips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: "",
        reason: "",
        goals: "",
        startDate: "",
        endDate: "",
        status: "DRAFT"
    });

    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [editingPip, setEditingPip] = useState(null);
    const [manageData, setManageData] = useState({ status: "", finalOutcome: "" });

    useEffect(() => {
        fetchPIPs();
        fetchTeam();
    }, [filterStatus]);

    const fetchPIPs = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (filterStatus !== "all") filters.status = filterStatus;
            const data = await performanceManagementService.getPIPs(filters);
            setPips(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeam = async () => {
        try {
            const teamData = await managerTeamService.getTeamOverview();
            setTeamMembers(teamData.teamMembers || []);
        } catch (error) {
            console.error("Failed to load team", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.employeeId) {
            toast.error("Please select an employee");
            return;
        }
        setSubmitting(true);
        try {
            await performanceManagementService.createPIP({
                ...formData,
                employeeId: parseInt(formData.employeeId),
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate)
            });
            toast.success("PIP initiated successfully!");
            setIsModalOpen(false);
            setFormData({ employeeId: "", reason: "", goals: "", startDate: "", endDate: "", status: "DRAFT" });
            fetchPIPs();
        } catch (error) {
            toast.error(error.message || "Failed to create PIP");
        } finally {
            setSubmitting(false);
        }
    };

    const handleManagePip = (pip) => {
        setEditingPip(pip);
        setManageData({ status: pip.status, finalOutcome: pip.finalOutcome || "" });
        setIsManageModalOpen(true);
    };

    const handleUpdatePip = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await performanceManagementService.updatePIP(editingPip.id, manageData);
            toast.success("PIP updated successfully");
            setIsManageModalOpen(false);
            fetchPIPs();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            DRAFT: { color: "gray", icon: Clock, text: "Draft" },
            ACTIVE: { color: "yellow", icon: AlertTriangle, text: "Active" },
            COMPLETED_SUCCESS: { color: "green", icon: CheckCircle, text: "Successful" },
            COMPLETED_FAILURE: { color: "red", icon: AlertCircle, text: "Unsuccessful" },
            COMPLETED: { color: "blue", icon: CheckCircle, text: "Completed" },
            TERMINATED: { color: "red", icon: X, text: "Terminated" },
        };
        const config = statusConfig[status] || { color: "gray", icon: Clock, text: status };
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/20 dark:text-${config.color}-300`}>
                <Icon size={12} />
                {config.text}
            </span>
        );
    };

    const getDurationDays = (start, end) => {
        if (!start || !end) return "N/A";
        const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
        return `${days} days`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const filteredPips = pips.filter(p =>
        searchTerm === "" ||
        `${p.employee.firstName} ${p.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.employee.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: pips.length,
        active: pips.filter(p => p.status === "ACTIVE").length,
        draft: pips.filter(p => p.status === "DRAFT").length,
        success: pips.filter(p => p.status === "COMPLETED_SUCCESS").length,
        failure: pips.filter(p => ["COMPLETED_FAILURE", "TERMINATED"].includes(p.status)).length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Team Improvement Plans</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Directly manage performance interventions. Keep your team on track.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Target className="text-primary-600" size={24} />
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{filteredPips.length}</span>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                            >
                                <PlusCircle size={16} /> Initiate New Plan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total PIPs</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                            <Users className="text-blue-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
                            </div>
                            <AlertTriangle className="text-yellow-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                            </div>
                            <Clock className="text-gray-400" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
                            </div>
                            <CheckCircle className="text-green-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Unsuccessful</p>
                                <p className="text-2xl font-bold text-red-600">{stats.failure}</p>
                            </div>
                            <AlertCircle className="text-red-500" size={20} />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="text-gray-400" size={20} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="DRAFT">Draft</option>
                                <option value="COMPLETED_SUCCESS">Completed – Successful</option>
                                <option value="COMPLETED_FAILURE">Completed – Unsuccessful</option>
                                <option value="TERMINATED">Terminated</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100 border-b border-primary-100 dark:border-primary-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Period</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={32} className="animate-spin text-primary-400" />
                                                <p className="text-sm">Loading improvement plans...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPips.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShieldCheck size={48} className="text-gray-300 dark:text-gray-600" />
                                                <p className="text-lg font-medium">No improvement plans found</p>
                                                <p className="text-sm">
                                                    {searchTerm || filterStatus !== "all"
                                                        ? "Try adjusting your filters"
                                                        : "Your team looks clean!"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPips.map((pip) => (
                                    <tr key={pip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {/* Employee */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {pip.employee.firstName} {pip.employee.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {pip.employee.designation?.name}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    {pip.employee.email}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Reason */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={pip.reason}>
                                                {pip.reason || "—"}
                                            </p>
                                        </td>
                                        {/* Period */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(pip.startDate)}</div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">to {formatDate(pip.endDate)}</div>
                                        </td>
                                        {/* Duration */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {getDurationDays(pip.startDate, pip.endDate)}
                                            </div>
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(pip.status)}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleManagePip(pip)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <ArrowRight size={14} /> Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Initiate PIP Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Initiate Improvement Plan
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Member</label>
                                <select
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none"
                                >
                                    <option value="">Select Employee</option>
                                    {teamMembers.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason for PIP</label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    placeholder="Describe the performance issue clearly..."
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Improvement Goals <span className="text-gray-400 font-normal">(optional)</span></label>
                                <textarea
                                    name="goals"
                                    value={formData.goals}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Specific measurable goals..."
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                                >
                                    {submitting
                                        ? <><Loader2 size={16} className="animate-spin" /> Creating...</>
                                        : <><Save size={16} /> Create Plan</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage PIP Modal */}
            {isManageModalOpen && editingPip && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setIsManageModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manage Improvement Plan</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {editingPip.employee.firstName} {editingPip.employee.lastName}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsManageModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePip} className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* PIP Summary */}
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Performance Issue</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{editingPip.reason}"</p>
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(editingPip.startDate)}</span>
                                    <span>→</span>
                                    <span>{formatDate(editingPip.endDate)}</span>
                                    <span className="ml-auto font-medium">{getDurationDays(editingPip.startDate, editingPip.endDate)}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Status</label>
                                <select
                                    value={manageData.status}
                                    onChange={(e) => setManageData({ ...manageData, status: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="ACTIVE">Active / In Progress</option>
                                    <option value="COMPLETED_SUCCESS">Completed – Successful</option>
                                    <option value="COMPLETED_FAILURE">Completed – Unsuccessful</option>
                                    <option value="TERMINATED">Terminated / Stopped</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Final Outcome / Notes</label>
                                <textarea
                                    rows={4}
                                    placeholder="Summarize the final results and next steps..."
                                    value={manageData.finalOutcome}
                                    onChange={(e) => setManageData({ ...manageData, finalOutcome: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsManageModalOpen(false)}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                                >
                                    {submitting
                                        ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                        : <><Save size={16} /> Save Progress</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerPIPDashboard;
