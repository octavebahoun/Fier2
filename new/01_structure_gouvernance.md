# FIERI — Module 1 : Structure, Rôles & Gouvernance

Ce module définit la hiérarchie organisationnelle de la communauté FIERI, la gestion des permissions basées sur des rôles scopés, le processus de suppression contrôlée de compte et la gestion des attestations officielles.

---

## 1. Modèle de Référence Hiérarchique

```
GOUVERNANT INTERNATIONAL          (coordonne TOUS les pays)
   └─ GOUVERNANT DE PAYS (xN)     (contrôle les chefs d'un pays)
        └─ CHEF UNIVERSITAIRE (xN par pays)
             ├─ SECRETAIRE        (recensement mensuel, compilation des rapports, attestations)
             ├─ TRESORIER         (gestion de l'argent, Genius Pay)
             ├─ RESP. COMMUNICATION (image FIERI, annonces, publications réseaux sociaux)
             └─ CLUB (xN) -> CITE dans l'interface
                  └─ RESPONSABLE DE CLUB
```

### 1.1 Rôles & Scopage Dynamique (Décision validée)
Les permissions ne sont plus globales mais associées à des entités géographiques ou structurelles spécifiques. Un utilisateur dispose d'un profil de base (ex: Étudiant, Chercheur, Étudiant Chercheur) et peut porter un ou plusieurs postes administratifs simultanément (ex: Trésorier + Secrétaire).
- **Gouverneur Pays :** Autorité sur son `countryId`.
- **Chef Universitaire, Secrétaire, Trésorier, Resp. Comm :** Autorité sur leur `universityId`.
- **Responsable de Club :** Autorité sur son `clubId`.

---

## 2. Processus Métiers & Workflows (Décisions validées)

### 2.1 Flux d'Exclusion / Suspension Immédiate d'Accès
Lorsqu'un Responsable de Club décide d'exclure un membre :
1. Le Responsable clique sur "Exclure le membre".
2. **Suspension immédiate :** Le champ `deletionRequested` passe à `true` sur la fiche du membre. Ses accès à l'application sont immédiatement bloqués (déconnexion forcée et rejet des requêtes API).
3. **Notification & Validation :** Le Chef Universitaire reçoit une notification de demande de suppression sur son tableau de bord.
   - **S'il valide :** Le compte est définitivement supprimé ou archivé.
   - **S'il refuse :** Le champ `deletionRequested` repasse à `false` et les accès du membre sont instantanément rétablis.

```
[Resp. Club : Demande exclusion] ──(Bloque l'accès membre)──▶ [Chef Universitaire]
                                                                    ├── (Valide) ──▶ [Suppression]
                                                                    └── (Refuse) ──▶ [Restauration]
```

### 2.2 Émission & Signature des Attestations
Le **Chef Universitaire** est l'autorité signataire officielle. 
1. **Signature enregistrée :** Le Chef Universitaire téléverse l'image de sa signature manuscrite sécurisée dans son profil.
2. **Génération PDF :** Lors de l'émission d'une attestation (formation, mandat), le backend génère dynamiquement un PDF incluant le nom du bénéficiaire, la date, l'objet et la signature officielle.
3. **Distribution :** Le document est stocké dans la table `Certificate` et le membre reçoit une notification lui permettant de le télécharger directement sur son profil.

---

## 3. Spécifications Techniques (Backend & DB)

### 3.1 Schéma Prisma
```prisma
model Member {
  id                  Int             @id @default(autoincrement())
  // ...champs existants (nom, email, role global)...
  universityId        Int?
  university          University?     @relation(fields: [universityId], references: [id])
  countryId           Int?
  country             Country?        @relation(fields: [countryId], references: [id])
  
  countryPost         CountryPost?
  universityPost      UniversityPost?
  clubMemberships     ClubMembership[]
  projectLeads        Project[]       @relation("ProjectChief")
  certificatesIssued  Certificate[]   @relation("CertificateIssuer")
  certificatesReceived Certificate[]  @relation("CertificateRecipient")

  // Exclusions temporaires / Suppressions
  deletionRequested   Boolean         @default(false)
  deletionReason      String?
  deletionRequestedBy Int?            // ID du membre initiateur (ex: responsable club)
}

model CountryPost {
  id        String   @id @default(uuid())
  countryId Int
  country   Country  @relation(fields: [countryId], references: [id])
  memberId  Int      @unique
  member    Member   @relation(fields: [memberId], references: [id])
  post      String   // "GOUVERNANT_PAYS"
}

model UniversityPost {
  id           String     @id @default(uuid())
  universityId Int
  university   University @relation(fields: [universityId], references: [id])
  memberId     Int        @unique
  member       Member     @relation(fields: [memberId], references: [id])
  post         String     // "CHEF_UNIVERSITAIRE" | "SECRETAIRE" | "TRESORIER" | "RESP_COMMUNICATION"
}

model Certificate {
  id           String     @id @default(uuid())
  recipientId  Int
  recipient    Member     @relation("CertificateRecipient", fields: [recipientId], references: [id])
  issuerId     Int
  issuer       Member     @relation("CertificateIssuer", fields: [issuerId], references: [id])
  title        String
  category     String     // "FORMATION" | "MANDAT" | "PROJET"
  fileUrl      String     // Lien vers le PDF généré
  createdAt    DateTime   @default(now())
}
```

### 3.2 Endpoints API requis & Guards
- **`ScopedGuard` NestJS** : Intercepte les requêtes et compare le scope de la ressource (`universityId`, `clubId` ou `countryId`) avec les posts (`UniversityPost`, `ClubMembership`, `CountryPost`) de l'utilisateur connecté.
- `POST /members/:id/request-deletion` (Gardé par : Responsable Club / Admin)
- `POST /members/:id/confirm-deletion` (Gardé par : Chef Universitaire / Admin)
- `POST /universities/:id/certificates` (Gardé par : Chef Universitaire)
- `GET /members/:id/certificates` (Public/Membre connecté)
