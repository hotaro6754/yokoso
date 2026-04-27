"use client";

import MyCoursesScreen from "@/components/courses/MyCoursesScreen";

export default function HRMyCoursesPage() {
  return (
    <MyCoursesScreen
      breadcrumbItems={[
        { label: "HR", href: "/hr/dashboard" },
        { label: "My Courses", href: "/hr/my-courses" },
      ]}
    />
  );
}
