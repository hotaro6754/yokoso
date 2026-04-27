"use client";

import { useRouter } from "next/navigation";
import AssignmentList from "../components/AssignmentList";

export default function SalaryStructureAssignmentPage() {
  const router = useRouter();

  return (
    <AssignmentList
      onAddAssignment={() => router.push("/payroll-compliance/salary-structure/assignment/new")}
    />
  );
}
