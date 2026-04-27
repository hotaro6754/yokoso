"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Settings,
    Clock,
    Users,
    FileText,
    Bell,
    ShieldAlert,
    HelpCircle,
    Plus,
    Trash2,
    Save,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Target,
    Scale
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { grievanceService } from "@/services/grievance.service";
import { toast } from "react-hot-toast";

export default function GrievanceSettingsPage() {
    const [activeTab, setActiveTab] = useState("policy");
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        sla: {
            general: 30,
            posh: 90,
            reminderDays: 5
        },
        anonymousEnabled: true,
        mandatoryDocs: ["Incident Statement", "MOM of Hearing", "Investigation findings"],
        panelStructure: {
            posh: ["Presiding Officer (Woman)", "Employee 1", "Employee 2", "External Member"],
            general: ["HR Lead", "Dept Manager"]
        },
        escalation: [
            { trigger: "SLA Breach", level: "Company Admin", autoNotify: true },
            { trigger: "Serious Misconduct", level: "Master Admin", autoNotify: true }
        ]
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await grievanceService.getSettings();
            setSettings(data.data || data);
        } catch (err) {
            console.error("Failed to load settings", err);
            // Stay with default mock state
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await grievanceService.updateSettings(settings);
            toast.success("Settings updated successfully");
        } catch (err) {
            toast.error("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    const toggleAnonymous = () => {
        setSettings(prev => ({ ...prev, anonymousEnabled: !prev.anonymousEnabled }));
    };

    const tabs = [
        { id: "policy", label: "Core Policy", icon: ShieldCheck },
        { id: "sla", label: "SLAs & Escalate", icon: Clock },
        { id: "workflow", label: "Workflow & Panel", icon: Users },
        { id: "docs", label: "Documentation", icon: FileText }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 space-y-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <Breadcrumb
                    customTitle="Grievance System Configuration"
                    subtitle="Define organizational policies, compliance rules, and investigator workflows"
                />

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-64 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                        : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                            >
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm min-h-[500px] overflow-hidden">

                            {/* Policy Tab */}
                            {activeTab === "policy" && (
                                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                                        <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl"><ShieldCheck size={28} /></div>
                                        <div>
                                            <h3 className="text-xl font-bold dark:text-white">Global Policy Settings</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Confidence & Privacy controls</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 group transition-all hover:border-primary-100">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Enable Anonymous Complaints</h4>
                                                <p className="text-xs text-gray-500">Allow employees to lodge concerns without revealing their identity.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={settings.anonymousEnabled} onChange={toggleAnonymous} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 transition-all"></div>
                                            </label>
                                        </div>

                                        <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Scale size={20} className="text-indigo-600" />
                                                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">POSH Act Compliance (India)</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    "Mandatory Senior Woman Presiding Officer",
                                                    "Mandatory 1 External Member in Committee",
                                                    "Strict 90-day resolution timeline",
                                                    "Protection against complainant retaliation"
                                                ].map((rule, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-400 font-medium">
                                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                                        {rule}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="mt-4 text-[10px] text-indigo-500 font-bold uppercase tracking-widest bg-white dark:bg-indigo-950/50 px-3 py-1 rounded-full inline-block">These rules are hardcoded as per regulatory standards.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SLA Tab */}
                            {activeTab === "sla" && (
                                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Clock size={28} /></div>
                                        <div>
                                            <h3 className="text-xl font-bold dark:text-white">SLA & Escalation Matrix</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Time-bound resolution tracking</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">General Grievance SLA (Days)</label>
                                            <input
                                                type="number"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                                value={settings.sla.general}
                                                onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, general: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">POSH Complaint SLA (Days)</label>
                                            <input
                                                type="number"
                                                className="w-full px-5 py-3 bg-red-50/30 border border-red-100 rounded-2xl text-sm font-bold text-red-600"
                                                value={settings.sla.posh}
                                                readOnly
                                            />
                                            <p className="text-[10px] text-gray-400 italic">Restricted by POSH Act (cannot exceed 90 days)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-widest flex items-center justify-between">
                                            Auto-Escalation Rules
                                            <button className="text-primary-600 text-[10px]"><Plus size={14} className="inline mr-1" /> Add Layer</button>
                                        </h4>
                                        <div className="space-y-3">
                                            {settings.escalation.map((rule, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 group">
                                                    <div className="p-2 bg-white rounded-lg text-primary-600 border border-primary-50 shadow-sm"><Bell size={16} /></div>
                                                    <div className="flex-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                        If <span className="text-primary-600">{rule.trigger}</span>, notify <span className="text-indigo-600">{rule.level}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Auto-Notify</span>
                                                    </div>
                                                    <button className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Workflow Tab */}
                            {activeTab === "workflow" && (
                                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Users size={28} /></div>
                                        <div>
                                            <h3 className="text-xl font-bold dark:text-white">Committee Structures</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Define panel composition templates</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-6 bg-white dark:bg-gray-800 border-2 border-primary-50 rounded-3xl space-y-4">
                                            <h4 className="text-xs font-bold text-purple-600 uppercase tracking-widest flex items-center justify-between">
                                                POSH Internal Committee (IC)
                                                <ShieldAlert size={14} />
                                            </h4>
                                            <div className="space-y-3">
                                                {settings.panelStructure.posh.map((role, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{role}</span>
                                                        <Settings size={12} className="text-gray-300 hover:text-primary-600 cursor-pointer" />
                                                    </div>
                                                ))}
                                                <button className="w-full py-2 border border-dashed border-purple-200 text-purple-600 text-[10px] font-bold uppercase rounded-lg">Update Composition</button>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white dark:bg-gray-800 border-2 border-indigo-50 rounded-3xl space-y-4">
                                            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center justify-between">
                                                General Grievance Panel
                                                <Users size={14} />
                                            </h4>
                                            <div className="space-y-3">
                                                {settings.panelStructure.general.map((role, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{role}</span>
                                                        <Settings size={12} className="text-gray-300 hover:text-primary-600 cursor-pointer" />
                                                    </div>
                                                ))}
                                                <button className="w-full py-2 border border-dashed border-indigo-200 text-indigo-600 text-[10px] font-bold uppercase rounded-lg">Update Composition</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                                        <div className="flex items-start gap-4">
                                            <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 uppercase tracking-widest leading-none">External Member Requirement</h4>
                                                <p className="text-xs text-amber-700 dark:text-amber-400">POSH Act requires one committee member from an NGO or body familiar with sexual harassment issues.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Documentation Tab */}
                            {activeTab === "docs" && (
                                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><FileText size={28} /></div>
                                        <div>
                                            <h3 className="text-xl font-bold dark:text-white">Mandatory Documentation</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Define evidence & reporting requirements</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {settings.mandatoryDocs.map((doc, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 flex items-center justify-center text-emerald-600"><FileText size={16} /></div>
                                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-tight">{doc}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-bold text-primary-600">MANDATORY</span>
                                                        <button className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="p-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-gray-400 transition-all hover:border-emerald-300 hover:text-emerald-600">
                                                <Plus size={18} /> Add Document Type
                                            </button>
                                        </div>

                                        <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Target size={20} className="text-emerald-600" />
                                                <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">Compliance Audit Ready</h4>
                                            </div>
                                            <p className="text-xs text-emerald-700 leading-relaxed">
                                                Defining these steps ensures that every case dossier contains the minimum legally required evidence before a final resolution can be recorded in the system.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
