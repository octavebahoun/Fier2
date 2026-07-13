# FIERI — Plan d'implémentation « Nouvelle Plateforme » (Logiciel de gestion de communauté)

> **Objectif :** faire de **FIERI Research** le logiciel web complet de gestion de la
> communauté FIERI, fidèle à sa vraie hiérarchie organisationnelle et à ses processus
> (adhésions, rapports mensuels, trésorerie, communication, événements, soutiens).
>
> **Décision validée :** on garde FIERI tel quel (base recherche) + stack actuelle
> (React 19 + NestJS + Prisma + PostgreSQL). Aucun changement de framework.
>
> **Périmètre :** les modules communautaires sont requis et redéfinis ci-dessous à
> partir du domaine réel fourni :
> 1. Membres, hiérarchie & rôles (adhésions, exclusions validées, attestations, cartes)
> 2. Événements & agenda (historique, présences, notifications, publications automatisées)
> 3. Rapports d'évolution, indicateurs, challenges & hackathons
> 4. Communication & annonces (onglet Gouvernance, section CITE, journal unifié)
> 5. Trésorerie & Soutiens (Genius Pay / Soutiens physiques par signature numérique d'empreinte)

---

## 0. État des lieux (existant pertinent)

| Élément | Disponible | Note |
|---------|-----------|------|
| Chaîne géographique | ✅ `Country → University → Branch → Member` | `prisma/schema.prisma` : `Member.branchId → Branch.universityId → University.countryId`. La géo est exploitée pour le scopage des rôles et les tris. |
| Auth + rôles | ✅ `ROLE_LEVELS`, `PERMISSIONS`, `can()` | `src/context/AuthContext.jsx`. À étendre pour le scopage dynamique. |
| Membres & promotion | ✅ `PATCH /members/:id/role` | `api.members`. |
| Clubs + adhésions validées | ✅ `ClubMembership` | Étendu avec entretien et carte membre. |
| Projets + équipe | ✅ `Project.team` | Ajouter `chiefId` + rapports d'évolution. |
| Événements + live | ✅ `Event`, `EventRegistration` | Ajouter agenda, historique et présence. |
| News + modération | ✅ | Base pour les annonces. |
| Notifications | ✅ | Relier aux nouveaux workflows (inscriptions, suppressions, rapports). |
| Badges | ✅ | Affichés sur la carte membre. |
| Design system | ✅ glassmorphism + thèmes | `src/index.css`, `src/components/layout/*`. |

---

## 1. Hiérarchie FIERI & Gouvernance (modèle de référence)

```
GOUVERNANT INTERNATIONAL          (coordonne TOUS les pays)
   └─ GOUVERNANT DE PAYS (xN)     (contrôle les chefs d'un pays)
        └─ CHEF UNIVERSITAIRE (xN par pays)
             ├─ SECRETAIRE        (recensement mensuel, compilation des rapports, attestations)
             ├─ TRESORIER         (gestion de l'argent, Genius Pay)
             ├─ RESP. COMMUNICATION (image FIERI, annonces, publications réseaux sociaux)
             └─ CLUB (xN) -> devient "CITE" dans l'interface
                  └─ RESPONSABLE DE CLUB
                       ├─ membres du club (soumission de liste à la secrétaire)
                       ├─ PROJET → CHEF DE PROJET
                       └─ CHALLENGE (créé par le responsable de club)
```

### 1.1 Rôles & scopage
Les rôles deviennent rattachés à un scope dynamique :

| Rôle | Scope | Droits principaux |
|------|-------|-------------------|
| `GOUVERNANT_INTERNATIONAL` | global | Contrôle total de la plateforme. |
| `GOUVERNANT_PAYS` | `countryId` | Contrôle tout dans son pays. |
| `CHEF_UNIVERSITAIRE` | `universityId` | Direction de l'université. Signe et émet les attestations. Valide les suppressions de comptes des membres. |
| `SECRETAIRE` | `universityId` | Recensement des membres, rapports d'université, suivi administratif. |
| `TRESORIER` | `universityId` | Gestion du compte trésorerie, Genius Pay, soutiens financiers. |
| `RESP_COMMUNICATION` | `universityId` | Image, annonces, accès aux listes d'inscrits aux événements, modération locale. |
| `RESPONSABLE_CLUB` | `clubId` | Gestion du club (Cité), création de challenges, demande d'exclusion de membres, programmation d'entretiens. |
| `CHEF_DE_PROJET` | `projectId` | Soumission des rapports d'évolution de projet. |
| `MEMBRE` / `ETUDIANT` | global/club | Participation, consultation de son club, téléchargement de carte. |

### 1.2 Attestations & Certificats
- Le **Chef Universitaire** émet les attestations officielles pour les personnes sous sa juridiction : Secrétaire, Responsable de Communication, Responsables de Club et membres de club (formations, implications).
- Il réalise la création et la signature de ces attestations (à concevoir dans une interface d'édition/génération PDF dédiée).

---

## 2. MODULE 1 — Membres, hiérarchie & rôles (étendu)

### 2.1 Gestion des membres, exclusions et remontées
1. **Remontée de liste :** Le Responsable de Club peut soumettre à tout moment la liste officielle des membres actifs de son club à la **Secrétaire** de l'université pour archivage et recensement.
2. **Exclusion de membres (Flux de suppression contrôlée) :**
   - Le Responsable de Club peut décider d'exclure un membre de son club en demandant la suppression de son compte.
   - Cette suppression n'est **pas immédiate** : elle initie une demande de suppression qui doit être validée/confirmée par le **Chef Universitaire** pour être effective.

```
Resp. Club (Demande exclusion) ──▶ Notification au Chef Universitaire ──▶ Chef Univ valide ──▶ Compte supprimé
```

### 2.2 Modélisation Prisma (Ajouts)
```prisma
model Member {
  id             Int             @id @default(autoincrement())
  // ...champs existants...
  universityId   Int?
  university     University?     @relation(fields: [universityId], references: [id])
  countryId      Int?
  country        Country?        @relation(fields: [countryId], references: [id])
  
  countryPost    CountryPost?
  universityPost UniversityPost?
  clubMemberships ClubMembership[]
  projectLeads   Project[]       @relation("ProjectChief")
  
  // Demandes de suppression de compte
  deletionRequested Boolean      @default(false)
  deletionReason    String?
  deletionRequestedBy Int?        // ID du responsable de club ayant fait la demande
}

model CountryPost {
  id        String   @id @default(uuid())
  countryId Int
  country   Country  @relation(fields: [countryId], references: [id])
  memberId  Int      @unique
  member    Member   @relation(fields: [memberId], references: [id])
  post      String   // GOUVERNANT_PAYS
}

model UniversityPost {
  id           String     @id @default(uuid())
  universityId Int
  university   University @relation(fields: [universityId], references: [id])
  memberId     Int        @unique
  member       Member     @relation(fields: [memberId], references: [id])
  post         String     // CHEF_UNIVERSITAIRE | SECRETAIRE | TRESORIER | RESP_COMMUNICATION
}

model Certificate {
  id           String     @id @default(uuid())
  recipientId  Int
  recipient    Member     @relation("CertificateRecipient", fields: [recipientId], references: [id])
  issuerId     Int
  issuer       Member     @relation("CertificateIssuer", fields: [issuerId], references: [id])
  title        String
  category     String     // FORMATION | POSTE | PROJET
  fileUrl      String
  createdAt    DateTime   @default(now())
}
```

---

## 3. MODULE 1.b — Adhésions, Annuaire & Espace Club (Cité)

### 3.1 Vue globale du Club pour l'Étudiant Membre
Un étudiant membre d'un club doit disposer d'un tableau de bord de son club contenant :
- La vue globale de son club (description, bureau, logo).
- Les **activités et tâches spécifiques qui lui sont assignées**.
- Les **projets et travaux de recherche en cours** au sein du club.

### 3.2 Annuaire responsive et tris multicritères
- La page de l'**Annuaire** doit être rendue entièrement responsive (mobile, tablette, desktop).
- Un tri intelligent et multicritères doit être mis en place : **Pays / Université / Club**.

---

## 4. MODULE 2 — Événements & agenda

### 4.1 Fonctionnalités étendues
1. **Historique des événements :** L'interface doit permettre de basculer entre les événements à venir et l'historique complet des événements passés ayant déjà eu lieu.
2. **Accès aux listes d'inscrits :** Le **Responsable de la Communication** et le **Chef Universitaire** ont un accès direct et permanent à la liste des inscrits pour tout événement ou activité de leur ressort.
3. **Notifications de participation :** Dès qu'un membre s'inscrit ou participe à un événement, il reçoit automatiquement une notification (in-app + email).
4. **Remontée d'événements pour publication automatique :**
   - Le Responsable de Club remonte les événements de son club au **Chef de Communication** de l'université.
   - Le Chef de Communication valide et peut activer la publication automatique via des APIs externes : **Google/YouTube**, **LinkedIn**, **Meta (Instagram & Facebook)** pour générer automatiquement les annonces et publications.

### 4.2 Endpoints mis à jour
| Méthode | Route | Rôle requis | Usage |
|---------|-------|-------------|-------|
| `GET` | `/events/history` | 🔓 | Voir l'historique des événements passés |
| `GET` | `/events/:id/registrants` | 🔒 RESP_COMM / CHEF_UNIV | Liste des inscrits |
| `POST` | `/events/:id/publish-social`| 🔒 RESP_COMM | Déclencher la publication API sur réseaux sociaux |

---

## 5. MODULE 3 — Rapports, Indicateurs, Challenges & Hackathons

### 5.1 Progression & Rapports d'activité
- Le **Responsable de Club** remonte chaque mois les rapports d'activité et travaux de recherche au **Secrétaire**.
- Le **Chef de Projet** publie régulièrement des mises à jour sur le statut des projets jusqu'à leur livraison finale.
- **Compteur d'abonnés :** Correction du bug d'incrémentation pour s'assurer que le compteur de membres/abonnés s'incrémente et se décrémente fidèlement lors des adhésions ou départs.

### 5.2 Challenges & Hackathons
1. **Création des challenges :** Effectuée par le **Responsable de Club** (module complexe d'évaluation, soumission et récompenses).
2. **Création des hackathons :** Créés par les **Chefs Universitaires** et affectés directement aux clubs (Cités) sous leur responsabilité.

---

## 6. MODULE 4 — Communication, Annonces & Landing Page

### 6.1 Refonte de l'interface & Terminologies
1. **Onglet Cité / Gouvernance :** L'onglet actuellement nommé **Cité** est renommé en **Gouvernance**. Un filtre spécifique « Nos figures emblématiques » y est ajouté pour mettre en valeur les fondateurs et leaders.
2. **Section Clubs :** La section actuellement nommée **Clubs** est renommée en **CITE**.
3. **Carousels manuels :** Désactivation complète du défilement automatique (*autoplay*) sur tous les carousels du site. Les utilisateurs doivent naviguer manuellement pour un confort de lecture optimal.

### 6.2 Allègement de la Landing Page (Page principale)
Afin de réduire la surcharge visuelle de la page d'accueil :
- **Clubs en vedette** : Remplacés par un grand carousel contenant **tous les clubs définis**.
- **Appels à participation** : Remplacés par un Journal interactif en carousel.
- **Journal unifié (Carousel)** : Regroupe les appels à participation, les bootcamps, les offres spéciales et la section **Ateliers/Workshops** (auparavant séparée).
- **Programme Ambassadeur** : Remplacé par la section globale **« Nos Programmes »**, regroupant le programme d'ambassadeurs, le bénévolat et autres initiatives de FIERI.
- **Partenaires commerciaux** : Insertion d'une section dédiée visible mettant en valeur les partenaires officiels de la communauté.

---

## 7. MODULE 5 — Trésorerie & Soutiens

### 7.1 Formulaire de Soutien multi-options
Pour soutenir la communauté FIERI, les utilisateurs peuvent proposer un soutien financier ou non-financier via un formulaire de sélection :

1. **Soutien Financier :**
   - Intégration de la solution de paiement **Genius Pay** pour le traitement sécurisé des transactions.
   - Enregistrement immédiat dans le grand livre de trésorerie (`TreasuryTransaction`) rattaché à l'université correspondante.

2. **Soutien Physique / Matériel (Non-financier) :**
   - Formulaire de déclaration du type d'offre matérielle.
   - Processus de validation : notification de l'offre physique, scan d'empreinte digitale pour signature numérique sécurisée, et envoi automatique d'un reçu d'entente de soutien signé par e-mail.

### 7.2 Modèle Prisma étendu
```prisma
model SupportOffer {
  id             String   @id @default(uuid())
  donorName      String
  donorEmail     String
  type           String   // FINANCIAL | PHYSICAL
  financialPlatform String? // GENIUS_PAY
  physicalType   String?  // MATERIEL | LOCAUX | LOGISTIQUE | AUTRE
  amount         Int?     // Si financier
  description    String
  signatureDocUrl String?  // Reçu signé envoyé par mail (si physique, après scan empreinte)
  status         String   // PENDING | VALIDATED | REJECTED
  createdAt      DateTime @default(now())
}
```

---

## 8. Plan de migration & ordre d'exécution mis à jour

1. **Modifications de la Base de Données (Prisma)** :
   - Mise à jour des tables existantes (`Member`, `ClubMembership`, `EventRegistration`).
   - Création des nouvelles tables (`CountryPost`, `UniversityPost`, `Certificate`, `SupportOffer`).
   - Exécution de la migration : `npx prisma migrate dev --name new_fieri_gouvernance`.
2. **Backend — Authentification & Droits** :
   - Extension de la logique de rôles et guards.
   - Validation des requêtes de suppression par le Chef Universitaire.
3. **Backend — Trésorerie & Soutiens** :
   - Intégration de l'API Genius Pay pour les dons financiers.
   - Logique d'émission de reçus signés électroniquement par e-mail pour les dons physiques.
4. **Backend — Événements & Notifications** :
   - Historique des événements passés.
   - Notifications d'inscription et webhook/API pour les réseaux sociaux.
5. **Frontend — Refonte de la Landing Page** :
   - Intégration du Journal (carousel manuel unifié regroupant Bootcamps, Ateliers, Offres et Appels).
   - Affichage de tous les clubs (Cités) en carousel.
   - Intégration des partenaires commerciaux et de "Nos Programmes".
6. **Frontend — Pages Administratives & Profils** :
   - Modification de l'onglet Cité en Gouvernance (avec filtre Figures emblématiques).
   - Annuaire responsive trié par Pays / Université / Club.
   - Interface de gestion d'exclusion et d'attestations pour le Chef Universitaire.

---

## 9. Décisions validées / ouvertes (Mise à jour du 12 Juillet 2026)

### Validées
- **Pas de défilement automatique** : Confort utilisateur garanti par une navigation manuelle sur les carousels. ✅
- **Genius Pay** : Sélectionné comme processeur financier officiel de la plateforme pour la trésorerie. ✅
- **Exclusion de membre** : Validée exclusivement par le Chef Universitaire après demande du responsable du club. ✅

### Ouvertes
- **Scan d'empreinte digitale pour signature** : Définir la méthode technique (intégration d'API d'authentification biométrique WebAuthn ou scan de signature manuscrite tactile).
- **APIs de publication automatique** : Établir la liste finale des plateformes sociales supportées et la gestion de leurs clés d'accès OAuth (YouTube, LinkedIn, Meta).
