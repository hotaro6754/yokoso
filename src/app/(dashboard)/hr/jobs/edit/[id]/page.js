"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Briefcase, Save } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { organizationService } from "@/services/hr-services/organization.service";
import { jobService } from "@/services/hr-services/job.service";
import { employeeService } from "@/services/hr-services/employeeService";
import JobForm from "../../components/JobForm";
import { toast } from "sonner";

const emptyForm = {
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


export default function JobEditPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptResponse, desResponse, locResponse, empResponse, jobResponse] = await Promise.all([
          organizationService.getAllDepartments({ page: 1, limit: 100 }),
          organizationService.getAllDesignations({ page: 1, limit: 100 }),
          organizationService.getAllLocations({ page: 1, limit: 100 }),
          employeeService.getAllEmployees({ page: 1, limit: 500 }),
          jobService.getJobById(jobId),
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
        const job = jobResponse.success ? jobResponse.data : jobResponse.data?.job || jobResponse.data;

        setDepartments(Array.isArray(deptData) ? deptData : []);
        setDesignations(Array.isArray(desData) ? desData : []);
        setLocations(Array.isArray(locData) ? locData : []);

        const empData = empResponse.success
          ? empResponse.data
          : empResponse.data?.employees || empResponse.data || [];
        setEmployees(Array.isArray(empData) ? empData : []);

        if (job) {
          setFormData({
            title: job.title || "",
            departmentId: job.departmentId ? String(job.departmentId) : "",
            designationId: job.designationId ? String(job.designationId) : "",
            location: job.location || "",
            employmentType: job.employmentType || "",
            openings: job.openings || 1,
            experienceMin: job.experienceMin ?? "",
            experienceMax: job.experienceMax ?? "",
            salaryMin: job.salaryMin ?? "",
            salaryMax: job.salaryMax ?? "",
            jobStatus: job.jobStatus || "",
            description: job.description || "",
            responsibilities: job.responsibilities || "",
            requirements: job.requirements || "",
            skills: job.skills || "",
            jobType: job.jobType || "",
            natureOfHire: job.natureOfHire || "",
            education: job.education || "",
            hiringManagerName: job.hiringManagerName || "",
            interviewPanelDetails: job.interviewPanelDetails || "",
          });
        }
      } catch (error) {
        console.error("Error loading job:", error);
        toast.error(error.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

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

      await jobService.updateJob(jobId, payload);
      toast.success("Job updated successfully");
      router.push("/hr/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error(error.message || "Failed to update job");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Jobs", href: "/hr/jobs" },
            { label: "Edit Job", href: `/hr/jobs/edit/${jobId}` },
          ]}
        />

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-500/20">
              <Briefcase className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Edit Job
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update job details and approval status.
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
                <Save size={16} /> Update Job
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
