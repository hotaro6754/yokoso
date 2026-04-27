// src\app\(dashboard)\hr\employees\add\components\ProfessionalInfoForm.js
"use client";
import { Briefcase, Calendar, User, IndianRupee, Clock, Building, Users, FileText, Loader2, Calculator, Gift } from 'lucide-react';
import InputField from '@/components/form/input/InputField';
import DatePickerField from '@/components/form/input/DatePickerField';
import SelectField from './SelectField';
import Label from '@/components/form/Label';
import { useEffect, useState } from 'react';
import { departmentService } from '@/services/hr-services/departmentService';
import { designationService } from '@/services/hr-services/designationService';
import { salaryTemplateService } from '@/services/payroll-role-services/salary-templates.service';
import { toast } from 'sonner';
import axios from '@/lib/api';

// Date formatting helper function
const formatDateDDMMYYYY = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function ProfessionalInfoForm({ formData, errors, onChange, dropdownData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [salaryTemplates, setSalaryTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Initialize template data if ID is already present (e.g. from local storage recovery)
  useEffect(() => {
    if (formData.salaryTemplateId && (!selectedTemplate || String(selectedTemplate.id) !== String(formData.salaryTemplateId))) {
      const initTemplate = async () => {
        try {
          const response = await salaryTemplateService.getTemplateById(formData.salaryTemplateId);
          const template = response.data?.data || response.data;
          if (template) setSelectedTemplate(template);
        } catch (error) {
          console.error("Error initializing template:", error);
        }
      };
      initTemplate();
    }
  }, [formData.salaryTemplateId]);

  const employmentTypeOptions = [
    { value: '', label: 'Select Employment Type' },
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'FREELANCE', label: 'Freelance' }
  ];

  const [probationOptions, setProbationOptions] = useState([]);
  const [noticeOptions, setNoticeOptions] = useState([]);
  const [probationSelectValue, setProbationSelectValue] = useState('');
  const [noticeSelectValue, setNoticeSelectValue] = useState('');
  const [customProbation, setCustomProbation] = useState('');
  const [customNotice, setCustomNotice] = useState('');

  // Fetch company settings for period options
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { companySettingsService } = await import('@/services/company-admin/companySettingsService');
        const settings = await companySettingsService.getCompanySettings();
        const pOptions = companySettingsService.getProbationPeriodOptions(settings.data || settings);
        const nOptions = companySettingsService.getNoticePeriodOptions(settings.data || settings);

        setProbationOptions([
          { value: '0', label: 'No Probation' },
          ...pOptions
        ]);
        setNoticeOptions(nOptions.filter(opt => opt.value !== '0'));
      } catch (error) {
        console.error('Error fetching period options:', error);
        // Fallback options
        setProbationOptions([
          { value: '0', label: 'No Probation' },
          { value: '30', label: '30 days' },
          { value: '60', label: '60 days' },
          { value: '90', label: '90 days' }
        ]);
        setNoticeOptions([
          { value: '15', label: '15 days' },
          { value: '30', label: '30 days' },
          { value: '60', label: '60 days' }
        ]);
      }
    };
    fetchSettings();
    
    // Fetch Salary Templates
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const response = await salaryTemplateService.getTemplates();
        setSalaryTemplates(response.data?.data || response.data || []);
      } catch (err) {
        console.error('Error fetching templates', err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Sync select + custom input when form data changes
  useEffect(() => {
    const probationVal = formData?.probationPeriod ? String(formData.probationPeriod) : '';
    const noticeVal = formData?.noticePeriod ? String(formData.noticePeriod) : '';

    const probationMatch = probationOptions.find(opt => opt.value === probationVal);
    if (probationVal && !probationMatch) {
      setProbationSelectValue('__CUSTOM__');
      setCustomProbation(probationVal);
    } else {
      setProbationSelectValue(probationVal);
      if (probationMatch || !probationVal) setCustomProbation('');
    }

    const noticeMatch = noticeOptions.find(opt => opt.value === noticeVal);
    if (noticeVal && !noticeMatch) {
      setNoticeSelectValue('__CUSTOM__');
      setCustomNotice(noticeVal);
    } else {
      setNoticeSelectValue(noticeVal);
      if (noticeMatch || !noticeVal) setCustomNotice('');
    }
  }, [formData?.probationPeriod, formData?.noticePeriod, probationOptions, noticeOptions]);

  // Auto-trigger default probation/notice based on DOJ (joining date)
  useEffect(() => {
    if (!formData?.joiningDate) return;

    if (!formData?.probationPeriod && probationOptions.length > 0) {
      const defaultProbation = probationOptions.find(opt => opt.value !== '0');
      if (defaultProbation) onChange('probationPeriod', defaultProbation.value);
    }

    if (!formData?.noticePeriod && noticeOptions.length > 0) {
      const defaultNotice = noticeOptions.find(opt => opt.value !== '0');
      if (defaultNotice) onChange('noticePeriod', defaultNotice.value);
    }
  }, [formData?.joiningDate, formData?.probationPeriod, formData?.noticePeriod, probationOptions, noticeOptions, onChange]);

  // Use managers from dropdownData (already fetched in parent component)
  useEffect(() => {
    if (dropdownData.reportingManagers && dropdownData.reportingManagers.length > 0) {
      setManagers(dropdownData.reportingManagers);
    }
  }, [dropdownData.reportingManagers]);

  // Auto-calculate Confirmation Date based on Probation Period
  useEffect(() => {
    // Helper to format date as YYYY-MM-DD (Standard for internal state and Flatpickr)
    const formatDate = (date) => {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    };

    // Helper to parse various date formats safely
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      if (dateStr instanceof Date) return dateStr;
      
      // If it's already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      
      // If it's DD-MM-YYYY
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [d, m, y] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    if (formData.probationPeriod !== undefined && formData.probationPeriod !== null && formData.probationPeriod !== '') {
      // Use joining date if available, otherwise use today's date as per user request
      const baseDate = formData.joiningDate ? parseDate(formData.joiningDate) : new Date();
      const probationDays = parseInt(formData.probationPeriod, 10);

      if (!isNaN(probationDays) && baseDate && !isNaN(baseDate.getTime())) {
        const confirmation = new Date(baseDate);
        confirmation.setDate(confirmation.getDate() + probationDays);

        const confirmationStr = formatDate(confirmation);

        // ALWAYS update if probation or joining date just changed, 
        // but we'll limit the effect dependencies to avoid overwriting manual edits on every render
        onChange('confirmationDate', confirmationStr);
      }
    } else if (formData.probationPeriod === '0' || formData.probationPeriod === 0) {
      // If no probation, confirmation date is joining date
      const confirmStr = formData.joiningDate || formatDate(new Date());
      onChange('confirmationDate', confirmStr);
    }
  }, [formData.joiningDate, formData.probationPeriod]); // Removed formData.confirmationDate from dependencies to allow manual edits without feedback loop
 
  const handleTemplateChange = async (templateId) => {
    onChange('salaryTemplateId', templateId);
    if (!templateId) return;

    try {
      const response = await salaryTemplateService.getTemplateById(templateId);
      const template = response.data?.data || response.data;
      if (!template) return;

      setSelectedTemplate(template);
      toast.success(`Template ${template.templateName} applied`);
    } catch (error) {
      console.error("Error applying template:", error);
    }
  };

  // Re-calculate breakdown when CTC changes if a template is selected
  useEffect(() => {
    if (selectedTemplate && formData.ctc) {
      const totalCTC = parseFloat(formData.ctc) || 0;
      const variablePay = parseFloat(formData.variablePay) || 0;
      const fixedCTC = totalCTC - variablePay;
      const monthlyCTC = fixedCTC / 12;

      const components = [...(selectedTemplate.components || [])].sort((a, b) => {
        const nameA = (a.component?.name || "").toLowerCase();
        const nameB = (b.component?.name || "").toLowerCase();
        if (nameA.includes("basic")) return -1;
        if (nameB.includes("basic")) return 1;
        return 0;
      });

      let basicVal = 0;
      let hraVal = 0;
      let othersArr = [];
      let deductionsArr = [];

      // Reset standard components to 0 initially
      onChange("basicSalary", 0);
      onChange("hra", 0);
      onChange("specialAllowance", 0);

      components.forEach((tc) => {
        const comp = tc.component;
        if (!comp) return;

        let value = tc.overrideValue !== null ? tc.overrideValue : comp.value;
        const calcType = tc.overrideCalculationType || comp.calculationType;
        const name = comp.name.toLowerCase();

        if (calcType === "PERCENTAGE_OF_CTC" && monthlyCTC > 0) {
          value = Math.round((value / 100) * monthlyCTC);
        } else if (calcType === "PERCENTAGE_OF_BASIC" && basicVal > 0) {
          value = Math.round((value / 100) * basicVal);
        }

        if (comp.maxAmount && value > comp.maxAmount) value = comp.maxAmount;
        if (comp.eligibilityThreshold && basicVal > comp.eligibilityThreshold) value = 0;

        if (name.includes("basic")) {
          basicVal = value;
          onChange("basicSalary", value);
        } else if (name === "hra") {
          hraVal = value;
          onChange("hra", value);
        } else if (name === "special allowance") {
          return;
        } else if (comp.type === "EARNING") {
          othersArr.push({ name: comp.name, amount: value });
        } else if (comp.type === "DEDUCTION") {
          deductionsArr.push({ name: comp.name, amount: value });
        }
      });

      const totalEarningsSoFar = basicVal + hraVal + othersArr.reduce((sum, item) => sum + item.amount, 0);
      const deductionsTotal = deductionsArr.reduce((sum, item) => sum + item.amount, 0);
      const specialVal = Math.max(0, Math.round(monthlyCTC - totalEarningsSoFar - deductionsTotal));
      
      onChange("specialAllowance", specialVal);
      onChange("otherAllowances", othersArr);
      onChange("deductions", deductionsArr);
    }
  }, [formData.ctc, formData.variablePay, selectedTemplate]);


  const departmentOptions = [
    { value: '', label: 'Select Department' },
    ...(dropdownData.departments || []).map(dept => ({
      value: dept.id?.toString() || dept.id,
      label: dept.name || 'Unnamed Department'
    }))
  ];

  const designationOptions = [
    { value: '', label: 'Select Designation' },
    ...(dropdownData.designations || []).map(designation => ({
      value: designation.id?.toString() || designation.id,
      label: designation.name || 'Unnamed Designation'
    }))
  ];

  // const reportingManagerOptions = [
  //   { value: '', label: 'Select Reporting Manager' },
  //   ...managers.map(manager => ({
  //     value: manager.id.toString(),
  //     label: `${manager.firstName} ${manager.lastName} (${manager.employeeId})${manager.designation?.name ? ` - ${manager.designation.name}` : ''}`
  //   }))
  // ];
  const reportingManagerOptions = [
    { value: '', label: 'Select Reporting Manager' },
    ...(managers || dropdownData.reportingManagers || []).map(manager => ({
      value: manager.id?.toString() || manager.id,
      label: `${manager.firstName} ${manager.lastName} (${manager.employeeId || ''})${manager.designation?.name ? ` - ${manager.designation.name}` : ''}`
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Professional Information
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enter the employment details and professional information
            </p>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className="relative z-50 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Employment Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* System Role */}
          <div className="space-y-2">
            <Label htmlFor="systemRole" required>
              System Role
            </Label>
            <SelectField
              id="systemRole"
              name="systemRole"
              value={formData.systemRole}
              onChange={(value) => onChange('systemRole', value)}
              options={[
                { value: 'EMPLOYEE', label: 'Employee' },
                { value: 'HR_ADMIN', label: 'HR Admin' },
                { value: 'MANAGER', label: 'Manager' },
                { value: 'DEPT_HEAD', label: 'Department Head' },
                { value: 'FINANCE_ADMIN', label: 'Finance Admin' },
                { value: 'PAYROLL_ADMIN', label: 'Payroll Admin' },
                { value: 'IT_ADMIN', label: 'IT Admin' },
                { value: 'L_AND_D_MANAGER', label: 'L&D Manager' },
                { value: 'RECRUITER', label: 'Recruiter' }
              ]}
              error={errors.systemRole}
              searchable={true}
            />
          </div>

          {/* Employee ID - Optional manual entry */}
          <div className="space-y-2">
            <Label htmlFor="employeeId">
              Employee ID (Optional)
            </Label>
            <InputField
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={(e) => onChange('employeeId', e.target.value)}
              placeholder="Leave empty for auto-generation"
              error={errors.employeeId}
              icon={<User className="w-4 h-4" />}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              System will auto-generate if left empty
            </p>
          </div>

          {/* Biometric ID */}
          <div className="space-y-2">
            <Label htmlFor="biometricId">
              Biometric ID (ZKTeco)
            </Label>
            <InputField
              id="biometricId"
              name="biometricId"
              value={formData.biometricId}
              onChange={(e) => onChange('biometricId', e.target.value)}
              placeholder="Leave empty to auto-generate"
              error={errors.biometricId}
              icon={<Users className="w-4 h-4" />}
            />
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              ID to register on the ZKTeco machine (Auto-generates if empty)
            </p>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="departmentId" required>
              Department
            </Label>
            <SelectField
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={(value) => onChange('departmentId', value)}
              options={departmentOptions}
              error={errors.departmentId}
              searchable={true}
            />
          </div>

          {/* Designation */}
          <div className="space-y-2">
            <Label htmlFor="designationId" required>
              Designation
            </Label>
            <SelectField
              id="designationId"
              name="designationId"
              value={formData.designationId}
              onChange={(value) => onChange('designationId', value)}
              options={designationOptions}
              error={errors.designationId}
              searchable={true}
            />
          </div>

          {/* Reporting Manager */}
          <div className="space-y-2">
            <Label htmlFor="reportingManagerId">
              Reporting Manager
            </Label>
            <div className="relative">
              <SelectField
                id="reportingManagerId"
                name="reportingManagerId"
                value={formData.reportingManagerId}
                onChange={(value) => onChange('reportingManagerId', value)}
                options={reportingManagerOptions}
                error={errors.reportingManagerId}
                disabled={loadingManagers}
                searchable={true}
              />
              {loadingManagers && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              )}
            </div>
            {loadingManagers && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Loading managers...
              </p>
            )}
          </div>

          {/* Joining Date */}
          <div className="space-y-2">
            <Label htmlFor="joiningDate" required>
              Joining Date
            </Label>
            <DatePickerField
              id="joiningDate"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={(value) => onChange('joiningDate', value)}
              error={errors.joiningDate}
              placeholder="DD-MM-YYYY"
            />
          </div>



          {/* Total Experience */}
          <div className="space-y-2">
            <Label htmlFor="totalExperience">
              Total Experience
            </Label>
            <InputField
              id="totalExperience"
              name="totalExperience"
              value={formData.totalExperience}
              onChange={(e) => onChange('totalExperience', e.target.value)}
              placeholder="e.g. 5 Years"
              error={errors.totalExperience}
            />
          </div>

          {/* Relevant Experience */}
          <div className="space-y-2">
            <Label htmlFor="relevantExperience">
              Relevant Experience
            </Label>
            <InputField
              id="relevantExperience"
              name="relevantExperience"
              value={formData.relevantExperience}
              onChange={(e) => onChange('relevantExperience', e.target.value)}
              placeholder="e.g. 3 Years"
              error={errors.relevantExperience}
            />
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <Label htmlFor="employmentType" required>
              Employment Type
            </Label>
            <SelectField
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={(value) => onChange('employmentType', value)}
              options={employmentTypeOptions}
              error={errors.employmentType}
              searchable={true}
            />
          </div>

          {/* Work Location */}
          <div className="space-y-2">
            <Label htmlFor="locationId" required>Work Location</Label>
            <SelectField
              id="locationId"
              name="locationId"
              value={formData.locationId}
              onChange={(value) => onChange('locationId', value)}
              options={[
                { value: '', label: 'Select Work Location' },
                ...(dropdownData?.locations || []).map(loc => ({
                  value: loc.id,
                  label: loc.name
                }))
              ]}
              error={errors.locationId}
              searchable={true}
            />
          </div>
        </div>
      </div>

      {/* Compensation & Work Details */}
      <div className="relative z-40 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Compensation & Work Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total CTC */}
          <div className="space-y-2">
            <Label htmlFor="ctc">
              Total CTC (₹)
            </Label>
            <InputField
              id="ctc"
              name="ctc"
              type="number"
              value={formData.ctc}
              onChange={(e) => onChange('ctc', e.target.value)}
              placeholder="Enter total CTC"
              error={errors.ctc}
              icon={<IndianRupee className="w-4 h-4" />}
            />
          </div>

          {/* Variable Pay */}
          <div className="space-y-2">
            <Label htmlFor="variablePay">
              Variable Pay (VP) (₹)
            </Label>
            <InputField
              id="variablePay"
              name="variablePay"
              type="number"
              value={formData.variablePay}
              onChange={(e) => onChange('variablePay', e.target.value)}
              placeholder="Performance linked pay"
              error={errors.variablePay}
              icon={<IndianRupee className="w-4 h-4" />}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryTemplateId">
              Salary Template
            </Label>
            <SelectField
              id="salaryTemplateId"
              name="salaryTemplateId"
              value={formData.salaryTemplateId}
              onChange={handleTemplateChange}
              options={[
                { value: '', label: 'Select Salary Template' },
                ...salaryTemplates.map(t => ({ value: String(t.id), label: t.templateName }))
              ]}
              error={errors.salaryTemplateId}
              disabled={loadingTemplates}
              searchable={true}
            />
          </div>
        </div>

        {/* Live Salary Structure Breakdown */}
        {(formData.ctc && formData.salaryTemplateId) && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4 text-purple-600" />
              Projected Monthly Salary Breakdown
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Fixed CTC</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">₹{Math.round((parseFloat(formData.ctc) - (parseFloat(formData.variablePay) || 0)) / 12).toLocaleString()}</span>
              </div>
              {formData.basicSalary > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Basic</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{(formData.basicSalary || 0).toLocaleString()}</span>
                </div>
              )}
              {formData.hra > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly HRA</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{(formData.hra || 0).toLocaleString()}</span>
                </div>
              )}
              
              {(formData.otherAllowances || []).map((allowance, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{allowance.name}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{(allowance.amount || 0).toLocaleString()}</span>
                </div>
              ))}
              
              {formData.specialAllowance > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Special Allowance</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{(formData.specialAllowance || 0).toLocaleString()}</span>
                </div>
              )}

              {/* Show all deductions */}
              {(formData.deductions || []).map((deduction, idx) => (
                <div key={`ded-${idx}`} className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{deduction.name}</span>
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400">₹{(deduction.amount || 0).toLocaleString()}</span>
                </div>
              ))}

              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg md:col-span-2 flex justify-between items-center border border-purple-100 dark:border-purple-900/30">
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">Estimated Monthly Net Take-home</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  ₹{Math.round(((parseFloat(formData.ctc) - (parseFloat(formData.variablePay) || 0)) / 12) - (formData.deductions || []).reduce((sum, d) => sum + (d.amount || 0), 0)).toLocaleString()}
                </span>
              </div>

              {/* Scheduled One-Time Bonuses */}
              {(parseFloat(formData.joiningBonusAmount) > 0 || parseFloat(formData.referralBonusAmount) > 0 || parseFloat(formData.performanceBonusAmount) > 0) && (
                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h5 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3 flex items-center gap-2">
                    <Gift className="w-3 h-3" /> Scheduled One-Time Payments
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    {parseFloat(formData.joiningBonusAmount) > 0 && (
                      <div className="flex justify-between items-center py-1 outline-dashed outline-1 outline-green-200 dark:outline-green-900/30 rounded px-2">
                        <span className="text-xs text-gray-500">Joining Bonus ({formData.joiningBonusDate ? formatDateDDMMYYYY(formData.joiningBonusDate) : 'Date TBD'})</span>
                        <span className="text-xs font-bold text-green-600">₹{parseFloat(formData.joiningBonusAmount).toLocaleString()}</span>
                      </div>
                    )}
                    {parseFloat(formData.referralBonusAmount) > 0 && (
                      <div className="flex justify-between items-center py-1 outline-dashed outline-1 outline-blue-200 dark:outline-blue-900/30 rounded px-2">
                        <span className="text-xs text-gray-500">Referral Bonus ({formData.referralBonusDate ? formatDateDDMMYYYY(formData.referralBonusDate) : 'Date TBD'})</span>
                        <span className="text-xs font-bold text-blue-600">₹{parseFloat(formData.referralBonusAmount).toLocaleString()}</span>
                      </div>
                    )}
                    {parseFloat(formData.performanceBonusAmount) > 0 && (
                      <div className="flex justify-between items-center py-1 outline-dashed outline-1 outline-amber-200 dark:outline-amber-900/30 rounded px-2">
                        <span className="text-xs text-gray-500">Performance Bonus ({formData.performanceBonusDate ? formatDateDDMMYYYY(formData.performanceBonusDate) : 'Date TBD'})</span>
                        <span className="text-xs font-bold text-amber-600">₹{parseFloat(formData.performanceBonusAmount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* One-Time Bonuses Moved inside breakdown */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  One-Time Bonuses (Optional)
                </h4>
              </div>

              <div className="space-y-4">
                {/* Joining Bonus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white/50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-1.5">
                    <Label htmlFor="joiningBonusAmount" className="text-xs">Joining Bonus Amount (₹)</Label>
                    <InputField
                      id="joiningBonusAmount"
                      name="joiningBonusAmount"
                      type="number"
                      value={formData.joiningBonusAmount}
                      onChange={(e) => onChange('joiningBonusAmount', e.target.value)}
                      placeholder="0.00"
                      className="h-9 text-sm"
                      icon={<IndianRupee className="w-3.5 h-3.5" />}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="joiningBonusDate" className="text-xs" required={parseFloat(formData.joiningBonusAmount) > 0}>Payment Date</Label>
                    <DatePickerField
                      id="joiningBonusDate"
                      name="joiningBonusDate"
                      value={formData.joiningBonusDate}
                      onChange={(value) => onChange('joiningBonusDate', value)}
                      placeholder="DD-MM-YYYY"
                      className="h-9 text-sm"
                      error={errors.joiningBonusDate}
                    />
                  </div>
                </div>

                {/* Referral Bonus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white/50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-1.5">
                    <Label htmlFor="referralBonusAmount" className="text-xs">Referral Bonus Amount (₹)</Label>
                    <InputField
                      id="referralBonusAmount"
                      name="referralBonusAmount"
                      type="number"
                      value={formData.referralBonusAmount}
                      onChange={(e) => onChange('referralBonusAmount', e.target.value)}
                      placeholder="0.00"
                      className="h-9 text-sm"
                      icon={<IndianRupee className="w-3.5 h-3.5" />}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="referralBonusDate" className="text-xs" required={parseFloat(formData.referralBonusAmount) > 0}>Payment Date</Label>
                    <DatePickerField
                      id="referralBonusDate"
                      name="referralBonusDate"
                      value={formData.referralBonusDate}
                      onChange={(value) => onChange('referralBonusDate', value)}
                      placeholder="DD-MM-YYYY"
                      className="h-9 text-sm"
                      error={errors.referralBonusDate}
                    />
                  </div>
                </div>

                {/* Performance Bonus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white/50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-1.5">
                    <Label htmlFor="performanceBonusAmount" className="text-xs">Performance Bonus Amount (₹)</Label>
                    <InputField
                      id="performanceBonusAmount"
                      name="performanceBonusAmount"
                      type="number"
                      value={formData.performanceBonusAmount}
                      onChange={(e) => onChange('performanceBonusAmount', e.target.value)}
                      placeholder="0.00"
                      className="h-9 text-sm"
                      icon={<IndianRupee className="w-3.5 h-3.5" />}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="performanceBonusDate" className="text-xs" required={parseFloat(formData.performanceBonusAmount) > 0}>Payment Date</Label>
                    <DatePickerField
                      id="performanceBonusDate"
                      name="performanceBonusDate"
                      value={formData.performanceBonusDate}
                      onChange={(value) => onChange('performanceBonusDate', value)}
                      placeholder="DD-MM-YYYY"
                      className="h-9 text-sm"
                      error={errors.performanceBonusDate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="probationPeriod" required>
              Probation Period
            </Label>
            <SelectField
              id="probationPeriod"
              name="probationPeriod"
              value={probationSelectValue}
              onChange={(value) => {
                setProbationSelectValue(value);
                if (value === '__CUSTOM__') {
                  onChange('probationPeriod', customProbation || '');
                } else {
                  onChange('probationPeriod', value);
                }
              }}
              options={[
                ...probationOptions,
                { value: '__CUSTOM__', label: 'Custom (days)' }
              ]}
              error={errors.probationPeriod}
              required
              searchable={true}
            />
            {probationSelectValue === '__CUSTOM__' && (
              <InputField
                type="number"
                id="probationPeriodCustom"
                value={customProbation}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCustomProbation(val);
                  onChange('probationPeriod', val);
                }}
                placeholder="Enter probation days"
              />
            )}
          </div>

          {/* Notice Period */}
          <div className="space-y-2">
            <Label htmlFor="noticePeriod">
              Notice Period
            </Label>
            <SelectField
              id="noticePeriod"
              name="noticePeriod"
              value={noticeSelectValue}
              onChange={(value) => {
                setNoticeSelectValue(value);
                if (value === '__CUSTOM__') {
                  onChange('noticePeriod', customNotice || '');
                } else {
                  onChange('noticePeriod', value);
                }
              }}
              options={[
                ...noticeOptions,
                { value: '__CUSTOM__', label: 'Custom (days)' }
              ]}
              error={errors.noticePeriod}
              searchable={true}
            />
            {noticeSelectValue === '__CUSTOM__' && (
              <InputField
                type="number"
                id="noticePeriodCustom"
                value={customNotice}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCustomNotice(val);
                  onChange('noticePeriod', val);
                }}
                placeholder="Enter notice days"
              />
            )}
          </div>

          {/* Confirmation Date */}
          <div className="space-y-2">
            <Label htmlFor="confirmationDate">
              Confirmation Date
            </Label>
            <DatePickerField
              id="confirmationDate"
              name="confirmationDate"
              value={formData.confirmationDate}
              onChange={(value) => onChange('confirmationDate', value)}
              error={errors.confirmationDate}
              placeholder="DD-MM-YYYY"
            />
          </div>

          {/* Work Shift */}
          <div className="space-y-2">
            <Label htmlFor="workShift">
              Work Shift
            </Label>
            <SelectField
              id="workShift"
              name="workShift"
              value={formData.workShift}
              onChange={(value) => onChange('workShift', value)}
              placeholder="Select shift"
              error={errors.workShift}
              options={[
                { value: 'Morning', label: 'S1 - Morning Shift (09:00 - 18:00)' },
                { value: 'Afternoon', label: 'S2 - Afternoon Shift (14:00 - 23:00)' },
                { value: 'Night', label: 'S3 - Night Shift (22:00 - 07:00)' },
                { value: 'General', label: 'G - General Shift (10:00 - 19:00)' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="relative z-30 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Status Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Employment Status
            </Label>
            <SelectField
              id="status"
              name="status"
              value={formData.status}
              onChange={(value) => onChange('status', value)}
              options={[
                { value: '', label: 'Select Status' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'PROBATION', label: 'Probation' },
                { value: 'NOTICE_PERIOD', label: 'Notice Period' },
                { value: 'SUSPENDED', label: 'Suspended' },
                { value: 'TERMINATED', label: 'Terminated' },
                { value: 'RESIGNED', label: 'Resigned' },
                { value: 'RETIRED', label: 'Retired' }
              ]}
              error={errors.status}
              searchable={true}
            />
          </div>

          {/* Onboarding Status */}
          <div className="space-y-2">
            <Label htmlFor="onboardingStatus">
              Onboarding Status
            </Label>
            <SelectField
              id="onboardingStatus"
              name="onboardingStatus"
              value={formData.onboardingStatus}
              onChange={(value) => onChange('onboardingStatus', value)}
              options={[
                { value: '', label: 'Select Onboarding Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'FAILED', label: 'Failed' }
              ]}
              error={errors.onboardingStatus}
              searchable={true}
            />
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-purple-600 rounded-md flex-shrink-0 mt-0.5">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Professional Information Guidelines
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Accurate professional information ensures proper payroll processing, department allocation, and reporting structure setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
