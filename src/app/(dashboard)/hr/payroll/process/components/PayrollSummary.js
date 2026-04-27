// src/app/(dashboard)/hr/payroll/process/components/PayrollSummary.js
"use client";
import { IndianRupee, Calendar, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function PayrollSummary({ payrollData, selectedEmployees, onProcess, onBack, loading }) {
  const totalAmount = selectedEmployees.reduce((sum, emp) => sum + (emp.totalCTC || 0), 0);

  return (
    <div className="text-left">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Review Payroll</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg mr-4">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Payroll Period</p>
              <p className="font-semibold text-blue-800 dark:text-blue-300">
                {payrollData.period || 'Not selected'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg mr-4">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Employees</p>
              <p className="font-semibold text-green-800 dark:text-green-300">
                {selectedEmployees.length} employees
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg mr-4">
              <IndianRupee className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Total Amount</p>
              <p className="font-semibold text-purple-800 dark:text-purple-300">
                {payrollService.formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Employees in this Payroll</h3>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
            {selectedEmployees.map(structure => (
              <div key={structure.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center text-left">
                  <div className="text-left">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {structure.employee?.firstName} {structure.employee?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{structure.employee?.designation?.name || 'No Designation'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400 font-mono">
                      {payrollService.formatCurrency(structure.totalCTC)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{structure.employee?.department?.name || 'No Department'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      {payrollData.notes && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Notes</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-gray-700 dark:text-yellow-200">{payrollData.notes}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 gap-3 sm:gap-0">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-5 py-2.5 text-gray-800 hover:bg-gray-300 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 w-full sm:w-auto font-medium"
          disabled={loading}
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onProcess}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-white hover:bg-green-700 transition w-full sm:w-auto font-medium disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <CheckCircle size={18} />
          )}
          {loading ? 'Processing...' : 'Process Payroll'}
        </button>
      </div>
    </div>
  );
}
