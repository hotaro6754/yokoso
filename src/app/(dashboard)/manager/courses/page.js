"use client";

import MyCoursesScreen from "@/components/courses/MyCoursesScreen";

export default function ManagerCoursesSelfPage() {
  return (
    <MyCoursesScreen
      breadcrumbItems={[
        { label: "Manager", href: "/manager/dashboard" },
        { label: "My Courses", href: "/manager/courses" },
      ]}
    />
  );
}
