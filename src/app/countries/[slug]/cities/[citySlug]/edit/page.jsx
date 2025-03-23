'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export default function EditCity() {
  const params = useParams();
  const router = useRouter();
  const { slug, citySlug } = params;
  const { isAuthenticated, isModerator } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_path: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countryId, setCountryId] = useState(null);
  const [countryCode, setCountryCode] = useState(null);
  
  // Rediriger si l'utilisateur n'est pas authentifié ou n'est pas modérateur
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/countries/${slug}/cities/${citySlug}`);
    }
  }, [isAuthenticated, isLoading, router, slug, citySlug]);
  
  // Récupérer les données de la ville depuis l'API
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        // D'abord, récupérer l'ID du pays
        const countryResponse = await fetch(`/api/countries/${slug}`);
        if (!countryResponse.ok) {
          throw new Error('Erreur lors de la récupération des données du pays');
        }
        const countryData = await countryResponse.json();
        setCountryId(countryData.id);
        setCountryCode(countryData.country_code);
        
        // Ensuite, récupérer les villes de ce pays
        const citiesResponse = await fetch(`/api/cities?country_id=${countryData.id}`);
        if (!citiesResponse.ok) {
          throw new Error('Erreur lors de la récupération des villes');
        }
        const citiesData = await citiesResponse.json();
        
        // Trouver la ville correspondant au slug
        const cityData = citiesData.find(city => city.slug === citySlug);
        if (!cityData) {
          throw new Error('Ville non trouvée');
        }
        
        setFormData({
          name: cityData.name || '',
          slug: cityData.slug || '',
          description: cityData.description || '',
          image_path: cityData.image_path || ''
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    };
    
    fetchCityData();
  }, [slug, citySlug]);
  
  // Gérer les changements de champ du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Générer automatiquement le slug à partir du nom
  const generateSlug = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-')    // Remplacer les espaces par des tirets
      .replace(/--+/g, '-')    // Remplacer les tirets multiples par un seul
      .trim();                  // Supprimer les espaces au début et à la fin
    
    setFormData(prevState => ({
      ...prevState,
      slug
    }));
  };
  
  // Soumettre le formulaire d'édition
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier si tous les champs requis sont remplis
    if (!formData.name || !formData.slug) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Construction de l'objet de données pour la mise à jour
    const cityData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      image_path: formData.image_path,
      country_id: countryId,
      country_code: countryCode
    };
    
    try {
      // Requête PUT pour mettre à jour la ville
      const response = await fetch(`/api/cities/${citySlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cityData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la ville');
      }
      
      const updatedCity = await response.json();
      
      // Afficher un message de succès et rediriger vers la page de détail de la ville
      setSuccessMessage('Ville mise à jour avec succès');
      setTimeout(() => {
        router.push(`/countries/${slug}/cities/${updatedCity.slug}`);
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      setErrorMessage(error.message);
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations de la ville...</p>
      </div>
    );
  }
  
  return (
    <div className="edit-city-container">
      <h1>Modifier la ville</h1>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="name">Nom de la ville *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              handleChange(e);
              generateSlug(e);
            }}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="slug">Slug *</label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
          />
          <small>Identifiant unique utilisé dans l'URL (généré automatiquement)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image_path">Chemin de l'image</label>
          <input
            type="text"
            id="image_path"
            name="image_path"
            value={formData.image_path}
            onChange={handleChange}
          />
          <small>Chemin relatif ou URL de l'image</small>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button">
            Mettre à jour
          </button>
          
          <Link href={`/countries/${slug}/cities/${citySlug}`} className="cancel-button">
            Annuler
          </Link>
        </div>
      </form>
      
      <style jsx>{`
        .edit-city-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px 20px;
          background-color: var(--bg-color);
          color: var(--text);
          font-family: 'Montserrat', Arial, sans-serif;
        }
        
        h1 {
          font-size: 28px;
          margin-bottom: 30px;
          color: var(--primary);
          text-align: center;
        }
        
        .loading-container {
          text-align: center;
          padding: 50px;
        }
        
        .edit-form {
          background-color: var(--card-bg);
          padding: 30px;
          border-radius: 10px;
          box-shadow: var(--card-shadow);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        input, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 5px;
          font-size: 16px;
          color: var(--text);
          background-color: var(--input-bg);
        }
        
        textarea {
          resize: vertical;
        }
        
        small {
          display: block;
          margin-top: 5px;
          color: var(--text-light);
          font-size: 14px;
        }
        
        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }
        
        .submit-button, .cancel-button {
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .submit-button {
          background-color: var(--primary);
          color: white;
          flex: 1;
        }
        
        .submit-button:hover {
          background-color: var(--primary-dark);
          transform: translateY(-3px);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
        }
        
        .cancel-button {
          background-color: var(--bg-light);
          color: var(--text);
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cancel-button:hover {
          background-color: var(--bg-dark);
          transform: translateY(-3px);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
        }
        
        .error-message {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          border: 1px solid #e74c3c;
          border-radius: 5px;
          padding: 10px 15px;
          margin-bottom: 20px;
        }
        
        .success-message {
          background-color: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
          border: 1px solid #2ecc71;
          border-radius: 5px;
          padding: 10px 15px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
} 