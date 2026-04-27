"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Paperclip, AlertCircle, Info, FileText } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

const CLAIM_TYPES = [
    { id: "CLIENT_EXPENSE", label: "Client Expense" },
    { id: "EMPLOYEE_ENGAGEMENT", label: "Employee Engagement" },
    { id: "TRAINING", label: "Training" },
    { id: "TRAVEL", label: "Travel Expenses" },
    { id: "VISA", label: "Visa Expenses" }
];

const CLAIM_STATUSES = [
    { id: "DRAFT", label: "Draft", color: "text-orange-500" },
    { id: "SUBMITTED", label: "Submitted", color: "text-blue-500" },
    { id: "UNDER_REVIEW", label: "Under Review", color: "text-yellow-600" },
    { id: "APPROVED", label: "Approved", color: "text-green-500" },
    { id: "REJECTED", label: "Rejected", color: "text-red-500" },
    { id: "PAID", label: "Paid", color: "text-emerald-600" },
    { id: "CANCELLED", label: "Cancelled", color: "text-gray-500" },
];

export default function ExpenseClaimModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [claimType, setClaimType] = useState("CLIENT_EXPENSE");
    const [claimStatus, setClaimStatus] = useState("DRAFT");
    const [preApprovals, setPreApprovals] = useState([]);
    const [items, setItems] = useState([
        { receiptNo: "", amount: "", date: "", comments: "", teamName: "", typeOfExpense: "", courseDetails: "", travellingFrom: "", travellingTo: "", destinationCountry: "", attachment: null }
    ]);
    const [preApprovalId, setPreApprovalId] = useState("");

    useEffect(() => {
        if (isOpen) {
            // Reset form fields
            setClaimType("CLIENT_EXPENSE");
            setClaimStatus("DRAFT");
            setPreApprovalId("");
            setItems([
                { receiptNo: "", amount: "", date: "", comments: "", teamName: "", typeOfExpense: "", courseDetails: "", travellingFrom: "", travellingTo: "", destinationCountry: "", attachment: null }
            ]);
            setLoading(false);

            api.get("/expense-management/pre-approval?status=PRE_APPROVED").then(res => {
                setPreApprovals(res.data.items);
            }).catch(() => { });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const addItem = () => {
        setItems([...items, { receiptNo: "", amount: "", date: "", comments: "", teamName: "", typeOfExpense: "", courseDetails: "", travellingFrom: "", travellingTo: "", destinationCountry: "", attachment: null }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();

        // Basic validation
        const hasEmptyFields = items.some(item => !item.receiptNo || !item.amount || !item.date);
        if (hasEmptyFields) {
            toast.error("Please fill in Receipt No, Date, and Amount for all items");
            return;
        }

        try {
            setLoading(true);

            await api.post("/expense-management/claims", {
                claimType,
                status: claimStatus,
                preApprovalId,
                items: items.map(i => ({
                    receiptNo: i.receiptNo,
                    amount: i.amount,
                    date: i.date,
                    comments: i.comments,
                    teamName: i.teamName,
                    typeOfExpense: i.typeOfExpense,
                    courseDetails: i.courseDetails,
                    travellingFrom: i.travellingFrom,
                    travellingTo: i.travellingTo,
                    destinationCountry: i.destinationCountry,
                }))
            });

            toast.success("Expense claim submitted!");
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Expense Claim Error:", error);
            const msg = error.response?.data?.message || error.message || "Submission failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500 rounded-lg">
                            <FileText size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">Submit New Expense Claim</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details and attach receipt copies</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Total Amount</p>
                            <h3 className="text-2xl font-black text-brand-600">₹{totalAmount.toLocaleString()}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition text-gray-400">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Claim Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-brand-50/50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100 dark:border-brand-900/30">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase">Claim Type</label>
                            <select
                                className="w-full bg-white dark:bg-gray-900 border border-brand-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white"
                                value={claimType}
                                onChange={(e) => setClaimType(e.target.value)}
                            >
                                {CLAIM_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>

                        {claimType === 'TRAINING' && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase">Pre-Approval ID</label>
                                <select
                                    className="w-full bg-white dark:bg-gray-900 border border-brand-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white"
                                    value={preApprovalId}
                                    onChange={(e) => setPreApprovalId(e.target.value)}
                                >
                                    <option value="">Select Pre-Approval</option>
                                    {preApprovals.map(pa => <option key={pa.id} value={pa.id}>{pa.preApprovalId} - {pa.purpose}</option>)}
                                </select>
                                <p className="text-[10px] text-brand-600 font-medium">If you have an approved Pre-Approval, select it from the dropdown (required for Training).</p>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase">Status</label>
                            <select
                                className="w-full bg-white dark:bg-gray-900 border border-brand-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white font-bold"
                                value={claimStatus}
                                onChange={(e) => setClaimStatus(e.target.value)}
                            >
                                {CLAIM_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Items Container */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <Info size={18} className="text-brand-500" />
                                Line Items
                            </h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm text-brand-600 font-bold hover:underline flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Another Item
                            </button>
                        </div>

                        {items.map((item, index) => (
                            <div key={index} className="relative p-6 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/20 space-y-4 group">
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="absolute -top-3 -right-3 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition shadow-sm opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Receipt No</label>
                                        <input
                                            required
                                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white"
                                            value={item.receiptNo}
                                            onChange={(e) => updateItem(index, "receiptNo", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white text-sm"
                                            value={item.date}
                                            onChange={(e) => updateItem(index, "date", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Amount (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white font-bold"
                                            value={item.amount}
                                            onChange={(e) => updateItem(index, "amount", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Attachment</label>
                                        <div className="relative group/file">
                                            <input
                                                type="file"
                                                className="hidden"
                                                id={`file-${index}`}
                                                onChange={(e) => updateItem(index, "attachment", e.target.files[0])}
                                            />
                                            <label
                                                htmlFor={`file-${index}`}
                                                className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg px-3 py-2 cursor-pointer transition ${item.attachment ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600' : 'border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 text-gray-400'}`}
                                            >
                                                <Paperclip size={16} />
                                                <span className="text-xs font-medium truncate">{item.attachment ? item.attachment.name : "Select Receipt"}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Fields based on Type */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(claimType === 'CLIENT_EXPENSE' || claimType === 'EMPLOYEE_ENGAGEMENT') && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Team Name</label>
                                            <input
                                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white"
                                                value={item.teamName}
                                                onChange={(e) => updateItem(index, "teamName", e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {claimType === 'TRAVEL' && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Travelling From</label>
                                                <input
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white"
                                                    value={item.travellingFrom}
                                                    onChange={(e) => updateItem(index, "travellingFrom", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Travelling To</label>
                                                <input
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white"
                                                    value={item.travellingTo}
                                                    onChange={(e) => updateItem(index, "travellingTo", e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {claimType === 'VISA' && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Destination Country</label>
                                            <input
                                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white"
                                                value={item.destinationCountry}
                                                onChange={(e) => updateItem(index, "destinationCountry", e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 md:col-span-2 space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Comments / Business Case</label>
                                        <input
                                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition dark:text-white"
                                            value={item.comments}
                                            onChange={(e) => updateItem(index, "comments", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle size={18} />
                        <p className="text-xs font-medium">Duplicate checking will be performed upon submission.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition font-bold dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Submit Claim"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
