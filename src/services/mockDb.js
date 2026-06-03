/**
 * FIERI Research Platform — Base de données locale simulée (Mock DB) persistante
 * 
 * Ce module gère la persistance locale dans le localStorage (avec le préfixe fieri_)
 * et s'auto-initialise en fusionnant les données statiques d'origine de l'API
 * avec les traductions et configurations enrichies issues de 'ancien_contenu.json'.
 */

import initialContent from '../../ancien_contenu.json';
import roverImg from '../assets/project_slam_rover.png';
import smartFarmingImg from '../assets/project_smart_farming.png';
import solarMicrogridImg from '../assets/project_solar_microgrid.png';
import plantDiseaseImg from '../assets/project_plant_disease_ai.png';

// Clés d'accès au stockage local avec préfixe fieri_
const KEYS = {
  CLUBS: 'fieri_db_clubs',
  PROJECTS: 'fieri_db_projects',
  WORKSHOPS: 'fieri_db_workshops',
  EVENTS: 'fieri_db_events',
  RESEARCHERS: 'fieri_db_researchers',
  NEWS: 'fieri_db_news',
  NOTIFICATIONS: 'fieri_db_notifications',
  OPPORTUNITIES: 'fieri_db_opportunities',
  CONTACT_MESSAGES: 'fieri_contact_messages'
};

// --- DONNÉES STATIQUES PAR DÉFAUT (FALLBACK DE SEEDING) ---

const DEFAULT_CLUBS = [
  {
    id: 'club-1',
    kicker: "Robotique et Automatisation",
    title: "Concevoir des systèmes physiques intelligents autonomes",
    divisions: ["Mécanique de précision", "IT (ROS / IA)", "Électronique de puissance"],
    desc: "De la robotique mobile industrielle aux manipulateurs autonomes, nos chercheurs collaborent pour concevoir les systèmes d'automatisation de demain.",
    projetPhare: "Rover d'exploration intelligent doté d'une navigation SLAM.",
    accent: "#e05a2b",
    membersCount: 142,
    joined: false
  },
  {
    id: 'club-2',
    kicker: "Informatique Industrielle et IoT",
    title: "Connecter le monde physique et le numérique à grande échelle",
    divisions: ["Systèmes embarqués", "Sécurité des réseaux IoT", "Traitement du signal"],
    desc: "Concevoir des architectures cyber-physiques robustes capables de remonter des données précises, de les traiter localement (Edge) et de sécuriser la transmission.",
    projetPhare: "Smart farming avec drones et capteurs connectés multicouches.",
    accent: "#1b6fd8",
    membersCount: 98,
    joined: false
  },
  {
    id: 'club-3',
    kicker: "Eco-énergie et Climatisation",
    title: "Développer des solutions de transition énergétique durables",
    divisions: ["Smart grids", "Énergies renouvelables", "Efficacité thermique"],
    desc: "Maîtriser les technologies de production, de stockage et de distribution d'énergie pour concevoir des réseaux autonomes durables.",
    projetPhare: "Micro-réseau solaire intelligent pour communautés rurales isolées.",
    accent: "#10b981",
    membersCount: 84,
    joined: false
  },
  {
    id: 'club-4',
    kicker: "Construction 4.0",
    title: "Réinventer le BTP de demain grâce à la technologie numérique",
    divisions: ["BIM avancé", "Impression 3D structurelle", "Matériaux éco-innovants"],
    desc: "Révolutionner les techniques de conception, de modélisation et de construction d'infrastructures à l'aide d'outils numériques avancés.",
    projetPhare: "Modélisation et optimisation numérique de micro-villes durables.",
    accent: "#f5a623",
    membersCount: 67,
    joined: false
  },
  {
    id: 'club-5',
    kicker: "Intelligence Artificielle",
    title: "Explorer et étendre les frontières du Machine Learning",
    divisions: ["Machine Learning appliqué", "Computer Vision", "Traitement naturel du langage (NLP)"],
    desc: "Plonger au cœur des algorithmes de deep learning et de computer vision pour concevoir les moteurs d'intelligence de demain.",
    projetPhare: "Système de vision par ordinateur pour le diagnostic précoce des cultures.",
    accent: "#1b4f8a",
    membersCount: 210,
    joined: false
  },
  {
    id: 'club-6',
    kicker: "Innovation Technologique et Entrepreneuriat",
    title: "Accélérer le transfert technologique (Lab-to-Market)",
    divisions: ["Design Thinking", "Prototypage rapide", "Modèles économiques tech"],
    desc: "Accompagner le passage de l'idée en laboratoire à un produit viable sur le marché en alliant prototypage technique et design d'usage.",
    projetPhare: "Plateforme IoT de gestion et de tri intelligent des déchets urbains.",
    accent: "#e05a2b",
    membersCount: 115,
    joined: false
  }
];

