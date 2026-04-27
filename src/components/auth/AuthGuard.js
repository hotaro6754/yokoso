// src\components\auth\AuthGuard.js
"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children, requireAuth = true }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        router.push('/signin');
      }

      // If user is authenticated but trying to access auth pages (like signin)
      if (!requireAuth && isAuthenticated && user) {
        const userRole = user.systemRole;
        console.log('requireAuth', requireAuth);
        console.log('isAuthenticated', isAuthenticated);

        // MASTER_ADMIN has unrestricted access, no redirection needed
        if (userRole === 'MASTER_ADMIN') {
          console.log('AuthGuard: MASTER_ADMIN has unrestricted access');
          return;
        }

        // Redirect based on user system role
        let redirectPath = '/employee/dashboard';
        if (userRole === 'HR_ADMIN') {
          redirectPath = '/hr/dashboard';
        } else if (userRole === 'SUPER_ADMIN' || userRole === 'COMPANY_ADMIN' || userRole === 'COMPANY_OWNER') {
          redirectPath = '/company-admin/dashboard';
        } else if (userRole === 'PAYROLL_ADMIN') {
          redirectPath = '/payroll-compliance/dashboard';
        } else if (userRole === 'FINANCE_ADMIN') {
          redirectPath = '/finance-role/dashboard';
        } else if (userRole === 'MANAGER') {
          redirectPath = '/manager/dashboard';
        } else if (userRole === 'L_AND_D_MANAGER') {
          redirectPath = '/ld/dashboard';
        } else if (userRole === 'RECRUITER') {
          redirectPath = '/recruiter/dashboard';
        } else if (userRole === 'DEPARTMENT_HEAD') {
          redirectPath = '/dept-head/dashboard';
        }

        console.log('AuthGuard redirecting authenticated user to:', redirectPath, 'for role:', userRole);
        router.push(redirectPath);
      }
    }
  }, [isAuthenticated, loading, requireAuth, router, user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If redirecting, show loader instead of a blank screen
  if ((requireAuth && !isAuthenticated) || (!requireAuth && isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return children;
}