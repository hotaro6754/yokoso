'use client';

import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function StatusReasonDialog({ isOpen, onCancel, onConfirm, status }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
    } catch(err) {
        console.error("Error in status reason dialog confirm:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex-shrink-0">
             <AlertCircle size={24} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Update Status to {status}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please provide a reason for this status change.
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
           <textarea
             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
             placeholder="Enter reason here..."
             value={reason}
             onChange={(e) => {
                 setReason(e.target.value);
                 setError('');
             }}
           />
           {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-5 py-2.5 text-sm font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : null}
            Confirm Update
          </button>
        </div>
      </div>
    </div>
  );
}
