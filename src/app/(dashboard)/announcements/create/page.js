"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import announcementService from "@/services/announcement.service";
import {
  ArrowLeft,
  Globe,
  Info,
  Loader2,
  Megaphone,
  Send,
  Settings,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublished: true,
    category:
      user?.role === "HR" || user?.role === "HR_ADMIN" || user?.systemRole === "HR_ADMIN"
        ? "HR"
        : "COMPANY_ADMIN"
  });

  const isAdmin =
    user?.role === "HR" ||
    user?.role === "HR_ADMIN" ||
    user?.systemRole === "HR_ADMIN" ||
    user?.role === "COMPANY_ADMIN" ||
    user?.systemRole === "COMPANY_ADMIN" ||
    user?.systemRole === "SUPER_ADMIN";

  React.useEffect(() => {
    if (user && !isAdmin) {
      toast.error("You are not authorized to access this page");
      router.push("/announcements");
    }
  }, [user, isAdmin, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await announcementService.createAnnouncement(formData);
      toast.success("Announcement created successfully");
      router.push("/announcements");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "Announcements", href: "/announcements" },
            { label: "Create" },
          ]}
        />

        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Create Announcement
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Compose and publish an announcement for the selected audience.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <div className="rounded-sm bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Announcement Content</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add the title and message for this announcement.</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={10}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none resize-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  placeholder="Write the announcement message"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <div className="rounded-sm bg-gray-100 p-2.5 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Publishing Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set publication mode and distribution channel.</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-sm border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/40">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Settings size={16} />
                  Publication Logic
                </label>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Publish Immediately
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Turn off to save the announcement as a draft.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    />
                    <div className="w-10 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-brand-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:border-white"></div>
                  </label>
                </div>
              </div>

              <div className="rounded-sm border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/40">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Globe size={16} />
                  Distribution Channel
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-sm border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="HR">HR Communications</option>
                  <option value="COMPANY_ADMIN">Executive Administration</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-brand-50/40 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40 rounded-sm p-4 flex gap-3">
            <Info size={16} className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <p className="text-sm text-brand-800 dark:text-brand-300">
              Published announcements become visible immediately in the selected audience stream. Draft announcements can be edited and published later.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-sm hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {formData.isPublished ? "Publish Announcement" : "Save Draft"}
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
