/**
 * Utility function to get the correct file URL
 * - Supabase PUBLIC buckets (projects, system-assets): return URL as-is, direct access
 * - Supabase PRIVATE buckets: use backend proxy for signed URL
 * - Legacy /uploads: backend static files
 */
const PRIVATE_BUCKETS = ['student-assets', 'alumni-assets', 'company-assets', 'admin-assets'];

export const getFileUrl = (filePath) => {
  if (!filePath) return null;

  const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const API_BASE_URL = rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const API_URL = `${API_BASE_URL}/api`;

  // Full URL (http/https)
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    // Supabase storage: public buckets = direct URL, private = signed URL proxy
    if (filePath.includes('supabase.co/storage')) {
      const isPrivate = PRIVATE_BUCKETS.some((b) => filePath.includes(`/${b}/`));
      if (isPrivate) {
        return `${API_URL}/upload/asset?url=${encodeURIComponent(filePath)}`;
      }
      return filePath; // public bucket - direct access
    }
    return filePath;
  }

  // Legacy /uploads path - backend static files
  if (filePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${filePath}`;
  }
  if (!filePath.startsWith('/')) {
    return `${API_BASE_URL}/uploads/${filePath}`;
  }
  return `${API_BASE_URL}${filePath}`;
};
