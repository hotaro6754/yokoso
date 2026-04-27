"use client";

import LearningScreen from "@/components/courses/LearningScreen";

export default function PayrollLearningPage() {
  return (
    <LearningScreen
      breadcrumbItems={[
        { label: "Payroll Admin", href: "/payroll/dashboard" },
        { label: "Learning", href: "/payroll/learning" },
      ]}
    />
  );
}
