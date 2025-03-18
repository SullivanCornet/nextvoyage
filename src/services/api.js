const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Fonction générique pour effectuer des requêtes API
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Une erreur est survenue');
  }
  
  return await response.json();
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
  update: async (id, data) => {
    return await fetchAPI(`/places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Supprimer un lieu
  delete: async (id) => {
    return await fetchAPI(`/places/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Mettre à jour un lieu avec une image
  updateWithImage: async (formData) => {
    // Changer la méthode à PUT
    const url = `${API_URL}/places/upload`;
    
    console.log(`Envoi de FormData pour mise à jour vers ${url}`, {
      formDataEntries: Array.from(formData.entries()).map(([key]) => key)
    });
    
    const response = await fetch(url, {
      method: 'PUT',
      body: formData
    });
    
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error || 'Une erreur est survenue lors de la mise à jour');
      } catch (parseError) {
        throw new Error('Erreur de réponse du serveur: ' + response.statusText);
      }
    }
    
    return await response.json();
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