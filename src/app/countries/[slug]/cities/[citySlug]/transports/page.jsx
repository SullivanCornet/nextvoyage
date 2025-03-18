'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaPlus, FaBus, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import NoDataMessage from '@/components/NoDataMessage';

export default function TransportsList() {
  const { slug, citySlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(null);
  const [transports, setTransports] = useState([]);
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

        // Récupération directe des transports de la ville
        const transportsResponse = await fetch(`/api/countries/${slug}/cities/${citySlug}/transports`);
        if (!transportsResponse.ok) {
          throw new Error('Erreur lors de la récupération des transports');
        }
        const transportsData = await transportsResponse.json();
        setTransports(transportsData);

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
    <div className="transports-container">
      <div className="page-header">
        <h1 className="page-title">Transports à {city?.name || citySlug}</h1>
        <Link href={`/countries/${slug}/cities/${citySlug}/transports/ajouter`} className="add-button">
          <FaPlus className="add-icon" />
          <span>Ajouter un transport</span>
        </Link>
      </div>

      {transports.length > 0 ? (
        <div className="transports-grid">
          {transports.map((transport) => (
            <Link
              key={transport.id}
              href={`/countries/${slug}/cities/${citySlug}/transports/${transport.slug}`}
              className="transport-card"
            >
              <div 
                className="transport-image" 
                style={{ 
                  backgroundImage: transport.image_path 
                    ? `url(${transport.image_path})` 
                    : 'url(/images/default-transport.jpg)' 
                }}
              >
                <div className="transport-type-badge">
                  {transport.transport_type || 'Transport'}
                </div>
              </div>
              <div className="transport-info">
                <h2 className="transport-name">{transport.name}</h2>
                <p className="transport-route">
                  <FaRoute className="info-icon" />
                  {transport.route || 'Itinéraire non spécifié'}
                </p>
                <p className="transport-location">
                  <FaMapMarkerAlt className="info-icon" />
                  {transport.location || 'Lieu non spécifié'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <NoDataMessage 
          message="Aucun transport n'a été ajouté pour cette ville." 
          actionLink={`/countries/${slug}/cities/${citySlug}/transports/ajouter`}
          actionText="Ajouter un transport"
        />
      )}

      <Link href={`/countries/${slug}/cities/${citySlug}`} className="back-link">
        Retour à {city?.name || 'la ville'}
      </Link>

      <style jsx>{`
        .transports-container {
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

        .transports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }

        .transport-card {
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

        .transport-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .transport-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .transport-type-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: bold;
        }

        .transport-info {
          padding: 20px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .transport-name {
          font-size: 1.5rem;
          margin: 0 0 15px 0;
          color: #2c3e50;
        }

        .transport-route, .transport-location {
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