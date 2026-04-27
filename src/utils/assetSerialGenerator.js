// src/utils/assetSerialGenerator.js

/**
 * Generate asset serial number in format: AST-{CATEGORYCODE}-{RUNNINGNUMBER}
 * @param {string} categoryName - Category name (e.g., "Laptop", "Monitor")
 * @param {number} runningNumber - Auto-increment number for this category
 * @returns {string} - Serial number (e.g., "AST-LAP-00001")
 */
export function generateAssetSerial(categoryName, runningNumber) {
  if (!categoryName) {
    throw new Error("Category name is required");
  }

  // Get first 3 letters of category name, uppercase
  const categoryCode = categoryName
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  if (categoryCode.length < 3) {
    // Pad with X if category name is too short
    const padded = categoryCode.padEnd(3, "X");
    return `AST-${padded}-${String(runningNumber).padStart(5, "0")}`;
  }

  // Format running number with leading zeros (5 digits)
  const formattedNumber = String(runningNumber).padStart(5, "0");

  return `AST-${categoryCode}-${formattedNumber}`;
}

/**
 * Extract category code from serial number
 * @param {string} serialNumber - Serial number (e.g., "AST-LAP-00001")
 * @returns {string} - Category code (e.g., "LAP")
 */
export function extractCategoryCode(serialNumber) {
  if (!serialNumber || !serialNumber.includes("-")) {
    return null;
  }
  const parts = serialNumber.split("-");
  return parts.length >= 2 ? parts[1] : null;
}

/**
 * Extract running number from serial number
 * @param {string} serialNumber - Serial number (e.g., "AST-LAP-00001")
 * @returns {number} - Running number (e.g., 1)
 */
export function extractRunningNumber(serialNumber) {
  if (!serialNumber || !serialNumber.includes("-")) {
    return null;
  }
  const parts = serialNumber.split("-");
  return parts.length >= 3 ? parseInt(parts[2], 10) : null;
}
