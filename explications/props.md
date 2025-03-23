# Les Props dans React - Guide pour débutants

## Qu'est-ce que sont les props ?

Les **props** (abréviation de "properties" en anglais, ou "propriétés" en français) sont le moyen principal de transmettre des données d'un composant parent à un composant enfant dans React. Pensez-y comme à des arguments que vous passez à une fonction.

## Une analogie simple

Imaginez les composants React comme des recettes de cuisine :
- Votre application est un livre de recettes complet
- Chaque composant est une recette individuelle
- Les props sont les ingrédients que vous fournissez à chaque recette

Si vous avez une recette pour faire un gâteau (un composant), les ingrédients comme la farine, le sucre, les œufs (les props) peuvent changer à chaque fois que vous faites le gâteau, mais la façon de le préparer (la logique du composant) reste la même.

## Comment fonctionnent les props

### 1. Envoi des props (du parent à l'enfant)

```jsx
// Composant parent
function PagePays() {
  return (
    <div>
      <h1>Découvrez nos destinations</h1>
      
      {/* On envoie des props au composant CarteDestination */}
      <CarteDestination 
        nom="France" 
        capitale="Paris"
        population={67000000}
        imageUrl="/images/france.jpg" 
        estPopulaire={true}
      />
    </div>
  );
}
```

Dans cet exemple :
- `CarteDestination` est le composant enfant
- `nom`, `capitale`, `population`, `imageUrl` et `estPopulaire` sont les props qu'on lui envoie
- Notez que les valeurs textuelles sont entre guillemets, les nombres entre accolades, et les booléens aussi entre accolades

### 2. Réception des props (dans l'enfant)

```jsx
// Composant enfant
function CarteDestination(props) {
  return (
    <div className="carte">
      <img src={props.imageUrl} alt={props.nom} />
      <h2>{props.nom}</h2>
      <p>Capitale: {props.capitale}</p>
      <p>Population: {props.population} habitants</p>
      {props.estPopulaire && <span className="badge">Destination populaire</span>}
    </div>
  );
}
```

À noter :
- Le paramètre `props` reçoit toutes les propriétés envoyées par le parent
- On accède à chaque prop avec la notation `props.nomDeLaProp`
- On peut utiliser les props pour conditionner l'affichage (comme avec `estPopulaire`)

### 3. Destructuration des props (méthode plus élégante)

Une façon plus moderne d'écrire le composant enfant est d'utiliser la destructuration :

```jsx
// Même composant avec destructuration
function CarteDestination({ nom, capitale, population, imageUrl, estPopulaire }) {
  return (
    <div className="carte">
      <img src={imageUrl} alt={nom} />
      <h2>{nom}</h2>
      <p>Capitale: {capitale}</p>
      <p>Population: {population} habitants</p>
      {estPopulaire && <span className="badge">Destination populaire</span>}
    </div>
  );
}
```

C'est exactement le même composant, mais avec un code plus lisible car on accède directement aux noms des props sans avoir à écrire `props.` à chaque fois.

## Caractéristiques importantes des props

### Les props sont en lecture seule

Vous ne pouvez pas modifier les props reçues dans un composant enfant. Si vous essayez de le faire :

```jsx
function CarteDestination(props) {
  // ❌ INCORRECT - Ne modifiez jamais les props directement
  props.nom = "Espagne";  
  
  return <div>{props.nom}</div>;
}
```

React vous avertira avec une erreur. C'est une règle fondamentale : **les props sont en lecture seule**.

### Des props par défaut

Si une prop n'est pas fournie, vous pouvez définir une valeur par défaut :

```jsx
function CarteDestination({ nom, capitale, population = 0, imageUrl, estPopulaire = false }) {
  // population sera 0 si non fournie
  // estPopulaire sera false si non fourni
  
  return (
    <div className="carte">
      {/* Contenu du composant */}
    </div>
  );
}
```

## Exemples concrets de notre application NextVoyage

### Exemple 1 : Liste de pays

```jsx
// Composant parent (page des pays)
export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  
  // Chargement des pays depuis l'API...
  
  return (
    <div className="countries-grid">
      {countries.map(country => (
        <CountryCard 
          key={country.id}
          id={country.id}
          name={country.name}
          flag={country.flag_image}
          slug={country.slug}
          citiesCount={country.cities_count}
        />
      ))}
    </div>
  );
}

// Composant enfant (carte d'un pays)
function CountryCard({ id, name, flag, slug, citiesCount }) {
  return (
    <Link href={`/countries/${slug}`}>
      <div className="country-card">
        <img src={flag} alt={`Drapeau ${name}`} />
        <h3>{name}</h3>
        <p>{citiesCount} {citiesCount === 1 ? 'ville' : 'villes'}</p>
      </div>
    </Link>
  );
}
```

Dans cet exemple, le composant parent `CountriesPage` passe des données sur chaque pays au composant enfant `CountryCard` via les props.

### Exemple 2 : Transmission de fonctions via les props

Les props peuvent aussi être des fonctions, ce qui permet aux composants enfants de communiquer avec leurs parents :

```jsx
function FormulaireRecherche({ onSearch }) {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Appel de la fonction passée en prop
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un pays..."
      />
      <button type="submit">Rechercher</button>
    </form>
  );
}

// Utilisation
function PageRecherche() {
  const [resultats, setResultats] = useState([]);
  
  const effectuerRecherche = async (termeRecherche) => {
    // Logique de recherche...
    const data = await fetchSearchResults(termeRecherche);
    setResultats(data);
  };
  
  return (
    <div>
      <FormulaireRecherche onSearch={effectuerRecherche} />
      <ResultatsRecherche resultats={resultats} />
    </div>
  );
}
```

Ici, `PageRecherche` passe une fonction `effectuerRecherche` au composant `FormulaireRecherche` via la prop `onSearch`. Cela permet au formulaire de communiquer avec son parent.

## Pourquoi les props sont importantes ?

1. **Réutilisabilité** : Les props permettent de créer des composants génériques qui peuvent être réutilisés avec des données différentes.

2. **Flux de données unidirectionnel** : Dans React, les données circulent du haut vers le bas (du parent vers l'enfant), ce qui rend le code plus prévisible et facile à déboguer.

3. **Séparation des préoccupations** : Les composants parents se concentrent sur la gestion des données et la logique, tandis que les composants enfants se concentrent sur l'affichage.

## Conclusion

Les props sont le fondement de la communication entre composants dans React. Elles permettent de créer des interfaces modulaires et réutilisables en transmettant des données des composants parents aux composants enfants.

Dans notre application NextVoyage, nous utilisons constamment les props pour transmettre des informations sur les pays, les villes, et d'autres données touristiques entre nos différents composants.

En maîtrisant les props, vous comprendrez une partie essentielle du fonctionnement de React et pourrez créer des interfaces utilisateur plus complexes et interactives. 