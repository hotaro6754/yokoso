"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import SalaryStructureModal from "../../../components/SalaryStructureModal";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";

const mapStructureToFormData = (structure) => {
  if (!structure) return null;

  const effectiveDate = structure.effective_date || structure.effectiveDate || "";
  const normalizeDate = effectiveDate ? new Date(effectiveDate).toISOString().split("T")[0] : "";

  const normalizeKeyValueList = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      return Object.entries(value).map(([name, amount]) => ({ name, amount }));
    }
    return [];
  };

  console.log('structure', structure)
  return {
    id: structure.id,
    name: structure.name ?? "",
    employee_id: structure.employee?.id || structure.employee_id || structure.employeeId || "",
    effective_date: normalizeDate,
    basic_salary: structure.basic_salary ?? structure.basicSalary ?? "",
    hra: structure.hra ?? "",
    conveyance: structure.conveyance ?? "",
    medical: structure.medical ?? "",
    special_allowance: structure.special_allowance ?? structure.specialAllowance ?? "",
    pf: structure.pf ?? "",
    pt: structure.pt ?? "",
    tds: structure.tds ?? "",
    annual_ctc: structure.annual_ctc ?? structure.annualCTC ?? "",
    other_allowances: normalizeKeyValueList(structure.other_allowances ?? structure.otherAllowances),
    deductions: normalizeKeyValueList(structure.deductions),
    total_ctc: structure.total_ctc ?? structure.totalCTC ?? structure.monthlyCTC ?? "",
    frequency: structure.frequency ?? "MONTHLY",
    status: structure.status ?? "ACTIVE",
    notes: structure.notes ?? "",
    tax_regime: structure.tax_regime ?? structure.taxRegime ?? "FY25_26",
    salary_template_id: structure.salary_template_id ?? structure.salaryTemplateId ?? ""
  };
};

export default function SalaryStructureEditPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        setLoading(true);
        const response = await payrollSalaryStructureService.getSalaryStructureById(id);
        const structure = response.data?.data || response.data || null;
        setEditData(mapStructureToFormData(structure));
      } catch (error) {
        toast.error(error.message || "Failed to load salary structure");
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!editData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Salary structure not found.
      </div>
    );
  }

  return (
    <SalaryStructureModal
      isOpen
      renderAsPage
      editData={editData}
      onClose={() => router.push("/payroll-compliance/salary-structure/ctc")}
      onSuccess={() => router.push("/payroll-compliance/salary-structure/ctc")}
    />
  );
}
