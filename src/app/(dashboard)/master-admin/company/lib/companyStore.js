
// src/app/(dashboard)/master-admin/company/lib/companyStore.js
// Mock localStorage-backed store for Master Admin Company module.

const STORAGE_KEY = 'zodeck_master_admin_companies_v1';

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function getNowISO() {
  return new Date().toISOString();
}

function toISODateOnly(value) {
  // Accepts 'YYYY-MM-DD' or ISO; returns ISO string at midnight.
  if (!value) return undefined;
  if (value.includes('T')) return value;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto?.randomUUID) return crypto.randomUUID();
  // Fallback (not cryptographically secure, but fine for UI mock data)
  return `mock-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

function seedCompanies() {
  const now = getNowISO();
  return [
    {
      id: 1,
      publicId: uuid(),
      name: 'Acme Corporation',
      subdomain: 'acme',
      contactEmail: 'contact@acmecorp.com',
      phone: '+91-98765-43210',
      address: '12 Business Park, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      maxUsers: 500,
      maxEmployees: 1500,
      trialEndsAt: undefined,
      dataRetentionMonths: 24,
      autoDeleteData: false,
      legalEntityName: 'Acme Corporation Pvt Ltd',
      companyCode: 'ACME-001',
      registrationNumber: 'REG-ACME-2024',
      panNumber: 'ABCDE1234F',
      tanNumber: 'BLRA12345B',
      gstNumber: '29ABCDE1234F1Z5',
      industryType: 'Software',
      logoUrl: '',
      documents: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      publicId: uuid(),
      name: 'Nova Retail',
      subdomain: 'nova-retail',
      contactEmail: 'admin@novaretail.com',
      phone: '+91 99887 77665',
      address: '221 Market Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      status: 'ACTIVE',
      plan: 'PREMIUM',
      maxUsers: 120,
      maxEmployees: 400,
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(), // trial for 10 days
      dataRetentionMonths: 12,
      autoDeleteData: false,
      legalEntityName: 'Nova Retail LLP',
      companyCode: 'NOVA-020',
      registrationNumber: 'REG-NOVA-2023',
      panNumber: 'AAAAA1234A',
      tanNumber: 'MUMA12345C',
      gstNumber: '27AAAAA1234A1Z5',
      industryType: 'Retail',
      logoUrl: '',
      documents: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 3,
      publicId: uuid(),
      name: 'Orion Logistics',
      subdomain: 'orion',
      contactEmail: 'hello@orionlogistics.com',
      phone: '+91 91234 56789',
      address: 'Plot 7, Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      status: 'INACTIVE',
      plan: 'STANDARD',
      maxUsers: 50,
      maxEmployees: 120,
      trialEndsAt: undefined,
      dataRetentionMonths: 6,
      autoDeleteData: true,
      legalEntityName: 'Orion Logistics Services',
      companyCode: 'ORION-007',
      registrationNumber: 'REG-ORION-2022',
      panNumber: 'AABCO1234D',
      tanNumber: 'PUNA12345D',
      gstNumber: '27AABCO1234D1Z5',
      industryType: 'Logistics',
      logoUrl: '',
      documents: [],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function readCompanies() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedCompanies();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return safeParse(raw, []);
}

export function writeCompanies(companies) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

export function getCompanies() {
  return readCompanies();
}

export function getCompanyById(id) {
  const companies = readCompanies();
  const numericId = Number(id);
  return companies.find((c) => Number(c.id) === numericId) || null;
}

export function createCompany(data) {
  const companies = readCompanies();
  const nextId = companies.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0) + 1;
  const now = getNowISO();

  const company = {
    id: nextId,
    publicId: uuid(),
    name: data.name ?? '',
    subdomain: data.subdomain ?? '',
    contactEmail: data.contactEmail ?? '',
    phone: data.phone || undefined,
    address: data.address || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    country: data.country || 'India',
    timezone: data.timezone || 'Asia/Kolkata',
    currency: data.currency || 'INR',
    status: data.status || 'ACTIVE',
    plan: data.plan || 'STANDARD',
    maxUsers: Number(data.maxUsers || 0),
    maxEmployees: Number(data.maxEmployees || 0),
    trialEndsAt: toISODateOnly(data.trialEndsAt),
    dataRetentionMonths: Number(data.dataRetentionMonths || 0),
    autoDeleteData: Boolean(data.autoDeleteData),
    legalEntityName: data.legalEntityName || undefined,
    companyCode: data.companyCode || undefined,
    registrationNumber: data.registrationNumber || undefined,
    panNumber: data.panNumber || undefined,
    tanNumber: data.tanNumber || undefined,
    gstNumber: data.gstNumber || undefined,
    industryType: data.industryType || undefined,
    logoUrl: data.logoUrl || undefined,
    documents: Array.isArray(data.documents) ? data.documents : [],
    createdAt: now,
    updatedAt: now,
  };

  const updated = [company, ...companies];
  writeCompanies(updated);
  return company;
}

export function updateCompany(id, patch) {
  const companies = readCompanies();
  const numericId = Number(id);
  const now = getNowISO();
  const updated = companies.map((c) => {
    if (Number(c.id) !== numericId) return c;
    return {
      ...c,
      ...patch,
      maxUsers: patch.maxUsers !== undefined ? Number(patch.maxUsers) : c.maxUsers,
      maxEmployees: patch.maxEmployees !== undefined ? Number(patch.maxEmployees) : c.maxEmployees,
      dataRetentionMonths:
        patch.dataRetentionMonths !== undefined ? Number(patch.dataRetentionMonths) : c.dataRetentionMonths,
      autoDeleteData: patch.autoDeleteData !== undefined ? Boolean(patch.autoDeleteData) : c.autoDeleteData,
      trialEndsAt: patch.trialEndsAt !== undefined ? toISODateOnly(patch.trialEndsAt) : c.trialEndsAt,
      updatedAt: now,
    };
  });
  writeCompanies(updated);
  return updated.find((c) => Number(c.id) === numericId) || null;
}

export function deleteCompany(id) {
  const companies = readCompanies();
  const numericId = Number(id);
  const updated = companies.filter((c) => Number(c.id) !== numericId);
  writeCompanies(updated);
  return true;
}

export function companyDisplayStatus(company) {
  if (!company) return 'Inactive';
  if (company.status === 'INACTIVE') return 'Inactive';
  if (company.status !== 'ACTIVE') return 'Inactive';
  if (company.trialEndsAt) {
    const t = new Date(company.trialEndsAt).getTime();
    if (!Number.isNaN(t) && t > Date.now()) return 'Trial';
  }
  return 'Active';
}

