# Guide d'Accessibilité pour NextVoyage

Ce document identifie les problèmes d'accessibilité actuels dans l'application NextVoyage et propose des solutions simples pour améliorer l'expérience des utilisateurs en situation de handicap.

## Problèmes identifiés et solutions

### 1. Navigation au clavier

**Problèmes :**
- Absence de "skip to content" pour contourner la navigation
- Focus visuel insuffisant ou inexistant
- Structure de navigation non optimisée pour les lecteurs d'écran

**Solutions :**
```html
<!-- Ajouter au début de la barre de navigation -->
<a href="#main-content" class="skip-to-content">Aller au contenu principal</a>

<!-- Ajouter à l'élément main -->
<main id="main-content">
  <!-- contenu de la page -->
</main>
```

```css
/* Style pour le lien "skip to content" */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: white;
  padding: 8px 15px;
  z-index: 1000;
  transition: top 0.3s ease;
}

.skip-to-content:focus {
  top: 0;
}

/* Améliorer la visibilité du focus */
a:focus, button:focus, input:focus, select:focus, textarea:focus {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
}
```

### 2. Attributs ARIA et rôles

**Problèmes :**
- Manque d'attributs ARIA pour les éléments interactifs
- Rôles non définis pour les éléments de navigation

**Solutions :**
```html
<!-- Navigation -->
<nav role="navigation" aria-label="Navigation principale">
  <!-- contenu de la navigation -->
</nav>

<!-- Bouton hamburger -->
<button 
  aria-expanded="false" 
  aria-label="Ouvrir le menu"
  class="hamburger-button"
>
  <!-- Icône -->
</button>
```

### 3. Images et contenu visuel

**Problèmes :**
- Images sans attributs alt
- Placeholders sans texte alternatif

**Solutions :**
```jsx
{/* Images avec Next/Image */}
<Image 
  src={imagePath} 
  alt={`Image représentant ${name}`} 
  fill 
  style={{ objectFit: 'cover' }}
/>

{/* Placeholders */}
<div className="placeholder-image" aria-label="Aucune image disponible">
  <span className="placeholder-text">{name.charAt(0)}</span>
</div>
```

### 4. Formulaires et champs de saisie

**Problèmes :**
- Labels manquants ou non associés aux champs
- Instructions insuffisantes pour les champs complexes

**Solutions :**
```jsx
{/* Association correcte label et champ */}
<label htmlFor="image-upload">Image</label>
<input 
  type="file" 
  id="image-upload" 
  accept="image/*" 
  aria-describedby="image-help"
/>
<div id="image-help" className="help-text">
  Formats acceptés: JPG, PNG, WebP. Taille maximale: 5MB
</div>
```

### 5. Contraste de couleurs

**Problèmes :**
- Texte gris clair sur fond sombre avec contraste insuffisant
- Texte de notification avec contraste faible

**Solutions :**

Améliorer les variables CSS pour assurer un meilleur contraste :

```css
:root {
  /* Variables de couleurs améliorées pour l'accessibilité */
  --text: #F0F0F0; /* Au lieu de #E0E0E0 */
  --text-light: #BDBDBD; /* Au lieu de #9E9E9E */
  --error: #f44336; /* Rouge plus vif pour les erreurs */
}

/* Augmenter l'opacité des textes sur les arrière-plans colorés */
.card-content {
  background: rgba(0, 0, 0, 0.8); /* Au lieu de 0.5 */
}
```

### 6. Structure des documents

**Problèmes :**
- Hiérarchie des titres non respectée
- Attribut lang non spécifié

**Solutions :**
```jsx
// Dans le fichier layout.jsx
<html lang="fr">
  {/* ... */}
</html>

// Dans les composants de carte
<div className="card-content">
  <h3 className="card-title">{name}</h3> {/* Utiliser h3 au lieu de div */}
  <p className="card-description">{description}</p>
</div>
```

### 7. Composants interactifs

**Problèmes :**
- Éléments non nativement interactifs utilisés comme boutons
- Zones cliquables trop petites

**Solutions :**
```jsx
{/* Utiliser des boutons pour les éléments cliquables */}
<button 
  onClick={handleClick}
  className="action-button"
  aria-label="Supprimer l'élément"
>
  <span className="icon">×</span>
</button>

{/* CSS pour améliorer la taille des zones cliquables */}
.action-button {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
}
```

## Mise en œuvre progressive

Il est recommandé d'implémenter ces améliorations d'accessibilité progressivement, en commençant par :

1. **Priorité haute** : 
   - Ajouter les attributs `alt` à toutes les images
   - Améliorer les contrastes de couleurs 
   - Associer correctement les labels aux champs de formulaire

2. **Priorité moyenne** :
   - Ajouter un "skip to content" link
   - Améliorer les styles de focus
   - Corriger la structure des titres

3. **Priorité basse** :
   - Ajouter les attributs ARIA avancés
   - Améliorer l'accessibilité des composants interactifs complexes

## Outils de test recommandés

- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [Axe DevTools](https://www.deque.com/axe/)
- Test manuel avec lecteur d'écran (NVDA ou VoiceOver)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Chrome DevTools)

## Standards à respecter

- [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/)
- [RGAA 4.1](https://www.numerique.gouv.fr/publications/rgaa-accessibilite/) (standard français) 