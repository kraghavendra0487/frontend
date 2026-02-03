import { apiFetch } from './api';

/**
 * Admin user login management (admin/superadmin only).
 * @param {Object} params - { role_id, is_active, search, page, limit }
 */
export const getUserLoginList = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.role_id != null && params.role_id !== '') searchParams.set('role_id', params.role_id);
  if (params.is_active != null && params.is_active !== '') searchParams.set('is_active', params.is_active);
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', params.page);
  if (params.limit) searchParams.set('limit', params.limit);
  const qs = searchParams.toString();
  const res = await apiFetch(`/auth/admin/user-login${qs ? `?${qs}` : ''}`);
  return res.data;
};

export const updateUserLoginIsActive = async (id, is_active) => {
  const res = await apiFetch(`/auth/admin/user-login/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active }),
  });
  return res.data;
};

export const bulkUpdateUserLoginIsActive = async (ids, is_active) => {
  const res = await apiFetch('/auth/admin/user-login/bulk', {
    method: 'PATCH',
    body: JSON.stringify({ ids, is_active }),
  });
  return res.data;
};

/**
 * Students who have no user_login record (school, program, year, search filters).
 * @param {Object} params - { school_id, program_id, year_of_joining, search, page, limit }
 */
export const getStudentsWithoutLogin = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.school_id != null && params.school_id !== 'all') searchParams.set('school_id', params.school_id);
  if (params.program_id != null && params.program_id !== 'all') searchParams.set('program_id', params.program_id);
  if (params.year_of_joining != null && params.year_of_joining !== 'all') searchParams.set('year_of_joining', params.year_of_joining);
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', params.page);
  if (params.limit) searchParams.set('limit', params.limit);
  const qs = searchParams.toString();
  const res = await apiFetch(`/auth/admin/students-without-login${qs ? `?${qs}` : ''}`);
  return res.data;
};

/**
 * Get all company logins with company details
 * @param {Object} params - { search, page, limit }
 */
export const getCompanyLogins = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', params.page);
  if (params.limit) searchParams.set('limit', params.limit);
  const qs = searchParams.toString();
  const res = await apiFetch(`/auth/admin/company-logins${qs ? `?${qs}` : ''}`);
  return res.data;
};

/**
 * Create a new company login
 * @param {Object} data - { company_id, email, password }
 */
export const createCompanyLogin = async (data) => {
  const res = await apiFetch('/auth/admin/company-login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
};

/**
 * Delete a company login
 * @param {number} id - The user_login id to delete
 */
export const deleteCompanyLogin = async (id) => {
  const res = await apiFetch(`/auth/admin/company-login/${id}`, {
    method: 'DELETE',
  });
  return res.data;
};

export default {
  getUserLoginList,
  getStudentsWithoutLogin,
  updateUserLoginIsActive,
  bulkUpdateUserLoginIsActive,
  getCompanyLogins,
  createCompanyLogin,
  deleteCompanyLogin,
};
