"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  DollarSign,
  Download,
  Loader2,
  Receipt,
  Search,
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";
import SettlementPdfDownloadButton from "./SettlementPdfDownloadButton";

export default function CalculateSettlementTab({
  selectedEmployee,
  setSelectedEmployee,
  employees,
  searchQuery,
  onSearch,
  formatCurrency,
  calculating,
  calculationData,
  onCalculate,
  onResetCalculation,
}) {
  const [showEmployeeList, setShowEmployeeList] = useState(true);

  const handleEmployeeSelect = (emp) => {
    const employeeName =
      emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
    setSelectedEmployee(emp);
    onResetCalculation();
    onSearch(employeeName);
    setShowEmployeeList(false);
  };

  const handleSearchChange = (value) => {
    setShowEmployeeList(true);
    onSearch(value);
  };

  const showCalculation = Boolean(calculationData);
  const settlementForPdf =
    selectedEmployee && calculationData
      ? {
        employee: {
          name:
            selectedEmployee.name ||
            `${selectedEmployee.firstName || ""} ${selectedEmployee.lastName || ""
              }`.trim(),
          employeeId: selectedEmployee.employeeId || "N/A",
          department:
            selectedEmployee.department?.name ||
            selectedEmployee.department ||
            "N/A",
        },
        lastWorkingDate:
          selectedEmployee.lastWorkingDate || new Date().toISOString(),
        totalSettlement: Number(calculationData.netSettlement || 0),
        totalEarnings: calculationData.earnings.totalEarnings,
        totalDeductions: calculationData.deductions.totalDeductions,
        earnings: calculationData.earnings,
        deductions: calculationData.deductions,
        employeeDetails: {
          designation: selectedEmployee.designation?.name || selectedEmployee.designation || "N/A",
          phone: selectedEmployee.phone || "N/A",
          email: selectedEmployee.email || "N/A",
          joiningDate: calculationData.inputs?.joiningDate || selectedEmployee.joiningDate,
          bankName: selectedEmployee.bankName || "N/A",
          accountNumber: selectedEmployee.accountNumber || "****",
          panNumber: selectedEmployee.panNumber || "****",
        },
        inputs: calculationData.inputs
      }
      : null;

  const handleGenerateLetter = () => {
    if (!settlementForPdf) {
      toast.error("Please calculate settlement first");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const margin = 25;
      const contentWidth = pageWidth - (margin * 2);
      let y = 30;

      // 1. Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Full & Final Settlement Letter", pageWidth / 2, y, { align: "center" });
      y += 20;

      // 2. Date
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
      y += 12;

      // 3. Recipient Details
      const employeeName = settlementForPdf.employee.name || "Employee";
      doc.setFont("helvetica", "bold");
      doc.text(`To,`, margin, y);
      y += 6;
      doc.text(employeeName, margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(`Employee ID: ${settlementForPdf.employee.employeeId}`, margin, y);
      y += 5;
      doc.text(`Department: ${settlementForPdf.employee.department}`, margin, y);
      y += 15;

      // 4. Subject
      doc.setFont("helvetica", "bold");
      doc.text(`Subject: Full and Final Settlement Statement - ${employeeName}`, margin, y);
      y += 12;

      // 5. Salutation
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text(`Dear ${employeeName.split(' ')[0]},`, margin, y);
      y += 10;

      // Use INR instead of symbols to avoid stretching/font issues in body text
      const netPayableText = `INR ${settlementForPdf.totalSettlement.toLocaleString('en-IN')}`;

      // 6. Body Paragraphs
      const paragraphs = [
        `This letter is to formally communicate the details of your full and final settlement following your separation from our organization. We have completed the processing of all your outstanding dues and recoveries as per the final audit and company policy.`,

        `The settlement includes your pro-rated salary for the final month, leave encashment (wherever applicable), any pending bonuses, and statutory gratuity if eligible. Deductions, if any, related to notice period adjustments or company property have also been included in the final calculation.`,

        `Based on the final calculation, the net payable amount stands at ${netPayableText}. This amount will be disbursed via bank transfer to your salary account currently on our records within the next few business days.`,

        `Attached with this letter is a detailed settlement statement for your reference. Should you have any questions or require further information regarding this statement, please feel free to reach out to the HR Department at your convenience.`
      ];

      paragraphs.forEach((text) => {
        const lines = doc.splitTextToSize(text, contentWidth);
        // Using a manual loop for lines to ensure no weird stretching
        lines.forEach(line => {
          doc.text(line, margin, y);
          y += 5.5; // Fixed line height
        });
        y += 4; // Paragraph spacing
      });

      y += 8;
      doc.text("We wish you success in your future professional endeavors.", margin, y);
      y += 15;

      // 7. Closing
      doc.setFont("helvetica", "bold");
      doc.text("Sincerely,", margin, y);
      y += 8;
      doc.text("HR Department", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text("Zodeck HRMS", margin, y);

      doc.save(`F&F_Letter_${employeeName.replace(/\s+/g, "_")}.pdf`);
      toast.success("Settlement letter generated successfully");
    } catch (error) {
      console.error("Error generating settlement letter:", error);
      toast.error("Failed to generate settlement letter");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Section: Employee Selection & Action */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 w-full relative">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-500" />
              Employee Selection
            </h3>

            {!selectedEmployee ? (
              <div className="relative max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Name or ID..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-600 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  />
                </div>

                {showEmployeeList && employees.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-xl bg-white dark:bg-gray-800 max-h-80 overflow-y-auto custom-scrollbar">
                    {employees.map((emp) => {
                      const employeeName =
                        emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
                      return (
                        <button
                          key={emp.id}
                          onClick={() => handleEmployeeSelect(emp)}
                          className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-b-0 flex items-center gap-3 ${selectedEmployee?.id === emp.id
                            ? "bg-primary-50 dark:bg-primary-500/10"
                            : ""
                            }`}
                        >
                          {emp.profileImage ? (
                            <img
                              src={emp.profileImage}
                              alt={employeeName}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-primary-400 to-primary-600 ${emp.profileImage ? "hidden" : ""
                              }`}
                            style={{ display: emp.profileImage ? "none" : "flex" }}
                          >
                            {employeeName?.charAt(0)?.toUpperCase() || "E"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {employeeName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {emp.employeeId} • {emp.department?.name || emp.department || "-"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 rounded-xl relative group max-w-xl">
                <button
                  onClick={() => {
                    setSelectedEmployee(null);
                    onSearch("");
                    onResetCalculation();
                    setShowEmployeeList(true);
                  }}
                  className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove Selection"
                >
                  <span className="sr-only">Remove</span>
                  ×
                </button>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-primary-500 shadow-md ring-4 ring-white dark:ring-gray-800`}
                >
                  {(
                    selectedEmployee.name ||
                    `${selectedEmployee.firstName || ""} ${selectedEmployee.lastName || ""
                      }`.trim()
                  )
                    ?.charAt(0)
                    ?.toUpperCase() || "E"}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                    {selectedEmployee.name ||
                      `${selectedEmployee.firstName || ""} ${selectedEmployee.lastName || ""
                        }`.trim()}
                  </h4>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1">
                    <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-400">
                      {selectedEmployee.employeeId}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedEmployee.department?.name ||
                        selectedEmployee.department ||
                        "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end justify-end self-end pt-4 md:pt-0">
            <button
              onClick={onCalculate}
              disabled={!selectedEmployee || calculating}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {calculating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Calculator className="w-5 h-5" />
              )}
              {calculating ? "Calculating..." : "Calculate Settlement"}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Results */}
      {showCalculation && calculationData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-white/20 dark:border-white/10 p-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-brand-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4">
            <h4 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-brand-100 dark:bg-brand-900/20 rounded-lg text-brand-600">
                <Receipt className="w-6 h-6" />
              </div>
              Settlement Breakdown
            </h4>
            <div className="bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-brand-100 dark:border-brand-800">
              Draft Calculation
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            {/* Earnings Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h5 className="text-lg font-bold text-foreground">Earnings</h5>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "Pending Salary",
                    value: calculationData.earnings.pendingSalary,
                  },
                  {
                    label: "Leave Encashment",
                    value: calculationData.earnings.leaveEncashment,
                  },
                  { label: "Gratuity", value: calculationData.earnings.gratuity },
                  { label: "Bonus / Incentives", value: calculationData.earnings.bonus },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                    <span className="font-semibold text-foreground text-lg">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-5 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30 mt-4">
                <span className="font-bold text-green-800 dark:text-green-300">
                  Total Earnings
                </span>
                <span className="font-bold text-green-700 dark:text-green-400 text-xl">
                  {formatCurrency(calculationData.earnings.totalEarnings)}
                </span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h5 className="text-lg font-bold text-foreground">Deductions</h5>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "Notice Pay Recovery",
                    value: calculationData.deductions.noticePayRecovery,
                  },
                  {
                    label: "Advance Recovery",
                    value: calculationData.deductions.advanceRecovery,
                  },
                  { label: "Loan Deduction", value: calculationData.deductions.loanDeduction },
                  {
                    label: "Other Deductions",
                    value: calculationData.deductions.otherDeductions,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                    <span className="font-semibold text-red-500 text-lg">
                      -{formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-5 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 mt-4">
                <span className="font-bold text-red-800 dark:text-red-300">
                  Total Deductions
                </span>
                <span className="font-bold text-red-700 dark:text-red-400 text-xl">
                  -{formatCurrency(calculationData.deductions.totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700/50 relative z-10">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Net Settlement Amount
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    {formatCurrency(calculationData.netSettlement)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                {settlementForPdf ? (
                  <SettlementPdfDownloadButton
                    settlement={settlementForPdf}
                    formatCurrency={formatCurrency}
                    label="Download Statement"
                    className="flex-1 sm:flex-none px-6 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold text-sm shadow-sm flex items-center justify-center gap-2 min-w-[160px]"
                  />
                ) : (
                  <button
                    disabled
                    className="flex-1 sm:flex-none px-6 py-4 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 min-w-[160px] cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Download Statement
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleGenerateLetter}
                  className="flex-1 sm:flex-none px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-lg flex items-center justify-center gap-2 min-w-[180px]"
                >
                  Generate Letter
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary-50/50 dark:ring-primary-900/10">
            <Calculator className="w-10 h-10 text-primary-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Detailed Breakdown
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md text-center leading-relaxed">
            Select an employee and calculate settlement to view the detailed breakdown of earnings and deductions here.
          </p>
        </div>
      )}
    </div>
  );
}
