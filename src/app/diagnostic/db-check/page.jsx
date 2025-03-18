'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DbCheck() {
  const [status, setStatus] = useState('Vérification en cours...');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        setLoading(true);
        
        // Test de connexion basique
        const connResponse = await fetch('/api/check-db');
        const connData = await connResponse.json();
        
        // Vérification de la table city_transports
        const tableCheckResponse = await fetch('/api/diagnostic/table-check?table=city_transports');
        const tableCheckData = await tableCheckResponse.json();
        
        setResults({
          connection: connData,
          tableCheck: tableCheckData
        });
        
        setStatus(
          connData.success && tableCheckData.success 
            ? 'Base de données fonctionnelle' 
            : 'Problèmes détectés avec la base de données'
        );
      } catch (error) {
        console.error('Erreur lors de la vérification de la base de données:', error);
        setError(error.message);
        setStatus('Erreur lors de la vérification');
      } finally {
        setLoading(false);
      }
    };
    
    checkDatabase();
  }, []);
  
  return (
    <div className="db-check-container">
      <h1>Vérification de la Base de Données</h1>
      
      <div className="links">
        <Link href="/diagnostic">← Retour au diagnostic</Link>
      </div>
      
      <div className={`status-box ${status.includes('Erreur') || status.includes('Problèmes') ? 'error' : status.includes('fonction') ? 'success' : 'pending'}`}>
        <h2>Statut: {status}</h2>
        {loading && <div className="loader"></div>}
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {!loading && results.connection && (
        <div className="results-section">
          <h3>Connexion à la base de données</h3>
          <div className={`result-box ${results.connection.success ? 'success' : 'error'}`}>
            <pre>{JSON.stringify(results.connection, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {!loading && results.tableCheck && (
        <div className="results-section">
          <h3>Vérification de la table city_transports</h3>
          <div className={`result-box ${results.tableCheck.success ? 'success' : 'error'}`}>
            <pre>{JSON.stringify(results.tableCheck, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .db-check-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        
        .links {
          margin-bottom: 20px;
        }
        
        .links a {
          color: #3498db;
          text-decoration: none;
        }
        
        .links a:hover {
          text-decoration: underline;
        }
        
        .status-box {
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
        
        .error {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        .pending {
          background-color: #ffeeba;
          border: 1px solid #ffeeba;
          color: #856404;
        }
        
        .loader {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #3498db;
          animation: spin 1s ease-in-out infinite;
          margin-left: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          margin-top: 10px;
          padding: 10px;
          background-color: #fff;
          border-radius: 4px;
        }
        
        .results-section {
          margin-top: 30px;
        }
        
        .result-box {
          padding: 15px;
          border-radius: 8px;
          overflow: auto;
        }
        
        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
} 