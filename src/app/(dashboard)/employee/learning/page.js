"use client";

import LearningScreen from "@/components/courses/LearningScreen";

export default function LearningPage() {
  return (
    <LearningScreen
      breadcrumbItems={[
        { label: "Employee", href: "/employee/dashboard" },
        { label: "Learning", href: "/employee/learning" },
      ]}
    />
  );
}
