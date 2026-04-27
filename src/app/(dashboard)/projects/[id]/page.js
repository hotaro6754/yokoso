"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import projectService from "@/services/project.service";
import { 
    FolderKanban, Calendar, Loader2, Users, 
    Briefcase, Building, FileText, Tag, 
    ArrowLeft, Edit2, Trash2, Shield, 
    Clock, CheckCircle2, AlertCircle, Info
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import Image from "next/image";

export default function ProjectDetailsPage() {
    const router = useRouter();
    const { id: projectId } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // Effective role for permission checks
    const userRole = user?.role || user?.systemRole || "";
    const canManageProjects = [
        "HR", "HR_ADMIN", "COMPANY_ADMIN", "MANAGER", "COMPANY_OWNER", "SUPER_ADMIN", "MASTER_ADMIN"
    ].includes(userRole);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const response = await projectService.getProjectById(projectId);
                setProject(response.data);
            } catch (error) {
                console.error("Load error:", error);
                toast.error("Failed to load project details");
                router.push("/projects");
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "DRAFT": return "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/30 dark:text-slate-400";
            case "ACTIVE": return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "COMPLETED": return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
            case "ON_HOLD": return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
            case "DEFERRED": return "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-primary-600" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Project Details...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="bg-[#f8f9fa] dark:bg-gray-950 min-h-screen p-4 sm:p-8 transition-colors duration-300">
            <div className="w-full space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-4">
                        <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors">
                            <ArrowLeft size={14} /> Back to Projects
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 flex items-center justify-center shadow-sm">
                                <FolderKanban size={24} className="text-primary-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{project.projectCode}</span>
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${getStatusStyle(project.status)}`}>
                                        {project.status.replace("_", " ")}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {project.projectName}
                                </h1>
                            </div>
                        </div>
                        <Breadcrumb items={[{ label: "Projects", path: "/projects" }, { label: project.projectName }]} />
                    </div>

                    {canManageProjects && (
                        <div className="flex items-center gap-2">
                            <Link 
                                href={`/projects/edit/${project.id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest rounded-sm hover:border-primary-400 transition-all shadow-sm"
                            >
                                <Edit2 size={14} /> Edit Project
                            </Link>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-sm shadow-sm space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Size</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{project.assignments?.length || 0}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-sm shadow-sm space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contract</p>
                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter decoration-primary-500/30 underline underline-offset-4">
                                    {project.contractType.replace(/_/g, " ")}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-sm shadow-sm space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {format(new Date(project.startDate), "MMM dd, yyyy")}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-sm shadow-sm space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {project.endDate ? format(new Date(project.endDate), "MMM dd, yyyy") : "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Project Identity */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
                                <Briefcase size={18} className="text-primary-500" />
                                <h3>Project Overview</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Name</p>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-sm">
                                            <Building size={16} className="text-gray-400" />
                                            <span className="font-bold text-gray-700 dark:text-gray-300">{project.clientName}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Lead</p>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-sm">
                                            <Shield size={16} className="text-gray-400" />
                                            <span className="font-bold text-gray-700 dark:text-gray-300">
                                                {project.createdByUser?.firstName} {project.createdByUser?.lastName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</p>
                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-sm text-sm text-gray-600 dark:text-gray-400 leading-relaxed min-h-[100px]">
                                        {project.description || "No description provided for this project."}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Meta Info */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                <Clock size={14} />
                                <span>Last Updated: {format(new Date(project.updatedAt), "PPP p")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                <Calendar size={14} />
                                <span>Created: {format(new Date(project.createdAt), "PPP")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Team */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-primary-500" />
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Project Team</h3>
                                </div>
                                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 text-[10px] font-bold rounded-full border border-primary-200 dark:border-primary-800">
                                    {project.assignments?.length || 0} Members
                                </span>
                            </div>
                            
                            <div className="p-4">
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {project.assignments && project.assignments.length > 0 ? (
                                        project.assignments.map((assignment) => {
                                            const emp = assignment.employee;
                                            return (
                                                <div 
                                                    key={assignment.id}
                                                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-sm shadow-sm hover:border-primary-200 transition-all group"
                                                >
                                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:border-primary-300">
                                                        {emp.profileImage ? (
                                                            <Image 
                                                                src={emp.profileImage} 
                                                                alt="" 
                                                                width={40} 
                                                                height={40} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-xs font-bold text-gray-500">{emp.firstName[0]}{emp.lastName[0]}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                            {emp.firstName} {emp.lastName}
                                                        </h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">
                                                            {emp.designation?.name || "Member"}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-12 text-center space-y-2">
                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No members assigned</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
