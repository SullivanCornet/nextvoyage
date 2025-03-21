'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaPlus, FaBed, FaMapMarkerAlt } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import NoDataMessage from '@/components/NoDataMessage';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LogementsList() {
  const { slug, citySlug } = useParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(null);
  const [logements, setLogements] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupération des données de la ville
        const cityResponse = await fetch(`/api/countries/${slug}/cities/${citySlug}`);
        if (!cityResponse.ok) {
          throw new Error('Erreur lors de la récupération des données de la ville');
        }
        const cityData = await cityResponse.json();
        setCity(cityData);

        // Récupération directe des logements de la ville
        const logementsResponse = await fetch(`/api/countries/${slug}/cities/${citySlug}/accommodations`);
        if (!logementsResponse.ok) {
          throw new Error('Erreur lors de la récupération des logements');
        }
        const logementsData = await logementsResponse.json();
        setLogements(logementsData);

      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, citySlug]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Link href={`/countries/${slug}/cities/${citySlug}`} className="back-link">
          Retour à la ville
        </Link>
      </div>
    );
  }

  return (
    <div className="logements-container">
      <div className="page-header">
        <h1 className="page-title">Logements à {city?.name || citySlug}</h1>
      </div>

      {logements.length > 0 ? (
        <div className="logements-grid">
          {logements.map((logement) => (
            <Link
              key={logement.id}
              href={`/countries/${slug}/cities/${citySlug}/logements/${logement.slug}`}
              className="logement-card"
            >
              <div 
                className="logement-image" 
                style={{ 
                  backgroundImage: logement.image_path 
                    ? `url(${logement.image_path})` 
                    : 'url(/images/default-accommodation.jpg)' 
                }}
              >
                <div className="logement-price">
                  {logement.price_range || 'Prix non indiqué'}
                </div>
              </div>
              <div className="logement-info">
                <h2 className="logement-name">{logement.name}</h2>
                <p className="logement-type">
                  <FaBed className="info-icon" />
                  {logement.accommodation_type || 'Type non spécifié'}
                </p>
                <p className="logement-location">
                  <FaMapMarkerAlt className="info-icon" />
                  {logement.location || 'Adresse non spécifiée'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <NoDataMessage 
          message="Aucun logement n'a été ajouté pour cette ville." 
          actionLink={null}
          actionText=""
        />
      )}

      {isAuthenticated && (
        <Link href={`/countries/${slug}/cities/${citySlug}/logements/ajouter`} className="button-circle" title="Ajouter un logement">
          +
        </Link>
      )}

      <Link href={`/countries/${slug}/cities/${citySlug}`} className="back-link">
        Retour à {city?.name || 'la ville'}
      </Link>

      <style jsx>{`
        .logements-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-title {
          font-size: 2rem;
          color: #333;
          margin: 0;
        }

        .add-button {
          display: flex;
          align-items: center;
          background-color: #4a6fa5;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          transition: background-color 0.3s ease;
        }

        .add-button:hover {
          background-color: #3a5a80;
        }

        .add-icon {
          margin-right: 8px;
        }

        .logements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }

        .logement-card {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-decoration: none;
          color: #333;
          background-color: white;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .logement-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .logement-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .logement-price {
          position: absolute;
          bottom: 15px;
          right: 15px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: bold;
        }

        .logement-info {
          padding: 20px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .logement-name {
          font-size: 1.5rem;
          margin: 0 0 15px 0;
          color: #2c3e50;
        }

        .logement-type, .logement-location {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          color: #666;
        }

        .info-icon {
          margin-right: 8px;
          color: #4a6fa5;
        }

        .back-link {
          display: inline-block;
          margin-top: 20px;
          color: #4a6fa5;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .back-link:hover {
          color: #3a5a80;
          text-decoration: underline;
        }

        .error-container {
          text-align: center;
          padding: 40px 20px;
        }

        .error-message {
          color: #e74c3c;
          font-size: 1.2rem;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
} 