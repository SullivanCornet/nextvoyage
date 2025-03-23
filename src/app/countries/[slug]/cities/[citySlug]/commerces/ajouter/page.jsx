'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { citiesAPI, placesAPI } from '@/services/api';
import AuthCheck from '@/app/components/AuthCheck';

export default function AddShop() {
  const params = useParams();
  const { slug, citySlug } = params;
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
  const [isLoading, setIsLoading] = useState(true);
  const [commerceCategory, setCommerceCategory] = useState(null);
  
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
        
        // Récupérer la catégorie "Commerces"
        const categoryResponse = await fetch(`/api/categories/commerces`);
        const responseText = await categoryResponse.text();
        
        try {
          const categoryData = JSON.parse(responseText);
          setCommerceCategory(categoryData);
        } catch (parseError) {
          console.error('Erreur de parsing:', parseError);
        }
        
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
    
    // Vérifier que commerceCategory a bien été récupéré
    if (!commerceCategory) {
      setErrors(prev => ({ 
        ...prev, 
        submit: 'La catégorie "Commerces" n\'a pas été trouvée. Veuillez vous rendre à la page de diagnostic pour initialiser les catégories.' 
      }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const shopSlug = createSlug(shopName);
      
      // Utiliser le service d'upload unifié pour l'image, si présente
      let imagePath = null;
      
      if (imageFile) {
        // Uploader l'image avec le service d'upload unifié
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        const uploadResponse = await fetch(`/api/upload?category=shops&field=image`, {
          method: 'POST',
          body: imageFormData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Erreur lors de l\'upload de l\'image');
        }
        
        const uploadResult = await uploadResponse.json();
        imagePath = uploadResult.url;
      }
      
      // Préparer les données du commerce avec le chemin de l'image
      const shopData = {
        name: shopName,
        slug: shopSlug,
        city_id: cityData.id,
        category_id: commerceCategory.id,
        description: description,
        location: address,
        image_path: imagePath
      };
      
      console.log('Données du commerce à créer:', shopData);
      
      // Créer le commerce avec l'API
      await placesAPI.create(shopData);
      
      // Rediriger vers la page des commerces
      router.push(`/countries/${slug}/cities/${citySlug}/commerces`);
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: 'Erreur lors de la création du commerce' }));
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
      <div className="add-shop-container">
        <div className="page-header">
          <h1>Ajouter un commerce à {cityName}</h1>
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> &gt; 
            <Link href="/countries">Pays</Link> &gt; 
            <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
            <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
            <Link href={`/countries/${slug}/cities/${citySlug}/commerces`}>Commerces</Link> &gt; 
            <span>Ajouter</span>
          </div>
          <Link href={`/countries/${slug}/cities/${citySlug}/commerces`} className="back-button">
            Retour aux commerces
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
                <div className="file-input-button">Choisir une image</div>
              </div>
              <div className="file-input-help">Format recommandé: 800x600 pixels, JPG ou PNG</div>
            </div>
            
            {imagePreview && (
              <div className="image-preview-container">
                <h3>Aperçu de l'image</h3>
                <div className="image-preview">
                  <img src={imagePreview} alt={`Aperçu de l'image pour le commerce ${shopName || ''}`} />
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
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter ce commerce'}
              </button>
            </div>
          </form>
        </div>
        
        <style jsx>{`
          .add-shop-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Montserrat', Arial, sans-serif;
            color: var(--text);
          }
          
          .page-header {
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          h1 {
            color: var(--text-dark);
            font-size: 1.8rem;
            margin: 0 0 10px 0;
          }
          
          .breadcrumb {
            font-size: 0.9rem;
            margin-bottom: 15px;
            color: var(--text-light);
          }
          
          .breadcrumb a {
            color: var(--primary);
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
            background-color: var(--primary);
            color: var(--white);
            padding: 8px 16px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
          }
          
          .back-button:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
          }
          
          .error-banner {
            background-color: rgba(231, 76, 60, 0.8);
            color: var(--white);
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .form-container {
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
            font-weight: bold;
            color: var(--text-dark);
          }
          
          input[type="text"],
          textarea {
            width: 100%;
            padding: 12px;
            background-color: var(--dark-light);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            font-size: 1rem;
            color: var(--text);
            transition: border-color 0.3s ease;
          }
          
          input[type="text"]:focus,
          textarea:focus {
            border-color: var(--primary);
            outline: none;
          }
          
          input[type="text"].error,
          textarea.error {
            border-color: #e74c3c;
          }
          
          .error-message {
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 5px;
          }
          
          .submit-error {
            background-color: rgba(231, 76, 60, 0.2);
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            color: #e74c3c;
          }
          
          .form-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
          }
          
          .submit-button {
            background-color: var(--primary);
            color: var(--white);
            border: none;
            padding: 12px 25px;
            border-radius: 5px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
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