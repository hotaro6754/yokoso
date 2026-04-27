"use client";

import LearningScreen from "@/components/courses/LearningScreen";

export default function ManagerLearningSelfPage() {
  return (
    <LearningScreen
      breadcrumbItems={[
        { label: "Manager", href: "/manager/dashboard" },
        { label: "Learning", href: "/manager/learning" },
      ]}
    />
  );
}
