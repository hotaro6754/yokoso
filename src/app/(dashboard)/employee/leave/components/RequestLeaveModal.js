"use client";

import { X } from "lucide-react";
import RequestLeaveForm from "./RequestLeaveForm";

export default function RequestLeaveModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl animate-in zoom-in-95 duration-300 relative"
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-50 dark:bg-brand-500/10 rounded-sm">
                <X size={16} className="text-brand-600 invisible" /> {/* Placeholder for spacing */}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                Submit Leave Request
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white" />
          </button>
        </div>

        <div className="p-1">
          <RequestLeaveForm compact={false} onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
