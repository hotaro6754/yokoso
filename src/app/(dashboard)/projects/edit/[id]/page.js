"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import projectService from "@/services/project.service";
import employeeService from "@/services/hr-services/employeeService";
import { 
    FolderKanban, Save, X, Calendar, 
    Loader2, Users, Briefcase, Building, 
    FileText, Tag, ArrowLeft, RefreshCw, Search, Plus
} from "lucide-react";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import Image from "next/image";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function EditProjectPage() {
    const router = useRouter();
    const { id: projectId } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [fetchingEmployees, setFetchingEmployees] = useState(true);
    const [empSearch, setEmpSearch] = useState("");

    // Effective role for permission checks
    const userRole = user?.role || user?.systemRole || "";
    const canManageProjects = [
        "HR", "HR_ADMIN", "COMPANY_ADMIN", "MANAGER", "COMPANY_OWNER", "SUPER_ADMIN", "MASTER_ADMIN"
    ].includes(userRole);

    const [formData, setFormData] = useState({
        projectName: "",
        projectCode: "",
        clientName: "",
        contractType: "FIXED_PRICE",
        billable: true,
        startDate: "",
        endDate: "",
        status: "ACTIVE",
        description: "",
        assigneeIds: []
    });

    useEffect(() => {
        if (user && !canManageProjects) {
            router.push("/projects");
            return;
        }

        const loadInitialData = async () => {
            try {
                setFetching(true);
                // Load project data
                const projectResponse = await projectService.getProjectById(projectId);
                const project = projectResponse.data;
                
                setFormData({
                    projectName: project.projectName,
                    projectCode: project.projectCode,
                    clientName: project.clientName,
                    contractType: project.contractType,
                    billable: project.billable !== undefined ? Boolean(project.billable) : true,
                    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
                    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
                    status: project.status,
                    description: project.description || "",
                    assigneeIds: project.assignments ? project.assignments.map(a => a.employeeId) : []
                });

                // Load employees
                setFetchingEmployees(true);
                const employeeResponse = await employeeService.getAllEmployees({ limit: 1000 });
                setEmployees(employeeResponse.data || []);
            } catch (error) {
                console.error("Load error:", error);
                toast.error("Failed to load project details");
                router.push("/projects");
            } finally {
                setFetching(false);
                setFetchingEmployees(false);
            }
        };

        if (projectId) {
            loadInitialData();
        }
    }, [projectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "billable") {
            setFormData(prev => ({ ...prev, billable: value === "true" }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssigneeToggle = (empId) => {
        setFormData(prev => {
            const current = [...prev.assigneeIds];
            if (current.includes(empId)) {
                return { ...prev, assigneeIds: current.filter(id => id !== empId) };
            }
            return { ...prev, assigneeIds: [...current, empId] };
        });
    };

    const filteredEmployees = employees.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(empSearch.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(empSearch.toLowerCase()) ||
        emp.designation?.name?.toLowerCase().includes(empSearch.toLowerCase())
    );

    const handleSelectAll = () => {
        if (formData.assigneeIds.length === employees.length) {
            setFormData(prev => ({ ...prev, assigneeIds: [] }));
        } else {
            setFormData(prev => ({ ...prev, assigneeIds: employees.map(e => e.id) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // 1) Update project core fields
            await projectService.updateProject(projectId, formData);
            toast.success("Project updated successfully");
            window.dispatchEvent(new Event("projectsUpdated"));
            router.push("/projects");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update project");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-xs font-medium text-gray-400">Fetching project details...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] dark:bg-gray-950 min-h-screen p-4 sm:p-8 transition-colors duration-300">
            <div className="w-full space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            aria-label="Back"
                            title="Back"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Edit Project Details</h1>
                        <Breadcrumb items={[
                            { label: "Projects", path: "/projects" },
                            { label: formData.projectName || "Details", path: `/projects/${projectId}` },
                            { label: "Edit" }
                        ]} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm p-6 sm:p-8 space-y-6 transition-all duration-300">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-sm">
                                    <FolderKanban size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-title">Project Identity</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 truncate">
                                        <Briefcase size={12} /> Project Name
                                    </label>
                                    <input
                                        required
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        placeholder="Enter project name..."
                                        className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 truncate">
                                        <Tag size={12} /> Project Code
                                    </label>
                                    <input
                                        required
                                        name="projectCode"
                                        value={formData.projectCode}
                                        onChange={handleChange}
                                        placeholder="e.g. ZDK-2024-001"
                                        className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 text-sm"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 truncate">
                                        <Building size={12} /> Client Name
                                    </label>
                                    <input
                                        required
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        placeholder="Enter client details..."
                                        className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contract Type</label>
                                    <select
                                        name="contractType"
                                        value={formData.contractType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 text-sm appearance-none"
                                    >
                                        <option value="FIXED_PRICE">Fixed Price</option>
                                        <option value="TIME_AND_MATERIAL">Time & Material</option>
                                        <option value="MANAGED_SERVICES">Managed Services</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Billing</label>
                                    <select
                                        name="billable"
                                        value={String(formData.billable)}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 text-sm appearance-none"
                                    >
                                        <option value="true">Billable</option>
                                        <option value="false">Non Billable</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 text-sm appearance-none"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="ON_HOLD">On Hold</option>
                                        <option value="DEFERRED">Deferred</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 truncate">
                                    <FileText size={12} /> Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Brief project summary..."
                                    className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 text-sm resize-none"
                                />
                            </div>
                        </div>

                        {/* Project Timeline */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm p-6 sm:p-8 space-y-6 transition-all duration-300">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-sm">
                                    <Calendar size={20} />
                                </div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white font-title">Timeline</h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Project start date</label>
                                    <DatePickerField 
                                         value={formData.startDate}
                                         onChange={(val) => handleDateChange("startDate", val)}
                                         name="startDate"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Project end date</label>
                                    <DatePickerField 
                                         value={formData.endDate}
                                         onChange={(val) => handleDateChange("endDate", val)}
                                         name="endDate"
                                         placeholder="Optional"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Teams & Actions */}
                    <div className="space-y-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm overflow-hidden sticky top-8">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-gray-400" />
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">Project Team</h3>
                                </div>
                                <span className="bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 px-2.5 py-1 text-[10px] font-bold rounded-full">
                                    {formData.assigneeIds.length} Selected
                                </span>
                            </div>
                            
                             <div className="p-4 border-b border-gray-50 dark:border-gray-800 space-y-3">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search teammates..."
                                        value={empSearch}
                                        onChange={(e) => setEmpSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-[#f8f9fa] dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-sm text-[12px] placeholder:text-gray-400 outline-none focus:border-primary-300 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-all text-left px-1 flex items-center justify-between"
                                >
                                    <span>{formData.assigneeIds.length === employees.length ? "Deselect All" : "Select All Teams"}</span>
                                    <span>{filteredEmployees.length} available</span>
                                </button>
                            </div>
                            
                            <div className="p-4 pt-2">
                                <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {fetchingEmployees ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 size={24} className="animate-spin text-gray-200" />
                                        </div>
                                    ) : filteredEmployees.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <p className="text-[10px] font-bold text-gray-300 uppercase">Not found result</p>
                                        </div>
                                    ) : (
                                        filteredEmployees.map((emp) => (
                                            <div 
                                                key={emp.id}
                                                onClick={() => handleAssigneeToggle(emp.id)}
                                                className={`flex items-center gap-3 p-2 rounded-sm border cursor-pointer transition-all ${formData.assigneeIds.includes(emp.id)
                                                    ? "bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800"
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent shadow-none"}`}
                                            >
                                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                                    {emp.profileImage ? (
                                                        <Image src={emp.profileImage} alt="" width={32} height={32} />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{emp.firstName[0]}{emp.lastName[0]}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                        {emp.firstName} {emp.lastName}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 truncate">{emp.designation?.name || emp.employeeId}</p>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.assigneeIds.includes(emp.id)
                                                    ? "bg-primary-600 border-primary-600"
                                                    : "border-gray-300 dark:border-gray-700"}`}>
                                                    {formData.assigneeIds.includes(emp.id) && <Plus size={10} className="text-white transform rotate-45" />}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-primary-600 px-6 py-3 text-white hover:bg-primary-700 transition-all font-bold text-sm shadow-sm shadow-primary-200 dark:shadow-none disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Update Settings
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-bold text-sm"
                                >
                                    <X size={18} />
                                    Discard Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
