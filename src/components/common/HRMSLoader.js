// src/components/common/HRMSLoader.js
"use client";
import React from "react";

/**
 * HRMSLoader - A professional loading component for Zodeck HRMS
 * 
 * @param {string} text - Custom loading text (default: "Loading application...")
 * @param {string} variant - Loader variant: "fullscreen" | "inline" | "overlay" (default: "fullscreen")
 * @param {string} size - Loader size: "sm" | "md" | "lg" (default: "md")
 */
export default function HRMSLoader({
  text = "Loading application...",
  variant = "fullscreen",
  size = "md"
}) {
  // Size configurations
  const sizeConfig = {
    sm: {
      logo: "h-8 w-8",
      spinner: "h-6 w-6",
      text: "text-sm"
    },
    md: {
      logo: "h-12 w-12",
      spinner: "h-8 w-8",
      text: "text-base"
    },
    lg: {
      logo: "h-16 w-16",
      spinner: "h-12 w-12",
      text: "text-lg"
    }
  };

  const config = sizeConfig[size];

  // Logo component
  const Logo = () => (
    <div
      className={`${config.logo} flex items-center justify-center rounded-xl shadow-lg transition-all duration-300`}
      style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--hero-gradient-end)) 100%)'
      }}
    >
      <span className="text-white font-bold text-xl leading-none">Z</span>
    </div>
  );

  // Spinner component
  const Spinner = () => (
    <div className="relative">
      <div
        className={`${config.spinner} border-4 border-primary-100 rounded-full animate-spin`}
        style={{
          borderTopColor: 'hsl(var(--primary))',
          borderRightColor: 'hsl(var(--primary))'
        }}
      ></div>
      <div
        className={`absolute inset-0 ${config.spinner} border-4 border-transparent rounded-full animate-spin`}
        style={{
          borderTopColor: 'hsl(var(--primary))',
          animationDirection: 'reverse',
          animationDuration: '1.5s'
        }}
      ></div>
    </div>
  );

  // Fullscreen variant
  if (variant === "fullscreen") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6 px-4">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo />
          </div>

          {/* Spinner */}
          <div className="flex justify-center">
            <Spinner />
          </div>

        </div>
      </div>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Spinner />
      </div>
    );
  }

  // Overlay variant
  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-6 min-w-[200px]">
          <Logo />
          <Spinner />
        </div>
      </div>
    );
  }

  return null;
}
