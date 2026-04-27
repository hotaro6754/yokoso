"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "HR Director",
    company: "TechFlow Solutions",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    content: "Zodeck transformed our HR operations completely. The payroll compliance automation alone saved us 40+ hours every month. The interface is intuitive and our team adopted it within days.",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    role: "CEO",
    company: "InnovateTech India",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content: "As a growing startup with 200+ employees, we needed a solution that could scale with us. Zodeck's modular approach means we only pay for what we use, and the Indian compliance features are unmatched.",
    rating: 5,
  },
  {
    name: "Anita Desai",
    role: "Operations Manager",
    company: "GlobalServe BPO",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face",
    content: "The attendance integration with our biometric systems was seamless. Employee self-service portal reduced our HR team's workload by 60%. Best investment we made this year.",
    rating: 5,
  },
  {
    name: "Vikram Patel",
    role: "CFO",
    company: "FinanceFirst Consulting",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "The statutory compliance reports are incredibly detailed. PF, ESI, PT calculations are always accurate, and the monthly registers are generated automatically. Our audits have become a breeze.",
    rating: 5,
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      nextTestimonial();
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <section className="section-premium bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient-dark opacity-60"></div>
      <div className="absolute inset-0 noise-overlay opacity-30"></div>

      <div className="container-custom relative z-10 max-w-5xl mx-auto" ref={containerRef}>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-premium hairline-border mb-6">
            <span className="badge-label text-gray-300">Customer Success</span>
          </div>
          <h2 className="heading-section text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Loved by leading teams <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Across India.</span>
          </h2>
        </motion.div>

        {/* Premium Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass-premium hairline-border rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto relative group"
            >
              {/* Decorative Quote */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shadow-2xl">
                <Quote className="w-5 h-5 text-brand-400 fill-brand-400/20" />
              </div>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-8">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-400 text-brand-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-xl md:text-3xl text-gray-300 leading-relaxed mb-10 font-medium tracking-tight">
                "{testimonials[currentIndex].content}"
              </p>

              {/* Author */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-full object-cover border border-white/20"
                  />
                  <div className="absolute inset-0 rounded-full border border-brand-400/30 scale-110 animate-pulse-ring pointer-events-none"></div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white tracking-tight">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-sm text-brand-400">
                    {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full glass-premium hairline-border flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === currentIndex
                      ? "w-8 bg-brand-400"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full glass-premium hairline-border flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;