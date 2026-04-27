"use client";

import MyCoursesScreen from "@/components/courses/MyCoursesScreen";

export default function PayrollCoursesPage() {
  return (
    <MyCoursesScreen
      breadcrumbItems={[
        { label: "Payroll Admin", href: "/payroll/dashboard" },
        { label: "Courses", href: "/payroll/courses" },
      ]}
    />
  );
}
