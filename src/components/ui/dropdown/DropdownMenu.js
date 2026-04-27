// src/components/ui/dropdown/DropdownMenu.js
export default function DropdownMenu({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black bg-opacity-25" />
      <div className="absolute right-0 z-50 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {children}
      </div>
    </div>
  );
}