const DEFAULT_PROJECTS = [
  {
    id: 'proj-101',
    title: "Rover Autonome d'Exploration SLAM",
    summary: "Robot d'exploration autonome capable de cartographier des environnements inconnus en temps réel sans GPS.",
    description: "Ce projet vise à concevoir un rover terrestre équipé de capteurs LiDAR 2D/3D et de caméras stéréoscopiques. Grâce à un algorithme de SLAM (Simultaneous Localization and Mapping) intégré sur une puce d'IA embarquée, le rover génère une carte tridimensionnelle haute précision et planifie sa trajectoire d'évitement d'obstacles sans aucune intervention humaine.",
    status: "Actif",
    clubId: "club-1",
    clubName: "Robotique et Automatisation",
    image: roverImg,
    stars: 48,
    starred: false,
    supportersCount: 12,
    budgetRaised: 4200,
    technologies: ["ROS2", "LiDAR", "C++", "Python", "Jetson Nano", "OpenCV"],
    author: {
      name: "Marie-Claire Ousmane",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      role: "Chef de projet R&D"
    },
    team: [
      { name: "Marie-Claire O.", role: "Algorithmes & SLAM" },
      { name: "Tisto Dev", role: "Électronique & Capteurs" },
      { name: "Jean-Pierre K.", role: "Structure & Impression 3D" }
    ],
    publications: [
      { title: "Visual SLAM Optimization under Low-Light Environments", journal: "FIERI Tech Annals", year: 2025 }
    ],
    timeline: [
      { date: "Oct 2025", title: "Cahier des charges & Simulation Gazebo", completed: true },
      { date: "Déc 2025", title: "Assemblage du châssis physique", completed: true },
      { date: "Fév 2026", title: "Tests d'intégration ROS2", completed: true },
      { date: "Juin 2026", title: "Validation en milieu hostile (prévu)", completed: false }
    ]
  },
  {
    id: 'proj-102',
    title: "Smart Farming & IoT Multicouches",
    summary: "Réseau de capteurs agronomiques connectés et drones d'imagerie thermique pour optimiser l'irrigation.",
    description: "Déploiement d'un réseau maillé (Mesh) de capteurs LoRaWAN analysant l'humidité, la température et la conductivité du sol en temps réel. Ces données sont corrélées avec des images multispectrales capturées par drone pour générer une carte de stress hydrique précise et automatiser l'électro-irrigation goutte-à-goutte, économisant jusqu'à 40% d'eau.",
    status: "Actif",
    clubId: "club-2",
    clubName: "Informatique Industrielle et IoT",
    image: smartFarmingImg,
    stars: 35,
    starred: false,
    supportersCount: 8,
    budgetRaised: 3100,
    technologies: ["LoRaWAN", "ESP32", "MicroPython", "Drones", "MQTT", "Node-RED"],
    author: {
      name: "Dr. Alexis V.",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      role: "Chercheur principal"
    },
    team: [
      { name: "Dr. Alexis V.", role: "Superviseur Scientifique" },
      { name: "Amina Diallo", role: "Déploiement LoRa & Cloud" },
      { name: "Koffi Mensah", role: "Systèmes de puissance solaire" }
    ],
    publications: [
      { title: "Low-Power Agrotech Sensor Network Architecture", journal: "IEEE Agrotech Journal", year: 2024 }
    ],
    timeline: [
      { date: "Sept 2025", title: "Calibration des capteurs agronomiques", completed: true },
      { date: "Nov 2025", title: "Déploiement sur la ferme pilote", completed: true },
      { date: "Avril 2026", title: "Analyse comparative des récoltes", completed: false }
    ]
  },
  {
    id: 'proj-103',
    title: "Micro-Grid Solaire Autonome",
    summary: "Micro-réseau intelligent de distribution d'électricité solaire avec gestion de charge prédictive par IA.",
    description: "Conception d'une centrale solaire miniature décentralisée dotée d'algorithmes d'équilibrage de charge prédictifs. Le système anticipe la production (météo) et la consommation des foyers connectés grâce à des réseaux de neurones légers installés directement sur le contrôleur central, optimisant le cycle de vie des batteries stationnaires LiFePO4.",
    status: "En Phase de R&D",
    clubId: "club-3",
    clubName: "Eco-énergie et Climatisation",
    image: solarMicrogridImg,
    stars: 56,
    starred: false,
    supportersCount: 19,
    budgetRaised: 6500,
    technologies: ["Smart Grids", "LiFePO4", "TensorFlow Lite", "Modbus", "Raspberry Pi"],
    author: {
      name: "Dr. Amadou Kane",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      role: "Chercheur Énergie"
    },
    team: [
      { name: "Dr. Amadou K.", role: "Conception Électrotechnique" },
      { name: "Ousmane Sy", role: "Algorithmes d'optimisation" }
    ],
    publications: [
      { title: "Edge Computing for State of Charge (SoC) Forecasting", journal: "Solar Energy Materials", year: 2025 }
    ],
    timeline: [
      { date: "Nov 2025", title: "Calculs théoriques & Simulation Matlab", completed: true },
      { date: "Jan 2026", title: "Prototypage du banc d'essai local", completed: true },
      { date: "Mai 2026", title: "Déploiement de la v1 en zone périurbaine", completed: false }
    ]
  },
  {
    id: 'proj-104',
    title: "Diagnostic de Culture par Vision IA",
    summary: "Application mobile et caméra embarquée détectant instantanément les maladies foliaires des cultures.",
    description: "Ce projet résout un défi agricole majeur en développant un réseau de neurones convolutifs (CNN) capable de classifier 38 types de pathologies foliaires sur le maïs, le manioc et la tomate avec une précision de 96.4%. L'application fonctionne intégralement hors-ligne (Edge Inference) pour aider les agriculteurs dans les zones sans couverture réseau.",
    status: "Terminé",
    clubId: "club-5",
    clubName: "Intelligence Artificielle",
    image: plantDiseaseImg,
    stars: 72,
    starred: false,
    supportersCount: 31,
    budgetRaised: 8900,
    technologies: ["PyTorch", "MobileNetV3", "Android SDK", "TFLite", "FastAPI"],
    author: {
      name: "Yasmine Bamba",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Développeuse ML"
    },
    team: [
      { name: "Yasmine B.", role: "Modélisation CNN & Entraînement" },
      { name: "Tisto Dev", role: "Portage Android / TFLite" }
    ],
    publications: [
      { title: "Mobile leaf disease classification with MobileNet architectures", journal: "African AI Forum", year: 2025 },
      { title: "Patente accordée - Algorithme d'analyse foliaire hors-ligne", journal: "OAPI Patentes", year: 2026 }
    ],
    timeline: [
      { date: "Août 2025", title: "Collecte de la base de données (15k images)", completed: true },
      { date: "Oct 2025", title: "Entraînement & Optimisation du modèle", completed: true },
      { date: "Fév 2026", title: "Publication sur le Play Store", completed: true }
    ]
  }
];

