'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Building2, Briefcase, MapPin, UploadCloud, Loader2 } from 'lucide-react';
import { subscriptionService } from '@/services/master-admin/subscription.service';
import StatusReasonDialog from './StatusReasonDialog';


const Field = ({ label, required, error, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    {children}
    {error ? <div className="text-xs text-red-600">{error}</div> : null}
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
      <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-lg text-primary-700 dark:text-primary-300">
        <Icon size={18} />
      </div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </div>
);

export default function CompanyForm({
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
  submitText,
  cancelText = 'Cancel',
}) {
  const defaults = useMemo(
    () => ({
      name: '',
      legalEntityName: '',
      companyCode: '',
      industryType: '',
      subdomain: '',
      logoUrl: '',
      documents: [],
      contactEmail: '',
      phone: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      registrationNumber: '',
      panNumber: '',
      tanNumber: '',
      gstNumber: '',
      gstNumber: '',
      plan: 'FREE',
      subscriptionId: '',
      dataRetentionMonths: 12,
      autoDeleteData: false,
      status: 'ACTIVE',
    }),
    []
  );

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await subscriptionService.getAllSubscriptions();
        setPlans(response.data || []);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      }
    };
    fetchPlans();
  }, []);

  const [crmLeads, setCrmLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');

  useEffect(() => {
    if (mode === 'create') {
      const fetchLeads = async () => {
        try {
          const { apiClient } = await import('@/lib/api');
          const response = await apiClient.get('/master-admin/crm-lead', { params: { limit: 100 } });
          const allLeads = response.data?.leads || [];
          setCrmLeads(allLeads.filter(lead => lead.status === 'NEW'));
        } catch (error) {
          console.error("Failed to fetch CRM leads", error);
        }
      };
      fetchLeads();
    }
  }, [mode]);

  const [values, setValues] = useState(() => {
    const v = { ...defaults, ...(initialValues || {}) };
    
    // Auto-select plan from active subscriptions if editing
    if (!v.subscriptionId && v.companySubscriptions && v.companySubscriptions.length > 0) {
        // Find active or trial subscription
        const activeSub = v.companySubscriptions.find(s => ['ACTIVE', 'TRIAL'].includes(s.status)) || v.companySubscriptions[0];
        if (activeSub) {
            v.subscriptionId = activeSub.subscriptionId;
        }
    }

    // Sanitize null values for controlled inputs
    Object.keys(v).forEach(key => {
        if (v[key] === null) {
            v[key] = '';
        }
    });

    return {
      ...v,
      documents: Array.isArray(v.documents) ? v.documents : [],
    };
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);

  const documents = Array.isArray(values.documents) ? values.documents : [];

  const setField = (key, next) => {
    // Phone number validation: only allow numeric input
    if (key === 'phone') {
      // Remove all non-numeric characters
      const numericValue = typeof next === 'string' ? next.replace(/\D/g, '') : next;
      setValues((prev) => ({ ...prev, [key]: numericValue }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    } else {
      setValues((prev) => ({ ...prev, [key]: next }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleLeadSelect = (e) => {
    const leadId = e.target.value;
    setSelectedLeadId(leadId);
    if (!leadId) return;

    const lead = crmLeads.find((l) => l.id === parseInt(leadId));
    if (lead) {
      setValues((prev) => ({
        ...prev,
        name: lead.companyName || prev.name,
        contactEmail: lead.email || prev.contactEmail,
        phone: lead.phone || prev.phone,
        ownerName: lead.contactPerson || prev.ownerName,
        ownerEmail: lead.email || prev.ownerEmail,
        ownerPhone: lead.phone || prev.ownerPhone,
        address: lead.address || prev.address,
        city: lead.city || prev.city,
        state: lead.state || prev.state,
        country: lead.country || prev.country || 'India',
        industryType: lead.industry || prev.industryType,
        subdomain: lead.companyName ? lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') : prev.subdomain,
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.name?.trim()) nextErrors.name = 'Company Name is required.';
    if (!values.contactEmail?.trim()) nextErrors.contactEmail = 'Contact Email is required.';
    if (!values.ownerName?.trim()) nextErrors.ownerName = 'Owner Name is required.';
    if (!values.ownerEmail?.trim()) nextErrors.ownerEmail = 'Owner Email is required.';
    if (!values.subdomain?.trim()) nextErrors.subdomain = 'Subdomain is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitLimitCheck = (payload) => {
    // Normal submission logic extracted to be reused
    return onSubmit(payload);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check if status is changed to INACTIVE or SUSPENDED
    const initialStatus = initialValues?.status || 'ACTIVE';
    const newStatus = values.status;
    const isStatusElevated = ['INACTIVE', 'SUSPENDED'].includes(newStatus);
    const hasStatusChanged = initialStatus !== newStatus;

    if (isStatusElevated && hasStatusChanged) {
      setIsReasonDialogOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...values,
        dataRetentionMonths: parseInt(values.dataRetentionMonths) || 0,
        autoDeleteData: Boolean(values.autoDeleteData),
      };

      if (selectedLeadId && mode === 'create') {
        payload.crmLeadId = parseInt(selectedLeadId);
      }

      await onSubmit(payload);
    } catch (err) {
      console.error("Form Submission Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReasonConfirm = async (reason) => {
    setIsReasonDialogOpen(false);
    setIsSaving(true);
    try {
      const payload = {
        ...values,
        dataRetentionMonths: parseInt(values.dataRetentionMonths) || 0,
        autoDeleteData: Boolean(values.autoDeleteData),
        reason, // include reason in payload
      };
      
      if (selectedLeadId && mode === 'create') {
        payload.crmLeadId = parseInt(selectedLeadId);
      }

      await onSubmit(payload);
    } catch (err) {
      console.error("Form Submission Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentsChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const nextDocs = [
      ...documents,
      ...files.map((file) => ({
        id: `${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`,
        name: file.name,
        size: file.size,
      })),
    ];
    setField('documents', nextDocs);
    event.target.value = '';
  };

  const handleRemoveDocument = (id) => {
    setField('documents', documents.filter((doc) => doc.id !== id));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Basic Information" icon={Building2}>
          {mode === 'create' && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
               <Field label="Import From CRM Lead (Optional)">
                 <select
                    value={selectedLeadId}
                    onChange={handleLeadSelect}
                    className="w-full px-4 py-2 border border-brand-200 dark:border-brand-700 rounded-lg bg-brand-50/30 dark:bg-brand-900/10 text-brand-900 dark:text-brand-100 focus:ring-2 focus:ring-brand-500 font-medium"
                 >
                    <option value="">-- Select a CRM Lead to prefill --</option>
                    {crmLeads.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.companyName} ({lead.contactPerson})
                      </option>
                    ))}
                 </select>
               </Field>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name" required error={errors.name}>
              <input
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Acme Corporation"
              />
            </Field>

            <Field label="Legal Entity Name">
              <input
                value={values.legalEntityName}
                onChange={(e) => setField('legalEntityName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Acme Corporation Pvt Ltd"
              />
            </Field>

            <Field label="Company Code">
              <input
                value={values.companyCode}
                onChange={(e) => setField('companyCode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                placeholder="e.g. ACME-001"
                disabled={mode === 'edit'}
              />
            </Field>

            <Field label="Industry Type">
              <input
                value={values.industryType}
                onChange={(e) => setField('industryType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Software"
              />
            </Field>

            <Field label="Subdomain" required error={errors.subdomain}>
              <input
                value={values.subdomain}
                onChange={(e) => setField('subdomain', e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                placeholder="e.g. acme"
                disabled={mode === 'edit'}
              />
            </Field>

            <Field label="Logo URL">
              <input
                value={values.logoUrl || ''}
                onChange={(e) => setField('logoUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="https://..."
              />
            </Field>
          </div>
        </Section>

        <Section title="Contact & Location" icon={MapPin}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Contact Email" required error={errors.contactEmail}>
              <input
                type="email"
                value={values.contactEmail}
                onChange={(e) => setField('contactEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. admin@company.com"
              />
            </Field>

            <Field label="Phone">
              <input
                type="tel"
                value={values.phone}
                onChange={(e) => setField('phone', e.target.value)}
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 10-digit phone number"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </Field>

            <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-700 pt-5 mt-2 mb-2">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Owner / Primary Contact Details</h3>
            </div>

            <Field label="Owner Name" required error={errors.ownerName}>
              <input
                type="text"
                value={values.ownerName}
                onChange={(e) => setField('ownerName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. John Doe"
              />
            </Field>

            <Field label="Owner Email" required error={errors.ownerEmail}>
              <input
                type="email"
                value={values.ownerEmail}
                onChange={(e) => setField('ownerEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. john.doe@company.com"
              />
            </Field>

            <Field label="Owner Phone">
              <input
                type="tel"
                value={values.ownerPhone}
                onChange={(e) => setField('ownerPhone', e.target.value)}
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 10-digit phone number"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </Field>
            
            <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-700 pt-5 mt-2 mb-2">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Location Details</h3>
            </div>

            <Field label="Address">
              <input
                value={values.address}
                onChange={(e) => setField('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Street, Area"
              />
            </Field>

            <Field label="City">
              <input
                value={values.city}
                onChange={(e) => setField('city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </Field>

            <Field label="State">
              <input
                value={values.state}
                onChange={(e) => setField('state', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </Field>

            <Field label="Country">
              <input
                value={values.country}
                onChange={(e) => setField('country', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </Field>
          </div>
        </Section>

        <Section title="Business & Registration" icon={Briefcase}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Registration Number">
              <input
                value={values.registrationNumber}
                onChange={(e) => setField('registrationNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </Field>
            <Field label="PAN Number">
              <input
                value={values.panNumber}
                onChange={(e) => setField('panNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </Field>
            <Field label="TAN Number">
              <input
                value={values.tanNumber}
                onChange={(e) => setField('tanNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </Field>
            <Field label="GST Number">
              <input
                value={values.gstNumber}
                onChange={(e) => setField('gstNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </Field>
          </div>
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Section title="Plan & Limits" icon={Building2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Plan">
                  <select
                    value={values.subscriptionId}
                    onChange={(e) => setField('subscriptionId', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Plan</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.currency === 'USD' ? '$' : '₹'}{plan.price} / {plan.billingCycle}
                      </option>
                    ))}
                  </select>
                </Field>

              </div>
            </Section>
          </div>

          <div>
            <Section title="Status" icon={Building2}>
              <div className="space-y-4">
                <Field label="Status">
                  <select
                    value={values.status}
                    onChange={(e) => setField('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="TRIAL">TRIAL</option>
                  </select>
                </Field>
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                    {isSaving ? 'Saving...' : (submitText || (mode === 'edit' ? 'Update Company' : 'Save Company'))}
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-200"
                    disabled={isSaving}
                  >
                    {cancelText}
                  </button>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </form>
      {
        isReasonDialogOpen && (
          <StatusReasonDialog
            isOpen={isReasonDialogOpen}
            status={values.status}
            onCancel={() => setIsReasonDialogOpen(false)}
            onConfirm={handleReasonConfirm}
          />
        )
      }
    </>
  );
}