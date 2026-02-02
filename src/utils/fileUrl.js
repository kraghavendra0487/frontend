/**
 * Utility function to get the correct file URL
 * Handles both relative paths and full URLs
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // If it's already a full URL (http/https), return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Get backend base URL
  const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  let API_BASE_URL = rawUrl.replace('/api', ''); // Remove /api to get base URL
  
  // Ensure no trailing slash
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '');
  
  // If it starts with /uploads, it's a backend path - prepend backend URL
  if (filePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${filePath}`;
  }
  
  // If it's a relative path without /uploads, add it
  if (!filePath.startsWith('/')) {
    return `${API_BASE_URL}/uploads/${filePath}`;
  }
  
  // If it starts with / but not /uploads, assume it's a backend path
  return `${API_BASE_URL}${filePath}`;
};
