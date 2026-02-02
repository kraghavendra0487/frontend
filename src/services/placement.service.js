import { apiFetch } from './api';

export const PlacementService = {
  /**
   * Get placement process/application status for a specific student
   * @param {string} usn 
   */
  getStudentProcess: async (usn) => {
    try {
      // Adjust endpoint as per your backend route structure
      const response = await apiFetch(`/placement/student/${usn}/applications`);
      return response.data;
    } catch (_error) {
      return [];
    }
  },

  /**
   * Get all active placement drives
   */
  getAllDrives: async () => {
    try {
      const response = await apiFetch('/placement/drives');
      return response.data || [];
    } catch (_error) {
      return [];
    }
  },

  /** Sync placement drive statuses from dates (upcoming/ongoing/completed). Call when placement events page opens. */
  syncDriveStatuses: async () => {
    try {
      const response = await apiFetch('/placement/drives/sync-status', { method: 'POST' });
      return response.data ?? { updated: 0, total: 0 };
    } catch (_error) {
      return { updated: 0, total: 0 };
    }
  },

  /** Get a single drive by id */
  getDriveById: async (id) => {
    try {
      const response = await apiFetch(`/placement/drives/${id}`);
      return response.data ?? null;
    } catch (_error) {
      return null;
    }
  },

  getDriveEligibility: async (driveId) => {
    try {
      const response = await apiFetch(`/placement/drives/${driveId}/eligibility`);
      return response.data ?? null;
    } catch (_e) {
      return null;
    }
  },

  upsertDriveEligibility: async (driveId, data) => {
    const response = await apiFetch(`/placement/drives/${driveId}/eligibility`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /** Get all student_placement_process records (admin Process page) */
  getAllProcessList: async () => {
    try {
      const response = await apiFetch('/placement/process/list');
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  /** Get student process/registrations for a drive (admin) */
  getDriveProcesses: async (driveId) => {
    try {
      const response = await apiFetch(`/placement/drives/${driveId}/registrations`);
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  /** Get enriched export data for drive registrations (admin) */
  getDriveExportData: async (driveId, params = {}) => {
    const qs = new URLSearchParams();
    if (params.stage) qs.set('stage', params.stage);
    if (params.columns && params.columns.length) qs.set('columns', params.columns.join(','));
    const url = `/placement/drives/${driveId}/export${qs.toString() ? `?${qs}` : ''}`;
    const response = await apiFetch(url);
    return response.data ?? { data: [], columns: [], availableColumns: [] };
  },

  /** Remove a student from a drive's process (admin) */
  removeFromProcess: async (driveId, usn) => {
    const response = await apiFetch(`/placement/drives/${driveId}/registrations/${encodeURIComponent(usn)}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  /** Update student placement process status (admin) */
  updateProcessStatus: async (id, data) => {
    const response = await apiFetch(`/placement/process/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /** Update placement drive (full PUT) */
  updatePlacementDrive: async (id, data) => {
    const response = await apiFetch(`/placement/drives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /** Update placement drive status only. Calls dedicated PATCH /placement/drives/:id/status (updates placements_drives.placement_status in DB). */
  updatePlacementDriveStatus: async (id, placement_status) => {
    const response = await apiFetch(`/placement/drives/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ placement_status }),
    });
    return response.data;
  },

  addPlacementDrive: async (data) => {
    const response = await apiFetch('/placement/drives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  getSchools: async () => {
    try {
      const response = await apiFetch('/student/schools');
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  getPrograms: async (schoolId) => {
    try {
      const response = await apiFetch('/student/programs');
      const all = response.data ?? [];
      if (schoolId != null && schoolId !== '') {
        const sid = typeof schoolId === 'number' ? schoolId : parseInt(schoolId, 10);
        if (!Number.isNaN(sid)) return all.filter((p) => p.school_id === sid);
      }
      return all;
    } catch (error) {
      console.error("Error fetching programs:", error);
      return [];
    }
  },

  getSpecializations: async (programId) => {
    try {
      const response = await apiFetch('/student/specializations');
      const all = response.data ?? [];
      if (programId != null && programId !== '') {
        const pid = typeof programId === 'number' ? programId : parseInt(programId, 10);
        if (!Number.isNaN(pid)) return all.filter((s) => s.program_id === pid);
      }
      return all;
    } catch (_error) {
      return [];
    }
  },

  getMajors: async (programId) => {
    try {
      const response = await apiFetch('/student/majors');
      const all = response.data ?? [];
      if (programId != null && programId !== '') {
        const pid = typeof programId === 'number' ? programId : parseInt(programId, 10);
        if (!Number.isNaN(pid)) return all.filter((m) => m.program_id === pid);
      }
      return all;
    } catch (_error) {
      return [];
    }
  },

  /** Get all students (for Add Students to Drive, Eligibility preview). Params: school_ids, program_ids, search, limit, opt_in_only, drive_id (includes academics + eligibility when set) */
  getAllStudents: async (params = {}) => {
    try {
      const q = new URLSearchParams();
      q.set('t', Date.now());
      if (params.school_ids?.length) q.set('school_ids', params.school_ids.join(','));
      if (params.program_ids?.length) q.set('program_ids', params.program_ids.join(','));
      if (params.search) q.set('search', params.search);
      if (params.limit) q.set('limit', params.limit);
      if (params.opt_in_only) q.set('opt_in_only', '1');
      if (params.drive_id != null) q.set('drive_id', params.drive_id);
      const response = await apiFetch(`/placement/students?${q.toString()}`);
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  /** Search students by USN, email, or name (for Add Violation) */
  searchStudents: async (search, limit = 50) => {
    try {
      const params = new URLSearchParams();
      if (search && String(search).trim()) params.set('search', String(search).trim());
      params.set('limit', Math.min(100, Math.max(1, limit)));
      const response = await apiFetch(`/placement/students?${params}`);
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  /** Get student process list for a student (their applications) */
  getStudentProcessList: async (usn) => {
    try {
      const response = await apiFetch(`/placement/process/${usn}`);
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  getAllJobOffers: async () => {
    try {
      const response = await apiFetch('/placement/job-offers');
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  /** Add a job offer for a student */
  addJobOffer: async (data) => {
    const response = await apiFetch('/placement/job-offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateJobOffer: async (id, data) => {
    const response = await apiFetch(`/placement/job-offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  getStudentOffers: async (usn) => {
    try {
      const response = await apiFetch(`/placement/offers/${usn}`);
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  /** Student accept/reject offer. placementId = placement id, isAccepted = true/false, remarks = required when rejecting */
  submitOfferDecision: async (placementId, isAccepted, remarks = '') => {
    const response = await apiFetch('/placement/offers/decision', {
      method: 'PATCH',
      body: JSON.stringify({ placement_id: placementId, is_accepted: isAccepted, remarks: remarks || undefined }),
    });
    return response;
  },

  /**
   * Get placement/calendar events from the events API (student view).
   * Maps API fields (event_datetime, details) to the shape expected by StudentEvents.
   */
  getAllEvents: async () => {
    try {
      const response = await apiFetch('/events');
      const raw = Array.isArray(response?.data) ? response.data : [];
      return raw.map((e) => ({
        id: e.id,
        title: e.title || 'Event',
        type: e.type || 'Event',
        event_date: e.event_datetime || e.event_date,
        description: e.details || e.description || '',
        location: e.location || 'See details',
        status: e.status,
      }));
    } catch (_error) {
      return [];
    }
  },

  /**
   * Get all participating companies
   */
  getAllCompanies: async () => {
    try {
      const response = await apiFetch('/placement/companies');
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  /**
   * Get a single company by id
   */
  getCompanyById: async (id) => {
    try {
      const response = await apiFetch(`/placement/companies/${id}`);
      return response.data ?? null;
    } catch (_error) {
      return null;
    }
  },

  /**
   * Get placement drives for a company
   */
  getCompanyDrives: async (id) => {
    try {
      const response = await apiFetch(`/placement/companies/${id}/drives`);
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  /**
   * Get placement offers (students hired) for a company
   */
  getCompanyOffers: async (id) => {
    try {
      const response = await apiFetch(`/placement/companies/${id}/offers`);
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  /**
   * Add a new company. Payload: company_name, description, company_type, address, website, linkedin, remarks, company_logo_link.
   * Optional: contacts (array of { contact_name, email, phone_number, role_title, remarks }).
   */
  addCompany: async (payload) => {
    const response = await apiFetch('/placement/companies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * Update a company. Payload: company_name, description, company_type, address, website, linkedin, remarks, company_logo_link
   */
  updateCompany: async (id, payload) => {
    const response = await apiFetch(`/placement/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  getCompanyContacts: async (id) => {
    try {
      const response = await apiFetch(`/placement/companies/${id}/contacts`);
      return response.data ?? [];
    } catch (_error) {
      return [];
    }
  },

  addCompanyContacts: async (id, contacts) => {
    const response = await apiFetch(`/placement/companies/${id}/contacts`, {
      method: 'POST',
      body: JSON.stringify(Array.isArray(contacts) ? { contacts } : contacts),
    });
    return response.data;
  },

  updateCompanyContact: async (companyId, contactId, payload) => {
    const response = await apiFetch(`/placement/companies/${companyId}/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  deleteCompanyContact: async (companyId, contactId) => {
    await apiFetch(`/placement/companies/${companyId}/contacts/${contactId}`, { method: 'DELETE' });
  },

  /**
   * Apply for a drive
   */
  applyForDrive: async (driveId, usn) => {
      try {
          const response = await apiFetch(`/placement/drives/${driveId}/apply`, {
              method: 'POST',
              body: JSON.stringify({ usn })
          });
          return response.data;
      } catch (error) {
          throw error;
      }
  },

  /** Register a student for a drive (same as apply; usn, driveId order for AddStudentsToDrive). admin_override: allow adding despite eligibility when drive has admin_override_allowed. */
  registerForDrive: async (usn, driveId, opts = {}) => {
      const body = { usn };
      if (opts.admin_override) body.admin_override = true;
      const response = await apiFetch(`/placement/drives/${driveId}/apply`, {
          method: 'POST',
          body: JSON.stringify(body)
      });
      return response.data;
  },

  /**
   * Placement overview for admin Students > Placement Overview tab
   */
  getPlacementOverview: async (academicYear) => {
    try {
      const query = academicYear ? `?academic_year=${encodeURIComponent(academicYear)}` : '';
      const response = await apiFetch(`/placement/students/overview${query}`);
      return response.data;
    } catch (_error) {
      return { rows: [], schoolOverview: {}, academicYears: [] };
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await apiFetch('/placement/dashboard/stats');
      return response.data;
    } catch (_error) {
      return null;
    }
  },

  getAllPolicies: async () => {
    try {
      const response = await apiFetch('/placement/policies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** Get batch academic policy for the current student (by school/program/year). */
  getMyPolicy: async () => {
    try {
      const response = await apiFetch('/placement/policies/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  upsertPolicy: async (data) => {
    const response = await apiFetch('/placement/policies', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data;
  },

  syncPolicies: async () => {
    const response = await apiFetch('/placement/policies/sync', { method: 'POST' });
    return response.data;
  },

  // --- Alumni ---
  /** Get current logged-in alumni profile (alumni role only) */
  getAlumniMe: async () => {
    const response = await apiFetch('/placement/alumni/me');
    return response.data;
  },

  /** Update current logged-in alumni profile */
  updateAlumniMe: async (data) => {
    const response = await apiFetch('/placement/alumni/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.data;
  },

  getAllAlumni: async () => {
    try {
      const response = await apiFetch('/placement/alumni');
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },

  addAlumni: async (data) => {
    const response = await apiFetch('/placement/alumni', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.data;
  },

  getAlumniByIdOrUsn: async (identifier) => {
    try {
      const response = await apiFetch(`/placement/alumni/${encodeURIComponent(identifier)}`);
      return response.data;
    } catch (_error) {
      return null;
    }
  },

  updateAlumni: async (identifier, data) => {
    const response = await apiFetch(`/placement/alumni/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.data;
  },

  getRegistrationCodes: async () => {
    try {
      const response = await apiFetch('/placement/alumni/codes');
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },

  generateRegistrationCode: async (data) => {
    const response = await apiFetch('/placement/alumni/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.data;
  },

  deleteRegistrationCode: async (id) => {
    const response = await apiFetch(`/placement/alumni/codes/${id}`, { method: 'DELETE' });
    return response.data;
  },

  /** Admin: get all student projects (for approve/rate) */
  getAllProjects: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const url = q ? `/placement/projects?${q}` : '/placement/projects';
    const response = await apiFetch(url);
    return response.data ?? [];
  },

  /** Admin: update project (admin_rating, is_approved) */
  updateProject: async (id, data) => {
    const response = await apiFetch(`/placement/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /** Public: get approved PUBLIC projects for showcase (?best=true for top-rated) */
  getPublicProjects: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const url = q ? `/placement/projects/public?${q}` : '/placement/projects/public';
    const response = await apiFetch(url);
    return response.data ?? [];
  },

  /**
   * Get email recipients for bulk email. Category: students | parents | alumni | staff.
   * Filters depend on category (school_id, program_id, etc. for students; parent_type for parents; etc.)
   */
  getEmailRecipients: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.page != null) searchParams.set('page', params.page);
    if (params.limit != null) searchParams.set('limit', params.limit);
    if (params.search) searchParams.set('search', params.search);
    if (params.school_id != null) searchParams.set('school_id', params.school_id);
    if (params.program_id != null) searchParams.set('program_id', params.program_id);
    if (params.major_id != null) searchParams.set('major_id', params.major_id);
    if (params.minor_id != null) searchParams.set('minor_id', params.minor_id);
    if (params.specialization_id != null) searchParams.set('specialization_id', params.specialization_id);
    if (params.year_of_joining != null) searchParams.set('year_of_joining', params.year_of_joining);
    if (params.current_year != null) searchParams.set('current_year', params.current_year);
    if (params.current_semester != null) searchParams.set('current_semester', params.current_semester);
    if (params.section) searchParams.set('section', params.section);
    if (params.gender) searchParams.set('gender', params.gender);
    if (params.is_active !== undefined && params.is_active !== '') searchParams.set('is_active', params.is_active);
    if (params.is_registered !== undefined && params.is_registered !== '') searchParams.set('is_registered', params.is_registered);
    if (params.parent_type) searchParams.set('parent_type', params.parent_type);
    if (params.graduation_year != null) searchParams.set('graduation_year', params.graduation_year);
    if (params.institution_name) searchParams.set('institution_name', params.institution_name);
    if (params.role_id != null) searchParams.set('role_id', params.role_id);
    const qs = searchParams.toString();
    const response = await apiFetch(`/placement/email-recipients${qs ? `?${qs}` : ''}`);
    return response.data;
  },

  /** Violations: eligibility decision logs */
  getEligibilityDecisionLogs: async () => {
    const response = await apiFetch('/placement/violations/eligibility-logs');
    return response.data ?? [];
  },

  /** Violations: student placement violations */
  getPlacementViolations: async () => {
    const response = await apiFetch('/placement/violations/placement-violations');
    return response.data ?? [];
  },

  /** Violations: student disciplinary records */
  getDisciplinaryRecords: async () => {
    const response = await apiFetch('/placement/violations/disciplinary-records');
    return response.data ?? [];
  },

  /** Violations: create placement violation */
  createPlacementViolation: async (data) => {
    const response = await apiFetch('/placement/violations/placement-violations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /** Violations: create disciplinary record */
  createDisciplinaryRecord: async (data) => {
    const response = await apiFetch('/placement/violations/disciplinary-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};
