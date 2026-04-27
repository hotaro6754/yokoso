"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calculator, CheckCircle2, Clock } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import PendingSettlementsTab from "./components/PendingSettlementsTab";
import CalculateSettlementTab from "./components/CalculateSettlementTab";
import ClearedSettlementsTab from "./components/ClearedSettlementsTab";
import { fullFinalSettlementService } from "@/services/payroll-role-services/full-final-settlement.service";
import { employeeService } from "@/services/hr-services/employeeService";

const tabs = [
  { id: "pending", label: "Pending Settlements", icon: Clock },
  { id: "calculate", label: "Calculate Settlement", icon: Calculator },
  { id: "cleared", label: "Cleared Settlements", icon: CheckCircle2 },
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

export default function FullFinalSettlementPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [calculationData, setCalculationData] = useState(null);

  const fetchEmployees = useCallback(async (query = "") => {
    try {
      setLoading(true);
      // Removed strict "ACTIVE" status filter to allow finding resigned/terminating employees
      const response = await employeeService.getAllEmployees({
        page: 1,
        limit: query ? 50 : 100,
        search: query || ""
      });
      // Extract the actual array from the standard backend response structure
      const list = response.data?.data || response.data || response.employees || [];
      const normalized = (Array.isArray(list) ? list : []).map((emp) => ({
        id: emp.employee?.id || emp.id,
        name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || "Unknown",
        employeeId: emp.employeeId || emp.employee_code || emp.employee?.employeeId || "N/A",
        department: emp.department?.name || emp.department || "N/A",
        email: emp.email || "",
        profileImage: emp.profileImage || emp.employee?.profileImage || null,
        lastWorkingDate: emp.lastWorkingDate || emp.employee?.lastWorkingDate || null
      }));
      setEmployees(normalized);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error(error.message || "Failed to fetch employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true);
      const response =
        activeTab === "cleared"
          ? await fullFinalSettlementService.getClearedSettlements()
          : await fullFinalSettlementService.getPendingSettlements();
      const list = response.data || response?.data?.data || response || [];
      const normalized = (Array.isArray(list) ? list : []).map((item) => ({
        id: item.id,
        employee: {
          id: item.employee?.id,
          name: item.employee?.name || item.employee?.fullName || "Unknown",
          employeeId: item.employee?.employeeId || item.employee?.employee_id || "N/A",
          department: item.employee?.department || item.employee?.department?.name || "N/A",
          profileImage: item.employee?.profileImage || null
        },
        resignationDate: item.resignationDate,
        lastWorkingDate: item.lastWorkingDate,
        status: item.status || "PENDING",
        clearanceStatus: item.clearanceStatus || item.status || "PENDING",
        totalSettlement: Number(item.totalSettlement || 0),
        finalSettlementDate: item.finalSettlementDate || null
      }));
      setSettlements(normalized);
    } catch (error) {
      console.error("Error fetching settlements:", error);
      toast.error(error.message || "Failed to fetch settlements");
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "pending" || activeTab === "cleared") {
      fetchSettlements();
    } else if (activeTab === "calculate") {
      fetchEmployees("");
    }
  }, [activeTab, fetchSettlements, fetchEmployees]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchEmployees(query);
  };

  const resetCalculation = () => {
    setCalculationData(null);
  };

  const handleCalculateSettlement = async () => {
    if (!selectedEmployee?.id) {
      toast.error("Please select an employee first");
      return;
    }

    try {
      setCalculating(true);
      const response = await fullFinalSettlementService.calculateSettlement({
        employeeId: Number(selectedEmployee.id),
        lastWorkingDate: selectedEmployee.lastWorkingDate || undefined
      });
      const result = response.data || response?.data?.data || response;
      const components = result?.components || {};

      setCalculationData({
        earnings: {
          pendingSalary: Number(components.lastMonthSalary || 0),
          leaveEncashment: Number(components.leaveEncashment || 0),
          gratuity: Number(components.gratuity || 0),
          bonus: Number(components.bonus || 0),
          totalEarnings: Number(result?.totalEarnings || 0),
        },
        deductions: {
          noticePayRecovery: Number(components.noticePayRecovery || 0),
          advanceRecovery: 0,
          loanDeduction: 0,
          otherDeductions: Number(components.deductions || 0),
          totalDeductions: Number(result?.totalDeductions || 0),
        },
        netSettlement: Number(result?.totalSettlement || 0),
      });

      toast.success(response?.message || "Settlement calculated successfully");
    } catch (error) {
      console.error("Error calculating settlement:", error);
      toast.error(error.message || "Failed to calculate settlement");
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
      currencyDisplay: "symbol",
    }).format(amount);
    return formatted;
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: {
        label: "Pending",
        className: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      },
      IN_PROGRESS: {
        label: "In Progress",
        className: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 border-primary-200 dark:border-primary-800",
      },
      COMPLETED: {
        label: "Completed",
        className: "text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800",
      },
      ON_HOLD: {
        label: "On Hold",
        className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
      },
    };
    const statusConfig = config[status] || config.PENDING;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.className}`}>
        {statusConfig.label}
      </span>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "pending":
        return (
          <PendingSettlementsTab
            settlements={settlements.filter((s) => s.status !== "COMPLETED")}
            loading={loading}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
            onProcess={(entry) => {
              setSelectedEmployee({
                id: entry.employee.id,
                name: entry.employee.name,
                employeeId: entry.employee.employeeId,
                department: entry.employee.department,
                lastWorkingDate: entry.lastWorkingDate,
                profileImage: entry.employee.profileImage
              });
              setActiveTab("calculate");
              setSearchQuery(entry.employee.name);
            }}
          />
        );
      case "calculate":
        return (
          <CalculateSettlementTab
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            employees={employees}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            formatCurrency={formatCurrency}
            calculating={calculating}
            calculationData={calculationData}
            onCalculate={handleCalculateSettlement}
            onResetCalculation={resetCalculation}
          />
        );
      case "cleared":
        return (
          <ClearedSettlementsTab
            settlements={settlements.filter((s) => s.status === "COMPLETED")}
            loading={loading}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb />

      <motion.div
        className="space-y-6 mt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Tabs */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
        >
          <div className="flex flex-wrap gap-4 p-6 border-b border-gray-100 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-200 border ${isActive
                    ? "text-primary-700 bg-primary-50 border-primary-200 dark:bg-primary-500/10 dark:text-primary-300 dark:border-primary-500/20"
                    : "text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                >
                  <Icon size={18} className={isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-8 bg-white dark:bg-gray-800 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
