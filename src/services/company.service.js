import { apiFetch } from './api';

/**
 * Company Service - API calls for company portal
 */
export const CompanyService = {
  // ============== PROFILE ==============
  
  /** Get my company profile */
  getMyProfile: async () => {
    const response = await apiFetch('/company/profile');
    return response.data?.data;
  },

  /** Update my company profile */
  updateProfile: async (data) => {
    const response = await apiFetch('/company/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data?.data;
  },

  // ============== CONTACTS ==============
  
  /** Get company contacts */
  getContacts: async () => {
    const response = await apiFetch('/company/contacts');
    return response.data?.data ?? [];
  },

  /** Add a new contact */
  addContact: async (data) => {
    const response = await apiFetch('/company/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data?.data;
  },

  /** Update a contact */
  updateContact: async (id, data) => {
    const response = await apiFetch(`/company/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data?.data;
  },

  /** Delete a contact */
  deleteContact: async (id) => {
    await apiFetch(`/company/contacts/${id}`, { method: 'DELETE' });
  },

  // ============== PLACEMENT DRIVES ==============
  
  /** Get all placement drives for my company */
  getDrives: async () => {
    const response = await apiFetch('/company/drives');
    return response.data?.data ?? [];
  },

  /** Get single drive details */
  getDriveById: async (id) => {
    const response = await apiFetch(`/company/drives/${id}`);
    return response.data?.data;
  },

  /** Get drive eligibility criteria */
  getDriveEligibility: async (driveId) => {
    const response = await apiFetch(`/company/drives/${driveId}/eligibility`);
    return response.data?.data;
  },

  /** Get candidates for a drive (pipeline) */
  getDriveCandidates: async (driveId, params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    const response = await apiFetch(`/company/drives/${driveId}/candidates${qs ? `?${qs}` : ''}`);
    return response.data?.data ?? [];
  },

  /** Update candidate status in pipeline */
  updateCandidateStatus: async (driveId, usn, data) => {
    const response = await apiFetch(`/company/drives/${driveId}/candidates/${encodeURIComponent(usn)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data?.data;
  },

  // ============== STUDENT PROFILES (Company-Safe View) ==============
  
  /** Get student profile (company-safe view) */
  getStudentProfile: async (usn) => {
    const response = await apiFetch(`/company/students/${encodeURIComponent(usn)}`);
    return response.data?.data;
  },

  // ============== OFFERS ==============
  
  /** Get all offers for my company */
  getOffers: async () => {
    const response = await apiFetch('/company/offers');
    return response.data?.data ?? [];
  },

  // ============== NOTIFICATIONS ==============
  
  /** Get company notifications */
  getNotifications: async () => {
    const response = await apiFetch('/company/notifications');
    return response.data?.data ?? [];
  },

  // ============== EVENTS ==============
  
  /** Get company-relevant events */
  getEvents: async () => {
    const response = await apiFetch('/company/events');
    return response.data?.data ?? [];
  },

  // ============== DASHBOARD ==============
  
  /** Get dashboard stats */
  getDashboardStats: async () => {
    const response = await apiFetch('/company/dashboard');
    return response.data?.data;
  },
};

export default CompanyService;
