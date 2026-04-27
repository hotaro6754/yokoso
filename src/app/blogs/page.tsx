"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

type BlogItem = {
  title: string;
  category: string;
  readTime: string;
  description: string;
  image: string;
};

const categories = [
  "All Blogs",
  "Core HR & EX",
  "Hiring & Onboarding",
  "Payroll",
  "Performance Management",
  "Professional Service Automation (PSA)",
  "Time & Attendance",
];

const blogItems: BlogItem[] = [
  {
    title: "Learning and Development Specialists Salary in India",
    category: "Core HR & EX",
    readTime: "6 min read",
    description: "A practical salary benchmark guide for L&D professionals across growth-stage organizations.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Compensation and Benefits Specialist Salaries in India",
    category: "Payroll",
    readTime: "7 min read",
    description: "Understand market trends, pay ranges, and compensation structures for C&B specialists.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Employee Relations and Industrial Relations Specialist Salaries in India",
    category: "Core HR & EX",
    readTime: "5 min read",
    description: "Role-based pay insights and growth expectations for ER and IR focused HR professionals.",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "HR Analytics Salaries in India",
    category: "Performance Management",
    readTime: "6 min read",
    description: "A data-driven salary outlook for HR analytics roles and capabilities in demand.",
    image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Payroll and Compliance Specialist Salaries in India",
    category: "Payroll",
    readTime: "8 min read",
    description: "Compensation benchmarks for payroll and compliance professionals in Indian businesses.",
    image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Write for Keka! Guest Post Guidelines",
    category: "Professional Service Automation (PSA)",
    readTime: "4 min read",
    description: "Contributor guidelines for experts who want to publish practical HR and workplace insights.",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Talent Acquisition Specialist Salary in India",
    category: "Hiring & Onboarding",
    readTime: "6 min read",
    description: "Current salary patterns and role evolution for TA specialists in India.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Payroll Professional's 12+ Hour Day Earns Reddit's Gratitude",
    category: "Payroll",
    readTime: "5 min read",
    description: "A story-driven look at operational excellence and the unseen work behind payroll teams.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Detect Disengagement Early Using Artificial Intelligence",
    category: "Time & Attendance",
    readTime: "7 min read",
    description: "How AI signals can help HR teams proactively identify and reduce disengagement risks.",
    image: "https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=1200&q=80",
  },
];

const ITEMS_PER_PAGE = 6;

const getPageItems = (totalPages: number, currentPage: number): Array<number | string> => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

export default function BlogsPage() {
  const [activeCategory, setActiveCategory] = useState("All Blogs");
  const [currentPage, setCurrentPage] = useState(1);

  const listBlogs = useMemo(
    () =>
      blogItems.filter(
        (item) => activeCategory === "All Blogs" || item.category === activeCategory,
      ),
    [activeCategory],
  );

  const totalPages = Math.max(1, Math.ceil(listBlogs.length / ITEMS_PER_PAGE));
  const pageItems = useMemo(() => getPageItems(totalPages, currentPage), [totalPages, currentPage]);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return listBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [listBlogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-brand-50 hover:border-brand-200"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedBlogs.map((blog) => (
              <article
                key={blog.title}
                className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover rounded-t-xl" />
                <div className="p-5">
                  <p className="text-sm text-gray-500">
                    {blog.category} <span className="mx-1.5">|</span> {blog.readTime}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 leading-snug">{blog.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{blog.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center gap-3">
            {pageItems.map((page, index) =>
              typeof page === "string" ? (
                <span key={`ellipsis-${index}`} className="px-1 py-1.5 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "border border-gray-200 text-gray-700 hover:border-brand-200 hover:bg-brand-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="rounded-2xl bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 px-6 py-14 md:px-10 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold">See Keka in action</h2>
            <p className="mt-4 text-white/80 max-w-3xl mx-auto leading-relaxed">
              Discover why fast-growing companies are making the switch for a smarter payroll,
              HR, and project experience.
            </p>
            <Link
              href="/request-demo"
              className="mt-8 inline-flex items-center rounded-full bg-white text-primary px-6 py-3 text-sm font-semibold hover:bg-brand-50 transition-colors"
            >
              Get a demo
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

