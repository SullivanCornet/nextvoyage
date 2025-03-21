'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBed, FaArrowLeft } from 'react-icons/fa';
import AuthCheck from '@/app/components/AuthCheck';

export default function AjoutLogement() {
  const router = useRouter();
  const { slug, citySlug } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    accommodation_type: '',
    price_range: '',
    contact_info: '',
    website: '',
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Envoi de la requête d\'upload avec le fichier:', file.name, file.type, file.size);
      const response = await fetch('/api/upload?folder=accommodations', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log('Réponse du serveur:', data);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de l'upload de l'image: ${data.error || 'Erreur inconnue'}`);
      }
      
      return data.url || data.filePath;
    } catch (error) {
      console.error('Erreur détaillée lors de l\'upload:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      let imagePath = null;
      if (image) {
        imagePath = await uploadImage(image);
      }
      
      const accommodationData = {
        ...formData,
        image_path: imagePath,
      };
      
      const response = await fetch(`/api/countries/${slug}/cities/${citySlug}/accommodations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accommodationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du logement');
      }
      
      setSuccess(true);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push(`/countries/${slug}/cities/${citySlug}/logements`);
      }, 2000);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const typesDeLogement = [
    { id: 'hotel', name: 'Hôtel' },
    { id: 'appartement', name: 'Appartement' },
    { id: 'maison', name: 'Maison / Villa' },
    { id: 'auberge', name: 'Auberge de jeunesse' },
    { id: 'camping', name: 'Camping' },
    { id: 'chambre_hote', name: 'Chambre d\'hôte' },
    { id: 'gite', name: 'Gîte' },
    { id: 'autre', name: 'Autre' },
  ];
  
  const fourchettePrix = [
    { id: 'economique', name: '€ - Économique' },
    { id: 'moyen', name: '€€ - Intermédiaire' },
    { id: 'superieur', name: '€€€ - Supérieur' },
    { id: 'luxe', name: '€€€€ - Luxe' },
  ];
  
  return (
    <AuthCheck>
      <div className="add-accommodation-container">
        <div className="page-header">
          <Link 
            href={`/countries/${slug}/cities/${citySlug}/logements`} 
            className="back-link"
          >
            <FaArrowLeft /> Retour aux logements
          </Link>
          <h1 className="page-title">
            <FaBed className="header-icon" /> Ajouter un logement
          </h1>
        </div>
        
        {success ? (
          <div className="success-message">
            <p>Le logement a été ajouté avec succès!</p>
            <p>Vous allez être redirigé vers la liste des logements...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="accommodation-form">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="name">Nom du logement *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Hôtel du Palais"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="accommodation_type">Type de logement</label>
                  <select
                    id="accommodation_type"
                    name="accommodation_type"
                    value={formData.accommodation_type}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionnez un type</option>
                    {typesDeLogement.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="price_range">Gamme de prix</label>
                  <select
                    id="price_range"
                    name="price_range"
                    value={formData.price_range}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionnez une gamme</option>
                    {fourchettePrix.map(prix => (
                      <option key={prix.id} value={prix.id}>{prix.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Adresse / Localisation</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: 1 rue de la Paix, 75001"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contact_info">Informations de contact</label>
                  <input
                    type="text"
                    id="contact_info"
                    name="contact_info"
                    value={formData.contact_info}
                    onChange={handleChange}
                    placeholder="Ex: +33 1 23 45 67 89"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="website">Site internet</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Ex: https://www.example.com"
                  />
                </div>
              </div>
              
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez ce logement..."
                    rows="6"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="image">Image</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-input"
                    />
                    
                    <div className="image-preview-container">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Aperçu" className="image-preview" />
                      ) : (
                        <div className="image-placeholder">
                          <span>Sélectionner une image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                onClick={() => router.push(`/countries/${slug}/cities/${citySlug}/logements`)}
                className="cancel-button"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Ajouter le logement'}
              </button>
            </div>
          </form>
        )}
        
        <style jsx>{`
          .add-accommodation-container {
            max-width: 1000px;
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
          
          .back-link {
            display: inline-flex;
            align-items: center;
            color: var(--primary);
            text-decoration: none;
            margin-bottom: 10px;
            transition: color 0.3s ease;
          }
          
          .back-link:hover {
            color: var(--primary-dark);
            text-decoration: underline;
          }
          
          .back-link svg {
            margin-right: 5px;
          }
          
          .page-title {
            font-size: 2rem;
            color: var(--text-dark);
            margin: 0;
            display: flex;
            align-items: center;
          }
          
          .header-icon {
            margin-right: 10px;
            color: var(--primary);
          }
          
          .accommodation-form {
            background-color: var(--card-bg);
            border-radius: 12px;
            padding: 25px;
            box-shadow: var(--card-shadow);
          }
          
          .form-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          @media (min-width: 768px) {
            .form-grid {
              grid-template-columns: 1fr 1fr;
            }
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-dark);
          }
          
          input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            font-size: 1rem;
            background-color: var(--dark-light);
            color: var(--text);
            transition: border-color 0.3s ease;
          }
          
          input:focus, select:focus, textarea:focus {
            border-color: var(--primary);
            outline: none;
          }
          
          .image-upload-container {
            position: relative;
          }
          
          .image-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
            z-index: 10;
          }
          
          .image-preview-container {
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background-color: var(--dark-light);
          }
          
          .image-placeholder {
            color: var(--text-light);
            text-align: center;
          }
          
          .image-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 30px;
          }
          
          .cancel-button {
            padding: 12px 24px;
            background-color: var(--dark-light);
            color: var(--text);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
          }
          
          .cancel-button:hover {
            background-color: var(--dark);
            transform: translateY(-2px);
          }
          
          .submit-button {
            padding: 12px 24px;
            background-color: var(--primary);
            color: var(--white);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(33, 150, 243, 0.3);
          }
          
          .submit-button:hover:not(:disabled) {
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
          
          .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          
          .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          
          .success-message p:first-child {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 10px;
          }
        `}</style>
      </div>
    </AuthCheck>
  );
} 