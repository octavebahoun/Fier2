# FIERI — Module 2 : Espace Club (Cité) & Annuaire responsive

Ce module définit l'espace membre au sein des clubs (Cités), la structuration de l'annuaire de la communauté et le processus de recensement administratif.

---

## 1. Espace Club (Cité) pour l'Étudiant Membre (Décision validée)

Tout étudiant membre d'un club accède à un espace personnalisé regroupant :
1. **La Fiche de la Cité (Club) :** Description, thématiques de recherche, historique, contacts et liste des membres du bureau.
2. **Mes Activités Assignées :** Tâches libres créées et assignées par le Responsable de club (ex: aide logistique, préparation d'ateliers, etc.).
3. **Mes Projets & Recherches :** Liste claire des projets de recherche et de développement dans lesquels l'étudiant est activement impliqué. Le tableau de bord affiche côte à côte les tâches opérationnelles simples de la Cité et l'avancement des projets scientifiques auxquels il participe.

---

## 2. Annuaire Responsive & Tri Intelligent

L'annuaire de la communauté permet de retrouver n'importe quel membre actif via un système de filtrage et de tri structuré par niveau géographique et organisationnel :
- **Tri hiérarchique :** `Pays` ➔ `Université` ➔ `Cité (Club)`.
- **Adaptabilité (Responsive CSS) :** L'interface est rendue entièrement responsive, s'adaptant parfaitement aux smartphones (format carte ou liste compacte), tablettes et écrans de bureau.

---

## 3. Remontée administrative & Recensement (Décision validée)

Pour assurer un recensement précis et régulier :
1. **Soumission mensuelle :** Chaque mois, le Responsable de Club clique sur "Soumettre les effectifs du mois" depuis son espace d'administration. Cette action fige la liste des membres actifs à cet instant et l'envoie à la **Secrétaire** de l'université.
2. **Validation Secrétaire :** La Secrétaire dispose d'une page de suivi affichant toutes les Cités de son université. Elle peut consulter l'historique des listes mensuelles soumises, les télécharger (PDF/Excel) et marquer le recensement mensuel comme "Validé administrativement" pour archiver officiellement les effectifs.

```
[Responsable Club] ──(Soumission mensuelle des effectifs)──▶ [Secrétaire] ──▶ [Consulation / Export PDF / Validation]
```

---

## 4. Spécifications Techniques

### 4.1 Modélisation de la relation Club/Membre
```prisma
model ClubMembership {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  memberId        Int
  member          Member    @relation(fields: [memberId], references: [id])
  role            String    @default("MEMBRE") // "MEMBRE" | "RESPONSABLE"
  status          String    @default("PENDING") // "PENDING" | "APPROVED" | "REJECTED"
  interviewAt     DateTime?
  interviewNote   String?
  cardGeneratedAt DateTime?
  createdAt       DateTime  @default(now())
}
```

### 4.2 Tâches & Activités Assignées
```prisma
model AssignedActivity {
  id          String   @id @default(uuid())
  title       String
  description String?
  memberId    Int
  member      Member   @relation(fields: [memberId], references: [id])
  clubId      String
  club        Club     @relation(fields: [clubId], references: [id])
  status      String   @default("TODO") // "TODO" | "IN_PROGRESS" | "DONE"
  dueDate     DateTime?
  createdAt   DateTime @default(now())
}
```

### 4.3 Endpoints API requis
- `GET /clubs/:id/members-list` (Accès : Responsable Club / Secrétaire / Admin)
- `POST /clubs/:id/submit-census` (Figer la liste active et l'envoyer à la Secrétaire)
- `GET /universities/:id/census-history` (Accès : Secrétaire)
- `POST /universities/:id/validate-census/:censusId` (Accès : Secrétaire)
- `GET /members/me/assigned-activities` (Accès : Membre connecté - renvoie les activités opérationnelles + projets actifs)
