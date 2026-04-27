import React from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";

const createCurrencyImage = (text, fontSizePx = 12) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { dataUrl: null, widthMm: 0, heightMm: 0 };
  }

  ctx.font = `normal ${fontSizePx}px Arial, sans-serif`;
  const metrics = ctx.measureText(text);
  const padding = 2;
  canvas.width = Math.ceil(metrics.width) + padding * 2;
  canvas.height = Math.ceil(fontSizePx * 1.4);

  ctx.font = `normal ${fontSizePx}px Arial, sans-serif`;
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "top";
  ctx.fillText(text, padding, 0);

  const dataUrl = canvas.toDataURL("image/png");
  const widthMm = (canvas.width / 96) * 25.4;
  const heightMm = (canvas.height / 96) * 25.4;
  return { dataUrl, widthMm, heightMm };
};

const addCurrencyText = (doc, text, xRight, y, fontSizePx = 12) => {
  const { dataUrl, widthMm, heightMm } = createCurrencyImage(text, fontSizePx);
  if (!dataUrl) {
    doc.text(text, xRight, y, { align: "right" });
    return;
  }
  const yTop = y - heightMm + 2;
  doc.addImage(dataUrl, "PNG", xRight - widthMm, yTop, widthMm, heightMm);
};

const buildPdf = ({ settlement, formatCurrency }) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = 15;

  // Header Lines
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FULL & FINAL SETTLEMENT", pageWidth / 2, y, { align: "center" });
  y += 8;

  // Subtitle (Month/Year)
  const exitDate = new Date(settlement.lastWorkingDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateStr = `${monthNames[exitDate.getMonth()]} ${exitDate.getFullYear()}`;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, pageWidth / 2, y, { align: "center" });
  y += 7;

  // Header Bottom Line
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Contact Info
  doc.setFontSize(10);
  doc.text(`Phone: ${settlement.employeeDetails?.phone || "-"} | Email: ${settlement.employeeDetails?.email || "-"}`, margin, y);
  y += 8;

  // Helper for Box drawing
  const drawBoxHeader = (text, currentY) => {
    doc.setFillColor(242, 244, 247);
    doc.rect(margin, currentY, contentWidth, 8, "F");
    doc.setDrawColor(200);
    doc.rect(margin, currentY, contentWidth, 8, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(text, pageWidth / 2, currentY + 5.5, { align: "center" });
    return currentY + 8;
  };

  // 1. Employee Details Section
  y = drawBoxHeader("Employee Details", y);
  doc.setDrawColor(200);
  doc.rect(margin, y, contentWidth, 18, "S");
  doc.line(margin + (contentWidth / 3), y, margin + (contentWidth / 3), y + 18);
  doc.line(margin + (2 * contentWidth / 3), y, margin + (2 * contentWidth / 3), y + 18);
  doc.line(margin, y + 6, pageWidth - margin, y + 6);
  doc.line(margin, y + 12, pageWidth - margin, y + 12);

  doc.setFontSize(9);
  const employeeData = [
    ["Employee ID", settlement.employee.employeeId, "Department", settlement.employee.department],
    ["Employee Name", settlement.employee.name, "Designation", settlement.employeeDetails?.designation || "-"],
    ["Month", dateStr, "Joined On", new Date(settlement.employeeDetails?.joiningDate).toLocaleDateString()],
  ];

  employeeData.forEach((row, i) => {
    const rowY = y + (i * 6) + 4.5;
    doc.setFont("helvetica", "bold");
    doc.text(row[0], margin + 2, rowY);
    doc.text(row[2], margin + (contentWidth / 3) + 2, rowY);

    doc.setFont("helvetica", "normal");
    doc.text(row[1], margin + (contentWidth / 3) - 2, rowY, { align: "right" });
    doc.text(row[3], margin + (contentWidth) - 2, rowY, { align: "right" });
  });
  y += 24;

  // 2. Attendance/Exit Details Section
  y = drawBoxHeader("Exit Details", y);
  doc.setDrawColor(200);
  doc.rect(margin, y, contentWidth, 12, "S");
  doc.line(margin + (contentWidth / 2), y, margin + (contentWidth / 2), y + 12);
  doc.line(margin, y + 6, pageWidth - margin, y + 6);

  const exitRows = [
    ["Last Working Date", new Date(settlement.lastWorkingDate).toLocaleDateString(), "Service Tenure", `${settlement.inputs?.tenureYears || 0} Years`],
    ["Status", "SETTLED", "Notice Days", `${settlement.inputs?.requiredNoticeDays || 30} Days`],
  ];

  exitRows.forEach((row, i) => {
    const rowY = y + (i * 6) + 4.5;
    doc.setFont("helvetica", "bold");
    doc.text(row[0], margin + 2, rowY);
    doc.text(row[2], margin + (contentWidth / 2) + 2, rowY);

    doc.setFont("helvetica", "normal");
    doc.text(row[1], margin + (contentWidth / 2) - 2, rowY, { align: "right" });
    doc.text(row[3], margin + (contentWidth) - 2, rowY, { align: "right" });
  });
  y += 18;

  // 3. Salary Breakdown Section
  // Custom Header for Breakdown
  doc.setFillColor(242, 244, 247);
  doc.rect(margin, y, contentWidth * 0.7, 8, "F");
  doc.rect(margin + (contentWidth * 0.7), y, contentWidth * 0.3, 8, "F");
  doc.setDrawColor(200);
  doc.rect(margin, y, contentWidth * 0.7, 8, "S");
  doc.rect(margin + (contentWidth * 0.7), y, contentWidth * 0.3, 8, "S");
  doc.setFont("helvetica", "bold");
  doc.text("Salary Breakdown", margin + (contentWidth * 0.35), y + 5.5, { align: "center" });
  doc.text("Amount (INR)", margin + (contentWidth * 0.85), y + 5.5, { align: "center" });
  y += 8;

  const breakdownRows = [
    ["Pending Salary", settlement.earnings.pendingSalary],
    ["Leave Encashment", settlement.earnings.leaveEncashment],
    ["Gratuity", settlement.earnings.gratuity],
    ["Bonus / Incentives", settlement.earnings.bonus],
    ["Notice Pay Recovery", -settlement.deductions.noticePayRecovery],
    ["Other Recovery", -settlement.deductions.otherDeductions],
  ].filter(row => row[1] !== 0);

  breakdownRows.forEach((row, i) => {
    doc.rect(margin, y, contentWidth * 0.7, 7, "S");
    doc.rect(margin + (contentWidth * 0.7), y, contentWidth * 0.3, 7, "S");
    doc.setFont("helvetica", "normal");
    doc.text(row[0], margin + 2, y + 5);
    const valText = row[1] < 0 ? `- ${formatCurrency(Math.abs(row[1]))}` : formatCurrency(row[1]);
    addCurrencyText(doc, valText, margin + contentWidth - 2, y + 5, 11);
    y += 7;
  });

  // Net Row
  doc.rect(margin, y, contentWidth * 0.7, 8, "S");
  doc.rect(margin + (contentWidth * 0.7), y, contentWidth * 0.3, 8, "S");
  doc.setFont("helvetica", "bold");
  doc.text("NET SETTLEMENT", margin + 2, y + 6);
  addCurrencyText(doc, formatCurrency(settlement.totalSettlement), margin + contentWidth - 2, y + 6, 11);
  y += 14;

  // 4. Payment Details Section
  y = drawBoxHeader("Payment Details", y);
  doc.setDrawColor(200);
  doc.rect(margin, y, contentWidth, 18, "S");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Payment Mode:`, margin + 4, y + 5);
  doc.text(`Bank Name:`, margin + 4, y + 10);
  doc.text(`Account Number:`, margin + 4, y + 15);
  doc.text(`PAN Number:`, margin + 60, y + 15);

  doc.setFont("helvetica", "normal");
  doc.text("Bank Transfer", margin + 35, y + 5);
  doc.text(settlement.employeeDetails?.bankName || "-", margin + 35, y + 10);
  doc.text(settlement.employeeDetails?.accountNumber || "-", margin + 35, y + 15);
  doc.text(settlement.employeeDetails?.panNumber || "-", margin + 90, y + 15);
  y += 28;

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("This is a computer generated settlement statement and does not require signature", pageWidth / 2, y, { align: "center" });
  y += 4;
  const now = new Date();
  doc.text(`Generated on: ${now.toLocaleDateString()}, ${now.toLocaleTimeString()}`, pageWidth / 2, y, { align: "center" });

  return doc;
};

export default function SettlementPdfDownloadButton({
  settlement,
  formatCurrency,
  className,
  label = "Download PDF",
}) {
  const handleDownload = () => {
    try {
      const doc = buildPdf({ settlement, formatCurrency });
      doc.save(`Settlement_${settlement.employee.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generating settlement PDF:", error);
      toast.error("Failed to generate settlement PDF");
    }
  };

  return (
    <button type="button" onClick={handleDownload} className={className}>
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}
