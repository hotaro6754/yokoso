"use client";

export const generateReportCSV = (report) => {
  try {
    const reportData = report.data || {};
    const safeText = (value, fallback = "-") => {
      if (value === null || value === undefined) return fallback;
      return String(value);
    };

    // Prepare CSV data based on report type
    let csvContent = "";
    let fileName = "report.csv";

    if (report.type === 'payroll-summary') {
      fileName = "payroll_summary.csv";
      csvContent = "Payroll Summary Report\n\n";
      csvContent += "Report Information\n";
      csvContent += "Report Name," + safeText(report.name) + "\n";
      csvContent += "Report Type," + safeText(report.type) + "\n";
      csvContent += "Period," + safeText(report.period) + "\n";
      csvContent += "Generated Date," + (report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-") + "\n\n";
      
      csvContent += "Summary\n";
      csvContent += "Total Employees," + (reportData.summary?.totalEmployees ?? "-") + "\n";
      csvContent += "Total Payroll," + "₹" + Number(reportData.summary?.totalPayroll || 0).toLocaleString() + "\n";
      csvContent += "Average Salary," + "₹" + Number(reportData.summary?.averageSalary || 0).toLocaleString() + "\n";
      csvContent += "Active Departments," + Object.keys(reportData.departmentSummary || {}).length + "\n";

      // Add department breakdown if available
      if (reportData.departmentSummary && Object.keys(reportData.departmentSummary).length > 0) {
        csvContent += "\nDepartment Breakdown\n";
        csvContent += "Department,Total Payroll,Employee Count\n";
        Object.entries(reportData.departmentSummary).forEach(([dept, data]) => {
          csvContent += '"' + dept + '",' + "₹" + Number(data.totalSalary || 0).toLocaleString() + ',' + (data.employeeCount || 0) + '\n';
        });
      }
    } else if (report.type === 'tax-report') {
      fileName = "tax_report.csv";
      csvContent = "Tax Compliance Report\n\n";
      csvContent += "Report Information\n";
      csvContent += "Report Name," + safeText(report.name) + "\n";
      csvContent += "Report Type," + safeText(report.type) + "\n";
      csvContent += "Period," + safeText(report.period) + "\n";
      csvContent += "Generated Date," + (report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-") + "\n\n";
      
      csvContent += "Tax Summary\n";
      csvContent += "Total Tax Deducted," + "₹" + Number(reportData.totalTax || 0).toLocaleString() + "\n";
      csvContent += "Total Employees," + (reportData.totalEmployees ?? "-") + "\n";
      csvContent += "Total Income," + "₹" + Number(reportData.totalIncome || 0).toLocaleString() + "\n";
      csvContent += "Average Tax," + "₹" + Number(reportData.averageTax || 0).toLocaleString() + "\n";
    } else if (report.type === 'department-wise') {
      fileName = "department_wise.csv";
      csvContent = "Department Wise Payroll Report\n\n";
      csvContent += "Report Information\n";
      csvContent += "Report Name," + safeText(report.name) + "\n";
      csvContent += "Report Type," + safeText(report.type) + "\n";
      csvContent += "Period," + safeText(report.period) + "\n";
      csvContent += "Generated Date," + (report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-") + "\n\n";
      
      csvContent += "Department Details\n";
      csvContent += "Department,Total Salary,Employee Count,Average Salary\n";

      if (Array.isArray(reportData.departmentData)) {
        reportData.departmentData.forEach((dept) => {
          const avgSalary = dept.employeeCount > 0 ? dept.totalSalary / dept.employeeCount : 0;
          csvContent += '"' + (dept.departmentName || 'Department') + '",' + 
                       "₹" + Number(dept.totalSalary || 0).toLocaleString() + ',' + 
                       (dept.employeeCount || 0) + ',' + 
                       "₹" + Number(avgSalary || 0).toLocaleString() + '\n';
        });
      }
    } else if (report.type === 'employee-wise') {
      fileName = "employee_wise.csv";
      csvContent = "Employee Wise Payroll Report\n\n";
      csvContent += "Report Information\n";
      csvContent += "Report Name," + safeText(report.name) + "\n";
      csvContent += "Report Type," + safeText(report.type) + "\n";
      csvContent += "Period," + safeText(report.period) + "\n";
      csvContent += "Generated Date," + (report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-") + "\n\n";
      
      csvContent += "Employee Details\n";
      csvContent += "Employee Name," + safeText(reportData.employee?.employeeName) + "\n";
      csvContent += "Department," + safeText(reportData.employee?.department) + "\n";
      csvContent += "Designation," + safeText(reportData.employee?.designation) + "\n";
      csvContent += "Total Payroll," + "₹" + Number(reportData.totalPayroll || 0).toLocaleString() + "\n";
    } else if (report.type === 'reimbursement') {
      fileName = "reimbursement_report.csv";
      csvContent = "Reimbursement Report\n\n";
      csvContent += "Report Information\n";
      csvContent += "Report Name," + safeText(report.name) + "\n";
      csvContent += "Report Type," + safeText(report.type) + "\n";
      csvContent += "Period," + safeText(report.period) + "\n";
      csvContent += "Generated Date," + (report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-") + "\n\n";
      
      csvContent += "Reimbursement Summary\n";
      csvContent += "Total Reimbursement," + "₹" + Number(reportData.totalReimbursement || 0).toLocaleString() + "\n";
      csvContent += "Total Claims," + (reportData.totalClaims ?? "-") + "\n";
      csvContent += "Approved Claims," + (reportData.approvedClaims ?? "-") + "\n";
      csvContent += "Pending Claims," + (reportData.pendingClaims ?? "-") + "\n";

      // Add claim details if available
      if (Array.isArray(reportData.claims)) {
        csvContent += "\nClaim Details\n";
        csvContent += "Employee,Amount,Status,Date,Type\n";
        reportData.claims.forEach((claim) => {
          csvContent += '"' + (claim.employeeName || 'Employee') + '",' + 
                       "₹" + Number(claim.amount || 0).toLocaleString() + ',' + 
                       '"' + (claim.status || 'Unknown') + '",' + 
                       (claim.date ? new Date(claim.date).toLocaleDateString() : '-') + ',' + 
                       '"' + (claim.type || 'General') + '"\n';
        });
      }
    } else {
      // Default report structure
      fileName = "report.csv";
      csvContent = "Report\n\n";
      csvContent += "Report Information\n";
      csvContent += "Report Name," + safeText(report.name) + "\n";
      csvContent += "Report Type," + safeText(report.type) + "\n";
      csvContent += "Period," + safeText(report.period) + "\n";
      csvContent += "Generated Date," + (report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "-") + "\n\n";
      csvContent += "Report data not available for this type\n";
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename
    const fileBase = safeText(report.name, "report").replace(/\s+/g, "_");
    link.setAttribute('href', url);
    link.setAttribute('download', fileBase + '.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: safeText(report.name, "Report") + " exported to CSV successfully" };
  } catch (error) {
    console.error("Error generating CSV:", error);
    return { success: false, message: "Failed to generate CSV file" };
  }
};
