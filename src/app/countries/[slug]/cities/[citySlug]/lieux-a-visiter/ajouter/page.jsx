'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { placesAPI } from '@/services/api';
import AuthCheck from '@/app/components/AuthCheck';

export default function AddPlaceToVisit() {
  const params = useParams();
  const { slug, citySlug } = params;
  const router = useRouter();
  
  // États pour le formulaire
  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [cityData, setCityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeCategory, setPlaceCategory] = useState(null);
  
  // Charger les informations de la ville
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer la ville
        const cityResponse = await fetch(`/api/cities/${citySlug}?country_slug=${slug}`);
        if (!cityResponse.ok) {
          throw new Error('Erreur lors de la récupération des informations de la ville');
        }
        const cityData = await cityResponse.json();
        setCityData(cityData);
        
        // Récupérer la catégorie "Lieux à visiter"
        const categoryResponse = await fetch(`/api/categories/lieux-a-visiter`);
        if (!categoryResponse.ok) {
          throw new Error('Erreur lors de la récupération de la catégorie');
        }
        const categoryData = await categoryResponse.json();
        setPlaceCategory(categoryData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setErrors(prev => ({ ...prev, load: error.message }));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [slug, citySlug]);
  
  // Fonction pour convertir un slug en nom formaté
  const formatName = (slug) => {
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
  
  const cityName = cityData ? cityData.name : formatName(citySlug);
  const countryName = cityData ? cityData.country_name : formatName(slug);
  
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
    
    if (!placeName.trim()) {
      newErrors.placeName = 'Le nom du lieu est requis';
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
    
    setIsSubmitting(true);
    
    try {
      const placeSlug = createSlug(placeName);
      
      if (imageFile) {
        // Si une image est téléchargée, utiliser FormData
        const formData = new FormData();
        formData.append('name', placeName);
        formData.append('slug', placeSlug);
        formData.append('city_id', cityData.id);
        formData.append('category_id', placeCategory.id);
        formData.append('description', description);
        formData.append('location', address);
        formData.append('image', imageFile);
        
        console.log('Envoi du formulaire avec image avec les champs:', Array.from(formData.keys()));
        await placesAPI.createWithImage(formData);
      } else {
        // Sinon, utiliser JSON
        const placeData = {
          name: placeName,
          slug: placeSlug,
          city_id: cityData.id,
          category_id: placeCategory.id,
          description: description,
          location: address
        };
        
        console.log('Envoi des données sans image:', placeData);
        await placesAPI.create(placeData);
      }
      
      // Rediriger vers la page des lieux à visiter
      router.push(`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`);
    } catch (error) {
      console.error('Erreur lors de la création du lieu:', error);
      setErrors(prev => ({ ...prev, submit: 'Erreur lors de la création du lieu. Vérifiez que la catégorie existe.' }));
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations de la ville...</p>
        
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
  
  return (
    <AuthCheck>
      <div className="add-place-container">
        <div className="page-header">
          <h1>Ajouter un lieu à visiter à {cityName}</h1>
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> &gt; 
            <Link href="/countries">Pays</Link> &gt; 
            <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
            <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
            <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`}>Lieux à visiter</Link> &gt; 
            <span>Ajouter</span>
          </div>
          <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`} className="back-button">
            Retour aux lieux à visiter
          </Link>
        </div>
        
        {errors.general && (
          <div className="error-banner">
            {errors.general}
          </div>
        )}
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="placeName">Nom du lieu *</label>
              <input
                type="text"
                id="placeName"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="Ex: Tour Eiffel, Musée du Louvre..."
                className={errors.placeName ? 'error' : ''}
              />
              {errors.placeName && <div className="error-message">{errors.placeName}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez ce lieu touristique..."
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
                placeholder="Ex: 1 Rue du Musée, 75001 Paris"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <div className="error-message">{errors.address}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Image (optionnelle)</label>
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
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter ce lieu'}
              </button>
            </div>
          </form>
        </div>
        
        <style jsx>{`
          .add-place-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Montserrat', Arial, sans-serif;
            color: var(--text);
          }
          
          .page-header {
            margin-bottom: 30px;
          }
          
          h1 {
            font-size: 2rem;
            color: var(--text-dark);
            margin-bottom: 10px;
          }
          
          .breadcrumb {
            color: var(--text-light);
            margin-bottom: 20px;
          }
          
          .breadcrumb a {
            color: var(--primary);
            text-decoration: none;
          }
          
          .breadcrumb a:hover {
            text-decoration: underline;
          }
          
          .back-button {
            display: inline-block;
            background-color: var(--primary);
            color: var(--white);
            padding: 10px 15px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-bottom: 20px;
            transition: background-color 0.3s;
          }
          
          .back-button:hover {
            background-color: var(--primary-dark);
          }
          
          .error-banner {
            background-color: rgba(231, 76, 60, 0.8);
            color: var(--white);
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          
          .form-container {
            background-color: var(--card-bg);
            padding: 30px;
            border-radius: 10px;
            box-shadow: var(--card-shadow);
          }
          
          .form-group {
            margin-bottom: 25px;
          }
          
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: var(--text-dark);
          }
          
          input, textarea {
            width: 100%;
            padding: 12px;
            background-color: var(--dark-light);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            font-size: 16px;
            font-family: inherit;
            color: var(--text);
            transition: border-color 0.3s;
          }
          
          input:focus, textarea:focus {
            border-color: var(--primary);
            outline: none;
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
            background-color: rgba(231, 76, 60, 0.2);
            border-radius: 5px;
          }
          
          .form-actions {
            margin-top: 30px;
          }
          
          .submit-button {
            background-color: var(--primary);
            color: var(--white);
            border: none;
            padding: 12px 25px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
            box-shadow: 0 4px 6px rgba(33, 150, 243, 0.3);
          }
          
          .submit-button:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(33, 150, 243, 0.4);
          }
          
          .submit-button:disabled {
            background-color: #566573;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
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
            display: inline-block;
            background-color: var(--dark-light);
            color: var(--text);
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
          }
          
          .file-input-button:hover {
            background-color: var(--primary);
            color: var(--white);
          }
          
          .file-input-help {
            font-size: 0.8rem;
            color: var(--text-light);
            margin-top: 5px;
          }
          
          .image-preview-container {
            margin-top: 20px;
            margin-bottom: 30px;
          }
          
          .image-preview-container h3 {
            font-size: 1.2rem;
            margin-bottom: 10px;
            color: var(--text-dark);
          }
          
          .image-preview {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background-color: var(--dark-light);
          }
          
          .image-preview img {
            width: 100%;
            height: auto;
            display: block;
          }
        `}</style>
      </div>
    </AuthCheck>
  );
} 