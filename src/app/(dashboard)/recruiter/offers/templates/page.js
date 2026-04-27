"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Calculator, Eye, Plus, Save } from "lucide-react";
import mammoth from "mammoth";
import { saveAs } from "file-saver";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { salaryTemplateService } from "@/services/payroll-role-services/salary-templates.service";

import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const DEFAULT_TEMPLATE = `
  <p><strong>Date:</strong> {{Date}}</p>
  <p>{{FirstName}} {{LastName}}</p>
  <p>{{Location}}</p>
  <p><strong>Subject:</strong> Offer for the position of {{JobTitle}}</p>
  <p>Dear {{FirstName}},</p>
  <p>
    We are pleased to offer you the position of <strong>{{JobTitle}}</strong> at {{CompanyName}}.
    Your annual CTC will be {{CTC}}.
  </p>
  <p>
    Your date of joining is {{DateOfJoining}} and this offer is valid until {{OfferExpiryDate}}.
  </p>
  <p>Regards,</p>
  <p>{{CompanyName}}</p>
`;

const DEFAULT_INTERNSHIP_TEMPLATE = `
  <p><strong>Date:</strong> {{Date}}</p>
  <p><strong>Internship Offer Letter</strong></p>
  <p><strong>To,</strong></p>
  <p><strong>{{EmpName}}</strong></p>
  <p><strong>Subject:</strong> Internship Offer for the position of {{Designation}}</p>
  <p>Dear {{EmpName}},</p>
  <p>
    We are pleased to offer you an internship at {{CompanyName}} for the position of
    <strong>{{Designation}}</strong>.
  </p>
  <p><strong>Internship Period:</strong> {{InternshipPeriod}}</p>
  <p><strong>Office Location:</strong> {{OfficeLocation}}</p>
  <p><strong>Duration Details:</strong> {{DurationDetails}}</p>
  <p>
    Please report to the above location on the start date and follow the policies
    and guidelines of the organization during your internship.
  </p>
  <p>Best Regards,</p>
  <p>{{CompanyName}}</p>
`;

const PLACEHOLDER_ALIASES = {
  Salutation: ["Salutation", "Title"],
  EmpName: ["Emp Name", "Employee Name", "Candidate Name", "Name", "Full Name"],
  FirstName: ["First Name"],
  LastName: ["Last Name"],
  JobTitle: ["Job Title", "Designation", "Position"],
  Location: ["Location"],
  WorkLocation: ["Work Location", "Place of Work"],
  DateOfJoining: ["Date of Joining", "Joining Date", "Start Date"],
  OfferExpiryDate: ["Offer Expiry Date", "Expiry Date"],
  Email: ["Email", "HR Email"],
  Mobile: ["Mobile", "Phone", "Contact"],
  CTC: ["CTC", "Annual CTC", "Salary", "Rs", "Rs. 0000000/-", "Rs.0000000/-"],
  AadharNumber: ["Aadhar Number", "Aadhaar Number"],
  ProbationPeriod: ["Probation Period"],
  NoticePeriod: ["Notice Period"],
  InternshipPeriod: ["Internship Period", "Intern Period"],
  OfficeLocation: ["Office Location", "Location of Office"],
  DurationDetails: ["Duration Details", "Duration"],
  Designation: ["Designation", "Role", "Position"],
  CompanyName: ["Company Name", "Company"],
  CompanyAddress: ["Company Address", "Address"],
  CompanyContact: ["Company Contact", "Contact"],
  Date: ["Date"],
};

const buildAliasPattern = (alias) => {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(/\\\s+/g, "(?:\\\\s|&nbsp;)+");
};

const toTextContent = (html = "") => {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, " ");
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const detectTemplateType = (html = "") => {
  const text = toTextContent(html).toLowerCase();
  if (text.includes("internship") || text.includes("stipend") || text.includes("trainee")) {
    return "INTERNSHIP";
  }
  return "FULL_TIME";
};

const detectTemplateTypeFromText = (text = "") => {
  const lower = (text || "").toLowerCase();
  if (lower.includes("internship") || lower.includes("stipend") || lower.includes("trainee")) {
    return "INTERNSHIP";
  }
  return "FULL_TIME";
};

