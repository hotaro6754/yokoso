"use client";

import LearningScreen from "@/components/courses/LearningScreen";

export default function DeptHeadLearningSelfPage() {
  return (
    <LearningScreen
      breadcrumbItems={[
        { label: "Dept Head", href: "/dept-head/dashboard" },
        { label: "Learning", href: "/dept-head/learning/self" },
      ]}
    />
  );
}
