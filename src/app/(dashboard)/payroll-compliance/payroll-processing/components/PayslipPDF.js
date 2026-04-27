"use client";

import React from 'react';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

const PayslipPDF = ({ employee, payrollData, onClose }) => {
  // Helper function to format Indian currency with proper Rupee symbol
  const formatIndianCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    // Replace the Unicode rupee symbol with a more compatible one
    return formatted.replace('₹', 'Rs.');
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      };

      doc.setFont('helvetica');
      let y = 15;

      // Title Section
      doc.setLineWidth(0.5);
      doc.line(15, y, 195, y);
      y += 5;
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('PAYROLL SLIP', 105, y, { align: 'center' });
      y += 7;
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(payrollData.period || '', 105, y, { align: 'center' });
      y += 5;
      doc.line(15, y, 195, y);
      y += 10;

      // Header info would ideally come from a context, but here we use a simplified version
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('ZODECK TECHNOLOGIES', 15, y);
      y += 15;

      // Employee Details
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y, 180, 8, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, y, 180, 8);
      doc.setFont(undefined, 'bold');
      doc.text('Employee Details', 105, y + 5.5, { align: 'center' });
      y += 8;

      const drawRow = (l1, v1, l2, v2) => {
        const rowH = 8;
        doc.setFont(undefined, 'bold');
        doc.rect(15, y, 45, rowH);
        doc.text(l1, 17, y + 5.5);
        doc.setFont(undefined, 'normal');
        doc.rect(60, y, 45, rowH);
        doc.text(String(v1 || '-'), 62, y + 5.5);
        doc.setFont(undefined, 'bold');
        doc.rect(105, y, 45, rowH);
        doc.text(l2, 107, y + 5.5);
        doc.setFont(undefined, 'normal');
        doc.rect(150, y, 45, rowH);
        doc.text(String(v2 || '-'), 152, y + 5.5);
        y += rowH;
      };

      drawRow('Employee ID', employee.empId, 'Payroll ID', `RUN-${payrollData.id || ''}`);
      drawRow('Employee Name', employee.name, 'Designation', employee.employee?.designation?.name || 'Staff');
      drawRow('Month', payrollData.period, 'Payment Date', payrollData.paymentDate || 'Not Paid');
      y += 5;

      // Salary Breakdown
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y, 180, 8, 'F');
      doc.rect(15, y, 180, 8);
      doc.setFont(undefined, 'bold');
      doc.text('Salary Breakdown', 105, y + 5.5, { align: 'center' });
      y += 8;
      
      const drawBreakdownRow = (label, value, isBold = false) => {
        const rowH = 8;
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        doc.rect(15, y, 140, rowH);
        doc.text(label, 17, y + 5.5);
        doc.rect(155, y, 40, rowH);
        doc.text(formatCurrency(value), 193, y + 5.5, { align: 'right' });
        y += rowH;
      };

      drawBreakdownRow('Basic Salary', employee.basicSalary, true);
      if (employee.earnings) {
        Object.entries(employee.earnings).forEach(([key, value]) => {
          if (key === '_attendanceStats') return;
          if (value > 0) {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            drawBreakdownRow(label, value);
          }
        });
      }
      if (employee.deductionsObj) {
        Object.entries(employee.deductionsObj).forEach(([key, value]) => {
          if (value > 0) {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            drawBreakdownRow(label, -value);
          }
        });
      }

      doc.setFillColor(248, 249, 250);
      doc.rect(15, y, 180, 10, 'F');
      doc.rect(15, y, 140, 10);
      doc.rect(155, y, 40, 10);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('NET SALARY', 17, y + 6.5);
      doc.text(`Rs. ${formatCurrency(employee.net)}`, 193, y + 6.5, { align: 'right' });
      y += 15;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This is a computer-generated payslip and does not require signature.', 105, y, { align: 'center' });
      
      const fileName = `Payslip_${employee.name.replace(/\s+/g, '_')}_${payrollData.period.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      toast.success(`PDF downloaded for ${employee.name}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download PDF');
    }
  };

  const handleViewPayslip = () => {
    // Create a detailed payslip view
    const payslipWindow = window.open('', '_blank', 'width=800,height=600');
    payslipWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${employee.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .employee-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .pay-details { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .total { font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PAYSLIP</h1>
          <h2>${payrollData.period}</h2>
        </div>
        
        <div class="employee-info">
          <div>
            <h3>Employee Details</h3>
            <p><strong>Name:</strong> ${employee.name}</p>
            <p><strong>Employee ID:</strong> ${employee.empId}</p>
            <p><strong>Payment Date:</strong> ${payrollData.paymentDate}</p>
          </div>
          <div>
            <h3>Payment Summary</h3>
            <p><strong>Gross Pay:</strong> Rs.${employee.gross?.toLocaleString('en-IN')}</p>
            <p><strong>Total Deductions:</strong> Rs.${employee.deductions?.toLocaleString('en-IN')}</p>
            <p><strong>Net Pay:</strong> Rs.${employee.net?.toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        <div class="pay-details">
          <h3>Earnings</h3>
          <table class="table">
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Basic Salary</td>
              <td>Rs.${(employee.basicSalary || 0).toLocaleString('en-IN')}</td>
            </tr>
            ${employee.earnings ? Object.entries(employee.earnings).map(([key, value]) => {
      if (key === '_attendanceStats') return '';
      if (value > 0) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `<tr><td>${label}</td><td>Rs.${value.toLocaleString('en-IN')}</td></tr>`;
      }
      return '';
    }).join('') : ''}
            <tr class="total">
              <td><strong>Gross Pay</strong></td>
              <td><strong>Rs.${employee.gross?.toLocaleString('en-IN')}</strong></td>
            </tr>
          </table>
          
          <h3>Deductions</h3>
          <table class="table">
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            ${employee.deductionsObj ? Object.entries(employee.deductionsObj).map(([key, value]) => {
      if (value > 0) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `<tr><td>${label}</td><td>Rs.${value.toLocaleString('en-IN')}</td></tr>`;
      }
      return '';
    }).join('') : ''}
            <tr class="total">
              <td><strong>Total Deductions</strong></td>
              <td><strong>Rs.${employee.deductions?.toLocaleString('en-IN')}</strong></td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated payslip and does not require signature.</p>
          <p>For any queries, please contact HR Department.</p>
        </div>
      </body>
      </html>
    `);
    payslipWindow.document.close();
    payslipWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Payslip Options - {employee.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Employee Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Employee Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600 dark:text-gray-400">Name:</span> {employee.name}</p>
                <p><span className="text-gray-600 dark:text-gray-400">ID:</span> {employee.empId}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Period:</span> {payrollData.period}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600 dark:text-gray-400">Gross:</span> Rs.{employee.gross?.toLocaleString('en-IN')}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Deductions:</span> Rs.{employee.deductions?.toLocaleString('en-IN')}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Net:</span> <span className="font-bold text-green-600 dark:text-green-400">Rs.{employee.net?.toLocaleString('en-IN')}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleViewPayslip}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-1.5 1.5 1.5 1.5 0 1 1 1.5 0 1-1.5 1.5-1.5 1.5-1.5-1.5z" />
                <path d="M2.458 4C1.732 4 1 4.732 1 6v14c0 .268.732.586 1.036l3.5-2.5c.432.432.732 1.036.732 1.036z" />
              </svg>
              View Payslip
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3 3m3-3l3 3m2-2H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z" />
              </svg>
              Download PDF
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipPDF;
