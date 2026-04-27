"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, Loader2, PlusCircle, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import SalaryStructureList from "../components/SalaryStructureList";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";

export default function SalaryStructureCtcPage() {
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    search: "",
    status: "ALL"
  });

  const handleExportExcel = () => {
    // Create CSV content
    const headers = ['Employee Name', 'Employee ID', 'Effective Date', 'ANNUAL BASE CTC', 'Monthly CTC', 'Annual CTC', 'Frequency', 'Status'];
    
    const csvContent = [
      headers.join(','),
      ...salaryStructures.map(structure => {
        const employeeName = structure.employee?.firstName || structure.employee?.lastName
          ? `${structure.employee.firstName || ""} ${structure.employee.lastName || ""}`.trim()
          : structure.employee_name || "";
        const employeeId = structure.employee_id || structure.employee?.employeeId || "";
        const effectiveDate = new Date(structure.effective_date || structure.effectiveDate).toLocaleDateString();
        const basicSalary = parseFloat(structure.basic_salary ?? structure.basicSalary ?? 0).toLocaleString();
        const monthlyCTC = parseFloat(structure.monthlyCTC ?? structure.monthly_ctc ?? structure.totalCTC ?? structure.total_ctc ?? 0).toLocaleString();
        const annualCTC = parseFloat(structure.annualCTC ?? structure.annual_ctc ?? 0).toLocaleString();
        
        return [
          `"${employeeName}"`,
          `"${employeeId}"`,
          `"${effectiveDate}"`,
          `"${basicSalary}"`,
          `"${monthlyCTC}"`,
          `"${annualCTC}"`,
          `"${structure.frequency || ""}"`,
          `"${structure.status || ""}"`
        ].join(',');
      })
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `salary_structures_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Salary structures exported successfully");
  };

  const fetchSalaryStructures = async () => {
    try {
      setLoading(true);
      const response = await payrollSalaryStructureService.getAllSalaryStructures({ 
        limit: pagination.limit, 
        page: pagination.currentPage,
        search: pagination.search,
        status: pagination.status === "ALL" ? undefined : pagination.status
      });
      
      const resData = response.data || response;
      const mainData = resData.data || resData;
      const structures = mainData.salaryStructures || (Array.isArray(mainData) ? mainData : []);
      const meta = mainData.pagination || mainData.meta || resData.pagination || resData.meta || {};

      setSalaryStructures(Array.isArray(structures) ? structures : []);
      if (meta.totalPages) {
        setPagination(prev => ({
          ...prev,
          totalPages: meta.totalPages,
          totalItems: meta.totalItems || structures.length
        }));
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch salary structures");
      setSalaryStructures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryStructures();
  }, [pagination.currentPage, pagination.limit, pagination.search, pagination.status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            CTC Structures
          </h3>
          <p className="text-sm text-muted-foreground">
            Define modular CTC templates for different bands and roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            <Download size={16} />
            Export Data
          </motion.button>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/payroll-compliance/salary-structure/ctc/new"
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Create New Structure
            </Link>
          </motion.div>
        </div>
      </div>

      <SalaryStructureList
        structures={salaryStructures}
        loading={loading}
        onStructureUpdated={fetchSalaryStructures}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
        onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, currentPage: 1 }))}
        onSearchChange={(search) => setPagination(prev => ({ ...prev, search, currentPage: 1 }))}
        onStatusChange={(status) => setPagination(prev => ({ ...prev, status, currentPage: 1 }))}
      />

    </div>
  );
}
