"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Building2,
  Users,
  Clock,
  Shield,
  Award,
  HeartHandshake
} from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: "5000+",
    label: "SMEs Supported",
    description: "Designed for businesses with 1-1000 employees",
  },
  {
    icon: Users,
    value: "1000+",
    label: "Concurrent Users",
    description: "Built to handle enterprise-scale operations",
  },
  {
    icon: Clock,
    value: "99.9%",
    label: "Uptime SLA",
    description: "Enterprise-grade reliability and performance",
  },
  {
    icon: Shield,
    value: "100%",
    label: "India Compliant",
    description: "PF, ESI, PT, TDS & all statutory requirements",
  },
];

const CountUp = ({ target }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const numericPart = target.replace(/[^0-9.]/g, '');
  const suffix = target.replace(/[0-9.]/g, '');

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500"
    >
      {numericPart}{suffix}
    </motion.span>
  );
};

export const Stats = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0A0A] border-t border-white/5">
      <div className="absolute inset-0 noise-overlay opacity-20"></div>

      <div className="container-custom relative z-10" ref={containerRef}>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="heading-section text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
            Built for Scale, Designed for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Indian Businesses</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Enterprise-grade infrastructure with SME-friendly simplicity. No compromises.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-premium hairline-border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <stat.icon className="w-6 h-6 text-brand-400" />
              </div>

              <div className="heading-display text-4xl mb-2">
                <CountUp target={stat.value} />
              </div>

              <h4 className="text-lg font-bold text-white mb-2">
                {stat.label}
              </h4>

              <p className="text-sm text-gray-400 leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 pt-10 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 lg:gap-16"
        >
          <div className="flex items-center gap-3 text-gray-400">
            <Award className="w-5 h-5 text-brand-400" />
            <span className="font-medium text-sm tracking-wide uppercase">ISO 27001 Ready</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="font-medium text-sm tracking-wide uppercase">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <HeartHandshake className="w-5 h-5 text-purple-400" />
            <span className="font-medium text-sm tracking-wide uppercase">24/7 Support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;