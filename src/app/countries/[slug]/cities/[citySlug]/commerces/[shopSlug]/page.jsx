'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { citiesAPI, placesAPI } from '@/services/api';

export default function ShopDetail() {
  const params = useParams();
  const { slug, citySlug, shopSlug } = params;
  const router = useRouter();
  
  const [shopData, setShopData] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations de la ville
        const city = await citiesAPI.getBySlug(citySlug, slug);
        setCityData(city);
        
        // Récupérer les informations du commerce
        const shop = await placesAPI.getBySlug(shopSlug, citySlug);
        setShopData(shop);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Impossible de charger les informations du commerce');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [citySlug, slug, shopSlug]);
  
  // Fonction pour convertir un slug en nom formaté
  const formatName = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commerce ?')) {
      return;
    }
    
    try {
      await placesAPI.delete(shopSlug, citySlug);
      router.push(`/countries/${slug}/cities/${citySlug}/commerces`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du commerce');
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations du commerce...</p>
        
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
        <Link href={`/countries/${slug}/cities/${citySlug}/commerces`} className="back-button">
          Retour aux commerces
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
  const shopName = shopData ? shopData.name : formatName(shopSlug);
  const shopImage = shopData && shopData.image_path 
    ? shopData.image_path 
    : '/images/default-shop.jpg';
  
  return (
    <div className="shop-detail-container">
      <div className="page-header">
        <h1>{shopName}</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/countries">Pays</Link> &gt; 
          <Link href={`/countries/${slug}`}>{countryName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}`}>{cityName}</Link> &gt; 
          <Link href={`/countries/${slug}/cities/${citySlug}/commerces`}>Commerces</Link> &gt; 
          <span>{shopName}</span>
        </div>
        <div className="header-actions">
          <Link href={`/countries/${slug}/cities/${citySlug}/commerces`} className="back-button">
            Retour aux commerces
          </Link>
        </div>
      </div>
      
      <div className="shop-content">
        <div className="shop-image-container">
          <img src={shopImage} alt={shopName} className="shop-image" />
        </div>
        
        <div className="shop-info">
          <div className="info-section">
            <h2>À propos de ce commerce</h2>
            <p className="shop-description">{shopData.description || 'Aucune description disponible.'}</p>
          </div>
          
          <div className="info-section">
            <h2>Informations pratiques</h2>
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-text">
                <h3>Adresse</h3>
                <p>{shopData.location || 'Adresse non spécifiée.'}</p>
              </div>
            </div>
          </div>
          
          <div className="admin-actions">
            <Link 
              href={`/countries/${slug}/cities/${citySlug}/commerces/${shopSlug}/modifier`} 
              className="edit-button"
            >
              Modifier
            </Link>
            <button onClick={handleDelete} className="delete-button">
              Supprimer
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .shop-detail-container {
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
          margin-top: 15px;
        }
        
        .back-button {
          display: inline-block;
          background-color: #7f8c8d;
          color: white;
          padding: 8px 16px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        
        .back-button:hover {
          background-color: #6c7a7d;
        }
        
        .shop-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .shop-image-container {
          margin-bottom: 20px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          height: 300px;
        }
        
        .shop-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .shop-info {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        @media (min-width: 768px) {
          .shop-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .shop-image-container {
            grid-column: 1;
            margin-bottom: 0;
            height: 400px;
          }
          
          .shop-info {
            grid-column: 2;
          }
        }
        
        .info-section {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }
        
        .info-section h2 {
          color: #2c3e50;
          margin: 0 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .shop-description {
          line-height: 1.6;
          color: #34495e;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .info-icon {
          font-size: 1.5rem;
          color: #3498db;
        }
        
        .info-text {
          flex: 1;
        }
        
        .info-text h3 {
          color: #2c3e50;
          margin: 0 0 5px 0;
        }
        
        .admin-actions {
          display: flex;
          gap: 15px;
          margin-top: auto;
        }
        
        .edit-button, .delete-button {
          flex: 1;
          padding: 10px;
          border-radius: 5px;
          font-weight: bold;
          text-align: center;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .edit-button {
          background-color: #3498db;
          color: white;
          text-decoration: none;
        }
        
        .edit-button:hover {
          background-color: #2980b9;
        }
        
        .delete-button {
          background-color: #e74c3c;
          color: white;
          border: none;
          font-size: 1rem;
        }
        
        .delete-button:hover {
          background-color: #c0392b;
        }
        
        @media (max-width: 768px) {
          .shop-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 