/**
 * FIERI Research Platform — Passerelle API Centrale (Gateway Client)
 * 
 * Cette passerelle gère la communication avec le serveur de production FIERI
 * (https://backend-fieri.vercel.app) pour l'authentification et les métadonnées.
 * 
 * Mode Hybride Résilient :
 * - En développement (`import.meta.env.DEV`) : En cas de déconnexion réseau, d'erreur
 *   HTTP (404/5xx) ou d'absence de serveur local, les requêtes basculent de façon invisible
 *   et silencieuse sur la base locale persistée 'mockDb.js'.
 * - En production (`import.meta.env.PROD`) : Aucun repli silencieux n'est toléré ;
 *   toutes les pannes réseau se propagent pour afficher des notifications d'erreur (Toasts) à l'utilisateur.
 */

import mockDb from './mockDb.js';

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
 * Exécuteur de requête réseau sécurisé avec basculement automatique en DEV
 * et propagation stricte en PROD.
 */
const request = async (path, options = {}, fallbackAction) => {
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
    if (import.meta.env.DEV) {
      console.warn(`[FIERI API Gateway] Échec de la requête réseau vers '${path}'. Mode de développement détecté : basculement silencieux sur mockDb.`, err);
      if (fallbackAction) {
        return await fallbackAction();
      }
    }
    // En production (ou si pas de fallback), propager l'erreur pour la capturer dans l'IHM
    throw err;
  }
};

export const api = {
  // ------------------------------------------------------------
  // MODULE AUTHENTICATION & SESSION
  // ------------------------------------------------------------
  auth: {
    register: async ({ email, password, firstName, lastName, branchId, role }) => {
      return request(
        '/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName, branchId, role })
        },
        async () => {
          await delay(300);
          // Utiliser le rôle passé par le formulaire d'inscription (ETUDIANT ou CHERCHEUR)
          const assignedRole = role || 'ETUDIANT';
          const mockMember = {
            id: Math.floor(Math.random() * 9000) + 1000,
            email,
            firstName: firstName || 'Chercheur',
            lastName:  lastName  || 'FIERI',
            role: assignedRole,
            avatarUrl: null
          };
          const fakeToken = `mock-token-${Date.now()}`;
          localStorage.setItem('fieri_auth_token', fakeToken);
          localStorage.setItem('fieri_user', JSON.stringify(mockMember));
          return {
            success: true,
            message: `Inscription réussie (Mode Hors-ligne). Bienvenue, ${assignedRole === 'ETUDIANT' ? 'Étudiant' : 'Chercheur'} !`,
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
      await delay(200);
      let list = mockDb.projects.getAll();

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
      await delay(150);
      const proj = mockDb.projects.getById(id);
      if (!proj) return { success: false, message: "Projet introuvable." };
      return { success: true, data: proj };
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
        message: `Félicitations ! Votre contribution de ${amount} € a été prise en compte avec succès pour propulser ce projet.`
      };
    }
  },

  // ------------------------------------------------------------
  // MODULE CLUBS DE RECHERCHE ET PÔLES (Mock persisté)
  // ------------------------------------------------------------
  clubs: {
    getAll: async () => {
      await delay(150);
      return { success: true, data: mockDb.clubs.getAll() };
    },

    getById: async (id) => {
      await delay(120);
      const club = mockDb.clubs.getById(id);
      if (!club) return { success: false, message: "Club R&D introuvable." };
      return { success: true, data: club };
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
      await delay(150);
      return { success: true, data: mockDb.workshops.getAll() };
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
      const user = mockDb.auth.getLocalUser();
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
      await delay(120);
      return { success: true, data: mockDb.events.getAll() };
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
      await delay(100);
      return { success: true, data: mockDb.researchers.getAll() };
    },

    getById: async (id) => {
      await delay(100);
      const res = mockDb.researchers.getById(id);
      if (!res) return { success: false, message: "Profil introuvable." };
      return { success: true, data: res };
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
      await delay(120);
      return { success: true, data: mockDb.news.getAll(includePending) };
    },
    getById: async (id) => {
      await delay(120);
      const article = mockDb.news.getById(id);
      if (article) {
        return { success: true, data: article };
      }
      return { success: false, error: "Article introuvable" };
    },
    submit: async (articleData) => {
      await delay(200);
      const newArticle = mockDb.news.add(articleData);
      return { success: true, data: newArticle };
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
      await delay(200);
      const joinedClubs = mockDb.clubs.getAll().filter(c => c.joined);
      const starredProjects = mockDb.projects.getAll().filter(p => p.starred);
      const registeredWorkshops = mockDb.workshops.getAll().filter(w => w.registered);

      return {
        success: true,
        data: {
          clubsCount: joinedClubs.length,
          projectsCount: starredProjects.length,
          workshopsCount: registeredWorkshops.length,
          joinedClubs,
          starredProjects,
          registeredWorkshops
        }
      };
    },

    getNotifications: async () => {
      await delay(80);
      return { success: true, data: mockDb.notifications.getAll() };
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
      await delay(400);
      const saved = mockDb.contactMessages.add({ name, email, subject, message });
      return {
        success: true,
        data: saved,
        message: 'Message envoyé avec succès. Notre équipe vous répondra sous 48h.'
      };
    }
  }
};

export default api;
