"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import { EcosystemVisual } from "./EcosystemVisual";

export const Hero = () => {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#0A0A0A] pt-24 pb-20">
      {/* Premium Background Layer (Mesh + Noise) */}
      <div className="absolute inset-0 mesh-gradient-hero"></div>
      <div className="absolute inset-0 noise-overlay opacity-30"></div>

      {/* Grid Pattern overlay (subtle) */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>

      <div className="container-custom relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Pre-headline Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-premium hairline-border">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="badge-label text-gray-300">Zodeck 2.0 is Live</span>
            <div className="w-px h-4 bg-gray-600 mx-1"></div>
            <Link href="#pricing" className="text-xs font-medium text-white flex items-center hover:text-brand-400 transition-colors">
              See Pricing <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* Massive Headline */}
        <div className="text-center max-w-5xl mx-auto space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="heading-display text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] text-white tracking-tighter leading-[1.05]"
          >
            The Operating System <br className="hidden md:block" />
            for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 animate-gradient-shift">Modern HR.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-body-lg text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto"
          >
            Replace fragmented tools with one cohesive, 60fps platform. <br className="hidden md:block" />
            Payroll, attendance, and compliance, engineered for Indian enterprises.
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 w-full sm:w-auto"
        >
          <Link href="/request-demo" className="btn-magnetic w-full sm:w-auto !px-8 !py-4 !text-base">
            Start Free Trial <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link href="#demo" className="btn-magnetic-outline w-full sm:w-auto !px-8 !py-4 !text-base bg-white/5 backdrop-blur-sm">
            <Play className="w-4 h-4 mr-2" /> Book Demo
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-14 flex flex-col items-center gap-4"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=64&h=64&fit=crop&crop=face`}
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] object-cover"
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-brand-400 text-brand-400" />
              ))}
            </div>
            <p className="text-sm font-medium text-gray-400 tracking-tight">
              Trusted by 500+ Indian enterprises
            </p>
          </div>
        </motion.div>

        {/* Floating Mockup / Ecosystem (The Visual Hook) */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="w-full max-w-6xl mt-24 relative z-20"
        >
          <div className="gradient-border-animated">
            <div className="bg-[#0A0A0A] rounded-[1rem] p-2 sm:p-4">
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden bg-[#111111] hairline-border flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10"></div>
                <EcosystemVisual />
              </div>
            </div>
          </div>

          {/* Premium Glow under the mockup */}
          <div className="absolute -inset-x-20 top-1/2 -bottom-20 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        </motion.div>
        
      </div>
    </section>
  );
};

export default Hero;
