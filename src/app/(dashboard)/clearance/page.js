"use client";

import { useState, useEffect } from "react";
import { separationService } from "@/services/hr-services/separation-new.service";
import { toast } from "react-hot-toast";
import {
    CheckCircle2,
    Loader2,
    Box,
    CreditCard,
    UserX,
    ShieldCheck,
    AlertCircle
} from "lucide-react";

export default function ClearanceManagementPage() {
    const [resignations, setResignations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResignationsForClearance();
    }, []);

    const fetchResignationsForClearance = async () => {
        try {
            setLoading(true);
            // Fetch all HR APPROVED resignations needing clearance
            const response = await separationService.getDashboard({ status: 'HR_APPROVED' });
            if (response.success) {
                setResignations(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearance = async (resignationId, department, status, notes) => {
        try {
            await separationService.submitClearance(resignationId, { department, status, notes });
            toast.success(`${department} Clearance Updated`);
            fetchResignationsForClearance();
        } catch (error) {
            toast.error("Failed to update clearance");
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">No-Due Clearance Management</h1>
                <p className="text-gray-500">Department-wise clearance approvals for exiting employees.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {resignations.length > 0 ? resignations.map((req) => (
                    <div key={req.id} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-1/3 p-6 bg-gray-50 dark:bg-gray-900/50 border-r dark:border-gray-700 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xl">
                                        {req.employee?.firstName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{req.employee?.firstName} {req.employee?.lastName}</h3>
                                        <p className="text-sm text-gray-500">{req.employee?.employeeId} | {req.employee?.department?.name}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Exit Information</p>
                                    <div className="flex justify-between text-sm">
                                        <span>LWD:</span>
                                        <span className="font-bold text-red-500">{new Date(req.lastWorkingDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800">
                                <AlertCircle className="w-4 h-4" />
                                Ensure all physical assets are returned before clearing.
                            </div>
                        </div>

                        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { dept: 'IT', icon: Box, color: 'blue' },
                                { dept: 'FINANCE', icon: CreditCard, color: 'green' },
                                { dept: 'ADMIN', icon: ShieldCheck, color: 'purple' },
                                { dept: 'HR', icon: UserX, color: 'brand' }
                            ].map((item) => {
                                const clearance = req.clearances?.find(c => c.department === item.dept);
                                const isCleared = clearance?.status === 'CLEAR';
                                const Icon = item.icon;

                                return (
                                    <div key={item.dept} className={`p-4 rounded-xl border-2 transition-all ${isCleared ? "bg-green-50 border-green-500 dark:bg-green-900/10" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`p-2 rounded-lg bg-${item.color}-100 text-${item.color}-600 dark:bg-${item.color}-900/30`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            {isCleared && <span className="text-[10px] font-bold text-green-600 uppercase">CLEARED</span>}
                                        </div>
                                        <h4 className="font-bold mb-4">{item.dept} Clearance</h4>

                                        {!isCleared ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    placeholder="Add notes (tags, serial numbers, etc.)"
                                                    className="w-full p-2 text-xs rounded-lg border dark:bg-gray-900"
                                                    rows={2}
                                                    id={`notes-${req.id}-${item.dept}`}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const notes = document.getElementById(`notes-${req.id}-${item.dept}`).value;
                                                            handleClearance(req.id, item.dept, 'CLEAR', notes);
                                                        }}
                                                        className="flex-1 py-2 bg-green-500 text-white rounded-lg text-xs font-bold shadow-sm hover:translate-y-[-1px] transition-transform"
                                                    >
                                                        Mark as Clear
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const notes = document.getElementById(`notes-${req.id}-${item.dept}`).value;
                                                            handleClearance(req.id, item.dept, 'NA', notes);
                                                        }}
                                                        className="px-3 py-2 border dark:border-gray-600 rounded-lg text-xs font-medium text-gray-500"
                                                    >
                                                        N/A
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 italic">
                                                Cleared by {clearance.clearedByEmp?.firstName || 'Admin'} on {new Date(clearance.clearedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <CheckCircle2 className="w-20 h-20 mx-auto text-gray-300 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-gray-400">No Pending Clearances</h3>
                        <p className="text-gray-400 text-sm">All exiting employees are currently up-to-date.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
