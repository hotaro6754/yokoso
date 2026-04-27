"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navLinks = [
  { label: "Modules", href: "/#modules" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blogs", href: "/blogs" },
  { label: "Careers", href: "/careers" },
  {
    label: "About",
    href: "/about",
    subLinks: [
      { label: "Our Story", href: "/about/our-story" },
      { label: "Our Team", href: "/about/our-team" },
      { label: "Contact Us", href: "/about/contact" },
    ],
  },
];

export const Navbar = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out flex justify-center ${
        isScrolled ? "pt-4" : "pt-6"
      }`}
    >
      {/* Floating Pill Container */}
      <div
        className={`w-full max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-500 ${
          isScrolled
            ? "glass-premium-light hairline-border-light rounded-full py-2 shadow-2xl shadow-gray-200/50"
            : "bg-transparent py-4"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 pl-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/">
              <img
                src="/images/logo/zodeck_logo.jpeg"
                alt="Zodeck"
                className={`transition-all duration-300 rounded-lg shadow-sm ${
                  isScrolled ? "h-9 w-auto" : "h-12 w-auto"
                }`}
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 backdrop-blur-md px-2 py-1.5 rounded-full hairline-border-light">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.subLinks && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.subLinks ? (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown(activeDropdown === link.label ? null : link.label)
                    }
                    className="flex items-center gap-1.5 px-4 py-2 font-medium text-[14px] tracking-tight text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-all duration-200"
                  >
                    {link.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        activeDropdown === link.label ? "rotate-180 text-brand-600" : "opacity-70"
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="flex items-center px-4 py-2 font-medium text-[14px] tracking-tight text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                )}

                {/* Dropdown (Premium Spring Animation) */}
                <AnimatePresence>
                  {link.subLinks && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-48 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-xl border border-gray-100 shadow-xl p-2 z-50"
                    >
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.label}
                          href={subLink.href}
                          className="block px-4 py-2.5 text-[14px] font-medium tracking-tight text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
                        >
                          {subLink.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3 pr-2">
            <Link
              href="/signin"
              className="px-5 py-2 font-semibold text-[14px] tracking-tight text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => router.push("/request-demo")}
              className="btn-magnetic !py-2 !px-5 !text-[14px]"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2.5 rounded-full bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100 transition-colors mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Glassmorphic Takeover) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 lg:hidden bg-white/95 backdrop-blur-2xl pt-28 px-6 pb-6 overflow-y-auto"
          >
            <div className="max-w-sm mx-auto flex flex-col h-full">
              <div className="space-y-2 flex-1">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    className="space-y-1"
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between text-2xl font-bold tracking-tight py-4 text-gray-900 border-b border-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                      {link.subLinks && <ChevronDown className="w-6 h-6 text-gray-400" />}
                    </Link>
                    {link.subLinks && (
                      <div className="pl-4 pt-2 pb-4 space-y-4">
                        {link.subLinks.map((subLink) => (
                          <Link
                            key={subLink.label}
                            href={subLink.href}
                            className="block text-lg font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subLink.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="pt-8 space-y-4 mt-auto">
                <button
                  onClick={() => {
                    router.push("/signin");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 text-lg font-semibold tracking-tight text-gray-900 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    router.push("/request-demo");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 text-lg font-semibold tracking-tight text-white bg-brand-600 rounded-2xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
