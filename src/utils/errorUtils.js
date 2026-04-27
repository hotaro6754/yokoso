
import { toast } from 'react-hot-toast';

/**
 * Handles API errors by displaying toast notifications.
 * Supports structured error responses with validation details.
 * 
 * Expected Error Format:
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "errors": [
 *       {
 *           "message": "subdomain must only contain alpha-numeric characters",
 *           "path": "subdomain",
 *           "type": "body"
 *       }
 *   ]
 * }
 * 
 * @param {Object} error - The error object caught in the try-catch block
 * @param {string} fallbackMessage - A default message if no specific error info is found
 */
export const handleApiError = (error, fallbackMessage = 'Operation failed') => {
    console.error('API Error:', error);

    const responseData = error.response?.data;

    // Check for specific "errors" array (Validation errors)
    if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        // Option 1: Show each error in a separate toast (can be overwhelming)
        // responseData.errors.forEach(err => {
        //     toast.error(err.message || 'Validation error');
        // });

        // Option 2 (Better): Combine them into a single, detailed message
        // Using a custom render for toast to handle newlines/HTML-like strcuture if needed, 
        // but react-hot-toast supports string messages. We can join them.

        // Let's create a list of messages
        const errorMessages = responseData.errors.map(err => err.message).join('\n');

        // Display the main message plus the list
        toast.error(`${responseData.message || 'Validation Failed'}:\n${errorMessages}`, {
            duration: 5000,
            style: {
                minWidth: '300px',
                textAlign: 'left'
            }
        });
        return;
    }

    // Check for a single "message" string in response
    if (responseData?.message) {
        toast.error(responseData.message);
        return;
    }

    // Fallback to generic error message
    toast.error(error.message || fallbackMessage);
};
