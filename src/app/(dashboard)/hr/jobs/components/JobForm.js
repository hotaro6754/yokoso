"use client";

import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import CustomSelect from "@/app/(dashboard)/hr/employees/add/components/SelectField";

const statusOptions = [
  { value: "", label: "Select status" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "HOLD", label: "Hold" },
];

const employmentOptions = [
  { value: "", label: "Select type" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];

const educationOptions = [
  { value: "", label: "Select education" },
  { value: "B.Tech", label: "B.Tech" },
  { value: "M.Tech", label: "M.Tech" },
  { value: "B.A", label: "B.A" },
  { value: "M.A", label: "M.A" },
  { value: "B.Sc", label: "B.Sc" },
  { value: "M.Sc", label: "M.Sc" },
  { value: "B.Com", label: "B.Com" },
  { value: "M.Com", label: "M.Com" },
  { value: "BCA", label: "BCA" },
  { value: "MCA", label: "MCA" },
  { value: "MBA", label: "MBA" },
  { value: "PHD", label: "PhD" },
  { value: "Any Graduation", label: "Any Graduation" },
  { value: "Any Post Graduation", label: "Any Post Graduation" },
  { value: "Other", label: "Other" },
];

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

const textareaClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

export default function JobForm({
  formData,
  onChange,
  departments,
  designations,
  locations,
  employees = [],
  submitting,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  return (
    <form className="p-6 space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title" required>
            Job Title
          </Label>
          <InputField
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Senior Frontend Developer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="departmentId" required>
            Department
          </Label>
          <select
            id="departmentId"
            value={formData.departmentId}
            onChange={(e) => onChange("departmentId", e.target.value)}
            className={inputClassName}
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="designationId">Designation</Label>
          <select
            id="designationId"
            value={formData.designationId}
            onChange={(e) => onChange("designationId", e.target.value)}
            className={inputClassName}
          >
            <option value="">Select designation</option>
            {designations.map((designation) => (
              <option key={designation.id} value={designation.id}>
                {designation.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <select
            id="location"
            value={formData.location}
            onChange={(e) => onChange("location", e.target.value)}
            className={inputClassName}
          >
            <option value="">Select location</option>
            {locations?.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment Type</Label>
          <select
            id="employmentType"
            value={formData.employmentType}
            onChange={(e) => onChange("employmentType", e.target.value)}
            className={inputClassName}
          >
            {employmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobType">Job Type</Label>
          <select
            id="jobType"
            value={formData.jobType}
            onChange={(e) => onChange("jobType", e.target.value)}
            className={inputClassName}
          >
            <option value="">Select job type</option>
            <option value="BILLABLE">Billable</option>
            <option value="NON_BILLABLE">Non-Billable</option>
            <option value="SHADOW">Shadow</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="natureOfHire">Nature of Hire</Label>
          <select
            id="natureOfHire"
            value={formData.natureOfHire}
            onChange={(e) => onChange("natureOfHire", e.target.value)}
            className={inputClassName}
          >
            <option value="">Select nature of hire</option>
            <option value="NEW_POSITION">New Position</option>
            <option value="REPLACEMENT">Replacement</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Education</Label>
          <select
            id="education"
            value={formData.education}
            onChange={(e) => onChange("education", e.target.value)}
            className={inputClassName}
          >
            {educationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hiringManagerName">Hiring Manager Name</Label>
          {(() => {
            const hiringManagerOptions = employees.map((emp) => {
              const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
              const empId = emp.tempId || emp.employeeId || '';
              const desig = emp.designation?.name || '';
              const label = `${name}${empId ? ` (${empId})` : ''}${desig ? ` - ${desig}` : ''}`;
              return { value: `${emp.id}__${name}`, label };
            });
            // Find the matching option for current formData value (which stores only the name)
            const matchedOption = hiringManagerOptions.find(opt => opt.value.split('__')[1] === formData.hiringManagerName);
            return (
              <CustomSelect
                name="hiringManagerName"
                value={matchedOption ? matchedOption.value : ''}
                onChange={(val) => {
                  // Extract the name part from "id__name"
                  const namePart = val ? val.split('__').slice(1).join('__') : '';
                  onChange("hiringManagerName", namePart);
                }}
                placeholder="Select Hiring Manager"
                searchable={true}
                options={[
                  { value: '', label: 'Search Hiring Manager...' },
                  ...hiringManagerOptions
                ]}
              />
            );
          })()}
        </div>

        <div className="space-y-2">
          <Label htmlFor="openings">Openings</Label>
          <InputField
            id="openings"
            name="openings"
            type="number"
            min="1"
            value={formData.openings}
            onChange={(e) => onChange("openings", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceMin">Min Experience (years)</Label>
          <InputField
            id="experienceMin"
            name="experienceMin"
            type="number"
            min="0"
            value={formData.experienceMin}
            onChange={(e) => onChange("experienceMin", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceMax">Max Experience (years)</Label>
          <InputField
            id="experienceMax"
            name="experienceMax"
            type="number"
            min="0"
            value={formData.experienceMax}
            onChange={(e) => onChange("experienceMax", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryMin">Min Salary</Label>
          <InputField
            id="salaryMin"
            name="salaryMin"
            type="number"
            min="0"
            value={formData.salaryMin}
            onChange={(e) => onChange("salaryMin", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryMax">Max Salary</Label>
          <InputField
            id="salaryMax"
            name="salaryMax"
            type="number"
            min="0"
            value={formData.salaryMax}
            onChange={(e) => onChange("salaryMax", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobStatus">Job Status</Label>
          <select
            id="jobStatus"
            value={formData.jobStatus}
            onChange={(e) => onChange("jobStatus", e.target.value)}
            className={inputClassName}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Job Description</Label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            className={textareaClassName}
            placeholder="Brief overview of the role."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="responsibilities">Responsibilities</Label>
          <textarea
            id="responsibilities"
            rows={4}
            value={formData.responsibilities}
            onChange={(e) => onChange("responsibilities", e.target.value)}
            className={textareaClassName}
            placeholder="Key responsibilities for this role."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="requirements">Requirements</Label>
          <textarea
            id="requirements"
            rows={4}
            value={formData.requirements}
            onChange={(e) => onChange("requirements", e.target.value)}
            className={textareaClassName}
            placeholder="Required qualifications and experience."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="skills">Skills</Label>
          <textarea
            id="skills"
            rows={3}
            value={formData.skills}
            onChange={(e) => onChange("skills", e.target.value)}
            className={textareaClassName}
            placeholder="Key skills (comma separated)."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="interviewPanelDetails">Interview Panel Details</Label>
          <textarea
            id="interviewPanelDetails"
            rows={3}
            value={formData.interviewPanelDetails}
            onChange={(e) => onChange("interviewPanelDetails", e.target.value)}
            className={textareaClassName}
            placeholder="Details of interview panel members."
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm disabled:opacity-70"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