const DEFAULT_WORKSHOPS = [
  {
    id: 'work-1',
    title: "Bootcamp Systèmes Embarqués & ROS2",
    instructor: "Marie-Claire Ousmane",
    date: "15 Juin 2026",
    duration: "4 jours (Intensif)",
    totalPlaces: 25,
    level: "Avancé",
    clubId: "club-1",
    desc: "Maîtrisez l'architecture interne de Robot Operating System 2 (ROS2), la création de nœuds de contrôle, l'implémentation de la navigation SLAM et le déploiement sur cibles matérielles réelles.",
    registeredUsers: ["Jean-Pierre L.", "Sarah M.", "Dr. Amadou K.", "Fatoumata S.", "Loïc D.", "Elena R.", "Omar B.", "Chloé G."],
    waitlistUsers: []
  },
  {
    id: 'work-2',
    title: "Deep Learning & Computer Vision avec PyTorch",
    instructor: "Yasmine Bamba",
    date: "02 Juillet 2026",
    duration: "6 sessions (Soirs & Weekends)",
    totalPlaces: 30,
    level: "Avancé",
    clubId: "club-5",
    desc: "De la théorie des réseaux de neurones artificiels à l'entraînement de CNN complexes sur GPU pour la reconnaissance d'objets, le traitement d'images médicales et la classification en temps réel.",
    registeredUsers: ["Alice P.", "Bastien F.", "Koffi A.", "Zineb H.", "Thomas N.", "Mélissa W."],
    waitlistUsers: []
  },
  {
    id: 'work-3',
    title: "Conception de Systèmes Connectés LoRaWAN",
    instructor: "Dr. Alexis V.",
    date: "28 Juillet 2026",
    duration: "2 jours",
    totalPlaces: 15,
    level: "Débutant",
    clubId: "club-2",
    desc: "Configurez une passerelle LoRaWAN autonome, développez des capteurs à ultrabasse consommation d'énergie avec ESP32 et configurez The Things Network (TTN) pour acheminer vos données.",
    registeredUsers: ["Dimitri S.", "Nour E.", "Félix M.", "Awa D.", "Rémi G.", "Sofia C.", "Hugo V.", "Clément J.", "Isabelle T.", "Marc A."],
    waitlistUsers: []
  },
  {
    id: 'work-4',
    title: "Atelier Éco-Conception & Smart Grid",
    instructor: "Dr. Jean-François M.",
    date: "10 Juin 2026",
    duration: "3 sessions (Interactif)",
    totalPlaces: 5,
    level: "Débutant",
    clubId: "club-3",
    desc: "Découvrez les bases des Smart Grids et apprenez à optimiser la consommation énergétique locale de vos capteurs IoT en utilisant des algorithmes d'éco-conception.",
    registeredUsers: ["Thomas Bernard", "Sylvie Martin", "Alice Dubois", "Yassine Kacem", "Christophe Roux"],
    waitlistUsers: ["Marc Lambert", "Sophie Morel", "Pierre Bertrand"]
  }
];

