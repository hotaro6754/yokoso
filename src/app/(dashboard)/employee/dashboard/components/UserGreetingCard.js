// src/app/(dashboard)/employee/dashboard/components/UserGreetingCard.js
"use client";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Calendar } from "lucide-react";

export default function UserGreetingCard() {
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
    return user?.email?.split("@")[0] || "Employee";
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 text-white shadow-lg">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-primary-100 text-sm font-medium mb-1 flex items-center gap-2">
              <Sparkles size={14} />
              {getGreeting()}
            </p>
            <h2 className="text-2xl font-bold mb-2">
              {getUserName()}!
            </h2>
            <p className="text-primary-100/90 text-sm">
              Welcome back to your dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
            <Calendar size={14} />
            <span className="text-xs font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-primary-100/80 text-xs flex items-center gap-2">
            <Calendar size={12} />
            {getCurrentDate()}
          </p>
        </div>
      </div>
    </div>
  );
}
