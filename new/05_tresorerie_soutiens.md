# FIERI — Module 5 : Trésorerie & Formulaires de Soutiens

Ce module définit la gestion financière universitaire par le Trésorier, l'intégration des flux de paiement (financiers) et le processus de traitement des soutiens physiques et matériels.

---

## 1. Grand Livre de Trésorerie Universitaire

Le **Trésorier** gère la trésorerie de son université (recettes et dépenses) :
- **Recettes :** Cotisations des membres, dons financiers des partenaires, subventions obtenues.
- **Dépenses :** Financement d'événements, achat de matériel pour les Cités, frais logistiques.
- **Recalcul automatique :** Chaque transaction met à jour instantanément le solde global de l'université.

---

## 2. Formulaire de Soutien Multi-Options

Pour faciliter les contributions externes, un formulaire unifié permet aux donateurs et partenaires de soumettre leurs offres d'aide. L'utilisateur doit choisir entre deux types de soutiens :

### 2.1 Soutien Financier (Passerelle de paiement)
- Saisie des informations du donateur et du montant.
- **Intégration financière (En cours de réflexion) :** La solution *Genius Pay* (ou autre processeur à confirmer) sera utilisée pour le traitement sécurisé des paiements.
- À la validation de la transaction par le processeur, le solde de la trésorerie universitaire est automatiquement incrémenté et un reçu est envoyé par e-mail au donateur.

### 2.2 Soutien Physique / Matériel (Signature par scan d'empreinte digitale)
Si le soutien est matériel (locaux, logistique, équipement, etc.) :
1. Le partenaire sélectionne l'option physique et décrit la nature de son offre.
2. **Interface de signature d'empreinte (Recherche en cours) :** 
   - L'utilisateur accède à une interface de signature visuellement soignée intégrant un capteur d'empreinte digitale stylisé en CSS (effet holographique, animation de balayage laser).
   - L'utilisateur appose et maintient son doigt sur la zone interactive (sur écran tactile ou via clic prolongé sur PC) pour simuler la capture de son empreinte.
   - Le système génère un reçu PDF officiel d'entente de soutien intégrant la signature visuelle et un hash de sécurité unique, envoyé automatiquement par e-mail aux deux parties.

---

## 3. Spécifications Techniques

### 3.1 Modélisation Prisma (Trésorerie & Soutiens)
```prisma
model TreasuryAccount {
  id           String   @id @default(uuid())
  universityId Int      @unique
  university   University @relation(fields: [universityId], references: [id])
  balance      Int      @default(0) // Montant en monnaie locale (ex: FCFA)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model TreasuryTransaction {
  id            String   @id @default(uuid())
  universityId  Int
  university    University @relation(fields: [universityId], references: [id])
  type          String   // "COTISATION" | "DON" | "SUBVENTION" | "DEPENSE"
  amount        Int      // Positif pour les recettes, négatif pour les dépenses
  label         String
  recordedById  Int
  recordedBy    Member   @relation(fields: [recordedById], references: [id])
  createdAt     DateTime @default(now())
}

model SupportOffer {
  id                String   @id @default(uuid())
  donorName         String
  donorEmail        String
  type              String   // "FINANCIAL" | "PHYSICAL"
  financialPlatform String?  // ex: "GENIUS_PAY"
  physicalType      String?  // "MATERIEL" | "LOCAUX" | "LOGISTIQUE" | "AUTRE"
  amount            Int?     // Si financier
  description       String
  signatureDocUrl   String?  // Document de reçu signé (PDF stocké)
  fingerprintHash   String?  // Hash sécurisé de validation de l'empreinte/signature
  status            String   @default("PENDING") // "PENDING" | "VALIDATED" | "REJECTED"
  createdAt         DateTime @default(now())
}
```

### 3.2 Endpoints API requis
- `GET /universities/:id/treasury` (Accès : Trésorier / Chef Universitaire)
- `POST /universities/:id/treasury/transactions` (Accès : Trésorier)
- `POST /support/initiate-financial` (Public - Initialisation don)
- `POST /support/payment-webhook` (Public - Callback paiement)
- `POST /support/submit-physical` (Public - Déclaration don physique)
- `POST /support/:id/sign-biometric` (Public/Partenaire - Enregistrement signature d'empreinte)
