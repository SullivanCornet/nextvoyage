'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBus, FaArrowLeft } from 'react-icons/fa';
import AuthCheck from '@/app/components/AuthCheck';

export default function AjoutTransport() {
  const router = useRouter();
  const { slug, citySlug } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    transport_type: '',
    price_info: '',
    schedule: '',
    tips: ''
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
      const response = await fetch('/api/upload?folder=transports', {
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
      
      const transportData = {
        ...formData,
        image_path: imagePath,
      };
      
      const response = await fetch(`/api/countries/${slug}/cities/${citySlug}/transports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transportData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du transport');
      }
      
      setSuccess(true);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push(`/countries/${slug}/cities/${citySlug}/transports`);
      }, 2000);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const typesDeTransport = [
    { id: 'metro', name: 'Métro' },
    { id: 'bus', name: 'Bus' },
    { id: 'tramway', name: 'Tramway' },
    { id: 'train', name: 'Train' },
    { id: 'ferry', name: 'Ferry / Bateau' },
    { id: 'taxi', name: 'Taxi' },
    { id: 'velo', name: 'Vélo / Vélo en libre-service' },
    { id: 'trottinette', name: 'Trottinette électrique' },
    { id: 'telecabine', name: 'Télécabine / Funiculaire' },
    { id: 'voiture', name: 'Location de voiture' },
    { id: 'autre', name: 'Autre' },
  ];
  
  return (
    <AuthCheck>
      <div className="add-transport-container">
        <div className="page-header">
          <Link 
            href={`/countries/${slug}/cities/${citySlug}/transports`} 
            className="back-link"
          >
            <FaArrowLeft /> Retour aux transports
          </Link>
          <h1 className="page-title">
            <FaBus className="header-icon" /> Ajouter un transport
          </h1>
        </div>
        
        {success ? (
          <div className="success-message">
            <p>Le transport a été ajouté avec succès!</p>
            <p>Vous allez être redirigé vers la liste des transports...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="transport-form">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="name">Nom du transport *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Métro ligne 1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="transport_type">Type de transport</label>
                  <select
                    id="transport_type"
                    name="transport_type"
                    value={formData.transport_type}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionnez un type</option>
                    {typesDeTransport.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="price_info">Informations sur les tarifs</label>
                  <input
                    type="text"
                    id="price_info"
                    name="price_info"
                    value={formData.price_info}
                    onChange={handleChange}
                    placeholder="Ex: 1.90€ le ticket, 7€ la journée"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="schedule">Horaires</label>
                  <textarea
                    id="schedule"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleChange}
                    placeholder="Ex: 5h30-00h30 du lundi au vendredi, 6h-2h le week-end"
                    rows="3"
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
                    placeholder="Décrivez ce moyen de transport..."
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="tips">Conseils et astuces</label>
                  <textarea
                    id="tips"
                    name="tips"
                    value={formData.tips}
                    onChange={handleChange}
                    placeholder="Ex: Évitez aux heures de pointe entre 8h et 9h"
                    rows="3"
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
                onClick={() => router.push(`/countries/${slug}/cities/${citySlug}/transports`)}
                className="cancel-button"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Ajouter le transport'}
              </button>
            </div>
          </form>
        )}
        
        <style jsx>{`
          .add-transport-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .page-header {
            margin-bottom: 30px;
          }
          
          .back-link {
            display: inline-flex;
            align-items: center;
            color: #4a6fa5;
            text-decoration: none;
            margin-bottom: 10px;
            transition: color 0.3s ease;
          }
          
          .back-link:hover {
            color: #3a5a80;
            text-decoration: underline;
          }
          
          .back-link svg {
            margin-right: 5px;
          }
          
          .page-title {
            font-size: 2rem;
            color: #333;
            margin: 0;
            display: flex;
            align-items: center;
          }
          
          .header-icon {
            margin-right: 10px;
            color: #4a6fa5;
          }
          
          .transport-form {
            background-color: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
            color: #333;
          }
          
          input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
          }
          
          input:focus, select:focus, textarea:focus {
            border-color: #4a6fa5;
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
            border: 2px dashed #ddd;
            border-radius: 6px;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          
          .image-placeholder {
            color: #888;
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
            background-color: #f1f1f1;
            color: #333;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s ease;
          }
          
          .cancel-button:hover {
            background-color: #e3e3e3;
          }
          
          .submit-button {
            padding: 12px 24px;
            background-color: #4a6fa5;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s ease;
          }
          
          .submit-button:hover:not(:disabled) {
            background-color: #3a5a80;
          }
          
          .submit-button:disabled {
            background-color: #a0aec0;
            cursor: not-allowed;
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