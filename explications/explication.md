# Guide pour débutants : Ajout de Pays et de Villes dans l'application NextVoyage

Ce guide explique le fonctionnement de l'ajout de pays et de villes dans notre application de voyage basée sur Next.js. Nous allons explorer chaque étape du processus, du frontend jusqu'à la base de données.

## Table des matières

1. [Structure générale de l'application](#structure-générale-de-lapplication)
2. [Ajout d'un pays](#ajout-dun-pays)
   - [Interface utilisateur](#interface-utilisateur-pour-ajouter-un-pays)
   - [Traitement des données côté client](#traitement-des-données-côté-client-pays)
   - [Communication avec l'API](#communication-avec-lapi-pays)
   - [Traitement côté serveur](#traitement-côté-serveur-pays)
3. [Ajout d'une ville](#ajout-dune-ville)
   - [Interface utilisateur](#interface-utilisateur-pour-ajouter-une-ville)
   - [Traitement des données côté client](#traitement-des-données-côté-client-ville)
   - [Téléchargement d'images](#téléchargement-dimages)
   - [Communication avec l'API](#communication-avec-lapi-ville)
   - [Traitement côté serveur](#traitement-côté-serveur-ville)
4. [Le flux complet de données](#le-flux-complet-de-données)

## Structure générale de l'application

L'application est construite avec Next.js, un framework React qui permet le rendu côté serveur et le développement d'API. Voici les composants essentiels du système :

- **Pages frontend** : Interfaces utilisateur pour ajouter des pays et des villes.
- **Routes API** : Endpoints qui traitent les requêtes et communiquent avec la base de données.
- **Base de données** : MySQL stocke les informations sur les pays et les villes.

## Ajout d'un pays

### Interface utilisateur pour ajouter un pays

La page pour ajouter un pays se trouve dans `src/app/countries/add/page.jsx`. Elle affiche un formulaire où l'utilisateur sélectionne un pays à partir d'une liste déroulante.

```jsx
// Extrait de src/app/countries/add/page.jsx
export default function AddCountry() {
  const router = useRouter();
  
  // États pour le formulaire
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countryData, setCountryData] = useState(null);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Récupération de la liste des pays lors du chargement du composant
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
        // ... traitement des données ...
        setCountries(formattedCountries);
        setIsLoadingCountries(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des pays:', error);
      }
    };

    fetchCountries();
  }, []);

  // ... reste du composant ...
```

Le formulaire lui-même est simple, avec seulement un sélecteur de pays :

```jsx
<form onSubmit={handleSubmit}>
  <div className="form-group">
    <label htmlFor="country">Sélectionnez un pays *</label>
    <select
      id="country"
      value={selectedCountry}
      onChange={(e) => {
        setSelectedCountry(e.target.value);
        setCountryData(null);
      }}
      className={errors.country ? 'error' : ''}
      disabled={isLoadingCountries || isSubmitting}
    >
      <option value="">-- Choisir un pays --</option>
      {isLoadingCountries ? (
        <option value="" disabled>Chargement des pays...</option>
      ) : (
        countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))
      )}
    </select>
    {errors.country && <div className="error-message">{errors.country}</div>}
  </div>
  
  <div className="form-actions">
    <button 
      type="button" 
      className="preview-button"
      onClick={handlePreview}
      disabled={isLoadingCountries || isSubmitting || !selectedCountry}
    >
      Aperçu
    </button>
    
    <button 
      type="submit" 
      className="submit-button"
      disabled={isLoadingCountries || isSubmitting || !selectedCountry}
    >
      {isSubmitting ? 'Ajout en cours...' : 'Ajouter le pays'}
    </button>
  </div>
</form>
```

### Traitement des données côté client (pays)

Lorsque l'utilisateur sélectionne un pays et soumet le formulaire, la fonction `handleSubmit` est exécutée. Cette fonction effectue plusieurs actions importantes :

```jsx
// Extrait de src/app/countries/add/page.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedCountry) {
    setErrors(prev => ({ ...prev, country: 'Veuillez sélectionner un pays' }));
    return;
  }
  
  setIsSubmitting(true);
  setErrors({});
  setSuccessMessage('');
  
  try {
    // Récupérer les données complètes du pays
    const countryDetails = await fetchCountryData(selectedCountry);
    
    // Le nom du pays en français ou par défaut en anglais
    const countryName = countryDetails.name.translations?.fra?.common || countryDetails.name.common;
    const countrySlug = createSlug(countryName);
    
    // Préparer les données pour l'insertion dans la base de données
    const currencyInfo = formatCurrency(countryDetails.currencies);
    
    const countryData = {
      name: countryName,
      slug: countrySlug,
      country_code: countryDetails.cca2,
      description: `${countryName} est un pays situé en ${countryDetails.region}${countryDetails.subregion ? `, plus précisément en ${countryDetails.subregion}` : ''}.`,
      language: formatLanguages(countryDetails.languages),
      population: countryDetails.population?.toString() || null,
      area: countryDetails.area?.toString() || null,
      capital: countryDetails.capital?.[0] || null,
      currency: currencyInfo.name,
      currency_code: currencyInfo.code,
      flag_image: countryDetails.flags.svg,
      image_path: countryDetails.flags.svg
    };
    
    // Envoyer les données au serveur
    const response = await fetch('/api/countries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(countryData)
    });
    
    // ... traitement de la réponse ...
  } catch (error) {
    console.error('Erreur lors de la création du pays:', error);
    setErrors(prev => ({ ...prev, submit: error.message }));
  } finally {
    setIsSubmitting(false);
  }
};
```

Quelques fonctions utilitaires importantes :

```jsx
// Création d'un slug depuis un nom
const createSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Formatage des langues parlées dans le pays
const formatLanguages = (languages) => {
  if (!languages) return null;
  return Object.values(languages).join(', ');
};

// Formatage de la devise du pays
const formatCurrency = (currencies) => {
  if (!currencies) return { name: null, code: null };
  
  const currencyCode = Object.keys(currencies)[0];
  const currency = currencies[currencyCode];
  
  return {
    name: currency.name,
    code: currencyCode
  };
};
```

### Communication avec l'API (pays)

Une fois les données préparées, elles sont envoyées à l'API via une requête fetch :

```javascript
// Envoyer les données au serveur
const response = await fetch('/api/countries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(countryData)
});
```

### Traitement côté serveur (pays)

Le point d'entrée de l'API pour l'ajout d'un pays se trouve dans `src/app/api/countries/route.js`. Voici comment il traite les données reçues :

```javascript
// Extrait de src/app/api/countries/route.js
// POST /api/countries
export async function POST(request) {
  try {
    const data = await request.json();
    console.log('API: Données reçues pour création de pays:', data);
    
    // Vérifier que les champs requis sont présents
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Les champs nom et slug sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Préparer les données pour l'insertion en tenant compte de tous les champs de la table
    const countryData = {
      name: data.name,
      slug: data.slug,
      country_code: data.country_code || null,
      description: data.description || '',
      language: data.language || null,
      population: data.population || null,
      area: data.area || null,
      capital: data.capital || null,
      currency: data.currency || null,
      currency_code: data.currency_code || null,
      image_path: data.image_path || null,
      flag_image: data.flag_image || null,
      status: data.status || 'published',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    // Insérer le pays dans la base de données
    try {
      const country = await insert('countries', countryData);
      console.log('API: Pays créé avec succès:', country);
      
      return NextResponse.json(country, { status: 201 });
    } catch (insertError) {
      console.error('API: Erreur spécifique d\'insertion:', insertError);
      return NextResponse.json(
        { error: `Erreur lors de la création du pays: ${insertError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Erreur détaillée lors de la création du pays:', error);
    return NextResponse.json(
      { error: `Erreur lors de la création du pays: ${error.message}` },
      { status: 500 }
    );
  }
}
```

L'API vérifie d'abord que tous les champs requis sont présents, puis construit un objet de données complet pour l'insertion dans la base de données. La fonction `insert` provient du module `db.js` et gère l'interaction avec la base de données MySQL.

## Ajout d'une ville

### Interface utilisateur pour ajouter une ville

L'interface pour ajouter une ville se trouve dans `src/app/countries/[slug]/add-city/page.jsx`. Contrairement à l'ajout de pays, l'ajout de ville inclut un formulaire plus complet avec des champs pour le nom, la description et une image.

```jsx
// Extrait de src/app/countries/[slug]/add-city/page.jsx
export default function AddCity() {
  const params = useParams();
  const { slug } = params;
  const router = useRouter();
  
  // États pour le formulaire
  const [cityName, setCityName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [countryId, setCountryId] = useState(null);
  const [countryCode, setCountryCode] = useState('');
  
  // Récupérer les informations du pays
  useEffect(() => {
    const fetchCountryInfo = async () => {
      try {
        const response = await fetch(`/api/countries/${slug}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données du pays');
        }
        const countryData = await response.json();
        setCountryId(countryData.id);
        setCountryCode(countryData.country_code || '');
      } catch (error) {
        console.error('Erreur:', error);
        setErrors(prev => ({ ...prev, country: 'Impossible de récupérer les informations du pays' }));
      }
    };
    
    fetchCountryInfo();
  }, [slug]);
  
  // ... reste du composant ...
```

Le formulaire d'ajout de ville contient plusieurs champs :

```jsx
<form onSubmit={handleSubmit}>
  <div className="form-grid">
    <div className="form-column">
      <div className="form-group">
        <label htmlFor="cityName">Nom de la ville *</label>
        <input
          type="text"
          id="cityName"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          placeholder="Ex: Paris"
          required
        />
        {errors.cityName && (
          <div className="error-message">{errors.cityName}</div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez cette ville en quelques phrases..."
          rows={5}
          required
        ></textarea>
        {errors.description && (
          <div className="error-message">{errors.description}</div>
        )}
      </div>
    </div>
    
    <div className="form-column">
      <div className="form-group">
        <label>Image de la ville</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {errors.image && (
          <div className="error-message">{errors.image}</div>
        )}
        
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Aperçu" />
          </div>
        )}
      </div>
    </div>
  </div>
  
  <div className="form-actions">
    <button 
      type="submit" 
      className="submit-button"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Ajout en cours...' : 'Ajouter la ville'}
    </button>
  </div>
</form>
```

### Traitement des données côté client (ville)

La gestion du formulaire inclut la validation des champs et le traitement de l'image avant l'envoi à l'API :

```jsx
// Validation du formulaire
const validateForm = () => {
  const newErrors = {};
  
  if (!cityName.trim()) {
    newErrors.cityName = 'Le nom de la ville est requis';
  }
  
  if (!description.trim()) {
    newErrors.description = 'La description est requise';
  } else if (description.length < 10) {
    newErrors.description = 'La description doit contenir au moins 10 caractères';
  }
  
  if (!countryId) {
    newErrors.country = 'Impossible de récupérer les informations du pays';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Soumission du formulaire
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  setSuccessMessage('');
  
  try {
    const citySlug = createSlug(cityName);
    
    // Utiliser FormData pour envoyer l'image avec les autres données
    const formData = new FormData();
    formData.append('name', cityName);
    formData.append('slug', citySlug);
    formData.append('country_id', countryId);
    formData.append('country_code', countryCode || '');
    formData.append('description', description);
    
    // Ajouter l'image si elle existe
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    // ... traitement de l'upload de l'image et envoi à l'API ...
  } catch (error) {
    console.error('Erreur lors de la création de la ville:', error);
    setErrors(prev => ({ ...prev, submit: error.message }));
    setIsSubmitting(false);
  }
};
```

### Téléchargement d'images

La gestion du téléchargement d'images est une fonctionnalité importante de l'ajout de villes :

```jsx
// Gestion du changement d'image
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setImageFile(file);
    
    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

// Téléchargement de l'image lors de la soumission
let imagePath = null;
if (imageFile) {
  try {
    const uploadResponse = await fetch(`/api/upload?category=cities&field=image`, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || 'Erreur lors de l\'upload de l\'image');
    }
    
    const uploadResult = await uploadResponse.json();
    imagePath = uploadResult.url;
    console.log('Image uploadée avec succès:', imagePath);
  } catch (uploadError) {
    console.error('Erreur lors de l\'upload de l\'image:', uploadError);
    setErrors({
      ...errors,
      submit: `Erreur lors de l'upload de l'image: ${uploadError.message}`
    });
    setIsSubmitting(false);
    return;
  }
}
```

### Communication avec l'API (ville)

Une fois les données préparées et l'image uploadée (si disponible), les informations de la ville sont envoyées à l'API :

```javascript
// Préparer les données de la ville avec le chemin de l'image
const cityData = {
  name: cityName,
  slug: citySlug,
  country_id: countryId,
  country_code: countryCode || '',
  description: description,
  image_path: imagePath
};

console.log('Données envoyées à l\'API:', cityData);

const response = await fetch('/api/cities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(cityData)
});
```

### Traitement côté serveur (ville)

Le point d'entrée de l'API pour l'ajout d'une ville se trouve dans `src/app/api/cities/route.js` :

```javascript
// Extrait de src/app/api/cities/route.js
// POST /api/cities
export async function POST(request) {
  try {
    // Log de la requête entrante
    console.log('API: Réception d\'une requête POST pour /api/cities');
    
    const contentType = request.headers.get('content-type');
    console.log('API: Content-Type de la requête:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await request.json();
    } else {
      return NextResponse.json(
        { error: 'Le Content-Type doit être application/json' },
        { status: 400 }
      );
    }
    
    // Vérifier que les champs requis sont présents
    if (!data.name || !data.slug || !data.country_id) {
      return NextResponse.json(
        { error: 'Les champs nom, slug et country_id sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier que le pays existe
    const countryQuery = 'SELECT id FROM countries WHERE id = ?';
    const countries = await executeQuery({ query: countryQuery, values: [data.country_id] });
    
    if (countries.length === 0) {
      return NextResponse.json(
        { error: 'Le pays spécifié n\'existe pas' },
        { status: 404 }
      );
    }
    
    // Vérifier que le slug n'est pas déjà utilisé pour ce pays
    const slugCheckQuery = 'SELECT id FROM cities WHERE country_id = ? AND slug = ?';
    const existingCities = await executeQuery({ 
      query: slugCheckQuery, 
      values: [data.country_id, data.slug] 
    });
    
    if (existingCities.length > 0) {
      return NextResponse.json(
        { error: 'Une ville avec ce nom existe déjà pour ce pays' },
        { status: 409 }
      );
    }
    
    // Préparer les données pour l'insertion
    const cityData = {
      name: data.name,
      slug: data.slug,
      country_id: data.country_id,
      country_code: data.country_code,
      description: data.description || '',
      image_path: data.image_path || null,
      created_by: data.created_by || null,
      status: data.status || 'published',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    // Insérer la ville dans la base de données
    try {
      const city = await insert('cities', cityData);
      return NextResponse.json(city, { status: 201 });
    } catch (insertError) {
      return NextResponse.json(
        { error: `Erreur lors de la création de la ville: ${insertError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Erreur lors de la création de la ville: ${error.message}` },
      { status: 500 }
    );
  }
}
```

Cette API effectue plusieurs vérifications avant d'insérer les données :
1. Elle vérifie que tous les champs requis sont présents
2. Elle vérifie que le pays spécifié existe dans la base de données
3. Elle vérifie qu'aucune ville avec le même slug n'existe déjà pour ce pays

Si toutes les vérifications sont passées, elle insère les données dans la table `cities` de la base de données.

## Le flux complet de données

Voici comment les données circulent à travers l'application lors de l'ajout d'un pays ou d'une ville :

1. **Interface utilisateur** : L'utilisateur remplit un formulaire et soumet les données.
2. **Traitement côté client** : JavaScript traite les données, les valide et les prépare pour l'envoi.
3. **Requête API** : Les données sont envoyées à une route d'API via une requête fetch.
4. **Traitement côté serveur** : La route d'API vérifie les données, effectue des validations supplémentaires et prépare les données pour la base de données.
5. **Insertion en base de données** : Les données sont insérées dans la base de données MySQL via la fonction `insert` du module `db.js`.
6. **Réponse** : Une réponse est renvoyée au client avec les données insérées ou un message d'erreur.
7. **Retour utilisateur** : L'interface utilisateur est mise à jour pour informer l'utilisateur du succès ou de l'échec de l'opération.

Ce flux complet garantit une expérience fluide et sécurisée pour l'ajout de pays et de villes dans l'application.

Avec ce guide, vous devriez maintenant avoir une compréhension claire de la façon dont fonctionne l'ajout de pays et de villes dans l'application NextVoyage. 