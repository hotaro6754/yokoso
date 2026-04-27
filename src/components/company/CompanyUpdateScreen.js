"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { companyInfoService } from "@/services/employee/companyInfo.service";

const fallbackCompanyInfo = {
  companyName: "Zodeck Technologies",
  address: "Bengaluru, India",
  hrEmail: "hr@zodeck.com",
  supportEmail: "support@zodeck.com",
  contactNumber: "+91 80 0000 0000",
};

const fallbackPolicies = [
  { id: "attendance", title: "Attendance Policy", type: "ATTENDANCE", description: "Shift timings, punch-in rules, grace time, and attendance regularization guidance." },
  { id: "leave", title: "Leave Policy", type: "LEAVE", description: "Leave types, balances, approvals, carry-forward rules, and encashment notes." },
  { id: "payroll", title: "Payroll Policy", type: "PAYROLL", description: "Salary cycle, deductions, compliance references, and payout timelines." },
  { id: "expense", title: "Expense Policy", type: "EXPENSE", description: "Reimbursement limits, submission flow, approvals, and proof requirements." },
  { id: "custom-1", title: "Remote Work Guideline", type: "CUSTOM", description: "Custom company guidance for hybrid work, approvals, and availability expectations." },
  { id: "custom-2", title: "Travel & Client Visit Policy", type: "CUSTOM", description: "Custom rules for travel approvals, bookings, local travel, and settlement timelines." },
];

const policyTypeMap = {
  ATTENDANCE: {
    key: "ATTENDANCE",
    title: "Attendance Policy",
    subtitle: "Shift rules, biometric rules, grace time, and regularization flow.",
  },
  LEAVE: {
    key: "LEAVE",
    title: "Leave Policy",
    subtitle: "Leave types, carry-forward, approval flow, and balance usage.",
  },
  PAYROLL: {
    key: "PAYROLL",
    title: "Payroll Policy",
    subtitle: "Payroll cycle, deductions, payslip expectations, and tax references.",
  },
  EXPENSE: {
    key: "EXPENSE",
    title: "Expense Policy",
    subtitle: "Claim limits, receipts, approval chain, and reimbursement timelines.",
  },
};

const sectionIcons = {
  ATTENDANCE: FileText,
  LEAVE: FileText,
  PAYROLL: FileText,
  EXPENSE: FileText,
  CUSTOM: FileText,
};

const getBackendBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