const normalizePlaceholder = (value) =>
  (value || "")
    .toString()
    .replace(/^[\"'“”‘’]+|[\"'“”‘’]+$/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();

const decodeHtml = (value) => {
  if (!value) return "";
  if (typeof window === "undefined") {
    return value
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&laquo;/g, "«")
      .replace(/&raquo;/g, "»")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const extractTemplatePlaceholders = (template) => {
  const placeholders = new Set();
  if (!template) return [];
  const htmlTags = new Set([
    "p",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "span",
    "div",
    "br",
    "hr",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "td",
    "th",
    "ul",
    "ol",
    "li",
    "img",
    "a",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ]);
  const decodedHtml = decodeHtml(template);
  const decodedText =
    typeof window !== "undefined"
      ? new DOMParser().parseFromString(decodedHtml, "text/html").body.textContent || ""
      : decodedHtml.replace(/<[^>]*>/g, " ");

  const collect = (source) => {
    const regex = /{{\s*([^}]+)\s*}}|<<\s*([^>]+)\s*>>|<\s*([^>]+)\s*>|«\s*([^»]+)\s*»/g;
    let match;
    while ((match = regex.exec(source)) !== null) {
      const raw = (match[1] || match[2] || match[3] || match[4] || "").trim();
      if (!raw) continue;
      const cleaned = raw.replace(/^[\"'“”‘’]+|[\"'“”‘’]+$/g, "").trim();
      if (!cleaned) continue;
      let normalized = cleaned.replace(/\s+/g, " ").trim();
      if (normalized.includes(",")) {
        normalized = normalized.split(",")[0].trim();
      }
      const normalizedLower = normalized.toLowerCase();
      const firstToken = normalizedLower.split(/\s+/)[0];
      if (normalizedLower.startsWith("/")) continue;
      if (htmlTags.has(normalizedLower) || htmlTags.has(firstToken)) continue;
      if (normalized.includes("=")) continue;
      if (/^<\/?\s*strong$/i.test(normalized)) continue;
      if (/^<\/?\s*<*\s*strong\s*>*$/i.test(normalized)) continue;
      if (/^rs\.?\s*\d+/i.test(normalized)) {
        placeholders.add("CTC");
        continue;
      }
      if (/^\d+\s+earned\s+leaves?$/i.test(normalized)) continue;
      if (/^\d+\s+national\s+holidays?$/i.test(normalized)) continue;
      if (/^\d+\s+days?$/i.test(normalized)) continue;
      if (normalized) placeholders.add(normalized);
    }
  };

  collect(decodedHtml);
  collect(decodedText);
  return Array.from(placeholders);
};

const KEY_FIELDS = ["Work Location", "Probation Period", "Notice Period"];

const extractKeyFieldsFromText = (value = "") => {
  const found = [];
  const lower = value.toLowerCase();
  KEY_FIELDS.forEach((field) => {
    if (lower.includes(field.toLowerCase())) found.push(field);
  });
  return found;
};

const isValidPlaceholder = (value = "") => {
  const cleaned = value.replace(/^[\"'“”‘’]+|[\"'“”‘’]+$/g, "").trim();
  if (!cleaned) return false;
  if (cleaned.includes("<") || cleaned.includes(">")) return false;
  if (!/^[A-Za-z0-9 ]+$/.test(cleaned)) return false;
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  return wordCount >= 1 && wordCount <= 3;
};

const extractPlaceholdersFromText = (text = "") => {
  const placeholders = new Set();
  if (!text) return [];
  const sanitized = text.replace(/<[^>]*<[^>]*>[^>]*>/g, " ");
  const regex = /<([^>]+)>/g;
  let match;
  while ((match = regex.exec(sanitized)) !== null) {
    const raw = (match[1] || "").trim();
    if (!raw) continue;
    const cleaned = raw.replace(/^[\"'“”‘’]+|[\"'“”‘’]+$/g, "").trim();
    if (!cleaned) continue;
    const lower = cleaned.toLowerCase();
    const keyHits = extractKeyFieldsFromText(cleaned);
    keyHits.forEach((field) => placeholders.add(field));
    if (cleaned.includes(",")) {
      const parts = cleaned.split(",").map((part) => part.trim()).filter(Boolean);
      parts.forEach((part) => {
        const partLower = part.toLowerCase();
        if (partLower.includes("ctc") || partLower.includes("rs")) {
          placeholders.add("CTC");
          return;
        }
        const partKeyHits = extractKeyFieldsFromText(part);
        partKeyHits.forEach((field) => placeholders.add(field));
        if (isValidPlaceholder(part)) {
          placeholders.add(part);
        }
      });
      continue;
    }
    if (lower.includes("ctc") || lower.includes("rs")) {
      placeholders.add("CTC");
      continue;
    }
    if (!isValidPlaceholder(cleaned)) continue;
    placeholders.add(cleaned);
  }
  KEY_FIELDS.forEach((field) => placeholders.add(field));
  return Array.from(placeholders);
};

const normalizeKey = (value) =>
  (value || "")
    .toString()
    .replace(/^[\"'“”‘’]+|[\"'“”‘’]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const normalizeSalaryKey = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const toTitleCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());

const FIELD_LABEL_OVERRIDES = {
  probationperiod: "Probation Period",
  noticeperiod: "Notice Days",
  noticedays: "Notice Days",
  nationalholidays: "National Holidays",
  earnedleaves: "Earned Leaves",
  earnedleave: "Earned Leaves",
  adhaarnumber: "Aadhaar Number",
  aadharnumber: "Aadhaar Number",
  aadhar: "Aadhaar Number",
  empname: "Emp Name",
  employeename: "Employee Name",
  worklocation: "Work Location",
  internshipperiod: "Internship Period",
  officelocation: "Office Location",
  durationdetails: "Duration Details",
  designation: "Designation",
};

const getFieldLabel = (rawKey) => {
  const normalized = normalizeKey(rawKey).replace(/\s+/g, "");
  if (FIELD_LABEL_OVERRIDES[normalized]) return FIELD_LABEL_OVERRIDES[normalized];
  return toTitleCase(rawKey);
};

const buildKnownPlaceholderSet = () => {
  const known = new Set();
  Object.keys(PLACEHOLDER_ALIASES).forEach((key) => {
    known.add(normalizeKey(key));
    (PLACEHOLDER_ALIASES[key] || []).forEach((alias) => known.add(normalizeKey(alias)));
  });
  ["FullName", "EmpName", "EmployeeName", "CandidateName", "CompanyName"].forEach((k) =>
    known.add(normalizeKey(k))
  );
  return known;
};

export default function LetterTemplatesPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [templateHtml, setTemplateHtml] = useState(DEFAULT_TEMPLATE);
  const [templateName, setTemplateName] = useState("Offer Letter");
  const [templateType, setTemplateType] = useState("FULL_TIME");
  const [footerText, setFooterText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [renderedDocxBuffer, setRenderedDocxBuffer] = useState(null);
  const [templatePlaceholders, setTemplatePlaceholders] = useState([]);
  const [pdfPreviewDisabled, setPdfPreviewDisabled] = useState(false);
  const docxContainerRef = useRef(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyName, setCompanyName] = useState("Zodeck Technologies Pvt. Ltd.");
  const [companyAddress, setCompanyAddress] = useState("Shilpa Park, Kondapur, Hyderabad 500084");
  const [companyContact, setCompanyContact] = useState("+91 73863 88859 | zodeck.com");
  const isDocxTemplate = Boolean(uploadedFile);
  const [isParsingTemplate, setIsParsingTemplate] = useState(false);
  const [salaryTemplates, setSalaryTemplates] = useState([]);
  const [salaryTemplateId, setSalaryTemplateId] = useState("");
  const [selectedSalaryTemplate, setSelectedSalaryTemplate] = useState(null);
  const [salaryBreakdown, setSalaryBreakdown] = useState(null);

  const [form, setForm] = useState({
    Salutation: "",
    EmpName: "",
    FirstName: "",
    LastName: "",
    JobTitle: "",
    Location: "",
    WorkLocation: "",
    DateOfJoining: "",
    OfferExpiryDate: "",
    Email: "",
    Mobile: "",
    CTC: "",
    AadharNumber: "",
    ProbationPeriod: "",
    NoticePeriod: "",
    InternshipPeriod: "",
    OfficeLocation: "",
    DurationDetails: "",
    Designation: "",
    Date: new Date().toLocaleDateString("en-GB"),
    CompanyName: companyName,
  });
  const [dynamicFields, setDynamicFields] = useState({});

  const templatePlaceholdersMemo = useMemo(
    () => extractTemplatePlaceholders(templateHtml),
    [templateHtml]
  );
  const templatePlaceholdersEffective = templatePlaceholders.length
    ? templatePlaceholders
    : templatePlaceholdersMemo;
  const knownPlaceholderSet = useMemo(() => buildKnownPlaceholderSet(), []);
  const aliasToCanonical = useMemo(() => {
    const map = new Map();
    Object.keys(PLACEHOLDER_ALIASES).forEach((key) => {
      map.set(normalizeKey(key), key);
      (PLACEHOLDER_ALIASES[key] || []).forEach((alias) =>
        map.set(normalizeKey(alias), key)
      );
    });
    return map;
  }, []);
  const candidatePlaceholderKeys = useMemo(
    () => templatePlaceholdersEffective,
    [templatePlaceholdersEffective]
  );
  const dynamicPlaceholderKeys = useMemo(() => {
    if (isDocxTemplate) return templatePlaceholdersEffective;
    return templatePlaceholdersEffective.filter((key) => !knownPlaceholderSet.has(normalizeKey(key)));
  }, [templatePlaceholdersEffective, knownPlaceholderSet, isDocxTemplate]);

  useEffect(() => {
    setDynamicFields((prev) => {
      const next = { ...prev };
      dynamicPlaceholderKeys.forEach((key) => {
        if (!(key in next)) next[key] = "";
      });
      Object.keys(next).forEach((key) => {
        if (!dynamicPlaceholderKeys.includes(key)) {
          delete next[key];
        }
      });
      return next;
    });
  }, [dynamicPlaceholderKeys]);

  useEffect(() => {
    if (!templatePlaceholders.length) {
      setTemplateType(detectTemplateType(templateHtml));
    }
  }, [templateHtml, templatePlaceholders]);

  useEffect(() => {
    let alive = true;
    salaryTemplateService
      .getTemplates()
      .then((response) => {
        if (!alive) return;
        const data = response?.data?.data || response?.data?.templates || response?.data || [];
        setSalaryTemplates(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (alive) setSalaryTemplates([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (uploadedFile) return;
    if (templateType === "INTERNSHIP") {
      setTemplateHtml(DEFAULT_INTERNSHIP_TEMPLATE);
      if (!templateName) setTemplateName("Internship Offer Letter");
    } else if (templateType === "FULL_TIME") {
      setTemplateHtml(DEFAULT_TEMPLATE);
      if (!templateName) setTemplateName("Offer Letter");
    }
  }, [templateType, uploadedFile]);

  const toolbarOptions = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }, { size: [] }],
        ["bold", "italic", "underline"],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "table"],
        ["clean"],
      ],
    }),
    []
  );

  const replacementMap = useMemo(() => {
    if (isDocxTemplate) {
      const next = {};
      templatePlaceholdersEffective.forEach((key) => {
        next[key] = dynamicFields[key] ?? "";
      });
      return next;
    }
    const fullName =
      form.EmpName || [form.FirstName, form.LastName].filter(Boolean).join(" ").trim();
    return {
      ...dynamicFields,
      ...form,
      FullName: fullName,
      EmpName: fullName,
      EmployeeName: fullName,
      CandidateName: fullName,
      Designation: form.Designation || form.JobTitle || "",
      CompanyName: companyName,
      CompanyAddress: companyAddress,
      CompanyContact: companyContact,
      Date: form.Date || new Date().toLocaleDateString("en-GB"),
    };
  }, [
    isDocxTemplate,
    templatePlaceholdersEffective,
    dynamicFields,
    form,
    companyName,
    companyAddress,
    companyContact,
  ]);

  const salaryPlaceholderMap = useMemo(() => {
    if (!salaryBreakdown) return {};
    const map = {};
    const add = (label, amount) => {
      if (!label) return;
      const normalized = normalizeSalaryKey(label);
      if (!normalized) return;
      map[normalized] = Number.isFinite(amount)
        ? Math.round(amount).toLocaleString("en-IN")
        : "";
    };

    add("Monthly CTC", salaryBreakdown.monthlyCTC);
    add("CTC Monthly", salaryBreakdown.monthlyCTC);
    add("Basic", salaryBreakdown.basic);
    add("Basic Salary", salaryBreakdown.basic);
    add("HRA", salaryBreakdown.hra);
    add("House Rent Allowance", salaryBreakdown.hra);
    add("Special Allowance", salaryBreakdown.specialAllowance);

    (salaryBreakdown.earnings || []).forEach((item) => add(item.name, item.amount));
    (salaryBreakdown.deductions || []).forEach((item) => add(item.name, item.amount));

    return map;
  }, [salaryBreakdown]);

  const replacementMapWithSalary = useMemo(() => {
    const merged = { ...replacementMap };
    if (!candidatePlaceholderKeys.length || !Object.keys(salaryPlaceholderMap).length) {
      return merged;
    }
    candidatePlaceholderKeys.forEach((key) => {
      const normalized = normalizeSalaryKey(key);
      const value = salaryPlaceholderMap[normalized];
      if (value === undefined) return;
      if (merged[key] === undefined || merged[key] === "") {
        merged[key] = value;
      }
    });
    return merged;
  }, [replacementMap, candidatePlaceholderKeys, salaryPlaceholderMap]);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const handleDynamicFieldChange = (key, value) => {
    setDynamicFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSalaryTemplateChange = async (value) => {
    setSalaryTemplateId(value);
    if (!value) {
      setSelectedSalaryTemplate(null);
      return;
    }
    const localTemplate = salaryTemplates.find((tpl) => {
      const id = String(tpl.id ?? tpl.templateId ?? tpl.salaryTemplateId ?? "");
      return id === String(value);
    });
    if (localTemplate?.components?.length) {
      setSelectedSalaryTemplate(localTemplate);
      return;
    }
    try {
      const response = await salaryTemplateService.getTemplateById(value);
      const template = response?.data?.data || response?.data || null;
      if (template) setSelectedSalaryTemplate(template);
    } catch (err) {
      console.error("Failed to fetch salary template:", err);
      setSelectedSalaryTemplate(null);
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCompanyLogoUrl(objectUrl);
  };

  const handleDocxUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadedFile(file);
      setTemplateHtml("");
      setTemplatePlaceholders([]);
      setIsParsingTemplate(true);
      const arrayBuffer = await file.arrayBuffer();
      let placeholders = [];
      let detectedType = "FULL_TIME";
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result?.value || "";
        const text =
          typeof window !== "undefined"
            ? new DOMParser().parseFromString(html, "text/html").body.textContent || ""
            : html.replace(/<[^>]*>/g, " ");
        placeholders = extractPlaceholdersFromText(text);
        detectedType = detectTemplateTypeFromText(text);
      } catch (parseError) {
        const extractForm = new FormData();
        extractForm.append("file", file);
        const extracted = await recruiterService.extractTemplateFields(extractForm);
        placeholders = extracted?.data?.placeholders || [];
        detectedType = extracted?.data?.templateType || "FULL_TIME";
      }
      setTemplatePlaceholders(placeholders);
      setTemplateType(detectedType);
    } catch (err) {
      console.error("Failed to read DOCX:", err);
    } finally {
      setIsParsingTemplate(false);
    }
  };

  useEffect(() => {
    if (!uploadedFile) return;
    let alive = true;
    const timer = setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("fields", JSON.stringify(replacementMapWithSalary));
        const buffer = await recruiterService.renderTemplatePreview(formData);
        if (!alive) return;
        setRenderedDocxBuffer(buffer);
      } catch (err) {
        if (alive) {
          setRenderedDocxBuffer(null);
          console.error("Failed to render DOCX preview:", err);
        }
      }
    }, 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [uploadedFile, replacementMapWithSalary]);

  useEffect(() => {
    if (!selectedSalaryTemplate) {
      setSalaryBreakdown(null);
      return;
    }
    const resolveCtcValue = () => {
      if (!isDocxTemplate) return form.CTC;
      const matchedKey = candidatePlaceholderKeys.find((key) => {
        const normalized = normalizeKey(key);
        const canonical = aliasToCanonical.get(normalized);
        return canonical === "CTC" || normalized.includes("ctc") || normalized.includes("salary");
      });
      if (matchedKey) return dynamicFields[matchedKey];
      return dynamicFields.CTC || form.CTC;
    };
    const annualCtc = parseFloat(resolveCtcValue());
    if (!annualCtc || Number.isNaN(annualCtc)) {
      setSalaryBreakdown(null);
      return;
    }

    const monthlyCTC = annualCtc / 12;
    const components = [...(selectedSalaryTemplate.components || [])].sort((a, b) => {
      const nameA = (a.component?.name || "").toLowerCase();
      const nameB = (b.component?.name || "").toLowerCase();
      if (nameA.includes("basic")) return -1;
      if (nameB.includes("basic")) return 1;
      return 0;
    });

    let basicVal = 0;
    let hraVal = 0;
    const earnings = [];
    const deductions = [];

    components.forEach((tc) => {
      const comp = tc.component;
      if (!comp) return;

      let value =
        tc.overrideValue !== null && tc.overrideValue !== undefined ? tc.overrideValue : comp.value;
      const calcType = tc.overrideCalculationType || comp.calculationType;
      const name = (comp.name || "").toLowerCase();

      if (calcType === "PERCENTAGE_OF_CTC" && monthlyCTC > 0) {
        value = Math.round((value / 100) * monthlyCTC);
      } else if (calcType === "PERCENTAGE_OF_BASIC" && basicVal > 0) {
        value = Math.round((value / 100) * basicVal);
      }

      if (comp.maxAmount && value > comp.maxAmount) value = comp.maxAmount;
      if (comp.eligibilityThreshold && basicVal > comp.eligibilityThreshold) value = 0;

      if (name.includes("basic")) {
        basicVal = value || 0;
        return;
      }
      if (name === "hra") {
        hraVal = value || 0;
        return;
      }
      if (name.includes("special allowance")) {
        return;
      }
      if ((comp.type || "").toUpperCase() === "DEDUCTION") {
        deductions.push({ name: comp.name, amount: value || 0 });
        return;
      }
      earnings.push({ name: comp.name, amount: value || 0 });
    });

    const totalEarnings =
      basicVal + hraVal + earnings.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0);
    const specialAllowance = Math.max(0, Math.round(monthlyCTC - totalEarnings - totalDeductions));

    setSalaryBreakdown({
      monthlyCTC,
      basic: basicVal,
      hra: hraVal,
      specialAllowance,
      earnings,
      deductions,
      netMonthly: Math.round(monthlyCTC - totalDeductions),
    });
  }, [
    selectedSalaryTemplate,
    form.CTC,
    isDocxTemplate,
    candidatePlaceholderKeys,
    dynamicFields,
    aliasToCanonical,
  ]);

  useEffect(() => {
    if (!Object.keys(salaryPlaceholderMap).length) return;
    setDynamicFields((prev) => {
      let changed = false;
      const next = { ...prev };
      candidatePlaceholderKeys.forEach((key) => {
        const canonicalKey = isDocxTemplate ? null : aliasToCanonical.get(normalizeKey(key));
        if (canonicalKey) return;
        const normalized = normalizeSalaryKey(key);
        const value = salaryPlaceholderMap[normalized];
        if (value === undefined) return;
        if (next[key] !== value) {
          next[key] = value;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [salaryPlaceholderMap, candidatePlaceholderKeys, aliasToCanonical, isDocxTemplate]);

  useEffect(() => {
    if (!renderedDocxBuffer || !docxContainerRef.current) return;
    let alive = true;
    import("docx-preview").then((docxPreview) => {
      if (!alive || !docxContainerRef.current) return;
      docxContainerRef.current.innerHTML = "";
      docxPreview.default.renderAsync(renderedDocxBuffer, docxContainerRef.current, undefined, {
        className: "docx-preview",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
      });
    });
    return () => {
      alive = false;
    };
  }, [renderedDocxBuffer]);

  const handleExportPdf = async () => {
    if (!uploadedFile) return;
    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("fields", JSON.stringify(replacementMapWithSalary));
    try {
      const pdfBuffer = await recruiterService.renderTemplatePdf(formData);
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      saveAs(blob, `${templateName || "offer-template"}.pdf`);
    } catch (err) {
      if (err?.status === 501) {
        alert("PDF export requires LibreOffice (soffice) installed on the server.");
        return;
      }
      console.error("Failed to export PDF:", err);
    }
  };

  const handleExportDocx = () => {
    if (!uploadedFile) return;
    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("fields", JSON.stringify(replacementMapWithSalary));
    recruiterService.renderTemplatePreview(formData).then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      saveAs(blob, `${templateName || "offer-template"}.docx`);
    });
  };

  const handleSaveTemplate = async () => {
    try {
      const payload = {
        template_name: templateName,
        template_type: templateType,
        html_content: templateHtml,
        template_fields: templatePlaceholdersEffective,
        salary_config: {
          basic: 0.4,
          hra: 0.5,
          pf: 0.12,
          gratuity: 0.0481,
        },
      };
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("template_name", templateName);
        formData.append("template_type", templateType);
        formData.append("template_fields", JSON.stringify(templatePlaceholdersEffective));
        formData.append(
          "salary_config",
          JSON.stringify(payload.salary_config)
        );
        await recruiterService.uploadTemplate(formData);
      } else {
        await recruiterService.createTemplate(payload);
      }
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Offer Letter Templates</p>
            <h1 className="text-xl font-semibold text-gray-900">
              Offer Letter Template Management
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              type="button"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              type="button"
              onClick={handleExportPdf}
              disabled={pdfPreviewDisabled}
            >
              Export PDF
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              type="button"
              onClick={handleExportDocx}
            >
              Export DOCX
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
              type="button"
              onClick={handleSaveTemplate}
            >
              <Save className="h-4 w-4" />
              Save Template
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              type="button"
              onClick={() => setIsEditorOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Template
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr] min-h-0">
          <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Candidate Details</h2>
              <p className="text-sm text-gray-500">
                Fill the fields to generate a live preview.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {candidatePlaceholderKeys.length === 0 && !isDocxTemplate && !isParsingTemplate && (
                <p className="text-sm text-gray-500">
                  Upload a template to auto-generate fields.
                </p>
              )}
              {isParsingTemplate && (
                <p className="text-sm text-gray-500">Analyzing template fields…</p>
              )}
              {candidatePlaceholderKeys.map((key) => {
                const normalized = normalizeKey(key);
                const canonicalKey = isDocxTemplate ? null : aliasToCanonical.get(normalized);
                const isDate =
                  !isDocxTemplate &&
                  (canonicalKey === "DateOfJoining" ||
                    canonicalKey === "OfferExpiryDate" ||
                    canonicalKey === "Date");
                const isCtcField =
                  canonicalKey === "CTC" ||
                  normalized.includes("ctc") ||
                  normalized.includes("salary");
                const isNumber =
                  !isDate &&
                  (normalized.includes("ctc") ||
                    normalized.includes("salary") ||
                    normalized.includes("amount"));
                const value = (() => {
                  if (isDocxTemplate) return dynamicFields[key] || "";
                  if (canonicalKey === "CompanyName") return companyName;
                  if (canonicalKey === "CompanyAddress") return companyAddress;
                  if (canonicalKey === "CompanyContact") return companyContact;
                  if (canonicalKey) return form[canonicalKey] || "";
                  return dynamicFields[key] || "";
                })();
                const handleChange = (e) => {
                  const nextValue = e.target.value;
                  if (isDocxTemplate) {
                    handleDynamicFieldChange(key, nextValue);
                    return;
                  }
                  if (canonicalKey === "CompanyName") {
                    setCompanyName(nextValue);
                    return;
                  }
                  if (canonicalKey === "CompanyAddress") {
                    setCompanyAddress(nextValue);
                    return;
                  }
                  if (canonicalKey === "CompanyContact") {
                    setCompanyContact(nextValue);
                    return;
                  }
                  if (canonicalKey) {
                    handleFormChange(canonicalKey, nextValue);
                  } else {
                    handleDynamicFieldChange(key, nextValue);
                  }
                };
                return (
                  <div key={key} className={isCtcField ? "md:col-span-2" : ""}>
                    <label className="text-sm font-medium text-gray-700">
                      {isDocxTemplate ? key : getFieldLabel(key)}
                    </label>
                    <input
                      type={isDate ? "date" : isNumber ? "number" : "text"}
                      value={value}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                      placeholder={`Enter ${isDocxTemplate ? key : getFieldLabel(key)}`}
                    />
                    {isCtcField && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700">
                          Salary Template
                        </label>
                        <select
                          value={salaryTemplateId}
                          onChange={(e) => handleSalaryTemplateChange(e.target.value)}
                          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm"
                        >
                          <option value="">Select salary template</option>
                          {salaryTemplates.map((tpl) => {
                            const id = tpl.id ?? tpl.templateId ?? tpl.salaryTemplateId;
                            const label =
                              tpl.name ||
                              tpl.templateName ||
                              tpl.title ||
                              (id ? `Template ${id}` : "Template");
                            return (
                              <option key={id || label} value={id || label}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                        {salaryBreakdown && (
                          <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                              <Calculator className="h-4 w-4 text-indigo-600" />
                              Monthly Salary Breakdown
                            </div>
                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Monthly CTC</span>
                                <span className="font-medium text-gray-900">
                                  ₹{Math.round(salaryBreakdown.monthlyCTC || 0).toLocaleString("en-IN")}
                                </span>
                              </div>
                              {salaryBreakdown.basic > 0 && (
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span>Basic</span>
                                  <span className="font-medium text-gray-900">
                                    ₹{Math.round(salaryBreakdown.basic || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              )}
                              {salaryBreakdown.hra > 0 && (
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span>HRA</span>
                                  <span className="font-medium text-gray-900">
                                    ₹{Math.round(salaryBreakdown.hra || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              )}
                              {(salaryBreakdown.earnings || []).map((item, idx) => (
                                <div
                                  key={`earn-${idx}`}
                                  className="flex items-center justify-between text-xs text-gray-600"
                                >
                                  <span>{item.name}</span>
                                  <span className="font-medium text-gray-900">
                                    ₹{Math.round(item.amount || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              ))}
                              {salaryBreakdown.specialAllowance > 0 && (
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span>Special Allowance</span>
                                  <span className="font-medium text-gray-900">
                                    ₹{Math.round(salaryBreakdown.specialAllowance || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              )}
                              {(salaryBreakdown.deductions || []).map((item, idx) => (
                                <div
                                  key={`ded-${idx}`}
                                  className="flex items-center justify-between text-xs text-rose-600"
                                >
                                  <span>{item.name}</span>
                                  <span className="font-medium">
                                    ₹{Math.round(item.amount || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              ))}
                              <div className="md:col-span-2 mt-2 flex items-center justify-between rounded-md bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
                                <span className="font-semibold">Estimated Net (Monthly)</span>
                                <span className="text-sm font-bold text-indigo-700">
                                  ₹{Math.round(salaryBreakdown.netMonthly || 0).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {candidatePlaceholderKeys.length === 0 && !isDocxTemplate && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-800">Company Settings</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Contact</label>
                    <input
                      value={companyContact}
                      onChange={(e) => setCompanyContact(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Company Address</label>
                    <textarea
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      rows={2}
                      className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-800">Company Logo</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                />
                <input
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
                  placeholder="Footer text"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-0">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-500">Final rendered letter preview.</p>

            <div className="mt-6 overflow-y-auto max-h-[calc(100vh-220px)] min-h-[420px]">
              <div className="flex justify-center py-6">
                <div className="docx-page">
                  {renderedDocxBuffer ? (
                    <div ref={docxContainerRef} className="docx-preview" />
                  ) : (
                    <div className="docx-preview">
                      <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-600">
                        Upload a DOCX template to render the exact layout preview.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Template Editor</h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
                type="button"
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Template Name</label>
                    <input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      placeholder="Offer Letter Template"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Template Type</label>
                    <select
                      value={templateType}
                      onChange={(e) => setTemplateType(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="FULL_TIME">Full-Time Offer</option>
                      <option value="INTERNSHIP">Internship Offer</option>
                    </select>
                  </div>
                </div>
                <label className="mt-4 block text-sm font-medium text-gray-700">
                  Upload Offer Letter Template (DOCX)
                </label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleDocxUpload}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Placeholders like <code>{"<Emp Name>"}</code> will become editable fields.
                </p>
              </div>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto pr-2">
              {uploadedFile ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  A DOCX template is uploaded. To preserve the original formatting, editing is
                  disabled here. Make changes in Word and re-upload the DOCX when needed.
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-gray-200">
                    <ReactQuill
                      value={templateHtml}
                      onChange={setTemplateHtml}
                      modules={toolbarOptions}
                      theme="snow"
                    />
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Tip: use placeholders like <code>{"{{FirstName}}"}</code>,{" "}
                    <code>{"{{JobTitle}}"}</code>, <code>{"{{CTC}}"}</code>.
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
      <style jsx global>{`
        .docx-page {
          width: min(900px, 100%);
          background: #ffffff;
          padding: 28px 32px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow-x: auto;
        }
        .docx-preview {
          max-width: 100%;
          font-family: "Times New Roman", Times, serif !important;
          font-size: 15px;
          line-height: 1.6;
        }
        .docx-preview * {
          font-family: "Times New Roman", Times, serif !important;
          font-size: 15px !important;
          line-height: 1.6 !important;
        }
        .docx-preview table {
          max-width: 100%;
        }
        .docx-preview img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
