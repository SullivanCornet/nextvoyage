'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBed, FaArrowLeft, FaSave } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import AuthCheck from '@/app/components/AuthCheck';

export default function ModifierLogement() {
  const router = useRouter();
  const { slug, citySlug, logementSlug } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    accommodation_type: '',
    location: '',
    price_range: '',
    comfort_level: 3,
    phone: '',
    website: ''
  });
  
  const [currentImage, setCurrentImage] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const fetchLogement = async () => {
      try {
        // Récupération des données du logement
        const logementsResponse = await fetch(`/api/countries/${slug}/cities/${citySlug}/accommodations`);
        if (!logementsResponse.ok) {
          throw new Error('Erreur lors de la récupération des logements');
        }
        
        const logementsData = await logementsResponse.json();
        const logement = logementsData.find(
          l => l.slug === logementSlug || l.id.toString() === logementSlug
        );
        
        if (!logement) {
          throw new Error('Logement non trouvé');
        }
        
        // Initialisation du formulaire avec les données du logement
        setFormData({
          name: logement.name || '',
          description: logement.description || '',
          accommodation_type: logement.accommodation_type || '',
          // Dans la BDD c'est 'address' mais l'interface utilise 'location'
          location: logement.location || logement.address || '',
          price_range: logement.price_range || '',
          comfort_level: logement.comfort_level || 3,
          phone: logement.phone || '',
          website: logement.website || ''
        });
        
        if (logement.image_path) {
          setCurrentImage(logement.image_path);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchLogement();
  }, [slug, citySlug, logementSlug]);
  
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
      
      const response = await fetch('/api/upload?folder=accommodations', {
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
      
      // Préparer les données pour l'API - l'API attend 'address' mais notre interface utilise 'location'
      const logementData = {
        ...formData,
        image_path: imagePath,
        address: formData.location // Assurer la compatibilité avec l'API
      };
      
      // Récupération de l'ID du logement
      const logementsResponse = await fetch(`/api/countries/${slug}/cities/${citySlug}/accommodations`);
      const logementsData = await logementsResponse.json();
      const logement = logementsData.find(
        l => l.slug === logementSlug || l.id.toString() === logementSlug
      );
      
      if (!logement) {
        throw new Error('Logement non trouvé');
      }
      
      // Mise à jour du logement
      const response = await fetch(`/api/accommodations/${logement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logementData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification du logement');
      }
      
      setSuccess(true);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push(`/countries/${slug}/cities/${citySlug}/logements/${logementSlug}`);
      }, 2000);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setSaving(false);
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
  
  const niveauxDeConfort = [1, 2, 3, 4, 5];
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <AuthCheck>
      <div className="modifier-logement-container">
        <div className="page-header">
          <Link 
            href={`/countries/${slug}/cities/${citySlug}/logements/${logementSlug}`} 
            className="back-link"
          >
            <FaArrowLeft /> Retour au logement
          </Link>
          <h1 className="page-title">
            <FaBed className="header-icon" /> Modifier le logement
          </h1>
        </div>
        
        {success ? (
          <div className="success-message">
            <p>Le logement a été modifié avec succès!</p>
            <p>Vous allez être redirigé vers les détails du logement...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="logement-form">
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
                    placeholder="Ex: Hôtel des Voyageurs"
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
                  <label htmlFor="location">Adresse / Emplacement</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: 123 Avenue des Palmiers"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="price_range">Gamme de prix</label>
                  <select
                    id="price_range"
                    name="price_range"
                    value={formData.price_range}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionnez une gamme de prix</option>
                    {fourchettePrix.map(prix => (
                      <option key={prix.id} value={prix.id}>{prix.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="comfort_level">Niveau de confort</label>
                  <select
                    id="comfort_level"
                    name="comfort_level"
                    value={formData.comfort_level}
                    onChange={handleChange}
                  >
                    {niveauxDeConfort.map(niveau => (
                      <option key={niveau} value={niveau}>
                        {niveau} {niveau === 1 ? 'étoile' : 'étoiles'}
                      </option>
                    ))}
                  </select>
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
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Téléphone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: +33 1 23 45 67 89"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="website">Site web</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Ex: https://www.example.com"
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
                href={`/countries/${slug}/cities/${citySlug}/logements/${logementSlug}`}
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
          .modifier-logement-container {
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
          
          .logement-form {
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
    </AuthCheck>
  );
} 