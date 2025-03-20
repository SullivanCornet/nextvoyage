# AppVoyage

Application de voyages pour découvrir et planifier des visites de lieux.

## Fonctionnalités principales

- Parcourir les pays, villes et lieux à visiter
- Ajouter de nouveaux lieux à visiter
- Système complet de gestion des images
- Interface utilisateur intuitive et responsive







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

- moi seul