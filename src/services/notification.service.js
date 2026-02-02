import { apiFetch } from './api';

export const NotificationService = {
  /**
   * Create notification only (no send).
   * @param {Object} payload - { title, message, type, link?, event_id?, drive_id? }
   */
  create: async (payload) => {
    const response = await apiFetch('/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * Send notification to selected students.
   * @param {number} id - notification id
   * @param {string[]} usns - student USNs
   */
  send: async (id, usns) => {
    const response = await apiFetch(`/notifications/${id}/send`, {
      method: 'POST',
      body: JSON.stringify({ usns }),
    });
    return response.data;
  },

  /**
   * List all notifications (admin) with sent, unread, read stats.
   */
  list: async (params = {}) => {
    const sp = new URLSearchParams();
    if (params.page != null) sp.set('page', params.page);
    if (params.limit != null) sp.set('limit', params.limit);
    const qs = sp.toString();
    const response = await apiFetch(`/notifications${qs ? `?${qs}` : ''}`);
    return response.data;
  },

  /**
   * Get single notification with stats (admin).
   */
  getById: async (id) => {
    const response = await apiFetch(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Get recipients for a notification with read/unread status (admin).
   */
  getRecipients: async (id) => {
    const response = await apiFetch(`/notifications/${id}/recipients`);
    return response.data;
  },

  /**
   * Resend notification to selected students (admin).
   */
  resend: async (id, usns) => {
    const response = await apiFetch(`/notifications/${id}/resend`, {
      method: 'POST',
      body: JSON.stringify({ usns }),
    });
    return response.data;
  },

  getMyNotifications: async () => {
    const response = await apiFetch('/notifications/me');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiFetch('/notifications/me/unread-count');
    return response.data;
  },

  markAsRead: async (studentNotificationId) => {
    await apiFetch(`/notifications/me/${studentNotificationId}/read`, {
      method: 'PATCH',
    });
  },

  markAllAsRead: async () => {
    await apiFetch('/notifications/me/read-all', { method: 'PATCH' });
  },

  toggleStar: async (studentNotificationId) => {
    const response = await apiFetch(`/notifications/me/${studentNotificationId}/star`, {
      method: 'PATCH',
    });
    return response.data;
  },

  toggleArchive: async (studentNotificationId) => {
    const response = await apiFetch(`/notifications/me/${studentNotificationId}/archive`, {
      method: 'PATCH',
    });
    return response.data;
  },
};
