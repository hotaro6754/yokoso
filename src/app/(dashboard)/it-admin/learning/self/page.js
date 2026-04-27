"use client";

import LearningScreen from "@/components/courses/LearningScreen";

export default function ItAdminLearningSelfPage() {
  return (
    <LearningScreen
      breadcrumbItems={[
        { label: "IT Admin", href: "/it-admin/dashboard" },
        { label: "Talent Development", href: "/it-admin/learning/self" },
        { label: "Learning : Self" },
      ]}
    />
  );
}
