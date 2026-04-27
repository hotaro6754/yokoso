'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Building, Mail, Phone, MapPin, Globe, Upload, X, ImageIcon } from 'lucide-react';
import { companyOrganizationService } from '@/services/super-admin-services/companyOrganization.service';
import { handleApiError } from '@/utils/errorUtils';
import Image from 'next/image';

export default function CompanyTab({ company, isLoading, onRefresh }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contactEmail: '',
        phone: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        legalEntityName: '',
        companyCode: '',
        subdomain: '',
        logoUrl: '',
        industryType: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        website: '',
        registrationNumber: '',
        panNumber: '',
        tanNumber: '',
        gstNumber: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const resetForm = () => {
        setFormData({
            name: '',
            contactEmail: '',
            phone: '',
            ownerName: '',
            ownerEmail: '',
            ownerPhone: '',
            legalEntityName: '',
            companyCode: '',
            subdomain: '',
            logoUrl: '',
            industryType: '',
            address: '',
            city: '',
            state: '',
            country: 'India',
            website: '',
            registrationNumber: '',
            panNumber: '',
            tanNumber: '',
            gstNumber: '',
        });
        setLogoFile(null);
        setLogoPreview(null);
        setIsFormOpen(false);
    };

    const handleEdit = (company) => {
        setFormData({
            name: company.name || '',
            contactEmail: company.contactEmail || '',
            phone: company.phone || '',
            ownerName: company.ownerName || '',
            ownerEmail: company.ownerEmail || '',
            ownerPhone: company.ownerPhone || '',
            legalEntityName: company.legalEntityName || '',
            companyCode: company.companyCode || '',
            subdomain: company.subdomain || '',
            logoUrl: company.logoUrl || '',
            industryType: company.industryType || '',
            address: company.address || '',
            city: company.city || '',
            state: company.state || '',
            country: company.country || 'India',
            website: company.website || '',
            registrationNumber: company.registrationNumber || '',
            panNumber: company.panNumber || '',
            tanNumber: company.tanNumber || '',
            gstNumber: company.gstNumber || '',
        });
        setLogoPreview(company.logoUrl || null);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Updating company profile...');
        try {
            if (company?.id) {
                const submitData = new FormData();
                
                // Append all form fields
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== null && formData[key] !== undefined) {
                        submitData.append(key, formData[key]);
                    }
                });

                // Append logo file if selected
                if (logoFile) {
                    submitData.append('logo', logoFile);
                }

                const response = await companyOrganizationService.updateCompany(company.id, submitData);
                toast.success('Company profile updated successfully', { id: loadingToast });
                onRefresh(response.data || formData);
                resetForm();
            } else {
                toast.error('Company ID is missing. Cannot update profile.', { id: loadingToast });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            handleApiError(error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size should be less than 2MB');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype || file.type)) {
                toast.error('Only JPG, JPEG, and PNG files are allowed');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    if (isLoading) return <div className="p-12 text-center text-gray-500">Loading company details...</div>;

    if (isFormOpen) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-[hsl(var(--primary))]">Edit Company Profile</h2>
                    <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 dark:text-[hsl(var(--primary))]">Cancel</button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Company Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} required />
                    <Field label="Legal Entity Name" value={formData.legalEntityName} onChange={v => setFormData({ ...formData, legalEntityName: v })} />
                    <Field label="Company Code" value={formData.companyCode} onChange={v => setFormData({ ...formData, companyCode: v })} />
                    <Field label="Industry Type" value={formData.industryType} onChange={v => setFormData({ ...formData, industryType: v })} />
                    <Field label="Subdomain" value={formData.subdomain} onChange={v => setFormData({ ...formData, subdomain: v })} />
                    
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase dark:text-[hsl(var(--primary))]">
                            Company Logo (PNG or JPG)
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-sm flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                                {logoPreview ? (
                                    <>
                                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                        <button 
                                            type="button"
                                            onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-sm hover:bg-red-600 transition"
                                        >
                                            <X size={12} />
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon size={24} className="text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="flex flex-col items-center justify-center w-full px-4 py-2 bg-white dark:bg-gray-800 text-[hsl(var(--primary))] rounded-sm border border-[hsl(var(--primary))] cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <Upload size={16} />
                                        <span>{logoFile ? 'Change Logo' : 'Upload Logo'}</span>
                                    </div>
                                    <input type="file" className="hidden" accept=".png,.jpg,.jpeg" onChange={handleFileChange} />
                                </label>
                                <p className="text-[10px] text-gray-400 mt-1">Max size: 2MB. Format: PNG, JPG</p>
                            </div>
                        </div>
                    </div>

                    <Field label="Contact Email" type="email" value={formData.contactEmail} onChange={v => setFormData({ ...formData, contactEmail: v })} required />
                    <Field label="Phone" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} />
                    <Field label="Website" value={formData.website} onChange={v => setFormData({ ...formData, website: v })} />

                    <div className="md:col-span-2 border-t pt-6 mt-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 dark:text-[hsl(var(--primary))]">Owner / Primary Contact Details</h3>
                    </div>
                    <Field label="Owner Name" value={formData.ownerName} onChange={v => setFormData({ ...formData, ownerName: v })} required />
                    <Field label="Owner Email" type="email" value={formData.ownerEmail} onChange={v => setFormData({ ...formData, ownerEmail: v })} required />
                    <Field label="Owner Phone" value={formData.ownerPhone} onChange={v => setFormData({ ...formData, ownerPhone: v })} />

                    <div className="md:col-span-2 border-t pt-6 mt-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 dark:text-[hsl(var(--primary))]">Location Details</h3>
                    </div>
                    <div className="md:col-span-2">
                        <Field label="Address" value={formData.address} onChange={v => setFormData({ ...formData, address: v })} />
                    </div>
                    <Field label="City" value={formData.city} onChange={v => setFormData({ ...formData, city: v })} />
                    <Field label="State" value={formData.state} onChange={v => setFormData({ ...formData, state: v })} />
                    <Field label="Country" value={formData.country} onChange={v => setFormData({ ...formData, country: v })} />

                    <div className="md:col-span-2 border-t pt-6 mt-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 dark:text-[hsl(var(--primary))]">Business & Registration</h3>
                    </div>
                    <Field label="Registration Number" value={formData.registrationNumber} onChange={v => setFormData({ ...formData, registrationNumber: v })} />
                    <Field label="PAN Number" value={formData.panNumber} onChange={v => setFormData({ ...formData, panNumber: v })} />
                    <Field label="TAN Number" value={formData.tanNumber} onChange={v => setFormData({ ...formData, tanNumber: v })} />
                    <Field label="GST Number" value={formData.gstNumber} onChange={v => setFormData({ ...formData, gstNumber: v })} />

                    <div className="md:col-span-2 flex justify-end gap-3 pt-6">
                        <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-sm text-sm font-medium hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-sm text-sm font-semibold hover:bg-[hsl(var(--primary))]/90">Save Changes</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-sm bg-primary-50 border border-primary-100 flex items-center justify-center text-[hsl(var(--primary))] font-bold text-3xl overflow-hidden">
                        {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                        ) : (
                            company.name?.charAt(0)
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-[hsl(var(--primary))]">{company.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-[hsl(var(--primary))]/80">{company.legalEntityName || 'Legal Name Not Set'}</p>
                    </div>
                </div>
                <button
                    onClick={() => handleEdit(company)}
                    className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-sm text-sm font-semibold hover:bg-[hsl(var(--primary))]/90 transition"
                >
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoGroup title="Basic Information" icon={<Building size={16} />}>
                    <InfoItem label="Legal Name" value={company.legalEntityName} />
                    <InfoItem label="Company Code" value={company.companyCode} />
                    <InfoItem label="Industry" value={company.industryType} />
                    <InfoItem label="Subdomain" value={company.subdomain} />
                    <InfoItem label="Website" value={company.website} />
                </InfoGroup>

                <InfoGroup title="Contact Details" icon={<Mail size={16} />}>
                    <InfoItem label="Official Email" value={company.contactEmail} />
                    <InfoItem label="Phone" value={company.phone} />
                </InfoGroup>

                <InfoGroup title="Owner / Primary Contact" icon={<Mail size={16} />}>
                    <InfoItem label="Owner Name" value={company.ownerName} />
                    <InfoItem label="Owner Email" value={company.ownerEmail} />
                    <InfoItem label="Owner Phone" value={company.ownerPhone} />
                </InfoGroup>

                <InfoGroup title="Location" icon={<MapPin size={16} />}>
                    <InfoItem label="Address" value={company.address} />
                    <InfoItem label="City" value={company.city} />
                    <InfoItem label="State/Country" value={`${company.state || ''}${company.country ? `, ${company.country}` : ''}`} />
                </InfoGroup>

                <InfoGroup title="Business & Registration" icon={<Globe size={16} />}>
                    <InfoItem label="Registration Number" value={company.registrationNumber} />
                    <InfoItem label="PAN Number" value={company.panNumber} />
                    <InfoItem label="TAN Number" value={company.tanNumber} />
                    <InfoItem label="GST Number" value={company.gstNumber} />
                </InfoGroup>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false, disabled = false }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase dark:text-[hsl(var(--primary))]">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-sm text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500 dark:bg-gray-800/60 dark:text-[hsl(var(--primary))]/70' : ''}`}
            />
        </div>
    );
}

function InfoGroup({ title, icon, children }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-[hsl(var(--primary))]">{icon}</span>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-[hsl(var(--primary))]">{title}</h4>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

function InfoItem({ label, value, icon }) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight dark:text-[hsl(var(--primary))]/80">{label}</span>
            <div className="flex items-center gap-2">
                {icon}
                <p className="text-sm font-semibold text-gray-700 dark:text-[hsl(var(--primary))]">{value || '---'}</p>
            </div>
        </div>
    );
}
