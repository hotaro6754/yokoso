"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { BookOpen, Award, Clock, Search, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { courseManagementService } from "@/services/course-management/course.service";
import toast from "react-hot-toast";

const mockCourses = [
  { title: "Workplace Safety Basics", due: "31 Jan 2026", progress: 80, status: "In Progress", category: "Compliance" },
  { title: "POSH Compliance Training", due: "15 Feb 2026", progress: 40, status: "In Progress", category: "Compliance" },
  { title: "Information Security Essentials", due: "10 Feb 2026", progress: 20, status: "Assigned", category: "Security" },
];

function EmployeeLearningView({ courses, certificates, downloadAvailableCertificates }) {
  return (
    <>
      <div className="rounded-2xl border border-primary-100/50 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary-50 p-2.5 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">View-only access to assigned courses.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-primary-100/50 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Courses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
        </div>
        <div className="rounded-2xl border border-primary-100/50 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Certificates</p>
          <div className="mt-2 flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <Award size={18} />
            <span className="font-semibold">{certificates.length} available</span>
          </div>
          <button
            onClick={downloadAvailableCertificates}
            disabled={!certificates.length}
            className="mt-3 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
          >
            Download Certificates
          </button>
        </div>
        <div className="rounded-2xl border border-primary-100/50 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Next Due</p>
          <div className="mt-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Clock size={18} />
            <span className="font-semibold">{courses[0]?.due || "No deadline"}</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary-100/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-primary-100/50 px-5 py-4 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Assigned Courses</h3>
        </div>
        <div className="divide-y divide-primary-100/30 dark:divide-gray-700">
          {courses.map((course) => (
            <div key={course.title} className="px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due by {course.due}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-36 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-full bg-primary-600" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{course.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary-100/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-primary-100/50 px-5 py-4 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Learning History</h3>
        </div>
        <div className="divide-y divide-primary-100/30 dark:divide-gray-700">
          {certificates.map((item) => (
            <div key={item.title} className="flex items-center justify-between px-5 py-4 text-sm">
              <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
              <span className="text-gray-500 dark:text-gray-400">Completed: {item.completed}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function HRLearningView({ courses, certificates, downloadAvailableCertificates }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const overviewCards = [
    { label: "Assigned Courses", value: courses.length, icon: BookOpen, tone: "text-primary-600 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-400" },
    { label: "In Progress", value: courses.filter((course) => course.status === "In Progress").length, icon: Clock, tone: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400" },
    { label: "Certificates Ready", value: certificates.length, icon: Award, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" },
    { label: "Next Deadline", value: courses[0]?.due || "No deadline", icon: Calendar, tone: "text-secondary-700 bg-secondary-50 dark:bg-secondary-900/20 dark:text-secondary-100" },
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-700 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Learning</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your assigned courses, deadlines, certificates, and recently completed learning items.
          </p>
        </div>
        <button
          onClick={downloadAvailableCertificates}
          disabled={!certificates.length}
          className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Award size={16} />
          Download Certificates
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
                <div className={`rounded-sm p-2 ${card.tone}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search learning items..."
              className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-900 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 min-w-[180px] rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="all">All Status</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Assigned Learning</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredCourses.map((course) => (
              <div key={course.title} className="px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        course.status === "In Progress"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                      }`}>
                        {course.status === "In Progress" ? <Clock size={12} /> : <AlertCircle size={12} />}
                        {course.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Due by {course.due}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className="h-full bg-primary-600" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="min-w-[42px] text-right text-xs font-semibold text-gray-700 dark:text-gray-300">{course.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Certificate Status</h3>
            </div>
            <div className="space-y-3 px-5 py-4">
              {certificates.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-sm border border-gray-100 p-3 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed: {item.completed}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <CheckCircle2 size={12} />
                    {item.certificate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Learning History</h3>
            </div>
            <div className="space-y-3 px-5 py-4">
              {certificates.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-sm border border-gray-100 p-3 dark:border-gray-700">
                  <div className="rounded-sm bg-secondary-50 p-2 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-100">
                    <BookOpen size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed on {item.completed}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LearningScreen({ breadcrumbItems, variant = "employee" }) {
  const [courses, setCourses] = useState(mockCourses);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        if (variant === "hr") {
          const issuedCertificates = await courseManagementService.getIssuedCertifications();
          const derivedCertificates = Array.isArray(issuedCertificates)
            ? issuedCertificates
                .map((certificate) => ({
                  title: certificate.courseTitle || "Certificate",
                  completed: certificate.issuedAt
                    ? new Date(certificate.issuedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "Available",
                  certificate: "Available",
                  certificateId: certificate.certificateCode || certificate.id,
                }))
                .filter((certificate) => certificate.certificateId)
            : [];

          setCertificates(derivedCertificates);
          return;
        }

        const courseResponse = await courseManagementService.getEmployeeCourses();
        const fetchedCourses = courseResponse?.data || [];

        if (fetchedCourses.length) {
          setCourses(
            fetchedCourses.map((course) => ({
              title: course.title,
              due: course.endDate ? new Date(course.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "No deadline",
              progress: Number.isFinite(course.progress) ? course.progress : course.status === "COMPLETED" ? 100 : course.status === "IN_PROGRESS" ? 50 : 0,
              status: course.status === "IN_PROGRESS" ? "In Progress" : course.status === "COMPLETED" ? "Completed" : "Assigned",
              category: course.category || "General",
            }))
          );
        }

        const derivedCertificates = fetchedCourses
          .filter((course) => course.certificateId || course.certificateCode)
          .map((course) => ({
            title: course.title || "Certificate",
            completed: course.certificateIssuedAt
              ? new Date(course.certificateIssuedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : "Available",
            certificate: "Available",
            certificateId: course.certificateCode || course.certificateId,
          }))
          .filter((certificate) => certificate.certificateId);

        setCertificates(derivedCertificates);
      } catch (error) {
        console.error("Failed to load learning data:", error);
        setCertificates([]);
      }
    };

    fetchLearningData();
  }, []);

  const downloadAvailableCertificates = async () => {
    if (!certificates.length) {
      toast.error("No certificates available to download");
      return;
    }

    const getFilenameFromDisposition = (disposition, fallbackName) => {
      if (!disposition) return fallbackName;
      const match = /filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i.exec(disposition);
      if (!match?.[1]) return fallbackName;
      try {
        return decodeURIComponent(match[1]);
      } catch (err) {
        return match[1];
      }
    };

    for (const item of certificates) {
      try {
        const response = await courseManagementService.downloadCertificate(item.certificateId);
        const blob = response?.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fallbackName = `Certificate-${item.certificateId}.pdf`;
        const filename = getFilenameFromDisposition(response?.headers?.['content-disposition'], fallbackName);
        link.download = filename || fallbackName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(`Error downloading certificate ${item.title}:`, error);
        toast.error(error?.message || `Failed to download ${item.title}`);
      }
    }
  };

  return (
    <div className={`min-h-screen ${variant === "hr" ? "bg-gray-50 p-3 dark:bg-gray-900 sm:p-6" : "bg-gradient-to-br from-gray-50 via-white to-primary-50/20 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 sm:p-6"}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        {variant === "hr"
          ? <HRLearningView courses={courses} certificates={certificates} downloadAvailableCertificates={downloadAvailableCertificates} />
          : <EmployeeLearningView courses={courses} certificates={certificates} downloadAvailableCertificates={downloadAvailableCertificates} />}
      </div>
    </div>
  );
}
