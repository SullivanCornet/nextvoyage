'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { citiesAPI, placesAPI } from '@/services/api';

export default function EditShop() {
  const params = useParams();
  const { slug, citySlug, shopSlug } = params;
  const router = useRouter();
  
  // États pour le formulaire
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [cityData, setCityData] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger les informations de la ville et du commerce
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations de la ville
        const city = await citiesAPI.getBySlug(citySlug, slug);
        setCityData(city);
        
        // Récupérer les informations du commerce
        const shop = await placesAPI.getBySlug(shopSlug, citySlug);
        setShopData(shop);
        
        // Pré-remplir le formulaire
        setShopName(shop.name);
        setDescription(shop.description);
        setAddress(shop.address);
        
        if (shop.image) {
          setImagePreview(`/uploads/${shop.image}`);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setErrors(prev => ({ ...prev, general: 'Erreur lors du chargement des données' }));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [citySlug, slug, shopSlug]);
  
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
  const originalShopName = shopData ? shopData.name : formatName(shopSlug);
  
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
    
    if (!shopName.trim()) {
      newErrors.shopName = 'Le nom du commerce est requis';
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
      const newShopSlug = createSlug(shopName);
      
      if (imageFile) {
        // Si une nouvelle image est téléchargée, utiliser FormData
        const formData = new FormData();
        formData.append('id', shopData.id);
        formData.append('name', shopName);
        formData.append('slug', newShopSlug);
        formData.append('description', description);
        formData.append('address', address);
        formData.append('image', imageFile);
        
        await placesAPI.updateWithImage(formData);
      } else {
        // Sinon, utiliser JSON
        const updatedShopData = {
          id: shopData.id,
          name: shopName,
          slug: newShopSlug,
          description: description,
          address: address
        };
        
        await placesAPI.update(updatedShopData);
      }
      
      // Rediriger vers la page de détail du commerce (avec le nouveau slug si changé)
      router.push(`/countries/${slug}/cities/${citySlug}/commerces/${newShopSlug}`);
    } catch (error) {
      console.error('Erreur lors de la modification du commerce:', error);
      setErrors(prev => ({ ...prev, submit: 'Erreur lors de la modification du commerce' }));
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations du commerce...</p>
        
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
    <div className="edit-shop-container">
      <div className="page-header">
        <h1>Modifier {originalShopName}</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/countries">Pays</Link> &gt; 
          <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}/commerces`}>Commerces</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}/commerces/${shopSlug}`}>{originalShopName}</Link> &gt; 
          <span>Modifier</span>
        </div>
        <Link href={`/countries/${slug}/cities/${citySlug}/commerces/${shopSlug}`} className="back-button">
          Annuler et retourner au commerce
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
            <label htmlFor="shopName">Nom du commerce *</label>
            <input
              type="text"
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Ex: Boulangerie du Centre, Marché Bio..."
              className={errors.shopName ? 'error' : ''}
            />
            {errors.shopName && <div className="error-message">{errors.shopName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez ce commerce..."
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
              placeholder="Ex: 123 Rue du Commerce, 75001 Paris"
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
              {shopData.image 
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
        .edit-shop-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .page-header {
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        h1 {
          color: #2c3e50;
          font-size: 1.8rem;
          margin: 0 0 10px 0;
        }
        
        .breadcrumb {
          font-size: 0.9rem;
          margin-bottom: 15px;
          color: #7f8c8d;
        }
        
        .breadcrumb a {
          color: #3498db;
          text-decoration: none;
          margin: 0 5px;
        }
        
        .breadcrumb a:first-child {
          margin-left: 0;
        }
        
        .breadcrumb a:hover {
          text-decoration: underline;
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
        
        .error-banner {
          background-color: #e74c3c;
          color: white;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
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