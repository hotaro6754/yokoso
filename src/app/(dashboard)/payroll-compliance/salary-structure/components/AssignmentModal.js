"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Users, Calendar, Search, CheckSquare, Square } from "lucide-react";
import { toast } from "react-hot-toast";
import { employeeService } from "@/services/hr-services/employeeService";
import { departmentService } from "@/services/hr-services/departmentService";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import { salaryTemplateService } from "@/services/payroll-role-services/salary-templates.service";
import DatePicker from "@/components/common/DatePicker";

export default function AssignmentModal({ isOpen, onClose, onSuccess, editData = null, renderAsPage = false }) {
  const [formData, setFormData] = useState({
    assignment_type: "individual", // only individual
    employee_ids: [],
    salary_template_id: "",
    effective_date: "",
    end_date: "",
    status: "ACTIVE",
    notes: "",
    company_id: ""
  });

  const [companyId, setCompanyId] = useState("");

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [salaryTemplates, setSalaryTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const effectiveDateRef = useRef(null);
  const endDateRef = useRef(null);

  const initialFormData = useMemo(() => ({
    assignment_type: "individual",
    employee_ids: [],
    salary_template_id: "",
    effective_date: "",
    end_date: "",
    status: "ACTIVE",
    notes: "",
    company_id: ""
  }), []);

  const uniqueSalaryTemplates = useMemo(() => {
    const uniqueMap = new Map();
    salaryTemplates.forEach((template) => {
      const label = template.templateName || template.name;
      if (!label) return;
      if (!uniqueMap.has(label)) {
        uniqueMap.set(label, template);
      }
    });
    return Array.from(uniqueMap.values());
  }, [salaryTemplates]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setSelectedEmployees([]);
      setSearchTerm("");
      return;
    }

    if (editData) {
      setFormData(editData);
      if (editData.employee_ids) {
        setSelectedEmployees(editData.employee_ids);
      }
    } else {
      setFormData(initialFormData);
      setSelectedEmployees([]);
    }

    fetchData();
  }, [editData, initialFormData, isOpen]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [employeesRes, templatesRes] = await Promise.all([
        employeeService.getAllEmployees({ limit: 100, page: 1 }),
        salaryTemplateService.getTemplates()
      ]);

      setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);
      const templates = templatesRes.data?.data || templatesRes.data || [];
      setSalaryTemplates(Array.isArray(templates) ? templates : []);
      
      // Get company ID from first employee or localStorage
      const storedCompanyId = localStorage.getItem('companyId');
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
        setFormData(prev => ({ ...prev, company_id: storedCompanyId }));
      } else if (employeesRes.data && employeesRes.data.length > 0) {
        const firstEmployeeCompanyId = employeesRes.data[0]?.companyId;
        if (firstEmployeeCompanyId) {
          setCompanyId(String(firstEmployeeCompanyId));
          setFormData(prev => ({ ...prev, company_id: String(firstEmployeeCompanyId) }));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Failed to fetch assignment data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelect = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    } else {
      setSelectedEmployees(prev => [...prev, employeeId]);
    }
  };

  const handleDepartmentSelect = (departmentId) => {
    setFormData(prev => {
      const isSelected = prev.department_ids.includes(departmentId);
      return {
        ...prev,
        department_ids: isSelected
          ? prev.department_ids.filter(id => id !== departmentId)
          : [...prev.department_ids, departmentId]
      };
    });
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const openDatePicker = (ref) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === "function") {
        ref.current.showPicker();
      } else {
        ref.current.focus();
        ref.current.click();
      }
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const name = `${employee.firstName || ""} ${employee.lastName || ""}`.trim().toLowerCase();
    const employeeId = String(employee.employeeId || "").toLowerCase();
    const departmentName = employee.department?.name?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      employeeId.includes(searchTerm.toLowerCase()) ||
      departmentName.includes(searchTerm.toLowerCase())
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.salary_template_id || !formData.effective_date || !companyId) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (formData.assignment_type === "individual" && selectedEmployees.length === 0) {
        toast.error("Please select at least one employee");
        setLoading(false);
        return;
      }


      const selectedTemplate = salaryTemplates.find(
        (template) => String(template.id) === String(formData.salary_template_id)
      );

      if (!selectedTemplate) {
        toast.error("Selected salary template not found");
        setLoading(false);
        return;
      }

      const resolveAllowances = (value) => {
        if (!value) return {};
        if (Array.isArray(value)) {
          return value.reduce((acc, item) => {
            if (!item?.name) return acc;
            const amount = parseFloat(item.amount);
            acc[item.name] = Number.isNaN(amount) ? 0 : amount;
            return acc;
          }, {});
        }
        if (typeof value === "object") return value;
        return {};
      };

      // Calculate salary components from template
      const calculateSalaryFromTemplate = (template) => {
        const components = template.components || [];
        let basicSalary = 0;
        let hra = 0;
        let conveyance = 0;
        let medical = 0;
        let specialAllowance = 0;
        let pf = 0;
        let pt = 0;
        let tds = 0;
        let totalCTC = 0;
        const otherAllowances = {};
        const deductions = {};

        // Process template components
        components.forEach((tc) => {
          const comp = tc.component;
          if (!comp) return;

          let value = tc.overrideValue !== null ? tc.overrideValue : comp.value;
          const calcType = tc.overrideCalculationType || comp.calculationType;
          const name = comp.name?.toLowerCase();

          // For now, use fixed values since we don't have annual CTC
          if (calcType === "PERCENTAGE_OF_CTC") {
            // Default monthly CTC for calculation
            const defaultMonthlyCTC = 50000; // Default fallback
            value = Math.round((value / 100) * defaultMonthlyCTC);
          } else if (calcType === "PERCENTAGE_OF_BASIC" && basicSalary > 0) {
            value = Math.round((value / 100) * basicSalary);
          }

          // Apply maxAmount cap if defined
          if (comp.maxAmount && value > comp.maxAmount) {
            value = comp.maxAmount;
          }

          // Map components to salary fields
          if (name?.includes("basic")) {
            basicSalary = value;
          } else if (name === "hra") {
            hra = value;
          } else if (name?.includes("pf") && comp.type === "DEDUCTION") {
            pf = value;
          } else if (name?.includes("professional tax") || name === "pt") {
            pt = value;
          } else if (name?.includes("income tax") || name === "tds") {
            tds = value;
          } else if (name === "special allowance") {
            specialAllowance = value;
          } else if (comp.type === "EARNING") {
            otherAllowances[comp.name] = value;
          } else if (comp.type === "DEDUCTION") {
            deductions[comp.name] = value;
          }
        });

        // Calculate total CTC and special allowance as balancing component
        const earningsTotal = basicSalary + hra + Object.values(otherAllowances).reduce((sum, val) => sum + val, 0);
        const deductionsTotal = pf + pt + tds + Object.values(deductions).reduce((sum, val) => sum + val, 0);
        const defaultMonthlyCTC = 50000; // Default fallback
        
        if (!specialAllowance) {
          specialAllowance = Math.max(0, defaultMonthlyCTC - earningsTotal - deductionsTotal);
        }
        
        totalCTC = earningsTotal + specialAllowance;

        return {
          basicSalary,
          hra,
          conveyance,
          medical,
          specialAllowance,
          pf,
          pt,
          tds,
          totalCTC,
          otherAllowances,
          deductions
        };
      };

      const salaryComponents = calculateSalaryFromTemplate(selectedTemplate);

      // Base payload fields from template with calculated values
      const basePayload = {
        name: selectedTemplate.templateName || selectedTemplate.name || "Salary Structure",
        effectiveDate: formData.effective_date,
        basicSalary: salaryComponents.basicSalary || 10000, // Default fallback
        hra: salaryComponents.hra || 0,
        conveyance: salaryComponents.conveyance || 0,
        medical: salaryComponents.medical || 0,
        specialAllowance: salaryComponents.specialAllowance || 0,
        pf: salaryComponents.pf || 0,
        pt: salaryComponents.pt || 0,
        tds: salaryComponents.tds || 0,
        totalCTC: salaryComponents.totalCTC || 0,
        otherAllowances: salaryComponents.otherAllowances || {},
        deductions: salaryComponents.deductions || {},
        frequency: "MONTHLY",
        status: formData.status,
        notes: formData.notes || "",
        salaryTemplateId: selectedTemplate.id,
        companyId: companyId || formData.company_id
      };

      let targetEmployees = selectedEmployees;

      console.log("Preparing assignments for:", targetEmployees);

      const results = await Promise.allSettled(
        targetEmployees.map((employeeId) => {
          const finalPayload = {
            ...basePayload,
            employeeId: Number(employeeId),
            companyId: companyId || formData.company_id
          };


          // Otherwise, creating new assignment(s)
          console.log("Creating structure for employee:", employeeId, finalPayload);
          return payrollSalaryStructureService.createSalaryStructure(finalPayload);
        })
      );

      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length) {
        console.error("Submission failures:", failures);
        const firstError = failures[0].reason?.message || "Internal Server Error";

        if (firstError.includes("already exists")) {
          toast.error("Process stopped: A salary structure already exists for " +
            (targetEmployees.length > 1 ? "one of the employees" : "this employee") +
            " on this effective date.");
        } else {
          toast.error(firstError);
        }
      } else {
        toast.success(editData ? "Assignment updated successfully!" : "Assignment created successfully!");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error.message || "Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editData ? "Edit Assignment" : "Assign Salary Template"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Assign salary templates to individual employees
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignment Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assignment Configuration
            </h3>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salary Template *
              </label>
              <select
                name="salary_template_id"
                value={formData.salary_template_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                required
              >
                <option value="">Select Salary Template</option>
                {uniqueSalaryTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.templateName || template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Effective Date *
                </label>
                <DatePicker
                  name="effective_date"
                  value={formData.effective_date}
                  onChange={(e) => handleInputChange({ target: { name: 'effective_date', value: e.target.value } })}
                  required
                  placeholder="Select effective date"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date (Optional)
                </label>
                <DatePicker
                  name="end_date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange({ target: { name: 'end_date', value: e.target.value } })}
                  placeholder="Select end date"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Additional notes about this assignment..."
              />
            </div>
          </div>

          {/* Employee/Department Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Select Employees
            </h3>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                />
              </div>

              {/* Select All */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={handleSelectAllEmployees}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">
                    {selectedEmployees.length} of {filteredEmployees.length} selected
                  </span>
                </label>
              </div>

              {/* Employee List */}
              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                {filteredEmployees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleEmployeeSelect(employee.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {`${employee.firstName || ""} ${employee.lastName || ""}`.trim()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {employee.employeeId} • {employee.department?.name || "N/A"} • {employee.designation?.name || "N/A"}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : (editData ? "Update Assignment" : "Create Assignment")}
          </button>
        </div>
      </form>
    </>
  );

  if (renderAsPage) {
    return (
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden">
        {content}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {content}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
