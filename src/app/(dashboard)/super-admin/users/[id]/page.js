// src/app/(dashboard)/company-admin/users/[id]/page.js (served via middleware rewrite)
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
  User, Mail, Shield, Calendar, Clock, Building, Briefcase,
  ArrowLeft, Edit, Key, UserCheck, UserX, Activity
} from 'lucide-react';
import { userManagementService } from '@/services/userManagementService';
import { toast } from 'sonner';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
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

          // Fetch user activity logs
          const activityResponse = await userManagementService.getUserActivity(params.id);
          if (activityResponse.success) {
            setActivityLogs(activityResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">User not found</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">The user you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/company-admin/users')}
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/company-admin/dashboard' },
          { label: 'Company Admin', href: '/company-admin/dashboard' },
          { label: 'User Management', href: '/company-admin/users' },
          { label: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email, href: '#' }
        ]}
        rightContent={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetPasswordDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              <Key size={16} /> Reset Password
            </button>
            <button
              onClick={() => setShowDeactivateDialog(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${user.isActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.employee
                      ? `${user.employee.firstName} ${user.employee.lastName}`
                      : user.email.split('@')[0]
                    }
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium dark:bg-blue-900/30 dark:text-blue-400">
                      {user.systemRole}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2" /> Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                    {user.employee?.phone && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-gray-900 dark:text-white">{user.employee.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" /> Role Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">System Role</p>
                      <p className="text-gray-900 dark:text-white">{user.systemRole}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Company Role</p>
                      <p className="text-gray-900 dark:text-white">
                        {user.companyRole?.displayName || 'No company role assigned'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employee Information (if linked) */}
                {user.employee && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2" /> Employee Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                        <p className="text-gray-900 dark:text-white">{user.employee.employeeId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                        <p className="text-gray-900 dark:text-white">{user.employee.department?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Designation</p>
                        <p className="text-gray-900 dark:text-white">{user.employee.designation?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Logs (if any) */}
            {activityLogs.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" /> Recent Activity
                </h3>
                <div className="space-y-4">
                  {activityLogs.map((log, index) => (
                    <div key={index} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 mr-3">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white">{log.action}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar - Account Information */}
          <div className="space-y-6">
            {/* Account Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-gray-900 dark:text-white">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>
            {/* Quick Actions removed */}
          </div>
        </div>
      </div>

      {/* Deactivation Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        onConfirm={handleToggleStatus}
        title={user.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user? ${user.isActive
            ? 'They will no longer be able to log in until reactivated.'
            : 'They will regain access to the system.'
          }`}
        confirmText={user.isActive ? 'Deactivate User' : 'Activate User'}
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