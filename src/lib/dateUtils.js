/**
 * Format a date string or Date object to dd-mm-yyyy format
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string in dd-mm-yyyy format or 'N/A' if invalid
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

/**
 * Format a date string or Date object to dd-mm-yyyy HH:mm format
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date-time string or 'N/A' if invalid
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
};
