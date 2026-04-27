"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Mail, Building2, Phone, Briefcase, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function RequestDemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: '',
    employeeCount: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  const hasSqlInjectionPattern = (value) => {
    const input = String(value || "");
    if (!input.trim()) return false;

    const sqlKeywordPattern = /\b(select|insert|update|delete|drop|truncate|alter|create|replace|union|exec|execute|declare|cast)\b/i;
    const sqlMetaPattern = /(--|;|\/\*|\*\/|@@|char\s*\(|nchar\s*\(|varchar\s*\(|nvarchar\s*\()/i;
    const tautologyPattern = /('|")\s*(or|and)\s*('|")?\d+('|")?\s*=\s*('|")?\d+('|")?/i;

    return sqlKeywordPattern.test(input) || sqlMetaPattern.test(input) || tautologyPattern.test(input);
  };

  const hasSpecialCharacters = (value) => /[^a-zA-Z0-9\s]/.test(value || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    toast.dismiss(); // Clear any existing toasts on new submission

    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., name@company.com)';
    }

    if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    const containsHTML = (str) => /[<>]/.test(str || '');

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Full Name is required';
    } else if (containsHTML(formData.contactPerson)) {
      newErrors.contactPerson = 'Script/HTML tags are not allowed';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.contactPerson)) {
      newErrors.contactPerson = 'Full Name must contain only letters and spaces';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company Name is required';
    } else if (containsHTML(formData.companyName)) {
      newErrors.companyName = 'Script/HTML tags are not allowed';
    } else if (hasSpecialCharacters(formData.companyName)) {
      newErrors.companyName = 'Company Name cannot contain special characters';
    }

    if (containsHTML(formData.notes)) {
      newErrors.notes = 'Script/HTML tags are not allowed';
    } else if (formData.notes && hasSpecialCharacters(formData.notes)) {
      newErrors.notes = 'Notes cannot contain special characters';
    }

    const sqlSensitiveFields = [
      { key: 'contactPerson', label: 'Full Name' },
      { key: 'companyName', label: 'Company Name' },
      { key: 'email', label: 'Work Email' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'industry', label: 'Industry' },
      { key: 'employeeCount', label: 'Company Size' },
      { key: 'notes', label: 'Notes' },
    ];

    sqlSensitiveFields.forEach(({ key, label }) => {
      if (hasSqlInjectionPattern(formData[key])) {
        newErrors[key] = `${label} contains invalid characters or SQL-like patterns`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});


    setLoading(true);

    const sanitizeHTML = (str) => {
      if (!str) return '';
      return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    const sanitizedData = {
      ...formData,
      contactPerson: sanitizeHTML(formData.contactPerson),
      companyName: sanitizeHTML(formData.companyName),
      notes: sanitizeHTML(formData.notes),
      source: 'Website',
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        // ignore JSON parse error
      }

      if (!response.ok) {
        const errorMsg = (data.message || '').toLowerCase();

        if (errorMsg.includes('email')) {
          setErrors({ email: 'An account with this email already exists. Please sign in or use a different email.' });
          return;
        }
        if (errorMsg.includes('phone') || errorMsg.includes('mobile') || errorMsg.includes('number')) {
          setErrors({ phone: 'This mobile number is already linked to another account.' });
          return;
        }

        throw new Error(data.message || 'Failed to submit form');
      }

      toast.success(data.message || 'Request submitted successfully. Confirmation email sent.', { id: 'demo-success' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/');
    } catch (error) {
      toast.error(error.message === 'Failed to submit form' ? 'Something went wrong. Please try again later.' : error.message || 'Something went wrong. Please try again later.', { id: 'demo-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent leading space
    if (value.startsWith(' ')) {
      return;
    }

    // Prevent any spaces in email
    if (name === 'email' && /\s/.test(value)) {
      return;
    }

    // Prevent HTML characters in text fields (XSS prevention)
    if (['contactPerson', 'companyName', 'notes'].includes(name) && /[<>]/.test(value)) {
      return;
    }

    // Full Name should only allow alphabetic characters and spaces
    if (name === 'contactPerson' && value !== '' && !/^[a-zA-Z\s]*$/.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: 'Full Name must contain only letters and spaces' }));
      return;
    }

    // Company Name should not contain special characters
    if (name === 'companyName' && value !== '' && !/^[a-zA-Z0-9\s]*$/.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: 'Company Name cannot contain special characters' }));
      return;
    }

    // Notes should not contain special characters
    if (name === 'notes' && value !== '' && !/^[a-zA-Z0-9\s]*$/.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: 'Notes cannot contain special characters' }));
      return;
    }

    // For phone, only allow exact digits up to 10
    if (name === 'phone') {
      if (value !== '' && !/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    // Block SQL-injection-like payloads in all form fields.
    if (hasSqlInjectionPattern(value)) {
      setErrors((prev) => ({
        ...prev,
        [name]: 'Invalid characters or SQL-like patterns are not allowed',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container-custom pt-32 pb-20 items-center justify-center flex px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left panel - Branding */}
          <div className="md:w-5/12 bg-gradient-to-br from-brand-600 to-brand-900 p-8 text-white hidden md:flex flex-col justify-between relative overflow-hidden">
            {/* Visual background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-10 -left-10 w-40 h-40 bg-accent-500/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors mb-8 text-base font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
              <h2 className="text-4xl font-display font-bold mb-4 leading-tight">
                Transform your workplace today.
              </h2>
              <p className="text-brand-100 text-lg">
                See how Zodeck empowers your workforce and standardizes your organization's entire lifecycle.
              </p>
            </div>

            <div className="relative z-10">
              <img src="/images/logo/zodeck_logo.jpeg" alt="Zodeck" className="h-10 w-auto rounded-md shadow-sm" />
            </div>
          </div>

          {/* Right panel - Form Content */}
          <div className="w-full md:w-7/12 p-8 sm:p-10 lg:p-12 relative">
            <button
              onClick={() => router.back()}
              className="md:hidden flex items-center gap-2 text-brand-600 hover:text-brand-800 transition-colors mb-6 text-sm font-medium font-sans"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-display">Request a Demo</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Contact Person */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 transition-all outline-none ${errors.contactPerson
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    placeholder="John Doe"
                    minLength={2}
                    maxLength={50}
                  />
                  {errors.contactPerson && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.contactPerson}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-brand-400" />
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 transition-all outline-none ${errors.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    placeholder="john@company.com"
                    maxLength={100}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-brand-400" />
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 transition-all outline-none ${errors.companyName
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    placeholder="Acme Corp"
                    minLength={2}
                    maxLength={100}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.companyName}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-brand-400" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 transition-all outline-none ${errors.phone
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>
                  )}
                </div>

                {/* Industry Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none appearance-none"
                  >
                    <option value="" disabled>Select Industry</option>
                    <option value="IT/Software">IT/Software</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Employee Count Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-brand-400" />
                    Company Size
                  </label>
                  <select
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none appearance-none"
                  >
                    <option value="" disabled>Select Size</option>
                    <option value="1-50">1 - 50</option>
                    <option value="51-200">51 - 200</option>
                    <option value="201-500">201 - 500</option>
                    <option value="501-1000">501 - 1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>
              </div>

              {/* Requirements/Notes Textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-500">How can we help you? (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none resize-none"
                  placeholder="Tell us about your specific goals or challenges..."
                  maxLength={500}
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
