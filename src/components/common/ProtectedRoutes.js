// optional
// src/components/common/ProtectedRoute.js
"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
    
    if (!loading && user && requiredRole && user.systemRole !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      // router.push(user.role === 'HR Admin' ? '/hr/dashboard' : '/employee/dashboard');
       // Redirect based on actual systemRole
      if (user.systemRole === 'HR_ADMIN') {
        router.push('/hr/dashboard');
      } else if (user.systemRole === 'SUPER_ADMIN') {
        router.push('/super-admin/dashboard');
      } else if (user.systemRole === 'PAYROLL_ADMIN') {
        router.push('/payroll-compliance/dashboard');
      } else if (user.systemRole === 'FINANCE_ADMIN') {
        router.push('/finance-role/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    }
  }, [user, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (requiredRole && user.systemRole !== requiredRole) {
    return null; // Will redirect in useEffect
  }

  return children;
}