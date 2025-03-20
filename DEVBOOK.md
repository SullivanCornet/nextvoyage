# DEVBOOK - AppVoyage

## Phase 1: Configuration de la base de données

- Mise en place de la base de données SQL (MySQL)
- Configuration des connexions à la base de données
- Création des tables initiales: `users`, `countries`, `places`, `reviews`

## Phase 2: Implémentation de l'authentification et gestion des rôles

### Fonctionnalités implémentées

1. **Authentification complète**
   - [x] Création des APIs d'authentification (register, login, logout, me)
   - [x] Sécurisation avec JWT et cookies HttpOnly
   - [x] Protection des routes selon le statut d'authentification
   - [x] Pages de connexion et d'inscription avec validation des formulaires

2. **Gestion de rôles**
   - [x] Système de rôles (user, moderator, admin)
   - [x] Vérification des rôles pour l'accès aux fonctionnalités
   - [x] Interface d'administration pour les modérateurs/administrateurs

3. **Interfaces utilisateur**
   - [x] Barre de navigation dynamique selon le statut d'authentification
   - [x] Page de profil utilisateur
   - [x] Page de modération pour la gestion des utilisateurs

### Structure du système d'authentification

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.js       # API de connexion
│   │       ├── logout/
│   │       │   └── route.js       # API de déconnexion
│   │       ├── me/
│   │       │   └── route.js       # API pour récupérer l'utilisateur courant
│   │       └── register/
│   │           └── route.js       # API d'inscription
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.jsx           # Page de connexion
│   │   └── register/
│   │       └── page.jsx           # Page d'inscription
│   ├── contexts/
│   │   └── AuthContext.jsx        # Contexte d'authentification
│   ├── moderation/
│   │   └── page.jsx               # Page de modération (admin/moderator)
│   └── profile/
│       └── page.jsx               # Page de profil utilisateur
├── components/
│   └── Navbar.jsx                 # Barre de navigation avec gestion de l'authentification
└── lib/
    ├── auth.js                    # Utilitaires d'authentification (JWT, hachage)
    └── db.js                      # Connexion à la base de données
```

### Rôles et permissions

| Rôle       | Permissions |
|------------|-------------|
| user       | - Voir et créer des avis<br>- Modifier/supprimer ses propres avis<br>- Consulter son profil |
| moderator  | - Toutes les permissions de 'user'<br>- Accéder à l'espace de modération<br>- Modérer les avis (approuver/refuser/supprimer)<br>- Désactiver/activer les comptes utilisateur |
| admin      | - Toutes les permissions de 'moderator'<br>- Gérer les rôles des utilisateurs<br>- Ajouter/modifier/supprimer des pays et lieux<br>- Accès complet à toutes les fonctionnalités |

### Flux d'authentification

1. **Inscription**
   - L'utilisateur saisit ses informations (nom, email, mot de passe)
   - Validation des informations côté client et serveur
   - Vérification de l'unicité de l'email
   - Hashage du mot de passe et enregistrement dans la base de données
   - Génération d'un JWT et définition du cookie
   - Redirection vers la page d'accueil avec l'utilisateur connecté

2. **Connexion**
   - L'utilisateur saisit son email et mot de passe
   - Vérification des informations dans la base de données
   - Vérification du mot de passe hashé
   - Génération d'un JWT et définition du cookie
   - Redirection vers la page d'accueil avec l'utilisateur connecté

3. **Authentification persistante**
   - Vérification du JWT à chaque requête
   - Récupération des informations utilisateur via l'API `/api/auth/me`
   - Mise à jour du contexte d'authentification

4. **Déconnexion**
   - Suppression du cookie JWT
   - Réinitialisation du contexte d'authentification
   - Redirection vers la page d'accueil

## Phase 3: Développement des fonctionnalités principales

- Implémentation des CRUD pour les pays, lieux et avis
- Mise en place des filtres et de la recherche
- Création des interfaces utilisateur pour l'exploration des pays et lieux
- Implémentation du système d'avis et de notation

## Phase 4: Finalisation et déploiement

- Tests et débogage
- Optimisation des performances
- Documentation complète
- Déploiement en production

---

## Utilisation du système d'authentification

### Configuration du JWT et des cookies

```javascript
// lib/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Signer un token JWT
export function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Vérifier un token JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hacher un mot de passe
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Vérifier un mot de passe
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
```

### Utilisation du Contexte d'Authentification

```jsx
// Dans n'importe quel composant
import { useAuth } from '@/app/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, hasRole, logout } = useAuth();

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Bienvenue, {user.name}!</p>
          {hasRole('admin') && <p>Vous avez accès à l'administration</p>}
          <button onClick={logout}>Déconnexion</button>
        </>
      ) : (
        <p>Veuillez vous connecter</p>
      )}
    </div>
  );
}
```

### Prochaines étapes

1. Mise en œuvre de l'authentification à deux facteurs (2FA)
2. Intégration des connexions via réseaux sociaux (OAuth)
3. Gestion des mots de passe oubliés
4. Notifications par email pour les actions importantes (création de compte, modification de mot de passe, etc.)
5. Amélioration de la sécurité (rate limiting, protection CSRF, etc.) 