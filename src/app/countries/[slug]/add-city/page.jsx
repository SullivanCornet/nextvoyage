'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
  
  // Fonction pour convertir un slug en nom formaté
  const formatCountryName = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Fonction pour convertir un nom en slug
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };
  
  const countryName = formatCountryName(slug);
  
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
      
      console.log('Envoi des données avec l\'image...');
      
      // Faire l'upload de l'image via notre service d'upload unifié
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
      
      console.log('Statut de la réponse:', response.status);
      
      // Vérifier si la réponse est OK avant d'essayer de parser le JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la création de la ville');
        } else {
          // Si la réponse n'est pas du JSON, utiliser le statut ou le texte de la réponse
          const errorText = await response.text();
          throw new Error(errorText || `Erreur HTTP: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('Réponse de l\'API:', data);
      
      setSuccessMessage('Ville ajoutée avec succès !');
      
      // Rediriger vers la page du pays après un court délai
      // Nous changerons vers la page de la ville quand elle sera implémentée
      setTimeout(() => {
        router.push(`/countries/${slug}`);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la création de la ville:', error);
      setErrors(prev => ({ ...prev, submit: error.message }));
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="add-city-container">
      <div className="page-header">
        <h1>Ajouter une ville en {countryName}</h1>
        <Link href={`/countries/${slug}`} className="back-button">
          Retour au pays
        </Link>
      </div>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {errors.country && (
        <div className="error-message global-error">
          {errors.country}
        </div>
      )}
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cityName">Nom de la ville *</label>
            <input
              type="text"
              id="cityName"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="Ex: Paris, New York, Tokyo..."
              className={errors.cityName ? 'error' : ''}
            />
            {errors.cityName && <div className="error-message">{errors.cityName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement cette ville..."
              rows="4"
              className={errors.description ? 'error' : ''}
            ></textarea>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Image de bannière (optionnelle)</label>
            <div className="file-input-container">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="file-input-button">Choisir une image</div>
            </div>
            <div className="file-input-help">Format recommandé: 1200x300 pixels, JPG ou PNG</div>
          </div>
          
          {imagePreview && (
            <div className="image-preview-container">
              <h3>Aperçu de l'image</h3>
              <div className="image-preview">
                <img src={imagePreview} alt="Aperçu" />
              </div>
            </div>
          )}
          
          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting || !countryId}
            >
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter la ville'}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .add-city-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        h1 {
          color: #2c3e50;
          font-size: 1.8rem;
          margin: 0;
        }
        
        .back-button {
          display: inline-block;
          background-color: #7f8c8d;
          color: white;
          padding: 8px 16px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        
        .back-button:hover {
          background-color: #6c7a7d;
        }
        
        .success-message {
          background-color: #2ecc71;
          color: white;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }
        
        .global-error {
          background-color: #e74c3c;
          color: white;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }
        
        .form-container {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 10px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #2c3e50;
        }
        
        input[type="text"],
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        
        input[type="text"]:focus,
        textarea:focus {
          border-color: #3498db;
          outline: none;
        }
        
        input[type="text"].error,
        textarea.error {
          border-color: #e74c3c;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 0.9rem;
          margin-top: 5px;
        }
        
        .submit-error {
          margin-bottom: 15px;
          text-align: center;
          font-weight: bold;
        }
        
        .file-input-container {
          position: relative;
          overflow: hidden;
          display: inline-block;
        }
        
        input[type="file"] {
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        
        .file-input-button {
          background-color: #3498db;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          display: inline-block;
          transition: background-color 0.3s ease;
        }
        
        .file-input-button:hover {
          background-color: #2980b9;
        }
        
        .file-input-help {
          font-size: 0.8rem;
          color: #7f8c8d;
          margin-top: 5px;
        }
        
        .image-preview-container {
          margin-bottom: 20px;
        }
        
        .image-preview-container h3 {
          font-size: 1.2rem;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        
        .image-preview {
          width: 100%;
          height: 200px;
          border-radius: 5px;
          overflow: hidden;
          background-color: #eee;
        }
        
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .form-actions {
          margin-top: 30px;
          text-align: center;
        }
        
        .submit-button {
          background-color: #2ecc71;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .submit-button:hover {
          background-color: #27ae60;
        }
        
        .submit-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
} 