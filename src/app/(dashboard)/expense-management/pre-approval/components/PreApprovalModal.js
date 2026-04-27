"use client";

import React, { useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function PreApprovalModal({ isOpen, onClose, onSuccess, item }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        purpose: "",
        expenseType: "Budgeted",
        estimatedCost: "",
        timeline: ""
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post("/expense-management/pre-approval", {
                ...formData,
                estimatedCost: parseFloat(formData.estimatedCost)
            });
            toast.success("Request submitted successfully");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500 rounded-lg">
                            <Save size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">New Pre-Approval Request</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Submit a business case for large expenses</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Purpose</label>
                        <input
                            required
                            placeholder="e.g., AWS Cloud Practitioner Certification"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Expense Type</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                                value={formData.expenseType}
                                onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
                            >
                                <option value="Budgeted">Budgeted</option>
                                <option value="Non-Budgeted">Non-Budgeted</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estimated Cost (₹)</label>
                            <input
                                required
                                type="number"
                                placeholder="0.00"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                                value={formData.estimatedCost}
                                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Timeline (Required By)</label>
                        <DatePickerField
                            value={formData.timeline}
                            onChange={(dateStr) => setFormData({ ...formData, timeline: dateStr })}
                            placeholder="Select required date"
                            min="today"
                            className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        />
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50 flex gap-3">
                        <AlertCircle className="text-amber-600 shrink-0" size={20} />
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Once approved, a unique Pre-Approval ID will be generated which must be linked to your final expense claim.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-semibold shadow-lg shadow-brand-500/20 disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
