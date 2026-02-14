// Helper function to get full image URL
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export const getImageUrl = (url) => {
  if (!url) return '';
  // Already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Relative path - prepend API URL and use /api prefix for routing
  if (url.startsWith('/uploads/')) {
    // Use /api/uploads for proper routing through ingress
    return `${API_URL}/api${url}`;
  }
  return url;
};
