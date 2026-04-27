"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

/**
 * Reusable row-actions dropdown for Master Admin tables.
 *
 * Supports:
 * - View / Edit links
 * - Delete callback
 * - Custom actions (button items)
 */
export default function ActionDropdown({
  viewUrl,
  editUrl,
  onDelete,
  customActions = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const handleScrollOrResize = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      // If the page/table scrolls, close to avoid wrong positioning
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const actions = [];

  if (viewUrl) {
    actions.push({
      label: "View",
      icon: Eye,
      href: viewUrl,
      className: "text-gray-700 dark:text-gray-200",
      iconClassName: "text-primary-600 dark:text-primary-400",
    });
  }

  if (editUrl) {
    actions.push({
      label: "Edit",
      icon: Edit,
      href: editUrl,
      className: "text-gray-700 dark:text-gray-200",
      iconClassName: "text-emerald-600 dark:text-emerald-400",
    });
  }

  if (onDelete) {
    actions.push({
      label: "Delete",
      icon: Trash2,
      onClick: () => {
        setIsOpen(false);
        onDelete();
      },
      className: "text-red-700 dark:text-red-300",
      iconClassName: "text-red-600 dark:text-red-400",
      hoverClassName: "hover:bg-red-50 dark:hover:bg-red-900/20",
    });
  }

  actions.push(...customActions);

  if (actions.length === 0) return null;

  const MENU_WIDTH = 208; // w-52 = 13rem = 208px (prevents label wrapping)
  const ROW_HEIGHT = 40; // approx height per item (px)

  const overlay = isOpen ? (
    <>
      {/* Backdrop (ensures overlay + easy close) */}
      <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />

      <div
        ref={dropdownRef}
        className="fixed z-[9999] w-52 text-left bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 py-1"
        role="menu"
        onClick={(e) => e.stopPropagation()}
        style={
          menuPos
            ? { top: `${menuPos.top}px`, left: `${menuPos.left}px` }
            : undefined
        }
      >
        {actions.map((action, idx) => {
          const Icon = action.icon;
          const isDisabled = Boolean(action.disabled);
          const baseClassName = `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
            isDisabled
              ? ""
              : action.hoverClassName || "hover:bg-gray-50 dark:hover:bg-gray-700"
          } ${action.className || ""} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`;

          if (action.href) {
            return (
              <Link
                key={idx}
                href={action.href}
                role="menuitem"
                className={baseClassName}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={`h-4 w-4 ${action.iconClassName || ""}`} />
                <span>{action.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              role="menuitem"
              className={`${baseClassName} w-full text-left`}
              disabled={isDisabled}
              onClick={() => {
                setIsOpen(false);
                action.onClick?.();
              }}
            >
              <Icon className={`h-4 w-4 ${action.iconClassName || ""}`} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </>
  ) : null;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
        title="Actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          const nextOpen = !isOpen;
          if (nextOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const gap = 8;
            const estimatedMenuHeight = actions.length * ROW_HEIGHT + 8;
            const fitsBelow = rect.bottom + gap + estimatedMenuHeight <= window.innerHeight - gap;
            const top = fitsBelow ? rect.bottom + gap : Math.max(gap, rect.top - gap - estimatedMenuHeight);
            const left = Math.max(
              gap,
              Math.min(window.innerWidth - MENU_WIDTH - gap, rect.right - MENU_WIDTH)
            );
            setMenuPos({ top, left, width: MENU_WIDTH });
          }
          setIsOpen(nextOpen);
        }}
      >
        <MoreVertical size={18} className="text-gray-700 dark:text-gray-300" />
      </button>

      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </div>
  );
}

