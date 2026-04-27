"use client";

import * as XLSX from 'xlsx';

export const generateReportExcel = (report) => {
  try {
    const reportData = report.data || {};
    const safeText = (value, fallback = "-") => {
      if (value === null || value === undefined) return fallback;
      return String(value);
    };

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data based on report type
    let worksheetData = [];
    let sheetName = "Report";

    if (report.type === 'payroll-summary') {
      sheetName = "Payroll Summary";
      worksheetData = [
        ["Payroll Summary Report"],
        [],
        ["Report Information"],
        ["Report Name", safeText(report.name)],
        ["Report Type", safeText(report.type)],
        ["Period", safeText(report.period)],
        ["Generated Date", report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-"],
        [],
        ["Summary"],
        ["Total Employees", reportData.summary?.totalEmployees ?? "-"],
        ["Total Payroll", `₹${Number(reportData.summary?.totalPayroll || 0).toLocaleString()}`],
        ["Average Salary", `₹${Number(reportData.summary?.averageSalary || 0).toLocaleString()}`],
        ["Active Departments", Object.keys(reportData.departmentSummary || {}).length],
      ];

      // Add department breakdown if available
      if (reportData.departmentSummary && Object.keys(reportData.departmentSummary).length > 0) {
        worksheetData.push([], ["Department Breakdown"]);
        worksheetData.push(["Department", "Total Payroll", "Employee Count"]);
        Object.entries(reportData.departmentSummary).forEach(([dept, data]) => {
          worksheetData.push([
            dept,
            `₹${Number(data.totalSalary || 0).toLocaleString()}`,
            data.employeeCount || 0
          ]);
        });
      }
    } else if (report.type === 'tax-report') {
      sheetName = "Tax Report";
      worksheetData = [
        ["Tax Compliance Report"],
        [],
        ["Report Information"],
        ["Report Name", safeText(report.name)],
        ["Report Type", safeText(report.type)],
        ["Period", safeText(report.period)],
        ["Generated Date", report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-"],
        [],
        ["Tax Summary"],
        ["Total Tax Deducted", `₹${Number(reportData.totalTax || 0).toLocaleString()}`],
        ["Total Employees", reportData.totalEmployees ?? "-"],
        ["Total Income", `₹${Number(reportData.totalIncome || 0).toLocaleString()}`],
        ["Average Tax", `₹${Number(reportData.averageTax || 0).toLocaleString()}`],
      ];
    } else if (report.type === 'department-wise') {
      sheetName = "Department Wise";
      worksheetData = [
        ["Department Wise Payroll Report"],
        [],
        ["Report Information"],
        ["Report Name", safeText(report.name)],
        ["Report Type", safeText(report.type)],
        ["Period", safeText(report.period)],
        ["Generated Date", report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-"],
        [],
        ["Department Details"],
        ["Department", "Total Salary", "Employee Count", "Average Salary"],
      ];

      if (Array.isArray(reportData.departmentData)) {
        reportData.departmentData.forEach((dept) => {
          const avgSalary = dept.employeeCount > 0 ? dept.totalSalary / dept.employeeCount : 0;
          worksheetData.push([
            dept.departmentName || 'Department',
            `₹${Number(dept.totalSalary || 0).toLocaleString()}`,
            dept.employeeCount || 0,
            `₹${Number(avgSalary || 0).toLocaleString()}`
          ]);
        });
      }
    } else if (report.type === 'employee-wise') {
      sheetName = "Employee Wise";
      worksheetData = [
        ["Employee Wise Payroll Report"],
        [],
        ["Report Information"],
        ["Report Name", safeText(report.name)],
        ["Report Type", safeText(report.type)],
        ["Period", safeText(report.period)],
        ["Generated Date", report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-"],
        [],
        ["Employee Details"],
        ["Employee Name", safeText(reportData.employee?.employeeName)],
        ["Department", safeText(reportData.employee?.department)],
        ["Designation", safeText(reportData.employee?.designation)],
        ["Total Payroll", `₹${Number(reportData.totalPayroll || 0).toLocaleString()}`],
      ];
    } else if (report.type === 'reimbursement') {
      sheetName = "Reimbursement";
      worksheetData = [
        ["Reimbursement Report"],
        [],
        ["Report Information"],
        ["Report Name", safeText(report.name)],
        ["Report Type", safeText(report.type)],
        ["Period", safeText(report.period)],
        ["Generated Date", report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-"],
        [],
        ["Reimbursement Summary"],
        ["Total Reimbursement", `₹${Number(reportData.totalReimbursement || 0).toLocaleString()}`],
        ["Total Claims", reportData.totalClaims ?? "-"],
        ["Approved Claims", reportData.approvedClaims ?? "-"],
        ["Pending Claims", reportData.pendingClaims ?? "-"],
      ];

      // Add claim details if available
      if (Array.isArray(reportData.claims)) {
        worksheetData.push([], ["Claim Details"]);
        worksheetData.push(["Employee", "Amount", "Status", "Date", "Type"]);
        reportData.claims.forEach((claim) => {
          worksheetData.push([
            claim.employeeName || 'Employee',
            `₹${Number(claim.amount || 0).toLocaleString()}`,
            claim.status || 'Unknown',
            claim.date ? new Date(claim.date).toLocaleDateString() : '-',
            claim.type || 'General'
          ]);
        });
      }
    } else {
      // Default report structure
      worksheetData = [
        ["Report"],
        [],
        ["Report Information"],
        ["Report Name", safeText(report.name)],
        ["Report Type", safeText(report.type)],
        ["Period", safeText(report.period)],
        ["Generated Date", report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-"],
        [],
        ["Report data not available for this type"],
      ];
    }

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const colWidths = worksheetData[0].map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename
    const fileBase = safeText(report.name, "report").replace(/\s+/g, "_");
    const fileName = `${fileBase}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);

    return { success: true, message: `${safeText(report.name, "Report")} exported to Excel successfully` };
  } catch (error) {
    console.error("Error generating Excel:", error);
    return { success: false, message: "Failed to generate Excel file" };
  }
};
