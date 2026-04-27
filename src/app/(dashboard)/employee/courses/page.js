"use client";

import MyCoursesScreen from "@/components/courses/MyCoursesScreen";

export default function EmployeeCoursesPage() {
  return (
    <MyCoursesScreen
      breadcrumbItems={[
        { label: "Employee", href: "/employee/dashboard" },
        { label: "My Courses", href: "/employee/courses" },
      ]}
    />
  );
}
