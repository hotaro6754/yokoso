import apiClient from "@/lib/api";

export const GRIEVANCE_STORAGE_KEY = 'zodeck_grievances';
export const GRIEVANCE_CHANNEL = 'zodeck_grievances_channel';

const MOCK_GRIEVANCES = [
    {
        id: "GRV-2024-001",
        type: "General Grievance",
        category: "Policy Violation",
        subject: "Delay in reimbursement processing",
        description: "My travel claims from last month are still pending approval despite following all guidelines.",
        createdAt: "2024-03-10T10:30:00Z",
        status: "Investigation",
        priority: "Medium",
        complainant: "John Doe",
        slaDays: 14,
        slaStatus: "Healthy",
        anonymous: false,
        timeline: [
            { status: "Submitted", date: "2024-03-10T10:30:00Z", note: "Ticket initiated" },
            { status: "Investigation", date: "2024-03-12T14:20:00Z", note: "HR assigned for initial review" }
        ],
        comments: [
            { id: 1, sender: "HR Node", message: "We are reviewing your records with the finance team.", date: "2024-03-12T15:00:00Z", role: "HR", type: "system" }
        ]
    },
    {
        id: "POSH-2024-005",
        type: "POSH Complaint",
        category: "Unwelcome Verbal Conduct",
        subject: "Inappropriate comments during meetings",
        description: "Consistently receiving personal comments that make the environment uncomfortable.",
        createdAt: "2024-03-15T09:00:00Z",
        status: "Panel Assigned",
        priority: "Critical",
        complainant: "Sarah Smith",
        slaDays: 75,
        slaStatus: "Urgent",
        anonymous: true,
        incidentDate: "2024-03-14",
        location: "Office Cafe",
        accused: "Anonymous Manager",
        witnesses: ["Colleague 1", "Colleague 2"],
        timeline: [
            { status: "Submitted", date: "2024-03-15", note: "POSH ticket raised anonymously" },
            { status: "Panel Assigned", date: "2024-03-16", note: "Internal Committee (IC) formed" }
        ]
    }
];

const buildSeedGrievances = (targetCount = 12) => {
    const base = [...MOCK_GRIEVANCES];
    if (base.length >= targetCount) return base;

    const categories = [
        "Policy Violation",
        "Managerial Issues",
        "Compensation Concern",
        "Workplace Conflict",
        "Unwelcome Verbal Conduct",
        "Hostile Work Environment",
        "Harassment",
        "Payroll Concern",
        "Safety Issue",
        "Misconduct",
    ];
    const statuses = [
        "Submitted",
        "Under Review",
        "Investigation",
        "Hearing",
        "Decision Pending",
        "Resolved",
        "Closed",
    ];
    const names = [
        "John Doe",
        "Sarah Smith",
        "Jane Smith",
        "Robert Wilson",
        "Alice Brown",
        "Michael Lee",
        "Priya Sharma",
        "David Kim",
        "Ayesha Khan",
        "Rahul Gupta",
    ];

    const extra = [];
    for (let i = base.length; i < targetCount; i += 1) {
        const offset = i - base.length + 1;
        const isPosh = offset % 3 === 0;
        const id = isPosh
            ? `POSH-2024-${String(100 + offset).padStart(3, "0")}`
            : `GRV-2024-${String(200 + offset).padStart(3, "0")}`;
        const complainant = names[offset % names.length];
        const category = categories[offset % categories.length];
        const status = statuses[offset % statuses.length];
        const createdAt = new Date(Date.now() - (offset + 1) * 86400000).toISOString();

        extra.push({
            id,
            type: isPosh ? "POSH Complaint" : "General Grievance",
            category,
            subject: category,
            description: "Auto-seeded grievance entry for UI pagination.",
            createdAt,
            status,
            priority: isPosh ? "Critical" : "Medium",
            complainant,
            slaDays: isPosh ? 70 + offset : 10 + offset,
            slaStatus: "Healthy",
            anonymous: offset % 4 === 0,
            isAnonymous: offset % 4 === 0,
        });
    }

    return base.concat(extra);
};

