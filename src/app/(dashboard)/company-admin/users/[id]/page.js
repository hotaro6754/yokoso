"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
    User, Mail, Shield, Calendar, Clock, Building, Briefcase,
    ArrowLeft, Edit, Key, UserCheck, UserX, Phone, FileText, BadgeCheck
} from 'lucide-react';
import { userManagementService } from '@/services/userManagementService';
import { toast, Toaster } from 'sonner';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

function formatDate(dateString) {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB').split('/').join('-');
}

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);

                // Fetch user details
                const userResponse = await userManagementService.getUserById(params.id);
                if (userResponse.success) {
                    setUser(userResponse.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchUserData();
        }
    }, [params.id]);

    const handleResetPassword = async () => {
        try {
            const response = await userManagementService.resetUserPassword(user.id);
            if (response.success) {
                toast.success('Password reset successful. Temporary password sent to user.');
                setShowResetPasswordDialog(false);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error(error.message || 'Failed to reset password');
        }
    };

    const handleToggleStatus = async () => {
        try {
            const newStatus = !user.isActive;
            const statusString = newStatus ? 'ACTIVE' : 'INACTIVE';
            const response = await userManagementService.changeUserStatus(user.id, statusString);
            if (response.success) {
                setUser(prev => ({ ...prev, isActive: newStatus }));
                toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
                setShowDeactivateDialog(false);
            }
        } catch (error) {
            console.error('Error changing user status:', error);
            toast.error(error.message || 'Failed to change user status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">The user you are looking for does not exist or you do not have permission to view them.</p>
                    <button
                        onClick={() => router.push('/company-admin/users')}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/30 min-h-screen dark:bg-gray-950 pb-12">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <Breadcrumb
                        items={[
                            { label: 'Company Admin', href: '/company-admin/dashboard' },
                            { label: 'Users', href: '/company-admin/users' },
                            { label: 'User Profile', href: '#' }
                        ]}
                    />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">User Profile</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage user details, roles, and account settings.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link href={`/company-admin/users/${params.id}/edit`}>
                                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm font-medium text-sm">
                                    <Edit size={16} className="text-blue-600" />
                                    Edit Profile
                                </button>
                            </Link>
                            <button
                                onClick={() => setShowResetPasswordDialog(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm font-medium text-sm"
                            >
                                <Key size={16} className="text-amber-500" />
                                Reset Password
                            </button>
                            <button
                                onClick={() => setShowDeactivateDialog(true)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all shadow-sm font-medium text-sm border ${user.isActive
                                    ? 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700'
                                    }`}
                            >
                                {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                {user.isActive ? 'Deactivate Account' : 'Activate Account'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Identity & Contact - Spans 4 */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Identity Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 mb-6 relative">
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-sm text-gray-300">
                                    {user.employee?.profileImage ? (
                                        <img src={user.employee.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'
                                    }`}></div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : (user.email?.split('@')[0])}
                            </h2>
                            <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-4 uppercase tracking-wide">
                                {user.employee?.designation?.name || user.systemRole || 'User'}
                            </p>

                            <div className="flex items-center justify-center gap-2 mb-8">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    {user.employee?.employeeId || user.publicId || 'ID: --'}
                                </span>
                            </div>

                            <div className="w-full space-y-4 text-left">
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex items-start gap-4">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-400 shadow-sm">
                                        <Mail size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Work Email</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={user.email}>{user.email}</p>
                                    </div>
                                </div>

                                {user.employee?.phone && (
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex items-start gap-4">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-400 shadow-sm">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.employee.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock size={16} className="text-primary-500" />
                                Account Activity
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Joined Date</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatDate(user.createdAt)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Login</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {user.lastLogin
                                            ? formatDate(user.lastLogin)
                                            : 'Never'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Account Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.isActive
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Professional Info - Spans 8 */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Access & Role */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Shield className="text-indigo-600" size={20} />
                                Access & Roles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">System Role</p>
                                    <div className="flex items-center gap-2">
                                        <BadgeCheck className="text-blue-600 w-5 h-5" />
                                        <span className="font-semibold text-gray-900 dark:text-white text-lg">{user.systemRole || 'N/A'}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Determines global application permissions.</p>
                                </div>
                                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Company Role</p>
                                    <div className="flex items-center gap-2">
                                        <Building className="text-purple-600 w-5 h-5" />
                                        <span className="font-semibold text-gray-900 dark:text-white text-lg">{user.companyRole?.displayName || 'Standard'}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Determines access within the organization.</p>
                                </div>
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Briefcase className="text-primary-600" size={20} />
                                Employment Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                                        {user.employee?.department?.name || '—'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Designation</p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                                        {user.employee?.designation?.name || '—'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Personal Email</p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 truncate">
                                        {user.employee?.personalEmail || '—'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reports To</p>
                                    {user.employee?.reportingManager ? (
                                        <div className="flex items-center gap-3 pt-1">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs ring-2 ring-white dark:ring-gray-800">
                                                {user.employee.reportingManager.firstName?.[0]}
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {user.employee.reportingManager.firstName} {user.employee.reportingManager.lastName}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-base text-gray-400 italic border-b border-gray-100 dark:border-gray-700 pb-2">Not Assigned</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FileText className="text-emerald-600" size={20} />
                                Documents
                            </h3>

                            {user.employee?.documents?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {user.employee.documents.map((doc, idx) => (
                                        <a
                                            key={idx}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FileText size={20} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={doc.name}>
                                                    {doc.name || 'Untitled'}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Added {formatDate(doc.createdAt)}
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                        <FileText size={24} opacity={0.5} />
                                    </div>
                                    <p className="text-gray-500 font-medium text-sm">No documents attached</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Deactivation Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeactivateDialog}
                onClose={() => setShowDeactivateDialog(false)}
                onConfirm={handleToggleStatus}
                title={user.isActive ? 'Deactivate User Account' : 'Reactivate User Account'}
                message={`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} "${user.email}"? ${user.isActive
                    ? 'They will immediately lose access to the system.'
                    : 'They will be able to log in again.'
                    }`}
                confirmText={user.isActive ? 'Yes, Deactivate' : 'Yes, Activate'}
                cancelText="Cancel"
                isDestructive={user.isActive}
            />

            <ConfirmationDialog
                isOpen={showResetPasswordDialog}
                onClose={() => setShowResetPasswordDialog(false)}
                onConfirm={handleResetPassword}
                title="Reset User Password"
                message={`Reset password for "${user?.email}"? A reset email will be sent to this user.`}
                confirmText="Yes, Reset Password"
                cancelText="Cancel"
            />
        </div>
    );
}
