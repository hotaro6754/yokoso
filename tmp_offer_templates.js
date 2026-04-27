"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import { FileText, Eye, Download, Save, ArrowLeft, User, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

const numberToWords = (num) => {
  if (!num || isNaN(num)) return '';
  const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty ','Thirty ','Forty ','Fifty ','Sixty ','Seventy ','Eighty ','Ninety '];
  
  let n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero';
  
  let str = n.toString();
  if (str.length > 9) return 'overflow';
  
  str = ('000000000' + str).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!str) return ''; 
  let out = '';
  out += (str[1] != 0) ? (a[Number(str[1])] || b[str[1][0]] + a[str[1][1]]) + 'Crore ' : '';
  out += (str[2] != 0) ? (a[Number(str[2])] || b[str[2][0]] + a[str[2][1]]) + 'Lakh ' : '';
  out += (str[3] != 0) ? (a[Number(str[3])] || b[str[3][0]] + a[str[3][1]]) + 'Thousand ' : '';
  out += (str[4] != 0) ? (a[Number(str[4])] || b[str[4][0]] + a[str[4][1]]) + 'Hundred ' : '';
  out += (str[5] != 0) ? ((out != '') ? 'and ' : '') + (a[Number(str[5])] || b[str[5][0]] + a[str[5][1]]) : '';
  return out.trim() + ' Only';
};

const PLACEHOLDER_KEY_MAP = {
  "emp name": "candidateName",
  "employee name": "candidateName",
  "candidate name": "candidateName",
  "candidate": "candidateName",
  "job title": "jobTitle",
  "position": "jobTitle",
  "designation": "designation",
  "department": "department",
  "ctc": "ctc",
  "annual ctc": "ctc",
  "joining date": "joiningDate",
  "start date": "joiningDate",
  "offer expiry date": "offerExpiryDate",
  "offer expiry": "offerExpiryDate",
  "expiry date": "offerExpiryDate",
  "work location": "workLocation",
  "office location": "workLocation",
  "employment type": "employmentType",
  "notice period": "noticePeriod",
  "company name": "companyName",
  "company address": "companyAddress",
  "hr name": "hrName",
  "hr email": "hrEmail",
  "employee id": "employeeId",
  "probation period": "probationPeriod",
  "working hours": "workingHours",
  "internship period": "internshipPeriod",
  "internship duration": "internshipPeriod",
};

const normalizePlaceholderKey = (value) =>
  String(value || "")
    .replace(/[_\-]+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const toFieldKey = (value) =>
  `custom_${String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "")}`;

const extractPlaceholders = (html) => {
  if (!html) return [];
  const placeholders = new Set();
  const add = (value) => {
    const cleaned = String(value || "").replace(/\s+/g, " ").trim();
    if (cleaned) placeholders.add(cleaned);
  };

  const angleEsc = /&lt;\s*([^&]{1,80})\s*&gt;/gi;
  const square = /\[\s*([^\[\]]{1,80})\s*\]/g;
  const curly = /\{\{\s*([^{}]{1,80})\s*\}\}/g;

  let match;
  while ((match = angleEsc.exec(html))) add(match[1]);
  while ((match = square.exec(html))) add(match[1]);
  while ((match = curly.exec(html))) add(match[1]);

  let text = "";
  if (typeof window !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      text = doc.body?.textContent || "";
    } catch (err) {
      text = html;
    }
  } else {
    text = html;
  }

  const angle = /<\s*([^<>]{1,80})\s*>/g;
  while ((match = angle.exec(text))) add(match[1]);

  return Array.from(placeholders);
};

const guessFieldType = (label) => {
  const normalized = normalizePlaceholderKey(label);
  if (normalized.includes("date")) return "date";
  if (normalized.includes("email")) return "email";
  if (normalized.includes("address") || normalized.includes("notes")) return "textarea";
  return "text";
};

