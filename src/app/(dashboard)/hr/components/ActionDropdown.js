"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, UserCheck, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

const ActionDropdown = ({ 
  itemId, 
  viewUrl, 
  onSelect,
  isMoving = false,
  currentStage,
  latestOffer
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
    };

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
      label: "View Profile",
      icon: Eye,
      href: viewUrl,
      className: "text-gray-700 dark:text-gray-300"
    });
  }

  if (onSelect && currentStage !== 'SELECTED' && currentStage !== 'REJECTED' && currentStage !== 'OFFERED' && currentStage !== 'OFFER_ACCEPTED') {
    actions.push({
      label: "Select Candidate",
      icon: UserCheck,
      onClick: () => handleAction(onSelect),
      className: "text-emerald-600 dark:text-emerald-400 font-bold"
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

  if (currentStage === 'OFFERED' && latestOffer) {
    actions.push({
      label: "Resend Offer Mail",
      icon: Mail,
      onClick: () => {
        const handleRetriggerOffer = async () => {
          try {
            const { hrOfferService } = await import("@/services/hr-services/offer-management.service");
            const { toast } = await import("react-hot-toast");
            toast.loading("Resending offer mail...");
            await hrOfferService.retriggerOfferEmail(latestOffer.id);
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



  if (actions.length === 0) return null;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={isMoving}
        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-all shadow-sm border border-gray-100 dark:border-gray-700"
        title="More Actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div
            ref={dropdownRef}
            className="fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 overflow-hidden animate-in fade-in zoom-in duration-75"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              
              if (action.href) {
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${action.className || ""}`}
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
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${action.className || ""}`}
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
