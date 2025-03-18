'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBed, FaArrowLeft, FaMapMarkerAlt, FaStar, FaPhone, FaGlobe, FaEuroSign, FaTrash, FaEdit } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LogementDetail() {
  const router = useRouter();
  const { slug, citySlug, logementSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [logement, setLogement] = useState(null);
  const [city, setCity] = useState(null);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

        // Récupération de tous les logements de cette ville
        const logementsResponse = await fetch(`/api/countries/${slug}/cities/${citySlug}/accommodations`);
        if (!logementsResponse.ok) {
          throw new Error('Erreur lors de la récupération des logements');
        }
        
        const logementsData = await logementsResponse.json();
        
        // Trouver le logement spécifique par son id (logementSlug)
        const foundLogement = logementsData.find(l => l.slug === logementSlug || l.id.toString() === logementSlug);
        
        if (!foundLogement) {
          throw new Error('Logement non trouvé');
        }
        
        setLogement(foundLogement);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, citySlug, logementSlug]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/accommodations/${logement.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du logement');
      }
      
      // Redirection vers la liste des logements après suppression
      router.push(`/countries/${slug}/cities/${citySlug}/logements`);
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError(`Erreur lors de la suppression: ${error.message}`);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getConfortStars = (comfort_level) => {
    const level = comfort_level || 3;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={`star-icon ${i < level ? 'filled' : 'empty'}`} 
        />
      );
    }
    return stars;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !logement) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Logement non trouvé'}</p>
        <Link href={`/countries/${slug}/cities/${citySlug}/logements`} className="back-link">
          <FaArrowLeft className="back-icon" /> Retour aux logements
        </Link>
      </div>
    );
  }

  return (
    <div className="logement-detail-container">
      {error && (
        <div className="error-message-banner">
          {error}
        </div>
      )}
      
      <div className="page-header">
        <Link href={`/countries/${slug}/cities/${citySlug}/logements`} className="back-link">
          <FaArrowLeft className="back-icon" /> Retour aux logements
        </Link>
        <div className="title-actions">
          <h1 className="page-title">
            <FaBed className="header-icon" /> {logement.name}
          </h1>
          <div className="action-buttons">
            <Link 
              href={`/countries/${slug}/cities/${citySlug}/logements/${logementSlug}/modifier`}
              className="edit-button"
            >
              <FaEdit className="edit-icon" /> Modifier
            </Link>
            <button 
              className="delete-button" 
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              <FaTrash className="delete-icon" /> Supprimer
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <p>Êtes-vous sûr de vouloir supprimer ce logement ?</p>
          <p>Cette action est irréversible.</p>
          <div className="delete-actions">
            <button 
              className="cancel-button" 
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              Annuler
            </button>
            <button 
              className="confirm-delete-button" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression en cours...' : 'Confirmer la suppression'}
            </button>
          </div>
        </div>
      )}

      <div className="logement-detail-content">
        <div className="logement-main-info">
          <div 
            className="logement-image" 
            style={{ 
              backgroundImage: logement.image_path 
                ? `url(${logement.image_path})` 
                : 'url(/images/default-accommodation.jpg)' 
            }}
          >
            <div className="logement-type-badge">
              {logement.accommodation_type || 'Hébergement'}
            </div>
          </div>

          <div className="logement-info-card">
            <h2>Informations</h2>
            
            {logement.location && (
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <span>Adresse: {logement.location}</span>
              </div>
            )}
            
            {logement.price_range && (
              <div className="info-item">
                <FaEuroSign className="info-icon" />
                <span>Gamme de prix: {logement.price_range}</span>
              </div>
            )}
            
            {logement.comfort_level && (
              <div className="info-item stars-container">
                <span>Niveau de confort: </span>
                <div className="stars">{getConfortStars(logement.comfort_level)}</div>
              </div>
            )}
            
            {logement.phone && (
              <div className="info-item">
                <FaPhone className="info-icon" />
                <span>Téléphone: {logement.phone}</span>
              </div>
            )}
            
            {logement.website && (
              <div className="info-item">
                <FaGlobe className="info-icon" />
                <a 
                  href={logement.website.startsWith('http') ? logement.website : `https://${logement.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  Site web
                </a>
              </div>
            )}
          </div>
        </div>

        {logement.description && (
          <div className="logement-description">
            <h2>Description</h2>
            <p>{logement.description}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .logement-detail-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 25px;
        }

        .back-link {
          display: flex;
          align-items: center;
          color: #4a6fa5;
          text-decoration: none;
          margin-bottom: 15px;
          transition: color 0.3s ease;
        }

        .back-link:hover {
          color: #3a5a80;
          text-decoration: underline;
        }

        .back-icon {
          margin-right: 8px;
        }

        .title-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .page-title {
          font-size: 2rem;
          color: #2c3e50;
          margin: 0;
          display: flex;
          align-items: center;
        }

        .header-icon {
          margin-right: 10px;
          color: #4a6fa5;
        }

        .edit-button {
          display: flex;
          align-items: center;
          background-color: #3498db;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.3s;
        }

        .edit-button:hover {
          background-color: #2980b9;
        }

        .edit-icon {
          margin-right: 8px;
        }

        .delete-button {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background-color 0.3s;
        }

        .delete-button:hover {
          background-color: #c0392b;
        }

        .delete-button:disabled {
          background-color: #e74c3c;
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-icon {
          margin-right: 8px;
        }

        .delete-confirmation {
          background-color: #fff3f3;
          border: 1px solid #e74c3c;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
        }

        .delete-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 15px;
        }

        .cancel-button {
          background-color: #95a5a6;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .cancel-button:hover {
          background-color: #7f8c8d;
        }

        .confirm-delete-button {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .confirm-delete-button:hover {
          background-color: #c0392b;
        }

        .confirm-delete-button:disabled, .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message-banner {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }

        .logement-detail-content {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .logement-main-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .logement-main-info {
            grid-template-columns: 1fr;
          }
        }

        .logement-image {
          height: 350px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .logement-type-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 1rem;
          font-weight: bold;
        }

        .logement-info-card {
          padding: 20px;
        }

        .logement-info-card h2 {
          margin-top: 0;
          color: #2c3e50;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          color: #555;
        }

        .info-icon {
          margin-right: 10px;
          min-width: 20px;
          color: #4a6fa5;
        }

        .stars-container {
          display: flex;
          align-items: center;
        }

        .stars {
          display: flex;
          margin-left: 10px;
        }

        .star-icon {
          margin-right: 2px;
        }

        .star-icon.filled {
          color: #f1c40f;
        }

        .star-icon.empty {
          color: #ddd;
        }

        .website-link {
          color: #4a6fa5;
          text-decoration: none;
        }

        .website-link:hover {
          text-decoration: underline;
        }

        .logement-description {
          padding: 20px;
          border-top: 1px solid #f0f0f0;
        }

        .logement-description h2 {
          color: #2c3e50;
          margin-top: 0;
        }

        .logement-description p {
          line-height: 1.6;
          color: #555;
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