const DEFAULT_EVENTS = [
  {
    id: 'event-1',
    title: "FIERI GreenTech Hackathon 2026",
    tagline: "48h pour concevoir des solutions technologiques écologiques",
    date: "23-25 Octobre 2026",
    location: "Hybride (En ligne & Hub physique)",
    participantsCount: 185,
    prizePool: "5,000,000 FCFA",
    desc: "Rejoignez le plus grand événement de R&D étudiante de l'année. Collaborez avec des ingénieurs, designers et développeurs pour prototyper une solution matérielle ou logicielle répondant à un enjeu écologique crucial.",
    registered: false,
    isLive: true,
    liveUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    timeline: [
      { time: "Vendredi 18h", title: "Cérémonie d'ouverture & Pitch des idées" },
      { time: "Samedi 09h", title: "Début du prototypage & Mentorat expert" },
      { time: "Dimanche 14h", title: "Fin des soumissions & Démos publiques" }
    ]
  },
  {
    id: 'event-2',
    title: "Symposium Africain sur la Souveraineté Technologique",
    tagline: "Conférences scientifiques de haut niveau par des experts internationaux",
    date: "12 Décembre 2026",
    location: "Amphithéâtre Central & Webcast Live",
    participantsCount: 500,
    prizePool: "Accès libre",
    desc: "Un rassemblement de chercheurs et de décideurs industriels pour débattre des axes stratégiques du transfert technologique, du brevetage africain et du financement de la recherche appliquée.",
    registered: false,
    isLive: false,
    liveUrl: null,
    timeline: [
      { time: "09h00", title: "Discours d'introduction par le Bureau FIERI" },
      { time: "10h30", title: "Table ronde : Financer la R&D locale" }
    ]
  }
];


const DEFAULT_RESEARCHERS = [
  {
    id: 'r1',
    name: "Marie-Claire Ousmane",
    role: "Doctorante en Robotique Mobile",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    bio: "Passionnée par la navigation autonome, Marie-Claire travaille sur l'optimisation des cartes de profondeur (SLAM) en environnements texturés complexes.",
    pole: "Robotique",
    university: "Université Polytechnique de Fieri",
    specialties: ["SLAM", "ROS", "Navigation Autonome"],
    publicationsCount: 6,
    projectsCount: 3,
    stars: 124,
    followers: [],
    followersCount: 124
  },
  {
    id: 'r2',
    name: "Dr. Alexis V.",
    role: "Enseignant-Chercheur en IoT & Systèmes Embarqués",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    bio: "Spécialiste de la communication LoRaWAN, ses travaux se concentrent sur la résilience des réseaux de capteurs auto-alimentés en climat tropical.",
    pole: "IoT & Systèmes cyber-physiques",
    university: "Institut Supérieur de Technologie",
    specialties: ["IoT", "LoRaWAN", "Systèmes Embarqués"],
    publicationsCount: 18,
    projectsCount: 5,
    stars: 312,
    followers: [],
    followersCount: 312
  },
  {
    id: 'r3',
    name: "Yasmine Bamba",
    role: "Chercheuse associée en Vision par Ordinateur",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Ingénieure IA d'élite, Yasmine conçoit des modèles de deep learning compressés pour l'analyse d'images satellitaires et foliaires à la périphérie (Edge AI).",
    pole: "Intelligence Artificielle",
    university: "Université Virtuelle de Fieri",
    specialties: ["Deep Learning", "Vision par Ordinateur", "Edge AI"],
    publicationsCount: 4,
    projectsCount: 2,
    stars: 96,
    followers: [],
    followersCount: 96
  }
];

const DEFAULT_NEWS = [
  {
    id: 'art-1',
    categorie: "Intelligence Artificielle",
    title: "Comment l'IA générative transforme l'agriculture locale",
    date: "28 Mai 2026",
    author: "Dr. Amadou Kane",
    image: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800&auto=format&fit=crop&q=80",
    excerpt: "Découvrez comment nos modèles d'analyse foliaire basés sur l'IA aident concrètement les petits producteurs à identifier les pathologies en zone rurale sans connexion internet.",
    status: "APPROVED"
  },
  {
    id: 'art-2',
    categorie: "Lancement R&D",
    title: "Lancement officiel de la nouvelle saison des clubs de recherche",
    date: "10 Mai 2026",
    author: "Bureau Fieri",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80",
    excerpt: "La FIERI déploie ses nouveaux équipements de R&D au sein des universités membres. Découvrez les axes clés sur la robotique et les smart grids.",
    status: "APPROVED"
  },
  {
    id: 'art-3',
    categorie: "Éco-énergie",
    title: "Micro-grids intelligents : l'indépendance énergétique rurale",
    date: "15 Avril 2026",
    author: "Pôle Éco-énergie",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop&q=80",
    excerpt: "Une étude concrète de notre pôle sur l'implémentation de batteries LiFePO4 couplées à des algorithmes d'équilibrage prédictifs.",
    status: "APPROVED"
  }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'n-1', text: "Votre inscription au club 'Intelligence Artificielle' a été approuvée !", read: false, date: "Hier" },
  { id: 'n-2', text: "Le projet 'Rover SLAM' recherche un nouveau contributeur ROS2.", read: false, date: "Il y a 3 jours" },
  { id: 'n-3', text: "Un nouvel atelier sur LoRaWAN a été planifié pour fin Juillet.", read: true, date: "Il y a 1 semaine" }
];

