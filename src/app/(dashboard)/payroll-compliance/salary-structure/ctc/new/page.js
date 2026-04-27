"use client";

import { useRouter } from "next/navigation";
import SalaryStructureModal from "../../components/SalaryStructureModal";

export default function SalaryStructureCreatePage() {
  const router = useRouter();

  return (
    <SalaryStructureModal
      isOpen
      renderAsPage
      onClose={() => router.push("/payroll-compliance/salary-structure/ctc")}
      onSuccess={() => router.push("/payroll-compliance/salary-structure/ctc")}
    />
  );
}
