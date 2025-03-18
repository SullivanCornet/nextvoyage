'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InitializePage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isInitializingDirs, setIsInitializingDirs] = useState(false);
  const [dirsResult, setDirsResult] = useState(null);
  const [dirsError, setDirsError] = useState(null);

  const initializeTables = async () => {
    try {
      setIsInitializing(true);
      setResult(null);
      setError(null);

      const response = await fetch('/api/init-tables');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const initializeUploadDirectories = async () => {
    try {
      setIsInitializingDirs(true);
      setDirsResult(null);
      setDirsError(null);

      // Créer un petit fichier de test pour vérifier les permissions
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });

      // Lister les dossiers à créer
      const directories = [
        'places',
        'countries',
        'cities',
        'restaurants',
        'commerces',
        'accommodations',
        'transports',
        'users',
        'test'
      ];

      const results = {};

      for (const dir of directories) {
        const formData = new FormData();
        formData.append('file', testFile);
        
        const response = await fetch(`/api/upload?folder=${dir}&test=true`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        results[dir] = data.success ? 'créé' : 'erreur';
      }

      setDirsResult({
        success: true,
        message: 'Dossiers d\'upload initialisés',
        details: results
      });
    } catch (err) {
      console.error('Erreur lors de l\'initialisation des dossiers:', err);
      setDirsError(err.message);
    } finally {
      setIsInitializingDirs(false);
    }
  };

  return (
    <div className="initialize-container">
      <div className="header">
        <h1>Initialisation des tables</h1>
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &gt; 
          <Link href="/diagnostic">Diagnostic</Link> &gt; 
          <span>Initialisation</span>
        </div>
      </div>

      <div className="info-panel">
        <h2>Informations</h2>
        <p>
          Cette page vous permet d'initialiser toutes les tables nécessaires dans la base de données.
          Si les tables existent déjà, elles ne seront pas modifiées.
        </p>
        <div className="warning">
          <strong>Note :</strong> Cette opération ne supprime pas de données existantes.
          Elle crée uniquement les tables manquantes.
        </div>
      </div>

      <div className="action-panel">
        <button 
          onClick={initializeTables} 
          disabled={isInitializing}
          className="initialize-button"
        >
          {isInitializing ? 'Initialisation en cours...' : 'Initialiser les tables'}
        </button>
        
        <button 
          onClick={initializeUploadDirectories} 
          disabled={isInitializingDirs}
          className="initialize-button"
        >
          {isInitializingDirs ? 'Création des dossiers...' : 'Initialiser les dossiers d\'upload'}
        </button>
      </div>

      {error && (
        <div className="result-panel error">
          <h2>Erreur</h2>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result-panel success">
          <h2>Résultat</h2>
          <p>{result.message}</p>
          {result.tables && (
            <div className="tables-list">
              <h3>Tables vérifiées :</h3>
              <ul>
                {result.tables.map((table, index) => (
                  <li key={index}>{table}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {dirsError && (
        <div className="result-panel error">
          <h2>Erreur</h2>
          <p>{dirsError}</p>
        </div>
      )}

      {dirsResult && (
        <div className="result-panel success">
          <h2>Résultat</h2>
          <p>{dirsResult.message}</p>
          <pre>{JSON.stringify(dirsResult.details, null, 2)}</pre>
        </div>
      )}

      <div className="navigation">
        <Link href="/diagnostic" className="back-link">Retour au diagnostic</Link>
      </div>

      <style jsx>{`
        .initialize-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          margin-bottom: 30px;
        }

        h1 {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .breadcrumb {
          color: #7f8c8d;
          margin-bottom: 20px;
        }

        .breadcrumb a {
          color: #3498db;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .info-panel, .action-panel, .result-panel {
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          color: #2c3e50;
          font-size: 1.5rem;
          margin-top: 0;
          margin-bottom: 15px;
        }

        .warning {
          background-color: #fff3cd;
          color: #856404;
          padding: 12px;
          border-radius: 5px;
          margin-top: 15px;
        }

        .initialize-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s ease;
        }

        .initialize-button:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .initialize-button:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }

        .result-panel.error {
          background-color: #f8d7da;
          color: #721c24;
        }

        .result-panel.success {
          background-color: #d4edda;
          color: #155724;
        }

        .tables-list {
          margin-top: 15px;
        }

        .tables-list h3 {
          font-size: 1.2rem;
          margin-bottom: 10px;
        }

        .tables-list ul {
          list-style-type: disc;
          margin-left: 20px;
        }

        .back-link {
          display: inline-block;
          color: #3498db;
          text-decoration: none;
          margin-top: 10px;
        }

        .back-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
} 