export default function LetterTemplatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [templateType, setTemplateType] = useState("offer"); // "offer" or "appointment"
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplateContent, setSelectedTemplateContent] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [templateFields, setTemplateFields] = useState([]);
  const [dynamicValues, setDynamicValues] = useState({});
  const [formData, setFormData] = useState({
    candidateId: "",
    candidateName: "",
    jobTitle: "",
    department: "",
    designation: "",
    ctc: "",
    joiningDate: "",
    offerExpiryDate: "",
    workLocation: "",
    employmentType: "FULL_TIME",
    noticePeriod: "",
    notes: "",
    internshipPeriod: "",
    // Additional fields for appointment letter
    employeeId: "",
    probationPeriod: "3 months",
    workingHours: "9:00 AM - 6:00 PM",
    // Company details
    companyName: "ZODECK",
    companyAddress: "123 Business Street, City, State, ZIP",
    hrName: "HR Director",
    hrEmail: "hr@zodeck.com",
  });

  useEffect(() => {
    if (templateType === "offer") {
      fetchCandidates();
    }
    fetchTemplates();
    setSelectedTemplateId("");
    setSelectedTemplateContent("");
  }, [templateType]);

  useEffect(() => {
    const placeholders = extractPlaceholders(selectedTemplateContent);
    const fields = placeholders.map((label) => {
      const normalized = normalizePlaceholderKey(label);
      const mappedKey = PLACEHOLDER_KEY_MAP[normalized];
      return {
        label,
        key: mappedKey || toFieldKey(label),
        mappedKey,
        inputType: guessFieldType(label),
      };
    });
    setTemplateFields(fields);
    setDynamicValues((prev) => {
      const next = { ...prev };
      const validKeys = new Set(fields.filter((f) => !f.mappedKey).map((f) => f.key));
      Object.keys(next).forEach((key) => {
        if (!validKeys.has(key)) delete next[key];
      });
      fields.forEach((field) => {
        if (!field.mappedKey && next[field.key] === undefined) {
          next[field.key] = "";
        }
      });
      return next;
    });
  }, [selectedTemplateContent]);

  const fetchTemplates = async () => {
    try {
      const response = await recruiterService.getTemplates(templateType);
      const templateList = response.data || response || [];
      setTemplates(templateList);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setSelectedTemplateContent("");
      return;
    }
    try {
      const response = await recruiterService.getTemplateById(templateId);
      const templateData = response.data || response;
      if (templateData && templateData.htmlContent) {
        setSelectedTemplateContent(templateData.htmlContent);
      } else {
        setSelectedTemplateContent("");
      }
    } catch (error) {
      console.error("Error fetching template by id:", error);
      toast.error("Failed to load template");
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Fetch more candidates (limit 1000) and removed excludeWithOffers to show everyone
      const response = await recruiterService.getAllCandidates({ limit: 100 });
      const candidatesList = response.data || response || [];
      setCandidates(candidatesList);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicChange = (key, value) => {
    setDynamicValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-fill candidate name and job title when candidate is selected
    if (name === "candidateId") {
      const selectedCandidate = candidates.find((c) => c.id.toString() === value);
      if (selectedCandidate) {
        setFormData((prev) => ({
          ...prev,
          candidateId: value,
          candidateName: selectedCandidate.name || "",
          jobTitle: selectedCandidate.jobTitle || prev.jobTitle || "",
        }));
      }
    }
  };

  const generateOfferLetter = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const joiningDate = formData.joiningDate
      ? new Date(formData.joiningDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      : '[Joining Date]';
    const expiryDate = formData.offerExpiryDate
      ? new Date(formData.offerExpiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      : '[Expiry Date]';

    if (selectedTemplateId) {
      if (!selectedTemplateContent) {
        return `<div style="padding: 40px; text-align: center; color: #666; font-family: sans-serif;">
            <p><strong>The selected template has no readable content.</strong></p>
            <p>You may edit this space to create your template manually, or try uploading a valid .html or .docx file again.</p>
          </div>`;
      }

      let customHtml = selectedTemplateContent;

      const numericCtc = parseInt(String(formData.ctc).replace(/,/g, '').replace(/₹/g, '').replace(/[a-zA-Z\s]/g, '').trim()) || 0;
      const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(val));

            if (numericCtc > 0) {
        const annualBasic = Math.round(numericCtc * 0.40);
        const annualHra = Math.round(annualBasic * 0.50); // HRA is typically 50% of Basic (or 20% of CTC)
        const annualPf = Math.round(annualBasic * 0.12); // PF is 12% of Basic
        const annualGratuity = Math.round(annualBasic * 0.0481); // Gratuity is 4.81% of Basic
        
        // Ensure annualSpecial covers the rest of the CTC
        const annualSpecial = numericCtc - annualBasic - annualHra - annualPf - annualGratuity;
        
        const monthlyTotal = Math.round(numericCtc / 12);
        const monthlyBasic = Math.round(annualBasic / 12);
        const monthlyHra = Math.round(annualHra / 12);
        const monthlyPf = Math.round(annualPf / 12);
        const monthlyGratuity = Math.round(annualGratuity / 12);
        const monthlySpecial = monthlyTotal - monthlyBasic - monthlyHra - monthlyPf - monthlyGratuity;

        const grossIncome = monthlyBasic + monthlyHra + monthlySpecial; // Actual Gross (excluding employer PF/Gratuity)

        // Standard replacements for backward compatibility
        customHtml = customHtml.replace(/\[Basic Pay\]|\{\{basic_pay\}\}|25,000/gi, formatCurrency(monthlyBasic));
        customHtml = customHtml.replace(/\[HRA\]|\{\{hra\}\}|13,000/gi, formatCurrency(monthlyHra));
        
        // Map old pension or PF tags
        customHtml = customHtml.replace(/\[Pension(?: benefits)?\]|\[PF\]|\[Provident Fund\]|\{\{pf\}\}|\{\{provident_fund\}\}|4,200/gi, formatCurrency(monthlyPf));
        
        // Map Gratuity
        customHtml = customHtml.replace(/\[Gratuity\]|\[graduity\]|\{\{gratuity\}\}/gi, formatCurrency(monthlyGratuity));
        
        // Map special allowance
        customHtml = customHtml.replace(/\[Other allowance\]|\[Special Allowance\]|\{\{other_allowance\}\}|16,000/gi, formatCurrency(monthlySpecial));
        
        // Both standard Gross CTC and generic Gross Income tags
        customHtml = customHtml.replace(/\[Gross monthly salary\]|58,200/gi, formatCurrency(monthlyTotal));
        customHtml = customHtml.replace(/\[Gross Income\]|\{\{gross_income\}\}/gi, formatCurrency(grossIncome));
        
        // Auto-replace default test numbers if they are in the template
        customHtml = customHtml.replace(/1000000|10,00,000/g, formatCurrency(numericCtc));
        
        // Convert CTC to words
        customHtml = customHtml.replace(/\[in words\]|\[In Words\]|\{in words\}/gi, numberToWords(numericCtc));
      }

      customHtml = customHtml.replace(/\{\{candidate_name\}\}|\[Candidate Name\]|\[Employee Name\]|\[candidate's first name\]/gi, formData.candidateName || '[Candidate Name]');
      customHtml = customHtml.replace(/\{\{job_title\}\}|\[Job Title\]|\[position\]/gi, formData.jobTitle || '[Job Title]');
      customHtml = customHtml.replace(/\{\{ctc\}\}|\[CTC\]/gi, formData.ctc ? formatCurrency(numericCtc) : '[CTC]');
      customHtml = customHtml.replace(/\{\{joining_date\}\}|\[Joining Date\]/gi, joiningDate);
      customHtml = customHtml.replace(/\{\{department\}\}|\[Department\]/gi, formData.department || '[Department]');
      customHtml = customHtml.replace(/\{\{company_name\}\}|\[Company Name\]/gi, formData.companyName || 'ZODECK');
      customHtml = customHtml.replace(/\{\{hr_name\}\}|\[HR Name\]/gi, formData.hrName || 'HR Director');
      customHtml = customHtml.replace(/\{\{company_address\}\}|\[Company Address\]/gi, formData.companyAddress || '');
      customHtml = customHtml.replace(/\{\{employment_type\}\}|\[Employment Type\]/gi, formData.employmentType || '');
      customHtml = customHtml.replace(/\{\{work_location\}\}|\[Work Location\]/gi, formData.workLocation || '');
      customHtml = customHtml.replace(/\{\{offer_expiry\}\}|\[Expiry Date\]|\[Offer Expiry Date\]/gi, expiryDate);
      customHtml = customHtml.replace(/\{\{designation\}\}|\[Designation\]/gi, formData.designation || '[Designation]');

      templateFields.forEach((field) => {
        const value = field.mappedKey
          ? (formData[field.mappedKey] || "")
          : (dynamicValues[field.key] || "");
        if (!value) return;
        const label = String(field.label || "");
        const safeLabel = label.replace(/\s+/g, " ").trim();
        const escaped = safeLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const loose = escaped.replace(/\s+/g, "[\\s_-]+");
        const patterns = [
          new RegExp(`&lt;\\s*${loose}\\s*&gt;`, "gi"),
          new RegExp(`<\\s*${loose}\\s*>`, "gi"),
          new RegExp(`\\[\\s*${loose}\\s*\\]`, "gi"),
          new RegExp(`\\{\\{\\s*${loose}\\s*\\}\\}`, "gi"),
        ];
        patterns.forEach((pattern) => {
          customHtml = customHtml.replace(pattern, value);
        });
      });
      return customHtml;
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; word-wrap: break-word;">
        <div style="text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 20px; margin-bottom: 40px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1f2937;">${formData.companyName || 'ZODECK'}</h1>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;"><strong>OFFER OF EMPLOYMENT</strong></p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${currentDate}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 10px 0;">Dear <strong>${formData.candidateName || '[Candidate Name]'}</strong>,</p>
        </div>

        <div style="margin-bottom: 30px; text-align: justify;">
          <p style="margin: 0 0 15px 0;">
            We are pleased to offer you the position of <strong>${formData.jobTitle || '[Job Title]'}</strong> 
            ${formData.department ? `in our ${formData.department} department` : ''} at ${formData.companyName || 'ZODECK'}. 
            We were impressed with your qualifications and experience, and we believe you will be a valuable addition to our team.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 30px; margin: 30px 0; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">OFFER DETAILS:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 40%;"><strong>Position:</strong></td>
              <td style="padding: 8px 0;">${formData.jobTitle || '[Job Title]'}</td>
            </tr>
            ${formData.designation ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Designation:</strong></td>
              <td style="padding: 8px 0;">${formData.designation}</td>
            </tr>
            ` : ''}
            ${formData.department ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Department:</strong></td>
              <td style="padding: 8px 0;">${formData.department}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0;"><strong>Annual CTC:</strong></td>
              <td style="padding: 8px 0;">${formData.ctc || '[CTC]'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Employment Type:</strong></td>
              <td style="padding: 8px 0;">${formData.employmentType === 'FULL_TIME' ? 'Full-time' : formData.employmentType === 'PART_TIME' ? 'Part-time' : formData.employmentType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Joining Date:</strong></td>
              <td style="padding: 8px 0;">${joiningDate}</td>
            </tr>
            ${formData.workLocation ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Work Location:</strong></td>
              <td style="padding: 8px 0;">${formData.workLocation}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-bottom: 30px; text-align: justify;">
          <p style="margin: 0 0 15px 0;">
            This offer is valid until <strong>${expiryDate}</strong>. Please sign and return a copy of this letter 
            to indicate your acceptance of this offer.
          </p>
          ${formData.noticePeriod ? `
          <p style="margin: 0 0 15px 0;">
            Your notice period with your current employer should be completed by <strong>${joiningDate}</strong>.
          </p>
          ` : ''}
        </div>

        <div style="margin-bottom: 30px; text-align: justify;">
          <p style="margin: 0 0 15px 0;">
            We look forward to welcoming you to our team and are excited about the contributions you will make to our organization.
          </p>
        </div>

        <div style="margin-top: 50px;">
          <p style="margin: 0 0 5px 0;">Sincerely,</p>
          <p style="margin: 0 0 5px 0;"><strong>${formData.hrName || 'HR Director'}</strong></p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${formData.companyName || 'ZODECK'}</p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${formData.companyAddress || '123 Business Street, City, State, ZIP'}</p>
        </div>

        <div style="margin-top: 80px; border-top: 1px solid #e5e7eb; padding-top: 40px;">
          <div style="margin-bottom: 30px;">
            <p style="margin: 0 0 15px 0; text-align: justify;">
              I acknowledge that I have read and understood the terms and conditions of this offer letter. 
              I accept this offer of employment and agree to the terms outlined above.
            </p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div style="width: 45%;">
              <div style="border-top: 2px solid #1f2937; padding-top: 10px; margin-top: 60px;">
                <p style="margin: 0; font-weight: bold;">Candidate Signature</p>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${formData.candidateName || '[Candidate Name]'}</p>
              </div>
            </div>
            <div style="width: 45%;">
              <div style="border-top: 2px solid #1f2937; padding-top: 10px; margin-top: 60px;">
                <p style="margin: 0; font-weight: bold;">Date</p>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">_________________</p>
              </div>
            </div>
          </div>
        </div>

        ${formData.ctc ? `
        <div style="page-break-before: always; margin-top: 60px;">
          <h2 style="text-align: center; color: #1f2937; border-bottom: 2px solid #1f2937; padding-bottom: 10px;">ANNEXURE - A: COMPENSATION DETAILS</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; border: 1px solid #d1d5db; text-align: left;">Salary Component</th>
              <th style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">Amount per Annum</th>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Basic Salary</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40)) : '[40% of CTC]'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">House Rent Allowance (HRA)</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.50)) : '[20% of CTC]'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Provident Fund (Employer PF)</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.12)) : '[12% of Basic]'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Gratuity</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.0481)) : '[4.81% of Basic]'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Special Allowance</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(
                  (parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) 
                  - Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40)
                  - Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.50)
                  - Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.12)
                  - Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.0481)
                ) : '[Balance]'}</td>
            </tr>
            <tr style="background-color: #f3f4f6; font-weight: bold;">
              <td style="padding: 12px; border: 1px solid #d1d5db;">Total Cost to Company (CTC)</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc}
            </tr>
          </table>
        </div>
        ` : ''}
      </div>
    `;
  };

  const generateAppointmentLetter = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const joiningDate = formData.joiningDate
      ? new Date(formData.joiningDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      : '[Joining Date]';

    if (selectedTemplateId) {
      if (!selectedTemplateContent) {
        return `<div style="padding: 40px; text-align: center; color: #666; font-family: sans-serif;">
            <p><strong>The selected template has no readable content.</strong></p>
            <p>You may edit this space to create your template manually, or try uploading a valid .html or .docx file again.</p>
          </div>`;
      }

      let customHtml = selectedTemplateContent;

      const numericCtc = parseInt(String(formData.ctc).replace(/,/g, '').replace(/₹/g, '').replace(/[a-zA-Z\s]/g, '').trim()) || 0;
      const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(val));

            if (numericCtc > 0) {
        const annualBasic = Math.round(numericCtc * 0.40);
        const annualHra = Math.round(annualBasic * 0.50); // HRA is typically 50% of Basic (or 20% of CTC)
        const annualPf = Math.round(annualBasic * 0.12); // PF is 12% of Basic
        const annualGratuity = Math.round(annualBasic * 0.0481); // Gratuity is 4.81% of Basic
        
        // Ensure annualSpecial covers the rest of the CTC
        const annualSpecial = numericCtc - annualBasic - annualHra - annualPf - annualGratuity;
        
        const monthlyTotal = Math.round(numericCtc / 12);
        const monthlyBasic = Math.round(annualBasic / 12);
        const monthlyHra = Math.round(annualHra / 12);
        const monthlyPf = Math.round(annualPf / 12);
        const monthlyGratuity = Math.round(annualGratuity / 12);
        const monthlySpecial = monthlyTotal - monthlyBasic - monthlyHra - monthlyPf - monthlyGratuity;

        const grossIncome = monthlyBasic + monthlyHra + monthlySpecial; // Actual Gross (excluding employer PF/Gratuity)

        // Standard replacements for backward compatibility
        customHtml = customHtml.replace(/\[Basic Pay\]|\{\{basic_pay\}\}|25,000/gi, formatCurrency(monthlyBasic));
        customHtml = customHtml.replace(/\[HRA\]|\{\{hra\}\}|13,000/gi, formatCurrency(monthlyHra));
        
        // Map old pension or PF tags
        customHtml = customHtml.replace(/\[Pension(?: benefits)?\]|\[PF\]|\[Provident Fund\]|\{\{pf\}\}|\{\{provident_fund\}\}|4,200/gi, formatCurrency(monthlyPf));
        
        // Map Gratuity
        customHtml = customHtml.replace(/\[Gratuity\]|\[graduity\]|\{\{gratuity\}\}/gi, formatCurrency(monthlyGratuity));
        
        // Map special allowance
        customHtml = customHtml.replace(/\[Other allowance\]|\[Special Allowance\]|\{\{other_allowance\}\}|16,000/gi, formatCurrency(monthlySpecial));
        
        // Both standard Gross CTC and generic Gross Income tags
        customHtml = customHtml.replace(/\[Gross monthly salary\]|58,200/gi, formatCurrency(monthlyTotal));
        customHtml = customHtml.replace(/\[Gross Income\]|\{\{gross_income\}\}/gi, formatCurrency(grossIncome));
        
        // Auto-replace default test numbers if they are in the template
        customHtml = customHtml.replace(/1000000|10,00,000/g, formatCurrency(numericCtc));
        
        // Convert CTC to words
        customHtml = customHtml.replace(/\[in words\]|\[In Words\]|\{in words\}/gi, numberToWords(numericCtc));
      }

      customHtml = customHtml.replace(/\{\{candidate_name\}\}|\[Candidate Name\]|\[Employee Name\]|\[candidate's first name\]/gi, formData.candidateName || '[Employee Name]');
      customHtml = customHtml.replace(/\{\{job_title\}\}|\[Job Title\]|\[position\]/gi, formData.jobTitle || '[Job Title]');
      customHtml = customHtml.replace(/\{\{ctc\}\}|\[CTC\]/gi, formData.ctc ? formatCurrency(numericCtc) : '[CTC]');
      customHtml = customHtml.replace(/\{\{joining_date\}\}|\[Joining Date\]/gi, joiningDate);
      customHtml = customHtml.replace(/\{\{department\}\}|\[Department\]/gi, formData.department || '[Department]');
      customHtml = customHtml.replace(/\{\{employee_id\}\}|\[Employee ID\]/gi, formData.employeeId || '[Employee ID]');
      customHtml = customHtml.replace(/\{\{designation\}\}|\[Designation\]/gi, formData.designation || '[Designation]');
      customHtml = customHtml.replace(/\{\{probation_period\}\}|\[Probation Period\]/gi, formData.probationPeriod || '3 months');
      customHtml = customHtml.replace(/\{\{working_hours\}\}|\[Working Hours\]/gi, formData.workingHours || '9:00 AM - 6:00 PM');
      customHtml = customHtml.replace(/\{\{work_location\}\}|\[Work Location\]/gi, formData.workLocation || '[Work Location]');
      customHtml = customHtml.replace(/\{\{company_name\}\}|\[Company Name\]/gi, formData.companyName || 'ZODECK');
      customHtml = customHtml.replace(/\{\{hr_name\}\}|\[HR Name\]/gi, formData.hrName || 'HR Director');
      customHtml = customHtml.replace(/\{\{company_address\}\}|\[Company Address\]/gi, formData.companyAddress || '');
      return customHtml;
    }

    return `
      <div style="font-family: 'Times New Roman', serif; max-width: 100%; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; word-wrap: break-word;">
        <div style="text-align: center; border-bottom: 3px solid #1f2937; padding-bottom: 20px; margin-bottom: 40px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #1f2937;">${formData.companyName || 'ZODECK'}</h1>
          <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">APPOINTMENT LETTER</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${currentDate}</p>
          ${formData.employeeId ? `<p style="margin: 0 0 10px 0;"><strong>Employee ID:</strong> ${formData.employeeId}</p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 10px 0;">Dear <strong>${formData.candidateName || '[Employee Name]'}</strong>,</p>
        </div>

        <div style="margin-bottom: 30px; text-align: justify;">
          <p style="margin: 0 0 15px 0;">
            With reference to your application and subsequent interview, we are pleased to confirm your appointment 
            as <strong>${formData.jobTitle || '[Job Title]'}</strong> 
            ${formData.designation ? `(${formData.designation})` : ''} 
            ${formData.department ? `in our ${formData.department} department` : ''} at ${formData.companyName || 'ZODECK'}.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 30px; margin: 30px 0; border-left: 4px solid #10b981; border-radius: 4px;">
          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">APPOINTMENT DETAILS:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${formData.employeeId ? `
            <tr>
              <td style="padding: 8px 0; width: 40%; vertical-align: top;"><strong>Employee ID:</strong></td>
              <td style="padding: 8px 0;">${formData.employeeId}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; width: 40%; vertical-align: top;"><strong>Position:</strong></td>
              <td style="padding: 8px 0;">${formData.jobTitle || '[Job Title]'}</td>
            </tr>
            ${formData.designation ? `
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Designation:</strong></td>
              <td style="padding: 8px 0;">${formData.designation}</td>
            </tr>
            ` : ''}
            ${formData.department ? `
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Department:</strong></td>
              <td style="padding: 8px 0;">${formData.department}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Annual CTC:</strong></td>
              <td style="padding: 8px 0;">${formData.ctc || '[CTC]'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Employment Type:</strong></td>
              <td style="padding: 8px 0;">${formData.employmentType === 'FULL_TIME' ? 'Full-time' : formData.employmentType === 'PART_TIME' ? 'Part-time' : formData.employmentType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Date of Joining:</strong></td>
              <td style="padding: 8px 0;">${joiningDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Probation Period:</strong></td>
              <td style="padding: 8px 0;">${formData.probationPeriod || '3 months'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Working Hours:</strong></td>
              <td style="padding: 8px 0;">${formData.workingHours || '9:00 AM - 6:00 PM'}</td>
            </tr>
            ${formData.workLocation ? `
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Work Location:</strong></td>
              <td style="padding: 8px 0;">${formData.workLocation}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-bottom: 30px; text-align: justify;">
          <p style="margin: 0 0 15px 0;">
            Your appointment will be subject to the terms and conditions as per company policy. During the probation period, 
            your performance will be reviewed, and upon successful completion, your appointment will be confirmed.
          </p>
          <p style="margin: 0 0 15px 0;">
            We welcome you to ${formData.companyName || 'ZODECK'} and look forward to a long and mutually beneficial association.
          </p>
        </div>

        <div style="margin-top: 50px;">
          <p style="margin: 0 0 5px 0;">Sincerely,</p>
          <p style="margin: 0 0 5px 0;"><strong>${formData.hrName || 'HR Director'}</strong></p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${formData.companyName || 'ZODECK'}</p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${formData.companyAddress || '123 Business Street, City, State, ZIP'}</p>
        </div>

        ${formData.ctc ? `
        <div style="page-break-before: always; margin-top: 60px;">
          <h2 style="text-align: center; color: #1f2937; border-bottom: 2px solid #1f2937; padding-bottom: 10px;">ANNEXURE - A: COMPENSATION DETAILS</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; border: 1px solid #d1d5db; text-align: left;">Salary Component</th>
              <th style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">Amount per Annum</th>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Basic Salary</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40)) : '[40% of CTC]'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">House Rent Allowance (HRA)</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.50)) : '[20% of CTC]'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Provident Fund (Employer PF)</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.12)) : '[12% of Basic]'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Gratuity</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.0481)) : '[4.81% of Basic]'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Special Allowance</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc ? new Intl.NumberFormat('en-IN').format(
                  (parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) 
                  - Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40)
                  - Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.50)
                  - Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.12)
                  - Math.round((parseInt(String(formData.ctc).replace(/\D/g, '')) || 0) * 0.40 * 0.0481)
                ) : '[Balance]'}</td>
            </tr>
            <tr style="background-color: #f3f4f6; font-weight: bold;">
              <td style="padding: 12px; border: 1px solid #d1d5db;">Total Cost to Company (CTC)</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right;">${formData.ctc}
            </tr>
          </table>
        </div>
        ` : ''}
      </div>
    `;
  };

  useEffect(() => {
    // Only update edited content if not actively typing to avoid override,
    // or when the selected template actually changes.
    setEditedContent(templateType === "offer" ? generateOfferLetter() : generateAppointmentLetter());
  }, [formData, selectedTemplateContent, templateType, selectedTemplateId]); // Included formData and selectedTemplateId so form and dropdown update the template

  const handleDownload = () => {
    const content = editedContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${templateType === "offer" ? "Offer Letter" : "Appointment Letter"}</title>
          <style>
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleCreateOffer = async () => {
    if (templateType !== "offer") {
      toast.error("Please select Offer Letter template to create an offer");
      return;
    }

    // Validate required fields
    if (!formData.candidateId) {
      toast.error("Please select a candidate");
      return;
    }
    if (!selectedTemplateId) {
      if (!formData.jobTitle || !formData.ctc || !formData.designation || !formData.joiningDate) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    try {
      setLoading(true);
      const offerData = {
        candidateId: parseInt(formData.candidateId),
        jobTitle: formData.jobTitle || "As per custom template",
        ctc: formData.ctc || "As per custom template",
        designation: formData.designation || "As per custom template",
        joiningDate: formData.joiningDate || new Date().toISOString(),
        notes: formData.notes || "",
        offerLetterHtml: editedContent
      };

      await recruiterService.createOffer(offerData);
      toast.success("Offer created successfully! It will appear in the offers list with PENDING status.");
      router.push("/recruiter/offers");
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error(error.message || "Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (templateType === "offer") {
      handleCreateOffer();
    } else {
      toast.success("Template saved successfully!");
      // Here you can add API call to save the appointment letter template
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Offers", href: "/recruiter/offers" },
          { label: "Letter Templates", href: "/recruiter/offers/templates" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/recruiter/offers"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Letter Templates
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create and preview offer letters and appointment letters
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Template
            </button>
            {templateType === "offer" ? (
              <button
                onClick={handleCreateOffer}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {loading ? "Creating..." : "Create Offer"}
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Template
              </button>
            )}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download/Print
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Type
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setTemplateType("offer")}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${templateType === "offer"
                  ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500 dark:text-brand-400"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
              >
                Offer Letter
              </button>
              <button
                onClick={() => setTemplateType("appointment")}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${templateType === "appointment"
                  ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500 dark:text-brand-400"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
              >
                Appointment Letter
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Default {templateType === 'offer' ? 'Offer' : 'Appointment'} Template</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.templateName}</option>
                ))}
              </select>
            </div>

            {templateType === "offer" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Candidate <span className="text-red-500">*</span>
                </label>
                <select
                  name="candidateId"
                  value={formData.candidateId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a candidate</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.jobTitle}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!selectedTemplateId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Candidate/Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    value={formData.candidateName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter candidate name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Senior"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Engineering"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CTC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ctc"
                      value={formData.ctc}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., ₹10,00,000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                    <DatePickerField
                      id="joining-date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={(dateStr) => setFormData((prev) => ({ ...prev, joiningDate: dateStr }))}
                      placeholder="Select joining date"
                      className="rounded-lg"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  {templateType === "offer" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Offer Expiry Date
                      </label>
                      <DatePickerField
                        id="offer-expiry-date"
                        name="offerExpiryDate"
                        value={formData.offerExpiryDate}
                        onChange={(dateStr) => setFormData((prev) => ({ ...prev, offerExpiryDate: dateStr }))}
                        placeholder="Select expiry date"
                        className="rounded-lg"
                        min={formData.joiningDate || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  )}
                  {templateType === "appointment" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., EMP001"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Employment Type
                    </label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="FULL_TIME">Full-time</option>
                      <option value="PART_TIME">Part-time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Work Location
                    </label>
                    <input
                      type="text"
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Remote / Office"
                    />
                  </div>
                </div>

                {templateType === "appointment" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Probation Period
                      </label>
                      <input
                        type="text"
                        name="probationPeriod"
                        value={formData.probationPeriod}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., 3 months"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Working Hours
                      </label>
                      <input
                        type="text"
                        name="workingHours"
                        value={formData.workingHours}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., 9:00 AM - 6:00 PM"
                      />
                    </div>
                  </div>
                )}


                {templateType === "offer" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notice Period
                      </label>
                      <input
                        type="text"
                        name="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., 30 days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Add any notes about this offer..."
                      />
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Company Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Address
                      </label>
                      <textarea
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          HR Name
                        </label>
                        <input
                          type="text"
                          name="hrName"
                          value={formData.hrName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          HR Email
                        </label>
                        <input
                          type="email"
                          name="hrEmail"
                          value={formData.hrEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview & Edit
            </h3>
            <span className="text-xs text-brand-500 bg-brand-50 px-2 py-1 rounded dark:bg-brand-500/10">
              Form edits will reset manual changes
            </span>
          </div>
          <div className="flex-1 bg-white flex flex-col">
            <ReactQuill
              theme="snow"
              value={editedContent}
              onChange={setEditedContent}
              className="h-[calc(100vh-300px)] flex flex-col [&_.ql-container]:flex-1 [&_.ql-container]:overflow-hidden [&_.ql-editor]:h-full [&_.ql-editor]:overflow-y-auto"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['clean']
                ]
              }}
            />
          </div>
        </div>
      </div>

      <UploadTemplateModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setIsUploadModalOpen(false);
          fetchTemplates();
        }}
      />
    </div>
  );
}

function UploadTemplateModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    template_name: "",
    template_type: "offer",
  });
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.template_name || !file) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const uploadData = new FormData();
      uploadData.append('template_name', formData.template_name);
      uploadData.append('template_type', formData.template_type);
      uploadData.append('file', file);

      await recruiterService.uploadTemplate(uploadData);
      toast.success("Template uploaded successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error uploading template:", error);
      toast.error(error.message || "Failed to upload template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Template</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Name *</label>
            <input
              type="text"
              required
              value={formData.template_name}
              onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Type *</label>
            <select
              value={formData.template_type}
              onChange={(e) => setFormData(prev => ({ ...prev, template_type: e.target.value }))}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="offer">Offer Letter</option>
              <option value="appointment">Appointment Letter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload File (.html or .docx)*</label>
            <input
              type="file"
              required
              accept=".html,.htm,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
