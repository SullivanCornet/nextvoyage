'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [popularCountries, setPopularCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les pays populaires
  useEffect(() => {
    const fetchPopularCountries = async () => {
      try {
        const response = await fetch('/api/countries/popular');
        if (response.ok) {
          const data = await response.json();
          setPopularCountries(data);
        } else {
          console.error('Erreur lors de la récupération des pays populaires');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setIsLoading(false);
      }
    };

    fetchPopularCountries();
  }, []);

  return (
    <>
      <div className="full-image" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/hero7.jpg')" }}>
        <div className="container" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '30px', textAlign: 'center', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            Découvrez le monde avec Cornet de Voyage
          </h1>
          
          <p style={{ color: 'white', fontSize: '20px', maxWidth: '700px', textAlign: 'center', marginBottom: '40px', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>
            Explorez des destinations fascinantes, partagez vos expériences et planifiez votre prochain voyage.
          </p>
          
          <Link href="/countries" className="button">
            Explorer les guides
          </Link>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'var(--dark)', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container">
          <h2 className="section-title">Destinations populaires</h2>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Chargement des destinations...</p>
            </div>
          ) : popularCountries.length > 0 ? (
            <>
              <div className="grid">
                {popularCountries.map(country => (
                  <Link href={`/countries/${country.slug}`} key={country.id} className="card">
                    <div 
                      className="card-image" 
                      style={{ backgroundImage: country.city_image_path 
                        ? `url(${country.city_image_path})`
                        : country.image_path 
                          ? `url(${country.image_path})` 
                          : `linear-gradient(45deg, #3498db, #1976D2)` 
                      }}
                    >
                    </div>
                    <div className="card-content">
                      <div className="card-title">{country.name}</div>
                      <div>
                        {Number(country.cities_count) > 0 
                          ? `${country.cities_count} ${Number(country.cities_count) === 1 ? 'ville' : 'villes'} • ${country.places_count || 0} ${Number(country.places_count) === 1 ? 'lieu' : 'lieux'}` 
                          : "0 ville • 0 lieu"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Link href="/countries" className="button">
                  Voir tous les guides
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-container">
              <div className="empty-content">
                <div className="empty-icon">🌍</div>
                <h2 className="empty-title">Aucune destination disponible</h2>
                <p className="empty-message">
                  Aucun pays avec des villes n'a été ajouté pour le moment.
                </p>
                <Link href="/countries" className="button">
                  Voir tous les pays
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 