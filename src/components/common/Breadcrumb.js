'use client';

import { Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const breadcrumbConfig = {
  defaultTransform: (path) =>
    path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  specialPaths: {
    '': 'Home',
    dashboard: 'Dashboard',
    projects: 'Projects',
    employee: 'Employee',
    employees: 'Employees',
    attendance: 'Attendance',
    'my-attendance': 'My Attendance',
    'my-leaves': 'My Leaves',
    'leave-history': 'My Leaves',
    'leave-summery-details': 'Leave Summary Details',
    'regularization': 'Regularization',
    'overtime': 'Overtime',
    'holidays': 'Holidays',
    holiday: 'Holiday Management',
    'timesheets': 'Timesheets',
    leave: 'Leave',
    payslips: 'Payslips',
    profile: 'Profile',
    requests: 'Requests & Tickets',
    learning: 'Learning',
    'company-info': 'Company Update',
    notifications: 'Notifications Center',
    payroll: 'Payroll',
    recruitment: 'Recruitment',
    report: 'Reports',
    department: 'Department',
    designation: 'Designation',
    new: 'Add New',
    edit: 'Edit',
  },
  hiddenPaths: ['hr'],
  idPaths: ['id', 'projects'],
};

const Breadcrumb = ({ customTitle, subtitle, rightContent, items }) => {
  const pathname = usePathname();

  // If custom items are provided, use them as the breadcrumb source
  if (items && items.length > 0) {
    const breadcrumbs = [
      {
        href: '/',
        label: <Home className="w-4 h-4" />,
        isCurrent: false,
        isIcon: true,
        isClickable: true,
      },
      ...items.map((item, index) => ({
        href: item.path || '#',
        label: item.label,
        isCurrent: index === items.length - 1,
        isIcon: false,
        isClickable: !!item.path && index !== items.length - 1,
      }))
    ];

    return (
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <nav className="overflow-x-auto" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className="flex items-center">
                {breadcrumb.isClickable ? (
                  <Link
                    href={breadcrumb.href}
                    className="transition-colors duration-200 text-primary hover:text-primary/80 flex items-center"
                  >
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground">
                    {breadcrumb.label}
                  </span>
                )}

                {index < breadcrumbs.length - 1 && (
                  <span className="mx-2 opacity-50">/</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
      </div>
    );
  }

  // Don't show breadcrumb on dashboard pages
  if (pathname.includes('/dashboard')) {
    return null;
  }

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const filteredPaths = paths.filter(
      (path) => !breadcrumbConfig.hiddenPaths.includes(path)
    );

    // Dynamic dashboard link for the home icon based on the current module
    const dashboardHome = filteredPaths.length > 0
      ? `/${filteredPaths[0]}/dashboard`
      : '/';

    const breadcrumbs = [
      {
        href: dashboardHome,
        label: <Home className="w-4 h-4" />,
        isCurrent: false,
        isIcon: true,
        isClickable: true,
      },
    ];

    let accumulatedPath = '';
    for (let i = 0; i < filteredPaths.length; i++) {
      const path = filteredPaths[i];
      accumulatedPath += `/${path}`;

      let label;
      const isIdPath =
        i > 0 &&
        breadcrumbConfig.idPaths.includes(filteredPaths[i - 1]);

      if (isIdPath) {
        label =
          i < filteredPaths.length - 1 && filteredPaths[i + 1] === 'edit'
            ? 'Edit'
            : 'Details';
      } else if (breadcrumbConfig.specialPaths[path]) {
        label = breadcrumbConfig.specialPaths[path];
      } else {
        label = breadcrumbConfig.defaultTransform(path);
      }

      // Add only the very last item as non-clickable current page
      if (i === filteredPaths.length - 1) {
        breadcrumbs.push({
          href: accumulatedPath,
          label,
          isCurrent: true,
          isIcon: false,
          isClickable: false,
        });
      } else {
        breadcrumbs.push({
          href: accumulatedPath,
          label,
          isCurrent: false,
          isIcon: false,
          isClickable: true,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <nav className="overflow-x-auto" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className="flex items-center">
              {breadcrumb.isClickable ? (
                <Link
                  href={breadcrumb.href}
                  className="transition-colors duration-200 text-primary hover:text-primary/80 flex items-center"
                >
                  {breadcrumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">
                  {breadcrumb.label}
                </span>
              )}

              {index < breadcrumbs.length - 1 && (
                <span className="mx-2 opacity-50">/</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
    </div>
  );
};

export default Breadcrumb;
