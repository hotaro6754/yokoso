"use client";

import { useAuth } from "@/context/AuthContext";
import { Calendar } from "lucide-react";

export default function FinanceGreetingCard() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getUserName = () => {
    if (user?.employee?.firstName) {
      return user.employee.firstName;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.email?.split("@")[0] || "Finance";
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getShortDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary-600 dark:bg-primary-700 p-6 text-white shadow-lg h-full">
      {/* Minimal decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10">
        {/* Top section with greeting and short date */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-white/90 text-sm font-medium mb-2">
              {getGreeting()}
            </p>
            <h2 className="text-3xl font-bold mb-2">
              {getUserName()}!
            </h2>
            <p className="text-white/80 text-sm">
              Welcome back to your dashboard
            </p>
          </div>
          {/* Small calendar badge at top-right */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <Calendar size={12} className="text-white/90" />
            <span className="text-xs font-medium text-white/90">{getShortDate()}</span>
          </div>
        </div>

        {/* Bottom section with full date */}
        <div className="pt-4 border-t border-white/20">
          <p className="text-white/70 text-xs flex items-center gap-2">
            <Calendar size={12} />
            {getCurrentDate()}
          </p>
        </div>
      </div>
    </div>
  );
}
