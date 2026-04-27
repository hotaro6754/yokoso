'use client';
import { useState, useEffect } from 'react';
import { Building2, MapPin, Users, Award, GitBranch, Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Breadcrumb from '@/components/common/Breadcrumb';
import CompanyTab from './components/CompanyTab';
import LocationTab from './components/LocationTab';
import DepartmentTab from './components/DepartmentTab';
import DesignationTab from './components/DesignationTab';
import ReportingHierarchyTab from './components/ReportingHierarchyTab';
import SettingsTab from './components/SettingsTab';
import { Toaster } from 'react-hot-toast';

export default function CompanyOrganizationPage() {
    const [activeTab, setActiveTab] = useState('company');
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [company, setCompany] = useState(null);
    const [companyId, setCompanyId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompanyData = async () => {
            setIsLoading(true);
            try {
                const storedCompanyId = typeof window !== 'undefined'
                    ? Number(localStorage.getItem('company_id'))
                    : null;

            const id = storedCompanyId || user?.companyId || user?.company?.id || null;
            setCompanyId(id);

                const derivedCompany = user?.company || (id ? {
                    id,
                    name: user?.companyName || 'Company',
                    industryType: '',
                    contactEmail: user?.email || '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    country: 'India',
                    timezone: 'Asia/Kolkata',
                    currency: 'INR',
                    employeeIdPrefix: '',
                } : null);
                
                if (id) {
                    try {
                        const { companyOrganizationService } = await import('@/services/super-admin-services/companyOrganization.service');
                        const response = await companyOrganizationService.getCompanyById(id);
                        if (response?.data) {
                            setCompany(response.data);
                            return;
                        }
                    } catch (error) {
                        console.error("Failed to fetch fresh company data:", error);
                    }
                }
                
                setCompany(derivedCompany);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanyData();
    }, [user]);

    const tabs = [
        { id: 'company', label: 'Company Details', icon: Building2 },
        { id: 'locations', label: 'Locations & Branches', icon: MapPin },
        { id: 'departments', label: 'Departments', icon: Users },
        { id: 'designations', label: 'Designations', icon: Award },
        { id: 'hierarchy', label: 'Reporting Hierarchy', icon: GitBranch },
        { id: 'settings', label: 'Company Settings', icon: Settings },
    ];

    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab && tabs.some(t => t.id === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleRefresh = (next) => {
        setCompany(prev => ({ ...(prev || {}), ...(next || {}) }));
    };

    return (
        <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
            <Toaster position="top-right" />

            {/* Page Header */}
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { label: 'Admin', href: '#' },
                        { label: 'Organization', href: '/super-admin/company-orgranization' }
                    ]}
                />
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-[hsl(var(--primary))]">
                            Company & Organization
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 dark:text-[hsl(var(--primary))]">
                            Manage company entities, departments, and organizational structure.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700 px-4 bg-gray-50/50 dark:bg-gray-800/50">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 relative ${isActive
                                    ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-white dark:bg-gray-800"
                                    : "border-transparent text-gray-600 dark:text-[hsl(var(--primary))]/80 hover:text-[hsl(var(--primary))] hover:border-primary-300"
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6 min-h-[500px]">
                    {activeTab === 'company' && (
                        <CompanyTab
                            company={company}
                            isLoading={isLoading}
                            onRefresh={handleRefresh}
                        />
                    )}
                    {activeTab === 'locations' && <LocationTab companyId={companyId} isLoadingCompany={isLoading} />}
                    {activeTab === 'departments' && <DepartmentTab companyId={companyId} isLoadingCompany={isLoading} />}
                    {activeTab === 'designations' && <DesignationTab companyId={companyId} isLoadingCompany={isLoading} />}
                    {activeTab === 'hierarchy' && <ReportingHierarchyTab />}
                    {activeTab === 'settings' && (
                        <SettingsTab
                            company={company}
                            isLoading={isLoading}
                            onRefresh={handleRefresh}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
