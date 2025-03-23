'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '@/styles/button-styles.css';

export default function CityDetail() {
  const params = useParams();
  const router = useRouter();
  const { slug, citySlug } = params;
  const { isAuthenticated, isModerator } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Récupérer les données de la ville depuis l'API
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        // D'abord, récupérer l'ID du pays
        const countryResponse = await fetch(`/api/countries/${slug}`);
        if (!countryResponse.ok) {
          throw new Error('Erreur lors de la récupération des données du pays');
        }
        const countryData = await countryResponse.json();
        
        // Ensuite, récupérer les villes de ce pays
        const citiesResponse = await fetch(`/api/cities?country_id=${countryData.id}`);
        if (!citiesResponse.ok) {
          throw new Error('Erreur lors de la récupération des villes');
        }
        const citiesData = await citiesResponse.json();
        
        // Trouver la ville correspondant au slug
        const cityData = citiesData.find(city => city.slug === citySlug);
        if (!cityData) {
          throw new Error('Ville non trouvée');
        }
        
        setCity(cityData);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    fetchCityData();
  }, [slug, citySlug]);
  
  // Fonction pour convertir un slug en nom formaté
  const formatName = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Fonction pour supprimer la ville
  const handleDeleteCity = async () => {
    try {
      // Effectuer la requête de suppression
      const response = await fetch(`/api/cities/${citySlug}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la ville');
      }
      
      // Rediriger vers la page du pays après suppression
      setConfirmMessage('Ville supprimée avec succès. Redirection...');
      setTimeout(() => {
        router.push(`/countries/${slug}`);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.message);
      setShowConfirmDialog(false);
    }
  };
  
  // Fonction pour ouvrir la boîte de dialogue de confirmation
  const openConfirmDialog = () => {
    setShowConfirmDialog(true);
  };
  
  // Fonction pour fermer la boîte de dialogue de confirmation
  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations de la ville...</p>
        
        <style jsx>{`
          .loading-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            margin-top: 100px;
            font-family: 'Montserrat', Arial, sans-serif;
            color: var(--text);
            background-color: var(--bg-color);
            min-height: 100vh;
          }
        `}</style>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p>Erreur: {error}</p>
        <Link href={`/countries/${slug}`} className="back-button">
          Retour au pays
        </Link>
        
        <style jsx>{`
          .error-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            margin-top: 100px;
            font-family: 'Montserrat', Arial, sans-serif;
            color: #e74c3c;
            background-color: var(--bg-color);
            min-height: 100vh;
          }
          
          .back-button {
            display: inline-block;
            background-color: var(--primary);
            color: var(--white);
            padding: 8px 16px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
            transition: all 0.3s;
          }
          
          .back-button:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    );
  }
  
  const cityName = city.name || formatName(citySlug);
  const countryName = formatName(slug);
  const description = city.description || "Cette ville est une destination magnifique avec de nombreux attraits touristiques, une culture riche et une gastronomie délicieuse.";
  
  // Gestion de l'image de bannière avec un fallback approprié
  let bannerStyle = {};
  if (city.image_path) {
    // Si l'image existe, l'utiliser comme arrière-plan
    bannerStyle = {
      backgroundImage: `url(${city.image_path})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else {
    // Si pas d'image, utiliser une couleur de fond dégradée
    bannerStyle = {
      background: `linear-gradient(135deg, #3498db, #2c3e50)`,
    };
  }
  
  return (
    <div className="city-detail-container">
      <div className="city-header">
        <div 
          className="city-banner" 
          style={{ 
            backgroundImage: city.image_path 
              ? `url(${city.image_path})` 
              : 'linear-gradient(45deg, #3498db, #1976D2)'
          }}
        >
          <div className="banner-overlay">
            <h1>{cityName}</h1>
            
            {/* Afficher les boutons de modification et suppression pour les modérateurs */}
            {isAuthenticated && isModerator && (
              <div className="admin-actions">
                <Link href={`/countries/${slug}/cities/${citySlug}/edit`} className="edit-button">
                  <FaEdit className="edit-icon" /> Modifier
                </Link>
                <button onClick={openConfirmDialog} className="delete-button">
                  <FaTrash className="delete-icon" /> Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="content-container">
        <div className="city-nav">
          <Link href={`/countries/${slug}`} className="back-to-country">
            &larr; Retour à {countryName}
          </Link>
          
          <div className="section-links">
            <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`} className="section-link">
              Lieux à visiter
            </Link>
            <Link href={`/countries/${slug}/cities/${citySlug}/restaurants`} className="section-link">
              Restaurants
            </Link>
            <Link href={`/countries/${slug}/cities/${citySlug}/logements`} className="section-link">
              Logements
            </Link>
            <Link href={`/countries/${slug}/cities/${citySlug}/transports`} className="section-link">
              Transports
            </Link>
            <Link href={`/countries/${slug}/cities/${citySlug}/commerces`} className="section-link">
              Commerces
            </Link>
          </div>
        </div>
        
        {/* Boîte de dialogue de confirmation de suppression */}
        {showConfirmDialog && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <h3>Confirmation de suppression</h3>
              <p>Êtes-vous sûr de vouloir supprimer la ville "{cityName}" ?</p>
              <p className="warning">Cette action est irréversible et supprimera toutes les données associées.</p>
              
              <div className="confirm-actions">
                <button onClick={handleDeleteCity} className="confirm-delete">
                  Confirmer la suppression
                </button>
                <button onClick={closeConfirmDialog} className="cancel-delete">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Message de confirmation de suppression */}
        {confirmMessage && (
          <div className="confirm-message">
            {confirmMessage}
          </div>
        )}
        
        <div className="city-description">
          <h2>À propos de {cityName}</h2>
          <p>{description}</p>
        </div>
        
        <div className="quick-links">
          <h2>Informations pratiques</h2>
          <div className="quick-links-grid">
            <Link href={`/countries/${slug}/cities/${citySlug}/transports`} className="quick-link transport">
              <div className="quick-link-icon">🚆</div>
              <div className="quick-link-text">Transports</div>
            </Link>
            <Link href={`/countries/${slug}/cities/${citySlug}/logements`} className="quick-link accommodation">
              <div className="quick-link-icon">🏨</div>
              <div className="quick-link-text">Logements</div>
            </Link>
          </div>
        </div>
        
        <div className="categories-section">
          <h2>Explorer {cityName}</h2>
          <div className="categories-grid">
            <Link href={`/countries/${slug}/cities/${citySlug}/commerces`} className="category-card shops">
              <div className="category-icon">🛍️</div>
              <h3>Commerces</h3>
              <p>Découvrez les boutiques et magasins locaux</p>
            </Link>
            
            <Link href={`/countries/${slug}/cities/${citySlug}/restaurants`} className="category-card restaurants">
              <div className="category-icon">🍽️</div>
              <h3>Restaurants</h3>
              <p>Explorez la gastronomie locale</p>
            </Link>
            
            <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter`} className="category-card places">
              <div className="category-icon">🏛️</div>
              <h3>Lieux à visiter</h3>
              <p>Les attractions et sites touristiques</p>
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .city-detail-container {
          background-color: var(--bg-color);
          color: var(--text);
          min-height: 100vh;
          font-family: 'Montserrat', Arial, sans-serif;
        }
        
        .city-header {
          width: 100%;
          position: relative;
        }
        
        .city-banner {
          height: 400px;
          width: 100%;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .banner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px;
        }
        
        .city-banner h1 {
          color: white;
          font-size: 48px;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        
        .city-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .back-to-country {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .back-to-country:hover {
          color: var(--primary-dark);
          transform: translateX(-5px);
        }
        
        .section-links {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .section-link {
          background-color: var(--primary);
          color: white;
          padding: 8px 16px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .section-link:hover {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .city-description {
          background-color: var(--card-bg);
          padding: 30px;
          border-radius: 10px;
          box-shadow: var(--card-shadow);
          margin-bottom: 40px;
        }
        
        .city-description h2 {
          color: var(--primary);
          margin-bottom: 20px;
          font-size: 28px;
        }
        
        .city-description p {
          line-height: 1.6;
          color: var(--text);
        }
        
        /* Styles pour les boutons d'administration */
        .admin-actions {
          display: flex;
          gap: 15px;
          margin-top: 15px;
        }
        
        .edit-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          background-color: #4a6da7;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .edit-button:hover {
          background-color: #3a5a8f;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .edit-icon {
          margin-right: 6px;
        }
        
        .delete-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .delete-button:hover {
          background-color: #c0392b;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .delete-icon {
          margin-right: 6px;
        }
        
        /* Styles pour la boîte de dialogue de confirmation */
        .confirm-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .confirm-dialog {
          background-color: var(--card-bg);
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
          padding: 30px;
          width: 90%;
          max-width: 500px;
        }
        
        .confirm-dialog h3 {
          color: var(--primary);
          margin-bottom: 20px;
          font-size: 22px;
        }
        
        .confirm-dialog .warning {
          color: #e74c3c;
          font-weight: 600;
          margin: 15px 0;
        }
        
        .confirm-actions {
          display: flex;
          gap: 15px;
          margin-top: 25px;
        }
        
        .confirm-delete, .cancel-delete {
          padding: 12px;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          flex: 1;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .confirm-delete {
          background-color: #e74c3c;
          color: white;
        }
        
        .confirm-delete:hover {
          background-color: #c0392b;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .cancel-delete {
          background-color: var(--bg-light);
          color: var(--text);
        }
        
        .cancel-delete:hover {
          background-color: var(--bg-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .confirm-message {
          background-color: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #2ecc71;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 600;
        }
        
        .quick-links {
          background-color: var(--card-bg);
          padding: 25px;
          border-radius: 10px;
          box-shadow: var(--card-shadow);
          margin-bottom: 30px;
        }
        
        .quick-links h2 {
          color: var(--text-dark);
          margin-top: 0;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .quick-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background-color: var(--dark-light);
          border-radius: 8px;
          text-decoration: none;
          color: var(--text);
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .quick-link:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          background-color: rgba(33, 150, 243, 0.1);
          border-color: rgba(33, 150, 243, 0.3);
        }
        
        .quick-link-icon {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        
        .quick-link-text {
          font-weight: bold;
        }
        
        .transport {
          background-color: rgba(33, 150, 243, 0.1);
        }
        
        .accommodation {
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        .categories-section {
          background-color: var(--card-bg);
          padding: 25px;
          border-radius: 10px;
          box-shadow: var(--card-shadow);
        }
        
        .categories-section h2 {
          color: var(--text-dark);
          margin-top: 0;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .category-card {
          background-color: var(--dark-light);
          border-radius: 8px;
          padding: 25px;
          text-decoration: none;
          color: var(--text);
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .category-icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
        }
        
        .category-card h3 {
          margin: 0 0 10px 0;
          color: var(--text-dark);
        }
        
        .category-card p {
          margin: 0;
          color: var(--text-light);
        }
        
        .shops {
          background-color: rgba(255, 193, 7, 0.1);
        }
        
        .restaurants {
          background-color: rgba(233, 30, 99, 0.1);
        }
        
        .places {
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        @media (max-width: 768px) {
          .city-banner {
            height: 300px;
          }
          
          .city-banner h1 {
            font-size: 36px;
          }
          
          .city-nav {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .categories-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 