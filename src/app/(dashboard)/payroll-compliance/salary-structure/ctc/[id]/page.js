"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import SalaryStructureModal from "../../components/SalaryStructureModal";

export default function SalaryStructureViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSalaryStructureDetails(id);
    }
  }, [id]);

  const fetchSalaryStructureDetails = async (structureId) => {
    try {
      setLoading(true);
      const response = await payrollSalaryStructureService.getSalaryStructureById(structureId);
      setSalaryStructure(response.data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch salary structure details");
      setSalaryStructure(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!salaryStructure) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p className="text-xl font-medium">Salary structure not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <SalaryStructureModal
      isOpen
      renderAsPage
      editData={salaryStructure}
      onClose={() => router.push("/payroll-compliance/salary-structure/ctc")}
      onSuccess={() => {
        toast.success("Salary structure updated successfully!");
        router.push("/payroll-compliance/salary-structure/ctc");
      }}
    />
  );
}
