'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RestaurantDetail() {
  const params = useParams();
  const { slug, citySlug, placeSlug } = params;
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(null);
  
  // Récupérer les informations du restaurant
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        // Récupérer les informations de la ville
        const cityResponse = await fetch(`/api/cities/${citySlug}?country_slug=${slug}`);
        if (!cityResponse.ok) {
          throw new Error('Erreur lors de la récupération des informations de la ville');
        }
        const cityData = await cityResponse.json();
        
        // Récupérer le restaurant
        const restaurantResponse = await fetch(`/api/places/${placeSlug}?city_id=${cityData.id}`);
        if (!restaurantResponse.ok) {
          throw new Error('Erreur lors de la récupération du restaurant');
        }
        const restaurantData = await restaurantResponse.json();
        setRestaurant(restaurantData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    fetchRestaurant();
  }, [slug, citySlug, placeSlug]);
  
  // Fonction pour convertir un slug en nom formaté
  const formatName = (str) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Fonction pour supprimer le restaurant
  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/places/${placeSlug}?city_id=${restaurant.city_id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du restaurant');
      }
      
      // Rediriger vers la liste des restaurants
      router.push(`/countries/${slug}/cities/${citySlug}/restaurants`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression du restaurant');
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations du restaurant...</p>
        
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
        <Link href={`/countries/${slug}/cities/${citySlug}/restaurants`} className="back-button">
          Retour aux restaurants
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
  
  const cityName = restaurant?.city?.name || formatName(citySlug);
  const countryName = formatName(slug);
  const restaurantName = restaurant?.name || formatName(placeSlug);
  const imagePath = restaurant?.image_path || '/images/default-restaurant.jpg';
  
  return (
    <div className="restaurant-detail-container">
      <div className="page-header">
        <h1>{restaurantName}</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/countries">Pays</Link> &gt; 
          <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}/restaurants`}>Restaurants</Link> &gt; 
          <span>{restaurantName}</span>
        </div>
        <div className="header-actions">
          <Link href={`/countries/${slug}/cities/${citySlug}/restaurants`} className="back-button">
            Retour aux restaurants
          </Link>
          <div className="action-buttons">
            <Link href={`/countries/${slug}/cities/${citySlug}/restaurants/${placeSlug}/modifier`} className="edit-button">
              Modifier
            </Link>
            <button onClick={handleDelete} className="delete-button">
              Supprimer
            </button>
          </div>
        </div>
      </div>
      
      <div className="restaurant-content">
        <div className="restaurant-image-container">
          <img src={imagePath} alt={restaurantName} className="restaurant-image" />
        </div>
        
        <div className="restaurant-info-container">
          <div className="restaurant-info-section">
            <h2>À propos de ce restaurant</h2>
            <p className="restaurant-description">{restaurant.description}</p>
          </div>
          
          <div className="restaurant-info-section">
            <h2>Informations pratiques</h2>
            <div className="info-item">
              <div className="info-label">Adresse</div>
              <div className="info-value">{restaurant.address}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Catégorie</div>
              <div className="info-value">{restaurant.category?.name || 'Restaurant'}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Ville</div>
              <div className="info-value">{cityName}</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .restaurant-detail-container {
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
          color: #e67e22;
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
        
        .restaurant-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .restaurant-image-container {
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .restaurant-image {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .restaurant-info-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .restaurant-info-section {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .restaurant-description {
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
          .restaurant-content {
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