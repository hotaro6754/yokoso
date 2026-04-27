"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AssignmentModal from "../../../components/AssignmentModal";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";

export default function SalaryStructureAssignmentEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  const toDateInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await payrollSalaryStructureService.getSalaryStructureById(id);
        const structure = response?.data?.data || response?.data || response;
        const employeeId =
          structure?.employeeId ||
          structure?.employee_id ||
          structure?.employee?.id;

        setEditData({
          assignment_type: "individual",
          employee_ids: [employeeId].filter(Boolean),
          department_ids: [],
          salary_structure_id: structure?.id || "",
          effective_date: toDateInputValue(structure?.effective_date || structure?.effectiveDate),
          end_date: toDateInputValue(structure?.end_date || structure?.endDate),
          status: structure?.status || "ACTIVE",
          notes: structure?.notes || "",
          company_id: structure?.company_id || structure?.companyId || ""
        });
      } catch (error) {
        toast.error(error.message || "Failed to load assignment");
        router.push("/payroll-compliance/salary-structure/assignment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, router]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <AssignmentModal
      isOpen
      renderAsPage
      editData={editData}
      onClose={() => router.push("/payroll-compliance/salary-structure/assignment")}
      onSuccess={() => router.push("/payroll-compliance/salary-structure/assignment")}
    />
  );
}
