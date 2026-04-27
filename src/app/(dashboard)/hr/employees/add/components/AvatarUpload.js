// src/components/employee/AvatarUpload.js
"use client";

import React, { useRef, useState, useEffect } from "react";

export default function AvatarUpload({ value, onChange }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(value?.url || "/images/users/default-avatar.png");

  useEffect(() => {
    if (value && value.url) setPreview(value.url);
  }, [value]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // simple client-side validation
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Max 5MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.({ file, url });
  }

  function removeImage() {
    setPreview("/images/users/default-avatar.png");
    onChange?.(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4">
      <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200">
        <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1">
        <div className="flex gap-2">
          <label
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded text-sm cursor-pointer hover:bg-gray-50"
            htmlFor="avatarUpload"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Upload
          </label>

          <input
            id="avatarUpload"
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          <button
            type="button"
            onClick={removeImage}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border rounded text-sm hover:bg-red-100"
          >
            Remove
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Recommended: 300x300px. Max 5MB. JPG, PNG allowed.
        </p>
      </div>
    </div>
  );
}
