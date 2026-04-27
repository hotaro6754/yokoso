// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // -------------------------------------------------------
  // ROUTE PREFIX (UI ONLY)
  // /company-admin/*  -> internally serve /super-admin/*
  // /super-admin/*    -> redirect to /company-admin/*
  // -------------------------------------------------------

  // Canonicalize legacy URLs
  if (pathname.startsWith('/super-admin/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/super-admin', '/company-admin');
    return NextResponse.redirect(url);
  }

  // Rewrite company-admin URLs to existing super-admin pages (no new files/routes)
  if (pathname.startsWith('/company-admin/')) {
    const url = request.nextUrl.clone();

    // Custom Policies (Company Admin only) - UI-only
    // Map to existing policy-rule page and preserve subpaths (add, edit, etc.)
    if (pathname.startsWith('/company-admin/custom-policies')) {
      const remaining = pathname.replace('/company-admin/custom-policies', '');
      url.pathname = `/super-admin/policy-rule${remaining}`;
      url.searchParams.set('type', 'CUSTOM');
      return NextResponse.rewrite(url);
    }

    // Dashboard route: company admin dashboard is served via /super-admin/dashboard (UI-only).
    // Dashboard & New Modules: Serve distinct Company Admin pages
    if (
      pathname === '/company-admin/dashboard' ||
      pathname.startsWith('/company-admin/attendance') ||
      pathname.startsWith('/company-admin/approvals') ||
      pathname.startsWith('/company-admin/timesheet-approvals') ||
      pathname.startsWith('/company-admin/users') ||
      pathname.startsWith('/company-admin/organization') ||
      pathname.startsWith('/company-admin/subscription') ||
      pathname.startsWith('/company-admin/employee-leaves') ||
      pathname.startsWith('/company-admin/leave') ||
      pathname.startsWith('/company-admin/settings') ||
      pathname.startsWith('/company-admin/shift-management')
    ) {
      return NextResponse.next();
    }

    // Company-only pages that don't exist under /super-admin:
    // We reuse existing pages and branch client-side by pathname.
    if (pathname === '/company-admin/notification-settings') {
      url.pathname = '/super-admin/profile';
      return NextResponse.rewrite(url);
    }

    url.pathname = pathname.replace('/company-admin', '/super-admin');
    return NextResponse.rewrite(url);
  }

  // Rewrite HR URLs for Policy modules (UI reuse)
  if (pathname.startsWith('/hr/')) {
    const url = request.nextUrl.clone();

    // Custom Policies for HR
    if (pathname.startsWith('/hr/custom-policies')) {
      const remaining = pathname.replace('/hr/custom-policies', '');
      url.pathname = `/super-admin/policy-rule${remaining}`;
      url.searchParams.set('type', 'CUSTOM');
      return NextResponse.rewrite(url);
    }

    // Standard Policies for HR
    if (pathname.startsWith('/hr/policy-rule')) {
      const remaining = pathname.replace('/hr/policy-rule', '');
      url.pathname = `/super-admin/policy-rule${remaining}`;
      return NextResponse.rewrite(url);
    }
  }

  // Rewrite Payroll URLs for Policy modules (UI reuse)
  if (pathname.startsWith('/payroll/')) {
    const url = request.nextUrl.clone();
    if (pathname.startsWith('/payroll/custom-policies')) {
      const remaining = pathname.replace('/payroll/custom-policies', '');
      url.pathname = `/super-admin/policy-rule${remaining}`;
      url.searchParams.set('type', 'CUSTOM');
      return NextResponse.rewrite(url);
    }
    if (pathname.startsWith('/payroll/policy-rule')) {
      const remaining = pathname.replace('/payroll/policy-rule', '');
      url.pathname = `/super-admin/policy-rule${remaining}`;
      return NextResponse.rewrite(url);
    }
  }

  // Rewrite Policy URLs for other roles (Manager, Dept Head, etc.)
  const policyRoles = ['manager', 'dept-head', 'finance-role', 'payroll-compliance', 'ld', 'it-admin', 'employee', 'recruiter'];
  const matchedRole = policyRoles.find(role => pathname.startsWith(`/${role}/`));

  if (matchedRole) {
    const url = request.nextUrl.clone();
    if (pathname.startsWith(`/${matchedRole}/policy-rule`)) {
      const remaining = pathname.replace(`/${matchedRole}/policy-rule`, '');
      url.pathname = `/super-admin/policy-rule${remaining}`;
      return NextResponse.rewrite(url);
    }
    if (pathname.startsWith(`/${matchedRole}/holiday`)) {
      url.pathname = `/employee/holiday`;
      return NextResponse.rewrite(url);
    }
    if (pathname.startsWith(`/${matchedRole}/custom-policies`)) {
      const remaining = pathname.replace(`/${matchedRole}/custom-policies`, '');
      url.pathname = `/super-admin/policy-rule${remaining}`;
      url.searchParams.set('type', 'CUSTOM');
      return NextResponse.rewrite(url);
    }
  }

  // ------------------------------------------------------------------
  // SHARED ROUTE: /my-attendance — available to ALL authenticated roles
  // ------------------------------------------------------------------
  if (
    pathname === '/my-attendance' ||
    pathname.startsWith('/my-attendance/') ||
    pathname === '/my-separation' ||
    pathname.startsWith('/my-separation/') ||
    pathname === '/team-separation' ||
    pathname.startsWith('/team-separation/') ||
    pathname.startsWith('/employee/grievances')
  ) {
    return NextResponse.next();
  }

  if (
    !token &&
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/employee') ||
      pathname.startsWith('/hr') ||
      pathname.startsWith('/payroll-compliance') ||
      pathname.startsWith('/payroll') ||
      pathname.startsWith('/finance-role') ||
      pathname.startsWith('/manager') ||
      pathname.startsWith('/company-admin') ||
      pathname.startsWith('/super-admin') ||
      pathname.startsWith('/master-admin') ||
      pathname.startsWith('/it-admin') ||
      pathname.startsWith('/dept-head') ||
      pathname.startsWith('/ld'))
  ) {
    const loginUrl = new URL('/signin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Get user role from cookie
  const userRole = request.cookies.get('userRole')?.value;
  const normalizedRole = userRole
    ? userRole.toUpperCase().replace(/[-\s]/g, '_')
    : undefined;

  // If no role but has token, we might need to decode it
  // (Add your JWT decoding logic here if needed)

  // Role-based route protection
  if (normalizedRole) {
    console.log(`Middleware: User role=${normalizedRole}, Path=${pathname}`);

    // 0. MASTER_ADMIN - can access all routes
    if (normalizedRole === 'MASTER_ADMIN') {
      // Master admin explicitly excluded from shared profile page
      if (pathname.startsWith('/profile')) {
        return NextResponse.redirect(new URL('/master-admin/dashboard', request.url));
      }
      // Master admin has access to all routes, no restrictions
      return NextResponse.next();
    }

    // 1. EMPLOYEE restrictions
    if (normalizedRole === 'EMPLOYEE') {
      if (
        pathname.startsWith('/hr/') ||
        pathname.startsWith('/super-admin/') ||
        pathname.startsWith('/company-admin/') ||
        pathname.startsWith('/master-admin/') ||
        pathname.startsWith('/manager/') ||
        pathname.startsWith('/ld/') ||
        pathname.startsWith('/dept-head/') ||
        pathname.startsWith('/finance-role/') ||
        pathname.startsWith('/payroll-compliance/') ||
        pathname.startsWith('/it-admin/') ||
        pathname.startsWith('/recruiter/')
      ) {
        console.log('Redirecting employee to employee dashboard');
        return NextResponse.redirect(new URL('/employee/dashboard', request.url));
      }
    }

    // 2. HR_ADMIN restrictions
    else if (normalizedRole === 'HR_ADMIN') {
      if (pathname.startsWith('/employee/') && !pathname.startsWith('/attendance/timesheets') && !pathname.startsWith('/employee/attendance/my-attendance') && !pathname.startsWith('/timesheet-approvals')) {
        console.log('Redirecting HR admin to HR dashboard');
        return NextResponse.redirect(new URL('/hr/dashboard', request.url));
      }
      if (pathname.startsWith('/manager/') && !pathname.startsWith('/manager/attendance-approvals')) {
        console.log('Redirecting HR admin to HR dashboard (manager access denied)');
        return NextResponse.redirect(new URL('/hr/dashboard', request.url));
      }
      if (pathname.startsWith('/super-admin/') || pathname.startsWith('/master-admin/')) {
        console.log('Redirecting HR admin to HR dashboard (admin access denied)');
        return NextResponse.redirect(new URL('/hr/dashboard', request.url));
      }
      if (pathname.startsWith('/company-admin/')) {
        console.log('Redirecting HR admin to HR dashboard (company admin access denied)');
        return NextResponse.redirect(new URL('/hr/dashboard', request.url));
      }
      if (pathname.startsWith('/ld/')) {
        console.log('Redirecting HR admin to HR dashboard (LD access denied)');
        return NextResponse.redirect(new URL('/hr/dashboard', request.url));
      }
      if (pathname.startsWith('/dept-head/')) {
        console.log('Redirecting HR admin to HR dashboard (dept-head access denied)');
        return NextResponse.redirect(new URL('/hr/dashboard', request.url));
      }
    }

    // 3. SUPER_ADMIN restrictions
    else if (normalizedRole === 'SUPER_ADMIN') {
      // UI-only: SUPER_ADMIN acts as Company Admin in this frontend.
      if ((pathname.startsWith('/employee/') && !pathname.startsWith('/attendance/timesheets') && !pathname.startsWith('/employee/attendance/my-attendance') && !pathname.startsWith('/timesheet-approvals')) || (pathname.startsWith('/hr/') && !pathname.startsWith('/hr/grievance-management') && !pathname.startsWith('/hr/employees/') && !pathname.startsWith('/hr/separation') && !pathname.startsWith('/hr/performance')) || (pathname.startsWith('/payroll-compliance/') && !pathname.startsWith('/payroll-compliance/payroll-processing')) || pathname.startsWith('/finance-role/') || (pathname.startsWith('/manager/') && !pathname.startsWith('/manager/attendance-approvals')) || pathname.startsWith('/ld/') || pathname.startsWith('/dept-head/')) {
        return NextResponse.redirect(new URL('/company-admin/dashboard', request.url));
      }
    }

    // 3b. COMPANY_ADMIN restrictions
    else if (normalizedRole === 'COMPANY_ADMIN' || normalizedRole === 'COMPANY_OWNER') {
      if (
        (pathname.startsWith('/employee/') && !pathname.startsWith('/attendance/timesheets') && !pathname.startsWith('/timesheet-approvals')) ||
        (pathname.startsWith('/hr/') && !pathname.startsWith('/hr/grievance-management') && !pathname.startsWith('/hr/employees/') && !pathname.startsWith('/hr/separation') && !pathname.startsWith('/hr/performance')) ||
        pathname.startsWith('/super-admin/') ||
        (pathname.startsWith('/payroll-compliance/') && !pathname.startsWith('/payroll-compliance/payroll-processing')) ||
        pathname.startsWith('/finance-role/') ||
        (pathname.startsWith('/manager/') && !pathname.startsWith('/manager/attendance-approvals')) ||
        pathname.startsWith('/ld/') ||
        pathname.startsWith('/dept-head/')
      ) {
        console.log('Redirecting Company Admin to company admin dashboard');
        return NextResponse.redirect(new URL('/company-admin/dashboard', request.url));
      }
    }

    // 4. PAYROLL_ADMIN restrictions
    else if (normalizedRole === 'PAYROLL_ADMIN') {
      // Read-only guard for Payroll Admin
      if (
        pathname.startsWith('/payroll/organization-management/departments/add') ||
        pathname.startsWith('/payroll/organization-management/designations/add') ||
        pathname.startsWith('/payroll/organization-management/departments/edit') ||
        pathname.startsWith('/payroll/organization-management/designations/edit') ||
        pathname.startsWith('/payroll/policy-rule/add') ||
        pathname.startsWith('/payroll/policy-rule/edit') ||
        pathname.startsWith('/payroll/custom-policies/add') ||
        pathname.startsWith('/payroll/custom-policies/edit')
      ) {
        return NextResponse.redirect(new URL('/payroll/organization-management', request.url));
      }

      if (pathname.startsWith('/payroll/employees/add')) {
        return NextResponse.redirect(new URL('/payroll/employees', request.url));
      }
      if (pathname.startsWith('/payroll/employees/edit')) {
        return NextResponse.redirect(new URL('/payroll/employees', request.url));
      }
      if (pathname.includes('/payroll/employees/') && pathname.includes('/documents')) {
        return NextResponse.redirect(new URL('/payroll/employees', request.url));
      }
      if (pathname.startsWith('/payroll/leave/holidays/add')) {
        return NextResponse.redirect(new URL('/payroll/leave/holidays', request.url));
      }

      if (pathname.startsWith('/employee/') && !pathname.startsWith('/attendance/timesheets') && !pathname.startsWith('/timesheet-approvals')) {
        console.log('Redirecting Payroll Admin to payroll compliance dashboard');
        return NextResponse.redirect(new URL('/payroll/dashboard', request.url));
      }
      if (pathname.startsWith('/manager/') && !pathname.startsWith('/manager/attendance-approvals')) {
        console.log('Redirecting Payroll Admin to payroll compliance dashboard (manager access denied)');
        return NextResponse.redirect(new URL('/payroll/dashboard', request.url));
      }
      if (pathname.startsWith('/hr/') && !pathname.startsWith('/hr/separation')) {
        console.log('Redirecting Payroll Admin to payroll compliance dashboard (HR access denied)');
        return NextResponse.redirect(new URL('/payroll/dashboard', request.url));
      }
      if (pathname.startsWith('/super-admin/') || pathname.startsWith('/master-admin/')) {
        console.log('Redirecting Payroll Admin to payroll compliance dashboard (admin access denied)');
        return NextResponse.redirect(new URL('/payroll/dashboard', request.url));
      }
      if (pathname.startsWith('/company-admin/')) {
        console.log('Redirecting Payroll Admin to payroll compliance dashboard (company admin access denied)');
        return NextResponse.redirect(new URL('/payroll/dashboard', request.url));
      }
      if (pathname.startsWith('/payroll-compliance/')) {
        return NextResponse.next();
      }
      if (pathname.startsWith('/ld/')) {
        console.log('Redirecting Payroll Admin to payroll compliance dashboard (LD access denied)');
        return NextResponse.redirect(new URL('/payroll/dashboard', request.url));
      }
    }

    // 5. FINANCE_ADMIN restrictions
    else if (normalizedRole === 'FINANCE_ADMIN') {
      if (pathname.startsWith('/employee/') && !pathname.startsWith('/attendance/timesheets') && !pathname.startsWith('/timesheet-approvals')) {
        console.log('Redirecting Finance Admin to finance dashboard');
        return NextResponse.redirect(new URL('/finance-role/dashboard', request.url));
      }
      if (pathname.startsWith('/manager/') && !pathname.startsWith('/manager/attendance-approvals')) {
        console.log('Redirecting Finance Admin to finance dashboard (manager access denied)');
        return NextResponse.redirect(new URL('/finance-role/dashboard', request.url));
      }
      if (pathname.startsWith('/hr/') && !pathname.startsWith('/hr/separation')) {
        console.log('Redirecting Finance Admin to finance dashboard (HR access denied)');
        return NextResponse.redirect(new URL('/finance-role/dashboard', request.url));
      }
      if (pathname.startsWith('/super-admin/') || pathname.startsWith('/master-admin/')) {
        console.log('Redirecting Finance Admin to finance dashboard (admin access denied)');
        return NextResponse.redirect(new URL('/finance-role/dashboard', request.url));
      }
      if (pathname.startsWith('/payroll-compliance/') && !pathname.startsWith('/payroll-compliance/payroll-processing')) {
        console.log('Redirecting Finance Admin to finance dashboard (payroll compliance access denied)');
        return NextResponse.redirect(new URL('/finance-role/dashboard', request.url));
      }
      if (pathname.startsWith('/company-admin/')) {
        console.log('Redirecting Finance Admin to finance dashboard (company admin access denied)');
        return NextResponse.redirect(new URL('/finance-role/dashboard', request.url));
      }
      if (pathname.startsWith('/ld/')) {
        console.log('Redirecting Finance Admin to finance dashboard (LD access denied)');
        return NextResponse.redirect(new URL('/finance-role/dashboard', request.url));
      }
    }

    // 6. MANAGER restrictions
    else if (normalizedRole === 'MANAGER') {
      if (
        (pathname.startsWith('/employee/') && !pathname.startsWith('/attendance/timesheets') && !pathname.startsWith('/employee/attendance/my-attendance') && !pathname.startsWith('/timesheet-approvals')) ||
        (pathname.startsWith('/hr/') && !pathname.startsWith('/hr/separation')) ||
        pathname.startsWith('/super-admin/') ||
        pathname.startsWith('/master-admin/') ||
        pathname.startsWith('/company-admin/') ||
        pathname.startsWith('/payroll-compliance/') ||
        pathname.startsWith('/finance-role/') ||
        pathname.startsWith('/it-admin/') ||
        pathname.startsWith('/dept-head/') ||
        pathname.startsWith('/ld/')
      ) {
        console.log('Redirecting Manager to manager dashboard');
        return NextResponse.redirect(new URL('/manager/dashboard', request.url));
      }
    }

    // 7. IT_ADMIN restrictions
    else if (normalizedRole === 'IT_ADMIN') {
      if (
        (pathname.startsWith('/employee/') && !pathname.startsWith('/attendance/timesheets') && !pathname.startsWith('/timesheet-approvals')) ||
        (pathname.startsWith('/hr/') && !pathname.startsWith('/hr/separation')) ||
        pathname.startsWith('/super-admin/') ||
        pathname.startsWith('/master-admin/') ||
        pathname.startsWith('/company-admin/') ||
        pathname.startsWith('/payroll-compliance/') ||
        pathname.startsWith('/finance-role/') ||
        (pathname.startsWith('/manager/') && !pathname.startsWith('/manager/attendance-approvals')) ||
        pathname.startsWith('/dept-head/') ||
        pathname.startsWith('/ld/')
      ) {
        console.log('Redirecting IT Admin to IT admin dashboard');
        return NextResponse.redirect(new URL('/it-admin/dashboard', request.url));
      }
    }

    // 9. DEPT_HEAD restrictions
    else if (normalizedRole === 'DEPARTMENT_HEAD' || normalizedRole === 'DEPT_HEAD' || normalizedRole === 'DEPT-HEAD') {
      if (
        (pathname.startsWith('/employee/') && !pathname.startsWith('/attendance/timesheets') && !pathname.startsWith('/timesheet-approvals')) ||
        (pathname.startsWith('/hr/') && !pathname.startsWith('/hr/separation')) ||
        pathname.startsWith('/super-admin/') ||
        pathname.startsWith('/master-admin/') ||
        pathname.startsWith('/company-admin/') ||
        pathname.startsWith('/payroll-compliance/') ||
        pathname.startsWith('/finance-role/') ||
        (pathname.startsWith('/manager/') && !pathname.startsWith('/manager/attendance-approvals')) ||
        pathname.startsWith('/it-admin/') ||
        pathname.startsWith('/ld/')
      ) {
        console.log('Redirecting Department Head to dept-head dashboard');
        return NextResponse.redirect(new URL('/dept-head/dashboard', request.url));
      }
    }

    // 8. L&D Manager restrictions
    else if (normalizedRole === 'L_AND_D_MANAGER') {
      if (
        (pathname.startsWith('/employee/') && !pathname.startsWith('/attendance/timesheets') && !pathname.startsWith('/timesheet-approvals')) ||
        (pathname.startsWith('/hr/') && !pathname.startsWith('/hr/separation')) ||
        pathname.startsWith('/super-admin/') ||
        pathname.startsWith('/master-admin/') ||
        pathname.startsWith('/company-admin/') ||
        pathname.startsWith('/payroll-compliance/') ||
        pathname.startsWith('/finance-role/') ||
        (pathname.startsWith('/manager/') && !pathname.startsWith('/manager/attendance-approvals')) ||
        pathname.startsWith('/it-admin/') ||
        pathname.startsWith('/dept-head/')
      ) {
        console.log('Redirecting L&D Manager to L&D dashboard');
        return NextResponse.redirect(new URL('/ld/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/employee/:path*',
    '/manager/:path*',
    '/hr/:path*',
    '/super-admin/:path*',
    '/company-admin/:path*',
    '/master-admin/:path*',
    '/payroll-compliance/:path*',
    '/payroll/:path*',
    '/finance-role/:path*',
    '/it-admin/:path*',
    '/dept-head/:path*',
    '/ld/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/my-attendance',
    '/my-attendance/:path*',
    '/my-separation',
    '/my-separation/:path*',
    '/team-separation',
    '/team-separation/:path*'
  ],
};
