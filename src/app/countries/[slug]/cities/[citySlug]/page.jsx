'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CityDetail() {
  const params = useParams();
  const { slug, citySlug } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState(null);
  const [error, setError] = useState(null);
  
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
            font-family: Arial, sans-serif;
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
            font-family: Arial, sans-serif;
            color: #e74c3c;
          }
          
          .back-button {
            display: inline-block;
            background-color: #7f8c8d;
            color: white;
            padding: 8px 16px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
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
      <div className="city-banner" style={bannerStyle}>
        <div className="banner-content">
          <h1>{cityName}</h1>
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> &gt; 
            <Link href="/countries">Pays</Link> &gt; 
            <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
            <span>{cityName}</span>
          </div>
        </div>
      </div>
      
      <div className="city-content">
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
          font-family: Arial, sans-serif;
          color: #333;
        }
        
        .city-banner {
          height: 300px;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: flex-end;
        }
        
        .city-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7));
        }
        
        .banner-content {
          position: relative;
          padding: 20px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          color: white;
        }
        
        h1 {
          font-size: 2.5rem;
          margin: 0 0 10px 0;
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        }
        
        .breadcrumb {
          font-size: 0.9rem;
          margin-bottom: 10px;
        }
        
        .breadcrumb a {
          color: white;
          text-decoration: none;
          margin: 0 5px;
        }
        
        .breadcrumb a:hover {
          text-decoration: underline;
        }
        
        .breadcrumb span {
          margin-left: 5px;
        }
        
        .city-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .city-description {
          background-color: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .city-description h2 {
          color: #2c3e50;
          margin-top: 0;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .city-description p {
          line-height: 1.6;
          margin: 0;
        }
        
        .quick-links {
          background-color: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .quick-links h2 {
          color: #2c3e50;
          margin-top: 0;
          border-bottom: 2px solid #f0f0f0;
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
          background-color: #f8f9fa;
          border-radius: 8px;
          text-decoration: none;
          color: #333;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .quick-link:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .quick-link-icon {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        
        .quick-link-text {
          font-weight: bold;
        }
        
        .transport {
          background-color: #e8f4fd;
        }
        
        .accommodation {
          background-color: #e8fdec;
        }
        
        .categories-section {
          background-color: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .categories-section h2 {
          color: #2c3e50;
          margin-top: 0;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .category-card {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 25px;
          text-decoration: none;
          color: #333;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .category-icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
        }
        
        .category-card h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        
        .category-card p {
          margin: 0;
          color: #7f8c8d;
        }
        
        .shops {
          background-color: #fff8e1;
        }
        
        .restaurants {
          background-color: #ffebee;
        }
        
        .places {
          background-color: #e8f5e9;
        }
        
        @media (max-width: 768px) {
          .city-banner {
            height: 200px;
          }
          
          h1 {
            font-size: 1.8rem;
          }
          
          .categories-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 