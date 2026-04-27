"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Layers, Wallet, ShieldCheck } from "lucide-react";
import { employeeSalaryStructureService } from "@/services/employee/salaryStructure.service";
import { authService } from "@/services/auth-services/authService";
import { toast } from "react-hot-toast";

export default function SalarySummaryPage() {
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData?.data?.employee?.id) {
          setEmployeeId(userData.data.employee.id);
          await fetchSalaryStructure(userData.data.employee.id);
        } else {
          toast.error("Employee profile not found");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        toast.error("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const fetchSalaryStructure = async (empId) => {
    try {
      const data = await employeeSalaryStructureService.getCurrentSalaryStructure();
      setSalaryStructure(data.data);
    } catch (error) {
      console.error("Error fetching salary structure:", error);
      toast.error("Failed to load salary structure");
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  // Process salary components
  const getSalaryComponents = () => {
    if (!salaryStructure) return [];

    const components = [];
    
    // Earnings
    if (salaryStructure.basicSalary > 0) {
      components.push({ label: "Basic Pay", amount: formatCurrency(salaryStructure.basicSalary), type: "earning" });
    }
    if (salaryStructure.hra > 0) {
      components.push({ label: "HRA", amount: formatCurrency(salaryStructure.hra), type: "earning" });
    }
    if (salaryStructure.specialAllowance > 0) {
      components.push({ label: "Special Allowance", amount: formatCurrency(salaryStructure.specialAllowance), type: "earning" });
    }
    if (salaryStructure.conveyance > 0) {
      components.push({ label: "Conveyance", amount: formatCurrency(salaryStructure.conveyance), type: "earning" });
    }
    if (salaryStructure.medical > 0) {
      components.push({ label: "Medical", amount: formatCurrency(salaryStructure.medical), type: "earning" });
    }

    // Other allowances
    if (salaryStructure.otherAllowances) {
      Object.entries(salaryStructure.otherAllowances).forEach(([name, amount]) => {
        if (amount > 0) {
          components.push({ label: name, amount: formatCurrency(amount), type: "earning" });
        }
      });
    }

    // Statutory contributions (Employer)
    if (salaryStructure.pf > 0) {
      components.push({ label: "PF (Employer)", amount: formatCurrency(salaryStructure.pf), type: "statutory" });
    }
    if (salaryStructure.esic > 0) {
      components.push({ label: "ESI (Employer)", amount: formatCurrency(salaryStructure.esic), type: "statutory" });
    }

    return components;
  };

  const getDeductions = () => {
    if (!salaryStructure) return [];

    const deductions = [];
    
    if (salaryStructure.pf > 0) {
      deductions.push({ label: "PF (Employee)", amount: formatCurrency(salaryStructure.pf) });
    }
    if (salaryStructure.pt > 0) {
      deductions.push({ label: "Professional Tax", amount: formatCurrency(salaryStructure.pt) });
    }
    if (salaryStructure.tds > 0) {
      deductions.push({ label: "TDS", amount: formatCurrency(salaryStructure.tds) });
    }

    // Other deductions
    if (salaryStructure.deductions) {
      Object.entries(salaryStructure.deductions).forEach(([name, amount]) => {
        if (amount > 0) {
          deductions.push({ label: name, amount: formatCurrency(amount) });
        }
      });
    }

    return deductions;
  };

  const calculateMonthlyGross = () => {
    if (!salaryStructure) return 0;
    
    let earnings = 
      (salaryStructure.basicSalary || 0) +
      (salaryStructure.hra || 0) +
      (salaryStructure.specialAllowance || 0) +
      (salaryStructure.conveyance || 0) +
      (salaryStructure.medical || 0);
    
    // Add other allowances
    if (salaryStructure.otherAllowances) {
      Object.values(salaryStructure.otherAllowances).forEach(amount => {
        earnings += (amount || 0);
      });
    }
    
    return earnings;
  };

  const calculateNetPay = () => {
    if (!salaryStructure) return 0;
    
    const gross = calculateMonthlyGross();
    let deductions = 
      (salaryStructure.pf || 0) +
      (salaryStructure.pt || 0) +
      (salaryStructure.tds || 0);
    
    // Add other deductions
    if (salaryStructure.deductions) {
      Object.values(salaryStructure.deductions).forEach(amount => {
        deductions += (amount || 0);
      });
    }
    
    return gross - deductions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const salaryComponents = getSalaryComponents();
  const deductions = getDeductions();
  const monthlyGross = calculateMonthlyGross();
  const netPay = calculateNetPay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Salary Structure</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">View-only salary breakdown for your role.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Annual CTC</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {salaryStructure?.annualCTC 
                ? formatCurrency(salaryStructure.annualCTC)
                : formatCurrency(monthlyGross * 12)
              }
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Gross</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {formatCurrency(monthlyGross)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {salaryStructure?.status || 'Active'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-gray-200">
              <Wallet size={16} />
              <h3 className="font-semibold">Earnings & Benefits</h3>
            </div>
            <div className="space-y-3">
              {salaryComponents.length > 0 ? (
                salaryComponents.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-primary-100/50 dark:border-primary-500/20 px-4 py-2"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.amount}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No earnings data available</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-gray-200">
              <Wallet size={16} />
              <h3 className="font-semibold">Deductions</h3>
            </div>
            <div className="space-y-3">
              {deductions.length > 0 ? (
                deductions.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-primary-100/50 dark:border-primary-500/20 px-4 py-2"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.amount}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No deductions data available</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Net Pay</span>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(netPay)}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              For any changes, contact HR or Payroll.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