const DEFAULT_OPPORTUNITIES = [
  {
    id: 'opt-1',
    title: "Post-Doc en Vision par Ordinateur pour Smart Farming",
    type: "CDD R&D",
    discipline: "Agronomie & Vision",
    salary: 3200,
    description: "Recherche sur l'imagerie multispectrale par drone pour détecter le stress hydrique précoce dans les cultures du Sahel. Vous rejoindrez une équipe interdisciplinaire de premier plan.",
    requirements: "Doctorat en Informatique, Vision par Ordinateur ou domaine connexe. Expérience pratique avec Python, PyTorch/TensorFlow et traitement de données géospatiales.",
    status: "Actif",
    dateAdded: "2026-05-28",
    author: "Dr. Alexis V."
  },
  {
    id: 'opt-2',
    title: "Doctorat en Intégration SLAM ROS2 et IA Embarquée",
    type: "Doctorat",
    discipline: "Robotique & IA",
    salary: 2600,
    description: "Recherche de pointe sur l'optimisation des trajectoires d'évitement d'obstacles en environnement inconnu à faible luminosité à l'aide de ROS2. Ce poste offre une opportunité de collaboration industrielle internationale.",
    requirements: "Master en Robotique, Automatique ou Informatique. Excellentes compétences en C++, Python, ROS2 et solides bases en mathématiques appliquées.",
    status: "Actif",
    dateAdded: "2026-05-25",
    author: "Marie-Claire Ousmane"
  },
  {
    id: 'opt-3',
    title: "Stage R&D en Optimisation de Micro-Grids Solaires",
    type: "Stage de Recherche",
    discipline: "Énergies Renouvelables",
    salary: 1200,
    description: "Développement d'un algorithme de prédiction de charge dynamique à l'aide de modèles légers de Machine Learning embarqués. Vous travaillerez en étroite collaboration avec le pôle Éco-énergie.",
    requirements: "Étudiant de niveau Master (M1/M2) ou école d'ingénieur en Électricité, Génie Énergétique ou Informatique. Notions en Python et modélisation énergétique.",
    status: "Actif",
    dateAdded: "2026-05-20",
    author: "Dr. Amadou Kane"
  }
];

// --- LOGIQUE D'INITIALISATION ET DE SYNC LOCAL STORAGE ---

/**
 * Lit une entité dans le localStorage ou renvoie null
 */
const readLocal = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`[mockDb] Erreur lors de la lecture de la clé ${key} :`, e);
    return null;
  }
};

/**
 * Écrit une entité dans le localStorage
 */
const writeLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[mockDb] Erreur lors de l'écriture de la clé ${key} :`, e);
  }
};

/**
 * Initialise et peuple le localStorage sur premier appel ou s'il est vide.
 * Fusionne intelligemment le contenu d'origine avec 'ancien_contenu.json'.
 */
