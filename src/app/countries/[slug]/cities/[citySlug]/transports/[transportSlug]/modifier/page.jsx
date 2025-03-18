'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBus, FaArrowLeft, FaSave } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ModifierTransport() {
  const router = useRouter();
  const { slug, citySlug, transportSlug } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    transport_type: '',
    price_info: '',
    schedule: '',
    tips: ''
  });
  
  const [currentImage, setCurrentImage] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const fetchTransport = async () => {
      try {
        // Récupération des données du transport
        const transportsResponse = await fetch(`/api/countries/${slug}/cities/${citySlug}/transports`);
        if (!transportsResponse.ok) {
          throw new Error('Erreur lors de la récupération des transports');
        }
        
        const transportsData = await transportsResponse.json();
        const transport = transportsData.find(
          t => t.slug === transportSlug || t.id.toString() === transportSlug
        );
        
        if (!transport) {
          throw new Error('Transport non trouvé');
        }
        
        // Initialisation du formulaire avec les données du transport
        setFormData({
          name: transport.name || '',
          description: transport.description || '',
          transport_type: transport.transport_type || '',
          price_info: transport.price_info || '',
          schedule: transport.schedule || '',
          tips: transport.tips || ''
        });
        
        if (transport.image_path) {
          setCurrentImage(transport.image_path);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchTransport();
  }, [slug, citySlug, transportSlug]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      
      const response = await fetch('/api/upload?folder=transports', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Erreur lors de l'upload de l'image: ${data.error || 'Erreur inconnue'}`);
      }
      
      return data.url || data.filePath;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      let imagePath = currentImage;
      if (image) {
        imagePath = await uploadImage(image);
      }
      
      const transportData = {
        ...formData,
        image_path: imagePath,
      };
      
      // Récupération de l'ID du transport
      const transportsResponse = await fetch(`/api/countries/${slug}/cities/${citySlug}/transports`);
      const transportsData = await transportsResponse.json();
      const transport = transportsData.find(
        t => t.slug === transportSlug || t.id.toString() === transportSlug
      );
      
      if (!transport) {
        throw new Error('Transport non trouvé');
      }
      
      // Mise à jour du transport
      const response = await fetch(`/api/transports/${transport.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transportData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification du transport');
      }
      
      setSuccess(true);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push(`/countries/${slug}/cities/${citySlug}/transports/${transportSlug}`);
      }, 2000);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setSaving(false);
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
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="modifier-transport-container">
      <div className="page-header">
        <Link 
          href={`/countries/${slug}/cities/${citySlug}/transports/${transportSlug}`} 
          className="back-link"
        >
          <FaArrowLeft /> Retour au transport
        </Link>
        <h1 className="page-title">
          <FaBus className="header-icon" /> Modifier le transport
        </h1>
      </div>
      
      {success ? (
        <div className="success-message">
          <p>Le transport a été modifié avec succès!</p>
          <p>Vous allez être redirigé vers les détails du transport...</p>
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
                {currentImage && !imagePreview && (
                  <div className="current-image-container">
                    <img 
                      src={currentImage} 
                      alt="Image actuelle" 
                      className="current-image"
                    />
                    <span className="current-image-label">Image actuelle</span>
                  </div>
                )}
                {imagePreview && (
                  <div className="image-preview-container">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu de l'image" 
                      className="image-preview"
                    />
                    <span className="preview-label">Nouvelle image</span>
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <small className="input-help">
                  Laissez vide pour conserver l'image actuelle
                </small>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <Link
              href={`/countries/${slug}/cities/${citySlug}/transports/${transportSlug}`}
              className="cancel-button"
            >
              Annuler
            </Link>
            <button 
              type="submit" 
              className="save-button"
              disabled={saving}
            >
              <FaSave className="save-icon" />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      )}
      
      <style jsx>{`
        .modifier-transport-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .page-header {
          margin-bottom: 25px;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          color: #4a6fa5;
          text-decoration: none;
          margin-bottom: 10px;
          transition: color 0.3s;
        }
        
        .back-link:hover {
          color: #3a5a80;
          text-decoration: underline;
        }
        
        .page-title {
          font-size: 1.8rem;
          color: #2c3e50;
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
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 25px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 30px;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          font-weight: bold;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .form-group textarea {
          resize: vertical;
        }
        
        .current-image-container,
        .image-preview-container {
          margin-bottom: 10px;
          position: relative;
        }
        
        .current-image,
        .image-preview {
          max-width: 100%;
          max-height: 200px;
          border-radius: 4px;
          display: block;
        }
        
        .current-image-label,
        .preview-label {
          display: inline-block;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-top: 5px;
        }
        
        .input-help {
          display: block;
          color: #7f8c8d;
          margin-top: 5px;
          font-size: 0.9rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
        }
        
        .cancel-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          background-color: #95a5a6;
          color: white;
          border-radius: 4px;
          text-decoration: none;
          transition: background-color 0.3s;
        }
        
        .cancel-button:hover {
          background-color: #7f8c8d;
        }
        
        .save-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          background-color: #4a6fa5;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s;
        }
        
        .save-button:hover {
          background-color: #3a5a80;
        }
        
        .save-button:disabled {
          background-color: #4a6fa5;
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .save-icon {
          margin-right: 8px;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }
        
        .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 20px;
          border-radius: 4px;
          margin-top: 20px;
          border: 1px solid #c3e6cb;
          text-align: center;
        }
      `}</style>
    </div>
  );
} 