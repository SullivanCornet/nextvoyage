# Structure de l'application NextVoyage

Ce document explique de façon simple comment est organisée notre application NextVoyage et le rôle de chaque partie importante.

## Vue d'ensemble

NextVoyage est une application web construite avec **Next.js**, un framework basé sur React qui permet de créer des sites web modernes. L'application permet aux utilisateurs de découvrir des pays, des villes et des lieux à visiter lors de leurs voyages.

## Structure des dossiers

L'application est organisée en plusieurs dossiers principaux dans le répertoire `src/` :

```
src/
├── app/               # Pages de l'application et API routes
├── components/        # Composants réutilisables
├── lib/               # Fonctions utilitaires et services
├── services/          # Services pour les opérations complexes
└── styles/            # Fichiers CSS et styles
```

## Rôle des éléments principaux

### 1. Le dossier `app/`

C'est le cœur de notre application, qui contient :

- **`page.jsx`** : La page d'accueil qui montre les destinations populaires
- **`layout.jsx`** : Le squelette commun à toutes les pages (avec la barre de navigation et le pied de page)
- **`countries/`** : Tout ce qui concerne les pays (liste, détails, ajout, modification)
- **`auth/`** : Pages de connexion et d'inscription
- **`api/`** : Points d'entrée pour les données (ce qui permet à notre site de communiquer avec la base de données)
- **`contexts/`** : Stockage de données globales comme l'authentification

### 2. Le dossier `components/`

Contient les "pièces détachées" réutilisables qui composent l'interface :

- **`Navbar.jsx`** : La barre de navigation en haut de chaque page
- **`CountryCard.jsx`** : Les "cartes" qui affichent un pays
- **`CityCard.jsx`** : Les "cartes" qui affichent une ville
- **`LoadingSpinner.jsx`** : L'animation de chargement
- **`CurrencyConverter.jsx`** : Le convertisseur de devises
- **`NoDataMessage.jsx`** : Message affiché quand il n'y a pas de données

### 3. Le dossier `lib/`

Contient des fonctions utilitaires qui aident à faire fonctionner l'application :

- **`db.js`** : Connexion à la base de données
- **`fileUpload.js`** : Gestion du téléchargement d'images
- **`authUtils.js`** : Fonctions pour l'authentification
- **`jwtUtils.js`** : Gestion des tokens de sécurité
- **`cookieUtils.js`** : Gestion des cookies pour garder l'utilisateur connecté

### 4. Le dossier `styles/`

Contient tous les styles CSS qui donnent à l'application son apparence :

- **`index.css`** : Point d'entrée qui importe tous les autres fichiers CSS
- **`globals.css`** : Styles globaux et variables de couleur
- **`navbar.css`** : Styles pour la barre de navigation
- **`cards.css`** : Styles pour les cartes et composants réutilisables

## Flux de données et fonctionnement général

Voici comment tout fonctionne ensemble :

1. **L'utilisateur visite une page** (par exemple, la liste des pays)
2. **Next.js charge la page** depuis le dossier `app/countries/`
3. **La page fait une requête à l'API** pour obtenir les données (pays, villes, etc.)
4. **L'API communique avec la base de données** grâce aux fonctions dans `lib/db.js`
5. **Les données sont retournées à la page** qui utilise des composants du dossier `components/` pour les afficher
6. **Les styles dans `styles/`** sont appliqués pour rendre tout joli

## Architecture visuelle

```
┌───────────────────────────────────────────────────────────┐
│                        FRONTEND                           │
│  ┌─────────────┐   ┌─────────────┐    ┌─────────────┐    │
│  │  Page Home  │   │ Page Pays   │    │ Page Villes │    │
│  └─────────────┘   └─────────────┘    └─────────────┘    │
│           │               │                 │             │
│           └───────────────┼─────────────────┘             │
│                           │                               │
│                  ┌──────────────────┐                     │
│                  │    Composants    │                     │
│                  └──────────────────┘                     │
└───────────────────────────┬───────────────────────────────┘
                           │
┌───────────────────────────┴───────────────────────────────┐
│                         API                               │
│  ┌─────────────┐   ┌─────────────┐    ┌─────────────┐    │
│  │  Countries  │   │    Cities   │    │    Places   │    │
│  └─────────────┘   └─────────────┘    └─────────────┘    │
│           │               │                 │             │
│           └───────────────┼─────────────────┘             │
│                           │                               │
│                  ┌──────────────────┐                     │
│                  │  Base de données │                     │
│                  └──────────────────┘                     │
└───────────────────────────────────────────────────────────┘
```

## Fonctionnalités principales

Notre application permet de :

1. **Parcourir des pays et des villes** : Découvrir des destinations de voyage
2. **Consulter des lieux à visiter** : Voir les attraits touristiques, restaurants, etc.
3. **Ajouter du contenu** : Pour les utilisateurs connectés, ajouter des pays, villes et lieux
4. **Convertir des devises** : Calculer les équivalences entre monnaies
5. **S'authentifier** : Se connecter pour accéder à plus de fonctionnalités

## Conclusion

Cette architecture en couches (interface utilisateur → API → base de données) est typique des applications web modernes. Elle permet de séparer clairement les responsabilités et facilite le développement et la maintenance.

Pour découvrir plus en détail comment fonctionne chaque partie (hooks React, props, etc.), consultez les autres documents d'explication. 