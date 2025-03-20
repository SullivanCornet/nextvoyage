'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RestaurantsList() {
  const params = useParams();
  const { slug, citySlug } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [cityData, setCityData] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);
  
  // Récupérer les données de la ville et des restaurants
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations sur la ville
        const cityResponse = await fetch(`/api/cities/${citySlug}?country_slug=${slug}`);
        if (!cityResponse.ok) {
          throw new Error('Erreur lors de la récupération des informations de la ville');
        }
        const cityData = await cityResponse.json();
        setCityData(cityData);
        
        // Récupérer la catégorie "Restaurants"
        const categoryResponse = await fetch(`/api/categories/restaurants`);
        if (!categoryResponse.ok) {
          throw new Error('Erreur lors de la récupération de la catégorie');
        }
        const categoryData = await categoryResponse.json();
        
        // Récupérer les restaurants de cette ville avec cette catégorie
        const restaurantsResponse = await fetch(`/api/places?city_id=${cityData.id}&category_id=${categoryData.id}`);
        if (!restaurantsResponse.ok) {
          throw new Error('Erreur lors de la récupération des restaurants');
        }
        const restaurantsData = await restaurantsResponse.json();
        setRestaurants(restaurantsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
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
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des restaurants...</p>
        
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
        <Link href={`/countries/${slug}/cities/${citySlug}`} className="back-button">
          Retour à la ville
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
  
  const cityName = cityData ? cityData.name : formatName(citySlug);
  const countryName = cityData ? cityData.country_name : formatName(slug);
  
  return (
    <div className="restaurants-list-container">
      <div className="page-header">
        <h1>Restaurants à {cityName}</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/countries">Pays</Link> &gt; 
          <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
          <span>Restaurants</span>
        </div>
        <div className="header-actions">
          <Link href={`/countries/${slug}/cities/${citySlug}`} className="back-button">
            Retour à la ville
          </Link>
          <Link href={`/countries/${slug}/cities/${citySlug}/restaurants/ajouter`} className="add-button">
            + Ajouter un restaurant
          </Link>
        </div>
      </div>
      
      {restaurants.length > 0 ? (
        <div className="restaurants-grid">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <Link href={`/countries/${slug}/cities/${citySlug}/restaurants/${restaurant.slug}`} className="restaurant-link">
                <div className="restaurant-image" style={{ 
                  backgroundImage: restaurant.image_path 
                    ? `url(${restaurant.image_path})` 
                    : 'url(/images/default-restaurant.jpg)' 
                }}>
                </div>
                <div className="restaurant-info">
                  <h3 className="restaurant-name">{restaurant.name}</h3>
                  <p className="restaurant-address">{restaurant.location || "Adresse non disponible"}</p>
                  <p className="restaurant-description">{restaurant.description.length > 100 
                    ? `${restaurant.description.substring(0, 100)}...` 
                    : restaurant.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-restaurants">
          <div className="empty-message">
            <div className="empty-icon">🍽️</div>
            <h2>Pas de restaurants</h2>
            <p>Aucun restaurant n'a été ajouté pour {cityName} pour le moment.</p>
            <Link href={`/countries/${slug}/cities/${citySlug}/restaurants/ajouter`} className="add-restaurant-button">
              Ajouter un restaurant
            </Link>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .restaurants-list-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        h1 {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 10px;
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
          margin-bottom: 20px;
        }
        
        .back-button {
          background-color: #7f8c8d;
          color: white;
          padding: 10px 15px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        
        .add-button {
          background-color: #e67e22;
          color: white;
          padding: 10px 15px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        
        .restaurants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }
        
        .restaurant-card {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background-color: white;
        }
        
        .restaurant-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
        
        .restaurant-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .restaurant-image {
          height: 180px;
          background-size: cover;
          background-position: center;
          background-color: #f1f1f1;
        }
        
        .restaurant-info {
          padding: 15px;
        }
        
        .restaurant-name {
          font-size: 1.4rem;
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        
        .restaurant-address {
          color: #7f8c8d;
          margin: 0 0 10px 0;
          font-size: 0.9rem;
        }
        
        .restaurant-description {
          color: #34495e;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .empty-restaurants {
          padding: 50px 0;
          text-align: center;
        }
        
        .empty-message {
          background-color: #f8f9fa;
          padding: 40px;
          border-radius: 10px;
          display: inline-block;
          max-width: 600px;
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }
        
        .empty-message h2 {
          font-size: 1.8rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .empty-message p {
          color: #7f8c8d;
          margin-bottom: 25px;
        }
        
        .add-restaurant-button {
          background-color: #e67e22;
          color: white;
          padding: 12px 20px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          display: inline-block;
        }
        
        @media (max-width: 768px) {
          .restaurants-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
          
          .header-actions {
            flex-direction: column;
            gap: 10px;
          }
          
          .back-button, .add-button {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
} 