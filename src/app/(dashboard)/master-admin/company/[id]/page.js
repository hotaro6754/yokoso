'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Building2, Mail, MapPin, Pencil, ArrowLeft, BadgeCheck, Clock, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDate, formatDateTime } from '@/lib/dateUtils';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm text-gray-900 dark:text-white text-right break-words">{value || '—'}</div>
    </div>
  );
}

export default function ViewCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        // API Call to fetch real company data
        const response = await apiClient.get(`/master-admin/company/${id}`);
        setCompany(response.data.data);
      } catch (error) {
        console.error('Error fetching company:', error);
        toast.error('Failed to load company details');
        router.push('/master-admin/company');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id, router]);

  // Derived status display logic compatible with backend Enums
  const displayStatus = useMemo(() => {
    if (!company) return 'Inactive';
    const status = company.status?.toUpperCase();

    if (status === 'ACTIVE') return 'Active';
    if (status === 'INACTIVE') return 'Inactive';
    if (status === 'SUSPENDED') return 'Suspended';
    if (status === 'TRIAL') return 'Trial';

    // Fallback only if status is empty or unknown
    if (company.trialEndsAt && new Date(company.trialEndsAt) > new Date()) return 'Trial';
    return 'Inactive';
  }, [company]);

  const statusBadge = useMemo(() => {
    if (displayStatus === 'Active') return { cls: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', Icon: BadgeCheck };
    if (displayStatus === 'Trial') return { cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', Icon: Clock };
    if (displayStatus === 'Suspended') return { cls: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', Icon: XCircle };
    return { cls: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', Icon: XCircle };
  }, [displayStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading company records...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Breadcrumb
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'Company', href: '/master-admin/company' },
              { label: 'View', href: '#' },
            ]}
          />
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">Company not found.</div>
            <Link href="/master-admin/company" className="inline-flex mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700">
              Back to Company List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumb
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'Company', href: '/master-admin/company' },
              { label: company.name, href: `/master-admin/company/${company.id}` },
            ]}
          />
          <div className="flex items-center gap-3">
            <Link
              href={`/master-admin/company/${company.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Pencil size={18} />
              <span>Edit Company</span>
            </Link>
            <Link
              href="/master-admin/company"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-primary-600">
                <Building2 size={24} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{company.name}</h1>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {company.subdomain ? <span className="font-mono text-primary-600 dark:text-primary-400">{company.subdomain}</span> : ''} • {company.city || '—'}{company.country ? `, ${company.country}` : ''}
                </div>
              </div>
            </div>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm ${statusBadge.cls}`}>
              <statusBadge.Icon size={14} />
              {displayStatus.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">Company Overview</div>
              <div className="space-y-3">
                <InfoRow label="Legal Entity Name" value={company.legalEntityName} />
                <InfoRow label="Company Code" value={company.companyCode} />
                <InfoRow label="Industry Type" value={company.industryType} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">Owner / Primary Contact</div>
              <div className="space-y-3">
                <InfoRow label="Owner Name" value={company.ownerName} />
                <InfoRow label="Owner Email" value={company.ownerEmail} />
                <InfoRow label="Owner Phone" value={company.ownerPhone} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">Contact & Address</div>
              <div className="space-y-3">
                <InfoRow label="Primary Contact Email" value={company.contactEmail} />
                <InfoRow label="Phone Number" value={company.phone} />
                <InfoRow label="Street Address" value={company.address} />
                <InfoRow label="City" value={company.city} />
                <InfoRow label="State / Province" value={company.state} />
                <InfoRow label="Country" value={company.country} />
                <InfoRow label="Timezone" value={company.timezone} />
                <InfoRow label="Default Currency" value={company.currency} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">Tax & Registration</div>
              <div className="space-y-3">
                <InfoRow label="Registration Number" value={company.registrationNumber} />
                <InfoRow label="PAN Card Number" value={company.panNumber} />
                <InfoRow label="TAN Number" value={company.tanNumber} />
                <InfoRow label="GST Identification Number" value={company.gstNumber} />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">Plan & Configuration</div>
              <div className="space-y-3">
                <InfoRow label="Active Plan" value={company.plan} />
                <InfoRow label="Max User Capacity" value={String(company.maxUsers)} />
                <InfoRow label="Trial Expiry Date" value={company.trialEndsAt ? formatDate(company.trialEndsAt) : '—'} />
                <InfoRow label="Data Retention (Months)" value={String(company.dataRetentionMonths)} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">Audit Information</div>
              <div className="space-y-3">
                <InfoRow label="Last Known Status" value={company.status ? company.status.charAt(0).toUpperCase() + company.status.slice(1).toLowerCase() : '—'} />
                <InfoRow label="Created on System" value={formatDateTime(company.createdAt)} />
                <InfoRow label="Last Record Update" value={formatDateTime(company.updatedAt)} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Mail size={16} className="text-primary-500" />
                <span className="truncate font-medium">{company.contactEmail}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin size={16} className="text-primary-500" />
                <span className="truncate font-medium">{company.city || '—'}{company.country ? `, ${company.country}` : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}