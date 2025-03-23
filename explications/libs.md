# Les utilitaires du dossier lib dans NextVoyage

Ce document explique en détail le fonctionnement des différents fichiers utilitaires présents dans le dossier `lib` de notre application NextVoyage. Ces fichiers contiennent des fonctions essentielles qui permettent à notre application de fonctionner correctement.

## 1. Base de données (`db.js`)

Le fichier `db.js` gère toutes les interactions avec la base de données MySQL. C'est le cœur du stockage de données de notre application.

### Fonctionnement

- **Connexion à la base de données** : Utilise `mysql2/promise` pour créer un "pool" de connexions, permettant de réutiliser efficacement les connexions.

```javascript
// Configuration de la connexion
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'nextvoyageplususr',
  password: process.env.DB_PASSWORD || 'nextvoyageplususr',
  database: process.env.DB_NAME || 'nextvoyageplus',
  // autres options...
};

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);
```

- **Exécution de requêtes** : La fonction `executeQuery` permet d'exécuter des requêtes SQL avec des paramètres.

- **Fonctions CRUD (Create, Read, Update, Delete)** :
  - `getById` : Récupère un élément par son ID
  - `getAll` : Récupère tous les éléments d'une table
  - `insert` : Insère un nouvel élément dans une table
  - `update` : Met à jour un élément existant
  - `remove` : Supprime un élément

### Exemple d'utilisation

Pour récupérer tous les pays de notre application :

```javascript
import { getAll } from '@/lib/db';

async function getAllCountries() {
  try {
    const countries = await getAll('countries', {}, 100);
    return countries;
  } catch (error) {
    console.error('Erreur lors de la récupération des pays:', error);
    throw error;
  }
}
```

## 2. Authentification (`authUtils.js`, `jwtUtils.js`, `cookieUtils.js`, `sessionUtils.js`)

Ces fichiers travaillent ensemble pour gérer tout le système d'authentification de notre application.

### `authUtils.js` - Hachage des mots de passe

Ce fichier utilise la bibliothèque `bcryptjs` pour hacher et vérifier les mots de passe de manière sécurisée.

```javascript
// Hacher un mot de passe
export async function hashPassword(password) {
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);
  return hashedPassword;
}

// Vérifier un mot de passe
export async function comparePassword(password, hashedPassword) {
  return await bcryptjs.compare(password, hashedPassword);
}
```

### `jwtUtils.js` - Tokens d'authentification

Gère la création et la vérification des tokens JWT (JSON Web Tokens) qui permettent d'authentifier les utilisateurs.

```javascript
// Créer un token JWT
export function createToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY // 7 jours
  });
  
  return token;
}

// Vérifier un token JWT
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}
```

### `cookieUtils.js` - Gestion des cookies

S'occupe de stocker, récupérer et supprimer le token d'authentification dans les cookies du navigateur.

```javascript
// Enregistrer le token dans les cookies
export function setAuthCookie(token) {
  Cookies.set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
}

// Récupérer le token des cookies
export function getAuthCookie() {
  return Cookies.get(AUTH_COOKIE_NAME);
}

// Supprimer le token des cookies
export function removeAuthCookie() {
  Cookies.remove(AUTH_COOKIE_NAME);
}
```

### `sessionUtils.js` - Gestion des sessions

Utilise les tokens JWT pour créer une session utilisateur sans avoir besoin d'une table sessions en base de données.

```javascript
// Récupérer la session utilisateur
export function getSession(req) {
  try {
    const token = req ? getAuthToken(req) : getAuthTokenFromAppRouter();
    
    if (!token) {
      return null;
    }
    
    const userData = verifyToken(token);
    const { exp, iat, ...userSession } = userData;
    return userSession;
  } catch (error) {
    return null;
  }
}
```

## 3. Gestion des uploads (`fileUpload.js`, `uploadHandler.js`, `uploadService.js`)

Ces fichiers permettent de gérer le téléchargement et le stockage des images (photos de pays, villes, lieux à visiter, etc.).

### `fileUpload.js` - Configuration et fonctions de base

Définit la configuration de base pour les téléchargements de fichiers et fournit des fonctions utilitaires.

```javascript
// Configuration
export const fileUploadConfig = {
  uploadDir: path.join(process.cwd(), 'public/uploads/images'),
  keepExtensions: true,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

// Vérifier et créer le répertoire d'upload si nécessaire
export const ensureUploadDirExists = () => {
  if (!fs.existsSync(fileUploadConfig.uploadDir)) {
    fs.mkdirSync(fileUploadConfig.uploadDir, { recursive: true });
  }
};

// Déplacer un fichier téléchargé vers son emplacement final
export const moveUploadedFile = (file, entityType, entityId) => {
  // Code pour renommer et déplacer le fichier
  // Retourne le chemin relatif du fichier
};
```

### `uploadHandler.js` - Traitement des formulaires avec images

Utilise la bibliothèque `formidable` pour gérer les formulaires multipart qui contiennent des images.

```javascript
// Traiter un formulaire avec une image
export async function processFormWithImage(req, subdirectory = 'places') {
  // Vérifier les répertoires
  // Configurer formidable
  // Traiter le formulaire
  // Retourner les champs et les fichiers
}
```

### `uploadService.js` - Service d'upload moderne

Version améliorée utilisant l'API FormData de Next.js 13+ pour gérer les téléchargements de fichiers.

```javascript
// Valider un fichier
export function validateFile(file) {
  // Vérifier le type MIME
  // Vérifier l'extension
  // Vérifier la taille
}

// Télécharger une image
export async function uploadImage(formData, fileField = 'image', subdirectory = 'places', prefix = '') {
  // Récupérer l'image du formulaire
  // Valider le fichier
  // Créer un nom unique
  // Sauvegarder le fichier
  // Retourner les informations
}

// Supprimer un fichier
export function deleteFile(filePath) {
  // Vérifier si le fichier existe
  // Supprimer le fichier
}
```

## Comment ces utilitaires fonctionnent ensemble

1. **Cycle d'une requête standard** :
   - L'utilisateur accède à une page (ex: liste des pays)
   - Next.js charge le composant React pour cette page
   - Le composant appelle une fonction qui utilise `db.js` pour récupérer les données

2. **Cycle d'authentification** :
   - L'utilisateur se connecte avec ses identifiants
   - `authUtils.js` vérifie le mot de passe
   - `jwtUtils.js` crée un token JWT
   - `cookieUtils.js` stocke ce token dans les cookies
   - À chaque requête, `sessionUtils.js` vérifie ce token pour authentifier l'utilisateur

3. **Cycle d'upload d'image** :
   - L'utilisateur remplit un formulaire avec une image (ex: ajouter une ville)
   - Le formulaire est envoyé à l'API
   - `uploadService.js` traite l'image, la valide et la sauvegarde
   - Le chemin de l'image est enregistré en base de données via `db.js`

## Conseils pour les développeurs débutants

- **Modifiez `db.js` avec précaution** : C'est le cœur de l'accès aux données, toute erreur peut affecter l'ensemble de l'application.
- **Attention aux chemins d'upload** : Assurez-vous que les répertoires d'upload existent et ont les bonnes permissions.
- **Sécurité des tokens JWT** : Ne modifiez jamais la clé secrète en production sans planifier une migration.

## Conclusion

Les utilitaires du dossier `lib` sont les fondations techniques de l'application NextVoyage. Ils fournissent les services essentiels pour la gestion des données, l'authentification et le stockage de fichiers. En comprenant comment ces fichiers fonctionnent, vous serez mieux équipé pour maintenir et améliorer l'application. 