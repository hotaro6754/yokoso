"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import projectService from "@/services/project.service";
import {
    FolderKanban, Plus, Edit2, Trash2, Calendar,
    Loader2, Search, Filter,
    CheckCircle2, Clock, Info,
    UserCheck, FileText, LayoutGrid, Shield,
    UserCircle, MoreVertical, ExternalLink,
    AlertCircle, Briefcase, Users, Building
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import Image from "next/image";
import { Download, Printer } from "lucide-react";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "@/app/(dashboard)/hr/reports-analytics/components/reportExport";

export default function ProjectPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [summary, setSummary] = useState({ activeProjects: 0, pendingApprovals: 0, resourceUtilization: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Effective role for permission checks
    const userRole = user?.role || user?.systemRole || "";

    // Roles that can manage (Create, Edit, Delete)
    const canManageProjects = [
        "HR", "HR_ADMIN", "COMPANY_ADMIN", "MANAGER", "COMPANY_OWNER", "SUPER_ADMIN", "MASTER_ADMIN"
    ].includes(userRole);
    const canApproveProjects = [
        "BU_HEAD",
        "PRACTICE_HEAD",
        "DEPT_HEAD",
        "COMPANY_ADMIN",
        "COMPANY_OWNER",
        "SUPER_ADMIN",
        "MASTER_ADMIN"
    ].includes(userRole);

    useEffect(() => {
        fetchProjects();

        const handleProjectsUpdated = () => {
            fetchProjects();
        };
        window.addEventListener("projectsUpdated", handleProjectsUpdated);
        return () => window.removeEventListener("projectsUpdated", handleProjectsUpdated);
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const [response, summaryResponse] = await Promise.all([
                projectService.getAllProjects(),
                projectService.getDashboardSummary().catch(() => ({ data: { activeProjects: 0, pendingApprovals: 0, resourceUtilization: 0 } }))
            ]);
            setProjects(response.data || []);
            setSummary(summaryResponse.data || { activeProjects: 0, pendingApprovals: 0, resourceUtilization: 0 });
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to fetch projects");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (project) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            setDeleting(true);
            await projectService.deleteProject(projectToDelete.publicId);
            toast.success("Project deleted successfully");
            fetchProjects();
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
        } catch (error) {
            toast.error("Failed to delete project");
        } finally {
            setDeleting(false);
        }
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = 
                p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [projects, searchQuery, statusFilter]);

    const exportRows = useMemo(() => {
        return filteredProjects.map((item) => ({
            code: item.projectCode || item.code || "-",
            name: item.projectName || item.name || "-",
            client: item.clientName || item.client || "-",
            status: item.status || "-",
            contractType: item.contractType ? String(item.contractType).replace(/_/g, " ") : "-",
            startDate: item.startDate || "",
            endDate: item.endDate || "",
            createdBy: item.createdByUser ? `${item.createdByUser.firstName || ""} ${item.createdByUser.lastName || ""}`.trim() : "-"
        }));
    }, [filteredProjects]);

    const stats = useMemo(() => {
        return {
            total: projects.length,
            active: summary.activeProjects || projects.filter(p => p.status === "ACTIVE").length,
            pending: summary.pendingApprovals || projects.filter(p => p.status === "PENDING_APPROVAL").length,
            draft: projects.filter(p => p.status === "DRAFT").length,
            utilization: summary.resourceUtilization || 0,
        };
    }, [projects, summary]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "DRAFT": return "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/30 dark:text-slate-400";
            case "CREATED": return "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/30 dark:text-sky-400";
            case "PENDING_APPROVAL": return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
            case "ACTIVE": return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "REJECTED": return "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400";
            case "COMPLETED": return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
            case "ON_HOLD": return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
            case "DEFERRED": return "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <div className="bg-[#f8f9fa] dark:bg-transparent min-h-screen p-4 sm:p-8 transition-colors duration-300">
            <div className="w-full space-y-4">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E0E2FE] tracking-tight">Project Management</h1>
                        <Breadcrumb items={[{ label: "Projects", path: "/projects" }]} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() =>
                                downloadExcel({
                                    columns: ["code", "name", "client", "status", "contractType", "startDate", "endDate", "createdBy"],
                                    rows: exportRows,
                                    fileName: "project-report.xlsx",
                                })
                            }
                            disabled={exportRows.length === 0}
                            className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            Report
                        </button>
                        <button
                            onClick={() => downloadPdf({ fileName: "project-report.pdf" })}
                            className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <Printer className="h-4 w-4" />
                            PDF / Print
                        </button>
                        <button
                            onClick={printReport}
                            className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>

                        {canManageProjects && (
                            <Link
                                href="/projects/create"
                                className="inline-flex items-center gap-2 rounded-sm bg-primary-600 px-5 py-2.5 text-white hover:bg-primary-700 dark:bg-[#BBBDEC] dark:text-[#111827] dark:hover:bg-[#E0E2FE] transition-all shadow-sm font-bold text-sm"
                            >
                                <Plus size={18} /> New Project
                            </Link>
                        )}
                        {canApproveProjects && (
                            <Link
                                href="/approvals"
                                className="inline-flex items-center gap-2 rounded-sm border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300"
                            >
                                <Shield size={16} /> Approvals
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Projects", value: stats.total, icon: FolderKanban, color: "text-blue-600", bg: "bg-blue-50/50" },
                        { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                        { label: "Pending Approval", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50/50" },
                        { label: "Resource Utilization", value: `${stats.utilization}%`, icon: UserCheck, color: "text-indigo-600", bg: "bg-indigo-50/50" },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-[rgba(187,189,236,0.08)] p-5 border border-gray-200 dark:border-[rgba(187,189,236,0.2)] rounded-sm shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-[#E0E2FE] mt-1.5">{stat.value}</p>
                            </div>
                            <div className={`${stat.bg} dark:bg-[rgba(187,189,236,0.12)] p-3 rounded-sm ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-[rgba(187,189,236,0.08)] p-4 border border-gray-200 dark:border-[rgba(187,189,236,0.2)] rounded-sm shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative group w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by project name, code or client..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] dark:bg-[rgba(187,189,236,0.06)] border border-gray-200 dark:border-[rgba(187,189,236,0.25)] rounded-sm text-sm outline-none focus:border-primary-400 transition-all text-gray-900 dark:text-[#E0E2FE]"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {["ALL", "DRAFT", "CREATED", "PENDING_APPROVAL", "ACTIVE", "REJECTED", "COMPLETED", "ON_HOLD", "DEFERRED"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 text-xs font-bold rounded-sm border transition-all whitespace-nowrap ${statusFilter === status 
                                        ? "bg-primary-600 text-white border-primary-600 dark:bg-[#BBBDEC] dark:text-[#111827] dark:border-[#BBBDEC]" 
                                        : "bg-white dark:bg-[rgba(187,189,236,0.06)] text-gray-500 dark:text-[#BBBDEC] border-gray-200 dark:border-[rgba(187,189,236,0.2)] hover:border-gray-300"}`}
                                >
                                    {status.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Project Inventory */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                        <p className="text-xs font-medium text-gray-400">Loading your projects...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="bg-white dark:bg-[rgba(187,189,236,0.08)] rounded-sm p-20 text-center border border-gray-200 dark:border-[rgba(187,189,236,0.2)] shadow-sm">
                        <FolderKanban size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-[#E0E2FE] font-title">No projects found</h3>
                        <p className="text-sm text-gray-500 dark:text-[#BBBDEC] mt-1 max-w-md mx-auto">There are no projects matching your current filters or you haven't been assigned to any yet.</p>
                        {canManageProjects && (
                             <Link
                             href="/projects/create"
                             className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary-100 dark:bg-[rgba(187,189,236,0.12)] px-6 py-2.5 text-primary-600 dark:text-[#E0E2FE] hover:bg-primary-200 transition-all font-bold text-sm"
                         >
                             Add First Project
                         </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white dark:bg-[rgba(187,189,236,0.06)] rounded-sm border border-gray-200 dark:border-[rgba(187,189,236,0.2)] overflow-hidden hover:border-primary-400/50 hover:shadow-lg transition-all duration-300 group flex flex-col"
                            >
                                <div className="p-6 space-y-4 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-primary-600 dark:text-[#BBBDEC] uppercase tracking-widest">{project.projectCode}</p>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-[#E0E2FE] leading-tight group-hover:text-primary-600 transition-colors">
                                                {project.projectName}
                                            </h3>
                                        </div>
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-sm border uppercase tracking-wider ${getStatusStyle(project.status)}`}>
                                            {project.status.replace("_", " ")}
                                        </span>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#BBBDEC]">
                                            <Building className="shrink-0" size={16} />
                                            <span className="font-medium truncate">{project.clientName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#BBBDEC]">
                                            <Briefcase className="shrink-0" size={16} />
                                            <span className="capitalize">{project.contractType.toLowerCase().replace(/_/g, " ")}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#BBBDEC]">
                                            <Calendar className="shrink-0" size={16} />
                                            <span>
                                                {format(new Date(project.startDate), "MMM d, yyyy")}
                                                {project.endDate && ` - ${format(new Date(project.endDate), "MMM d, yyyy")}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Assigned</p>
                                        <div className="flex items-center -space-x-2 overflow-hidden">
                                            {project.assignments?.slice(0, 5).map((assignee, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-[rgba(187,189,236,0.2)] bg-gray-100 dark:bg-[rgba(187,189,236,0.12)] flex items-center justify-center overflow-hidden"
                                                    title={`${assignee.employee.firstName} ${assignee.employee.lastName}`}
                                                >
                                                    {assignee.employee.profileImage ? (
                                                        <Image 
                                                            src={assignee.employee.profileImage} 
                                                            alt="" 
                                                            width={32} 
                                                            height={32} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                            {assignee.employee.firstName[0]}{assignee.employee.lastName[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {project.assignments?.length > 5 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[rgba(187,189,236,0.2)] bg-gray-100 dark:bg-[rgba(187,189,236,0.12)] flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                    +{project.assignments.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workflow</p>
                                        <p className="mt-2 text-xs text-gray-500 dark:text-[#BBBDEC]">
                                            {project.status === "DRAFT" && "Assign PM and RM to move this project into created status."}
                                            {project.status === "CREATED" && "Allocate resources and define the work schedule before submission."}
                                            {project.status === "PENDING_APPROVAL" && "Waiting for approval before activation and timesheet enablement."}
                                            {project.status === "ACTIVE" && "Timesheets are enabled for allocated team members."}
                                            {project.status === "REJECTED" && "Rework the plan and resubmit for approval."}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-[rgba(187,189,236,0.06)] border-t border-gray-200 dark:border-[rgba(187,189,236,0.2)] flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-[#BBBDEC] font-bold uppercase tracking-wider">
                                        <Shield size={12} />
                                        <span>By {project.createdByUser?.firstName} {project.createdByUser?.lastName}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {canManageProjects && (
                                            <>
                                                <Link
                                                    href={`/projects/edit/${project.id}`}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-white dark:hover:bg-gray-900 rounded-sm transition-all"
                                                    title="Edit settings"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(project)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-900 rounded-sm transition-all"
                                                    title="Delete project"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                        <Link
                                            href={`/projects/${project.publicId}`}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-900 rounded-sm transition-all"
                                            title="View details"
                                        >
                                            <ExternalLink size={16} />
                                        </Link>
                                        {canManageProjects && (
                                            <>
                                                <Link
                                                    href={`/projects/${project.publicId}/assign`}
                                                    className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-white dark:hover:bg-gray-900 rounded-sm transition-all"
                                                    title="Assign leadership"
                                                >
                                                    <Users size={16} />
                                                </Link>
                                                <Link
                                                    href={`/projects/${project.publicId}/allocation`}
                                                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-gray-900 rounded-sm transition-all"
                                                    title="Manage allocations"
                                                >
                                                    <Briefcase size={16} />
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Confirm Delete Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-sm shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
                            <div className="p-6">
                                <div className="flex items-center gap-3 text-red-600 mb-4">
                                    <AlertCircle size={24} />
                                    <h2 className="text-lg font-bold">Delete Project?</h2>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{projectToDelete?.projectName}" ({projectToDelete?.projectCode})</span>? 
                                    All assigned data and records for this project will be permanently removed.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-red-200 dark:shadow-none"
                                >
                                    {deleting ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
