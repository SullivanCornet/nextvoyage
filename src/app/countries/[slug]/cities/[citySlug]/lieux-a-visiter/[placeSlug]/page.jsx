'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PlaceDetail() {
  const params = useParams();
  const { slug, citySlug, placeSlug } = params;
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [place, setPlace] = useState(null);
  const [error, setError] = useState(null);
  
  // Récupérer les informations du lieu à visiter
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        // Récupérer les informations de la ville
        const cityResponse = await fetch(`/api/cities/${citySlug}?country_slug=${slug}`);
        if (!cityResponse.ok) {
          throw new Error('Erreur lors de la récupération des informations de la ville');
        }
        const cityData = await cityResponse.json();
        
        // Récupérer le lieu à visiter
        const placeResponse = await fetch(`/api/places/${placeSlug}?city_id=${cityData.id}`);
        if (!placeResponse.ok) {
          throw new Error('Erreur lors de la récupération du lieu à visiter');
        }
        const placeData = await placeResponse.json();
        setPlace(placeData);
        
        // Vérifier les propriétés du lieu pour le débogage
        console.log('Propriétés du lieu récupéré:', {
          id: placeData.id,
          name: placeData.name,
          location: placeData.location, // Vérifier si 'location' est présent et a une valeur
          address: placeData.address, // Vérifier si 'address' existe (ne devrait pas être utilisé)
          hasLocation: typeof placeData.location !== 'undefined',
          locationEmpty: placeData.location === null || placeData.location === ''
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    fetchPlace();
  }, [slug, citySlug, placeSlug]);
  
  // Fonction pour convertir un slug en nom formaté
  const formatName = (str) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Fonction pour supprimer le lieu
  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/places/${placeSlug}?city_id=${place.city_id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du lieu');
      }
      
      // Rediriger vers la liste des lieux à visiter
      router.push(`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression du lieu');
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
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Erreur</h2>
        <p>{error}</p>
        <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`} className="back-button">
          Retour aux lieux à visiter
        </Link>
        
        <style jsx>{`
          .error-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            margin-top: 50px;
            font-family: Arial, sans-serif;
          }
          
          .back-button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
            font-weight: bold;
          }
        `}</style>
      </div>
    );
  }
  
  const cityName = place?.city?.name || formatName(citySlug);
  const countryName = formatName(slug);
  const placeName = place?.name || formatName(placeSlug);
  const imagePath = place?.image_path || '/images/default-place.jpg';
  
  return (
    <div className="place-detail-container">
      <div className="page-header">
        <h1>{placeName}</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/countries">Pays</Link> &gt; 
          <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`}>Lieux à visiter</Link> &gt; 
          <span>{placeName}</span>
        </div>
        <div className="header-actions">
          <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`} className="back-button">
            Retour aux lieux à visiter
          </Link>
          <div className="action-buttons">
            <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter/${placeSlug}/modifier`} className="edit-button">
              Modifier
            </Link>
            <button onClick={handleDelete} className="delete-button">
              Supprimer
            </button>
          </div>
        </div>
      </div>
      
      <div className="place-content">
        <div className="place-image-container">
          <img src={imagePath} alt={placeName} className="place-image" />
        </div>
        
        <div className="place-info-container">
          <div className="place-info-section">
            <h2>À propos de ce lieu</h2>
            <p className="place-description">{place.description}</p>
          </div>
          
          <div className="place-info-section">
            <h2>Informations pratiques</h2>
            <div className="info-item">
              <div className="info-label">Adresse</div>
              <div className="info-value">{place.location || "Adresse non disponible"}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Catégorie</div>
              <div className="info-value">{place.category?.name || 'Lieu à visiter'}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Ville</div>
              <div className="info-value">{cityName}</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .place-detail-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        h1 {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        h2 {
          font-size: 1.8rem;
          color: #3498db;
          margin-bottom: 15px;
          margin-top: 0;
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
        
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .back-button {
          background-color: #7f8c8d;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
        }
        
        .edit-button {
          background-color: #3498db;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
        }
        
        .delete-button {
          background-color: #e74c3c;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 1rem;
        }
        
        .place-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .place-image-container {
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .place-image {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .place-info-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .place-info-section {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .place-description {
          color: #34495e;
          line-height: 1.6;
          margin: 0;
        }
        
        .info-item {
          margin-bottom: 15px;
          border-bottom: 1px solid #ecf0f1;
          padding-bottom: 10px;
        }
        
        .info-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .info-label {
          font-weight: bold;
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 5px;
        }
        
        .info-value {
          color: #2c3e50;
        }
        
        @media (max-width: 768px) {
          .place-content {
            grid-template-columns: 1fr;
          }
          
          .header-actions {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .action-buttons {
            width: 100%;
          }
          
          .edit-button, .delete-button {
            flex: 1;
            text-align: center;
          }
          
          h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
} 