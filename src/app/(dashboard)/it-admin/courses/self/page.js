"use client";

import MyCoursesScreen from "@/components/courses/MyCoursesScreen";

export default function ItAdminCoursesSelfPage() {
  return (
    <MyCoursesScreen
      breadcrumbItems={[
        { label: "IT Admin", href: "/it-admin/dashboard" },
        { label: "Talent Development", href: "/it-admin/courses/self" },
        { label: "Courses : Self" },
      ]}
    />
  );
}
