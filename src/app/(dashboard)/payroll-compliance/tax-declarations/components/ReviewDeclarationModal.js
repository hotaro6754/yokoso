"use client";

import React, { useState } from "react";
import { X, Check, XCircle, FileText, Download, Eye, User, Calendar, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import investmentDeclarationService from "@/services/investment-declaration.service";
import { toast } from "react-hot-toast";

export default function ReviewDeclarationModal({ isOpen, onClose, declaration, onRefresh }) {
  const [adminComments, setAdminComments] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !declaration) return null;

  const handleReview = async (status) => {
    try {
      setLoading(true);
      await investmentDeclarationService.updateStatus(declaration.id, {
        status,
        adminComments
      });
      toast.success(`Declaration ${status.toLowerCase()}ed successfully`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const sec80C = declaration.section80C || {};
  const sec80D = declaration.section80D || {};
  const other = declaration.otherDeductions || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Investment Declaration</h3>
                <p className="text-sm text-gray-500">{declaration.employee.firstName} {declaration.employee.lastName} • {declaration.month} {declaration.financialYear}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400"><X size={20} /></button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* HRA Details */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  HRA Details
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rent Paid (Monthly):</span>
                    <span className="font-bold text-gray-900 dark:text-white">₹{declaration.hraRentPaid?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Landlord Name:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{declaration.hraLandlordName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Landlord PAN:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{declaration.hraLandlordPan || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Address:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{declaration.hraAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* 80C Details */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-green-500 rounded-full" />
                  Section 80C
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 space-y-3 text-sm">
                  {Object.entries(sec80C).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{parseFloat(val || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <span className="font-bold">Total 80C:</span>
                    <span className="font-bold text-blue-600">₹{Object.values(sec80C).reduce((a, b) => a + parseFloat(b || 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Proofs Section */}
            {declaration.supportingDocs && declaration.supportingDocs.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  Submitted Proofs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {declaration.supportingDocs.map((proof, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400">
                          <FileText size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{proof.section?.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{proof.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <a 
                          href={proof.url?.startsWith('http') ? proof.url : `${process.env.NEXT_PUBLIC_API_URL}${proof.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          title="View Document"
                        >
                          <Eye size={18} />
                        </a>
                        <a 
                          href={proof.url?.startsWith('http') ? proof.url : `${process.env.NEXT_PUBLIC_API_URL}${proof.url}`} 
                          download
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Download Document"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Controls */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-gray-400" />
                Reviewer Comments
              </h4>
              <textarea 
                rows="3"
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                placeholder="Add comments for the employee (mandatory for rejection)..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
             <button 
              onClick={async () => {
                try {
                  const blob = await investmentDeclarationService.generateForm12BB(declaration.id);
                  const url = window.URL.createObjectURL(new Blob([blob]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `Form_12BB_${declaration.employee?.firstName || 'Employee'}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  toast.success("Form 12BB generated successfully");
                } catch (err) {
                  toast.error("Failed to generate Form 12BB");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-brand-600 dark:text-brand-400 font-bold text-sm hover:underline"
             >
                <Download size={18} />
                Generate Form 12BB
             </button>

             <div className="flex gap-4">
                <button 
                  onClick={() => handleReview('REJECTED')}
                  disabled={loading || declaration.status === 'APPROVED' || declaration.status === 'REJECTED'}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle size={18} />
                  Reject
                </button>
                <button 
                  onClick={() => handleReview('APPROVED')}
                  disabled={loading || declaration.status === 'APPROVED' || declaration.status === 'REJECTED'}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} />
                  Approve
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
