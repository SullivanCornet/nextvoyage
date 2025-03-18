'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { placesAPI } from '@/services/api';

export default function AddRestaurant() {
  const params = useParams();
  const { slug, citySlug } = params;
  const router = useRouter();
  
  // États pour le formulaire
  const [restaurantName, setRestaurantName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [cityData, setCityData] = useState(null);
  const [restaurantCategory, setRestaurantCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Récupérer les données de la ville et de la catégorie
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations sur la ville
        const cityResponse = await fetch(`/api/cities/${citySlug}?country_slug=${slug}`);
        if (!cityResponse.ok) {
          throw new Error('Erreur lors de la récupération des informations de la ville');
        }
        const cityData = await cityResponse.json();
        setCityData(cityData);
        
        // Récupérer la catégorie "Restaurants"
        const categoryResponse = await fetch(`/api/categories/restaurants`);
        if (!categoryResponse.ok) {
          throw new Error('Erreur lors de la récupération de la catégorie');
        }
        const categoryData = await categoryResponse.json();
        setRestaurantCategory(categoryData);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setErrors(prev => ({ ...prev, load: error.message }));
        setLoading(false);
      }
    };
    
    fetchData();
  }, [slug, citySlug]);
  
  // Fonction pour convertir un slug en nom formaté
  const formatName = (slug) => {
    if (!slug) return '';
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
    
    if (!restaurantName.trim()) {
      newErrors.restaurantName = 'Le nom du restaurant est requis';
    }
    
    if (!description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }
    
    if (!address.trim()) {
      newErrors.address = 'L\'adresse est requise';
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
    
    // Vérifier que restaurantCategory a bien été récupéré
    if (!restaurantCategory) {
      setErrors(prev => ({ 
        ...prev, 
        submit: 'La catégorie "Restaurants" n\'a pas été trouvée. Veuillez vous rendre à la page de diagnostic pour initialiser les catégories.' 
      }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const slug = createSlug(restaurantName);
      
      // Création du restaurant avec ou sans image
      let response;
      if (imageFile) {
        // Si une image est téléchargée, utiliser FormData
        const formData = new FormData();
        formData.append('name', restaurantName);
        formData.append('slug', slug);
        formData.append('description', description);
        formData.append('address', address);
        formData.append('city_id', cityData.id);
        formData.append('category_id', restaurantCategory.id);
        formData.append('image', imageFile);
        
        // Log des informations sur le fichier pour débogage
        console.log('Envoi de l\'image:', {
          fileName: imageFile.name,
          type: imageFile.type,
          size: `${Math.round(imageFile.size / 1024)} KB`,
          lastModified: new Date(imageFile.lastModified).toISOString()
        });
        console.log('FormData prêt à être envoyé avec les champs:', Array.from(formData.entries()).map(([key]) => key));
        
        response = await placesAPI.createWithImage(formData);
      } else {
        // Sinon, utiliser JSON
        const placeData = {
          name: restaurantName,
          slug,
          description,
          address,
          city_id: cityData.id,
          category_id: restaurantCategory.id
        };
        
        response = await placesAPI.create(placeData);
      }
      
      // Rediriger vers la page de détail du restaurant
      router.push(`/countries/${params.slug}/cities/${citySlug}/restaurants/${slug}`);
    } catch (error) {
      console.error('Erreur lors de la création du restaurant:', error);
      setErrors(prev => ({ ...prev, submit: 'Erreur lors de la création du restaurant' }));
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <p>Chargement...</p>
        
        <style jsx>{`
          .loading-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            margin-top: 100px;
            font-family: Arial, sans-serif;
          }
        `}</style>
      </div>
    );
  }
  
  const cityName = cityData ? cityData.name : formatName(citySlug);
  const countryName = cityData ? cityData.country_name : formatName(slug);
  
  return (
    <div className="add-restaurant-container">
      <div className="page-header">
        <h1>Ajouter un restaurant à {cityName}</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/countries">Pays</Link> &gt; 
          <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}/restaurants`}>Restaurants</Link> &gt; 
          <span>Ajouter</span>
        </div>
        <Link href={`/countries/${slug}/cities/${citySlug}/restaurants`} className="back-button">
          Retour aux restaurants
        </Link>
      </div>
      
      {errors.load && (
        <div className="error-banner">
          {errors.load}
          <p>Vous pouvez essayer d'initialiser les catégories via la <Link href="/diagnostic">page de diagnostic</Link>.</p>
        </div>
      )}
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="restaurantName">Nom du restaurant *</label>
            <input
              type="text"
              id="restaurantName"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Ex: Restaurant Paris, Pizzeria Italia..."
              className={errors.restaurantName ? 'error' : ''}
            />
            {errors.restaurantName && <div className="error-message">{errors.restaurantName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez ce restaurant, sa cuisine, son ambiance..."
              rows="4"
              className={errors.description ? 'error' : ''}
            ></textarea>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Adresse *</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: 1 Rue de la Paix, 75001 Paris"
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Image du restaurant (facultative)</label>
            <div className="file-input-container">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="file-input-button">Choisir une image</div>
            </div>
            <div className="file-input-help">Format recommandé: 800x600 pixels, JPG ou PNG</div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création en cours...' : 'Ajouter le restaurant'}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .add-restaurant-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        h1 {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .breadcrumb {
          color: #7f8c8d;
          margin-bottom: 20px;
        }
        
        .breadcrumb a {
          color: #3498db;
          text-decoration: none;
        }
        
        .breadcrumb a:hover {
          text-decoration: underline;
        }
        
        .back-button {
          display: inline-block;
          background-color: #7f8c8d;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .error-banner {
          background-color: #e74c3c;
          color: white;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .error-banner a {
          color: white;
          text-decoration: underline;
          font-weight: bold;
        }
        
        .form-container {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .form-group {
          margin-bottom: 25px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #2c3e50;
        }
        
        input, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          font-family: inherit;
        }
        
        input.error, textarea.error {
          border-color: #e74c3c;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .submit-error {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #fde2e2;
          border-radius: 5px;
        }
        
        .form-actions {
          margin-top: 30px;
        }
        
        .submit-button {
          background-color: #e67e22;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s;
        }
        
        .submit-button:hover {
          background-color: #d35400;
        }
        
        .submit-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        .file-input-container {
          position: relative;
          margin-bottom: 5px;
        }
        
        .file-input-container input[type="file"] {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
        }
        
        .file-input-button {
          background-color: #ecf0f1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          text-align: center;
          font-size: 14px;
          color: #7f8c8d;
        }
        
        .file-input-help {
          font-size: 12px;
          color: #7f8c8d;
          margin-top: 5px;
        }
        
        .image-preview-container {
          margin-bottom: 20px;
        }
        
        .image-preview-container h3 {
          font-size: 18px;
          margin-bottom: 10px;
        }
        
        .image-preview {
          max-width: 100%;
          height: auto;
          border-radius: 5px;
          overflow: hidden;
          border: 1px solid #ddd;
          background-color: #f5f5f5;
        }
        
        .image-preview img {
          max-width: 100%;
          display: block;
        }
      `}</style>
    </div>
  );
} 