'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export default function CountriesList() {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

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
        <div className="spinner"></div>
        <p className="loading-text">Chargement des pays...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page-content">
        <div className="info-box">
          <h3>Erreur</h3>
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="countries-page">
      <div className="container">
        {countries.length === 0 ? (
          <div className="empty-container">
            <div className="empty-content">
              <div className="empty-icon">🌍</div>
              <h2 className="empty-title">Aucun pays disponible</h2>
              <p className="empty-message">
                Aucun pays n'a été ajouté pour le moment.
                {isAuthenticated && " Vous pouvez ajouter un nouveau pays en cliquant sur le bouton ci-dessous."}
              </p>
              {isAuthenticated && (
                <Link href="/countries/add" className="button">
                  Ajouter un pays
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid">
              {countries.map(country => (
                <Link href={`/countries/${country.slug}`} key={country.id} className="card">
                  <div 
                    className="card-image" 
                    style={{ backgroundImage: country.image_path 
                      ? `url(${country.image_path})` 
                      : `linear-gradient(45deg, #3498db, #1976D2)` 
                    }}
                  >
                  </div>
                  <div className="card-content">
                    <div className="card-title">{country.name}</div>
                    <div>
                      {country.cities_count 
                        ? `${country.cities_count} villes • ${country.places_count || 0} lieux` 
                        : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {isAuthenticated && (
              <Link href="/countries/add" className="button-circle">
                +
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
} 