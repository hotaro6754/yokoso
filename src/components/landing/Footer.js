"use client";

import { motion } from "framer-motion";
import {
  Linkedin,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Modules", href: "#modules" },
    { label: "Pricing", href: "#pricing" },
  ],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com/company/zodeck", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com/zodeck", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com/@zodeck", label: "YouTube" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050510] relative overflow-hidden pt-24 border-t border-white/10">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 mesh-gradient-dark opacity-30"></div>
      <div className="absolute inset-0 noise-overlay opacity-20"></div>

      <div className="container-custom relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 lg:gap-8 pb-16">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-3">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-[14px] bg-brand-500/10 border border-brand-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-2xl tracking-tighter">Z</span>
              </div>
              <span className="font-bold text-3xl tracking-tighter text-white">
                Zodeck<span className="text-brand-400">.</span>
              </span>
            </Link>

            <p className="text-gray-400 max-w-sm mb-8 leading-relaxed text-[15px]">
              The complete Operating System for modern HR. Payroll, attendance, and compliance, engineered for Indian enterprises.
            </p>

            <div className="space-y-4">
              <a href="mailto:hello@zodeck.in" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium tracking-wide">hello@zodeck.in</span>
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium tracking-wide">+91-98765-43210</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium tracking-wide leading-relaxed">Kondapur, Hyderabad, <br />Telangana, India</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-6 opacity-60">Product</h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm font-medium inline-flex items-center gap-1 group">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-brand-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-6 opacity-60">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm font-medium inline-flex items-center gap-1 group">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-brand-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-6 opacity-60">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm font-medium inline-flex items-center gap-1 group">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-brand-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-500 hover:text-white transition-all hover:scale-110"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 text-sm font-medium text-gray-500 tracking-tight">
            <p>© {currentYear} Zodeck Technologies. All rights reserved.</p>
            <p className="flex items-center gap-1.5">Engineered in <span className="w-4 h-4 rounded-full bg-orange-500 inline-block relative overflow-hidden"><span className="absolute inset-0 top-1/3 bg-white"></span><span className="absolute inset-0 top-2/3 bg-green-500"></span><div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-blue-800"></div></span> India</p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;