export const initializeMockDb = () => {
  if (typeof window === 'undefined') return;

  // 1. Initialisation des Clubs
  if (!readLocal(KEYS.CLUBS)) {
    const mergedClubs = DEFAULT_CLUBS.map((club) => {
      // Tenter de trouver le club équivalent dans ancien_contenu.json par index ou par kicker
      const legacyClub = initialContent?.clubs?.club?.find(
        c => c.kicker.toLowerCase().includes(club.kicker.split(' ')[0].toLowerCase())
      );

      if (legacyClub) {
        return {
          ...club,
          title: legacyClub.title || club.title,
          divisions: legacyClub.division || club.divisions,
          desc: legacyClub.description || club.desc,
          projetPhare: legacyClub.projetPhare || club.projetPhare,
          accent: legacyClub.accent && legacyClub.accent.startsWith('var')
            ? (legacyClub.accent.includes('orange') ? '#e05a2b' : (legacyClub.accent.includes('blue') ? '#1b6fd8' : '#10b981'))
            : (legacyClub.accent || club.accent)
        };
      }
      return club;
    });
    writeLocal(KEYS.CLUBS, mergedClubs);
  }

  // 2. Initialisation des autres collections si absentes
  const existingProjects = readLocal(KEYS.PROJECTS);
  if (!existingProjects) {
    writeLocal(KEYS.PROJECTS, DEFAULT_PROJECTS);
  } else {
    // S'assurer que tous les projets ont leurs images configurées
    const updated = existingProjects.map(proj => {
      const defaultProj = DEFAULT_PROJECTS.find(p => p.id === proj.id);
      if (defaultProj && defaultProj.image) {
        return { ...proj, image: defaultProj.image };
      }
      return proj;
    });
    writeLocal(KEYS.PROJECTS, updated);
  }
  if (!readLocal(KEYS.WORKSHOPS)) writeLocal(KEYS.WORKSHOPS, DEFAULT_WORKSHOPS);
  if (!readLocal(KEYS.EVENTS)) writeLocal(KEYS.EVENTS, DEFAULT_EVENTS);
  if (!readLocal(KEYS.RESEARCHERS)) writeLocal(KEYS.RESEARCHERS, DEFAULT_RESEARCHERS);
  if (!readLocal(KEYS.NEWS)) writeLocal(KEYS.NEWS, DEFAULT_NEWS);
  if (!readLocal(KEYS.NOTIFICATIONS)) writeLocal(KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  if (!readLocal(KEYS.OPPORTUNITIES)) writeLocal(KEYS.OPPORTUNITIES, DEFAULT_OPPORTUNITIES);
};

// Assurer l'auto-initialisation au chargement du module
initializeMockDb();

// --- SERVICES DE DONNÉES / CRUD SIMULÉ ---

export const mockDb = {
  // CLUBS
  clubs: {
    getAll: () => readLocal(KEYS.CLUBS) || DEFAULT_CLUBS,
    getById: (id) => (readLocal(KEYS.CLUBS) || DEFAULT_CLUBS).find(c => c.id === id),
    update: (updatedClub) => {
      const list = readLocal(KEYS.CLUBS) || DEFAULT_CLUBS;
      const idx = list.findIndex(c => c.id === updatedClub.id);
      if (idx !== -1) {
        list[idx] = updatedClub;
        writeLocal(KEYS.CLUBS, list);
        return true;
      }
      return false;
    },
    toggleJoin: (clubId) => {
      const list = readLocal(KEYS.CLUBS) || DEFAULT_CLUBS;
      const idx = list.findIndex(c => c.id === clubId);
      if (idx !== -1) {
        const updated = { ...list[idx], joined: !list[idx].joined };
        list[idx] = updated;
        writeLocal(KEYS.CLUBS, list);
        return updated;
      }
      return null;
    }
  },

  // PROJETS
  projects: {
    getAll: () => readLocal(KEYS.PROJECTS) || DEFAULT_PROJECTS,
    getById: (id) => (readLocal(KEYS.PROJECTS) || DEFAULT_PROJECTS).find(p => p.id === id),
    update: (updatedProj) => {
      const list = readLocal(KEYS.PROJECTS) || DEFAULT_PROJECTS;
      const idx = list.findIndex(p => p.id === updatedProj.id);
      if (idx !== -1) {
        list[idx] = updatedProj;
        writeLocal(KEYS.PROJECTS, list);
        return true;
      }
      return false;
    },
    create: (newProj) => {
      const list = readLocal(KEYS.PROJECTS) || DEFAULT_PROJECTS;
      list.push(newProj);
      writeLocal(KEYS.PROJECTS, list);
      return newProj;
    },
    toggleFollow: (projectId) => {
      const list = readLocal('fieri_followed_projects') || [];
      const idx = list.indexOf(projectId);
      let followed;
      if (idx !== -1) {
        list.splice(idx, 1);
        followed = false;
      } else {
        list.push(projectId);
        followed = true;
      }
      writeLocal('fieri_followed_projects', list);
      return followed;
    },
    isFollowed: (projectId) => {
      const list = readLocal('fieri_followed_projects') || [];
      return list.includes(projectId);
    }
  },

  // WORKSHOPS
  workshops: {
    getAll: () => {
      const list = readLocal(KEYS.WORKSHOPS) || DEFAULT_WORKSHOPS;
      const storedUser = localStorage.getItem('fieri_user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userFullName = user ? `${user.firstName} ${user.lastName}` : null;
      return list.map(w => {
        const registeredUsers = w.registeredUsers || [];
        const waitlistUsers = w.waitlistUsers || [];
        return {
          ...w,
          placesLeft: Math.max(0, w.totalPlaces - registeredUsers.length),
          registered: userFullName ? registeredUsers.includes(userFullName) : false,
          inWaitlist: userFullName ? waitlistUsers.includes(userFullName) : false,
          waitlistPosition: userFullName && waitlistUsers.includes(userFullName) ? waitlistUsers.indexOf(userFullName) + 1 : 0
        };
      });
    },
    getById: (id) => {
      const list = readLocal(KEYS.WORKSHOPS) || DEFAULT_WORKSHOPS;
      const w = list.find(item => item.id === id);
      if (!w) return null;
      const storedUser = localStorage.getItem('fieri_user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userFullName = user ? `${user.firstName} ${user.lastName}` : null;
      const registeredUsers = w.registeredUsers || [];
      const waitlistUsers = w.waitlistUsers || [];
      return {
        ...w,
        placesLeft: Math.max(0, w.totalPlaces - registeredUsers.length),
        registered: userFullName ? registeredUsers.includes(userFullName) : false,
        inWaitlist: userFullName ? waitlistUsers.includes(userFullName) : false,
        waitlistPosition: userFullName && waitlistUsers.includes(userFullName) ? waitlistUsers.indexOf(userFullName) + 1 : 0
      };
    },
    update: (updatedWork) => {
      const list = readLocal(KEYS.WORKSHOPS) || DEFAULT_WORKSHOPS;
      const idx = list.findIndex(w => w.id === updatedWork.id);
      if (idx !== -1) {
        list[idx] = updatedWork;
        writeLocal(KEYS.WORKSHOPS, list);
        return true;
      }
      return false;
    },
    toggleRegister: (workshopId, userFullName) => {
      const list = readLocal(KEYS.WORKSHOPS) || DEFAULT_WORKSHOPS;
      const idx = list.findIndex(w => w.id === workshopId);
      if (idx === -1) return null;

      const w = { ...list[idx] };
      if (!w.registeredUsers) w.registeredUsers = [];
      if (!w.waitlistUsers) w.waitlistUsers = [];

      const regIdx = w.registeredUsers.indexOf(userFullName);
      const waitIdx = w.waitlistUsers.indexOf(userFullName);

      let action;
      let promotedUser = null;
      let position = 0;

      if (regIdx !== -1) {
        // Déjà inscrit -> se désinscrire
        w.registeredUsers.splice(regIdx, 1);
        action = 'deregistered';

        // Si quelqu'un est en file d'attente (FIFO)
        if (w.waitlistUsers.length > 0) {
          promotedUser = w.waitlistUsers.shift();
          w.registeredUsers.push(promotedUser);
          
          // Ajouter une notification système pour le membre promu
          const notifs = readLocal(KEYS.NOTIFICATIONS) || [];
          const newNotif = {
            id: `n-${Date.now()}`,
            text: `Félicitations ! Vous avez été coopté automatiquement de la liste d'attente à l'atelier '${w.title}'.`,
            read: false,
            date: "À l'instant"
          };
          notifs.unshift(newNotif);
          writeLocal(KEYS.NOTIFICATIONS, notifs);
        }
      } else if (waitIdx !== -1) {
        // Déjà en liste d'attente -> en sortir
        w.waitlistUsers.splice(waitIdx, 1);
        action = 'removed_from_waitlist';
      } else {
        // Tenter de s'inscrire
        if (w.registeredUsers.length < w.totalPlaces) {
          w.registeredUsers.push(userFullName);
          action = 'registered';
        } else {
          w.waitlistUsers.push(userFullName);
          action = 'waitlisted';
          position = w.waitlistUsers.length;
        }
      }

      list[idx] = w;
      writeLocal(KEYS.WORKSHOPS, list);

      return {
        success: true,
        action,
        promotedUser,
        position,
        workshop: {
          ...w,
          placesLeft: Math.max(0, w.totalPlaces - w.registeredUsers.length)
        }
      };
    }
  },

  // EVENTS
  events: {
    getAll: () => readLocal(KEYS.EVENTS) || DEFAULT_EVENTS,
    getById: (id) => (readLocal(KEYS.EVENTS) || DEFAULT_EVENTS).find(e => e.id === id),
    update: (updatedEvent) => {
      const list = readLocal(KEYS.EVENTS) || DEFAULT_EVENTS;
      const idx = list.findIndex(e => e.id === updatedEvent.id);
      if (idx !== -1) {
        list[idx] = updatedEvent;
        writeLocal(KEYS.EVENTS, list);
        return true;
      }
      return false;
    }
  },

  // RESEARCHERS
  researchers: {
    getAll: () => readLocal(KEYS.RESEARCHERS) || DEFAULT_RESEARCHERS,
    getById: (id) => (readLocal(KEYS.RESEARCHERS) || DEFAULT_RESEARCHERS).find(r => r.id === id),
    getByEmail: (email) => {
      const normalized = String(email || '').trim().toLowerCase();
      if (!normalized) return null;
      return (readLocal(KEYS.RESEARCHERS) || DEFAULT_RESEARCHERS).find(
        r => String(r.email || '').trim().toLowerCase() === normalized
      ) || null;
    },

    upsert: (researcher) => {
      if (!researcher) return null;
      const list = readLocal(KEYS.RESEARCHERS) || DEFAULT_RESEARCHERS;
      const idx = list.findIndex(r => r.id === researcher.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...researcher };
      } else {
        list.push(researcher);
      }
      writeLocal(KEYS.RESEARCHERS, list);
      return researcher;
    },

    upsertByEmail: (email, patch = {}) => {
      const normalized = String(email || '').trim().toLowerCase();
      if (!normalized) return null;
      const list = readLocal(KEYS.RESEARCHERS) || DEFAULT_RESEARCHERS;
      const idx = list.findIndex(r => String(r.email || '').trim().toLowerCase() === normalized);
      if (idx !== -1) {
        const updated = { ...list[idx], ...patch, email: list[idx].email || email };
        list[idx] = updated;
        writeLocal(KEYS.RESEARCHERS, list);
        return updated;
      }

      const base = {
        id: patch.id || `me-${Date.now()}`,
        email,
        followers: [],
        followersCount: 0
      };
      const created = { ...base, ...patch, email };
      list.push(created);
      writeLocal(KEYS.RESEARCHERS, list);
      return created;
    },

    getMe: () => {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem('fieri_user');
      if (!raw) return null;
      let u;
      try {
        u = JSON.parse(raw);
      } catch {
        return null;
      }
      const name = u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '';
      if (!u?.email) return null;
      const existing = mockDb.researchers.getByEmail(u.email);
      if (existing) {
        return { ...existing, name: existing.name || name, role: existing.role || u.role };
      }
      return mockDb.researchers.upsertByEmail(u.email, {
        id: u.id ? `me-${u.id}` : undefined,
        name,
        role: u.role || 'CHERCHEUR',
        university: '',
        bio: '',
        specialties: [],
        portfolioUrl: '',
        cvUrl: ''
      });
    },

    updateMe: (patch = {}) => {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem('fieri_user');
      if (!raw) return null;
      let u;
      try {
        u = JSON.parse(raw);
      } catch {
        return null;
      }
      if (!u?.email) return null;
      const name = patch.name ?? `${u.firstName || ''} ${u.lastName || ''}`.trim();
      return mockDb.researchers.upsertByEmail(u.email, {
        ...patch,
        name,
        role: patch.role || u.role || 'CHERCHEUR'
      });
    },

    toggleFollow: (researcherId, userId) => {
      const list = readLocal(KEYS.RESEARCHERS) || DEFAULT_RESEARCHERS;
      const idx = list.findIndex(r => r.id === researcherId);
      if (idx !== -1) {
        const researcher = { ...list[idx] };
        if (!researcher.followers) researcher.followers = [];
        if (researcher.followersCount === undefined) researcher.followersCount = researcher.stars || 0;
        
        const userIdx = researcher.followers.indexOf(userId);
        if (userIdx !== -1) {
          // Unfollow
          researcher.followers.splice(userIdx, 1);
          researcher.followersCount = Math.max(0, researcher.followersCount - 1);
        } else {
          // Follow
          researcher.followers.push(userId);
          researcher.followersCount += 1;
        }
        
        list[idx] = researcher;
        writeLocal(KEYS.RESEARCHERS, list);
        return researcher;
      }
      return null;
    }
  },

  // NEWS
  news: {
    getAll: (includePending = false) => {
      const list = (readLocal(KEYS.NEWS) || DEFAULT_NEWS).map(item => ({
        status: 'APPROVED', // Default fallback for legacy entries
        ...item
      }));
      if (includePending) {
        return list;
      }
      return list.filter(item => item.status === 'APPROVED');
    },
    getById: (id) => {
      const list = (readLocal(KEYS.NEWS) || DEFAULT_NEWS).map(item => ({
        status: 'APPROVED',
        ...item
      }));
      return list.find(item => item.id === id);
    },
    add: (articleData) => {
      const list = readLocal(KEYS.NEWS) || DEFAULT_NEWS;
      const newArticle = {
        id: `art-${Date.now()}`,
        status: 'PENDING',
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        ...articleData
      };
      list.unshift(newArticle);
      writeLocal(KEYS.NEWS, list);
      return newArticle;
    },
    approve: (id) => {
      const list = readLocal(KEYS.NEWS) || DEFAULT_NEWS;
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx].status = 'APPROVED';
        writeLocal(KEYS.NEWS, list);
        return list[idx];
      }
      return null;
    },
    delete: (id) => {
      const list = readLocal(KEYS.NEWS) || DEFAULT_NEWS;
      const filtered = list.filter(item => item.id !== id);
      writeLocal(KEYS.NEWS, filtered);
      return true;
    }
  },

  // NOTIFICATIONS
  notifications: {
    getAll: () => readLocal(KEYS.NOTIFICATIONS) || DEFAULT_NOTIFICATIONS,
    markAsRead: (id) => {
      const list = readLocal(KEYS.NOTIFICATIONS) || DEFAULT_NOTIFICATIONS;
      const idx = list.findIndex(n => n.id === id);
      if (idx !== -1) {
        const updated = { ...list[idx], read: true };
        list[idx] = updated;
        writeLocal(KEYS.NOTIFICATIONS, list);
        return true;
      }
      return false;
    },
    add: (text) => {
      const list = readLocal(KEYS.NOTIFICATIONS) || DEFAULT_NOTIFICATIONS;
      const newNotif = {
        id: `n-${Date.now()}`,
        text,
        read: false,
        date: "À l'instant",
        createdAt: new Date().toISOString()
      };
      list.unshift(newNotif);
      writeLocal(KEYS.NOTIFICATIONS, list);
      return newNotif;
    },
    markAllRead: () => {
      const list = readLocal(KEYS.NOTIFICATIONS) || DEFAULT_NOTIFICATIONS;
      const updated = list.map(n => ({ ...n, read: true }));
      writeLocal(KEYS.NOTIFICATIONS, updated);
      return true;
    },
    clear: () => {
      writeLocal(KEYS.NOTIFICATIONS, []);
      return true;
    }
  },

  // MESSAGES DE CONTACT & SUPPORT
  contactMessages: {
    getAll: () => readLocal(KEYS.CONTACT_MESSAGES) || [],
    add: (msgData) => {
      const list = readLocal(KEYS.CONTACT_MESSAGES) || [];
      const newMsg = {
        id: `msg-${Date.now()}`,
        ...msgData,
        sentAt: new Date().toISOString()
      };
      list.unshift(newMsg);
      writeLocal(KEYS.CONTACT_MESSAGES, list);
      return newMsg;
    },
    clear: () => writeLocal(KEYS.CONTACT_MESSAGES, [])
  },

  // OPPORTUNITÉS DE RECHERCHE SCIENTIFIQUE
  opportunities: {
    getAll: () => readLocal(KEYS.OPPORTUNITIES) || DEFAULT_OPPORTUNITIES,
    add: (optData) => {
      const list = readLocal(KEYS.OPPORTUNITIES) || DEFAULT_OPPORTUNITIES;
      const newOpt = {
        id: `opt-${Date.now()}`,
        ...optData,
        status: 'Actif',
        dateAdded: new Date().toISOString().split('T')[0]
      };
      list.unshift(newOpt);
      writeLocal(KEYS.OPPORTUNITIES, list);
      return newOpt;
    }
  }
};

export default mockDb;