const MOCK_SETTINGS = {
    sla: {
        general: 30,
        posh: 90,
        reminderDays: 5
    },
    anonymousEnabled: true,
    mandatoryDocs: ["Incident Statement", "MOM of Hearing", "Investigation findings"],
    panelStructure: {
        posh: ["Presiding Officer (Woman)", "Employee 1", "Employee 2", "External Member"],
        general: ["HR Lead", "Dept Manager"]
    },
    escalation: [
        { trigger: "SLA Breach", level: "Company Admin", autoNotify: true },
        { trigger: "Serious Misconduct", level: "Master Admin", autoNotify: true }
    ]
};

const getStoredGrievances = () => {
    if (typeof window === 'undefined') return MOCK_GRIEVANCES;
    const stored = localStorage.getItem(GRIEVANCE_STORAGE_KEY);
    if (!stored) {
        const seed = buildSeedGrievances(12);
        localStorage.setItem(GRIEVANCE_STORAGE_KEY, JSON.stringify(seed));
        return seed;
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length < 12) {
        const seed = buildSeedGrievances(12);
        localStorage.setItem(GRIEVANCE_STORAGE_KEY, JSON.stringify(seed));
        return seed;
    }
    return parsed;
};

const updateStoredGrievances = (updatedList) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(GRIEVANCE_STORAGE_KEY, JSON.stringify(updatedList));
        broadcastGrievanceUpdate({ type: 'grievances_updated', count: updatedList.length });
    }
};

const broadcastGrievanceUpdate = (payload) => {
    if (typeof window === 'undefined') return;
    try {
        if ('BroadcastChannel' in window) {
            const channel = new BroadcastChannel(GRIEVANCE_CHANNEL);
            channel.postMessage(payload);
            channel.close();
        }
    } catch {
        // no-op if BroadcastChannel is not available
    }
};

const extractGrievanceList = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.grievances)) return payload.grievances;
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    return [];
};

const mergeGrievances = (apiList = [], localList = []) => {
    const mergedMap = new Map();
    [...localList, ...apiList].forEach((item) => {
        if (!item) return;
        const key = String(item.id || item.publicId || "").toLowerCase();
        if (!key) return;
        mergedMap.set(key, item);
    });
    return Array.from(mergedMap.values());
};

const normalizeEmail = (value) => (value ? String(value).trim().toLowerCase() : '');

const getCurrentUserIdentity = () => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('hrms_user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const name = `${parsed?.firstName || ''} ${parsed?.lastName || ''}`.trim();
        return {
            id: parsed?.id,
            email: parsed?.email,
            name: name || parsed?.name || '',
            role: parsed?.systemRole || parsed?.role || ''
        };
    } catch {
        return null;
    }
};

const isAdminRole = (role = '') => {
    const normalized = String(role || '').toUpperCase();
    return ['HR_ADMIN', 'COMPANY_ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN'].includes(normalized);
};

const matchesOwner = (grievance, identity) => {
    if (!identity || !grievance) return false;
    const createdById = grievance.createdById || grievance.createdBy?.id;
    const createdByEmail = normalizeEmail(grievance.createdByEmail || grievance.createdBy?.email);
    const createdByName = String(grievance.createdByName || grievance.createdBy?.name || '').toLowerCase();
    const complainant = String(grievance.complainant || '').toLowerCase();
    const identityEmail = normalizeEmail(identity.email);
    const identityName = String(identity.name || '').toLowerCase();

    if (identity.id && createdById && String(identity.id) === String(createdById)) return true;
    if (identityEmail && createdByEmail && identityEmail === createdByEmail) return true;
    if (identityName && createdByName && identityName === createdByName) return true;
    if (identityName && complainant && identityName === complainant) return true;
    return false;
};

const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '""';
    const text = Array.isArray(value) ? value.join(", ") : String(value);
    return `"${text.replace(/"/g, '""')}"`;
};

