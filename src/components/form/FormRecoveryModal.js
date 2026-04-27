// src/components/form/FormRecoveryModal.js
"use client";
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, RotateCcw, X, Calendar } from 'lucide-react';

export default function FormRecoveryModal({ isOpen, onRecover, onDiscard, lastSaved }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => { }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                    Recover Form Data
                  </Dialog.Title>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    We found previously saved employee form data. Would you like to recover it?
                  </p>
                  {lastSaved && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <Calendar className="w-3 h-3" />
                      Last saved: {formatTime(lastSaved)}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={onDiscard}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2 inline" />
                    Discard
                  </button>
                  <button
                    onClick={onRecover}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 mr-2 inline" />
                    Recover Data
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}