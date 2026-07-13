# FIERI — Module 4 : Ergonomie, Landing Page & Journal Carousel

Ce module définit la refonte visuelle de la Landing Page, la modification des terminologies de navigation, l'optimisation de l'expérience utilisateur liée aux carousels et la mise en avant des figures emblématiques.

---

## 1. Terminologie & Navigation (Décision validée)

Pour refléter la structure réelle de la communauté :
- **Onglet Cité / Gouvernance :** L'onglet actuel **Cité** est renommé en **Gouvernance**.
  - **Filtre « Nos figures emblématiques » :** Ajout d'une clé booléenne `isEmblematic: true` sur le modèle `Member` (activable par les administrateurs et chefs universitaires). L'onglet de navigation Gouvernance intègre ce filtre pour afficher spécifiquement les fondateurs et leaders majeurs.
- **Section Clubs :** Toutes les références aux "Clubs" ou "Sections de clubs" sont renommées en **CITE** dans l'interface utilisateur.

---

## 2. Optimisation des Carousels & Compteurs (Décision validée)

- **Pas d'Autoplay :** Le défilement automatique est entièrement désactivé sur toutes les pages de l'application. La navigation dans les carousels se fait exclusivement de manière manuelle pour un meilleur confort de lecture.
- **Correction du compteur d'abonnés :** Le script d'incrémentation/décrémentation dynamique du compteur d'abonnés sur la page de présentation est corrigé pour refléter fidèlement, instantanément et de façon réactive le nombre de membres d'une Cité ou d'une université à chaque adhésion/départ.

---

## 3. Restructuration de la Landing Page (Décision validée)

Afin d'alléger la page d'accueil tout en maintenant une présentation riche, plusieurs sections volumineuses sont regroupées et condensées :

### 3.1 Carousel de toutes les Cités
La section "Clubs en vedettes" est remplacée par un grand carousel horizontal regroupant **l'intégralité des Cités (clubs) définies** sur la plateforme (navigation manuelle).

### 3.2 Le Journal unifié (Carousel multicritères avec badges)
La section "Appel à participation" de l'accueil est remplacée par un **Journal** dynamique sous forme de carousel :
- **Badges colorés :** Chaque carte du carousel possède un badge distinctif selon sa catégorie (ex : Vert pour `Offre`, Violet pour `Atelier`, Bleu pour `Bootcamp`, Orange pour `Appel`).
- **Filtres rapides intégrés :** Un menu à onglets (`Tout` | `Ateliers` | `Appels` | `Bootcamps` | `Offres`) est positionné au-dessus du carousel pour filtrer les cartes affichées instantanément sans recharger la page.
- La section **Ateliers / Workshops** (auparavant disposée séparément) y est intégrée pour alléger la Landing Page.

### 3.3 Nos Programmes
Le programme "Ambassadeur" est renommé **« Nos Programmes »**. Il regroupe le programme Ambassadeurs, le programme de bénévolat communautaire et les autres initiatives d'implication de FIERI.

### 3.4 Partenaires Commerciaux
Une section dédiée aux partenaires officiels et commerciaux de la communauté est ajoutée sur la page principale pour renforcer la crédibilité institutionnelle.

---

## 4. Spécifications Frontend & DB

### 4.1 Ajout au modèle `Member` (Prisma)
```prisma
model Member {
  // ...autres champs...
  isEmblematic Boolean @default(false) // Permet d'alimenter le filtre "Figures emblématiques"
}
```

### 4.2 Composants clés
- `src/components/home/JournalCarousel.jsx` : Carousel manuel unifié avec gestion des onglets de filtrage et badges colorés.
- `src/pages/Gouvernance.jsx` : Page de gouvernance avec filtre des figures emblématiques (`isEmblematic: true`).
