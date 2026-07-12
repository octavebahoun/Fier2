import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ChevronRight,
  Crown,
  Flag,
  Globe2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Search,
  Shirt,
  Sparkles,
  Users,
  Vote
} from 'lucide-react';
import citeImage from '../assets/fieri_student_hub.webp';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const citeData = {
  globalGovernance: {
    founders: [
      {
        name: 'Precieux K.',
        role: 'Fondateur principal',
        country: 'International',
        bio: 'Vision stratégique, coordination de la cité et développement institutionnel.'
      },
      {
        name: 'Aminata S.',
        role: 'Co-fondatrice',
        country: 'Bénin',
        bio: 'Structuration académique, partenariats universitaires et vie communautaire.'
      },
      {
        name: 'Mickael D.',
        role: 'Co-fondateur',
        country: 'Côte d’Ivoire',
        bio: 'Innovation appliquée, clubs R&D et transfert technologique.'
      }
    ],
    board: [
      'Présidence internationale',
      'Secrétariat général',
      'Coordination des cités nationales',
      'Direction innovation & recherche',
      'Communication institutionnelle'
    ]
  },
  countries: [
    {
      id: 'benin',
      name: 'Bénin',
      flag: 'BJ',
      region: 'Afrique de l’Ouest',
      summary: 'Cité pilote FIERI avec des clubs universitaires orientés innovation utile.',
      bureau: [
        { name: 'Arielle H.', role: 'Présidente nationale', contact: 'arielle@fieri.org' },
        { name: 'Joel A.', role: 'Secrétaire national', contact: 'joel@fieri.org' },
        { name: 'Merveille T.', role: 'Responsable partenariats', contact: 'partenariats.bj@fieri.org' }
      ],
      universities: [
        {
          id: 'uac',
          name: 'Université d’Abomey-Calavi',
          city: 'Abomey-Calavi',
          leaders: [
            { name: 'Dr. Nadège B.', role: 'Responsable universitaire', contact: '+229 01 90 00 00 01' },
            { name: 'Kevin M.', role: 'Coordinateur clubs', contact: 'kevin.uac@fieri.org' }
          ],
          clubs: [
            {
              id: 'robotique-uac',
              name: 'Club Robotique & Automatisation',
              domain: 'Robotique, IA embarquée, mécatronique',
              members: 74,
              activity: 'Atelier rover autonome et initiation ROS.',
              decision: 'Priorité donnée aux prototypes utiles pour l’agriculture locale.',
              textile: 'Tricot bleu marine avec motif circuit et badge Robotique.',
              chief: {
                name: 'Christ M.',
                role: 'Responsable du club',
                phone: '+229 01 67 45 21 09',
                email: 'robotique.uac@fieri.org'
              }
            },
            {
              id: 'ia-uac',
              name: 'Club Intelligence Artificielle',
              domain: 'Machine learning, vision, données',
              members: 58,
              activity: 'Session pratique sur la détection d’anomalies par vision.',
              decision: 'Créer une banque de datasets locaux pour les projets étudiants.',
              textile: 'T-shirt blanc et bleu avec symbole neural FIERI.',
              chief: {
                name: 'Ruth A.',
                role: 'Responsable du club',
                phone: '+229 01 61 22 18 35',
                email: 'ia.uac@fieri.org'
              }
            }
          ]
        },
        {
          id: 'eneam',
          name: 'ENEAM',
          city: 'Cotonou',
          leaders: [
            { name: 'Cédric F.', role: 'Point focal universitaire', contact: '+229 01 94 22 11 02' }
          ],
          clubs: [
            {
              id: 'entrepreneuriat-eneam',
              name: 'Club Innovation & Entrepreneuriat',
              domain: 'Business model, prototypage, incubation',
              members: 41,
              activity: 'Sprint de validation marché pour projets étudiants.',
              decision: 'Chaque projet doit présenter un usage réel et un modèle simple.',
              textile: 'Polo noir avec marquage orange FIERI Cité.',
              chief: {
                name: 'Sarah D.',
                role: 'Responsable du club',
                phone: '+229 01 52 78 49 11',
                email: 'innovation.eneam@fieri.org'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'cote-ivoire',
      name: 'Côte d’Ivoire',
      flag: 'CI',
      region: 'Afrique de l’Ouest',
      summary: 'Déploiement orienté concours, prototypage et clubs scientifiques campus.',
      bureau: [
        { name: 'Yao K.', role: 'Coordinateur national', contact: 'yao@fieri.org' },
        { name: 'Prisca N.', role: 'Responsable communication', contact: 'communication.ci@fieri.org' }
      ],
      universities: [
        {
          id: 'ufhb',
          name: 'Université Félix Houphouët-Boigny',
          city: 'Abidjan',
          leaders: [
            { name: 'Mariam C.', role: 'Responsable universitaire', contact: '+225 07 00 00 00 12' }
          ],
          clubs: [
            {
              id: 'energie-ufhb',
              name: 'Club Éco-Énergie',
              domain: 'Micro-réseaux, solaire, efficacité énergétique',
              members: 63,
              activity: 'Prototype de mini-station solaire intelligente.',
              decision: 'Orienter les projets vers les besoins d’électrification locale.',
              textile: 'Maillot vert profond avec symbole énergie FIERI.',
              chief: {
                name: 'Ibrahim S.',
                role: 'Responsable du club',
                phone: '+225 07 11 22 33 44',
                email: 'energie.ufhb@fieri.org'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'senegal',
      name: 'Sénégal',
      flag: 'SN',
      region: 'Afrique de l’Ouest',
      summary: 'Antenne en structuration autour des universités et des laboratoires étudiants.',
      bureau: [
        { name: 'Fatou G.', role: 'Représentante nationale', contact: 'fatou@fieri.org' }
      ],
      universities: [
        {
          id: 'ucad',
          name: 'Université Cheikh Anta Diop',
          city: 'Dakar',
          leaders: [
            { name: 'Oumar L.', role: 'Responsable universitaire', contact: '+221 77 000 00 00' }
          ],
          clubs: [
            {
              id: 'iot-ucad',
              name: 'Club IoT & Systèmes Embarqués',
              domain: 'Capteurs, réseaux, edge computing',
              members: 36,
              activity: 'Montage de capteurs connectés pour suivi environnemental.',
              decision: 'Lancer un kit d’apprentissage IoT pour nouveaux membres.',
              textile: 'T-shirt bleu électrique avec motif capteurs connectés.',
              chief: {
                name: 'Awa N.',
                role: 'Responsable du club',
                phone: '+221 76 45 90 12',
                email: 'iot.ucad@fieri.org'
              }
            }
          ]
        }
      ]
    }
  ]
};

const getInitialJoinForm = () => ({
  fullName: '',
  email: '',
  phone: '',
  field: '',
  motivation: ''
});

const countryFallbacks = {
  'Bénin': { flag: '🇧🇯', region: 'Afrique de l’Ouest', summary: 'Cité pilote FIERI avec des clubs universitaires orientés innovation utile.' },
  'Côte d’Ivoire': { flag: '🇨🇮', region: 'Afrique de l’Ouest', summary: 'Déploiement orienté concours, prototypage et clubs scientifiques campus.' }
};

const universityFallbacks = {
  'Université d\'Abomey-Calavi': { city: 'Abomey-Calavi' },
  'ENEAM': { city: 'Cotonou' }
};

const clubFallbacks = {
  'club-1': {
    domain: 'Robotique, IA embarquée, mécatronique',
    activity: 'Atelier rover autonome et initiation ROS.',
    decision: 'Priorité donnée aux prototypes utiles pour l’agriculture locale.',
    textile: 'Tricot bleu marine avec motif circuit et badge Robotique.'
  },
  'club-2': {
    domain: 'Biotechnologies et génomique',
    activity: 'Recherches sur la génomique et les bio-technologies appliquées.',
    decision: 'Créer une banque de datasets locaux pour les projets étudiants.',
    textile: 'T-shirt blanc et bleu avec symbole neural FIERI.'
  }
};

export default function CiteIntegration({ navigate }) {
  const { user } = useAuth();
  const [view, setView] = useState('countries');
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [query, setQuery] = useState('');
  const [joinForm, setJoinForm] = useState(getInitialJoinForm);
  const [submitted, setSubmitted] = useState(false);

  // Dynamic backend states
  const [rawCountries, setRawCountries] = useState([]);
  const [universitiesMap, setUniversitiesMap] = useState({});
  const [branchesMap, setBranchesMap] = useState({});
  const [clubs, setClubs] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClubDetail, setSelectedClubDetail] = useState(null);
  const [loadingClubDetail, setLoadingClubDetail] = useState(false);

  // Load all hierarchy and members from backend
  const loadData = async () => {
    try {
      setLoading(true);
      const [countryRes, clubsRes, membersRes] = await Promise.all([
        api.org.getCountries(),
        api.clubs.getAll(),
        api.members.list({ limit: 100 })
      ]);

      const countriesList = countryRes.success ? (countryRes.data || []) : [];
      setRawCountries(countriesList);
      setClubs(clubsRes.success ? (clubsRes.data || []) : []);
      setMembers(membersRes.success ? (membersRes.data || []) : []);

      const tempUnis = {};
      const tempBranches = {};

      await Promise.all(
        countriesList.map(async (c) => {
          const uniRes = await api.org.getUniversities(c.id);
          if (uniRes.success) {
            tempUnis[c.id] = uniRes.data || [];
            await Promise.all(
              (uniRes.data || []).map(async (u) => {
                const branchRes = await api.org.getBranches(u.id);
                if (branchRes.success) {
                  tempBranches[u.id] = branchRes.data || [];
                }
              })
            );
          }
        })
      );

      setUniversitiesMap(tempUnis);
      setBranchesMap(tempBranches);
    } catch (err) {
      console.error("Erreur lors de l'initialisation de la cité :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch selected club details dynamically when selectedClubId changes
  useEffect(() => {
    if (selectedClubId) {
      setLoadingClubDetail(true);
      api.clubs.getById(selectedClubId).then((res) => {
        if (res.success) {
          setSelectedClubDetail(res.data);
        }
        setLoadingClubDetail(false);
      }).catch(() => setLoadingClubDetail(false));
    } else {
      setSelectedClubDetail(null);
    }
  }, [selectedClubId]);

  // Helper to resolve a member's location within the country/university/branch hierarchy
  const getMemberLocation = (member) => {
    let memberBranch = null;
    let memberUni = null;
    let memberCountry = null;

    for (const [uniId, bList] of Object.entries(branchesMap)) {
      const foundBranch = (bList || []).find(b => b.id === member.branchId);
      if (foundBranch) {
        memberBranch = foundBranch;
        for (const [cId, uList] of Object.entries(universitiesMap)) {
          const foundUni = (uList || []).find(u => u.id === foundBranch.universityId);
          if (foundUni) {
            memberUni = foundUni;
            memberCountry = rawCountries.find(c => c.id === foundUni.countryId);
            break;
          }
        }
        break;
      }
    }
    return { branch: memberBranch, university: memberUni, country: memberCountry };
  };

  // Reconstruct the full hierarchical data model
  const countries = useMemo(() => {
    return rawCountries.map(c => {
      const fallback = countryFallbacks[c.name] || { flag: '🌐', region: 'Afrique', summary: 'Cité de recherche et d\'innovation FIERI.' };
      
      const unisList = universitiesMap[c.id] || [];
      const countryUnis = unisList.map(u => {
        const uFallback = universityFallbacks[u.name] || { city: 'Campus' };
        
        const uniClubs = clubs.map(club => {
          const clubFallback = clubFallbacks[club.id] || {
            domain: club.discipline || 'Recherche scientifique',
            activity: club.description || 'Activités du pôle R&D.',
            decision: 'Décisions prises collectivement pour l\'innovation utile.',
            textile: 'Tricot officiel FIERI.'
          };
          return {
            id: club.id,
            name: club.name,
            domain: clubFallback.domain,
            members: club.memberCount || 0,
            activity: clubFallback.activity,
            decision: clubFallback.decision,
            textile: clubFallback.textile
          };
        });

        const leaders = members
          .filter(m => (m.role === 'RESPONSABLE' || m.role === 'MENTOR') && getMemberLocation(m).university?.id === u.id)
          .map(m => ({
            name: `${m.firstName} ${m.lastName}`,
            role: m.role === 'MENTOR' ? 'Mentor Universitaire' : 'Responsable Universitaire',
            contact: m.email
          }));

        return {
          id: u.id,
          name: u.name,
          city: uFallback.city,
          leaders: leaders.length ? leaders : [
            { name: 'Dr. Nadège B.', role: 'Responsable universitaire', contact: 'contact@fieri.org' }
          ],
          clubs: uniClubs
        };
      });

      const bureau = members
        .filter(m => m.role === 'ADMIN' && getMemberLocation(m).country?.id === c.id)
        .map(m => ({
          name: `${m.firstName} ${m.lastName}`,
          role: 'Membre du Bureau National',
          contact: m.email
        }));

      return {
        id: c.id,
        name: c.name,
        flag: fallback.flag,
        region: fallback.region,
        summary: fallback.summary,
        bureau: bureau.length ? bureau : [
          { name: 'Arielle H.', role: 'Présidente nationale', contact: 'arielle@fieri.org' }
        ],
        universities: countryUnis
      };
    });
  }, [rawCountries, universitiesMap, branchesMap, clubs, members]);

  // Selected entities based on selection hooks
  const selectedCountry = countries.find((country) => country.id === selectedCountryId);
  const selectedUniversity = selectedCountry?.universities.find((university) => university.id === selectedUniversityId);
  
  // Decorate selectedClub with dynamic details and chief loaded from backend
  const selectedClub = useMemo(() => {
    if (!selectedUniversity) return null;
    const basicClub = selectedUniversity.clubs.find((club) => club.id === selectedClubId);
    if (!basicClub) return null;

    // Resolve chief
    let chief = null;
    if (selectedClubDetail && selectedClubDetail.members) {
      const foundChief = selectedClubDetail.members.find(m => m.role === 'RESPONSABLE') ||
                         selectedClubDetail.members.find(m => m.role === 'CHEF_DE_PROJET') ||
                         selectedClubDetail.members.find(m => m.role === 'ADMIN') ||
                         selectedClubDetail.members[0];
      if (foundChief) {
        const fullInfo = members.find(m => m.id === foundChief.id);
        chief = {
          name: `${foundChief.firstName} ${foundChief.lastName}`,
          role: foundChief.role === 'RESPONSABLE' ? 'Responsable du Club' : 'Chef de projet / Référent',
          phone: fullInfo?.phone || '+229 01 00 00 00 00',
          email: fullInfo?.email || foundChief.email || ''
        };
      }
    }

    return {
      ...basicClub,
      members: selectedClubDetail?.members?.length ?? basicClub.members,
      chief: chief || {
        name: 'Christ M.',
        role: 'Responsable du club',
        phone: '+229 01 67 45 21 09',
        email: 'robotique.uac@fieri.org'
      }
    };
  }, [selectedUniversity, selectedClubId, selectedClubDetail, members]);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(query.toLowerCase()) ||
    country.region.toLowerCase().includes(query.toLowerCase())
  );

  const filteredUniversities = selectedCountry?.universities.filter((university) =>
    university.name.toLowerCase().includes(query.toLowerCase()) ||
    university.city.toLowerCase().includes(query.toLowerCase())
  ) ?? [];

  const filteredClubs = selectedUniversity?.clubs.filter((club) =>
    club.name.toLowerCase().includes(query.toLowerCase()) ||
    club.domain.toLowerCase().includes(query.toLowerCase())
  ) ?? [];

  const goCountries = () => {
    setView('countries');
    setSelectedCountryId(null);
    setSelectedUniversityId(null);
    setSelectedClubId(null);
    setQuery('');
    setSubmitted(false);
  };

  const goCountry = (countryId = selectedCountryId) => {
    setSelectedCountryId(countryId);
    setSelectedUniversityId(null);
    setSelectedClubId(null);
    setView('country');
    setQuery('');
    setSubmitted(false);
  };

  const goUniversity = (universityId = selectedUniversityId) => {
    setSelectedUniversityId(universityId);
    setSelectedClubId(null);
    setView('university');
    setQuery('');
    setSubmitted(false);
  };

  const goClub = (clubId = selectedClubId) => {
    setSelectedClubId(clubId);
    setView('club');
    setQuery('');
    setSubmitted(false);
  };

  const handleJoinChange = (field, value) => {
    setJoinForm((current) => ({ ...current, [field]: value }));
  };

  const handleJoinSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await api.memberships.requestJoin(selectedClubId, { id: user.id });
      if (res.success) {
        setSubmitted(true);
        setJoinForm(getInitialJoinForm());
      } else {
        alert(res.message || "Impossible d'envoyer la demande.");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur s'est produite lors de l'envoi de la demande d'intégration.");
    }
  };

  return (
    <div className="relative overflow-hidden bg-bg-primary text-text-primary min-h-screen">
      <div className="absolute inset-0 blueprint-grid opacity-70 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-radial from-accent-primary/18 to-transparent blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[42vw] h-[42vw] rounded-full bg-radial from-accent-tertiary/12 to-transparent blur-[90px] pointer-events-none" />

      <section className="relative z-10 max-w-[92rem] mx-auto w-full px-6 md:px-12 lg:px-24 py-10 md:py-14">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl lg:max-w-[45%]">
              <button
                onClick={() => navigate('home')}
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-text-secondary hover:text-text-primary transition-colors cursor-pointer mb-5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à l’accueil
              </button>
              <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-4 py-1.5 rounded-full mb-5">
                <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Parcours d’intégration FIERI</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Intégrer notre cité, du niveau international jusqu’au club local.
              </h1>
              <p className="mt-4 text-sm md:text-base text-text-secondary max-w-2xl leading-relaxed">
                Choisissez un pays, explorez ses universités, trouvez un club actif et envoyez une demande d’adhésion.
              </p>
            </div>

            <div className="lg:max-w-[48%] relative">
              <div className="rounded-2xl overflow-hidden border border-border-subtle shadow-2xl shadow-black/30">
                <img
                  src={citeImage}
                  alt="Étudiants FIERI"
                  className="w-full h-auto object-cover aspect-[16/10]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-32 h-32 rounded-full bg-radial from-accent-primary/20 to-transparent blur-[40px] pointer-events-none" />
            </div>
          </header>

            <div className="glass-panel rounded-2xl p-4 min-w-0 lg:min-w-[320px]">
              <div className="text-[10px] uppercase tracking-widest font-black text-text-muted mb-3">Position actuelle</div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                <Crumb label="International" active={view === 'countries' || view === 'global'} onClick={goCountries} />
                {selectedCountry && <Crumb label={selectedCountry.name} active={view === 'country' || view === 'national'} onClick={() => goCountry()} />}
                {selectedUniversity && <Crumb label={selectedUniversity.name} active={view === 'university' || view === 'university-leaders'} onClick={() => goUniversity()} />}
                {selectedClub && <Crumb label={selectedClub.name} active={view === 'club' || view === 'club-chief' || view === 'join'} onClick={() => goClub()} />}
              </div>
            </div>

          <motion.div
            key={view}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="glass-panel h-48 rounded-2xl animate-pulse bg-bg-secondary/40 border border-border-subtle" />
                ))}
              </div>
            ) : (
              <>
                {view === 'countries' && (
                  <CountriesView
                    countries={filteredCountries}
                    query={query}
                    setQuery={setQuery}
                    onCountrySelect={goCountry}
                    onGlobalGovernance={() => setView('global')}
                  />
                )}

                {view === 'global' && (
                  <GovernanceView
                    title="Fondateurs et gouvernance globale"
                    subtitle="Équipe internationale qui porte la vision, la coordination et l’expansion de la FIERI."
                    people={citeData.globalGovernance.founders}
                    board={citeData.globalGovernance.board}
                    onBack={goCountries}
                  />
                )}

                {view === 'country' && selectedCountry && (
                  <CountryView
                    country={selectedCountry}
                    universities={filteredUniversities}
                    query={query}
                    setQuery={setQuery}
                    onUniversitySelect={goUniversity}
                    onNationalBureau={() => setView('national')}
                  />
                )}

                {view === 'national' && selectedCountry && (
                  <GovernanceView
                    title={`Bureau national FIERI - ${selectedCountry.name}`}
                    subtitle="Responsables chargés de coordonner les universités, les clubs et les projets du pays."
                    people={selectedCountry.bureau}
                    board={['Coordination nationale', 'Suivi des universités', 'Partenariats locaux', 'Communication pays']}
                    onBack={() => goCountry()}
                  />
                )}

                {view === 'university' && selectedUniversity && (
                  <UniversityView
                    university={selectedUniversity}
                    clubs={filteredClubs}
                    query={query}
                    setQuery={setQuery}
                    onClubSelect={goClub}
                    onUniversityLeaders={() => setView('university-leaders')}
                  />
                )}

                {view === 'university-leaders' && selectedUniversity && (
                  <GovernanceView
                    title={`Responsables FIERI - ${selectedUniversity.name}`}
                    subtitle="Référents de la cité FIERI au sein de l’administration universitaire."
                    people={selectedUniversity.leaders}
                    board={['Coordination campus', 'Animation des clubs', 'Accueil des nouveaux membres']}
                    onBack={() => goUniversity()}
                  />
                )}

                {view === 'club' && selectedClub && (
                  <ClubView
                    club={selectedClub}
                    university={selectedUniversity}
                    country={selectedCountry}
                    onChief={() => setView('club-chief')}
                    onJoin={() => {
                      if (!user) {
                        navigate?.('auth');
                      } else {
                        setView('join');
                      }
                    }}
                  />
                )}

                {view === 'club-chief' && selectedClub && (
                  <ChiefView club={selectedClub} onBack={() => goClub()} />
                )}

                {view === 'join' && selectedClub && (
                  <JoinView
                    club={selectedClub}
                    form={joinForm}
                    submitted={submitted}
                    onBack={() => goClub()}
                    onChange={handleJoinChange}
                    onSubmit={handleJoinSubmit}
                  />
                )}
              </>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function Crumb({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-wider font-black cursor-pointer transition-all ${
        active
          ? 'bg-accent-primary/20 border-accent-primary/35 text-text-primary'
          : 'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-white/5'
      }`}
    >
      {label}
      <ChevronRight className="w-3 h-3" />
    </button>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="relative block w-full md:max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full bg-bg-secondary/80 border border-border-subtle pl-11 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary/60 transition-colors"
      />
    </label>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-secondary/45 p-4">
      <Icon className="w-5 h-5 text-accent-secondary mb-3" />
      <div className="text-2xl font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted mt-1">{label}</div>
    </div>
  );
}

function CountriesView({ countries, query, setQuery, onCountrySelect, onGlobalGovernance }) {
  const totalUniversities = countries.reduce((sum, country) => sum + country.universities.length, 0);
  const totalClubs = countries.reduce(
    (sum, country) => sum + country.universities.reduce((clubSum, university) => clubSum + university.clubs.length, 0),
    0
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric icon={Globe2} label="Pays disponibles" value={countries.length} />
        <Metric icon={GraduationCap} label="Universités" value={totalUniversities} />
        <Metric icon={Users} label="Clubs ouverts" value={totalClubs} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Choisissez votre pays</h2>
          <p className="text-sm text-text-secondary mt-1">C’est la première porte d’entrée dans la cité FIERI.</p>
        </div>
        <SearchBox value={query} onChange={setQuery} placeholder="Rechercher un pays..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {countries.map((country) => (
          <button
            key={country.id}
            onClick={() => onCountrySelect(country.id)}
            className="glass-panel rounded-2xl p-5 text-left cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-primary/15 border border-accent-primary/25 flex items-center justify-center font-black">
                {country.flag}
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-secondary transition-colors" />
            </div>
            <h3 className="mt-5 text-xl font-black">{country.name}</h3>
            <p className="text-xs uppercase tracking-widest font-bold text-accent-secondary mt-1">{country.region}</p>
            <p className="text-sm text-text-secondary mt-4 leading-relaxed">{country.summary}</p>
            <div className="flex gap-2 mt-5 text-[10px] uppercase tracking-wider font-black text-text-muted">
              <span>{country.universities.length} université(s)</span>
              <span>•</span>
              <span>{country.universities.reduce((sum, university) => sum + university.clubs.length, 0)} club(s)</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={onGlobalGovernance}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-secondary/30 bg-accent-secondary/10 px-6 py-3 text-xs uppercase tracking-widest font-black text-text-primary hover:bg-accent-secondary/15 transition-all cursor-pointer"
        >
          <Crown className="w-4 h-4" />
          Voir la Gouvernance Globale
        </button>
      </div>
    </div>
  );
}

function GovernanceView({ title, subtitle, people, board, onBack }) {
  const { hasMinRole } = useAuth();
  const canSeeContacts = hasMinRole('ETUDIANT');

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer w-fit">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>
      <div>
        <h2 className="text-2xl md:text-4xl font-black">{title}</h2>
        <p className="text-sm text-text-secondary max-w-2xl mt-3">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.8fr] gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {people.map((person) => (
            <article key={`${person.name}-${person.role}`} className="glass-panel rounded-2xl p-5">
              <div className="w-12 h-12 rounded-2xl bg-accent-primary/15 border border-accent-primary/25 flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-accent-secondary" />
              </div>
              <h3 className="text-lg font-black">{person.name}</h3>
              <p className="text-xs uppercase tracking-widest text-accent-secondary font-black mt-1">{person.role}</p>
              <p className="text-sm text-text-secondary mt-4">
                {person.bio ?? (canSeeContacts ? person.contact : 'Coordonnées masquées (Connexion Étudiant requise)')}
              </p>
            </article>
          ))}
        </div>
        <aside className="glass-panel rounded-2xl p-5 h-fit">
          <h3 className="text-sm uppercase tracking-widest font-black mb-4">Axes de gouvernance</h3>
          <div className="flex flex-col gap-3">
            {board.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-accent-secondary shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CountryView({ country, universities, query, setQuery, onUniversitySelect, onNationalBureau }) {
  return (
    <div className="flex flex-col gap-8">
      <LevelHeader
        icon={Flag}
        eyebrow="Vue pays"
        title={country.name}
        subtitle={country.summary}
        metrics={[
          `${country.universities.length} université(s)`,
          `${country.bureau.length} membre(s) bureau national`
        ]}
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-black">Universités disponibles</h2>
        <SearchBox value={query} onChange={setQuery} placeholder="Rechercher une université..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {universities.map((university) => (
          <button key={university.id} onClick={() => onUniversitySelect(university.id)} className="glass-panel rounded-2xl p-5 text-left cursor-pointer group">
            <Building2 className="w-6 h-6 text-accent-secondary" />
            <h3 className="text-xl font-black mt-4">{university.name}</h3>
            <p className="text-sm text-text-secondary mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {university.city}
            </p>
            <div className="flex items-center justify-between mt-5">
              <span className="text-[10px] uppercase tracking-widest font-black text-text-muted">{university.clubs.length} club(s)</span>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-secondary transition-colors" />
            </div>
          </button>
        ))}
      </div>
      <PrimaryFooterButton icon={Crown} label="Voir le Bureau National" onClick={onNationalBureau} />
    </div>
  );
}

function UniversityView({ university, clubs, query, setQuery, onClubSelect, onUniversityLeaders }) {
  return (
    <div className="flex flex-col gap-8">
      <LevelHeader
        icon={GraduationCap}
        eyebrow="Vue université"
        title={university.name}
        subtitle={`Campus ${university.city}. Retrouvez les clubs actifs et les responsables FIERI de cette université.`}
        metrics={[`${university.clubs.length} club(s)`, `${university.leaders.length} responsable(s)`]}
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-black">Clubs FIERI de l’université</h2>
        <SearchBox value={query} onChange={setQuery} placeholder="Rechercher un club..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {clubs.map((club) => (
          <button key={club.id} onClick={() => onClubSelect(club.id)} className="glass-panel rounded-2xl p-5 text-left cursor-pointer group">
            <Award className="w-6 h-6 text-accent-secondary" />
            <h3 className="text-xl font-black mt-4">{club.name}</h3>
            <p className="text-sm text-text-secondary mt-2">{club.domain}</p>
            <div className="flex flex-wrap gap-2 mt-5">
              <span className="rounded-full bg-accent-primary/15 border border-accent-primary/25 px-3 py-1 text-[10px] uppercase tracking-widest font-black">
                {club.members} membres
              </span>
              <span className="rounded-full bg-accent-secondary/10 border border-accent-secondary/20 px-3 py-1 text-[10px] uppercase tracking-widest font-black">
                Recrutement ouvert
              </span>
            </div>
          </button>
        ))}
      </div>
      <PrimaryFooterButton icon={Users} label="Voir les Responsables de l’Université" onClick={onUniversityLeaders} />
    </div>
  );
}

function ClubView({ club, university, country, onChief, onJoin }) {
  return (
    <div className="flex flex-col gap-7">
      <LevelHeader
        icon={Award}
        eyebrow={`${country.name} · ${university.name}`}
        title={club.name}
        subtitle={club.domain}
        metrics={[`${club.members} membres`, 'Adhésion ouverte']}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <InfoPanel icon={Sparkles} title="Activités du club" text={club.activity} />
        <InfoPanel icon={Vote} title="Décision du peuple" text={club.decision} />
        <InfoPanel icon={Shirt} title="Tricots officiels" text={club.textile} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onChief}
          className="rounded-2xl border border-border-subtle bg-bg-secondary/60 p-5 text-left hover:border-accent-primary/35 transition-all cursor-pointer"
        >
          <Users className="w-5 h-5 text-accent-secondary mb-3" />
          <span className="text-sm font-black">Voir le Responsable du Club</span>
          <p className="text-xs text-text-secondary mt-2">Profil du chef de club et informations de contact.</p>
        </button>
        <button
          onClick={onJoin}
          className="rounded-2xl bg-fieri-blue border border-transparent p-5 text-left text-white hover:bg-fieri-blue/90 transition-all cursor-pointer shadow-[0_12px_35px_rgba(27,111,216,0.28)]"
        >
          <ArrowRight className="w-5 h-5 mb-3" />
          <span className="text-sm font-black">Rejoindre / Intégrer le Club</span>
          <p className="text-xs text-white/80 mt-2">Envoyer une demande d’adhésion au bureau du club.</p>
        </button>
      </div>
    </div>
  );
}

function ChiefView({ club, onBack }) {
  const { hasMinRole } = useAuth();
  const canSeeContacts = hasMinRole('ETUDIANT');

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au club
      </button>
      <article className="glass-panel rounded-2xl p-6">
        <div className="w-14 h-14 rounded-2xl bg-accent-primary/15 border border-accent-primary/25 flex items-center justify-center mb-5">
          <Users className="w-6 h-6 text-accent-secondary" />
        </div>
        <h2 className="text-3xl font-black">{club.chief.name}</h2>
        <p className="text-xs uppercase tracking-widest font-black text-accent-secondary mt-1">{club.chief.role}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <ContactTile
            icon={Phone}
            label="Téléphone"
            value={canSeeContacts ? club.chief.phone : "Connectez-vous en tant qu'étudiant pour afficher"}
          />
          <ContactTile
            icon={Mail}
            label="Email"
            value={canSeeContacts ? club.chief.email : "Connectez-vous en tant qu'étudiant pour afficher"}
          />
        </div>
      </article>
    </div>
  );
}

function JoinView({ club, form, submitted, onBack, onChange, onSubmit }) {
  return (
    <div className="max-w-4xl">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au club
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-5">
        <aside className="glass-panel rounded-2xl p-6 h-fit">
          <h2 className="text-2xl font-black">Intégrer {club.name}</h2>
          <p className="text-sm text-text-secondary mt-3">
            Ce formulaire est une simulation locale pour l’essai. Aucune donnée n’est envoyée à un serveur.
          </p>
          {submitted && (
            <div className="mt-5 rounded-2xl border border-accent-secondary/25 bg-accent-secondary/10 p-4 text-sm text-text-primary">
              Demande enregistrée dans le prototype. Le bureau du club pourra vous contacter.
            </div>
          )}
        </aside>
        <form onSubmit={onSubmit} className="glass-panel rounded-2xl p-6 grid grid-cols-1 gap-4">
          <FormField label="Nom complet" value={form.fullName} onChange={(value) => onChange('fullName', value)} required />
          <FormField label="Email" type="email" value={form.email} onChange={(value) => onChange('email', value)} required />
          <FormField label="Téléphone" value={form.phone} onChange={(value) => onChange('phone', value)} required />
          <FormField label="Filière / spécialité" value={form.field} onChange={(value) => onChange('field', value)} required />
          <label className="grid gap-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-text-muted">Motivation</span>
            <textarea
              value={form.motivation}
              onChange={(event) => onChange('motivation', event.target.value)}
              required
              rows={4}
              className="rounded-2xl bg-bg-primary/70 border border-border-subtle px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-primary/60 transition-colors resize-none"
            />
          </label>
          <button className="mt-2 rounded-full bg-fieri-blue text-white px-6 py-3 text-xs uppercase tracking-widest font-black hover:bg-fieri-blue/90 transition-all cursor-pointer">
            Envoyer la demande
          </button>
        </form>
      </div>
    </div>
  );
}

function LevelHeader({ icon: Icon, eyebrow, title, subtitle, metrics }) {
  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-accent-secondary mb-4">
            <Icon className="w-4 h-4" />
            {eyebrow}
          </div>
          <h2 className="text-3xl md:text-5xl font-black leading-tight">{title}</h2>
          <p className="text-sm md:text-base text-text-secondary mt-4">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <span key={metric} className="rounded-full border border-border-subtle bg-white/5 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-text-secondary">
              {metric}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoPanel({ icon: Icon, title, text }) {
  return (
    <article className="glass-panel rounded-2xl p-5">
      <Icon className="w-6 h-6 text-accent-secondary" />
      <h3 className="text-lg font-black mt-4">{title}</h3>
      <p className="text-sm text-text-secondary mt-3 leading-relaxed">{text}</p>
    </article>
  );
}

function ContactTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-primary/50 p-4">
      <Icon className="w-4 h-4 text-accent-secondary mb-3" />
      <div className="text-[10px] uppercase tracking-widest font-black text-text-muted">{label}</div>
      <div className="text-sm font-bold mt-1 break-words">{value}</div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] uppercase tracking-widest font-black text-text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="rounded-full bg-bg-primary/70 border border-border-subtle px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-primary/60 transition-colors"
      />
    </label>
  );
}

function PrimaryFooterButton({ icon: Icon, label, onClick }) {
  return (
    <div className="flex justify-center pt-2">
      <button
        onClick={onClick}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-fieri-blue text-white px-6 py-3 text-xs uppercase tracking-widest font-black hover:bg-fieri-blue/90 transition-all cursor-pointer shadow-[0_10px_30px_rgba(27,111,216,0.24)]"
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    </div>
  );
}
