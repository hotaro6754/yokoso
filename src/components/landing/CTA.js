"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export const CTA = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="section-premium relative overflow-hidden bg-[#0A0A0A]">
      <div className="container-custom relative z-10" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#111111] border border-white/10 rounded-[2.5rem] p-8 md:p-20 overflow-hidden text-center max-w-6xl mx-auto shadow-2xl"
        >
          {/* Dynamic Backgrounds within CTA */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-brand-600/30 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-60" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/20 to-transparent rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 opacity-50" />
            <div className="absolute inset-0 noise-overlay opacity-30"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium hairline-border text-white text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>90-Day Free Warranty Included</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="heading-display text-4xl sm:text-5xl lg:text-7xl text-white mb-6"
            >
              Ready to Upgrade your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">HR Operations?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Join hundreds of Indian SMEs who have already streamlined their workforce 
              management. Start your free trial today — no credit card required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Link href="/request-demo" className="btn-magnetic !px-10 !py-5 !text-lg w-full sm:w-auto">
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="#demo" className="text-white hover:text-brand-400 font-medium text-lg transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-brand-400/50">
                Contact Sales
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 1 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-500 tracking-tight"
            >
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div> Free 14-day trial</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div> No credit card required</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div> Cancel anytime</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
