'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaPlus } from 'react-icons/fa';

export default function PlacesToVisit() {
  const params = useParams();
  const { slug, citySlug } = params;
  const { isAuthenticated } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [cityData, setCityData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState(null);
  
  // Récupérer les données de la ville et des lieux à visiter
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
        
        // Récupérer la catégorie "Lieux à visiter"
        const categoryResponse = await fetch(`/api/categories/lieux-a-visiter`);
        if (!categoryResponse.ok) {
          throw new Error('Erreur lors de la récupération de la catégorie');
        }
        const categoryData = await categoryResponse.json();
        
        // Récupérer les lieux à visiter de cette ville avec cette catégorie
        const placesResponse = await fetch(`/api/places?city_id=${cityData.id}&category_id=${categoryData.id}`);
        if (!placesResponse.ok) {
          throw new Error('Erreur lors de la récupération des lieux à visiter');
        }
        const placesData = await placesResponse.json();
        setPlaces(placesData);
        
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
        <p>Chargement des lieux à visiter...</p>
        
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
    <div className="places-list-container">
      <div className="page-header">
        <h1>Lieux à visiter à {cityName}</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/countries">Pays</Link> &gt; 
          <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
          <span>Lieux à visiter</span>
        </div>
        <div className="header-actions">
          <Link href={`/countries/${slug}/cities/${citySlug}`} className="back-button">
            Retour à la ville
          </Link>
        </div>
      </div>
      
      {places.length > 0 ? (
        <div className="places-grid">
          {places.map((place) => (
            <div key={place.id} className="place-card">
              <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter/${place.slug}`} className="place-link">
                <div className="place-image" style={{ 
                  backgroundImage: place.image_path 
                    ? `url(${place.image_path})` 
                    : 'url(/images/default-place.jpg)' 
                }}>
                </div>
                <div className="place-info">
                  <h3 className="place-name">{place.name}</h3>
                  <p className="place-address">{place.location || "Adresse non disponible"}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-places">
          <div className="empty-message">
            <div className="empty-icon">🔍</div>
            <h2>Pas de lieux à visiter</h2>
            <p>Aucun lieu à visiter n'a été ajouté pour {cityName} pour le moment.</p>
          </div>
        </div>
      )}
      
      {isAuthenticated && (
        <Link href={`/countries/${slug}/cities/${citySlug}/lieux-a-visiter/ajouter`} className="button-circle" title="Ajouter un lieu à visiter">
          <FaPlus />
        </Link>
      )}
      
      <style jsx>{`
        .places-list-container {
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
        
        .places-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }
        
        .place-card {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background-color: white;
        }
        
        .place-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
        
        .place-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .place-image {
          height: 180px;
          background-size: cover;
          background-position: center;
          background-color: #f1f1f1;
        }
        
        .place-info {
          padding: 15px;
        }
        
        .place-name {
          font-size: 1.4rem;
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        
        .place-address {
          color: #7f8c8d;
          margin: 0 0 10px 0;
          font-size: 0.9rem;
        }
        
        .place-description {
          color: #34495e;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .empty-places {
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
        
        .button-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background-color: #2ecc71;
          color: white;
          border-radius: 50%;
          text-decoration: none;
          font-weight: bold;
          margin: 30px auto;
          box-shadow: 0 4px 10px rgba(46, 204, 113, 0.4);
          transition: all 0.3s ease;
        }
        
        .button-circle:hover {
          background-color: #27ae60;
          transform: translateY(-3px);
          box-shadow: 0 6px 14px rgba(46, 204, 113, 0.5);
        }
        
        @media (max-width: 768px) {
          .places-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
          
          .header-actions {
            flex-direction: column;
            gap: 10px;
          }
          
          .back-button {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
} 