export default function CompanyUpdateScreen() {
  const [companyInfo, setCompanyInfo] = useState(fallbackCompanyInfo);
  const [policies, setPolicies] = useState(fallbackPolicies);
  const [activePolicyTab, setActivePolicyTab] = useState("ATTENDANCE");

  useEffect(() => {
    const loadData = async () => {
      try {
        const company = await companyInfoService.getCompanyInfo();
        setCompanyInfo((prev) => ({ ...prev, ...(company || {}) }));
      } catch (error) {
        console.error("Error fetching company info:", error);
      }

      try {
        const policyResponse = await companyInfoService.getPublicPolicies();
        const policyData = Array.isArray(policyResponse?.data) ? policyResponse.data : [];
        if (policyData.length > 0) {
          setPolicies(policyData);
        }
      } catch (error) {
        console.error("Error fetching policies:", error);
      }

    };

    loadData();
  }, []);

  const toDisplayText = (value, fallback = "") => {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) {
      return value.map((item) => toDisplayText(item, "")).filter(Boolean).join(", ");
    }
    if (value && typeof value === "object") {
      return value.description || value.summary || value.name || value.title || value.label || fallback;
    }
    return fallback;
  };

  const normalizePolicyType = (policy) => {
    const rawType = policy?.type || policy?.policyType || policy?.category || policy?.module || "";
    const normalizedType = String(rawType).toUpperCase().replace(/\s+/g, "_");

    if (policyTypeMap[normalizedType]) {
      return normalizedType;
    }

    const title = String(policy?.title || policy?.name || "").toLowerCase();
    if (title.includes("attendance")) return "ATTENDANCE";
    if (title.includes("leave")) return "LEAVE";
    if (title.includes("payroll") || title.includes("salary")) return "PAYROLL";
    if (title.includes("expense") || title.includes("reimbursement")) return "EXPENSE";
    return "CUSTOM";
  };

  const getPolicyTitle = (policy, fallbackTitle) =>
    toDisplayText(policy?.title || policy?.name || policy?.policyName, fallbackTitle);

  const getPolicyDescription = (policy, fallbackText) =>
    toDisplayText(policy?.description || policy?.summary || policy?.details || policy?.content, fallbackText);

  const getPolicyDocumentUrl = (policy) => {
    const rawUrl = toDisplayText(
      policy?.documentUrl || policy?.policyDocumentUrl || policy?.rules?.policyDocumentUrl,
      ""
    );

    if (!rawUrl) return "";
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

    return `${getBackendBaseUrl()}${rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`}`;
  };

  const getPolicyDocumentName = (policy) =>
    toDisplayText(policy?.documentName || policy?.policyDocumentName || policy?.rules?.policyDocumentName, "Open policy PDF");

  const categorizedPolicies = useMemo(
    () => {
      const standardSections = Object.values(policyTypeMap).map((config) => {
        const matches = policies.filter((policy) => normalizePolicyType(policy) === config.key);
        return {
          ...config,
          items: matches.length
            ? matches
            : [{ id: `fallback-${config.key}`, title: config.title, description: config.subtitle }],
        };
      });

      return [
        ...standardSections,
        {
          key: "CUSTOM",
          title: "Custom Policies",
          subtitle: "Company-specific policies configured by HR Admin for read-only reference.",
          items: policies.filter((policy) => normalizePolicyType(policy) === "CUSTOM"),
        },
      ];
    },
    [policies]
  );

  const activePolicySection =
    categorizedPolicies.find((section) => section.key === activePolicyTab) ||
    categorizedPolicies[0];

  const infoCards = [
    {
      label: "Head Office",
      value: toDisplayText(companyInfo?.address, fallbackCompanyInfo.address),
      icon: MapPin,
    },
    {
      label: "HR Contact",
      value: toDisplayText(companyInfo?.hrEmail, fallbackCompanyInfo.hrEmail),
      icon: Mail,
    },
    {
      label: "Support Desk",
      value: toDisplayText(companyInfo?.supportEmail, fallbackCompanyInfo.supportEmail),
      icon: Mail,
    },
    {
      label: "Phone",
      value: toDisplayText(companyInfo?.contactNumber, fallbackCompanyInfo.contactNumber),
      icon: Phone,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <Breadcrumb />

      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Company Update
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View company information, all policy categories, custom policies, and holiday details in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Company Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Core company details and contact references.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Company Name
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {toDisplayText(companyInfo?.companyName, fallbackCompanyInfo.companyName)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {infoCards.map((card) => (
                  <div
                    key={card.label}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="rounded-md bg-gray-100 p-2 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      <card.icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {card.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {card.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Policy Overview
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Attendance, leave, payroll, expense, and custom policies in a single screen.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 px-5 dark:border-gray-700">
              <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Policy Tabs">
                {categorizedPolicies.map((section) => {
                  const Icon = sectionIcons[section.key] || FileText;
                  const isActive = activePolicyTab === section.key;

                  return (
                    <button
                      key={section.key}
                      onClick={() => setActivePolicyTab(section.key)}
                      className={`inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? "border-brand-500 text-brand-600 dark:text-brand-400"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
                      }`}
                    >
                      <Icon size={16} />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-5">
              {activePolicySection && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {activePolicySection.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activePolicySection.subtitle}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {activePolicySection.items.length > 0 ? (
                      activePolicySection.items.map((policy) => (
                        <button
                          key={policy.id || getPolicyTitle(policy, activePolicySection.title)}
                          type="button"
                          onClick={() => {
                            const documentUrl = getPolicyDocumentUrl(policy);
                            if (documentUrl) {
                              window.open(documentUrl, "_blank", "noopener,noreferrer");
                            }
                          }}
                          className="block w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-left hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500/40 dark:hover:bg-gray-800"
                        >
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {getPolicyTitle(policy, activePolicySection.title)}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {getPolicyDescription(policy, activePolicySection.subtitle)}
                          </p>
                          {getPolicyDocumentUrl(policy) ? (
                            <p className="mt-2 text-xs font-semibold text-primary-600 dark:text-primary-400">
                              {getPolicyDocumentName(policy)} - opens in a new tab
                            </p>
                          ) : (
                            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                              PDF not attached
                            </p>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="rounded-md border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        No policies available in this category.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
