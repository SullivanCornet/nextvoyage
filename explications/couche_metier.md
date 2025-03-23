# La couche métier dans NextVoyage

## Qu'est-ce que la couche métier ?

La **couche métier** (ou "business layer" en anglais) est la partie de l'application qui contient la logique spécifique à votre domaine d'activité. C'est le cœur fonctionnel de votre application qui implémente les règles métier, les processus et les opérations spécifiques à votre domaine (ici, le voyage).

Dans NextVoyage, la couche métier est distribuée entre plusieurs fichiers et dossiers, principalement dans :

## 1. Les services (`/src/services`)

Le dossier `services` contient la logique métier de haut niveau qui permet aux composants React de communiquer avec les APIs et effectuer des opérations complexes.

### `api.js`

Ce fichier centralise toutes les opérations métier liées à l'API :

```javascript
// API pour les pays
export const countriesAPI = {
  getAll: async () => { ... },
  getBySlug: async (slug) => { ... },
  create: async (data) => { ... },
  update: async (id, data) => { ... },
  delete: async (id) => { ... },
  getCities: async (slug) => { ... },
};

// API pour les villes
export const citiesAPI = {
  getAll: async () => { ... },
  getByCountry: async (countryId) => { ... },
  // ...
};

// API pour les lieux (commerces, restaurants, lieux à visiter)
export const placesAPI = {
  // ...
};
```

Ces services encapsulent la logique métier comme :
- La structure des données à envoyer à l'API
- La vérification des réponses
- Le formatage des données pour l'affichage
- La gestion des erreurs

## 2. Les gestionnaires d'API (`/src/app/api`)

Les "route handlers" de Next.js dans le dossier `api` contiennent la logique métier côté serveur :

### `/api/countries/route.js`

```javascript
// POST /api/countries
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Vérification métier : champs requis
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Les champs nom et slug sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Préparation des données selon les règles métier
    const countryData = {
      name: data.name,
      slug: data.slug,
      // ...autres champs avec valeurs par défaut
    };
    
    // Création en base de données
    const country = await insert('countries', countryData);
    
    return NextResponse.json(country, { status: 201 });
  } catch (error) { /* Gestion d'erreurs */ }
}
```

Cette partie contient la logique critique comme :
- La validation des données entrantes
- L'application des règles métier (ex: valeurs par défaut, formatage)
- Les vérifications d'intégrité (ex: un pays doit exister avant d'y ajouter une ville)
- La gestion des erreurs spécifiques au domaine

## 3. Les utilitaires métier (`/src/lib`)

Bien que les fichiers dans `lib` soient principalement des utilitaires techniques, certains contiennent de la logique métier importante :

### `uploadService.js`

Ce fichier ne se contente pas de gérer l'upload technique, il implémente aussi des règles métier :

```javascript
export function validateFile(file) {
  // Règles métier : types de fichiers acceptés pour les images de voyage
  const isValidType = uploadConfig.allowedTypes.includes(file.type);
  // Règles métier : taille maximale des images de voyage
  if (file.size > uploadConfig.maxFileSize) {
    // ...
  }
  // ...
}
```

## Comment la couche métier interagit avec les autres couches

Dans une architecture typique de NextVoyage :

1. **Couche de présentation** (composants React)
   - Interagit avec l'utilisateur
   - Appelle les services de la couche métier

2. **Couche métier** (services, API handlers)
   - Implémente la logique métier
   - Valide les données
   - Gère les cas d'erreur spécifiques au domaine
   - Coordonne les opérations complexes

3. **Couche d'accès aux données** (utilitaires db.js)
   - Communique avec la base de données
   - Effectue des opérations CRUD de base sans logique métier

## Exemple de flux complet à travers les couches

Prenons l'exemple de l'ajout d'une ville :

1. **Couche de présentation** : Le composant `AddCityForm` recueille les données et appelle `citiesAPI.createWithImage(formData)`

2. **Couche métier - Service** : Dans `api.js`, la fonction `createWithImage` prépare les données et appelle l'API

3. **Couche métier - API Handler** : Dans `/api/cities/route.js`, la fonction POST :
   - Valide que tous les champs requis sont présents
   - Vérifie que le pays existe (règle métier d'intégrité)
   - Traite l'image (règle métier sur le format)
   - Formate les données selon les règles métier

4. **Couche d'accès aux données** : Les fonctions de `db.js` sont appelées pour insérer les données en base

5. **Retour à travers les couches** : Le résultat remonte à l'interface utilisateur

## Conclusion

La couche métier dans NextVoyage est distribuée entre les fichiers de services (`/src/services`), les gestionnaires d'API (`/src/app/api`), et certains utilitaires (`/src/lib`). 

C'est cette couche qui contient la "valeur ajoutée" de l'application - les règles qui définissent comment les voyages, pays, villes et lieux doivent être structurés, validés et interagir entre eux.

Si vous souhaitez modifier le comportement métier de l'application (comme ajouter un type de lieu, changer les règles de validation, etc.), c'est principalement dans ces fichiers que vous devrez intervenir. 