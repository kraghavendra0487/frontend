// Error handling utilities
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  }
  
  if (error.response) {
    // Server responded with error status
    return error.response.data?.error || error.response.data?.message || defaultMessage;
  }
  
  if (error.request) {
    // Request was made but no response received
    return 'Server is not responding. Please try again later.';
  }
  
  return error.message || defaultMessage;
};

export const showErrorToast = (message, duration = 5000) => {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
};

export const showSuccessToast = (message, duration = 3000) => {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};
