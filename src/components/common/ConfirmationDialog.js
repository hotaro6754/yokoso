// src/components/common/ConfirmationDialog.js
"use client";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

/* Small inline SVG icons — no extra dependency required */
function WarningIcon({ className = "h-8 w-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5L22 20H2L12 2.5z"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
      />
      <path
        d="M12 9v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" />
    </svg>
  );
}

function InfoIcon({ className = "h-8 w-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="0.6" />
      <path
        d="M11.9 8.5h.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M11.5 11.3c.3 0 .7-.1 1 .1.6.4.9 1 1 1.9v1.1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  closeOnConfirm = true, // set to false if you want to handle closing after async actions
}) {
  async function handleConfirm() {
    try {
      if (onConfirm) {
        await onConfirm();
      }
    } finally {
      if (closeOnConfirm && onClose) onClose();
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Soft backdrop with blur for a modern feel */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-250"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal center */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250"
            enterFrom="opacity-0 translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-2 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-center shadow-xl transition-all ring-1 ring-black/5">
              {/* Icon */}
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                  isDestructive
                    ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
                aria-hidden
              >
                {isDestructive ? <WarningIcon /> : <InfoIcon />}
              </div>

              {/* Title & message (centered like SweetAlert2) */}
              <Dialog.Title
                as="h3"
                className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
              >
                {title}
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {message}
                </p>
              </div>

              {/* Buttons centered — responsive stack on small screens */}
              <div className="mt-6">
                <div className="mx-auto flex w-full max-w-xs flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    {cancelText}
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    autoFocus
                    className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition ${
                      isDestructive
                        ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                        : "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500"
                    }`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
