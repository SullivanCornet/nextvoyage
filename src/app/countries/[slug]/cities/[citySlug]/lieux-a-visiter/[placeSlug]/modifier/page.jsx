'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { placesAPI } from '@/services/api';

export default function EditPlace() {
  const params = useParams();
  const { slug, citySlug, placeSlug } = params;
  const router = useRouter();
  
  // États pour le formulaire - Initialisés avec des chaînes vides pour éviter les problèmes controlled/uncontrolled
  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [cityData, setCityData] = useState(null);
  const [placeData, setPlaceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeCategory, setPlaceCategory] = useState(null);
  
  // Charger les informations du lieu et de la ville
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
        
        // Récupérer le lieu à visiter
        const placeResponse = await fetch(`/api/places/${placeSlug}?city_id=${cityData.id}`);
        if (!placeResponse.ok) {
          throw new Error('Erreur lors de la récupération du lieu à visiter');
        }
        const placeData = await placeResponse.json();
        console.log('Données du lieu récupérées:', placeData);
        
        // Vérifier les propriétés d'adresse disponibles
        console.log('Propriétés d\'adresse dans les données:', {
          location: placeData.location,
          address: placeData.address,
          locationDefined: typeof placeData.location !== 'undefined',
          addressDefined: typeof placeData.address !== 'undefined'
        });
        
        setPlaceData(placeData);
        
        // Initialiser les champs du formulaire avec des valeurs par défaut
        setPlaceName(placeData.name || '');
        setDescription(placeData.description || '');
        
        // IMPORTANT: Dans notre base de données, l'adresse est stockée dans le champ 'location'
        // Récupérer directement location et être sûr qu'il s'agit d'une chaîne de caractères
        if (placeData.location) {
          console.log('Utilisation de placeData.location:', placeData.location);
          setAddress(placeData.location);
        } else {
          console.log('Aucune valeur de location trouvée, initialisation avec chaîne vide');
          setAddress('');
        }
        
        // Gérer l'image
        if (placeData.image_path) {
          setImagePreview(placeData.image_path);
        }
        
        // Récupérer la catégorie "Lieux à visiter"
        const categoryResponse = await fetch(`/api/categories/lieux-a-visiter`);
        if (!categoryResponse.ok) {
          throw new Error('Erreur lors de la récupération de la catégorie');
        }
        const categoryData = await categoryResponse.json();
        setPlaceCategory(categoryData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setErrors(prev => ({ ...prev, general: 'Erreur lors du chargement des données: ' + error.message }));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [slug, citySlug, placeSlug]);
  
  // Fonction pour convertir un slug en nom formaté
  const formatName = (str) => {
    if (!str) return '';
    return str
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
  const originalPlaceName = placeData ? placeData.name : formatName(placeSlug);
  
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
  
  // Validation du formulaire - Version simple et robuste
  const validateForm = () => {
    const newErrors = {};
    
    if (!placeName || placeName.trim() === '') {
      newErrors.placeName = 'Le nom du lieu est requis';
    }
    
    if (!description || description.trim() === '') {
      newErrors.description = 'La description est requise';
    } else if (description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }
    
    if (!address || address.trim() === '') {
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
    
    // Vérifier que placeCategory a bien été récupéré
    if (!placeCategory) {
      setErrors(prev => ({ 
        ...prev, 
        submit: 'La catégorie "Lieux à visiter" n\'a pas été trouvée. Veuillez vous rendre à la page de diagnostic pour initialiser les catégories.' 
      }));
      return;
    }
    
    // Vérifier que placeData existe et a un ID
    if (!placeData || !placeData.id) {
      setErrors(prev => ({ 
        ...prev, 
        submit: 'Données du lieu incomplètes. Impossible de continuer la modification.' 
      }));
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Créer un slug à partir du nom
      const newPlaceSlug = createSlug(placeName);
      console.log('Nouvelle soumission avec le slug:', newPlaceSlug);
      
      if (imageFile) {
        // Si une nouvelle image est téléchargée, utiliser FormData
        const formData = new FormData();
        formData.append('id', placeData.id);
        formData.append('name', placeName);
        formData.append('slug', newPlaceSlug);
        formData.append('description', description);
        
        // IMPORTANT: Toujours envoyer l'adresse sous le nom de champ 'location'
        // C'est ce qui est utilisé dans la base de données
        formData.append('location', address); 
        formData.append('image', imageFile);
        
        // Ajouter les IDs de ville et catégorie
        if (placeData.city_id) {
          formData.append('city_id', placeData.city_id);
        }
        
        if (placeData.category_id) {
          formData.append('category_id', placeData.category_id);
        }
        
        console.log('Envoi avec image - formData contient les champs:', 
          Array.from(formData.keys()).join(', '));
        
        await placesAPI.updateWithImage(formData);
      } else {
        // Sinon, utiliser JSON
        const updatedPlaceData = {
          id: placeData.id,
          name: placeName,
          slug: newPlaceSlug,
          description: description,
          
          // IMPORTANT: Toujours envoyer l'adresse sous le nom de champ 'location'
          // C'est ce qui est utilisé dans la base de données
          location: address, 
          
          category_id: placeData.category_id,
          city_id: placeData.city_id
        };
        
        console.log('Mise à jour sans image:', updatedPlaceData);
        
        await placesAPI.update(updatedPlaceData);
      }
      
      // Rediriger vers la page de détail du lieu (avec le nouveau slug si changé)
      router.push(`/countries/${slug}/cities/${citySlug}/lieux-a-visiter/${newPlaceSlug}`);
    } catch (error) {
      console.error('Erreur lors de la modification du lieu:', error);
      setErrors(prev => ({ ...prev, submit: 'Erreur lors de la modification du lieu: ' + error.message }));
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations du lieu...</p>
        
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
    <div className="edit-place-container">
      <div className="page-header">
        <h1>Modifier {originalPlaceName}</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/countries">Pays</Link> &gt; 
          <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`}>Lieux à visiter</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter/${placeSlug}`}>{originalPlaceName}</Link> &gt; 
          <span>Modifier</span>
        </div>
        <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter/${placeSlug}`} className="back-button">
          Annuler les modifications
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
              <div className="file-input-button">Choisir une nouvelle image</div>
            </div>
            <div className="file-input-help">
              {placeData && placeData.image_path 
                ? 'Une image existe déjà. Sélectionnez une nouvelle image pour la remplacer.' 
                : 'Format recommandé: 800x600 pixels, JPG ou PNG'}
            </div>
          </div>
          
          {imagePreview && (
            <div className="image-preview-container">
              <h3>Image actuelle</h3>
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
              {isSubmitting ? 'Modification en cours...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .edit-place-container {
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
          background-color: #3498db;
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
          background-color: #2980b9;
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