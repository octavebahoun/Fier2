# FIERI — Guide de Spécifications Complexes & Hors-Scope

Ce document fournit des spécifications détaillées, des architectures techniques et des guides d'implémentation étape par étape pour les modules jugés complexes, nécessitant des intégrations de services tiers ou des recherches approfondies. Ce guide est destiné à orienter le développement de ces fonctionnalités.

---

## 🧭 Sommaire
1. [Intégration de la Passerelle de Paiement (Genius Pay)](#1-intégration-de-la-passerelle-de-paiement-genius-pay)
2. [Interface Tactile et Signature par Scan d'Empreinte Digitale](#2-interface-tactile-et-signature-par-scan-dempreinte-digitale)
3. [Publication Automatique Native sur les Réseaux Sociaux (OAuth & APIs)](#3-publication-automatique-native-sur-les-réseaux-sociaux-oauth-apis)
4. [Génération d'Attestations Officielles et Signature PDF en Backend](#4-génération-dattestations-officielles-et-signature-pdf-en-backend)
5. [Module de Challenges (Créés par les Responsables de Club)](#5-module-de-challenges-créés-par-les-responsables-de-club)

---

## 1. Intégration de la Passerelle de Paiement (Genius Pay)

Le but de cette intégration est de collecter les dons et cotisations financières directement depuis la plateforme FIERI et d'incrémenter le solde de la trésorerie de l'université concernée.

### 🛠️ Choix Techniques & Architecture
- **Type d'intégration :** Redirection sécurisée (Checkout hosted page).
- **Backend :** Contrôleur NestJS dédié `src/modules/support/support.controller.ts`.
- **Base de données :** Mise à jour de `TreasuryAccount` (solde) et création d'une `TreasuryTransaction` liée.

### 📋 Workflow détaillé
```
[Donateur] --(Saisit montant + clique Don)--> [Backend FIERI] --(Initie Genius Pay Session)--> [Genius Pay Checkout Page]
                                                                                                        │
[Trésorerie Universitaire Créditée] <--(Webhook confirmation)-- [Backend FIERI] <--(Règlement réussi)--┘
```

### 👣 Étapes d'implémentation pour le développeur
1. **Création du client API Genius Pay :**
   Développer un service NestJS `GeniusPayService` chargé de :
   - Générer le token de session.
   - Envoyer la requête `POST /v1/checkout/sessions` avec les informations du donateur, le montant, la devise (ex: FCFA ou EUR) et les URLs de redirection (`successUrl`, `cancelUrl`).
2. **Implémentation de l'URL de Redirection :**
   Créer une route `POST /support/initiate-financial` renvoyant l'URL de paiement fournie par Genius Pay. Le frontend effectue une redirection `window.location.href = session.checkoutUrl`.
3. **Sécurisation du Webhook :**
   - Créer la route `POST /support/geniuspay-webhook`.
   - **Critère de sécurité :** Valider la signature du webhook dans les headers (clé de signature partagée stockée dans `.env`) pour empêcher l'injection de fausses requêtes de confirmation.
   - Extraire les métadonnées (`universityId`, `memberId`, `amount`).
   - Mettre à jour en transaction SQL (Prisma `$transaction`) :
     1. Incrémentation de `TreasuryAccount.balance`.
     2. Création de `TreasuryTransaction` (type `DON`).
     3. Passage du statut de `SupportOffer` à `VALIDATED`.

---

## 2. Interface Tactile et Signature par Scan d'Empreinte Digitale

Ce module gère le consentement des donateurs physiques (matériel, locaux) à travers une signature par "scan d'empreinte" visuel, puis l'envoi d'un reçu d'entente signé par e-mail.

### 🛠️ Choix Techniques & Architecture
- **Frontend :** Composant React `src/components/home/FingerprintScanner.jsx` utilisant CSS / SVG interactif (animations de balayage laser).
- **Backend :** Service de génération de hash cryptographique pour sécuriser la signature, couplé à un service d'envoi d'e-mails (ex: Nodemailer ou SendGrid).

### 📋 Workflow détaillé
1. Le donateur physique décrit son offre (ex : "5 ordinateurs portables").
2. Il clique sur **"Signer par empreinte digitale"**.
3. Une fenêtre modale affiche un lecteur d'empreinte digitale. 
4. L'utilisateur maintient son doigt appuyé sur la zone pendant 3 secondes. Une animation de "scan vert" s'exécute.
5. À la fin du temps d'appui, le frontend capture :
   - Les coordonnées de l'appareil (User-Agent, IP publique approximative).
   - Le timestamp exact.
6. Le backend combine ces données pour générer un **Hash unique de consentement** (`SHA-256`) représentant l'empreinte numérique.
7. Un PDF d'entente de soutien est généré avec ce Hash écrit en guise de signature cryptographique, et envoyé au partenaire par e-mail.

### 👣 Étapes d'implémentation pour le développeur
1. **Création du composant Scanner (Frontend) :**
   - Utiliser des événements `onMouseDown` / `onTouchStart` pour lancer le chronomètre (3 secondes) et déclencher l'animation de scan laser CSS.
   - Si l'utilisateur relâche avant 3 secondes, réinitialiser l'animation.
2. **Sécurisation et signature (Backend) :**
   - Créer le endpoint `POST /support/:id/sign-biometric`.
   - Générer le hash : `hash = SHA256(supportOfferId + ip + userAgent + timestamp)`.
   - Enregistrer ce `fingerprintHash` dans la table `SupportOffer`.
3. **Génération PDF et Envoi :**
   - Créer un reçu PDF reprenant les détails de l'offre et mentionnant : *"Signé numériquement par scan d'empreinte le [date] - ID de Transaction : [hash]"*.
   - Envoyer automatiquement le PDF en pièce jointe au donateur via le service de messagerie.

---

## 3. Publication Automatique Native sur les Réseaux Sociaux (OAuth & APIs)

Permet de lier le profil du Chef de Communication aux comptes officiels de la communauté pour publier automatiquement les événements validés sur YouTube, LinkedIn et Meta.

### 🛠️ Choix Techniques & Architecture
- **Stockage sécurisé :** Modèle Prisma `SocialAccount` stockant les tokens OAuth cryptés (AES-256) pour chaque université.
- **Workflow OAuth 2.0 :** Écrans de consentement pour l'autorisation des applications tierces.

### 📋 Workflow de Connexion OAuth
```
Chef Comm ──(Clic Connecter LinkedIn)──▶ Redirection vers LinkedIn Auth ──▶ Retour avec Code Authorization
                                                                                  │
Stockage des tokens chiffrés ◀── Échange du code contre Access/Refresh Token ◀────┘
```

### 👣 Étapes d'implémentation pour le développeur
1. **Création du flux OAuth (OAuth Redirect Handlers) :**
   - Implémenter des routes NestJS pour initier et intercepter les callbacks OAuth de chaque plateforme (ex: `/social/auth/linkedin`, `/social/auth/meta`).
   - Demander les Scopes requis : `w_member_social` (LinkedIn), `publish_to_groups` / `pages_manage_posts` (Meta), `youtube.force-ssl` (Google/YouTube).
2. **Sécurité des Tokens :**
   - Chiffrer l'accestoken et le refreshtoken en base de données avec `crypto` (AES-256-GCM) en utilisant une clé secrète stockée dans `.env`.
3. **Moteur de Publication (Job/Queue) :**
   - Créer un service de publication `SocialPublisherService`.
   - À la validation d'un événement, le service récupère les tokens chiffrés de l'université.
   - S'ils sont expirés, utiliser le `refreshToken` pour obtenir un nouvel `accessToken`.
   - Appeler les APIs REST des plateformes :
     - **LinkedIn API :** `POST https://api.linkedin.com/v2/ugcPosts`
     - **Meta Graph API :** `POST https://graph.facebook.com/{page-id}/feed`
     - **YouTube API :** `POST https://www.googleapis.com/youtube/v3/liveBroadcasts` (si événement en direct).

---

## 4. Génération d'Attestations Officielles et Signature PDF en Backend

Permet au Chef Universitaire de délivrer des attestations de formation ou de mandat de manière dynamique sous format PDF infalsifiable.

### 🛠️ Choix Techniques & Architecture
- **Génération PDF :** Utiliser `@react-pdf/renderer` (si génération côté front) ou des packages backend comme `pdfkit` / `handlebars + puppeteer-core` (recommandé pour la fidélité de rendu HTML vers PDF côté NestJS).
- **Stockage :** Enregistrement des fichiers PDF sur un dossier statique public du serveur ou sur un bucket Cloud (ex. AWS S3).

### 👣 Étapes d'implémentation pour le développeur
1. **Profil de signature (Chef Universitaire) :**
   - Créer une route `POST /members/upload-signature` permettant au Chef Universitaire de téléverser l'image détourée (`PNG` transparent) de sa signature manuscrite.
2. **Moteur de Template d'Attestation (Backend) :**
   - Concevoir un template HTML soigné (bordure officielle FIERI, logo, texte de certification, emplacement pour la signature et le QR code de vérification).
3. **Génération & Enregistrement :**
   - Utiliser `pdfkit` pour compiler le document en y incrustant :
     - Le nom de l'étudiant.
     - Le titre de la formation/du poste.
     - La signature transparente du Chef Universitaire en bas de page.
     - Un identifiant unique de certificat imprimé sur le document.
   - Sauvegarder le fichier généré et renvoyer le lien URL.

---

## 5. Module de Challenges (Créés par les Responsables de Club)

Ce module permet la création de défis scientifiques ou communautaires (Challenges) par les responsables de club pour stimuler la recherche et l'innovation au sein de la Cité.

### 🛠️ Spécifications du Workflow
1. **Création :** Le Responsable de Club définit un Challenge (Titre, description du problème, consignes de rendu, barème, date limite et récompenses/badges associés).
2. **Participation :** Les membres de la Cité s'inscrivent individuellement ou en équipe et soumettent leur solution (fichiers PDF, dépôt de code GitHub, etc.) avant la date limite.
3. **Évaluation :** Le Responsable de Club (ou un jury désigné) évalue les soumissions en attribuant des notes et des commentaires depuis l'interface.
4. **Clôture :** Les gagnants reçoivent automatiquement le badge de réussite configuré lors de la création du challenge.

### 👣 Structure de Table Recommandée (Prisma)
```prisma
model Challenge {
  id           String             @id @default(uuid())
  title        String
  description  String
  rules        String
  rewardBadgeId String?           // Badge lié (existant)
  dueDate      DateTime
  clubId       String
  club         Club               @relation(fields: [clubId], references: [id])
  submissions  ChallengeSubmission[]
  createdAt    DateTime           @default(now())
}

model ChallengeSubmission {
  id           String    @id @default(uuid())
  challengeId  String
  challenge    Challenge @relation(fields: [challengeId], references: [id])
  memberId     Int
  member       Member    @relation(fields: [memberId], references: [id])
  fileUrl      String    // Lien vers le rendu
  grade        Int?      // Note attribuée
  feedback     String?   // Commentaire du jury
  createdAt    DateTime  @default(now())
}
```
