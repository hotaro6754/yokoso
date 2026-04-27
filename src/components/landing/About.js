"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Rocket, Eye, Handshake, ArrowUpRight } from "lucide-react";
import { founders } from "@/data/founders";

const values = [
  {
    icon: Rocket,
    title: "Our Mission",
    description: "To deliver a decentralized, employee-driven ELCM platform that replaces administrative HR with scalable governance and measurable business outcomes for Indian SMEs.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description: "To lead India’s transition from administrative HR to employee-driven life cycle management, combining technology, governance, and trust at scale.",
  },
  {
    icon: Handshake,
    title: "Our Promise",
    description: "We deliver accountable, employee-driven systems that improve retention and productivity while reducing governance overhead and cost.",
  },
];

export const About = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 bg-[#050510] relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 mesh-gradient-dark opacity-40"></div>
      <div className="absolute inset-0 noise-overlay opacity-30"></div>

      <div className="container-custom relative z-10 max-w-7xl mx-auto px-4 sm:px-6" ref={containerRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-premium hairline-border mb-6">
            <span className="badge-label text-gray-300">About Zodeck</span>
          </div>
          <h2 className="heading-section text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
            Manifesting Growth for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Indian Businesses.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We're on a mission to transform how Indian businesses manage their most valuable asset — their people.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-premium hairline-border rounded-2xl p-8 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
                <value.icon className="w-7 h-7 text-brand-400" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-4">
                {value.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-[15px]">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Company Info + Founders */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <div className="space-y-6">
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Built in India, for India
            </h3>
            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
              <p>
                Zodeck Technologies was founded with a clear purpose: to build an employee-driven life cycle platform designed for the realities of Indian businesses and the aspirations of India's workforce.
              </p>
              <p>
                Our team brings together decades of experience across employee operations, enterprise software, and Indian statutory governance. Zodeck handles the complexities of India's work ecosystem seamlessly.
              </p>
              <p>
                Headquartered in Hyderabad, we empower organizations across India to simplify governance and focus on what truly matters — sustainable growth and performance.
              </p>
            </div>

            <div className="flex gap-12 mt-12 pt-8 border-t border-white/10">
              <div>
                <div className="text-4xl font-bold text-white mb-1 tracking-tighter">2024</div>
                <div className="text-sm font-medium text-brand-400 uppercase tracking-widest">Founded</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-1 tracking-tighter">Hyd</div>
                <div className="text-sm font-medium text-brand-400 uppercase tracking-widest">Headquarters</div>
              </div>
            </div>
          </div>

          {/* Team Preview */}
          <div className="glass-premium hairline-border rounded-[2rem] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <h4 className="text-xl font-bold text-white mb-8 tracking-tight">Leadership Team</h4>
            <div className="space-y-4">
              {founders.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-5 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover border border-white/20"
                    />
                    <div className="absolute inset-0 rounded-full border border-brand-400/50 scale-105 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-bold text-white tracking-tight">{member.name}</h5>
                    <p className="text-sm text-brand-400 font-medium">{member.role}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;