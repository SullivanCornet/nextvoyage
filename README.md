# AppVoyage

Application de voyages pour découvrir et planifier des visites de lieux.

## Fonctionnalités principales

- Parcourir les pays, villes et lieux à visiter
- Ajouter de nouveaux lieux à visiter
- Système complet de gestion des images
- Interface utilisateur intuitive et responsive

## Résolution des problèmes d'upload d'images

Nous avons implémenté plusieurs améliorations pour résoudre les problèmes d'upload d'images :

### 1. Nouvelle implémentation d'upload direct

- **Approche FormData native** : Utilisation de l'API `FormData` native de Next.js au lieu de la bibliothèque `formidable` qui posait des problèmes de compatibilité avec les `NextRequest`.
- **Gestion simplifiée du flux** : Lecture directe des données FormData avec `request.formData()` sans avoir à gérer de transformation de flux.
- **Création de `/api/direct-upload`** : Endpoint simplifié pour les uploads d'images sans dépendance externe.

### 2. Gestion robuste des répertoires

- **Vérification automatique des répertoires** : Création de la fonction `ensureUploadDirectories()` qui vérifie et crée tous les répertoires nécessaires.
- **Test d'accès en écriture** : Vérification que le serveur a les permissions d'écrire dans les répertoires d'upload.
- **Structure organisée** : Utilisation d'une structure claire pour les uploads (`/public/uploads/places`).

### 3. Traitement des fichiers amélioré

- **Noms de fichiers uniques** : Utilisation de `randomUUID()` et timestamps pour créer des noms de fichiers uniques.
- **Validation des types de fichiers** : Vérification des extensions autorisées pour éviter les problèmes de sécurité.
- **Gestion des erreurs enrichie** : Nettoyage des fichiers téléchargés en cas d'échec lors de l'insertion en base de données.

### 4. Outils de diagnostic

- **Centre de diagnostic** : Page centrale avec état de la base de données et des systèmes de fichiers.
- **Page de test d'upload direct** : Interface pour tester l'upload d'images sans passer par la page d'ajout de lieux.
- **Page de test avec formidable** : Interface pour tester et comparer l'upload avec la bibliothèque formidable.
- **Logs détaillés** : Amélioration des logs pour faciliter le débogage.

### 5. Correction des erreurs de base de données

- **Alignement des noms de colonnes** : Utilisation cohérente de `image_path` au lieu de `image`.
- **Correctifs pour les requêtes préparées** : Amélioration des requêtes pour l'insertion des données.

## Installation

```bash
npm install
```

## Configuration

- Vérifiez que le dossier `public/uploads/places` existe et est accessible en écriture
- La base de données SQLite est utilisée par défaut

## Démarrage

```bash
npm run dev
```

## Tests de diagnostic

Pour vérifier que les uploads fonctionnent correctement :

1. Accédez à `/diagnostic` pour voir l'état général du système
2. Testez l'upload direct via `/direct-upload`
3. Testez l'upload avec formidable via `/test-upload`
4. Essayez d'ajouter un lieu via `/places/add`

## Contributeurs

- Équipe AppVoyage 