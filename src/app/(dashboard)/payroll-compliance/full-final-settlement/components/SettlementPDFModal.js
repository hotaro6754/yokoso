"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Clock } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "react-hot-toast";

const SettlementPDFModal = ({ settlement, formatCurrency, getStatusBadge, onClose }) => {
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      let y = 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Full & Final Settlement Statement", 105, y, { align: "center" });
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Employee Details", 20, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${settlement.employee.name}`, 20, y);
      y += 5;
      doc.text(`Employee ID: ${settlement.employee.employeeId}`, 20, y);
      y += 5;
      doc.text(`Department: ${settlement.employee.department}`, 20, y);
      y += 5;
      doc.text(`Exit Date: ${new Date(settlement.lastWorkingDate).toLocaleDateString()}`, 20, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Settlement Breakdown", 20, y);
      y += 6;

      const rows = [
        ["Gross Salary", formatCurrency(settlement.totalSettlement * 1.2)],
        ["Leave Encashment", formatCurrency(settlement.totalSettlement * 0.1)],
        ["Gratuity", formatCurrency(settlement.totalSettlement * 0.15)],
        ["Bonus", formatCurrency(settlement.totalSettlement * 0.05)],
        ["Total Earnings", formatCurrency(settlement.totalSettlement * 1.5)],
        ["Provident Fund", `-${formatCurrency(settlement.totalSettlement * 0.12)}`],
        ["Professional Tax", `-${formatCurrency(settlement.totalSettlement * 0.08)}`],
        ["Income Tax", `-${formatCurrency(settlement.totalSettlement * 0.1)}`],
        ["Total Deductions", `-${formatCurrency(settlement.totalSettlement * 0.3)}`],
        ["Net Settlement", formatCurrency(settlement.totalSettlement)],
      ];

      doc.setFontSize(10);
      rows.forEach(([label, value]) => {
        doc.text(label, 20, y);
        doc.text(value, 190, y, { align: "right" });
        y += 6;
      });

      y += 8;
      doc.setFontSize(8);
      doc.text("This is a computer-generated settlement statement.", 105, y, { align: "center" });
      y += 4;
      doc.text("For any queries, please contact HR Department.", 105, y, { align: "center" });

      doc.save(`Settlement_${settlement.employee.name.replace(/\s+/g, "_")}.pdf`);
      toast.success("Settlement PDF downloaded");
    } catch (error) {
      console.error("Error generating settlement PDF:", error);
      toast.error("Failed to generate settlement PDF");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Settlement Details - {settlement.employee.name}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Employee Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600 dark:text-gray-400">Name:</span> {settlement.employee.name}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Employee ID:</span> {settlement.employee.employeeId}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Department:</span> {settlement.employee.department}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Settlement Timeline</h4>
              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Exit Date</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {new Date(settlement.lastWorkingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-900/30 rounded-xl border border-brand-200 dark:border-brand-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Net Settlement Amount</p>
                <p className="text-3xl font-bold text-brand-800 dark:text-brand-200">
                  {formatCurrency(settlement.totalSettlement)}
                </p>
              </div>
              <div className="text-right">{getStatusBadge(settlement.status)}</div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettlementPDFModal;
