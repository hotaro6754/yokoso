"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  Calendar,
  Wallet,
  Briefcase,
  UserCheck,
  LayoutDashboard,
  Shield,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";

const modules = [
  {
    id: "core-hr",
    icon: Users,
    title: "Core HR",
    subtitle: "Employee Master & Lifecycle",
    features: ["Total Employee Database", "Org Structure Management", "Document Vault", "Designtation Mapping"],
    color: "from-blue-500/20 to-transparent",
    iconColor: "text-blue-400",
  },
  {
    id: "attendance",
    icon: ClipboardList,
    title: "Attendance",
    subtitle: "Real-time Tracking",
    features: ["Biometric & Geofencing", "Shift Management", "Late/Early Tracking", "Overtime Calculation"],
    color: "from-indigo-500/20 to-transparent",
    iconColor: "text-indigo-400",
  },
  {
    id: "payroll",
    icon: Wallet,
    title: "Payroll",
    subtitle: "End-to-End Processing",
    features: ["One-click Pay Run", "Statutory Compliance", "Payslip Generation", "Bank Transfer Output"],
    color: "from-purple-500/20 to-transparent",
    iconColor: "text-purple-400",
  },
  {
    id: "recruitment",
    icon: Briefcase,
    title: "Recruitment",
    subtitle: "Hiring Pipeline",
    features: ["Job Requisitions", "Resume Parsing", "Interview Scheduling", "Offer Management"],
    color: "from-rose-500/20 to-transparent",
    iconColor: "text-rose-400",
  }
];

export const Modules = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const [activeModule, setActiveModule] = useState(modules[0]);

  // Premium scroll parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <section id="modules" ref={containerRef} className="section-premium bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 mesh-gradient-dark"></div>
      <div className="absolute inset-0 noise-overlay opacity-40"></div>
      
      <div className="container-custom relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-premium hairline-border mb-6"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-brand-400" />
            <span className="badge-label text-gray-300">Unified Architecture</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-section text-4xl md:text-5xl text-white mb-6"
          >
            Integrated Modules for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Every HR Need.</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Side: Interactive List */}
          <div className="lg:col-span-5 space-y-4 relative z-20">
            {modules.map((module, idx) => (
              <motion.button
                key={module.id}
                onClick={() => setActiveModule(module)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                  activeModule.id === module.id 
                    ? "glass-premium hairline-border scale-[1.02] shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]" 
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeModule.id === module.id ? 'bg-[#111]' : 'bg-transparent'}`}>
                    <module.icon className={`w-6 h-6 ${activeModule.id === module.id ? module.iconColor : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold tracking-tight ${activeModule.id === module.id ? 'text-white' : 'text-gray-400'}`}>
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{module.subtitle}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right Side: Dynamic Visual Display */}
          <div className="lg:col-span-7 relative min-h-[400px] lg:min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                {/* Premium Glass Window */}
                <div className="w-full h-full glass-premium hairline-border rounded-3xl p-8 flex flex-col relative overflow-hidden group">
                  
                  {/* Dynamic Gradient Flare */}
                  <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl ${activeModule.color} rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none transition-all duration-1000`}></div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#111] border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-brand-400" /> Enterprise Grade
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10 flex-1">
                    {activeModule.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className="bg-[#111]/50 border border-white/5 rounded-xl p-4 flex flex-col justify-center gap-3 hover:bg-[#111] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${activeModule.iconColor.replace('text-', 'bg-')}`}></div>
                        </div>
                        <span className="text-[15px] font-medium text-gray-300 leading-tight">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Abstract UI visual at the bottom */}
                  <div className="mt-8 h-32 w-full rounded-2xl bg-gradient-to-t from-[#111] to-transparent border border-white/5 flex items-end justify-center pb-0 overflow-hidden relative z-10">
                     <div className="w-3/4 h-24 bg-white/5 rounded-t-xl border-t border-x border-white/10 flex items-center justify-center">
                        <div className="w-1/2 h-2 rounded-full bg-white/20"></div>
                     </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Modules;