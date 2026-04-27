// src/app/(dashboard)/hr/payroll/process/page.js
"use client";
import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import PayrollProcessForm from './components/PayrollProcessForm';
import EmployeeSelectionTable from './components/EmployeeSelectionTable';
import PayrollSummary from './components/PayrollSummary';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function ProcessPayroll() {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [payrollData, setPayrollData] = useState({
    period: '',
    startDate: '',
    endDate: '',
    paymentDate: '',
    notes: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default dates
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const paymentDate = new Date(today.getFullYear(), today.getMonth() + 1, 5);

    setPayrollData(prev => ({
      ...prev,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
      paymentDate: paymentDate.toISOString().split('T')[0],
      period: `${payrollService.getMonthName(today.getMonth() + 1)} ${today.getFullYear()}`
    }));
  }, []);

  const handleEmployeeSelection = (employees) => {
    setSelectedEmployees(employees);
  };

  const handlePayrollDataChange = (data) => {
    setPayrollData(data);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProcessPayroll = async () => {
    try {
      setLoading(true);
      
      const payrollRunData = {
        ...payrollData,
        employeeIds: selectedEmployees.map(emp => emp.id),
        processedBy: 1 // Get from auth context
      };

      const result = await payrollService.createPayrollRun(payrollRunData);
      
      // Process the payroll run
      await payrollService.processPayrollRun(result.data.id);
      
      alert('Payroll processed successfully!');
      
      // Reset form or navigate to payroll runs page
      setCurrentStep(1);
      setSelectedEmployees([]);
      setPayrollData({
        period: '',
        startDate: '',
        endDate: '',
        paymentDate: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert(`Failed to process payroll: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      {/* Breadcrumb */}
      <Breadcrumb
        pageTitle="Process Payroll"
        rightContent={null}
      />

      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex justify-center min-w-[300px] p-2">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 ${currentStep >= 1 ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              1
            </div>
            <div className={`ml-2 text-sm font-medium whitespace-nowrap ${currentStep >= 1 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
              Select Period
            </div>
          </div>

          <div className={`flex-auto border-t-2 mx-2 sm:mx-4 w-8 sm:w-16 self-center ${currentStep >= 2 ? 'border-brand-500' : 'border-gray-200 dark:border-gray-700'}`}></div>

          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 ${currentStep >= 2 ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              2
            </div>
            <div className={`ml-2 text-sm font-medium whitespace-nowrap ${currentStep >= 2 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
              Select Employees
            </div>
          </div>

          <div className={`flex-auto border-t-2 mx-2 sm:mx-4 w-8 sm:w-16 self-center ${currentStep >= 3 ? 'border-brand-500' : 'border-gray-200 dark:border-gray-700'}`}></div>

          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 ${currentStep >= 3 ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              3
            </div>
            <div className={`ml-2 text-sm font-medium whitespace-nowrap ${currentStep >= 3 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
              Review & Process
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-4 sm:p-6">
        {currentStep === 1 && (
          <PayrollProcessForm
            payrollData={payrollData}
            onChange={handlePayrollDataChange}
            onNext={nextStep}
          />
        )}

        {currentStep === 2 && (
          <EmployeeSelectionTable
            selectedEmployees={selectedEmployees}
            onChange={handleEmployeeSelection}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 3 && (
          <PayrollSummary
            payrollData={payrollData}
            selectedEmployees={selectedEmployees}
            onProcess={handleProcessPayroll}
            onBack={prevStep}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}