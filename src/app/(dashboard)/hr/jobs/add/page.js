"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Save } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { organizationService } from "@/services/hr-services/organization.service";
import { jobService } from "@/services/hr-services/job.service";
import { employeeService } from "@/services/hr-services/employeeService";
import JobForm from "../components/JobForm";
import { toast } from "sonner";

const initialState = {
  title: "",
  departmentId: "",
  designationId: "",
  location: "",
  employmentType: "",
  openings: 1,
  experienceMin: "",
  experienceMax: "",
  salaryMin: "",
  salaryMax: "",
  jobStatus: "",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: "",
  jobType: "",
  natureOfHire: "",
  education: "",
  hiringManagerName: "",
  interviewPanelDetails: "",
};

export default function JobAddPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [deptResponse, desResponse, locResponse, empResponse] = await Promise.all([
          organizationService.getAllDepartments({ page: 1, limit: 100 }),
          organizationService.getAllDesignations({ page: 1, limit: 100 }),
          organizationService.getAllLocations({ page: 1, limit: 100 }),
          employeeService.getAllEmployees({ page: 1, limit: 500 }),
        ]);

        const deptData = deptResponse.success
          ? deptResponse.data
          : deptResponse.data?.departments || deptResponse.data || [];
        const desData = desResponse.success
          ? desResponse.data
          : desResponse.data?.designations || desResponse.data || [];
        const locData = locResponse.success
          ? locResponse.data
          : locResponse.data?.locations || locResponse.data || [];

        setDepartments(Array.isArray(deptData) ? deptData : []);
        setDesignations(Array.isArray(desData) ? desData : []);
        setLocations(Array.isArray(locData) ? locData : []);

        const empData = empResponse.success
          ? empResponse.data
          : empResponse.data?.employees || empResponse.data || [];
        setEmployees(Array.isArray(empData) ? empData : []);
      } catch (error) {
        console.error("Error loading lookups:", error);
        toast.error("Failed to load departments/designations");
      } finally {
        setLoading(false);
      }
    };

    fetchLookups();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title?.trim()) {
      toast.error("Job title is required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        designationId: formData.designationId ? Number(formData.designationId) : null,
        openings: formData.openings ? Number(formData.openings) : 1,
        experienceMin: formData.experienceMin ? Number(formData.experienceMin) : null,
        experienceMax: formData.experienceMax ? Number(formData.experienceMax) : null,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
      };

      await jobService.createJob(payload);
      toast.success("Job created successfully");
      router.push("/hr/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error(error.message || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Jobs", href: "/hr/jobs" },
            { label: "Create Job", href: "/hr/jobs/add" },
          ]}
        />

        <div className="rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="rounded-sm bg-brand-50 p-2 dark:bg-brand-500/20">
              <Briefcase className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Create Job
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add a new job opening for approvals.
              </p>
            </div>
          </div>

          <JobForm
            formData={formData}
            onChange={handleChange}
            departments={departments}
            designations={designations}
            locations={locations}
            employees={employees}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            submitLabel={
              <>
                <Save size={16} /> Create Job
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
