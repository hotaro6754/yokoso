// src/app/(dashboard)/layout.js
"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import HRMSLoader from "@/components/common/HRMSLoader";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isCompanyAdminRoute = pathname?.startsWith("/company-admin");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, loading, router]); // Added router to dependencies

  // Show loading state while checking authentication
  if (loading) {
    return <HRMSLoader text="Initializing dashboard..." variant="fullscreen" size="md" />;
  }

  // Never render a blank screen while redirecting
  if (!isAuthenticated) {
    return <HRMSLoader text="Redirecting to sign in..." variant="fullscreen" size="md" />;
  }

  // Dynamic class for main content margin based on sidebar state
  // Add a small gutter so content doesn't visually touch the sidebar.
  // Use `md:` (not only `lg:`) to keep spacing correct on tablets/smaller laptops too.
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded
      ? "md:ml-[280px]" // sidebar 280px
      : "md:ml-[80px]"; // sidebar 80px

  return (
    <AuthGuard requireAuth={true}>
      {/* <ErrorBoundary> */}
      <div className={`min-h-screen bg-gray-50 dark:bg-[#0A0A0A] transition-colors duration-300${isCompanyAdminRoute ? " company-admin-theme" : ""}`}>
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />

        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ease-[0.16,1,0.3,1] min-h-screen ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader user={user} />

          {/* Page Content */}
          <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-10 py-6">
            {(pathname?.startsWith("/company-admin") || pathname?.startsWith("/finance-role") || pathname?.startsWith("/finance")) && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition-all hover:scale-105 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
                  aria-label="Back"
                  title="Back"
                >
                  <ArrowLeft size={16} />
                </button>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
      {/* </ErrorBoundary> */}
    </AuthGuard>
  );
}