const matchesFilters = (grievance, params = {}) => {
    const normalizedType = params.type?.trim();
    const normalizedStatus = params.status?.trim();
    const normalizedSearch = params.search?.trim().toLowerCase();

    if (normalizedType && grievance.type !== normalizedType) {
        return false;
    }

    if (normalizedStatus && grievance.status !== normalizedStatus) {
        return false;
    }

    if (!normalizedSearch) {
        return true;
    }

    const searchableValues = [
        grievance.id,
        grievance.type,
        grievance.category,
        grievance.subject,
        grievance.complainant,
        grievance.status,
    ];

    return searchableValues.some((field) =>
        String(field || "").toLowerCase().includes(normalizedSearch)
    );
};

const buildGrievanceCsv = (grievances = []) => {
    const headers = [
        "Case ID",
        "Type",
        "Category",
        "Subject",
        "Complainant",
        "Status",
        "Priority",
        "Submitted On",
        "SLA Days",
        "Anonymous",
    ];

    const rows = grievances.map((grievance) => [
        grievance.id,
        grievance.type,
        grievance.category,
        grievance.subject,
        grievance.complainant,
        grievance.status,
        grievance.priority || "",
        grievance.createdAt || grievance.submittedOn || "",
        grievance.slaDays ?? "",
        (grievance.anonymous ?? grievance.isAnonymous) ? "Yes" : "No",
    ]);

    const csvContent = [
        headers.map(escapeCsvValue).join(","),
        ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");

    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
};

export const grievanceService = {
    // Employee methods
    getMyGrievances: async (params = {}) => {
        const identity = getCurrentUserIdentity();
        try {
            const response = await apiClient.get('/grievances/my', { params });
            const apiList = extractGrievanceList(response.data);
            return { ...(response.data || {}), data: apiList };
        } catch (error) {
            console.warn('API Error, using persistent mock data');
            const grievances = getStoredGrievances().filter((grievance) => matchesFilters(grievance, params));
            const ownTickets = identity ? grievances.filter((item) => matchesOwner(item, identity)) : grievances;
            return { data: ownTickets };
        }
    },

    submitGrievance: async (formData) => {
        try {
            if (formData instanceof FormData) {
                const identity = getCurrentUserIdentity();
                if (!formData.has('routeTo')) {
                    formData.append('routeTo', 'HR');
                }
                if (!formData.has('assignedToRole')) {
                    formData.append('assignedToRole', 'HR');
                }
                if (identity?.id && !formData.has('createdById')) {
                    formData.append('createdById', String(identity.id));
                }
                if (identity?.email && !formData.has('createdByEmail')) {
                    formData.append('createdByEmail', identity.email);
                }
                if (identity?.name && !formData.has('createdByName')) {
                    formData.append('createdByName', identity.name);
                }
                if (identity?.role && !formData.has('createdByRole')) {
                    formData.append('createdByRole', identity.role);
                }
            }
            const response = await apiClient.post('/grievances', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            let created = response?.data?.data || response?.data;
            if (!created || typeof created !== 'object' || !created.id) {
                const identity = getCurrentUserIdentity();
                created = {
                    id: `GRV-${Date.now().toString().slice(-4)}`,
                    type: formData.get('type') || "General Grievance",
                    category: formData.get('category'),
                    subject: formData.get('subject'),
                    description: formData.get('description'),
                    incidentDate: formData.get('incidentDate'),
                    location: formData.get('location'),
                    accusedPerson: formData.get('accusedPerson'),
                    witnesses: formData.get('witnesses'),
                    createdAt: new Date().toISOString(),
                    status: "Submitted",
                    complainant: identity?.name || identity?.email || "Employee",
                    slaDays: 0,
                    anonymous: formData.get('isAnonymous') === 'true',
                    isAnonymous: formData.get('isAnonymous') === 'true',
                    assignedToRole: "HR",
                    routeTo: "HR",
                    createdById: identity?.id,
                    createdByEmail: identity?.email,
                    createdByName: identity?.name,
                    createdByRole: identity?.role,
                    timeline: [
                        { status: "Submitted", date: new Date().toISOString(), note: "Digital signature verified. Case dossier initiated." }
                    ],
                    comments: []
                };
            }
            return response.data;
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to submit grievance. Please try again.';
            throw new Error(message);
        }
    },

    getGrievanceDetails: async (id) => {
        try {
            const response = await apiClient.get(`/grievances/${id}`);
            return response.data;
        } catch (error) {
            const grievances = getStoredGrievances();
            const detail = grievances.find(g => g.id === id) || grievances[0];
            return { data: detail };
        }
    },

    addComment: async (id, comment, attachments = []) => {
        try {
            const response = await apiClient.post(`/grievances/${id}/comments`, { comment });
            return response.data;
        } catch (error) {
            const grievances = getStoredGrievances();
            const updated = grievances.map(g => {
                if (g.id === id) {
                    return {
                        ...g,
                        comments: [...(g.comments || []), { sender: "You", message: comment, date: new Date().toISOString(), role: "HR" }]
                    };
                }
                return g;
            });
            updateStoredGrievances(updated);
            return { success: true };
        }
    },

    // HR Admin methods
    getAllGrievances: async (params = {}) => {
        const identity = getCurrentUserIdentity();
        try {
            const response = await apiClient.get('/hr/grievances', { params });
            const apiList = extractGrievanceList(response.data);
            const resultList = identity && !isAdminRole(identity.role)
                ? apiList.filter((item) => matchesOwner(item, identity))
                : apiList;
            return { ...(response.data || {}), data: resultList };
        } catch (error) {
            const filtered = getStoredGrievances().filter((grievance) => matchesFilters(grievance, params));
            const resultList = identity && !isAdminRole(identity.role)
                ? filtered.filter((item) => matchesOwner(item, identity))
                : filtered;
            return { data: resultList };
        }
    },

    updateGrievanceStatus: async (id, status, internalNotes = "") => {
        try {
            const response = await apiClient.patch(`/hr/grievances/${id}/status`, { status, internalNotes });
            return response.data;
        } catch (error) {
            const grievances = getStoredGrievances();
            const updated = grievances.map(g => {
                if (g.id === id) {
                    return { ...g, status };
                }
                return g;
            });
            updateStoredGrievances(updated);
            return { success: true };
        }
    },

    assignPanel: async (id, panelMembers) => {
        try {
            const response = await apiClient.post(`/hr/grievances/${id}/assign-panel`, { panelMembers });
            return response.data;
        } catch (error) {
            const grievances = getStoredGrievances();
            const updated = grievances.map(g => {
                if (g.id === id) {
                    const panel = panelMembers.map(m => ({ name: m, role: m.includes('Sarah') ? 'Presiding Officer' : 'Member' }));
                    return { ...g, panel, status: "Investigation" };
                }
                return g;
            });
            updateStoredGrievances(updated);
            return { success: true };
        }
    },

    recordDecision: async (id, decision, actionTaken, policyReference) => {
        try {
            const response = await apiClient.post(`/hr/grievances/${id}/resolve`, { decision, actionTaken, policyReference });
            return response.data;
        } catch (error) {
            const grievances = getStoredGrievances();
            const updated = grievances.map(g => {
                if (g.id === id) {
                    return {
                        ...g,
                        status: "Resolved",
                        decisionSummary: { decision, actionTaken, policyReference, date: new Date().toISOString() }
                    };
                }
                return g;
            });
            updateStoredGrievances(updated);
            return { success: true };
        }
    },

    getAnalytics: async () => {
        try {
            const response = await apiClient.get('/hr/grievances/analytics');
            return response.data;
        } catch (error) {
            return {
                data: {
                    total: 12,
                    open: 5,
                    posh: 3,
                    avgResolution: 12.5,
                    slaCompliance: 92
                }
            };
        }
    },

    // Admin methods
    getSettings: async () => {
        try {
            const response = await apiClient.get('/admin/grievance-settings');
            return response.data;
        } catch (error) {
            return { data: MOCK_SETTINGS };
        }
    },

    updateSettings: async (settings) => {
        try {
            const response = await apiClient.put('/admin/grievance-settings', settings);
            return response.data;
        } catch (error) {
            return { success: true };
        }
    },

    exportGrievances: async (params = {}) => {
        try {
            const response = await apiClient.get('/hr/grievances/export', {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            const grievances = getStoredGrievances().filter((grievance) =>
                matchesFilters(grievance, params)
            );
            return buildGrievanceCsv(grievances);
        }
    }
};
