"use client";

import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "@/components/common/DatePicker";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Download,
  Calculator,
  Eye,
  Lock,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  ArrowRight,
  ArrowLeft,
  Send,
  Printer,
  Search,
  X,
  Plus,
  Settings,
  Trash2,
  Edit2,
  Minus,
  Clock,
  FileSpreadsheet
} from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Breadcrumb from "@/components/common/Breadcrumb";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import dynamic from 'next/dynamic';
import PayslipsModal from './components/PayslipsModal';
import { employeeService } from "@/services/hr-services/employeeService";
import { payrollProcessService } from "@/services/payroll-role-services/payroll-process.service";
import { payrollService } from "@/services/hr-services/payroll.service";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const workflowSteps = [
  { id: 1, label: "Select Period", icon: Calendar },
  { id: 2, label: "Select Employees", icon: Users },
  { id: 3, label: "Fetch Data", icon: Download },
  { id: 4, label: "Calculate", icon: Calculator },
  { id: 5, label: "Preview", icon: Eye },
  { id: 6, label: "Lock", icon: Lock },
  { id: 7, label: "Payslips", icon: FileText },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Date formatting helper function
const formatDateDDMMYYYY = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Safer local date formatting for YYYY-MM-DD
const formatLocalYYYYMMDD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

// Function to get correct date range for a given month and year
const getCorrectDateRange = (month, year) => {
    const firstDay = new Date(year, month - 1, 1); // month is 1-based, so subtract 1
    const lastDay = new Date(year, month, 0); // month is 1-based, so use month directly to get last day of previous month
    return {
        startDate: formatLocalYYYYMMDD(firstDay),
        endDate: formatLocalYYYYMMDD(lastDay),
        period: `${formatDateDDMMYYYY(formatLocalYYYYMMDD(firstDay))} to ${formatDateDDMMYYYY(formatLocalYYYYMMDD(lastDay))}`
    };
};

export default function PayrollProcessingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStep = parseInt(searchParams.get("step")) || 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [generatingPayslips, setGeneratingPayslips] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({});

  const [payrollData, setPayrollData] = useState({
    period: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    paymentDate: "",
  });

  const [calculationSummary, setCalculationSummary] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [payrollRunId, setPayrollRunId] = useState(null);
  const [payrollRun, setPayrollRun] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [manualDeductions, setManualDeductions] = useState([]);
  const [showAddDeduction, setShowAddDeduction] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState(null);
  const [selectedPayslipEmployee, setSelectedPayslipEmployee] = useState(null);
  const [deductionForm, setDeductionForm] = useState({
    description: "",
    amount: "",
    type: "global", // "global" or "employee"
    employeeId: "",
  });

  const [showPayslipsModal, setShowPayslipsModal] = useState(false);
  const [payslipsGenerated, setPayslipsGenerated] = useState(false);

  // Roles
  const isPayrollAdmin = useMemo(() => {
    return user?.systemRole === "PAYROLL_ADMIN" || user?.systemRole === "SUPER_ADMIN" || user?.systemRole === "COMPANY_ADMIN";
  }, [user]);

  const isHRFinance = useMemo(() => {
    return user?.systemRole === "HR_ADMIN" || user?.systemRole === "FINANCE_ADMIN";
  }, [user]);

  useEffect(() => {
    if (!isPayrollAdmin && !isHRFinance && user) {
        // Fallback for other roles if they somehow access this page
        // maybe redirect or show unauthorized
    }
  }, [isPayrollAdmin, isHRFinance, user]);

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Convert to 1-based month
    const currentYear = today.getFullYear();
    
    // Use the correct date range function
    const dateRange = getCorrectDateRange(currentMonth, currentYear);
    const paymentDate = new Date(currentYear, currentMonth, 5); // 5th of next month
    const paymentDateStr = formatLocalYYYYMMDD(paymentDate);

    setPayrollData((prev) => ({
      ...prev,
      month: currentMonth,
      year: currentYear,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      paymentDate: paymentDateStr,
      period: dateRange.period,
    }));

    // Load available employees
    fetchAvailableEmployees();
  }, []);

  // Update payroll data dates whenever month or year changes
  useEffect(() => {
    if (payrollData.month && payrollData.year) {
      const correctDateRange = getCorrectDateRange(payrollData.month, payrollData.year);
      setPayrollData(prev => ({
        ...prev,
        startDate: correctDateRange.startDate,
        endDate: correctDateRange.endDate,
        period: correctDateRange.period
      }));
    }
  }, [payrollData.month, payrollData.year]);

  // Function to check and load existing payroll run for selected month
  const handleMonthChange = async (month, year) => {
    try {
      setLoading(true);

      // Use the correct date range function
      const dateRange = getCorrectDateRange(month, year);
      const paymentDate = new Date(year, month, 5); // Default payment date: 5th of next month
      const paymentDateStr = formatLocalYYYYMMDD(paymentDate);

      setPayrollData((prev) => ({
        ...prev,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        paymentDate: paymentDateStr,
        period: dateRange.period,
      }));

      const response = await payrollProcessService.getAllPayrollRuns({ month, year, limit: 1 });
      const existingRun = response.data?.[0];

      if (existingRun) {
        toast.success(`Loading payroll for ${month}/${year}...`);
        // Fetch FULL details including payrollItems
        const fullRunResponse = await payrollProcessService.getPayrollRunById(existingRun.id);
        const fullRun = fullRunResponse.data || existingRun;

        // Override stored dates with correct calculated dates
        const correctedRun = {
          ...fullRun,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          period: dateRange.period
        };

        setPayrollRun(correctedRun);
        setPayrollRunId(correctedRun.id);
        setCurrentStep(correctedRun.currentStep || 6); // Default to review for existing non-drafts
        setIsLocked(correctedRun.status === 'LOCKED');
        if (correctedRun.manualDeductions) setManualDeductions(correctedRun.manualDeductions);

        // Populate selection from existing run if available
        if (correctedRun.selectedEmployeeIds && Array.isArray(correctedRun.selectedEmployeeIds) && availableEmployees.length > 0) {
          const selectedFromRun = availableEmployees.filter(emp => 
            correctedRun.selectedEmployeeIds.includes(emp.id)
          );
          setSelectedEmployees(selectedFromRun);
        } else {
          setSelectedEmployees([]);
        }
      } else {
        setPayrollRun(null);
        setPayrollRunId(null);
        setCurrentStep(1);
        setPayslipsGenerated(false);
        setSelectedEmployees([]);
        setCalculationSummary(null);
      }
    } catch (error) {
       console.error("Error checking existing run:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeNew = () => {
    setPayrollRunId(null);
    setPayrollRun(null);
    setSelectedEmployees([]);
    setCalculationSummary(null);
    setPreviewData(null);
    setEmployeeList([]);
    setManualDeductions([]);
    setPayslipsGenerated(false);
    setProcessingStatus({});
    setCurrentStep(2);
  };

  useEffect(() => {
    if (payrollRun?.payrollItems && payrollRun.payrollItems.length > 0) {
      // Check if payslips are fully generated from the authoritative database field
      setPayslipsGenerated(!!payrollRun.payslipsGenerated);

      const formattedItems = payrollRun.payrollItems.map(item => {
        const earningsTotal = Object.entries(item.earnings || {}).reduce((sum, [key, value]) => {
          if (key === '_attendanceStats') return sum;
          return sum + (Number(value) || 0);
        }, 0);
        const deductionsTotal = Object.values(item.deductions || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
        const gross = (Number(item.basicSalary) || 0) + earningsTotal;

        return {
          id: item.employee?.id || item.employeeId,
          name: `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`.trim() || 'Employee',
          empId: item.employee?.employeeId || `EMP-${item.employeeId}`,
          gross,
          deductions: deductionsTotal,
          net: item.netSalary || 0,
          status: item.status || "PROCESSED",
          earnings: item.earnings,
          deductionsObj: item.deductions,
          basicSalary: item.basicSalary,
          payslipId: item.payslip?.id,
          employee: item.employee // Pass the full employee object for additional details like designation
        };
      });
      setEmployeeList(formattedItems);
    }
  }, [payrollRun]);

  const updateCurrentStep = async (step) => {
    setCurrentStep(step);
    if (payrollRunId && isPayrollAdmin) {
       await payrollProcessService.updatePayrollRun(payrollRunId, { currentStep: step });
    }
  };

  // Auto-generate preview data when entering step 5 if calculation is done
  useEffect(() => {
    if (currentStep === 5 && calculationSummary && !previewData) {
      const totalGross = calculationSummary.totalGross;
      const autoDeductions = calculationSummary.autoDeductions;
      const totalManualDeductions = manualDeductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const totalDeductions = autoDeductions + totalManualDeductions;
      const totalNetPay = totalGross - totalDeductions;

      setPreviewData({
        period: payrollData.period,
        employeeCount: calculationSummary.totalEmployees || 0,
        grossPay: totalGross || 0,
        deductions: totalDeductions || 0,
        netPay: totalNetPay || 0,
      });
    }
  }, [currentStep, calculationSummary, previewData, manualDeductions, payrollData.period]);

  const fetchAvailableEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const response = await employeeService.getAllEmployees({ limit: 100, page: 1 });
      const list =
        response?.data?.data ||
        response?.data?.employees ||
        response?.employees ||
        response?.data ||
        response ||
        [];
        console.log('list ', list);
      const normalized = (Array.isArray(list) ? list : []).map((emp) => ({
        id: emp.id,
        empId: emp.employeeId || emp.employee_id || emp.empId || "N/A",
        name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || "Unknown",
        designation: emp.designation?.name || emp.designation || "N/A",
        department: emp.department?.name || emp.department || "N/A",
        ctc: Number(
          emp.baseSalary ??
          (emp.salaryStructure?.monthlyCTC ? emp.salaryStructure.monthlyCTC * 12 : null) ??
          emp.salaryStructure?.basicSalary ??
          emp.salaryStructure?.basic_salary ??
          emp.salaryStructure?.ctc ??
          (Array.isArray(emp.salaryStructures) && emp.salaryStructures.length > 0 ? ((emp.salaryStructures[0].monthlyCTC * 12) || emp.salaryStructures[0].basicSalary || emp.salaryStructures[0].basic_salary || emp.salaryStructures[0].ctc) : 0)
        ),
        status: emp.status || "ACTIVE",
        hasSalaryStructure: !!(emp.salaryStructure || (Array.isArray(emp.salaryStructures) && emp.salaryStructures.length > 0))
      }));

      console.log('normalized', normalized);

      const withSalaryStructure = normalized.filter(emp => emp.hasSalaryStructure);
      setAvailableEmployees(withSalaryStructure);
    } catch (error) {
      toast.error(error.message || "Failed to fetch employees");
    } finally {
      setEmployeeLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };

  // Update period when dates change
  useEffect(() => {
    if (payrollData.startDate && payrollData.endDate) {
      const startFormatted = formatDateDDMMYYYY(payrollData.startDate);
      const endFormatted = formatDateDDMMYYYY(payrollData.endDate);
      setPayrollData(prev => ({
        ...prev,
        period: `${startFormatted} to ${endFormatted}`
      }));
    }
  }, [payrollData.startDate, payrollData.endDate]);

  const handleFetchData = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select employees first");
      setCurrentStep(2);
      return;
    }

    try {
      setLoading(true);
      setProcessingStatus({ step: 3, status: "processing", message: "Fetching attendance & leave data..." });

      // Ensure we use the correct date range for creating the payroll run
      const correctDateRange = getCorrectDateRange(payrollData.month, payrollData.year);
      
      const createResponse = await payrollProcessService.createPayrollRun({
        period: correctDateRange.period,
        startDate: correctDateRange.startDate,
        endDate: correctDateRange.endDate,
        paymentDate: payrollData.paymentDate,
        employeeIds: selectedEmployees.map((emp) => emp.id),
        month: payrollData.month,
        year: payrollData.year,
        currentStep: 3
      });
      const runData = createResponse.data || createResponse?.data?.data || createResponse;
      setPayrollRun(runData);
      setPayrollRunId(runData?.id);

      setProcessingStatus({ step: 3, status: "completed", message: "Data fetched successfully" });
      toast.success("Payroll run created successfully", {
        iconTheme: {
          primary: '#070C8A',
          secondary: '#fff',
        },
      });
    } catch (error) {
      setProcessingStatus({ step: 3, status: "error", message: error.message });
      toast.error(error.message || "Failed to create payroll run");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setProcessingStatus({ step: 4, status: "processing", message: "Calculating gross, deductions & net pay..." });

      if (!payrollRunId) {
        toast.error("Please fetch data first");
        setCurrentStep(3);
        return;
      }

      await payrollProcessService.processPayrollRun(payrollRunId);

      const itemsResponse = await payrollService.getPayrollItems(payrollRunId, { page: 1, limit: 100 });
      const items = itemsResponse.data || itemsResponse?.data?.data || [];
      const normalizedItems = Array.isArray(items) ? items : [];

      const calculatedEmployees = normalizedItems.map((item) => {
        const earningsTotal = Object.entries(item.earnings || {}).reduce((sum, [key, value]) => {
          // Skip non-monetary metadata
          if (key === '_attendanceStats') return sum;
          return sum + (Number(value) || 0);
        }, 0);
        const deductionsTotal = Object.values(item.deductions || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
        const gross = (Number(item.basicSalary) || 0) + earningsTotal;

        return {
          id: item.employeeId,
          name: `${item.employee?.firstName || ""} ${item.employee?.lastName || ""}`.trim() || "Employee",
          empId: item.employee?.employeeId || item.employeeId,
          gross,
          autoDeductions: deductionsTotal,
          manualDeductions: 0,
          deductions: deductionsTotal,
          net: Number(item.netSalary) || 0,
          status: item.status || "PROCESSED",
          earnings: item.earnings,
          deductionsObj: item.deductions,
          basicSalary: item.basicSalary,
          payslipId: item.payslip?.id || item.payslipId || item.id // Fallback to item.id if it's the payslip record itself
        };
      });

      const totalGross = calculatedEmployees.reduce((sum, emp) => sum + (emp.gross || 0), 0);
      const totalAutoDeductions = calculatedEmployees.reduce((sum, emp) => sum + (emp.autoDeductions || 0), 0);
      const totalManualDeductions = manualDeductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const totalDeductions = totalAutoDeductions + totalManualDeductions;
      const totalNetPay = calculatedEmployees.reduce((sum, emp) => sum + (emp.net || 0), 0) - totalManualDeductions;

      const totalOneTimeBonuses = normalizedItems.reduce((sum, item) => sum + (Number(item.earnings?.bonus || 0) - (item.bonuses?.reduce((s, b) => s + b.amount, 0) || 0)), 0);
      
      setCalculationSummary({
        totalEmployees: calculatedEmployees.length,
        totalGross,
        autoDeductions: totalAutoDeductions,
        manualDeductions: totalManualDeductions,
        totalDeductions,
        totalNetPay,
        employeesProcessed: calculatedEmployees.length,
        oneTimeBonuses: (normalizedItems || []).reduce((sum, item) => {
          const earnings = item.earnings || {};
          const totalEmpBonus = (Number(earnings.bonus || earnings.Bonus || 0)) + 
                               (Number(earnings['Joining Bonus'] || 0)) + 
                               (Number(earnings['Referral Bonus'] || 0)) + 
                               (Number(earnings['Performance Bonus'] || 0));
          return sum + totalEmpBonus;
        }, 0)
      });
      setEmployeeList(calculatedEmployees);

      setProcessingStatus({ step: 4, status: "completed", message: "Calculation completed" });
      toast.success("Payroll calculation completed successfully", {
        iconTheme: {
          primary: '#070C8A',
          secondary: '#fff',
        },
      });
    } catch (error) {
      setProcessingStatus({ step: 4, status: "error", message: error.message });
      toast.error(error.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Recalculate to ensure manual deductions are included
    if (calculationSummary) {
      const totalGross = calculationSummary.totalGross;
      const autoDeductions = calculationSummary.autoDeductions;
      const totalManualDeductions = manualDeductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const totalDeductions = autoDeductions + totalManualDeductions;
      const totalNetPay = totalGross - totalDeductions;

      setCalculationSummary({
        ...calculationSummary,
        totalDeductions: totalDeductions,
        totalNetPay: totalNetPay,
        manualDeductions: totalManualDeductions,
      });

      setPreviewData({
        period: payrollData.period,
        employeeCount: calculationSummary.totalEmployees || 0,
        grossPay: totalGross || 0,
        deductions: totalDeductions || 0,
        netPay: totalNetPay || 0,
      });
    }

    setCurrentStep(5);
  };

  const handleLockPayroll = async () => {
    try {
      setLoading(true);
      setProcessingStatus({ step: 6, status: "processing", message: "Locking payroll & Generating Payslips..." });

      if (!payrollRunId) {
        throw new Error("No payroll run selected");
      }

      const response = await payrollProcessService.lockPayrollRun(payrollRunId);
      
      // Update step to 6 in backend too
      await payrollProcessService.updatePayrollRun(payrollRunId, { currentStep: 6 });
      
      const updatedRun = (await payrollProcessService.getPayrollRunById(payrollRunId)).data;
      setPayrollRun(updatedRun);
      setIsLocked(true);
      
      setProcessingStatus({ step: 6, status: "completed", message: "Payroll locked successfully. Awaiting HR approval." });
      toast.success("Payroll locked successfully", {
        iconTheme: {
          primary: '#070C8A',
          secondary: '#fff',
        },
      });
    } catch (error) {
      setProcessingStatus({ step: 6, status: "error", message: error.message });
      toast.error(error.message || "Failed to lock payroll");
    } finally {
      setLoading(false);
    }
  };

  const handleHRApprove = async () => {
    try {
      setLoading(true);
      const response = await payrollProcessService.hrApprovePayrollRun(payrollRunId);
      setPayrollRun(response.data || response);
      toast.success("HR Approved Successfully");
    } catch (error) {
      toast.error(error.message || "HR Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFinanceApprove = async () => {
    try {
      setLoading(true);
      const response = await payrollProcessService.financeApprovePayrollRun(payrollRunId);
      setPayrollRun(response.data || response);
      toast.success("Finance Approved Successfully");
    } catch (error) {
      toast.error(error.message || "Finance Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDataViewPayslips = () => {
    if (!payrollRunId) {
      toast.error("No payroll run selected");
      return;
    }
    // Open in a new tab to preserve the current state and prevent unmounting.
    window.open(`/payroll-compliance/payroll-processing/payslip-view?runId=${payrollRunId}`, '_blank');
  };

  const handleSendEmails = async () => {
    console.log("handleSendEmails called");
    try {
      setSendingEmails(true);
      setProcessingStatus({ step: 7, status: "processing", message: "Sending emails to all employees..." });

      if (!payrollRunId) {
        throw new Error("No payroll run selected");
      }

      const result = await payrollProcessService.sendPayslipEmails(payrollRunId);
      const { sent, failed, skipped } = result.data || {};

      setProcessingStatus({
        step: 7,
        status: "completed",
        message: `Emails Sent: ${sent}${failed > 0 ? `, Failed: ${failed}` : ''}${skipped > 0 ? `, Skipped: ${skipped}` : ''}`
      });
      toast.success(`Emails Sent Successfully (${sent} sent)`, {
        iconTheme: {
          primary: '#070C8A',
          secondary: '#fff',
        },
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send emails");
      setProcessingStatus({ step: 7, status: "error", message: error.message });
    } finally {
      setSendingEmails(false);
    }
  };

  const handleGeneratePayslips = async () => {
    console.log("handleGeneratePayslips called");
    if (!payrollRunId) {
      toast.error("Payroll run ID not found");
      return;
    }
    try {
      setGeneratingPayslips(true);
      setProcessingStatus({ step: 7, status: "processing", message: "Generating payslips and saving PDFs..." });

      const response = await payrollService.bulkGeneratePayslips(payrollRunId);
      
      console.log("Frontend response:", response);
      
      // Check if response has success property or if it has data with successCount
      if (response.success || (response.data && response.data.successCount > 0)) {
        // Re-fetch payroll run to get the new payslip IDs
        const updatedRun = (await payrollProcessService.getPayrollRunById(payrollRunId)).data;
        setPayrollRun(updatedRun);
        setPayslipsGenerated(true);
        setProcessingStatus({ step: 7, status: "completed", message: "Payslips generated and saved successfully" });
        toast.success(`Generated ${response.data?.successCount || response.successCount || 'all'} payslips successfully`, {
          iconTheme: {
            primary: '#070C8A',
            secondary: '#fff',
          },
        });
      } else {
        throw new Error(response.message || "Failed to generate some payslips");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setProcessingStatus({ step: 7, status: "error", message: error.message });
      toast.error(error.message || "Failed to generate payslips");
    } finally {
      setGeneratingPayslips(false);
    }
  };

  const handleViewPayslip = (employee) => {
    setSelectedPayslipEmployee(employee);
  };

  const handleDownloadPDF = (employee) => {
    setSelectedPayslipEmployee(employee);
  };

  const handleExportExcel = () => {
    try {
      if (!employeeList || employeeList.length === 0) {
        toast.error("No payroll data to export");
        return;
      }

      const excelData = employeeList.map(emp => {
        const earnings = emp.earnings || {};
        const deductions = emp.deductionsObj || {};
        const attendance = earnings._attendanceStats || {};

        const row = {
          "Emp ID": emp.empId,
          "Name": emp.name,
          "Working Days": attendance.workingDays || 0,
          "Present Days": attendance.presentDays || 0,
          "Basic Salary": emp.basicSalary || 0,
        };

        // Dynamically add all earning components as per salary template
        Object.entries(earnings).forEach(([key, val]) => {
          if (!['_attendanceStats', 'specialAllowance', 'Special', 'Special Allowance', 'Joining Bonus', 'Referral Bonus', 'Performance Bonus', 'bonus', 'Bonus'].includes(key)) {
            const isCamelCase = /^[a-z]+[A-Z][a-zA-Z]*$/.test(key);
            const formattedKey = isCamelCase 
              ? key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()
              : key;
            if (key.toLowerCase() === 'hra') {
              row['HRA'] = Number(val) || 0;
            } else {
              row[formattedKey] = Number(val) || 0;
            }
          }
        });

        // Add specifically requested earning columns
        row["Special Allowence"] = earnings.specialAllowance || earnings.Special || earnings['Special Allowance'] || 0;
        row["Joining Bonus"] = earnings['Joining Bonus'] || 0;
        row["Referral Bonus"] = earnings['Referral Bonus'] || 0;
        row["Performance Bonus"] = earnings['Performance Bonus'] || 0;

        row["GROSS EARNINGS"] = emp.gross || 0;

        // Dynamically add all deduction components as per salary template
        Object.entries(deductions).forEach(([key, val]) => {
          if (!['tds', 'Income Tax (TDS)'].includes(key)) {
            const isCamelCase = /^[a-z]+[A-Z][a-zA-Z]*$/.test(key);
            const formattedKey = isCamelCase 
              ? key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()
              : key;
            if (key === 'providentFund' || key === 'pf') {
              row['PF - Employee'] = Number(val) || 0;
            } else if (key === 'esic') {
              row['ESIC'] = Number(val) || 0;
            } else if (key === 'professionalTax' || key === 'pt') {
              row['Professional Tax'] = Number(val) || 0;
            } else {
              row[formattedKey] = Number(val) || 0;
            }
          }
        });

        row["TDS/Income Tax"] = deductions.tds || deductions['Income Tax (TDS)'] || 0;
        row["TOTAL DEDUCTIONS"] = emp.deductions || 0;
        row["NET PAYABLE"] = emp.net || 0;

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Register");

      // Auto-size columns
      const max_width = excelData.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
      worksheet['!cols'] = Array(max_width).fill({ wch: 20 });

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      
      const fileName = `Payroll_Register_${payrollData.period.replace(/\s+/g, '_')}.xlsx`;
      saveAs(data, fileName);
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Excel export failed", error);
      toast.error("Failed to export Excel");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddDeduction = () => {
    if (!deductionForm.description || !deductionForm.amount) {
      toast.error("Please fill in description and amount");
      return;
    }

    const newDeduction = {
      id: Date.now(),
      description: deductionForm.description,
      amount: parseFloat(deductionForm.amount),
      type: deductionForm.type,
      employeeId: deductionForm.type === 'employee' ? deductionForm.employeeId : null,
      employeeName: deductionForm.type === 'employee'
        ? selectedEmployees.find(e => e.id === deductionForm.employeeId)?.name
        : null,
    };

    if (editingDeduction) {
      setManualDeductions(manualDeductions.map(d =>
        d.id === editingDeduction.id ? newDeduction : d
      ));
      setEditingDeduction(null);
      toast.success("Deduction updated successfully");
    } else {
      setManualDeductions([...manualDeductions, newDeduction]);
      toast.success("Deduction added successfully");
    }

    setDeductionForm({
      description: "",
      amount: "",
      type: "global",
      employeeId: null,
    });
    setShowAddDeduction(false);

    // Recalculate if calculation is already done
    if (calculationSummary) {
      handleCalculate();
    }
  };

  const handleDeleteDeduction = (id) => {
    setManualDeductions(manualDeductions.filter(d => d.id !== id));
    toast.success("Deduction removed");

    // Recalculate if calculation is already done
    if (calculationSummary) {
      handleCalculate();
    }
  };

  const handleEditDeduction = (deduction) => {
    setEditingDeduction(deduction);
    setDeductionForm({
      description: deduction.description,
      amount: deduction.amount.toString(),
      type: deduction.type,
      employeeId: deduction.employeeId || null,
    });
    setShowAddDeduction(true);
  };

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return processingStatus.step === stepId ? processingStatus.status : "current";
    if (stepId === 7) {
      const isFinanceApproved = payrollRun?.status === 'FINANCE_APPROVED' || payrollRun?.status === 'PAID';
      if (!isFinanceApproved) return "pending";
    }
    return "pending";
  };

  // Payroll Approval View (Global Listing)
  const PayrollApprovalList = ({ hideHeader = false }) => {
    const [runs, setRuns] = useState([]);
    const [loadingRuns, setLoadingRuns] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, runId: null });

    const fetchRuns = async () => {
      try {
        setLoadingRuns(true);
        const response = await payrollProcessService.getAllPayrollRuns({
          limit: 20
        });
        const allRuns = response.data?.payrollRuns || response.data || [];
        setRuns(allRuns);
      } catch (error) {
        console.error("Failed to load payroll runs", error);
      } finally {
        setLoadingRuns(false);
      }
    };

    useEffect(() => {
      fetchRuns();
    }, []);

    const getApprovalStatus = (run) => {
      if (run.status === 'LOCKED') return { label: 'Awaiting HR Approval', color: 'bg-amber-100 text-amber-700' };
      if (run.status === 'HR_APPROVED') return { label: 'Awaiting Finance Approval', color: 'bg-blue-100 text-blue-700' };
      if (run.status === 'FINANCE_APPROVED') return { label: 'Final Approval Done', color: 'bg-green-100 text-green-700' };
      if (run.status === 'PROCESSED') return { label: 'Processed', color: 'bg-green-100 text-green-700' };
      if (run.status === 'DRAFT') return { label: 'Draft', color: 'bg-slate-100 text-slate-700' };
      return { label: run.status, color: 'bg-slate-100 text-slate-700' };
    };

    return (
      <div className="space-y-6 p-4">
        {!hideHeader && (
          <div className="text-center mb-8">
            <h3 className="text-3xl font-extrabold text-primary-900 dark:text-white capitalize">
              Payroll Approvals
            </h3>
            <p className="text-muted-foreground mt-2">
              Review and approve processed payroll runs for each month.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loadingRuns ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
          ) : (() => {
            const filteredRuns = runs.filter(run => {
              if (isHRFinance && !isPayrollAdmin) {
                return ['LOCKED', 'HR_APPROVED', 'FINANCE_APPROVED'].includes(run.status);
              }
              return true;
            });

            if (filteredRuns.length === 0) {
              return (
                <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-muted-foreground">
                  No payroll runs found needing your attention.
                </div>
              );
            }

            return filteredRuns.map(run => {
              const status = getApprovalStatus(run);
              return (
                <div key={run.id} className="glass-card p-5 rounded-2xl border border-white/20 dark:border-white/10 flex items-center justify-between group hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl group-hover:bg-primary-100 transition-colors">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">
                        {run.month ? `${new Date(2000, run.month - 1).toLocaleString('default', { month: 'long' })} ${run.year || new Date().getFullYear()}` : `Payroll ID: ${run.payrollId}`}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">{run.period}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-muted rounded-full">
                          {run.totalEmployees || run.selectedEmployeeIds?.length || 0} Employees
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Delete Option */}
                    {isPayrollAdmin && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModal({ isOpen: true, runId: run.id });
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        title="Delete Payroll"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        try {
                          setLoading(true);
                          const fullRunResponse = await payrollProcessService.getPayrollRunById(run.id);
                          const fullRun = fullRunResponse.data || run;
                          setPayrollRunId(fullRun.id);
                          setPayrollRun(fullRun);
                          
                          const runStatus = fullRun.status;
                          if (isHRFinance && !isPayrollAdmin) {
                            setCurrentStep(6);
                          } else if (runStatus === 'FINANCE_APPROVED' || runStatus === 'PROCESSED') {
                            setCurrentStep(7);
                          } else if (['LOCKED', 'HR_APPROVED'].includes(runStatus)) {
                            setCurrentStep(6);
                          } else {
                            setCurrentStep(fullRun.currentStep || 3);
                          }

                          // Populate selection from history run
                          if (fullRun.selectedEmployeeIds && Array.isArray(fullRun.selectedEmployeeIds) && availableEmployees.length > 0) {
                            const selectedFromRun = availableEmployees.filter(emp => 
                              fullRun.selectedEmployeeIds.includes(emp.id)
                            );
                            setSelectedEmployees(selectedFromRun);
                          } else if (fullRun.payrollItems && fullRun.payrollItems.length > 0) {
                             const selectedFromItems = availableEmployees.filter(emp => 
                               fullRun.payrollItems.some(item => item.employeeId === emp.id)
                             );
                             setSelectedEmployees(selectedFromItems);
                          }
                        } catch (err) {
                          toast.error("Failed to load run");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white text-xs rounded-lg font-bold shadow-md hover:bg-primary-700 transition-all flex items-center gap-1.5"
                    >
                      {isPayrollAdmin && run.status === 'DRAFT' ? "Resume Stage" : "View Details"} <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, runId: null })}
          onConfirm={async () => {
             try {
               setLoadingRuns(true);
               await payrollProcessService.deletePayrollRun(deleteModal.runId);
               toast.success("Payroll run deleted successfully");
               fetchRuns();
             } catch (err) {
               toast.error(err.message || "Failed to delete payroll run");
             } finally {
               setLoadingRuns(false);
             }
          }}
          title="Delete Payroll Run"
          message="Are you sure you want to delete this payroll run? This action cannot be undone."
          confirmText="Delete"
          isDestructive={true}
        />
      </div>
    );
  };

  const renderStepContent = () => {
    const stepAnimation = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3 }
    };

    switch (currentStep) {
      case 1:
        return (
          <motion.div {...stepAnimation} className="space-y-12">
            <div className="max-w-[1200px] mx-auto grid lg:grid-cols-5 gap-8 items-start">
              {/* Left: Configuration Form */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="glass-card p-8 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 -z-0"></div>
                    
                    <div className="relative z-10 space-y-6">
                      <div>
                        <h3 className="text-2xl font-black text-foreground mb-1">New Payroll</h3>
                        <p className="text-xs text-muted-foreground">Select period and initialize processing.</p>
                      </div>

                      {/* Month Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payroll Month</label>
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={payrollData.month}
                            onChange={(e) => {
                               const m = parseInt(e.target.value);
                               setPayrollData({ ...payrollData, month: m });
                               handleMonthChange(m, payrollData.year);
                            }}
                            className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-border shadow-sm focus:ring-2 focus:ring-primary-500/20 text-sm font-medium"
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                              </option>
                            ))}
                          </select>
                          <select
                            value={payrollData.year}
                            onChange={(e) => {
                               const y = parseInt(e.target.value);
                               setPayrollData({ ...payrollData, year: y });
                               handleMonthChange(payrollData.month, y);
                            }}
                            className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-border shadow-sm focus:ring-2 focus:ring-primary-500/20 text-sm font-medium"
                          >
                            {[2024, 2025, 2026, 2027].map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Start Date</label>
                          <DatePicker
                            value={payrollData.startDate}
                            onChange={(e) => {
                              const newStartDate = e.target.value;
                              setPayrollData({
                                ...payrollData,
                                startDate: newStartDate,
                                period: newStartDate ? `${formatDateDDMMYYYY(newStartDate)} to ${formatDateDDMMYYYY(payrollData.endDate)}` : ""
                              });
                            }}
                            placeholder="dd-mm-yyyy"
                            dateFormat="d-m-Y"
                            className="py-3 bg-white dark:bg-gray-800 border-border"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">End Date</label>
                          <DatePicker
                            value={payrollData.endDate}
                            onChange={(e) => {
                              const newEndDate = e.target.value;
                              setPayrollData({
                                ...payrollData,
                                endDate: newEndDate,
                                period: newEndDate ? `${formatDateDDMMYYYY(payrollData.startDate)} to ${formatDateDDMMYYYY(newEndDate)}` : ""
                              });
                            }}
                            minDate={payrollData.startDate}
                            placeholder="dd-mm-yyyy"
                            dateFormat="d-m-Y"
                            className="py-3 bg-white dark:bg-gray-800 border-border"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Date</label>
                        <DatePicker
                          value={payrollData.paymentDate}
                          onChange={(e) => setPayrollData({ ...payrollData, paymentDate: e.target.value })}
                          placeholder="dd-mm-yyyy"
                          dateFormat="d-m-Y"
                          className="py-3 bg-white dark:bg-gray-800 border-border"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleInitializeNew}
                        disabled={!payrollData.startDate || !payrollData.endDate}
                        className="bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/20 w-full flex items-center justify-center gap-2 mt-4 rounded-xl py-4 font-black transition-all"
                      >
                        Initialize Processing <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                 </div>

                 {/* Assistant Panel */}
                 <div className="p-6 bg-secondary-50 dark:bg-secondary-900/10 rounded-3xl border border-secondary-100 dark:border-secondary-900/20">
                    <h4 className="font-bold text-secondary-900 dark:text-secondary-100 mb-3 flex items-center gap-2">
                       <AlertCircle className="w-4 h-4" /> Quick Info
                    </h4>
                    <p className="text-xs text-secondary-800/70 dark:text-secondary-200/70 leading-relaxed">
                       Processing a new payroll will automatically fetch attendance and leave status for the selected period. You can save your progress and return later.
                    </p>
                 </div>
              </div>

              {/* Right: History List */}
              <div className="lg:col-span-3 space-y-6">
                 <div>
                    <h4 className="text-xl font-black text-foreground mb-1 flex items-center gap-2">
                       <Clock className="w-5 h-5 text-primary-600" /> Recent Runs & History
                    </h4>
                    <p className="text-xs text-muted-foreground">Resume drafts or track approval status of processed payrolls.</p>
                 </div>
                 <div className="max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                    <PayrollApprovalList hideHeader={true} />
                 </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        const filteredEmployees = availableEmployees.filter(emp =>
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const toggleEmployeeSelection = (employee) => {
          if (selectedEmployees.some(emp => emp.id === employee.id)) {
            setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== employee.id));
          } else {
            setSelectedEmployees([...selectedEmployees, employee]);
          }
        };

        const toggleSelectAll = () => {
          if (selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0) {
            setSelectedEmployees([]);
          } else {
            setSelectedEmployees([...filteredEmployees]);
          }
        };

        return (
          <motion.div {...stepAnimation} className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Select Employees for Payroll
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose employees to include in the payroll processing for {payrollData.period}
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-4">
              {/* Search and Selection Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search employees by name, ID, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-card text-foreground"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-xl px-4 py-2 premium-shadow"
                >
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary-600">{selectedEmployees.length}</span> of{" "}
                    <span className="font-semibold text-foreground">{filteredEmployees.length}</span> selected
                  </p>
                </motion.div>
              </div>

              {/* Select All */}
              {filteredEmployees.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={filteredEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500/20"
                  />
                  <label className="text-sm font-medium text-foreground cursor-pointer">
                    Select All ({filteredEmployees.length} employees)
                  </label>
                </motion.div>
              )}

              {/* Employee List */}
              {employeeLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : filteredEmployees.length > 0 ? (
                <div className="glass-card rounded-xl overflow-hidden premium-shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">Select</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">Employee ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">Designation</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">Department</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">Basic Salary</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredEmployees.map((employee, index) => {
                          const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
                          return (
                            <motion.tr
                              key={employee.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                              className={`transition-colors cursor-pointer ${isSelected ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
                              onClick={() => toggleEmployeeSelection(employee)}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleEmployeeSelection(employee)}
                                    className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500/20"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-primary-600">{employee.empId}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-foreground">{employee.name}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-muted-foreground">{employee.designation}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-muted-foreground">{employee.department}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-success">{formatCurrency(employee.ctc)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-semibold text-success">
                                  {employee.status}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-xl p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No employees found matching your search.</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(1)}
                  className="btn-outline flex-1 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (selectedEmployees.length > 0) {
                      setCurrentStep(3);
                    } else {
                      toast.error("Please select at least one employee");
                    }
                  }}
                  disabled={selectedEmployees.length === 0}
                  className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20 flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-bold transition-all"
                >
                  Next: Fetch Data
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div {...stepAnimation} className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Fetch Data</h3>
              <p className="text-muted-foreground">Retrieve attendance and leave records automatically.</p>
              {selectedEmployees.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Processing for {selectedEmployees.length} selected employee{selectedEmployees.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="max-w-lg mx-auto">
              <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-16 -mt-16 z-0"></div>

                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="p-2 bg-card rounded-lg shadow-sm text-primary">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Data Retrieval Sources</h4>
                      <ul className="mt-2 text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                        <li>Biometric Attendance System</li>
                        <li>Leave Management Module</li>
                        <li>Overtime & Shift Adjustments</li>
                        <li>Holiday Calendar</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleFetchData}
                      disabled={loading || selectedEmployees.length === 0 || (processingStatus.step === 3 && processingStatus.status === 'completed')}
                      className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${processingStatus.step === 3 && processingStatus.status === 'completed'
                        ? 'bg-primary-600 text-white cursor-default'
                        : selectedEmployees.length === 0
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20'
                        }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Fetching...
                        </>
                      ) : processingStatus.step === 3 && processingStatus.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" /> Data Fetched
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" /> Retrieve Data
                        </>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {processingStatus.step === 3 && processingStatus.status === 'completed' && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setCurrentStep(4)}
                          className="w-full py-3 text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-2 group"
                        >
                          Proceed to Calculation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        const chartOptions = {
          chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
          plotOptions: { bar: { borderRadius: 6, columnWidth: '50%', distributed: true } },
          dataLabels: { enabled: false },
          legend: { show: false },
          xaxis: {
            categories: ['Gross', 'Deductions', 'Net Pay'],
            labels: { style: { colors: 'var(--muted-foreground)' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
          },
          yaxis: {
            labels: { style: { colors: 'var(--muted-foreground)' }, formatter: (val) => val >= 1000 ? `${val / 1000}k` : val }
          },
          grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
          tooltip: { theme: 'dark' },
          colors: ['#10b981', '#ef4444', '#070C8A'] // Success, Destructive, Primary
        };

        const chartSeries = calculationSummary ? [{
          name: 'Amount',
          data: [calculationSummary.totalGross, calculationSummary.totalDeductions, calculationSummary.totalNetPay]
        }] : [];

        return (
          <motion.div {...stepAnimation} className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Payroll Calculation</h3>
              <p className="text-muted-foreground">Process gross salary, deductions, and net pay for all employees.</p>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
              {!calculationSummary ? (
                <div className="flex flex-col items-center justify-center py-12 glass-card rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Calculator className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground">Ready to Calculate</h4>
                  <p className="text-muted-foreground text-center max-w-md mt-2 mb-8">
                    The system will process attendance data and calculate payouts based on salary structures.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCalculate}
                    disabled={loading}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold shadow-xl shadow-primary-500/20 flex items-center gap-2 transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                    {loading ? 'Processing...' : 'Run Calculation'}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm">
                        <h4 className="font-bold text-foreground mb-6">Summary Overview</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                          <div className="p-4 bg-muted rounded-xl border border-border">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Employees</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{calculationSummary.totalEmployees}</p>
                          </div>
                          <div className="p-4 bg-secondary-50 dark:bg-secondary-900/10 rounded-xl border border-secondary-100 dark:border-secondary-900/20">
                            <p className="text-xs text-secondary-600 dark:text-secondary-400 uppercase tracking-wider font-semibold">Gross Pay</p>
                            <p className="text-lg font-bold text-secondary-700 dark:text-secondary-300 mt-1">{formatCurrency(calculationSummary.totalGross)}</p>
                          </div>
                          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                            <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider font-semibold">Deductions</p>
                            <p className="text-lg font-bold text-red-700 dark:text-red-300 mt-1">
                              {formatCurrency((calculationSummary.autoDeductions || 0) + manualDeductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0))}
                            </p>
                          </div>
                          <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/20">
                            <p className="text-xs text-primary-600 dark:text-primary-400 uppercase tracking-wider font-semibold">Net Pay</p>
                            <p className="text-lg font-bold text-primary-700 dark:text-primary-300 mt-1">
                              {formatCurrency((calculationSummary.totalGross || 0) - ((calculationSummary.autoDeductions || 0) + manualDeductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)))}
                            </p>
                          </div>
                        </div>
                        <div className="h-64 w-full">
                          <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height="100%" />
                        </div>
                      </div>

                      {/* Manual Deductions Section */}
                      <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-foreground">Manual Deductions & Charges</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Add custom deductions or additional charges for this payroll period
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setShowAddDeduction(!showAddDeduction);
                              setEditingDeduction(null);
                              setDeductionForm({
                                description: "",
                                amount: "",
                                type: "global",
                                employeeId: null,
                              });
                            }}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-md shadow-primary-500/20 flex items-center gap-2 text-sm transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Add Deduction
                          </motion.button>
                        </div>

                        {/* Add/Edit Deduction Form */}
                        <AnimatePresence>
                          {showAddDeduction && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mb-4 p-4 bg-muted/30 rounded-xl border border-border"
                            >
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-2">
                                    Deduction Type
                                  </label>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setDeductionForm({ ...deductionForm, type: "global", employeeId: null })}
                                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${deductionForm.type === "global"
                                        ? "bg-primary-600 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                    >
                                      Global (All Employees)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeductionForm({ ...deductionForm, type: "employee" })}
                                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${deductionForm.type === "employee"
                                        ? "bg-primary-600 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                    >
                                      Specific Employee
                                    </button>
                                  </div>
                                </div>

                                {deductionForm.type === "employee" && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                  >
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Select Employee
                                    </label>
                                    <select
                                      value={deductionForm.employeeId || ""}
                                      onChange={(e) => setDeductionForm({ ...deductionForm, employeeId: parseInt(e.target.value) })}
                                      className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary-500/20"
                                    >
                                      <option value="">Select Employee</option>
                                      {selectedEmployees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                          {emp.name} ({emp.empId})
                                        </option>
                                      ))}
                                    </select>
                                  </motion.div>
                                )}

                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-2">
                                    Description *
                                  </label>
                                  <input
                                    type="text"
                                    value={deductionForm.description}
                                    onChange={(e) => setDeductionForm({ ...deductionForm, description: e.target.value })}
                                    placeholder="e.g., Late Fee, Loan Deduction, Fine, etc."
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-2">
                                    Amount (₹) *
                                  </label>
                                  <input
                                    type="number"
                                    value={deductionForm.amount}
                                    onChange={(e) => setDeductionForm({ ...deductionForm, amount: e.target.value })}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddDeduction}
                                    className="bg-primary-600 hover:bg-primary-700 text-white flex-1 flex items-center justify-center gap-2 rounded-lg py-2 transition-all"
                                  >
                                    {editingDeduction ? (
                                      <>
                                        <Edit2 className="w-4 h-4" />
                                        Update Deduction
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-4 h-4" />
                                        Add Deduction
                                      </>
                                    )}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      setShowAddDeduction(false);
                                      setEditingDeduction(null);
                                      setDeductionForm({
                                        description: "",
                                        amount: "",
                                        type: "global",
                                        employeeId: null,
                                      });
                                    }}
                                    className="btn-outline flex items-center justify-center gap-2"
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Manual Deductions List */}
                        {manualDeductions.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                              <span>Total Manual Deductions: <span className="font-semibold text-foreground">{formatCurrency(calculationSummary?.manualDeductions || 0)}</span></span>
                            </div>
                            {manualDeductions.map((deduction, index) => (
                              <motion.div
                                key={deduction.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">{deduction.description}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${deduction.type === 'global'
                                      ? 'bg-primary-50 text-primary-700'
                                      : 'bg-secondary-50 text-secondary-700'
                                      }`}>
                                      {deduction.type === 'global' ? 'Global' : deduction.employeeName}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {deduction.type === 'employee' && deduction.employeeName && `For: ${deduction.employeeName}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold text-destructive">
                                    -{formatCurrency(deduction.amount)}
                                  </span>
                                  <div className="flex gap-1">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleEditDeduction(deduction)}
                                      className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDeleteDeduction(deduction.id)}
                                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Minus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No manual deductions added yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm flex flex-col justify-center text-center">
                      <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-foreground">Calculation Complete</h4>
                      <p className="text-sm text-muted-foreground mt-2 mb-6">
                        All figures have been processed. Proceed to preview the detailed breakdown.
                      </p>
                      <button
                        onClick={handlePreview}
                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl w-full py-3 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-all"
                      >
                        Next Step <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCalculate}
                        className="mt-3 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
                      >
                        Re-calculate
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 5:
        // Ensure we have preview data - use calculationSummary if previewData is not set
        const displayPreviewData = previewData || (calculationSummary ? {
          period: payrollData.period,
          employeeCount: calculationSummary.totalEmployees || 0,
          grossPay: calculationSummary.totalGross || 0,
          bonusPay: calculationSummary.oneTimeBonuses || 0,
          deductions: calculationSummary.totalDeductions || 0,
          netPay: calculationSummary.totalNetPay || 0,
        } : null);

        return (
          <motion.div {...stepAnimation} className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Preview & Verification</h3>
              <p className="text-muted-foreground">Review the final payroll data before locking it.</p>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
              {displayPreviewData && calculationSummary ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-white/10 relative overflow-hidden">
                      <div className="flex justify-between items-end mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Net Payable</p>
                          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                            {formatCurrency(displayPreviewData.netPay)}
                          </h2>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{displayPreviewData.period}</p>
                          <p className="text-xs text-muted-foreground">{displayPreviewData.employeeCount} Employees</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Gross Pay</span>
                          <span className="font-semibold text-foreground">{formatCurrency(displayPreviewData.grossPay)}</span>
                        </div>
                        {displayPreviewData.bonusPay > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Bonuses (Incl. Profile Bonuses)</span>
                            <span className="font-semibold text-green-600">+{formatCurrency(displayPreviewData.bonusPay)}</span>
                          </div>
                        )}
                        {(() => {
                          const totalTDS = (employeeList || []).reduce((sum, e) => sum + (e.deductionsObj?.tds || 0), 0);
                          return (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Auto Deductions (PF, PT, ESI)</span>
                                <span className="font-semibold text-red-500">
                                  -{formatCurrency((calculationSummary.autoDeductions || 0) - totalTDS)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Income Tax (TDS)</span>
                                <span className="font-semibold text-orange-600">
                                  -{formatCurrency(totalTDS)}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                        {(calculationSummary.manualDeductions || 0) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Manual Deductions</span>
                            <span className="font-semibold text-primary-600">-{formatCurrency(calculationSummary.manualDeductions || 0)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
                          <span className="text-foreground">Total Deductions</span>
                          <span className="text-red-500">-{formatCurrency(displayPreviewData.deductions)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-0 rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                        <h4 className="font-bold text-foreground text-sm">Employee Breakdown (Preview)</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {employeeList?.length || 0} employee{employeeList?.length !== 1 ? 's' : ''} processed
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto p-4 custom-scrollbar">
                        {employeeList && employeeList.length > 0 ? (
                          <div className="space-y-3">
                            {employeeList.map((emp, index) => (
                              <motion.div
                                key={emp.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.01, x: 4 }}
                                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-all"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 font-bold text-sm">
                                    {emp.name?.charAt(0) || 'E'}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-foreground">{emp.name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">{emp.empId || 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="text-xs text-muted-foreground">Gross</p>
                                      <p className="text-sm font-semibold text-foreground">{formatCurrency(emp.gross || 0)}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-muted-foreground">TDS</p>
                                      <p className="text-sm font-semibold text-orange-600">-{formatCurrency(emp.deductionsObj?.tds || 0)}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-muted-foreground">Deductions</p>
                                      <div className="group relative">
                                        <p className="text-sm font-semibold text-destructive cursor-help">-{formatCurrency(emp.deductions || 0)}</p>
                                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900/95 text-white text-[10px] rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none border border-white/10 backdrop-blur-sm">
                                          <p className="font-bold border-b border-white/10 pb-1 mb-1 block">Deduction Breakup</p>
                                          {Object.entries(emp.deductionsObj || {}).map(([key, val]) => (
                                            val > 0 && (
                                              <div key={key} className="flex justify-between py-0.5 border-b border-white/5 last:border-0 uppercase">
                                                <span className="opacity-70">{key.replace(/_/g, ' ')}</span>
                                                <span className="font-mono">{formatCurrency(val)}</span>
                                              </div>
                                            )
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right border-l border-border pl-4">
                                      <p className="text-xs text-muted-foreground">Net Pay</p>
                                      <p className="text-base font-bold text-primary-600">{formatCurrency(emp.net || 0)}</p>
                                    </div>
                                  </div>
                                </div>

                              </motion.div>
                            ))}
                          </div>
                        ) : selectedEmployees && selectedEmployees.length > 0 ? (
                          <div className="space-y-3">
                            {selectedEmployees.map((emp, index) => {
                              const empGross = emp.ctc || 0;
                              const empAutoDeductions = 0; // Backend calculation required
                              const empManualDeductions = manualDeductions
                                .filter(d => d.type === 'employee' && d.employeeId === emp.id)
                                .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
                              const globalManualDeductions = manualDeductions
                                .filter(d => d.type === 'global')
                                .reduce((sum, d) => sum + (parseFloat(d.amount) || 0) / selectedEmployees.length, 0);
                              const empTotalDeductions = empAutoDeductions + empManualDeductions + globalManualDeductions;
                              const empNet = empGross - empTotalDeductions;

                              return (
                                <motion.div
                                  key={emp.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={{ scale: 1.01, x: 4 }}
                                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-all"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 font-bold text-sm">
                                      {emp.name?.charAt(0) || 'E'}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-bold text-foreground">{emp.name || 'Unknown'}</p>
                                      <p className="text-xs text-muted-foreground">{emp.empId || 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <div className="flex items-center gap-4">
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Gross</p>
                                        <p className="text-sm font-semibold text-foreground">{formatCurrency(empGross)}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Deductions</p>
                                        <p className="text-sm font-semibold text-destructive">-{formatCurrency(empTotalDeductions)}</p>
                                      </div>
                                      <div className="text-right border-l border-border pl-4">
                                        <p className="text-xs text-muted-foreground">Net Pay</p>
                                        <p className="text-base font-bold text-primary-600">{formatCurrency(empNet)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">No employee data available</p>
                            <p className="text-xs mt-1">Please complete the calculation step first</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateCurrentStep(6)}
                      className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      Verify & Proceed <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleExportExcel}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" /> Export Payroll Register
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateCurrentStep(4)}
                      className="w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-foreground rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Calculate
                    </motion.button>
                  </div>
                </div>
              ) : calculationSummary ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 glass-card rounded-2xl border border-dashed border-border"
                >
                  <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/10 rounded-full flex items-center justify-center mb-6">
                    <Eye className="w-10 h-10 text-primary-600" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Generating Preview...</h4>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Preparing preview data with current calculations.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePreview}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all"
                  >
                    <Eye className="w-5 h-5" />
                    Generate Preview
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 glass-card rounded-2xl border border-dashed border-border"
                >
                  <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/10 rounded-full flex items-center justify-center mb-6">
                    <Calculator className="w-10 h-10 text-primary-600" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">No Calculation Data Available</h4>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Please complete the calculation step first before generating preview.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(4)}
                    className="btn-outline px-8 py-3 rounded-xl font-bold flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Go to Calculation
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 6:
        const canHRApprove = user?.systemRole === 'HR_ADMIN' || user?.systemRole === 'SUPER_ADMIN' || user?.systemRole === 'COMPANY_ADMIN';
        const canFinanceApprove = user?.systemRole === 'FINANCE_ADMIN' || user?.systemRole === 'SUPER_ADMIN' || user?.systemRole === 'COMPANY_ADMIN';
        const isHRApproved = payrollRun?.status === 'HR_APPROVED' || payrollRun?.status === 'FINANCE_APPROVED' || payrollRun?.status === 'PAID';
        const isFinanceApproved = payrollRun?.status === 'FINANCE_APPROVED' || payrollRun?.status === 'PAID';
        const isCurrentlyLocked = payrollRun?.status === 'LOCKED' || isHRApproved || isFinanceApproved;

        return (
          <motion.div {...stepAnimation} className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Finalize Payroll</h3>
              <p className="text-muted-foreground">
                {isCurrentlyLocked ? "Review payroll and manage approvals." : "Locking the payroll allows you to generate payslips and reports."}
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-6">
              {!isCurrentlyLocked ? (
                <div className="max-w-md mx-auto">
                  <div className="glass-card p-8 rounded-2xl border border-white/20 dark:border-white/10 text-center shadow-xl">
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-primary-600 mx-auto">
                        <Lock className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground">Confirm Lock</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                          Once locked, you cannot modify attendance or salary details for this period without unlocking.
                        </p>
                      </div>
                      <button
                        onClick={handleLockPayroll}
                        disabled={loading}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                        {loading ? 'Locking...' : 'Lock Payroll'}
                      </button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportExcel}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all mt-4"
                      >
                        <Download className="w-5 h-5" /> Export Register
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Approval Status & Employee Summary */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Approval Stepper */}
                    <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm">
                      <h4 className="font-bold text-foreground mb-6">Approval Pipeline</h4>
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 dark:bg-white/10 -z-0"></div>
                        <div className={`absolute top-5 left-0 h-0.5 bg-primary-600 transition-all duration-500 -z-0`} style={{ width: isFinanceApproved ? '100%' : isHRApproved ? '50%' : '0%' }}></div>
                        
                        <div className="flex flex-col items-center relative z-10 bg-background px-2">
                          <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg">
                            <Lock className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold mt-2 text-primary-600">Locked</span>
                        </div>

                        <div className="flex flex-col items-center relative z-10 bg-background px-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${isHRApproved ? 'bg-primary-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                            {isHRApproved ? <CheckCircle2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                          </div>
                          <span className={`text-xs font-bold mt-2 ${isHRApproved ? 'text-primary-600' : 'text-muted-foreground'}`}>HR Approval</span>
                          {isHRApproved && (
                            <span className="text-[10px] text-success font-medium">Approved by {payrollRun?.hrApprovedByEmp?.firstName || 'HR'}</span>
                          )}
                        </div>

                        <div className="flex flex-col items-center relative z-10 bg-background px-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${isFinanceApproved ? 'bg-primary-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                            {isFinanceApproved ? <CheckCircle2 className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
                          </div>
                          <span className={`text-xs font-bold mt-2 ${isFinanceApproved ? 'text-primary-600' : 'text-muted-foreground'}`}>Finance Approval</span>
                          {isFinanceApproved && (
                            <span className="text-[10px] text-success font-medium">Approved by {payrollRun?.financeApprovedByEmp?.firstName || 'Finance'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Employee Listing */}
                    <div className="glass-card p-0 rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                        <h4 className="font-bold text-foreground text-sm">Payroll Details</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {employeeList?.length || 0} employees included in this payroll run
                        </p>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
                        <div className="space-y-3">
                          {employeeList.map((emp, index) => (
                            <div key={emp.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 font-bold text-sm">
                                  {emp.name?.charAt(0) || 'E'}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-foreground">{emp.name}</p>
                                  <p className="text-xs text-muted-foreground">{emp.empId}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Net Pay</p>
                                <p className="text-sm font-bold text-primary-600">{formatCurrency(emp.net || 0)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Sidebar */}
                  <div className="space-y-4">
                    <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm">
                      <h4 className="font-bold text-foreground mb-4">Required Actions</h4>
                      <div className="space-y-3">
                        {/* HR Approval Button */}
                        {!isHRApproved && (
                          <motion.button
                            whileHover={{ scale: canHRApprove ? 1.02 : 1 }}
                            whileTap={{ scale: canHRApprove ? 0.98 : 1 }}
                            onClick={handleHRApprove}
                            disabled={!canHRApprove || loading}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canHRApprove ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                            {canHRApprove ? 'Approve as HR' : 'Awaiting HR Approval'}
                          </motion.button>
                        )}

                        {/* Finance Approval Button */}
                        {isHRApproved && !isFinanceApproved && (
                          <motion.button
                            whileHover={{ scale: canFinanceApprove ? 1.02 : 1 }}
                            whileTap={{ scale: canFinanceApprove ? 0.98 : 1 }}
                            onClick={handleFinanceApprove}
                            disabled={!canFinanceApprove || loading}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canFinanceApprove ? 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-lg shadow-secondary-500/20' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                            {canFinanceApprove ? 'Approve as Finance' : 'Awaiting Finance Approval'}
                          </motion.button>
                        )}

                        {/* Next Step Shortcut */}
                        {isFinanceApproved && isPayrollAdmin && (
                          <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-center">
                            <p className="text-sm font-bold text-success mb-3">All Approvals Complete!</p>
                            <button
                              onClick={() => setCurrentStep(7)}
                              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                            >
                              Go to Payslips <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {!isFinanceApproved && isPayrollAdmin && (
                          <p className="text-[10px] text-center text-muted-foreground italic px-2">
                             Note: The "Go to Payslips" button will be enabled only after final finance approval.
                          </p>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleExportExcel}
                          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all mt-4"
                        >
                          <Download className="w-4 h-4" /> Export Payroll Register
                        </motion.button>
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-foreground">Summary</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-bold">{payrollRun?.status}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Period:</span>
                          <span className="font-semibold text-foreground">{payrollRun?.period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Net:</span>
                          <span className="font-bold text-primary-600">{formatCurrency(payrollRun?.totalAmount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 7:
        const isApprovedForPayslips = payrollRun?.status === 'FINANCE_APPROVED' || payrollRun?.status === 'PAID';

        if (!isApprovedForPayslips) {
             return (
               <motion.div {...stepAnimation} className="space-y-8 flex flex-col items-center justify-center min-h-[400px]">
                 <div className="glass-card p-12 text-center shadow-2xl max-w-lg">
                    <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-8 animate-pulse">
                      <Lock className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Awaiting Final Approval</h3>
                    <p className="text-muted-foreground mb-8">
                       Payslips will become available once the payroll has received final approval from the Finance Admin.
                    </p>
                    <button
                      onClick={() => setCurrentStep(6)}
                      className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg transition-all"
                    >
                      Check Approval Status
                    </button>
                 </div>
               </motion.div>
             );
        }

        return (
          <motion.div {...stepAnimation} className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Payslips & Reports</h3>
              <p className="text-muted-foreground">View generated payslips and send them to employees.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Option 1: View/Download */}
              <div className="glass-card p-10 rounded-3xl border border-white/20 dark:border-white/10 text-center shadow-xl hover:shadow-2xl transition-all group">
                <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">View Payslips</h4>
                <p className="text-sm text-muted-foreground mb-6">Generate all payslips first, then view individual records.</p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGeneratePayslips();
                    }}
                    disabled={generatingPayslips || payslipsGenerated}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {generatingPayslips ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                    {payslipsGenerated ? 'Generated ✓' : 'Generate All'}
                  </button>
                  <button
                    onClick={() => setShowPayslipsModal(true)}
                    className="w-full py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
                  >
                    <Eye className="w-5 h-5" /> Open Viewer
                  </button>
                </div>
              </div>

              {/* Option 2: Excel Export */}
              <div className="glass-card p-10 rounded-3xl border border-white/20 dark:border-white/10 text-center shadow-xl hover:shadow-2xl transition-all group border-primary-200">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">Payroll Register</h4>
                <p className="text-sm text-muted-foreground mb-8">Download detailed Excel report for accounting entries.</p>
                <button
                  onClick={handleExportExcel}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" /> Export Excel
                </button>
              </div>

              {/* Option 3: Email Send */}
              <div className="glass-card p-10 rounded-3xl border border-white/20 dark:border-white/10 text-center shadow-xl hover:shadow-2xl transition-all group">
                <div className="w-20 h-20 bg-secondary-50 dark:bg-secondary-900/20 rounded-2xl flex items-center justify-center text-secondary-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Send className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">Distribute via Email</h4>
                <p className="text-sm text-muted-foreground mb-8">Send all generated payslips to employee emails automatically.</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendEmails();
                  }}
                  disabled={sendingEmails || !payslipsGenerated}
                  className="w-full py-4 bg-secondary-600 hover:bg-secondary-700 text-white rounded-2xl font-bold shadow-lg shadow-secondary-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {sendingEmails ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {sendingEmails ? 'Sending Emails...' : 'Send All Emails'}
                </button>
              </div>
            </div>

            <div className="flex justify-center mt-12">
              <button
                onClick={() => window.location.href = '/payroll-compliance/dashboard'}
                className="px-8 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-foreground rounded-2xl font-bold transition-all border border-transparent hover:border-gray-300"
              >
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        );


      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <Breadcrumb
          items={[
            { label: "Payroll Compliance", href: "/payroll-compliance" },
            { label: "Payroll Processing", href: "/payroll-compliance/payroll-processing" },
          ]}
        />

        {(!isPayrollAdmin && isHRFinance) ? (
          // HR AND FINANCE VIEW
          currentStep === 6 && payrollRun ? (
            <div className="space-y-8">
              <div className="flex justify-start mb-4">
                <button
                  onClick={() => {
                    setPayrollRun(null);
                    setPayrollRunId(null);
                    setCurrentStep(1);
                  }}
                  className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-border shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Approvals
                </button>
              </div>
              <motion.div
                key="approval-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </div>
          ) : (
            <PayrollApprovalList />
          )
        ) : (
          // PAYROLL ADMIN VIEW (Wizard)
          <>
            <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden relative">
              <div className="flex items-center justify-between min-w-[600px] px-2">
                {workflowSteps.map((step, index) => {
                  const status = getStepStatus(step.id);
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center relative z-10 group">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => status !== "pending" && updateCurrentStep(step.id)}
                        disabled={status === 'pending'}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm border-2 ${status === 'completed' ? 'bg-primary-600 border-primary-600 text-white' :
                          status === 'current' ? 'bg-white dark:bg-gray-800 border-primary-500 text-primary-600 scale-110 shadow-lg shadow-primary-500/20' :
                            'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                          }`}
                      >
                        {status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                      </motion.button>
                      <span className={`text-xs font-bold mt-2 transition-colors ${status === 'current' ? 'text-primary-600' :
                        status === 'completed' ? 'text-primary-600' : 'text-muted-foreground'
                        }`}>
                        {step.label}
                      </span>
                      {index < workflowSteps.length - 1 && (
                        <div className={`absolute top-6 left-1/2 w-[calc(100%_+_2rem)] h-0.5 -z-10 -translate-y-1/2 ${getStepStatus(workflowSteps[index + 1].id) !== 'pending'
                          ? 'bg-primary-500'
                          : 'bg-gray-200 dark:bg-gray-800'
                          }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* Payslips Modal */}
        <AnimatePresence>
          {showPayslipsModal && (
            <PayslipsModal
              employeeList={employeeList}
              payrollData={{ ...payrollData, id: payrollRunId }}
              payslipsGenerated={payslipsGenerated}
              onClose={() => setShowPayslipsModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
