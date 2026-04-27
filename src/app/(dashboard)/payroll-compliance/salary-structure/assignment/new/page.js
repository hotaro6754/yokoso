"use client";

import { useRouter } from "next/navigation";
import AssignmentModal from "../../components/AssignmentModal";

export default function SalaryStructureAssignmentCreatePage() {
  const router = useRouter();

  return (
    <AssignmentModal
      isOpen
      renderAsPage
      onClose={() => router.push("/payroll-compliance/salary-structure/assignment")}
      onSuccess={() => router.push("/payroll-compliance/salary-structure/assignment")}
    />
  );
}
