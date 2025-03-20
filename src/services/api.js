const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Fonction générique pour effectuer des requêtes API
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    console.log(`API CLIENT: Envoi de requête à ${url}`, {
      method: options.method || 'GET',
      bodyLength: options.body ? options.body.length : 'no body'
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        // Si le serveur ne renvoie pas un JSON valide
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API CLIENT: Erreur lors de la requête à ${url}:`, error);
    throw error;
  }
}

// Fonction pour envoyer des données avec FormData (pour les uploads de fichiers)
export async function uploadWithFormData(endpoint, formData) {
  const url = `${API_URL}${endpoint}`;
  
  console.log(`API CLIENT: Préparation de l'envoi vers ${url}`);
  console.log(`API CLIENT: FormData contient les champs: ${Array.from(formData.keys()).join(', ')}`);
  
  // Vérifier si on a une image dans le FormData
  const imageFile = formData.get('image');
  if (imageFile && imageFile instanceof File) {
    console.log(`API CLIENT: L'image est présente dans FormData:`, {
      nom: imageFile.name,
      taille: `${Math.round(imageFile.size / 1024)} KB`,
      type: imageFile.type
    });
  } else {
    console.warn(`API CLIENT: Pas d'image dans FormData ou format invalide`);
  }
  
  try {
    console.log(`API CLIENT: Début de l'envoi vers ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const endTime = Date.now();
    
    console.log(`API CLIENT: Réponse reçue après ${endTime - startTime}ms, status ${response.status}`);
    
    if (!response.ok) {
      // Essayer de récupérer les détails de l'erreur
      try {
        const errorData = await response.json();
        console.error(`API CLIENT: Erreur détaillée:`, errorData);
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      } catch (jsonError) {
        // Si on ne peut pas parser le JSON de l'erreur
        console.error(`API CLIENT: Impossible de parser l'erreur:`, jsonError);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    }
    
    // Traiter la réponse
    try {
      const data = await response.json();
      console.log(`API CLIENT: Données reçues avec succès`);
      return data;
    } catch (jsonError) {
      console.error(`API CLIENT: Erreur lors du parsing de la réponse:`, jsonError);
      throw new Error('Erreur lors du traitement de la réponse du serveur');
    }
  } catch (error) {
    console.error(`API CLIENT: Erreur lors de l'envoi:`, error);
    throw error;
  }
}

// API pour les pays
export const countriesAPI = {
  // Récupérer tous les pays
  getAll: async () => {
    return await fetchAPI('/countries');
  },
  
  // Récupérer un pays par son slug
  getBySlug: async (slug) => {
    return await fetchAPI(`/countries/${slug}`);
  },
  
  // Créer un nouveau pays
  create: async (data) => {
    return await fetchAPI('/countries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Mettre à jour un pays
  update: async (id, data) => {
    return await fetchAPI(`/countries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Supprimer un pays
  delete: async (id) => {
    return await fetchAPI(`/countries/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Récupérer les villes d'un pays
  getCities: async (slug) => {
    return await fetchAPI(`/countries/${slug}/cities`);
  },
};

// API pour les villes
export const citiesAPI = {
  // Récupérer toutes les villes
  getAll: async () => {
    return await fetchAPI('/cities');
  },
  
  // Récupérer les villes d'un pays
  getByCountry: async (countryId) => {
    return await fetchAPI(`/cities?country_id=${countryId}`);
  },
  
  // Récupérer une ville par son slug
  getBySlug: async (citySlug, countrySlug) => {
    return await fetchAPI(`/cities/${citySlug}?country_slug=${countrySlug}`);
  },
  
  // Créer une nouvelle ville
  create: async (data) => {
    return await fetchAPI('/cities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Créer une nouvelle ville avec une image
  createWithImage: async (formData) => {
    return await uploadWithFormData('/cities', formData);
  },
  
  // Mettre à jour une ville
  update: async (id, data) => {
    return await fetchAPI(`/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Supprimer une ville
  delete: async (id) => {
    return await fetchAPI(`/cities/${id}`, {
      method: 'DELETE',
    });
  },
};

// API pour les lieux (commerces, restaurants, lieux à visiter)
export const placesAPI = {
  // Récupérer tous les lieux
  getAll: async () => {
    return await fetchAPI('/places');
  },
  
  // Récupérer les lieux d'une ville
  getByCity: async (cityId) => {
    return await fetchAPI(`/places?city_id=${cityId}`);
  },
  
  // Récupérer les lieux d'une catégorie
  getByCategory: async (categoryId) => {
    return await fetchAPI(`/places?category_id=${categoryId}`);
  },
  
  // Récupérer les lieux d'une ville et d'une catégorie
  getByCityAndCategory: async (cityId, categoryId) => {
    return await fetchAPI(`/places?city_id=${cityId}&category_id=${categoryId}`);
  },
  
  // Récupérer un lieu par son slug
  getBySlug: async (slug, citySlug) => {
    // Nous devons modifier notre approche
    return await fetchAPI(`/places/${slug}?city_slug=${citySlug}`);
  },
  
  // Créer un nouveau lieu
  create: async (data) => {
    return await fetchAPI('/places', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Créer un nouveau lieu avec une image
  createWithImage: async (formData) => {
    return await uploadWithFormData('/places/upload', formData);
  },
  
  // Mettre à jour un lieu
  update: async (data) => {
    // S'assurer que l'ID est bien présent
    if (!data || !data.id) {
      throw new Error('ID manquant pour la mise à jour du lieu');
    }
    
    console.log('API CLIENT: Mise à jour du lieu:', {
      id: data.id,
      slug: data.slug,
      fields: Object.keys(data).filter(key => key !== 'id')
    });
    
    // Utiliser correctement l'ID depuis l'objet data
    return await fetchAPI(`/places/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Supprimer un lieu
  delete: async (placeId, citySlug) => {
    // Vérifier si placeId est un objet ou un ID simple
    const slug = typeof placeId === 'object' && placeId.slug ? placeId.slug : placeId;
    
    // Si citySlug est fourni, l'ajouter aux paramètres de requête
    const endpoint = citySlug 
      ? `/places/${slug}?city_slug=${citySlug}` 
      : `/places/${slug}`;
      
    return await fetchAPI(endpoint, {
      method: 'DELETE',
    });
  },
  
  // Mettre à jour un lieu avec une image
  updateWithImage: async (formData) => {
    const url = `${API_URL}/places/upload`;
    
    // Vérifications et logs détaillés
    if (!formData.has('id')) {
      console.error("API CLIENT: Erreur: formData ne contient pas d'ID");
      throw new Error("L'ID est requis pour la mise à jour");
    }
    
    console.log(`API CLIENT: Envoi de FormData pour mise à jour vers ${url}`, {
      formDataEntries: Array.from(formData.entries()).map(([key, value]) => {
        // Ne pas afficher le contenu binaire des fichiers
        if (value instanceof File) {
          return `${key}: [File: ${value.name}, type: ${value.type}, size: ${value.size} bytes]`;
        }
        // Ne pas afficher certaines valeurs sensibles en entier
        if (key === 'description' && typeof value === 'string' && value.length > 50) {
          return `${key}: ${value.substring(0, 50)}...`;
        }
        return `${key}: ${value}`;
      })
    });
    
    try {
      // Utiliser un timeout pour éviter les requêtes qui ne se terminent jamais
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes
      
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`API CLIENT: Réponse reçue avec statut: ${response.status} (${response.statusText})`);
      
      if (!response.ok) {
        // Essayer d'obtenir le message d'erreur JSON
        try {
          const errorText = await response.text();
          let errorData;
          
          try {
            // Essayer de parser comme JSON
            errorData = JSON.parse(errorText);
            console.error(`API CLIENT: Détails de l'erreur:`, errorData);
            throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
          } catch (jsonParseError) {
            // Si ce n'est pas du JSON, utiliser le texte brut
            console.error(`API CLIENT: Réponse non-JSON reçue:`, errorText.substring(0, 200));
            throw new Error(`Erreur ${response.status}: ${response.statusText}. Détails: ${errorText.substring(0, 100)}`);
          }
        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            throw new Error('La requête a pris trop de temps et a été annulée');
          }
          // Si on ne peut même pas lire la réponse
          console.error(`API CLIENT: Impossible de lire la réponse d'erreur:`, fetchError);
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
      
      // Traiter la réponse
      try {
        const data = await response.json();
        console.log(`API CLIENT: Mise à jour réussie`);
        return data;
      } catch (jsonError) {
        console.error(`API CLIENT: Erreur lors du parsing de la réponse:`, jsonError);
        throw new Error('Erreur lors du traitement de la réponse du serveur');
      }
    } catch (error) {
      console.error(`API CLIENT: Erreur lors de la mise à jour avec image:`, error);
      throw error;
    }
  },
};

// API pour les transports
export const transportsAPI = {
  // Récupérer tous les transports
  getAll: async () => {
    return await fetchAPI('/transports');
  },
  
  // Récupérer les transports d'une ville
  getByCity: async (cityId) => {
    return await fetchAPI(`/transports?city_id=${cityId}`);
  },
  
  // Créer un nouveau transport
  create: async (data) => {
    return await fetchAPI('/transports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Créer un nouveau transport avec une image
  createWithImage: async (formData) => {
    return await uploadWithFormData('/transports', formData);
  },
  
  // Mettre à jour un transport
  update: async (id, data) => {
    return await fetchAPI(`/transports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Supprimer un transport
  delete: async (id) => {
    return await fetchAPI(`/transports/${id}`, {
      method: 'DELETE',
    });
  },
};

// API pour les logements
export const accommodationsAPI = {
  // Récupérer tous les logements
  getAll: async () => {
    return await fetchAPI('/accommodations');
  },
  
  // Récupérer les logements d'une ville
  getByCity: async (cityId) => {
    return await fetchAPI(`/accommodations?city_id=${cityId}`);
  },
  
  // Créer un nouveau logement
  create: async (data) => {
    return await fetchAPI('/accommodations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Créer un nouveau logement avec une image
  createWithImage: async (formData) => {
    return await uploadWithFormData('/accommodations', formData);
  },
  
  // Mettre à jour un logement
  update: async (id, data) => {
    return await fetchAPI(`/accommodations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Supprimer un logement
  delete: async (id) => {
    return await fetchAPI(`/accommodations/${id}`, {
      method: 'DELETE',
    });
  },
}; 