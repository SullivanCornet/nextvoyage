'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBus, FaArrowLeft, FaMapMarkerAlt, FaRoute, FaClock, FaMoneyBillWave, FaLightbulb, FaTrash, FaEdit } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/app/contexts/AuthContext';
import '@/styles/button-styles.css';

export default function TransportDetail() {
  const router = useRouter();
  const { slug, citySlug, transportSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transport, setTransport] = useState(null);
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

        // Récupération de tous les transports de cette ville
        const transportsResponse = await fetch(`/api/countries/${slug}/cities/${citySlug}/transports`);
        if (!transportsResponse.ok) {
          throw new Error('Erreur lors de la récupération des transports');
        }
        
        const transportsData = await transportsResponse.json();
        
        // Trouver le transport spécifique par son id (transportSlug)
        const foundTransport = transportsData.find(t => t.slug === transportSlug || t.id.toString() === transportSlug);
        
        if (!foundTransport) {
          throw new Error('Transport non trouvé');
        }
        
        setTransport(foundTransport);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, citySlug, transportSlug]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/transports/${transport.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du transport');
      }
      
      // Redirection vers la liste des transports après suppression
      router.push(`/countries/${slug}/cities/${citySlug}/transports`);
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError(`Erreur lors de la suppression: ${error.message}`);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !transport) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Transport non trouvé'}</p>
        <Link href={`/countries/${slug}/cities/${citySlug}/transports`} className="back-link">
          <FaArrowLeft className="back-icon" /> Retour aux transports
        </Link>
      </div>
    );
  }

  return (
    <div className="transport-detail-container">
      {error && (
        <div className="error-message-banner">
          {error}
        </div>
      )}
      
      <div className="page-header">
        <Link href={`/countries/${slug}/cities/${citySlug}/transports`} className="back-link">
          <FaArrowLeft className="back-icon" /> Retour aux transports
        </Link>
        <div className="title-actions">
          <h1 className="page-title">
            <FaBus className="header-icon" /> {transport.name}
          </h1>
          {isAuthenticated && (
            <div className="action-buttons">
              <Link 
                href={`/countries/${slug}/cities/${citySlug}/transports/${transportSlug}/modifier`}
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
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <p>Êtes-vous sûr de vouloir supprimer ce transport ?</p>
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

      <div className="transport-detail-content">
        <div className="transport-main-info">
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

          <div className="transport-info-card">
            <h2>Informations</h2>
            
            {transport.location && (
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <span>{transport.location}</span>
              </div>
            )}
            
            {transport.route && (
              <div className="info-item">
                <FaRoute className="info-icon" />
                <span>Itinéraire: {transport.route}</span>
              </div>
            )}
            
            {transport.schedule && (
              <div className="info-item">
                <FaClock className="info-icon" />
                <span>Horaires: {transport.schedule}</span>
              </div>
            )}
            
            {transport.price_info && (
              <div className="info-item">
                <FaMoneyBillWave className="info-icon" />
                <span>Tarifs: {transport.price_info}</span>
              </div>
            )}
          </div>
        </div>

        {transport.description && (
          <div className="transport-description">
            <h2>Description</h2>
            <p>{transport.description}</p>
          </div>
        )}

        {transport.tips && (
          <div className="transport-tips">
            <h2><FaLightbulb className="tips-icon" /> Conseils utiles</h2>
            <p>{transport.tips}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .transport-detail-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .error-container {
          text-align: center;
          padding: 3rem 1rem;
        }
        
        .error-message {
          color: red;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        
        .error-message-banner {
          background-color: #ffebee;
          color: #d32f2f;
          padding: 0.8rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .back-link {
          display: flex;
          align-items: center;
          color: #666;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }
        
        .back-link:hover {
          color: #333;
        }
        
        .back-icon {
          margin-right: 0.5rem;
        }
        
        .title-actions {
          flex-grow: 1;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        
        .page-title {
          display: flex;
          align-items: center;
          font-size: 1.8rem;
          margin: 0;
          color: #333;
        }
        
        .header-icon {
          margin-right: 0.5rem;
          color: #4a6da7;
        }
        
        .action-buttons {
          display: flex;
          gap: 15px;
        }
        
        .edit-button {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background-color: #4a6da7;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .edit-button:hover {
          background-color: #3a5a8f;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .edit-icon {
          margin-right: 6px;
        }
        
        .delete-button {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .delete-button:hover {
          background-color: #c0392b;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .delete-button:disabled {
          background-color: #e57373;
          cursor: not-allowed;
        }
        
        .delete-icon {
          margin-right: 6px;
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

        .transport-detail-content {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .transport-main-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .transport-main-info {
            grid-template-columns: 1fr;
          }
        }

        .transport-image {
          height: 350px;
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
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 1rem;
          font-weight: bold;
        }

        .transport-info-card {
          padding: 20px;
        }

        .transport-info-card h2 {
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

        .transport-description, .transport-tips {
          padding: 20px;
          border-top: 1px solid #f0f0f0;
        }

        .transport-description h2, .transport-tips h2 {
          color: #2c3e50;
          margin-top: 0;
        }

        .transport-description p, .transport-tips p {
          line-height: 1.6;
          color: #555;
        }

        .tips-icon {
          color: #f39c12;
        }
      `}</style>
    </div>
  );
} 