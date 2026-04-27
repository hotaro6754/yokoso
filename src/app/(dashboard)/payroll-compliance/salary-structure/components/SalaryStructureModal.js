"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Calculator, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import { employeeService } from "@/services/hr-services/employeeService";
import { salaryTemplateService } from "@/services/payroll-role-services/salary-templates.service";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import DatePicker from "@/components/common/DatePicker";

export default function SalaryStructureModal({
  isOpen,
  onClose,
  onSuccess,
  editData = null,
  renderAsPage = false,
}) {
  const isEditMode = Boolean(editData?.id);
  const initialFormData = useMemo(
    () => ({

      employee_id: "",
      effective_date: "",
      annual_ctc: "",
      basic_salary: "",
      hra: "",
      conveyance: "",
      medical: "",
      special_allowance: "",
      pf: "",
      pt: 200, // Default Professional Tax
      tds: "",
      other_allowances: [],
      deductions: [],
      total_ctc: "",
      frequency: "MONTHLY",
      status: "ACTIVE",
      notes: "",
      company_id: "",
      salary_template_id: "",
    }),
    [],
  );

  const [formData, setFormData] = useState(initialFormData);
  const [otherAllowance, setOtherAllowance] = useState({
    name: "",
    amount: "",
  });
  const [deduction, setDeduction] = useState({ name: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);

  const prevIsOpenRef = useRef(false);
  const lastAppliedEditKeyRef = useRef(null);
  const [taxRegime, setTaxRegime] = useState("FY25_26"); // "FY25_26" | "FY24_25"
  const editKey = editData?.id ?? null;

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        if (lastAppliedEditKeyRef.current !== editKey) {
          // Helper to convert object {name: value} to array [{name, amount}]
          const mapToArr = (obj) => {
            if (!obj || typeof obj !== "object") return [];
            if (Array.isArray(obj)) return obj;
            return Object.entries(obj).map(([name, amount]) => ({
              name,
              amount,
            }));
          };

          setFormData({
            ...initialFormData,

            employee_id:
              editData.employee_id ||
              editData.employeeId ||
              editData.employee?.id ||
              "",
            effective_date:
              editData.effective_date ??
              editData.effectiveDate?.split("T")[0] ??
              "",
            annual_ctc: editData.annual_ctc ?? editData.annualCTC ?? "",
            total_ctc:
              editData.total_ctc ??
              editData.totalCTC ??
              editData.monthlyCTC ??
              "",
            basic_salary: editData.basic_salary ?? editData.basicSalary ?? "",
            hra: editData.hra || "",
            conveyance: editData.conveyance || 0,
            medical: editData.medical || 0,
            special_allowance:
              editData.special_allowance ?? editData.specialAllowance ?? "",
            pf: editData.pf || 0,
            pt: editData.pt || 200,
            tds: editData.tds || 0,
            status: editData.status || "ACTIVE",
            notes: editData.notes || "",
            frequency: editData.frequency || "MONTHLY",
            other_allowances: mapToArr(
              editData.other_allowances ?? editData.otherAllowances,
            ),
            deductions: mapToArr(editData.deductions),
            salary_template_id:
              editData.salary_template_id ?? editData.salaryTemplateId ?? "",
          });
          setTaxRegime(editData.tax_regime ?? editData.taxRegime ?? "FY25_26");

          lastAppliedEditKeyRef.current = editKey;
        }
      } else {
        const today = new Date().toISOString().split("T")[0];
        setFormData({ ...initialFormData, effective_date: today });
        setOtherAllowance({ name: "", amount: "" });
        setDeduction({ name: "", amount: "" });
        lastAppliedEditKeyRef.current = null;
      }
    } else if (prevIsOpenRef.current) {
      setFormData(initialFormData);
      setOtherAllowance({ name: "", amount: "" });
      setDeduction({ name: "", amount: "" });
      setTaxRegime("FY25_26");
      lastAppliedEditKeyRef.current = null;
    }

    prevIsOpenRef.current = isOpen;
  }, [editData, editKey, initialFormData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await employeeService.getAllEmployees({
          limit: 1000,
          page: 1,
        });
        const employeesData =
          response.data?.employees ||
          response.data?.data ||
          response.data ||
          [];
        const formattedEmployees = (Array.isArray(employeesData) ? employeesData : []).map((emp) => {
          if (emp.employee) {
            return {
              ...emp.employee,
              email: emp.email, // Use official email from user record
              firstName: emp.firstName || emp.employee.firstName,
              lastName: emp.lastName || emp.employee.lastName,
            };
          }
          return emp;
        });

        // Ensure the current employee from editData is in the list
        if (editData && (editData.employee || editData.employeeId)) {
          const currentEmpId = editData.employee?.id || editData.employeeId;
          const exists = formattedEmployees.find(e => e.id === currentEmpId);
          
          if (!exists && editData.employee) {
            formattedEmployees.push({
              ...editData.employee,
              id: editData.employee.id || editData.employeeId,
              firstName: editData.employee.firstName || editData.firstName,
              lastName: editData.employee.lastName || editData.lastName,
            });
          }
        }

        setEmployees(formattedEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error(error.message || "Failed to load employees");
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const response = await salaryTemplateService.getTemplates();
        const data = response.data?.data || response.data || [];
        setTemplates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchEmployees();
    fetchTemplates();
  }, [isOpen]);

  // Auto-calculate TDS based on Annual CTC
  useEffect(() => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const conveyance = parseFloat(formData.conveyance) || 0;
    const medical = parseFloat(formData.medical) || 0;
    const special = parseFloat(formData.special_allowance) || 0;
    const otherTotal = formData.other_allowances.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0,
    );
    const grossEarnings =
      basic + hra + conveyance + medical + special + otherTotal;
    const pf = parseFloat(formData.pf) || 0;
    const totalCTC = grossEarnings + pf;
    const annualCTC = totalCTC * 12;
    // const annualTaxableIncome = grossEarnings * 12;
    const annualTaxableIncome = parseFloat(formData.annual_ctc) || 0;

    let computedTDS = 0;

    if (taxRegime === "FY25_26") {
      const annualTaxableIncome = parseFloat(formData.annual_ctc) || 0;

      if (annualTaxableIncome) {
        let taxableIncome = annualTaxableIncome - 75000;

        let tax = 0;

        // ✅ Rebate check
        if (taxableIncome <= 1200000) {
          tax = 0;
        } else {
          let taxable = taxableIncome;

          if (taxable > 2400000) {
            tax += (taxable - 2400000) * 0.3;
            taxable = 2400000;
          }
          if (taxable > 2000000) {
            tax += (taxable - 2000000) * 0.25;
            taxable = 2000000;
          }
          if (taxable > 1600000) {
            tax += (taxable - 1600000) * 0.2;
            taxable = 1600000;
          }
          if (taxable > 1200000) {
            tax += (taxable - 1200000) * 0.15;
            taxable = 1200000;
          }
          if (taxable > 800000) {
            tax += (taxable - 800000) * 0.1;
            taxable = 800000;
          }
          if (taxable > 400000) {
            tax += (taxable - 400000) * 0.05;
            taxable = 400000;
          }
        }

        const totalTax = tax * 1.04;
        computedTDS = Math.round(totalTax / 12);
      }
    } else if (taxRegime === "FY24_25") {
      // const annualTaxableIncome = grossEarnings * 12;
      const annualTaxableIncome = parseFloat(formData.annual_ctc) || 0;

      if (annualTaxableIncome) {
        // Step 1: Standard deduction
        let taxableIncome = annualTaxableIncome - 50000;
        let tax = 0;

        // Step 2: Rebate check
        if (taxableIncome <= 500000) {
          tax = 0;
        } else {
          let taxable = taxableIncome;

          if (taxable > 1000000) {
            tax += (taxable - 1000000) * 0.3;
            taxable = 1000000;
          }
          if (taxable > 500000) {
            tax += (taxable - 500000) * 0.2;
            taxable = 500000;
          }
          if (taxable > 250000) {
            tax += (taxable - 250000) * 0.05;
            taxable = 250000;
          }
        }

        // Step 3: Add 4% cess
        let totalTax = tax * 1.04;

        // Step 4: Monthly TDS
        computedTDS = Math.round(totalTax / 12);
      }
    }

    setFormData((prev) => {
      if (prev.tds !== computedTDS) {
        return { ...prev, tds: computedTDS };
      }
      return prev;
    });
  }, [
    formData.basic_salary,
    formData.hra,
    formData.conveyance,
    formData.medical,
    formData.special_allowance,
    formData.other_allowances,
    formData.pf,
    taxRegime,
  ]);

  const calculatedValues = useMemo(() => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const conveyance = parseFloat(formData.conveyance) || 0;
    const medical = parseFloat(formData.medical) || 0;
    const special = parseFloat(formData.special_allowance) || 0;
    const otherTotal = formData.other_allowances.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0,
    );

    const grossEarnings =
      basic + hra + conveyance + medical + special + otherTotal;

    // Statutory deductions/contributions
    const pf = parseFloat(formData.pf) || 0;
    const pt = parseFloat(formData.pt) || 0;
    const tds = parseFloat(formData.tds) || 0;

    // ESIC Rule: 4% of BASIC salary if BASIC <= 21,000 (As per user request)
    const esic = basic <= 21000 ? Math.ceil(basic * 0.04) : 0;
    const employerEsic = 0; // Handled within the 4% or not specified separately by user

    // Other deductions
    const otherDeductions = formData.deductions.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0,
    );

    const annualCTC = parseFloat(formData.annual_ctc) || 0;
    const monthlyCTC = annualCTC > 0 ? annualCTC / 12 : grossEarnings + pf;

    // Net Pay calculation:
    // User formula: monthlyCTC - EmployerPF - EmployeePF - PT
    // We assume formData.pf is the base PF amount for both shares
    const netPay = monthlyCTC - (pf * 2) - esic - pt - tds - otherDeductions;

    return {
      gross: Math.round(monthlyCTC), // Monthly CTC = Annual CTC ÷ 12
      net: Math.round(netPay),
      esic,
      employerEsic,
      pt,
      tds,
    };
  }, [
    formData.basic_salary,
    formData.hra,
    formData.conveyance,
    formData.medical,
    formData.special_allowance,
    formData.other_allowances,
    formData.deductions,
    formData.pf,
    formData.pt,
    formData.tds,
    formData.annual_ctc,
  ]);

  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setFormData((prev) => ({ ...prev, salary_template_id: templateId }));

    if (!templateId) {
      setSelectedTemplateData(null);
      return;
    }

    try {
      setLoading(true);
      const response = await salaryTemplateService.getTemplateById(templateId);
      const template = response.data?.data || response.data;
      if (!template) return;

      // Map template components to formData fields
      // Sort components to process Basic first for percentage-of-basic calculations
      const components = [...(template.components || [])].sort((a, b) => {
        const nameA = (a.component?.name || "").toLowerCase();
        const nameB = (b.component?.name || "").toLowerCase();
        if (nameA.includes("basic")) return -1;
        if (nameB.includes("basic")) return 1;
        return 0;
      });
      const otherAllowances = [];
      const deductions = [];
      
      const newFormData = { 
        ...formData, 
        salary_template_id: templateId,
        // Reset base components if template might not include them all
        basic_salary: 0,
        hra: 0,
        pf: 0,
        special_allowance: 0,
      };

      const monthlyCTC = (parseFloat(formData.annual_ctc) || 0) / 12;

      components.forEach((tc) => {
        const comp = tc.component;
        if (!comp) return;

        let value = tc.overrideValue !== null ? tc.overrideValue : comp.value;
        const calcType = tc.overrideCalculationType || comp.calculationType;
        const name = comp.name.toLowerCase();

        // Handle percentage calculations if annual_ctc is available
        if (calcType === "PERCENTAGE_OF_CTC" && monthlyCTC > 0) {
          value = Math.round((value / 100) * monthlyCTC);
        } else if (calcType === "PERCENTAGE_OF_BASIC" && newFormData.basic_salary > 0) {
          value = Math.round((value / 100) * newFormData.basic_salary);
        }

        // Apply maxAmount cap if defined
        if (comp.maxAmount && value > comp.maxAmount) {
          value = comp.maxAmount;
        }

        // Apply eligibilityThreshold if defined (e.g., for ESIC)
        if (comp.eligibilityThreshold && newFormData.basic_salary > comp.eligibilityThreshold) {
          value = 0;
        }

        if (name.includes("basic")) {
          newFormData.basic_salary = value;
        } else if (name === "hra") {
          newFormData.hra = value;
        } else if (name.includes("pf") && comp.type === "DEDUCTION") {
          newFormData.pf = value;
        } else if (name.includes("professional tax") || name === "pt") {
          newFormData.pt = value;
        } else if (name.includes("income tax") || name === "tds") {
          newFormData.tds = value;
        } else if (name === "special allowance") {
          // Skip for now, will calculate at the end
          return;
        } else if (comp.type === "EARNING") {
          otherAllowances.push({ name: comp.name, amount: value });
        } else if (comp.type === "DEDUCTION") {
          deductions.push({ name: comp.name, amount: value });
        }
      });

      // Calculate Special Allowance as balancing component
      // We subtract all earnings AND statutory deductions (Employer + Employee shares) to find what's left for Special Allowance
      const deductionsTotal = (newFormData.pf * 2) + newFormData.pt + newFormData.tds + deductions.reduce((sum, item) => sum + item.amount, 0);
      const earningsTotal = newFormData.basic_salary + newFormData.hra + otherAllowances.reduce((sum, item) => sum + item.amount, 0);
      
      newFormData.special_allowance = Math.max(0, Math.round(monthlyCTC - earningsTotal - deductionsTotal));

      newFormData.other_allowances = otherAllowances;
      newFormData.deductions = deductions;

      setSelectedTemplateData(template);
      setFormData(newFormData);
      toast.success(`Template "${template.templateName}" applied`);
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Failed to load template details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = new Set([
      "employee_id",
      "annual_ctc",
      "basic_salary",
      "hra",
      "conveyance",
      "medical",
      "special_allowance",
      "pf",
      "pt",
      "tds",
    ]);

    if (numericFields.has(name)) {
      if (name === "annual_ctc") {
        let annualCTC = value === "" ? 0 : Number(value);

        // Check if we have a template selected to use its logic
        if (selectedTemplateData) {
          const components = [...(selectedTemplateData.components || [])].sort((a, b) => {
            const nameA = (a.component?.name || "").toLowerCase();
            const nameB = (b.component?.name || "").toLowerCase();
            if (nameA.includes("basic")) return -1;
            if (nameB.includes("basic")) return 1;
            return 0;
          });

          const otherAllowances = [];
          const deductions = [];
          const templateFormData = { 
            ...formData, 
            annual_ctc: annualCTC,
            basic_salary: 0,
            hra: 0,
            pf: 0,
            special_allowance: 0 
          };

          components.forEach((tc) => {
            const comp = tc.component;
            if (!comp) return;

            let val = tc.overrideValue !== null ? tc.overrideValue : comp.value;
            const calcType = tc.overrideCalculationType || comp.calculationType;
            const name = comp.name.toLowerCase();

            if (calcType === "PERCENTAGE_OF_CTC" && annualCTC > 0) {
              val = Math.round((val / 100) * (annualCTC / 12));
            } else if (calcType === "PERCENTAGE_OF_BASIC" && templateFormData.basic_salary > 0) {
              val = Math.round((val / 100) * templateFormData.basic_salary);
            }

            if (comp.maxAmount && val > comp.maxAmount) val = comp.maxAmount;
            if (comp.eligibilityThreshold && templateFormData.basic_salary > comp.eligibilityThreshold) val = 0;

            if (name.includes("basic")) {
              templateFormData.basic_salary = val;
            } else if (name === "hra") {
              templateFormData.hra = val;
            } else if (name.includes("pf") && comp.type === "DEDUCTION") {
              templateFormData.pf = val;
            } else if (name.includes("professional tax") || name === "pt") {
              templateFormData.pt = val;
            } else if (name.includes("income tax") || name === "tds") {
              templateFormData.tds = val;
            } else if (name === "special allowance") {
              return;
            } else if (comp.type === "EARNING") {
              otherAllowances.push({ name: comp.name, amount: val });
            } else if (comp.type === "DEDUCTION") {
              deductions.push({ name: comp.name, amount: val });
            }
          });

          const deductionsTotal = (templateFormData.pf * 2) + templateFormData.pt + templateFormData.tds + deductions.reduce((sum, item) => sum + item.amount, 0);
          const earningsTotal = templateFormData.basic_salary + templateFormData.hra + otherAllowances.reduce((sum, item) => sum + item.amount, 0);
          templateFormData.special_allowance = Math.max(0, Math.round((annualCTC / 12) - earningsTotal - deductionsTotal));
          templateFormData.other_allowances = otherAllowances;
          templateFormData.deductions = deductions;

          setFormData(templateFormData);
          return;
        }

        // Standard salary structure fallback (if no template)
        annualCTC = value === "" ? 0 : Number(value);
        const monthlyCTC = annualCTC / 12;

        // Standard salary structure breakdown (50% basic)
        const basicSalary = Math.round(monthlyCTC * 0.5);
        const hra = Math.round(basicSalary * 0.4);

        // PF calculation (12% of basic, max 1800) - This is a deduction from earnings
        let calculatedPf = Math.round(basicSalary * 0.12);
        if (calculatedPf > 1800) calculatedPf = 1800;

        const lta = annualCTC <= 240000 ? 0 : Math.round(basicSalary * 0.1);
        const telephone =
          annualCTC <= 600000 ? 0 : annualCTC <= 1000000 ? 3000 : 5000;
        const vehicle = annualCTC <= 1000000 ? 0 : 2700;

        // Special allowance should be what's left from monthly CTC after all earnings components and STATUTORY DEDUCTIONS
        // Subtract PF twice (Employer + Employee) and estimate PT (200)
        const estimatedDeductions = (calculatedPf * 2) + 200;
        const specialAllowance = Math.round(
          Math.max(
            0,
            monthlyCTC -
              (basicSalary + hra + lta + telephone + vehicle + estimatedDeductions),
          ),
        );

        const automatedAllowances = [
          { name: "Leave Travel Allowance (LTA)", amount: lta },
          { name: "Telephone Reimbursement", amount: telephone },
          { name: "Vehicle maintenance reimbursement", amount: vehicle },
        ].filter((a) => a.amount > 0);

        setFormData((prev) => {
          const customAllowances = prev.other_allowances.filter(
            (a) =>
              a.name !== "Leave Travel Allowance (LTA)" &&
              a.name !== "Telephone Reimbursement" &&
              a.name !== "Vehicle maintenance reimbursement",
          );
          return {
            ...prev,
            annual_ctc: value === "" ? "" : annualCTC,
            basic_salary: basicSalary,
            hra: hra,
            conveyance: 0,
            medical: 0,
            special_allowance: specialAllowance > 0 ? specialAllowance : 0,
            pf: calculatedPf,
            other_allowances: [...customAllowances, ...automatedAllowances],
          };
        });
        return;
      }

      if (name === "basic_salary") {
        const basicVal = value === "" ? 0 : Number(value);
        
        // If template is active, we don't auto-calculate others based on basic unless the template says so
        if (selectedTemplateData) {
          setFormData(prev => ({ ...prev, basic_salary: value === "" ? "" : basicVal }));
          return;
        }

        const monthlyFixedCtc = basicVal * 2;
        const annualFixedCtc = monthlyFixedCtc * 12;

        const hra = Math.round(basicVal * 0.4);
        const lta = annualFixedCtc <= 240000 ? 0 : Math.round(basicVal * 0.1);
        const telephone =
          annualFixedCtc <= 600000
            ? 0
            : annualFixedCtc <= 1000000
              ? 3000
              : 5000;
        const vehicle = annualFixedCtc <= 1000000 ? 0 : 2700;

        let calculatedPf = Math.round(basicVal * 0.12);
        if (calculatedPf > 1800) calculatedPf = 1800;

        const estimatedDeductions = (calculatedPf * 2) + 200;
        const specialAllowance = Math.round(
          monthlyFixedCtc -
            (basicVal + hra + lta + telephone + vehicle + estimatedDeductions),
        );

        const automatedAllowances = [
          { name: "Leave Travel Allowance (LTA)", amount: lta },
          { name: "Telephone Reimbursement", amount: telephone },
          { name: "Vehicle maintenance reimbursement", amount: vehicle },
        ].filter((a) => a.amount > 0);

        setFormData((prev) => {
          const customAllowances = prev.other_allowances.filter(
            (a) =>
              a.name !== "Leave Travel Allowance (LTA)" &&
              a.name !== "Telephone Reimbursement" &&
              a.name !== "Vehicle maintenance reimbursement",
          );
          return {
            ...prev,
            annual_ctc: value === "" ? "" : annualFixedCtc,
            basic_salary: value === "" ? "" : basicVal,
            hra: hra,
            conveyance: 0,
            medical: 0,
            special_allowance: specialAllowance > 0 ? specialAllowance : 0,
            pf: calculatedPf,
            other_allowances: [...customAllowances, ...automatedAllowances],
          };
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addOtherAllowance = () => {
    if (otherAllowance.name && otherAllowance.amount) {
      setFormData((prev) => ({
        ...prev,
        other_allowances: [...prev.other_allowances, { ...otherAllowance }],
      }));
      setOtherAllowance({ name: "", amount: "" });
    }
  };

  const removeOtherAllowance = (index) => {
    setFormData((prev) => ({
      ...prev,
      other_allowances: prev.other_allowances.filter((_, i) => i !== index),
    }));
  };

  const updateOtherAllowance = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.other_allowances];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, other_allowances: updated };
    });
  };

  const addDeduction = () => {
    if (deduction.name && deduction.amount) {
      setFormData((prev) => ({
        ...prev,
        deductions: [...prev.deductions, { ...deduction }],
      }));
      setDeduction({ name: "", amount: "" });
    }
  };

  const removeDeduction = (index) => {
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index),
    }));
  };

  const updateDeduction = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.deductions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, deductions: updated };
    });
  };

  const buildPayload = () => {
    const pendingAllowance =
      otherAllowance?.name && otherAllowance?.amount
        ? [{ ...otherAllowance }]
        : [];
    const pendingDeduction =
      deduction?.name && deduction?.amount ? [{ ...deduction }] : [];

    const mergedAllowances = [
      ...formData.other_allowances,
      ...pendingAllowance,
    ];
    const mergedDeductions = [...formData.deductions, ...pendingDeduction];

    const otherAllowances = mergedAllowances.reduce((acc, item) => {
      if (!item?.name) return acc;
      const amount = parseFloat(item.amount);
      acc[item.name] = Number.isNaN(amount) ? 0 : amount;
      return acc;
    }, {});

    const deductions = mergedDeductions.reduce((acc, item) => {
      if (!item?.name) return acc;
      const amount = parseFloat(item.amount);
      acc[item.name] = Number.isNaN(amount) ? 0 : amount;
      return acc;
    }, {});
    const employeeId =
      formData.employee_id === "" ? null : Number(formData.employee_id);
    const monthlyCTC = Math.round((parseFloat(formData.annual_ctc) || 0) / 12);
    const grossTotal = calculatedValues.gross;

    const payload = {

      employeeId,
      effectiveDate: formData.effective_date,
      annualCTC: parseFloat(formData.annual_ctc) || 0,
      basicSalary: parseFloat(formData.basic_salary) || 0,
      hra: parseFloat(formData.hra) || 0,
      conveyance: parseFloat(formData.conveyance) || 0,
      medical: parseFloat(formData.medical) || 0,
      specialAllowance: parseFloat(formData.special_allowance) || 0,
      pf: parseFloat(formData.pf) || 0,
      pt: parseFloat(formData.pt) || 0,
      tds: parseFloat(formData.tds) || 0,
      otherAllowances,
      deductions,
      monthlyCTC: monthlyCTC || grossTotal,
      grossSalary: grossTotal - (parseFloat(formData.pf) || 0),
      frequency: formData.frequency,
      status: formData.status,
      notes: formData.notes,
      taxRegime: taxRegime,
      salaryTemplateId: formData.salary_template_id || null,
    };

    console.log("Salary Structure Payload:", payload);
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = buildPayload();

      if (!payload.employeeId || Number.isNaN(payload.employeeId)) {
        throw new Error("Please provide a valid Employee ID");
      }

      let response;
      if (editData?.id) {
        response = await payrollSalaryStructureService.updateSalaryStructure(
          editData.id,
          payload,
        );
      } else {
        response =
          await payrollSalaryStructureService.createSalaryStructure(payload);
      }

      if (onSuccess) {
        onSuccess(response?.data || payload);
        toast.success(
          editData
            ? "Salary structure updated successfully!"
            : "Salary structure created successfully!",
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to save salary structure");
    } finally {
      setLoading(false);
    }
  };

  const formClassName = renderAsPage
    ? "p-6"
    : "p-6 overflow-y-auto max-h-[calc(90vh-200px)]";

  console.log("formData", formData);

  const content = (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editData ? "Edit Salary Structure" : "Create New Salary Structure"}{" "}
            Monthly
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Define compensation components and deductions
          </p>
        </div>
        {!renderAsPage && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className={formClassName}>
        {/* Tax Regime Selection */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Select Tax Regime For TDS Auto-Calculation
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="taxRegime"
                value="FY25_26"
                checked={taxRegime === "FY25_26"}
                onChange={() => setTaxRegime("FY25_26")}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                New Tax Regime (FY 25-26)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="taxRegime"
                value="FY24_25"
                checked={taxRegime === "FY24_25"}
                onChange={() => setTaxRegime("FY24_25")}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Old Tax Regime (FY 24-25)
              </span>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Section Headers */}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4" />
            Basic Information
          </h3>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {/* <Calculator className="w-4 h-4" />
            Earnings Components */}
          </h3>

          {/* Row 0: Template Selection */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Salary Template (Optional)
            </label>
            <select
              name="salary_template_id"
              value={formData.salary_template_id}
              onChange={handleTemplateChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
            >
              <option value="">
                {loadingTemplates ? "Loading templates..." : "Custom (No Template)"}
              </option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.templateName}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Select a template to pre-fill components
            </p>
          </div>
          <div className="hidden md:block"></div>



          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Annual CTC
            </label>
            <input
              type="number"
              name="annual_ctc"
              value={formData.annual_ctc}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
              placeholder="0.00"
              step="0.01"
            />
            <p className="text-xs text-gray-500">
              Enter annual CTC to auto-calculate salary components
            </p>
          </div>

          {/* Row 2: Employee ID & Basic */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Employee ID
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
              required
            >
              <option value="">
                {loadingEmployees ? "Loading employees..." : "Select Employee"}
              </option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName || employee.lastName
                    ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim()
                    : `Employee ${employee.id}`}{" "}
                  {employee.employeeId ? `(${employee.employeeId})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Basic (Monthly)
            </label>
            <input
              type="number"
              name="basic_salary"
              value={formData.basic_salary}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
              placeholder="0.00"
              step="0.01"
              required
            />
            <p className="text-xs text-gray-500">
              Or enter Monthly Basic to calculate manually
            </p>
          </div>

          {/* Row 3: Effective Date & HRA */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Effective Date
            </label>
            <DatePicker
              name="effective_date"
              value={formData.effective_date}
              onChange={(e) =>
                handleInputChange({
                  target: { name: "effective_date", value: e.target.value },
                })
              }
              required
              placeholder="Select effective date"
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              HRA (Monthly)
            </label>
            <input
              type="number"
              name="hra"
              value={formData.hra}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          {/* Row 4: Status & Special Allowance */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
            >
              <option value="ACTIVE">Active</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Special Allowance (Monthly)
            </label>
            <input
              type="number"
              name="special_allowance"
              value={formData.special_allowance}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        {/* Statutory Components */}
        <div className="mt-8 space-y-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
            Statutory Components
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Employer Provident Fund (Monthly)
              </label>
              <input
                type="number"
                name="pf"
                value={formData.pf}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                placeholder="0.00"
                step="0.01"
              />
              <p className="text-xs text-gray-500">
                Added to Total CTC (Company Contribution)
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Employee Provident Fund (Monthly)
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-sm h-[40px] flex items-center">
                ₹{formData.pf || 0}
              </div>
              <p className="text-xs text-gray-500">
                Deducted from Salary (Employee Contribution)
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ESIC (Monthly)
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-sm h-[40px] flex items-center">
                {calculatedValues.esic > 0
                  ? `Applicable (₹${calculatedValues.esic.toLocaleString()})`
                  : "Not Applicable"}
              </div>
              <p className="text-xs text-gray-500">
                Employee Share (0.75% of Basic) - Auto-calculated if Basic &lt;=
                ₹21,000
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Professional Tax (PT) (Monthly)
              </label>
              <input
                type="number"
                name="pt"
                value={formData.pt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                placeholder="200.00"
                step="0.01"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                TDS (Monthly)
              </label>
              <input
                type="number"
                name="tds"
                value={formData.tds}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Employer ESIC (3.25%) (Monthly)
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-sm h-[40px] flex items-center">
                {calculatedValues.employerEsic > 0
                  ? `Applicable (₹${calculatedValues.employerEsic.toLocaleString()})`
                  : "Not Applicable"}
              </div>
              <p className="text-xs text-gray-500">
                Employer Share (Not deducted from salary)
              </p>
            </div>
          </div>
        </div>

        {/* Other Allowances */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Other Allowances
          </h3>

          {!isEditMode && (
            <div className="flex gap-2">
              <input
                type="text"
                value={otherAllowance.name}
                onChange={(e) =>
                  setOtherAllowance((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Allowance name"
              />
              <input
                type="number"
                value={otherAllowance.amount}
                onChange={(e) =>
                  setOtherAllowance((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Amount"
                step="0.01"
              />
              <button
                type="button"
                onClick={addOtherAllowance}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {formData.other_allowances.length > 0 && (
            <div className="space-y-2">
              {formData.other_allowances.map((allowance, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={allowance.name}
                      onChange={(e) =>
                        updateOtherAllowance(index, "name", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm"
                      placeholder="Allowance name"
                    />
                    <input
                      type="number"
                      value={allowance.amount}
                      onChange={(e) =>
                        updateOtherAllowance(index, "amount", e.target.value)
                      }
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm"
                      placeholder="Amount"
                      step="0.01"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOtherAllowance(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deductions */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Deductions
          </h3>

          {!isEditMode && (
            <div className="flex gap-2">
              <input
                type="text"
                value={deduction.name}
                onChange={(e) =>
                  setDeduction((prev) => ({ ...prev, name: e.target.value }))
                }
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Deduction name"
              />
              <input
                type="number"
                value={deduction.amount}
                onChange={(e) =>
                  setDeduction((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Amount"
                step="0.01"
              />
              <button
                type="button"
                onClick={addDeduction}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {formData.deductions.length > 0 && (
            <div className="space-y-2">
              {formData.deductions.map((deduction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={deduction.name}
                      onChange={(e) =>
                        updateDeduction(index, "name", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm"
                      placeholder="Deduction name"
                    />
                    <input
                      type="number"
                      value={deduction.amount}
                      onChange={(e) =>
                        updateDeduction(index, "amount", e.target.value)
                      }
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm"
                      placeholder="Amount"
                      step="0.01"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDeduction(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly CTC & Yearly CTC & Net Pay Display */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Monthly CTC
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{calculatedValues.gross.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Yearly CTC
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₹
                {formData.annual_ctc
                  ? Number(formData.annual_ctc).toLocaleString()
                  : (calculatedValues.gross * 12).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="p-4 bg-primary-50 dark:bg-primary-500/20 rounded-lg border border-primary-200 dark:border-primary-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Monthly Net Pay
              </span>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                ₹{calculatedValues.net.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
            placeholder="Additional notes about this salary structure..."
          />
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
            {loading
              ? "Saving..."
              : editData
                ? "Update Structure"
                : "Create Structure"}
          </button>
        </div>
      </form>
    </>
  );

  if (renderAsPage) {
    return (
      <div className="bg-transparent w-full">
        <div className="mb-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Back to CTC Structures
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-hidden">
          {content}
        </div>
      </div>
    );
  }

  if (!isOpen || typeof document === "undefined") return null;

  const modal = (
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

  return createPortal(modal, document.body);
}
