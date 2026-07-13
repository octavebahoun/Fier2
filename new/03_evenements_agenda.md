# FIERI — Module 3 : Événements, Agenda & Notifications

Ce module définit la gestion du calendrier communautaire, le suivi des présences, l'accès administratif aux listes de participants, le système de notifications et l'automatisation des annonces sur les réseaux sociaux.

---

## 1. Fonctionnalités Événementielles

### 1.1 Historique des Événements
L'interface des événements est scindée en deux vues distinctes :
- **Événements à venir (Agenda) :** Prochains ateliers, bootcamps, hackathons et réunions planifiés.
- **Historique des événements :** Archive complète des événements passés, permettant de consulter les détails, les résumés et les indicateurs de participation.

### 1.2 Liste des Inscrits & Participants
- Pour chaque événement de l'université, le **Responsable de la Communication** et le **Chef Universitaire** disposent d'un accès complet à la liste des inscrits pour gérer les capacités d'accueil ou effectuer des suivis.
- Les présences effectives (`attended: true`) sont renseignées par l'organisateur à la fin de l'événement et alimentent le profil du membre.

---

## 2. Workflows & Automatisation (Décisions validées)

### 2.1 Double Notification de Participation
Le système génère des notifications automatiques dès qu'un membre s'inscrit :
1. **Notification In-App :** Une alerte instantanée sous forme de cloche apparaît dans l'interface de l'utilisateur.
2. **E-mail de confirmation :** Envoi d'un e-mail contenant les détails de l'événement et un **fichier d'invitation agenda `.ics`** permettant d'intégrer l'événement en un clic dans Google Calendar, Outlook ou Apple Calendar.

### 2.2 Publication automatique Native (Option B validée)
Pour maximiser la visibilité de la communauté, un système de connexion API natif est développé dans NestJS :
1. **Connexion OAuth :** Le **Chef de Communication** dispose d'un écran de paramétrage dans son profil pour lier les comptes officiels de l'université (Google/YouTube, LinkedIn, Meta/Facebook/Instagram) via l'obtention sécurisée de tokens OAuth de longue durée.
2. **Remontée d'événements :** Le Responsable de Club crée un événement et le soumet au Chef de Communication.
3. **Publication en un clic :** Lorsque le Chef de Communication valide l'événement pour diffusion, le backend NestJS consomme nativement les SDKs et APIs des réseaux concernés pour y publier automatiquement le post d'annonce.

---

## 3. Spécifications Techniques

### 3.1 Modélisation Prisma (Mises à jour)
```prisma
model Event {
  id             String              @id @default(uuid())
  title          String
  description    String
  date           DateTime
  endDate        DateTime?
  clubId         String?
  club           Club?               @relation(fields: [clubId], references: [id])
  universityId   Int
  university     University          @relation(fields: [universityId], references: [id])
  isPublished    Boolean             @default(false)
  socialShared   Boolean             @default(false)
  registrations  EventRegistration[]
  createdAt      DateTime            @default(now())
}

model EventRegistration {
  id        String   @id @default(uuid())
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id])
  memberId  Int
  member    Member   @relation(fields: [memberId], references: [id])
  attended  Boolean  @default(false)
  createdAt DateTime @default(now())
}

// Modèle pour le stockage des tokens OAuth de publication du Chef de Comm
model SocialAccount {
  id           String   @id @default(uuid())
  universityId Int
  platform     String   // "YOUTUBE" | "LINKEDIN" | "META"
  accessToken  String
  refreshToken String?
  expiresAt    DateTime?
  updatedAt    DateTime @updatedAt
}
```

### 3.2 Endpoints API requis
- `GET /events` (Filtres : `upcoming`, `past`, `universityId`, `clubId`)
- `GET /events/:id/registrants` (Gardé par : RESP_COMM / CHEF_UNIV / Admin)
- `POST /events/:id/register` (Accès : Membre connecté)
- `POST /events/:id/mark-attendance` (Gardé par : Responsable Club / Organisateur)
- `POST /social/auth/:platform` (Connexion OAuth pour le Chef de Comm)
- `POST /events/:id/publish-socials` (Déclenchement manuel de la publication par le Chef de Comm)
