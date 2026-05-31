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
          const mockMember = {
            id: Math.floor(Math.random() * 1000) + 1,
            email,
            firstName: firstName || "Chercheur",
            lastName: lastName || "FIERI",
            role: 'CHERCHEUR',
            avatarUrl: null
          };
          const fakeToken = `mock-token-${Date.now()}`;
          localStorage.setItem('fieri_auth_token', fakeToken);
          localStorage.setItem('fieri_user', JSON.stringify(mockMember));
          return {
            success: true,
            message: "Inscription réussie (Mode Hors-ligne / Fallback). Bienvenue au sein de la communauté !",
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
          const mockMember = {
            id: 101,
            email: email || "chercheur@fieri.dev",
            firstName: email ? email.split('@')[0] : "Chercheur",
            lastName: "FIERI",
            role: 'CHERCHEUR',
            avatarUrl: null
          };
          const fakeToken = `mock-token-${Date.now()}`;
          localStorage.setItem('fieri_auth_token', fakeToken);
          localStorage.setItem('fieri_user', JSON.stringify(mockMember));
          return {
            success: true,
            message: "Connexion réussie (Mode Hors-ligne / Fallback). Bienvenue !",
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

    register: async (id) => {
      await delay(180);
      const work = mockDb.workshops.getById(id);
      if (!work) return { success: false, message: "Atelier introuvable." };
      if (work.registered) return { success: true, message: "Vous êtes déjà inscrit à cette session." };
      if (work.placesLeft <= 0) return { success: false, message: "Désolé, toutes les places ont déjà été réservées." };

      work.registered = true;
      work.placesLeft -= 1;
      mockDb.workshops.update(work);

      return {
        success: true,
        data: work,
        message: `Inscription réussie au '${work.title}'. Un email de confirmation contenant les détails vous a été envoyé.`
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
    getAll: async () => {
      await delay(100);
      return { success: true, data: mockDb.researchers.getAll() };
    },

    getById: async (id) => {
      await delay(100);
      const res = mockDb.researchers.getById(id);
      if (!res) return { success: false, message: "Profil introuvable." };
      return { success: true, data: res };
    }
  },

  // ------------------------------------------------------------
  // MODULE ACTUALITÉS & JOURNAL (Mock persisté)
  // ------------------------------------------------------------
  news: {
    getAll: async () => {
      await delay(120);
      return { success: true, data: mockDb.news.getAll() };
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
  }
};

export default api;
