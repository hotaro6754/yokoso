"use client";

import MyCoursesScreen from "@/components/courses/MyCoursesScreen";

export default function DeptHeadCoursesSelfPage() {
  return (
    <MyCoursesScreen
      breadcrumbItems={[
        { label: "Dept Head", href: "/dept-head/dashboard" },
        { label: "My Courses", href: "/dept-head/courses/self" },
      ]}
    />
  );
}
