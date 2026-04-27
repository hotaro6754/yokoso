"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { UploadCloud, Trash2, User, Image as ImageIcon, CheckCircle2 } from "lucide-react";

export default function ProfilePicturePage() {
  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Settings", href: "/employee/settings" },
    { label: "Profile Picture", href: "/employee/settings/profile-picture" },
  ];

  const [avatar, setAvatar] = useState(
    "https://avatars.dicebear.com/api/gridy/profile.svg"
  );
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target.result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setAvatar("https://avatars.dicebear.com/api/gridy/profile.svg");
    setMessage("");
  };

  const handleSave = () => {
    // Handle save logic here (API call or state persistence)
    console.log("Profile picture updated:", avatar);
    setMessage("Profile picture has been updated successfully!");
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Picture</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update your profile avatar to personalize your account
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full border-4 border-primary-200 dark:border-primary-500/30 flex items-center justify-center overflow-hidden shadow-lg bg-primary-50 dark:bg-primary-500/10">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-20 h-20 text-primary-400 dark:text-primary-500" />
                    )}
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <label className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm">
                    <UploadCloud className="w-4 h-4" />
                    Upload New Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUpload}
                    />
                  </label>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset to Default
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Upload Guidelines
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Recommended Size
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use a square image (e.g., 200x200px or 400x400px) for the best result. Supported formats: PNG, JPG, SVG, WebP.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Tips for Best Results
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Use a neutral or professional avatar</li>
                    <li>Ensure good contrast with the background</li>
                    <li>Avoid low-resolution images (minimum 200x200px)</li>
                    <li>Keep file size under 5MB for faster uploads</li>
                  </ul>
                </div>

                <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30 rounded-lg p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong className="text-primary-700 dark:text-primary-400">Note:</strong> Changes will be visible across all platforms after saving. Your profile picture is visible to your team members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-300">{message}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
