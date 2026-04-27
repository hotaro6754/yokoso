"use client";

import jsPDF from 'jspdf';

export const generateReportPDF = (report) => {
  try {
    // Generate PDF based on report type
    const pdf = new jsPDF();
    const reportData = report.data || {};
    const safeText = (value, fallback = "-") => {
      if (value === null || value === undefined) return fallback;
      return String(value);
    };
    
    // Add header
    pdf.setFontSize(20);
    pdf.text(safeText(report.name, "Payroll Report"), 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Report Type: ${safeText(report.type)}`, 20, 50);
    pdf.text(`Period: ${safeText(report.period)}`, 20, 60);
    pdf.text(
      `Generated: ${report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-"}`,
      20,
      70
    );
    pdf.text(`Format: ${safeText(report.format)}`, 20, 80);
    pdf.text(`File Size: ${safeText(report.fileSize)}`, 20, 90);
    
    // Add sample content based on report type
    pdf.setFontSize(14);
    pdf.text('Report Content:', 20, 110);
    
    pdf.setFontSize(10);
    let yPosition = 125;
    
    if (report.type === 'payroll-summary' && reportData.summary) {
      pdf.text(`• Total Employees: ${reportData.summary.totalEmployees ?? '-'}`, 30, yPosition);
      pdf.text(`• Total Payroll: ₹${Number(reportData.summary.totalPayroll || 0).toLocaleString()}`, 30, yPosition + 10);
      pdf.text(`• Average Salary: ₹${Number(reportData.summary.averageSalary || 0).toLocaleString()}`, 30, yPosition + 20);
      pdf.text(`• Active Departments: ${Object.keys(reportData.departmentSummary || {}).length}`, 30, yPosition + 30);
    } else if (report.type === 'tax-report' && reportData.totalTax !== undefined) {
      pdf.text(`• Total Tax Deducted: ₹${Number(reportData.totalTax || 0).toLocaleString()}`, 30, yPosition);
      pdf.text(`• Total Employees: ${reportData.totalEmployees ?? '-'}`, 30, yPosition + 10);
      pdf.text(`• Total Income: ₹${Number(reportData.totalIncome || 0).toLocaleString()}`, 30, yPosition + 20);
    } else if (report.type === 'department-wise' && Array.isArray(reportData.departmentData)) {
      reportData.departmentData.slice(0, 5).forEach((dept, index) => {
        pdf.text(
          `${dept.departmentName || 'Department'}: ₹${Number(dept.totalSalary || 0).toLocaleString()} (${dept.employeeCount || 0} employees)`,
          30,
          yPosition + index * 10
        );
      });
    } else if (report.type === 'employee-wise' && reportData.employee) {
      pdf.text(`• Employee: ${reportData.employee.employeeName || '-'}`, 30, yPosition);
      pdf.text(`• Department: ${reportData.employee.department || '-'}`, 30, yPosition + 10);
      pdf.text(`• Designation: ${reportData.employee.designation || '-'}`, 30, yPosition + 20);
      pdf.text(`• Total Payroll: ₹${Number(reportData.totalPayroll || 0).toLocaleString()}`, 30, yPosition + 30);
    } else {
      pdf.text('Report data not available', 30, yPosition);
    }
    
    // Save the PDF
    const fileBase = safeText(report.name, "report").replace(/\s+/g, "_");
    pdf.save(`${fileBase}.pdf`);
    return { success: true, message: `${safeText(report.name, "Report")} downloaded successfully` };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, message: "Failed to generate PDF" };
  }
};
