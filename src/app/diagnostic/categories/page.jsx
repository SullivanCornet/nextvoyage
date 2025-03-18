'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CategoriesDiagnostic() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recreateResult, setRecreateResult] = useState(null);
  const [isRecreating, setIsRecreating] = useState(false);

  // Charger les catégories existantes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des catégories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fonction pour recréer les catégories
  const handleRecreateCategories = async () => {
    if (!confirm('Êtes-vous sûr de vouloir recréer toutes les catégories ? Cette action supprimera les catégories existantes.')) {
      return;
    }

    try {
      setIsRecreating(true);
      setRecreateResult(null);
      
      const response = await fetch('/api/categories/recreate');
      if (!response.ok) {
        throw new Error('Erreur lors de la recréation des catégories');
      }
      
      const result = await response.json();
      setRecreateResult(result);
      
      // Recharger les catégories
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRecreating(false);
    }
  };

  return (
    <div className="diagnostic-container">
      <div className="header">
        <h1>Diagnostic des Catégories</h1>
        <Link href="/diagnostic" className="back-link">
          ← Retour au diagnostic
        </Link>
      </div>

      {error && (
        <div className="error-message">
          <p>Erreur: {error}</p>
        </div>
      )}

      {recreateResult && (
        <div className={`result-message ${recreateResult.success ? 'success' : 'error'}`}>
          <p>{recreateResult.message}</p>
          {recreateResult.categories && (
            <p>{recreateResult.categories.length} catégories créées</p>
          )}
        </div>
      )}

      <div className="action-panel">
        <h2>Actions</h2>
        <button 
          onClick={handleRecreateCategories} 
          disabled={isRecreating}
          className="action-button recreate"
        >
          {isRecreating ? 'Recréation en cours...' : 'Recréer toutes les catégories'}
        </button>
        <p className="help-text">
          Cette action va supprimer toutes les catégories existantes et créer les catégories par défaut : 
          Commerces, Restaurants, Lieux à visiter, Transports et Logements.
        </p>
      </div>

      <div className="categories-panel">
        <h2>Catégories existantes</h2>
        {isLoading ? (
          <p>Chargement des catégories...</p>
        ) : categories.length > 0 ? (
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Slug</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune catégorie trouvée.</p>
        )}
      </div>

      <style jsx>{`
        .diagnostic-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        h1 {
          color: #2c3e50;
          font-size: 1.8rem;
          margin: 0;
        }
        
        .back-link {
          display: inline-block;
          color: #3498db;
          text-decoration: none;
        }
        
        .back-link:hover {
          text-decoration: underline;
        }
        
        .action-panel, .categories-panel {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        
        h2 {
          color: #2c3e50;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1.5rem;
        }
        
        .action-button {
          padding: 10px 20px;
          font-size: 1rem;
          border: none;
          border-radius: 5px;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .action-button.recreate {
          background-color: #e74c3c;
        }
        
        .action-button.recreate:hover {
          background-color: #c0392b;
        }
        
        .action-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        .help-text {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-top: 10px;
        }
        
        .categories-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        .categories-table th, .categories-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .categories-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .error-message, .result-message {
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .error-message {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        .result-message.success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
        
        .result-message.error {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
      `}</style>
    </div>
  );
} 