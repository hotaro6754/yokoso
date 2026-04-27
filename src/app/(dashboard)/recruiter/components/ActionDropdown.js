"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

const ActionDropdown = ({ 
  itemId, 
  viewUrl, 
  editUrl, 
  onDelete,
  onMoveToOnboarding,
  currentStage,
  latestOffer,
  customActions = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    const handleScroll = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextOpen = !isOpen;
    if (nextOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const MENU_WIDTH = 192; // w-48
        const gap = 4;
        
        let top = rect.bottom + gap;
        let left = rect.right - MENU_WIDTH;

        // Adjust if goes off screen
        if (left < gap) left = gap;
        
        setMenuPos({ top, left });
    }
    setIsOpen(nextOpen);
  };

  const handleAction = (callback) => {
    if (callback) {
      callback();
    }
    setIsOpen(false);
  };

  const actions = [];
  
  if (viewUrl) {
    actions.push({
      label: "View",
      icon: Eye,
      href: viewUrl,
      className: "text-gray-700 dark:text-gray-300"
    });
  }

  if (editUrl) {
    actions.push({
      label: "Edit",
      icon: Edit,
      href: editUrl,
      className: "text-gray-700 dark:text-gray-300"
    });
  }

  if (onMoveToOnboarding) {
    actions.push({
      label: "Move to Onboarding",
      icon: ArrowRight,
      onClick: () => handleAction(onMoveToOnboarding),
      className: "text-emerald-600 dark:text-emerald-400"
    });
  }

  if (onDelete) {
    actions.push({
      label: "Delete",
      icon: Trash2,
      onClick: () => handleAction(onDelete),
      className: "text-red-600 dark:text-red-400"
    });
  }

  if (currentStage === 'SELECTED') {
    actions.push({
      label: "Resend Selection Mail",
      icon: ShieldCheck,
      onClick: () => {
        const handleRetrigger = async () => {
          try {
            const { recruiterService } = await import("@/services/recruiter-services/recruiter.service");
            const { toast } = await import("react-hot-toast");
            toast.loading("Resending selection mail...");
            await recruiterService.retriggerDocumentUpload(itemId);
            toast.dismiss();
            toast.success("Selection mail resent successfully");
          } catch (error) {
            const { toast } = await import("react-hot-toast");
            toast.dismiss();
            toast.error(error.message || "Failed to resend mail");
          }
        };
        handleAction(handleRetrigger);
      },
      className: "text-brand-600 dark:text-brand-400 font-medium"
    });
  }

  if ((currentStage === 'OFFERED' || latestOffer) && (currentStage !== 'SELECTED' && currentStage !== 'REJECTED')) {
    const offer = latestOffer || (itemId && currentStage === 'OFFERED' ? { id: itemId } : null);
    if (offer && offer.id) {
        actions.push({
          label: "Resend Offer Mail",
          icon: Mail,
          onClick: () => {
            const handleRetriggerOffer = async () => {
              try {
                const { hrOfferService } = await import("@/services/hr-services/offer-management.service");
                const { toast } = await import("react-hot-toast");
                toast.loading("Resending offer mail...");
                await hrOfferService.retriggerOfferEmail(offer.id);
                toast.dismiss();
                toast.success("Offer mail resent successfully");
              } catch (error) {
                const { toast } = await import("react-hot-toast");
                toast.dismiss();
                toast.error(error.message || "Failed to resend offer mail");
              }
            };
            handleAction(handleRetriggerOffer);
          },
          className: "text-amber-600 dark:text-amber-400 font-medium"
        });
    }
  }

  // Add custom actions
  actions.push(...customActions);

  if (actions.length === 0) return null;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 rounded transition-colors"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div
            ref={dropdownRef}
            className="fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              
              if (action.href) {
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${action.className || ""}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </Link>
                );
              }
              
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`flex items-center gap-3 px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${action.className || ""}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ActionDropdown;
