'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CountriesList() {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer la liste des pays
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des pays');
        }
        const data = await response.json();
        setCountries(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des pays...</p>

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
        `}</style>
      </div>
    );
  }

  return (
    <div className="countries-container">
      <div className="page-header">
        <h1>Pays</h1>
        <Link href="/countries/add" className="add-button">
          Ajouter un pays
        </Link>
      </div>

      {countries.length === 0 ? (
        <div className="empty-message">
          <p>Aucun pays n'a été ajouté pour le moment.</p>
          <p>Cliquez sur "Ajouter un pays" pour commencer.</p>
        </div>
      ) : (
        <div className="countries-grid">
          {countries.map(country => (
            <Link href={`/countries/${country.slug}`} key={country.id} className="country-card">
              <div className="country-image">
                {country.image_path ? (
                  <img src={country.image_path} alt={country.name} />
                ) : (
                  <div className="placeholder-image">
                    <span>{country.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="country-info">
                <h2>{country.name}</h2>
                <p className="country-code">{country.country_code}</p>
                <p className="country-description">
                  {country.description.length > 100
                    ? `${country.description.substring(0, 100)}...`
                    : country.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .countries-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
          background-color:rgb(95, 90, 116);
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        h1 {
          color: #2c3e50;
          font-size: 2rem;
          margin: 0;
        }
        
        .add-button {
          display: inline-block;
          background-color: #2ecc71;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        
        .add-button:hover {
          background-color: #27ae60;
        }
        
        .empty-message {
          text-align: center;
          margin-top: 50px;
          color: #7f8c8d;
        }
        
        .countries-grid {
        padding: 20px;
       
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .country-card {
          border: 1px solid #2c3e50;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .country-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .country-image {
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          height: 190px;
          overflow: hidden;
          background-color: #f5f5f5;
        }
        
        .country-image img {
          
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .placeholder-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #3498db;
          color: white;
          font-size: 3rem;
          font-weight: bold;
        }
        
        .country-info {
          padding: 5px;
        
        }
        
        .country-info h2 {
          margin: 0 0 5px 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }
        
        .country-code {
          display: inline-block;
          background-color: #f0f0f0;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 0.8rem;
          margin: 0 0 10px 0;
          color: #7f8c8d;
        }
        
        .country-description {
          margin: 0;
          color: #7f8c8d;
          line-height: 1.5;
        }
        
        @media (max-width: 768px) {
          .countries-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 