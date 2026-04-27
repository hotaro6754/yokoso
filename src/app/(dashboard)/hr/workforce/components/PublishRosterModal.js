"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Bell, AlertTriangle, X } from "lucide-react";

export default function PublishRosterModal({ isOpen, onClose, onConfirm, month, year, submitting }) {
  const monthName = new Date(0, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-lg">
                      <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white">
                      Publish Roster
                    </Dialog.Title>
                  </div>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl mt-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Are you sure you want to publish the roster for <strong>{monthName} {year}</strong>? This will notify all employees about their updated shifts.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-sans"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 font-sans"
                      onClick={onConfirm}
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        "Publish & Notify"
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
