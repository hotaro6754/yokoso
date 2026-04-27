"use client";

import LearningScreen from "@/components/courses/LearningScreen";

export default function HRLearningPage() {
  return (
    <LearningScreen
      variant="hr"
      breadcrumbItems={[
        { label: "HR", href: "/hr/dashboard" },
        { label: "Learning", href: "/hr/learning" },
      ]}
    />
  );
}
