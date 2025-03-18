'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { placesAPI } from '@/services/api';

export default function AjouterLieu() {
  const router = useRouter();
  
  // États pour le formulaire
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [cityId, setCityId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // États pour les données
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger les villes et les catégories au chargement de la page
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Charger les villes et les catégories
        const [citiesResponse, categoriesResponse] = await Promise.all([
          fetch('/api/cities'),
          fetch('/api/categories')
        ]);
        
        if (!citiesResponse.ok || !categoriesResponse.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        
        const citiesData = await citiesResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setCities(citiesData);
        setCategories(categoriesData);
        
        // Si des catégories existent, sélectionner la première par défaut
        if (categoriesData.length > 0) {
          setCategoryId(categoriesData[0].id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setErrors(prev => ({ ...prev, loading: 'Erreur lors du chargement des données' }));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFormData();
  }, []);
  
  // Générer un slug à partir du nom
  useEffect(() => {
    if (name) {
      setSlug(createSlug(name));
    }
  }, [name]);
  
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
  
  // Gérer le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Créer une URL pour la prévisualisation de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Le nom du lieu est requis';
    }
    
    if (!slug.trim()) {
      newErrors.slug = 'Le slug est requis';
    }
    
    if (!cityId) {
      newErrors.cityId = 'La ville est requise';
    }
    
    if (!categoryId) {
      newErrors.categoryId = 'La catégorie est requise';
    }
    
    if (!description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({ ...errors, submit: '' });
    setSuccessMessage('');
    
    try {
      console.log('Début de la soumission du formulaire');
      
      // Créer un objet FormData pour l'envoi avec l'image
      const formData = new FormData();
      
      // Ajouter les champs du formulaire
      formData.append('name', name);
      formData.append('slug', slug || name.toLowerCase().replace(/\s+/g, '-'));
      formData.append('city_id', cityId);
      formData.append('category_id', categoryId);
      formData.append('description', description);
      formData.append('location', address); // Utiliser location plutôt que address
      
      // Diagnostiquer le cas où image est null ou undefined
      if (!imageFile) {
        console.log('Aucune image sélectionnée');
        formData.append('hasImageFile', 'false');
      } else {
        console.log('Image sélectionnée:', imageFile.name, 'taille:', imageFile.size);
        formData.append('hasImageFile', 'true');
        formData.append('image', imageFile);
      }
      
      // Afficher les données du formulaire pour déboguer
      console.log('FormData préparé avec les champs:', Array.from(formData.keys()));
      
      // Test préliminaire pour les uploads d'images (diagnostic)
      if (imageFile) {
        console.log('Test préliminaire d\'upload d\'image...');
        try {
          const testImageData = new FormData();
          testImageData.append('testImage', imageFile);
          
          const testResponse = await fetch('/api/test-upload', {
            method: 'POST',
            body: testImageData
          });
          
          const testResult = await testResponse.json();
          console.log('Résultat du test d\'upload:', testResult);
          
          if (!testResult.success) {
            throw new Error(`Test d'upload échoué: ${testResult.error}`);
          }
          
          console.log('Test d\'upload réussi, poursuite de la soumission...');
        } catch (testError) {
          console.error('Erreur lors du test d\'upload:', testError);
          throw new Error(`Problème avec l'upload d'image. Détails: ${testError.message}`);
        }
      }
      
      // Créer une promesse avec timeout pour éviter que la requête reste bloquée
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Délai d\'attente de la requête dépassé (30s)')), 30000);
      });
      
      // Soumettre le formulaire
      console.log('Envoi du formulaire au serveur...');
      const fetchPromise = fetch('/api/places/upload', {
        method: 'POST',
        body: formData,
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Vérifier la réponse du serveur
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur lors de l'ajout du lieu: ${errorData.error || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Réponse du serveur:', result);
      
      setSuccessMessage('Lieu ajouté avec succès!');
      
      // Rediriger vers la page du nouveau lieu ou la liste
      setTimeout(() => {
        window.location.href = `/villes/${cityId}`;
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      
      // Message d'erreur plus détaillé et convivial
      let errorMessage = `Une erreur est survenue: ${error.message}`;
      
      // Suggestions basées sur le type d'erreur
      if (error.message.includes('upload') || error.message.includes('image')) {
        errorMessage += '\n\nSuggestions:' +
          '\n- Essayez avec une image plus petite (moins de 5 Mo)' +
          '\n- Vérifiez que l\'image est au format JPG, PNG ou GIF' +
          '\n- Testez l\'upload d\'image séparément sur /test-upload';
      } else if (error.message.includes('délai')) {
        errorMessage += '\n\nLe serveur a mis trop de temps à répondre. Vérifiez:' +
          '\n- La connexion au serveur et à la base de données' +
          '\n- Les logs serveur pour plus d\'informations';
      }
      
      setErrors(prev => ({ 
        ...prev, 
        submit: errorMessage 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des données...</p>
        
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
    <div className="add-place-container">
      <div className="page-header">
        <h1>Ajouter un lieu</h1>
        <Link href="/" className="back-button">
          Retour à l'accueil
        </Link>
      </div>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {errors.loading && (
        <div className="error-message global-error">
          {errors.loading}
        </div>
      )}
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom du lieu *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tour Eiffel, Musée du Louvre..."
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="slug">Slug (URL) *</label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ex: tour-eiffel, musee-du-louvre..."
              className={errors.slug ? 'error' : ''}
            />
            {errors.slug && <div className="error-message">{errors.slug}</div>}
            <small className="help-text">L'identifiant unique utilisé dans l'URL. Généré automatiquement à partir du nom.</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="cityId">Ville *</label>
            <select
              id="cityId"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className={errors.cityId ? 'error' : ''}
            >
              <option value="">Sélectionnez une ville</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.cityId && <div className="error-message">{errors.cityId}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="categoryId">Catégorie *</label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={errors.categoryId ? 'error' : ''}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <div className="error-message">{errors.categoryId}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez ce lieu..."
              rows="4"
              className={errors.description ? 'error' : ''}
            ></textarea>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Adresse</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="5 Avenue Anatole France, 75007 Paris"
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleImageChange}
              className={errors.image ? 'error' : ''}
            />
            {errors.image && <div className="error-message">{errors.image}</div>}
            
            <div className="file-help">
              <p>Formats acceptés: JPG, PNG, GIF</p>
              <p>Taille maximale: 5 MB</p>
            </div>
            
            {imagePreview && (
              <div className="image-preview">
                <p>Aperçu de l'image :</p>
                <img 
                  src={imagePreview} 
                  alt="Aperçu" 
                  style={{ maxWidth: '100%', maxHeight: '200px' }} 
                />
              </div>
            )}
          </div>
          
          <div className="mt-4">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-4 whitespace-pre-line">
                {errors.submit}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded p-4 mb-4">
                {successMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded text-white font-medium ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
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
        
        .error-message {
          color: #e74c3c;
          font-size: 0.85rem;
          margin-top: 5px;
        }
        
        .global-error {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }
        
        .submit-error {
          background-color: #f8d7da;
          padding: 10px;
          border-radius: 5px;
          margin: 15px 0;
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
        input[type="file"],
        select,
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        
        input[type="text"]:focus,
        select:focus,
        textarea:focus {
          border-color: #3498db;
          outline: none;
        }
        
        .error {
          border-color: #e74c3c;
        }
        
        .help-text {
          display: block;
          color: #7f8c8d;
          font-size: 0.8rem;
          margin-top: 5px;
        }
        
        .image-preview {
          margin-top: 10px;
          padding: 10px;
          border: 1px dashed #ccc;
          border-radius: 5px;
          text-align: center;
        }
        
        .form-actions {
          margin-top: 30px;
          text-align: center;
        }
        
        .submit-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .submit-button:hover {
          background-color: #2980b9;
        }
        
        .submit-button:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }
        
        .file-help {
          margin-top: 8px;
          font-size: 0.8rem;
          color: #7f8c8d;
        }
        
        .file-help p {
          margin: 2px 0;
        }
        
        .error-help {
          margin-top: 10px;
          font-size: 0.85rem;
        }
        
        .error-help ul {
          margin-top: 5px;
          padding-left: 20px;
        }
        
        .error-help li {
          margin-bottom: 3px;
        }
      `}</style>
    </div>
  );
} 