# Les fichiers de configuration dans NextVoyage

Ce document explique le rôle et l'importance des différents fichiers de configuration utilisés dans l'application NextVoyage. Comprendre ces fichiers est essentiel pour gérer correctement l'environnement de développement et personnaliser le comportement de l'application.

## 1. `.env.local` - Variables d'environnement

Le fichier `.env.local` contient les variables d'environnement de l'application. Ces variables ne sont pas versionnées dans Git (elles sont listées dans `.gitignore`), ce qui permet de stocker des informations sensibles comme les identifiants de base de données.

```
DB_HOST=localhost
DB_USER=nextvoyageplususr
DB_PASSWORD=nextvoyageplususr
DB_NAME=nextvoyageplus
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Rôle de chaque variable

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` : Paramètres de connexion à la base de données MySQL
- `NEXT_PUBLIC_API_URL` : URL de base pour les appels d'API (le préfixe `NEXT_PUBLIC_` rend cette variable accessible côté client)

### Comment les utiliser

Dans le code serveur, accédez aux variables avec `process.env.NOM_VARIABLE` :

```javascript
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'nextvoyageplususr',
  // ...
};
```

Dans le code client, seules les variables commençant par `NEXT_PUBLIC_` sont accessibles :

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

## 2. `jsconfig.json` - Configuration JavaScript

Ce fichier aide l'éditeur de code (comme VS Code) à comprendre la structure du projet et active des fonctionnalités comme l'autocomplétion et la navigation entre fichiers.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Fonctionnalités principales

- **Alias de chemins** : La configuration `"@/*": ["./src/*"]` permet d'utiliser l'alias `@` pour référencer le dossier `src`. Ainsi, au lieu d'écrire des chemins relatifs complexes comme `../../../components/Button`, vous pouvez simplement écrire `@/components/Button`.

### Avantages

- Simplification des imports
- Réduction des erreurs liées aux chemins relatifs
- Meilleure expérience de développement avec l'autocomplétion

## 3. `next.config.mjs` - Configuration de Next.js

Ce fichier configure le comportement spécifique du framework Next.js. Il s'agit d'un fichier JavaScript qui exporte un objet de configuration.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  env: {
    DB_HOST: process.env.DB_HOST,
    // ...autres variables
  },
  images: {
    remotePatterns: [/* ... */],
  },
  async headers() {
    return [/* ... */];
  },
  // ...autres configurations
};

export default nextConfig;
```

### Sections principales

- **compiler** : Configuration du compilateur Next.js
- **env** : Expose des variables d'environnement au client
- **images** : Configuration de l'optimisation d'images (domaines autorisés, etc.)
- **headers** : En-têtes HTTP pour améliorer la sécurité
- **api** : Configuration des API routes (taille maximale des requêtes, etc.)
- **experimental** : Fonctionnalités expérimentales de Next.js

### Importance

Ce fichier permet de personnaliser profondément le comportement de Next.js pour répondre aux besoins spécifiques de l'application (sécurité, performance, fonctionnalités).

## 4. `package.json` - Gestion des dépendances

Ce fichier est le cœur de tout projet Node.js. Il définit les métadonnées du projet, les scripts et surtout les dépendances.

```json
{
  "name": "appvoyage",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cookie": "^1.0.2",
    "dotenv": "^16.4.7",
    // ...autres dépendances
  }
}
```

### Sections principales

- **name, version** : Identifie le projet
- **scripts** : Commandes exécutables avec `npm run [script]`
- **dependencies** : Bibliothèques requises pour le fonctionnement de l'application

### Dépendances clés dans NextVoyage

- **next, react, react-dom** : Le cœur du framework Next.js et React
- **bcryptjs, jsonwebtoken** : Gestion de l'authentification
- **mysql2** : Connecteur pour la base de données MySQL
- **formidable** : Traitement des formulaires avec upload de fichiers

### Scripts importants

- **dev** : Lance le serveur de développement (`npm run dev`)
- **build** : Compile l'application pour la production (`npm run build`)
- **start** : Démarre l'application en mode production (`npm run start`)

## 5. `package-lock.json` - Verrouillage des versions

Ce fichier volumineux est généré automatiquement et enregistre les versions exactes de toutes les dépendances et sous-dépendances installées.

### Importance

- Garantit que tous les développeurs et environnements utilisent exactement les mêmes versions
- Évite les problèmes de "ça marche sur ma machine"
- Ne devrait jamais être modifié manuellement

## Cas d'utilisation courants

### Ajouter une nouvelle dépendance

```bash
npm install nouvellelibrairie
```

Cette commande ajoute la librairie dans `package.json` et met à jour `package-lock.json`.

### Modifier la configuration Next.js

Si vous souhaitez ajouter un nouveau domaine pour les images, modifiez `next.config.mjs` :

```javascript
images: {
  remotePatterns: [
    // Configuration existante
    {
      protocol: 'https',
      hostname: 'nouveau-domaine.com',
      port: '',
      pathname: '/**',
    },
  ],
},
```

### Ajouter une variable d'environnement

1. Ajoutez la variable dans `.env.local`
2. Si elle doit être accessible côté client, ajoutez-la dans `next.config.mjs` :

```javascript
env: {
  NOUVELLE_VARIABLE: process.env.NOUVELLE_VARIABLE,
  // ...autres variables existantes
},
```

## Conclusion

Les fichiers de configuration sont essentiels pour le bon fonctionnement et la personnalisation de l'application NextVoyage. Ils permettent de :

- Gérer les environnements (développement, production)
- Personnaliser le comportement du framework
- Organiser les dépendances
- Améliorer l'expérience de développement

Quand vous rencontrez un problème ou souhaitez modifier le comportement de l'application, ces fichiers sont souvent votre premier point d'arrêt. 