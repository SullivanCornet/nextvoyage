'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { citiesAPI, placesAPI } from '@/services/api';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaPlus } from 'react-icons/fa';

export default function ShopsList() {
  const params = useParams();
  const { slug, citySlug } = params;
  const { isAuthenticated } = useAuth();
  
  const [shops, setShops] = useState([]);
  const [cityData, setCityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations de la ville
        const city = await citiesAPI.getBySlug(citySlug, slug);
        setCityData(city);
        
        // Récupérer les commerces de cette ville (catégorie 1 = commerces)
        const shopsData = await placesAPI.getByCityAndCategory(city.id, 1);
        setShops(shopsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Impossible de charger les commerces');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [citySlug, slug]);
  
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
        <p>Chargement des commerces...</p>
        
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
    <div className="shops-list-container">
      <div className="page-header">
        <h1>Commerces à {cityName}</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/countries">Pays</Link> &gt; 
          <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
          <span>Commerces</span>
        </div>
        <div className="header-actions">
          <Link href={`/countries/${slug}/cities/${citySlug}`} className="back-button">
            Retour à la ville
          </Link>
        </div>
      </div>
      
      <div className="shops-grid">
        {shops.length === 0 ? (
          <div className="no-shops">
            <p>Aucun commerce n'a encore été ajouté pour cette ville.</p>
            {isAuthenticated && <p>Soyez le premier à en ajouter un !</p>}
          </div>
        ) : (
          shops.map((shop) => (
            <div key={shop.id} className="shop-card">
              <Link 
                href={`/countries/${slug}/cities/${citySlug}/commerces/${shop.slug}`}
                className="shop-card-link"
              >
                <div 
                  className="shop-image" 
                  style={{ 
                    backgroundImage: shop.image_path 
                      ? `url(${shop.image_path})` 
                      : 'url(/images/default-shop.jpg)' 
                  }}
                ></div>
                <div className="shop-content">
                  <h2>{shop.name}</h2>
                  <p className="shop-address">{shop.location || 'Adresse non spécifiée'}</p>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
      
      {isAuthenticated && (
        <Link href={`/countries/${slug}/cities/${citySlug}/commerces/ajouter`} className="button-circle" title="Ajouter un commerce">
          <FaPlus />
        </Link>
      )}
      
      <style jsx>{`
        .shops-list-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .page-header {
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        h1 {
          color: #2c3e50;
          font-size: 2rem;
          margin: 0 0 10px 0;
        }
        
        .breadcrumb {
          font-size: 0.9rem;
          margin-bottom: 15px;
          color: #7f8c8d;
        }
        
        .breadcrumb a {
          color: #3498db;
          text-decoration: none;
          margin: 0 5px;
        }
        
        .breadcrumb a:first-child {
          margin-left: 0;
        }
        
        .breadcrumb a:hover {
          text-decoration: underline;
        }
        
        .header-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }
        
        .back-button, .add-button {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        
        .back-button {
          background-color: #7f8c8d;
          color: white;
        }
        
        .back-button:hover {
          background-color: #6c7a7d;
        }
        
        .add-button {
          background-color: #2ecc71;
          color: white;
        }
        
        .add-button:hover {
          background-color: #27ae60;
        }
        
        .shops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
        }
        
        .no-shops {
          grid-column: 1 / -1;
          text-align: center;
          padding: 50px;
          background-color: #f9f9f9;
          border-radius: 10px;
          color: #7f8c8d;
        }
        
        .shop-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 20px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .shop-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        
        .shop-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        
        .shop-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          background-color: #f0f0f0;
        }
        
        .shop-content {
          padding: 20px;
        }
        
        .shop-content h2 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 1.4rem;
        }
        
        .shop-address {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin: 0 0 10px 0;
        }
        
        @media (max-width: 768px) {
          .shops-grid {
            grid-template-columns: 1fr;
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