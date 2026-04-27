'use client';

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import {
  Users,
  Calculator,
  CalendarDays,
  FileCheck,
  UserPlus,
  Shield,
  Smartphone,
  GitBranch,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Core HR Management",
    description: "Centralized employee database with complete lifecycle management from onboarding to exit.",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Calculator,
    title: "Payroll & Compliance",
    description: "Indian payroll with PF, ESI, PT, TDS calculations and automated statutory compliance.",
    color: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: CalendarDays,
    title: "Attendance Management",
    description: "Dual-mode tracking with biometric and timesheet integration. Jira sync for tech teams.",
    color: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: FileCheck,
    title: "Leave Management",
    description: "Configurable leave policies with CL/SL/EL, automated accruals and multi-level approvals.",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: UserPlus,
    title: "Recruitment Module",
    description: "End-to-end hiring workflow from requisition to offer letter with candidate tracking.",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Granular permissions for every role, from Company Admin to Department Heads.",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Smartphone,
    title: "Mobile PWA",
    description: "Progressive Web App with offline timesheets and push notifications for on-the-go access.",
    color: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    icon: GitBranch,
    title: "Workflow Engine",
    description: "Customizable approval workflows with multi-level escalation and SLA management.",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Comprehensive HR analytics with customizable dashboards and compliance reports.",
    color: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

function FeatureCard({ feature }) {
  return (
    <div className="group relative h-full">
      <div className="relative h-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-100 hover:-translate-y-1">
        <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
          <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
        </div>

        <h3 className="font-display text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
          {feature.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export function Features() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-50px" });

  const itemsPerPage = 3;
  const numPages = Math.ceil(features.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % numPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + numPages) % numPages);
  };

  const currentFeatures = features.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <section id="features" className="py-6 md:py-10 bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gray-50/50 rounded-full blur-3xl -z-10 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-50/20 rounded-full blur-3xl -z-10 opacity-60" />

      <div className="container-custom relative z-10">
        {/* Compact Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-semibold uppercase tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Powerful Features
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Everything You Need to <span className="text-brand-600">Manage Your Workforce</span>
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            A comprehensive suite of tools designed specifically for Indian businesses.
          </p>
        </motion.div>

        {/* Features Slider */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Left Navigation (Desktop) */}
            <button
              onClick={prevSlide}
              className="hidden md:flex w-12 h-12 shrink-0 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-all hover:scale-105 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Content Grid */}
            <div className="flex-1 min-h-[280px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
                >
                  {currentFeatures.map((feature, index) => (
                    <FeatureCard key={feature.title} feature={feature} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Navigation (Desktop) */}
            <button
              onClick={nextSlide}
              className="hidden md:flex w-12 h-12 shrink-0 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-all hover:scale-105 z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation & Dots */}
          <div className="flex flex-col items-center gap-4 mt-6">
            {/* Mobile Arrows */}
            <div className="flex md:hidden items-center gap-6">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium text-gray-500">
                {currentIndex + 1} / {numPages}
              </div>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex gap-2">
              {Array.from({ length: numPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? "w-6 bg-brand-600" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;