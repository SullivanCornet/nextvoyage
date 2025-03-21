# Styles CSS

Ce dossier contient tous les fichiers CSS utilisés dans l'application. L'organisation des fichiers est la suivante :

## Structure des fichiers

- `index.css` - Point d'entrée qui importe tous les autres fichiers CSS et la police Montserrat de Google Fonts.
- `globals.css` - Contient les variables CSS, les styles globaux et les classes utilitaires utilisées dans toute l'application.
- `navbar.css` - Styles spécifiques à la barre de navigation.
- `cards.css` - Styles pour les cartes et autres composants réutilisables (grilles, boutons, états vides, etc.).
- `pages.css` - Styles spécifiques aux différentes pages de l'application.

## Usage

Pour utiliser ces styles, il suffit d'importer le fichier `index.css` dans le fichier `layout.jsx` :

```jsx
import "@/styles/index.css";
```

## Variables CSS

Les variables CSS sont définies dans le fichier `globals.css` et sont inspirées du design sombre fourni dans le fichier `travel-guide-design2.html`. Les principales variables sont :

```css
:root {
  --primary: #2196F3;
  --primary-dark: #1976D2;
  --secondary: #FF9800;
  --dark: #121212;
  --dark-light: #1E1E1E;
  --card-bg: #2D2D2D;
  --text: #E0E0E0;
  --text-light: #9E9E9E;
  --text-dark: #FFFFFF;
  --white: #FFFFFF;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  --card-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  --hover-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}
```

Ces variables peuvent être utilisées dans n'importe quel fichier CSS ou style inline pour assurer une cohérence visuelle dans toute l'application.

## Composants sans styled-jsx

Les composants qui utilisaient styled-jsx ont été modifiés pour utiliser les classes CSS définies dans les fichiers CSS. Par exemple :

- `Navbar.jsx` - Utilise les classes CSS définies dans `navbar.css`.
- `LoadingSpinner.jsx` - Utilise les classes CSS définies dans `cards.css`.
- `NoDataMessage.jsx` - Utilise les classes CSS définies dans `cards.css`.

Cette approche améliore la lisibilité du code et évite la duplication des styles. 