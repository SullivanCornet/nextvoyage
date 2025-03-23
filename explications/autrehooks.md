# Les hooks React dans l'application NextVoyage

## Introduction aux hooks

Les hooks sont des fonctions spéciales introduites dans React 16.8 qui permettent d'utiliser des fonctionnalités React (comme l'état, le cycle de vie, le contexte, etc.) dans des composants fonctionnels, sans avoir à écrire des composants de classe.

Après avoir exploré `useState` dans le document précédent, voici les autres hooks importants utilisés dans notre application NextVoyage.

## useEffect - Pour les effets secondaires

### Qu'est-ce que useEffect ?

`useEffect` est l'un des hooks les plus utilisés après `useState`. Il permet d'exécuter du code en réponse à certains événements du cycle de vie du composant, comme :
- Après le premier rendu (équivalent à `componentDidMount`)
- Après chaque mise à jour (équivalent à `componentDidUpdate`) 
- Avant que le composant ne soit détruit (équivalent à `componentWillUnmount`)

### Syntaxe de base

```jsx
useEffect(() => {
  // Code à exécuter après le rendu
  
  return () => {
    // Code de nettoyage (optionnel)
  };
}, [dependances]); // Tableau de dépendances
```

Le tableau de dépendances est très important :
- `[]` : L'effet s'exécute uniquement après le premier rendu
- `[valeur1, valeur2]` : L'effet s'exécute après le premier rendu et chaque fois que l'une des valeurs change
- Omis : L'effet s'exécute après chaque rendu

### Exemple dans notre application

Dans la page de détails d'un pays, nous utilisons `useEffect` pour charger les informations du pays :

```jsx
// src/app/countries/[slug]/page.jsx
useEffect(() => {
  const fetchCountry = async () => {
    try {
      const response = await fetch(`/api/countries/${slug}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations du pays');
      }
      
      const data = await response.json();
      setCountry(data);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };
  
  if (slug) {
    fetchCountry();
  }
}, [slug]); // L'effet est exécuté quand le slug change
```

## useParams - Pour accéder aux paramètres d'URL

### Qu'est-ce que useParams ?

`useParams` est un hook fourni par Next.js qui permet d'accéder aux paramètres dynamiques de l'URL dans les routes de l'application.

### Syntaxe de base

```jsx
const params = useParams();
```

### Exemple dans notre application

Dans la page de détail d'un lieu à visiter, nous utilisons `useParams` pour récupérer les paramètres d'URL :

```jsx
// src/app/countries/[slug]/cities/[citySlug]/lieux-a-visiter/[placeSlug]/page.jsx
const params = useParams();
const { slug, citySlug, placeSlug } = params;
```

Ici, `slug` correspond au pays, `citySlug` à la ville, et `placeSlug` au lieu à visiter. Ces valeurs sont automatiquement extraites de l'URL.

## useRouter - Pour la navigation

### Qu'est-ce que useRouter ?

`useRouter` est un hook fourni par Next.js qui donne accès à l'objet router, permettant de naviguer entre les pages programmatiquement.

### Syntaxe de base

```jsx
const router = useRouter();
```

### Exemple dans notre application

Dans la page de connexion, nous utilisons `useRouter` pour rediriger l'utilisateur après une connexion réussie :

```jsx
// src/app/auth/login/page.jsx
const router = useRouter();

// Dans useEffect pour rediriger après connexion
useEffect(() => {
  if (success) {
    const timer = setTimeout(() => {
      router.push('/'); // Redirection vers la page d'accueil
    }, 1500);
    
    return () => clearTimeout(timer);
  }
}, [success, router]);
```

## useContext - Pour partager des données globalement

### Qu'est-ce que useContext ?

`useContext` permet d'accéder aux données d'un contexte React sans avoir à passer les props manuellement à travers plusieurs niveaux de composants. C'est particulièrement utile pour des données globales comme l'authentification.

### Syntaxe de base

```jsx
const valeur = useContext(MonContexte);
```

### Exemple dans notre application avec l'authentification

Notre application utilise un contexte d'authentification pour gérer l'état de connexion de l'utilisateur :

```jsx
// Définition du contexte (src/app/contexts/AuthContext.jsx)
const AuthContext = createContext();

// Hook personnalisé pour faciliter l'utilisation
export function useAuth() {
  return useContext(AuthContext);
}

// Utilisation dans un composant (src/components/Navbar.jsx)
const { user, logout, isAuthenticated } = useAuth();
```

Ce système permet à n'importe quel composant d'accéder facilement à l'état d'authentification sans avoir à passer ces informations via les props.

## Autres hooks moins fréquemment utilisés

### useRef - Pour accéder aux éléments DOM ou stocker des valeurs mutables

`useRef` crée un objet référence qui persiste pendant toute la durée de vie du composant. Il est souvent utilisé pour :
- Accéder directement à un élément DOM
- Stocker une valeur qui peut changer sans déclencher un nouveau rendu

```jsx
const monRef = useRef(valeurInitiale);
```

### useCallback et useMemo - Pour optimiser les performances

Ces hooks sont utilisés pour mémoriser des fonctions et des valeurs afin d'éviter des calculs inutiles lors des re-rendus.

- `useCallback` mémorise une fonction
- `useMemo` mémorise le résultat d'un calcul

```jsx
// Mémorise une fonction
const fonctionMemorisee = useCallback(() => {
  // Code de la fonction
}, [dependances]);

// Mémorise une valeur calculée
const valeurMemorisee = useMemo(() => {
  // Calcul coûteux
  return resultat;
}, [dependances]);
```

### useReducer - Pour un état plus complexe

`useReducer` est une alternative à `useState` pour gérer des états complexes ou lorsque le prochain état dépend de l'état précédent.

```jsx
const [state, dispatch] = useReducer(reducer, etatInitial);
```

## Conclusion

Les hooks sont au cœur de la programmation React moderne et permettent d'écrire du code plus clair et plus concis. Dans notre application NextVoyage, ils nous aident à :

1. Gérer l'état des composants (`useState`)
2. Effectuer des requêtes API et manipuler le DOM (`useEffect`)
3. Accéder aux paramètres d'URL (`useParams`)
4. Naviguer entre les pages (`useRouter`)
5. Partager l'état d'authentification (`useContext` via `useAuth`)

En maîtrisant ces hooks, vous avez les outils nécessaires pour comprendre et développer des fonctionnalités dans l'application NextVoyage ou toute autre application React/Next.js. 