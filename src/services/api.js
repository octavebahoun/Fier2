// ─────────────────────────────────────────────────────────────────────────────
// FIERI Research — Client API REST
// Câblé sur les endpoints de production documentés dans docs/fieri_backend_api.md.
// Plus aucun mock ici : le gateway parle exclusivement au backend réel et propage
// toute erreur (réseau ou HTTP) telle quelle.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://backend-fieri.vercel.app';

/** En-têtes HTTP de base + jeton JWT si présent. */
const getHeaders = () => {
  const token = localStorage.getItem('fieri_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/** Exécuteur bas-niveau. Toute réponse non-2xx lève une erreur. */
const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Helpers de verbes HTTP — gardent les méthodes ci-dessous concises et lisibles.
const get = (path) => request(path, { method: 'GET' });
const post = (path, body) => request(path, { method: 'POST', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
const put = (path, body) => request(path, { method: 'PUT', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
const patch = (path, body) => request(path, { method: 'PATCH', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
const del = (path) => request(path, { method: 'DELETE' });

/** Construit une query-string à partir des paramètres définis (ignore null/''/undefined). */
const qs = (params) => {
  const entries = Object.entries(params || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};

export const api = {
  // ── 1. AUTHENTIFICATION & SESSION ──────────────────────────────────────────
  auth: {
    // Le rôle n'est volontairement PAS transmis : l'attribution est une décision
    // serveur (voir docs). Toute inscription démarre en ETUDIANT côté backend.
    register: ({ email, password, firstName, lastName, branchId }) =>
      post('/auth/register', { email, password, firstName, lastName, branchId }),

    login: (email, password) => post('/auth/login', { email, password }),

    getProfile: () => get('/members/me'),

    logout: () => {
      localStorage.removeItem('fieri_auth_token');
      localStorage.removeItem('fieri_user');
      return { success: true, message: 'Déconnexion réussie' };
    },

    isAuthenticated: () => !!localStorage.getItem('fieri_auth_token'),

    getLocalUser: () => {
      const u = localStorage.getItem('fieri_user');
      return u ? JSON.parse(u) : null;
    }
  },

  // ── 2. STRUCTURE INSTITUTIONNELLE & MÉTADONNÉES ────────────────────────────
  org: {
    getCountries: () => get('/countries'),
    getCountryById: (id) => get(`/countries/${id}`),
    getUniversities: (countryId) => get(`/countries/${countryId}/universities`),
    getBranches: (universityId) => get(`/universities/${universityId}/branches`)
  },

  // ── 3. PROJETS DE RECHERCHE R&D ────────────────────────────────────────────
  projects: {
    getAll: (filters = {}) =>
      get(`/projects${qs({ clubId: filters.clubId, status: filters.status, search: filters.search })}`),

    getById: (id) => get(`/projects/${id}`),

    // POST /projects/:id/follow — bascule favori. Renvoie { starred }.
    toggleFollow: async (id) => {
      const r = await post(`/projects/${id}/follow`);
      return { success: r.success, data: r.starred, message: r.message };
    },

    // Pas d'endpoint dédié : on dérive l'état de suivi du projet lui-même.
    isFollowed: async (id) => {
      const r = await get(`/projects/${id}`);
      return { success: r.success, data: !!r.data?.starred };
    },

    // POST /projects/:id/support — contribution financière. Renvoie { newBudget }.
    support: (id, amount, message = '') =>
      post(`/projects/${id}/support`, { amount, message })
  },

  // ── 4. CLUBS & PÔLES DE RECHERCHE ──────────────────────────────────────────
  clubs: {
    getAll: () => get('/clubs'),
    getById: (id) => get(`/clubs/${id}`),
    join: (id) => post(`/clubs/${id}/join`),
    leave: (id) => del(`/clubs/${id}/join`)
  },

  // ── 5. ATELIERS & ACADÉMIE ─────────────────────────────────────────────────
  workshops: {
    getAll: () => get('/workshops'),

    // POST /workshops/:id/register (body userFullName) → { action, position, ... }
    register: (id, userFullName) => post(`/workshops/${id}/register`, { userFullName }),

    // DELETE /workshops/:id/register
    deregister: (id) => del(`/workshops/${id}/register`),

    // Dispatcher pratique : l'appelant fournit l'état courant d'inscription.
    toggleRegister: (id, userFullName, isRegistered) =>
      isRegistered ? del(`/workshops/${id}/register`) : post(`/workshops/${id}/register`, { userFullName })
  },

  // ── 6. ÉVÉNEMENTS & LIVE STREAMS ───────────────────────────────────────────
  events: {
    getAll: () => get('/events'),
    register: (id) => post(`/events/${id}/register`)
  },

  // ── 7. ANNUAIRE DES CHERCHEURS ─────────────────────────────────────────────
  researchers: {
    getMe: () => get('/researchers/me'),
    updateMe: (payload) => put('/researchers/me', payload),
    getAll: () => get('/researchers'),
    getById: (id) => get(`/researchers/${id}`),

    // POST /researchers/:id/follow — le second argument (userId) est ignoré :
    // l'utilisateur est identifié par le JWT. Conservé pour compat des appelants.
    toggleFollow: async (researcherId) => {
      const r = await post(`/researchers/${researcherId}/follow`);
      return { success: r.success, data: r.following, following: r.following, message: r.message };
    }
  },

  // ── 8. ACTUALITÉS & JOURNAL SCIENTIFIQUE ───────────────────────────────────
  news: {
    getAll: (includePending = false) =>
      get(`/news${qs({ includePending: includePending ? 'true' : undefined })}`),
    getById: (id) => get(`/news/${id}`),
    submit: (articleData) => post('/news', articleData),
    approve: (id) => patch(`/news/${id}/approve`),
    reject: (id) => del(`/news/${id}`)
  },

  // ── 9. TABLEAU DE BORD & NOTIFICATIONS ─────────────────────────────────────
  dashboard: {
    getStats: () => get('/dashboard/me'),
    getNotifications: () => get('/notifications'),
    markNotificationAsRead: (id) => put(`/notifications/${id}/read`)
  },

  // ── 10. FORMULAIRE DE CONTACT ──────────────────────────────────────────────
  contact: {
    sendMessage: ({ name, email, subject, message }) =>
      post('/contact', { name, email, subject, message })
  },

  // ── 11. TÂCHES KANBAN ──────────────────────────────────────────────────────
  tasks: {
    getByProject: (projectId) => get(`/tasks/project/${projectId}`),
    create: (taskData) => post('/tasks', taskData),
    update: (taskId, patchData) => put(`/tasks/${taskId}`, patchData),
    assign: (taskId, assignedTo) => patch(`/tasks/${taskId}/assign`, { assignedTo }),
    setPriority: (taskId, priority) => patch(`/tasks/${taskId}/priority`, { priority }),
    delete: (taskId) => del(`/tasks/${taskId}`)
  },

  // ── 12. BADGES D'HONNEUR ───────────────────────────────────────────────────
  badges: {
    getByUser: (userId) => get(`/badges/user/${userId}`),
    award: (userId, userName, badgeType, awardedBy) =>
      post('/badges/award', { userId, userName, badgeType, awardedBy }),
    revoke: (badgeId) => del(`/badges/${badgeId}`)
  },

  // ── 13. ADHÉSIONS DE CLUBS AVEC VALIDATION ─────────────────────────────────
  memberships: {
    requestJoin: (clubId, user) => post('/memberships/requests', { clubId, user }),
    getPendingRequests: (clubId) => get(`/memberships/requests/pending/${clubId}`),
    getAllRequests: (clubId) => get(`/memberships/requests/club/${clubId}`),
    getUserRequests: (userId) => get(`/memberships/requests/user/${userId}`),
    approve: (requestId) => patch(`/memberships/requests/${requestId}/approve`),
    reject: (requestId, reason = '') => patch(`/memberships/requests/${requestId}/reject`, { reason }),
    leave: (clubId, userId) => del(`/memberships/${clubId}/user/${userId}`)
  },

  // ── OPPORTUNITÉS ───────────────────────────────────────────────────────────
  // ⚠️ NON documenté dans la spec backend (seul /applications l'est). Ces routes
  // sont supposées exister côté serveur ; à défaut elles renverront 404 tant que
  // le backend ne les expose pas. À confirmer / documenter.
  opportunities: {
    getAll: () => get('/opportunities'),
    getById: (id) => get(`/opportunities/${id}`),
    create: (optData) => post('/opportunities', optData),
    update: (id, updatedData) => put(`/opportunities/${id}`, updatedData),
    delete: (id) => del(`/opportunities/${id}`)
  },

  // ── 14. CANDIDATURES AUX OPPORTUNITÉS ──────────────────────────────────────
  applications: {
    submit: ({ opportunityId, coverLetter, cvUrl }) =>
      post('/applications', { opportunityId, coverLetter, cvUrl }),
    getMyApplications: () => get('/applications/me'),
    hasApplied: (opportunityId) => get(`/applications/check/${opportunityId}`),
    getByOpportunity: (opportunityId) => get(`/applications/opportunity/${opportunityId}`),
    updateStatus: (applicationId, status) => patch(`/applications/${applicationId}/status`, { status })
  }
};

export default api;
