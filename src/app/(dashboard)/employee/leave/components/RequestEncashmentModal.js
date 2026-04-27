"use client";

import { useState } from "react";
import {
    X,
    Banknote,
    Info,
    AlertCircle,
    Clock,
    CheckCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function RequestEncashmentModal({ isOpen, onClose, userProfile }) {
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState("");
    const [remark, setRemark] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (userProfile?.status === "PROBATION") {
            toast.error("Encashment is not available during probation.");
            return;
        }

        if (!days || days <= 0) {
            toast.error("Please enter a valid number of days.");
            return;
        }

        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success("Encashment request submitted successfully! It will be reviewed by HR.");
            onClose();
        } catch (error) {
            toast.error("Failed to submit encashment request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-sm">
                            <Banknote size={18} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                            Request Leave Encashment
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Policy Information */}
                    <div className="p-3 bg-brand-50 border border-brand-100 rounded-sm">
                        <div className="flex gap-2 text-xs text-brand-800">
                            <Info size={14} className="flex-shrink-0 mt-0.5" />
                            <p>
                                Encashment is subject to policy terms. Usually, a minimum balance must be maintained, and only EL/PL can be encashed.
                            </p>
                        </div>
                    </div>

                    {userProfile?.status === "PROBATION" && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-sm">
                            <div className="flex gap-2 text-xs text-red-800 font-medium">
                                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                <p>Not eligible for encashment during probation.</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                            Number of Days to Encash <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            placeholder="e.g. 5"
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                            required
                            disabled={userProfile?.status === "PROBATION"}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                            Reason / Remarks
                        </label>
                        <textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Why are you requesting encashment?"
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition resize-none"
                            disabled={userProfile?.status === "PROBATION"}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || userProfile?.status === "PROBATION"}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest rounded-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <Clock className="animate-spin h-4 w-4" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    Submit Encashment Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
