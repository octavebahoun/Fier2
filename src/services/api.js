import mockDb from './mockDb.js';

/** Mettre à true pour court-circuiter TOUS les appels réseau et utiliser mockDb. */
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

const BASE_URL = 'https://backend-fieri.vercel.app';

/**
 * Récupère le jeton JWT et génère les en-têtes HTTP de base.
 */
const getHeaders = () => {
  const token = localStorage.getItem('fieri_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Simulateur de latence réseau pour les actions mockées.
 */
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Exécuteur de requête réseau sécurisé.
 * Si MOCK_MODE est actif, court-circuite le réseau et appelle directement fallbackAction.
 * Sinon, effectue la requête HTTP réelle avec basculement silencieux en DEV.
 */
const request = async (path, options = {}, fallbackAction) => {
  // ── Mode Mock global : aucun appel réseau ──
  if (MOCK_MODE) {
    console.info(`[FIERI API Gateway — MOCK_MODE] ${options.method || 'GET'} ${path}`);
    if (fallbackAction) return await fallbackAction();
    throw new Error(`[MOCK_MODE] Aucun fallback défini pour ${path}`);
  }

  try {
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
  } catch (err) {
    if (import.meta.env.DEV && fallbackAction) {
      console.warn(`[FIERI API Gateway] Échec vers '${path}' → fallback mockDb.`, err);
      return await fallbackAction();
    }
    throw err;
  }
};

export const api = {
  // ------------------------------------------------------------
  // MODULE AUTHENTICATION & SESSION
  // ------------------------------------------------------------
  auth: {
    register: async ({ email, password, firstName, lastName, branchId }) => {
      return request(
        '/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName, branchId })
        },
        async () => {
          await delay(300);
          // SÉCURITÉ : le rôle n'est jamais défini par le client. Toute inscription
          // démarre en ETUDIANT ; l'élévation (CHERCHEUR / MENTOR / ADMIN) est une
          // décision serveur (validation admin, attribution de badge). On ignore donc
          // délibérément le `role` fourni dans la requête.
          const assignedRole = 'ETUDIANT';
          const mockMember = {
            id: Math.floor(Math.random() * 9000) + 1000,
            email,
            firstName: firstName || 'Étudiant',
            lastName: lastName || 'FIERI',
            role: assignedRole,
            avatarUrl: null
          };
          const fakeToken = `mock-token-${Date.now()}`;
          localStorage.setItem('fieri_auth_token', fakeToken);
          localStorage.setItem('fieri_user', JSON.stringify(mockMember));
          return {
            success: true,
            message: `Inscription réussie (Mode Hors-ligne). Bienvenue !`,
            data: {
              access_token: fakeToken,
              member: mockMember
            }
          };
        }
      );
    },

    login: async (email, password) => {
      return request(
        '/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        },
        async () => {
          await delay(200);

          // ── Détection du rôle par email en mode fallback (DEV uniquement) ──
          // Pour tester un profil admin     : admin@fieri.dev
          // Pour tester un profil étudiant  : etudiant@fieri.dev (ou *@etudiant.*)
          // Pour tester un profil chercheur : tout autre email
          const e = (email || '').toLowerCase();
          let detectedRole = 'CHERCHEUR';
          if (e.startsWith('admin') || e.includes('@admin.')) {
            detectedRole = 'ADMIN';
          } else if (e.startsWith('etudiant') || e.includes('etudiant@') || e.includes('@student.') || e.includes('.etudiant@')) {
            detectedRole = 'ETUDIANT';
          }

          const mockMember = {
            id: 101,
            email: email || 'chercheur@fieri.dev',
            firstName: email ? email.split('@')[0] : 'Chercheur',
            lastName: 'FIERI',
            role: detectedRole,
            avatarUrl: null
          };
          const fakeToken = `mock-token-${Date.now()}`;
          localStorage.setItem('fieri_auth_token', fakeToken);
          localStorage.setItem('fieri_user', JSON.stringify(mockMember));
          return {
            success: true,
            message: `Connexion réussie (Mode Hors-ligne). Profil : ${detectedRole}`,
            data: {
              access_token: fakeToken,
              member: mockMember
            }
          };
        }
      );
    },

    getProfile: async () => {
      const token = localStorage.getItem('fieri_auth_token');
      if (token && token.startsWith('mock-token')) {
        const user = localStorage.getItem('fieri_user');
        return { success: true, data: user ? JSON.parse(user) : null };
      }

      return request(
        '/members/me',
        { method: 'GET' },
        async () => {
          const user = localStorage.getItem('fieri_user');
          if (user) {
            return { success: true, data: JSON.parse(user) };
          }
          return { success: false, message: "Session expirée ou invalide." };
        }
      );
    },

    logout: () => {
      localStorage.removeItem('fieri_auth_token');
      localStorage.removeItem('fieri_user');
      return { success: true, message: "Déconnexion réussie" };
    },

    isAuthenticated: () => {
      return !!localStorage.getItem('fieri_auth_token');
    },

    getLocalUser: () => {
      const u = localStorage.getItem('fieri_user');
      return u ? JSON.parse(u) : null;
    }
  },

  // ------------------------------------------------------------
  // MODULE ORGANISATIONS ET MÉTADONNÉES
  // ------------------------------------------------------------
  org: {
    getCountries: async () => {
      return request(
        '/countries',
        { method: 'GET' },
        async () => {
          return {
            success: true,
            data: [
              { id: 1, name: "Bénin" },
              { id: 2, name: "Togo" }
            ]
          };
        }
      );
    },

    getCountryById: async (id) => {
      return request(
        `/countries/${id}`,
        { method: 'GET' },
        async () => {
          const countries = [
            { id: 1, name: "Bénin" },
            { id: 2, name: "Togo" }
          ];
          const c = countries.find(item => item.id === Number(id));
          return c ? { success: true, data: c } : { success: false, message: "Pays introuvable." };
        }
      );
    },

    getUniversities: async (countryId) => {
      return request(
        `/countries/${countryId}/universities`,
        { method: 'GET' },
        async () => {
          const list = [
            { id: 1, name: "Université d'Abomey-Calavi (UAC)", countryId: 1 },
            { id: 2, name: "Université de Parakou (UP)", countryId: 1 },
            { id: 3, name: "Université de Lomé (UL)", countryId: 2 }
          ];
          return {
            success: true,
            data: list.filter(u => u.countryId === Number(countryId))
          };
        }
      );
    },

    getBranches: async (universityId) => {
      return request(
        `/universities/${universityId}/branches`,
        { method: 'GET' },
        async () => {
          const list = [
            { id: 1, name: "Génie Logiciel & IA", universityId: 1 },
            { id: 2, name: "Systèmes Embarqués & IoT", universityId: 1 },
            { id: 3, name: "Génie Civil & BIM", universityId: 1 },
            { id: 4, name: "Énergies Renouvelables", universityId: 1 },
            { id: 5, name: "Réseaux & Télécoms", universityId: 2 },
            { id: 6, name: "Sécurité Informatique", universityId: 3 }
          ];
          return {
            success: true,
            data: list.filter(b => b.universityId === Number(universityId))
          };
        }
      );
    }
  },

  // ------------------------------------------------------------
  // MODULE PROJETS DE RECHERCHE R&D (Mock persisté)
  // ------------------------------------------------------------
  projects: {
    getAll: async (filters = {}) => {
      const raw = await request(
        '/projects',
        { method: 'GET' },
        async () => { await delay(200); return { success: true, data: mockDb.projects.getAll() }; }
      );
      let list = (raw?.data ?? raw) || [];

      if (filters.clubId) {
        list = list.filter(p => p.clubId === filters.clubId);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.technologies.some(t => t.toLowerCase().includes(q))
        );
      }

      if (filters.status) {
        list = list.filter(p => p.status === filters.status);
      }

      return { success: true, data: list };
    },

    getById: async (id) => {
      return request(
        `/projects/${id}`,
        { method: 'GET' },
        async () => {
          await delay(150);
          const proj = mockDb.projects.getById(id);
          if (!proj) return { success: false, message: 'Projet introuvable.' };
          return { success: true, data: proj };
        }
      );
    },

    toggleStar: async (id) => {
      await delay(150);
      const proj = mockDb.projects.getById(id);
      if (!proj) return { success: false, message: "Projet introuvable." };
      proj.starred = !proj.starred;
      proj.stars += proj.starred ? 1 : -1;
      mockDb.projects.update(proj);
      return {
        success: true,
        data: proj,
        message: proj.starred ? "Projet ajouté aux favoris R&D" : "Projet retiré des favoris"
      };
    },

    support: async (id, amount, message = "") => {
      await delay(300);
      const proj = mockDb.projects.getById(id);
      if (!proj) return { success: false, message: "Projet introuvable." };
      proj.budgetRaised += Number(amount);
      proj.supportersCount += 1;
      mockDb.projects.update(proj);
      return {
        success: true,
        data: proj,
        message: `Félicitations ! Votre contribution de ${amount} $ a été prise en compte avec succès pour propulser ce projet.`
      };
    },

    isFollowed: async (id) => {
      await delay(100);
      return { success: true, data: mockDb.projects.isFollowed(id) };
    },

    toggleFollow: async (id) => {
      await delay(150);
      const state = mockDb.projects.toggleFollow(id);
      return { success: true, data: state, message: state ? "Projet suivi avec succès !" : "Abonnement au projet retiré." };
    }
  },

  // ------------------------------------------------------------
  // MODULE CLUBS DE RECHERCHE ET PÔLES (Mock persisté)
  // ------------------------------------------------------------
  clubs: {
    getAll: async () => {
      // userId needed for the mock fallback only; read from localStorage (safe in all contexts)
      const getUserId = () => {
        try { const u = JSON.parse(localStorage.getItem('fieri_user')); return u?.id || null; } catch { return null; }
      };
      return request(
        '/clubs',
        { method: 'GET' },
        async () => { await delay(150); return { success: true, data: mockDb.clubs.getAll(getUserId()) }; }
      );
    },

    getById: async (id) => {
      return request(
        `/clubs/${id}`,
        { method: 'GET' },
        async () => {
          await delay(120);
          const club = mockDb.clubs.getById(id);
          if (!club) return { success: false, message: 'Club R&D introuvable.' };
          return { success: true, data: club };
        }
      );
    },

    join: async (id) => {
      await delay(200);
      const club = mockDb.clubs.getById(id);
      if (!club) return { success: false, message: "Club introuvable." };
      if (club.joined) return { success: true, message: "Vous faites déjà partie de ce pôle." };

      club.joined = true;
      club.membersCount += 1;
      mockDb.clubs.update(club);

      // Ajouter une notification au tableau de bord
      mockDb.notifications.add(`Félicitations, vous avez rejoint le pôle '${club.kicker}' !`);

      return {
        success: true,
        data: club,
        message: `Adhésion validée. Bienvenue au sein de la Cité '${club.kicker}' !`
      };
    },

    leave: async (id) => {
      await delay(150);
      const club = mockDb.clubs.getById(id);
      if (!club) return { success: false, message: "Club introuvable." };
      if (!club.joined) return { success: true };

      club.joined = false;
      club.membersCount -= 1;
      mockDb.clubs.update(club);

      return {
        success: true,
        data: club,
        message: `Vous avez quitté le pôle '${club.kicker}' avec succès.`
      };
    }
  },

  // ------------------------------------------------------------
  // MODULE ACADÉMIE & FORMATIONS (Mock persisté)
  // ------------------------------------------------------------
  workshops: {
    getAll: async () => {
      return request(
        '/workshops',
        { method: 'GET' },
        async () => { await delay(150); return { success: true, data: mockDb.workshops.getAll() }; }
      );
    },

    toggleRegister: async (id, userFullName) => {
      await delay(200);
      const res = mockDb.workshops.toggleRegister(id, userFullName);
      if (!res || !res.success) {
        return { success: false, message: "Impossible de modifier votre inscription." };
      }

      let message = "";
      if (res.action === 'registered') {
        message = `Inscription validée pour l'atelier '${res.workshop.title}'.`;
      } else if (res.action === 'waitlisted') {
        message = `Placé sur la file d'attente (Position #${res.position}) pour l'atelier '${res.workshop.title}'.`;
      } else if (res.action === 'deregistered') {
        message = `Vous êtes désinscrit de l'atelier '${res.workshop.title}'.`;
        if (res.promotedUser) {
          message += ` La place libérée a été réattribuée automatiquement à ${res.promotedUser} (premier de la file d'attente).`;
        }
      } else if (res.action === 'removed_from_waitlist') {
        message = `Vous avez quitté la file d'attente de l'atelier '${res.workshop.title}'.`;
      }

      return {
        success: true,
        data: res.workshop,
        action: res.action,
        promotedUser: res.promotedUser,
        position: res.position,
        message
      };
    },

    register: async (id) => {
      // Version de secours compatible
      await delay(180);
      const user = (() => { try { return JSON.parse(localStorage.getItem('fieri_user')); } catch { return null; } })();
      const userFullName = user ? `${user.firstName} ${user.lastName}` : "Étudiant FIERI";

      const res = mockDb.workshops.toggleRegister(id, userFullName);
      if (!res || !res.success) {
        return { success: false, message: "Impossible de procéder à l'inscription." };
      }

      if (res.action === 'deregistered') {
        // Si la fonction s'est désinscrite accidentellement (on re-clique), on rétablit l'état inscrit
        mockDb.workshops.toggleRegister(id, userFullName);
      }

      return {
        success: true,
        data: res.workshop,
        message: res.action === 'waitlisted'
          ? `Placé sur la file d'attente (Position #${res.position}) pour '${res.workshop.title}'.`
          : `Inscription réussie au '${res.workshop.title}'.`
      };
    }
  },

  // ------------------------------------------------------------
  // MODULE ÉVÉNEMENTS & CONCOURS (Mock persisté)
  // ------------------------------------------------------------
  events: {
    getAll: async () => {
      return request(
        '/events',
        { method: 'GET' },
        async () => { await delay(120); return { success: true, data: mockDb.events.getAll() }; }
      );
    },

    register: async (id) => {
      await delay(150);
      const ev = mockDb.events.getById(id);
      if (!ev) return { success: false, message: "Événement introuvable." };
      if (ev.registered) return { success: true, message: "Vous êtes déjà enregistré pour cet événement." };

      ev.registered = true;
      ev.participantsCount += 1;
      mockDb.events.update(ev);

      return {
        success: true,
        data: ev,
        message: `Enregistrement validé ! Votre passe d'accès pour '${ev.title}' est actif.`
      };
    }
  },

  // ------------------------------------------------------------
  // MODULE ANNUAIRE DES CHERCHEURS (Mock persisté)
  // ------------------------------------------------------------
  researchers: {
    getMe: async () => {
      return request(
        '/researchers/me',
        { method: 'GET' },
        async () => {
          await delay(120);
          const me = mockDb.researchers.getMe();
          if (!me) return { success: false, message: 'Session invalide.' };
          return { success: true, data: me };
        }
      );
    },

    updateMe: async (payload) => {
      return request(
        '/researchers/me',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        },
        async () => {
          await delay(180);
          const updated = mockDb.researchers.updateMe(payload);
          if (!updated) return { success: false, message: 'Impossible de mettre à jour le profil.' };
          return { success: true, data: updated, message: 'Profil mis à jour.' };
        }
      );
    },

    getAll: async () => {
      return request(
        '/researchers',
        { method: 'GET' },
        async () => { await delay(100); return { success: true, data: mockDb.researchers.getAll() }; }
      );
    },

    getById: async (id) => {
      return request(
        `/researchers/${id}`,
        { method: 'GET' },
        async () => {
          await delay(100);
          const res = mockDb.researchers.getById(id);
          if (!res) return { success: false, message: 'Profil introuvable.' };
          return { success: true, data: res };
        }
      );
    },

    toggleFollow: async (researcherId, userId) => {
      await delay(150);
      const res = mockDb.researchers.toggleFollow(researcherId, userId);
      if (!res) return { success: false, message: "Profil introuvable." };
      return { success: true, data: res };
    }
  },

  // ------------------------------------------------------------
  // MODULE ACTUALITÉS & JOURNAL (Mock persisté)
  // ------------------------------------------------------------
  news: {
    getAll: async (includePending = false) => {
      return request(
        `/news${includePending ? '?includePending=true' : ''}`,
        { method: 'GET' },
        async () => { await delay(120); return { success: true, data: mockDb.news.getAll(includePending) }; }
      );
    },
    getById: async (id) => {
      return request(
        `/news/${id}`,
        { method: 'GET' },
        async () => {
          await delay(120);
          const article = mockDb.news.getById(id);
          if (article) return { success: true, data: article };
          return { success: false, error: 'Article introuvable' };
        }
      );
    },
    submit: async (articleData) => {
      return request(
        '/news',
        { method: 'POST', body: JSON.stringify(articleData) },
        async () => { await delay(200); const a = mockDb.news.add(articleData); return { success: true, data: a }; }
      );
    },
    approve: async (id) => {
      await delay(200);
      const approved = mockDb.news.approve(id);
      if (approved) {
        return { success: true, data: approved };
      }
      return { success: false, error: "Impossible d'approuver l'article" };
    },
    reject: async (id) => {
      await delay(200);
      const success = mockDb.news.delete(id);
      return { success: true, data: success };
    }
  },

  // ------------------------------------------------------------
  // MODULE TABLEAU DE BORD & STATS (Mock persisté)
  // ------------------------------------------------------------
  dashboard: {
    getStats: async () => {
      return request(
        '/dashboard/me',
        { method: 'GET' },
        async () => {
          await delay(200);
          const joinedClubs = mockDb.clubs.getAll().filter(c => c.joined);
          const starredProjects = mockDb.projects.getAll().filter(p => p.starred);
          const registeredWorkshops = mockDb.workshops.getAll().filter(w => w.registered);
          return { success: true, data: { clubsCount: joinedClubs.length, projectsCount: starredProjects.length, workshopsCount: registeredWorkshops.length, joinedClubs, starredProjects, registeredWorkshops } };
        }
      );
    },

    getNotifications: async () => {
      return request(
        '/notifications',
        { method: 'GET' },
        async () => { await delay(80); return { success: true, data: mockDb.notifications.getAll() }; }
      );
    },

    markNotificationAsRead: async (id) => {
      mockDb.notifications.markAsRead(id);
      return { success: true };
    }
  },

  // ------------------------------------------------------------
  // MODULE CONTACT & SUPPORT (Persisté localement)
  // ------------------------------------------------------------
  contact: {
    sendMessage: async ({ name, email, subject, message }) => {
      return request(
        '/contact',
        { method: 'POST', body: JSON.stringify({ name, email, subject, message }) },
        async () => {
          await delay(400);
          const saved = mockDb.contactMessages.add({ name, email, subject, message });
          return { success: true, data: saved, message: 'Message envoyé avec succès. Notre équipe vous répondra sous 48h.' };
        }
      );
    }
  },

  // ------------------------------------------------------------
  // MODULE TÂCHES PROJET (Chef de projet) — Mock persisté
  // ------------------------------------------------------------
  tasks: {
    getByProject: async (projectId) => {
      await delay(120);
      return { success: true, data: mockDb.tasks.getByProject(projectId) };
    },

    create: async (taskData) => {
      await delay(200);
      const task = mockDb.tasks.create(taskData);
      return { success: true, data: task, message: 'Tâche créée avec succès.' };
    },

    update: async (taskId, patch) => {
      await delay(150);
      const updated = mockDb.tasks.update({ id: taskId, ...patch });
      if (!updated) return { success: false, message: 'Tâche introuvable.' };
      return { success: true, data: updated, message: 'Tâche mise à jour.' };
    },

    assign: async (taskId, assignedTo) => {
      await delay(150);
      const updated = mockDb.tasks.assign(taskId, assignedTo);
      if (!updated) return { success: false, message: 'Tâche introuvable.' };
      return { success: true, data: updated, message: `Tâche assignée à ${assignedTo}.` };
    },

    setPriority: async (taskId, priority) => {
      await delay(100);
      const updated = mockDb.tasks.setPriority(taskId, priority);
      if (!updated) return { success: false, message: 'Tâche introuvable.' };
      return { success: true, data: updated, message: `Priorité définie à ${priority}.` };
    },

    delete: async (taskId) => {
      await delay(120);
      mockDb.tasks.delete(taskId);
      return { success: true, message: 'Tâche supprimée.' };
    }
  },

  // ------------------------------------------------------------
  // MODULE BADGES (Admin / Responsable de club)
  // ------------------------------------------------------------
  badges: {
    getByUser: async (userId) => {
      await delay(80);
      return { success: true, data: mockDb.badges.getByUser(userId) };
    },

    award: async (userId, userName, badgeType, awardedBy) => {
      await delay(200);
      const res = mockDb.badges.award(userId, userName, badgeType, awardedBy);
      return res;
    },

    revoke: async (badgeId) => {
      await delay(150);
      mockDb.badges.revoke(badgeId);
      return { success: true, message: 'Badge retiré.' };
    },

    getTypes: () => mockDb.badges.TYPES
  },

  // ------------------------------------------------------------
  // MODULE ADHÉSIONS CLUBS avec VALIDATION (Responsable de club)
  // ------------------------------------------------------------
  memberships: {
    /**
     * Soumet une DEMANDE d'adhésion — ne rejoint pas directement le club.
     * Le Responsable de club devra approuver ou rejeter.
     */
    requestJoin: async (clubId, user) => {
      await delay(200);
      const res = mockDb.joinRequests.create(
        clubId,
        user.id,
        `${user.firstName} ${user.lastName}`,
        user.email
      );
      if (!res.success) return res;
      return {
        success: true,
        data: res.data,
        message: 'Demande d\'adhésion soumise. En attente de validation par le Responsable du club.'
      };
    },

    getPendingRequests: async (clubId) => {
      await delay(150);
      return { success: true, data: mockDb.joinRequests.getPending(clubId) };
    },

    getAllRequests: async (clubId) => {
      await delay(150);
      return { success: true, data: mockDb.joinRequests.getByClub(clubId) };
    },

    getUserRequests: async (userId) => {
      await delay(100);
      return { success: true, data: mockDb.joinRequests.getByUser(userId) };
    },

    approve: async (requestId) => {
      await delay(200);
      const res = mockDb.joinRequests.approve(requestId);
      return res;
    },

    reject: async (requestId, reason = '') => {
      await delay(200);
      const res = mockDb.joinRequests.reject(requestId, reason);
      return res;
    },

    /** Quitter un club (toujours direct, pas de validation) */
    leave: async (clubId, userId) => {
      await delay(150);
      const club = mockDb.clubs.getById(clubId);
      if (!club) return { success: false, message: 'Club introuvable.' };
      const result = mockDb.clubs.toggleJoin(clubId, userId);
      if (result && result.joined === false) {
        return { success: true, data: result, message: `Vous avez quitté le club '${club.kicker}'.` };
      }
      return { success: false, message: 'Vous n\'étiez pas membre de ce club.' };
    }
  },

  // ------------------------------------------------------------
  // MODULE OPPORTUNITÉS DE RECHERCHE (Chercheur / Membre)
  // ------------------------------------------------------------
  opportunities: {
    getAll: async () => {
      return request(
        '/opportunities',
        { method: 'GET' },
        async () => {
          await delay(150);
          return { success: true, data: mockDb.opportunities.getAll() };
        }
      );
    },

    getById: async (id) => {
      return request(
        `/opportunities/${id}`,
        { method: 'GET' },
        async () => {
          await delay(120);
          const opt = mockDb.opportunities.getById(id);
          if (!opt) return { success: false, message: "Opportunité introuvable." };
          return { success: true, data: opt };
        }
      );
    },

    create: async (optData) => {
      return request(
        '/opportunities',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(optData)
        },
        async () => {
          await delay(200);
          const opt = mockDb.opportunities.add(optData);
          return { success: true, data: opt, message: 'Nouvelle opportunité publiée avec succès !' };
        }
      );
    },

    update: async (id, updatedData) => {
      return request(
        `/opportunities/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        },
        async () => {
          await delay(150);
          const opt = mockDb.opportunities.update({ id, ...updatedData });
          if (!opt) return { success: false, message: 'Opportunité introuvable.' };
          return { success: true, data: opt, message: 'Opportunité mise à jour.' };
        }
      );
    },

    delete: async (id) => {
      return request(
        `/opportunities/${id}`,
        { method: 'DELETE' },
        async () => {
          await delay(120);
          mockDb.opportunities.delete(id);
          return { success: true, message: 'Opportunité supprimée.' };
        }
      );
    }
  },

  // ------------------------------------------------------------
  // MODULE CANDIDATURES AUX OPPORTUNITÉS (Membre)
  // ------------------------------------------------------------
  applications: {
    submit: async ({ opportunityId, coverLetter, cvUrl }) => {
      const raw = localStorage.getItem('fieri_user');
      const user = raw ? JSON.parse(raw) : null;
      if (!user) return { success: false, message: 'Vous devez être connecté pour candidater.' };
      return request(
        '/applications',
        { method: 'POST', body: JSON.stringify({ opportunityId, coverLetter, cvUrl }) },
        async () => {
          await delay(400);
          return mockDb.projectApplications.submit({ opportunityId, userId: user.id, userName: `${user.firstName} ${user.lastName}`, userEmail: user.email, coverLetter, cvUrl });
        }
      );
    },

    getMyApplications: async () => {
      return request(
        '/applications/me',
        { method: 'GET' },
        async () => {
          await delay(150);
          const raw = localStorage.getItem('fieri_user');
          const user = raw ? JSON.parse(raw) : null;
          if (!user) return { success: false, data: [] };
          return { success: true, data: mockDb.projectApplications.getByUser(user.id) };
        }
      );
    },

    hasApplied: async (opportunityId) => {
      await delay(80);
      const raw = localStorage.getItem('fieri_user');
      const user = raw ? JSON.parse(raw) : null;
      if (!user) return { success: true, data: false };
      return { success: true, data: mockDb.projectApplications.hasApplied(opportunityId, user.id) };
    },

    getByOpportunity: async (opportunityId) => {
      await delay(150);
      return { success: true, data: mockDb.projectApplications.getByOpportunity(opportunityId) };
    },

    updateStatus: async (applicationId, status) => {
      await delay(200);
      const updated = mockDb.projectApplications.updateStatus(applicationId, status);
      if (!updated) return { success: false, message: 'Candidature introuvable.' };
      return { success: true, data: updated, message: `Statut mis à jour : ${status}.` };
    }
  }
};

export default api;

