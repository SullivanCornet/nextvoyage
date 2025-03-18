'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DiagnosticPage = () => {
  const [dbStatus, setDbStatus] = useState({ loading: true, status: 'inconnu', details: null });
  const [fsStatus, setFsStatus] = useState({ loading: true, status: 'inconnu', details: null });
  
  // Vérifier la connexion à la base de données
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const res = await fetch('/api/test-db');
        const data = await res.json();
        
        setDbStatus({
          loading: false,
          status: data.success ? 'connecté' : 'erreur',
          details: data
        });
      } catch (error) {
        console.error('Erreur lors du test de la base de données:', error);
        setDbStatus({
          loading: false,
          status: 'erreur',
          details: { error: error.message }
        });
      }
    };
    
    checkDatabase();
  }, []);
  
  // Vérifier les permissions du système de fichiers
  useEffect(() => {
    const checkFileSystem = async () => {
      try {
        // Créer un petit fichier temporaire pour tester l'écriture
        const testContent = new Blob(['Test d\'écriture depuis diagnostic'], { type: 'text/plain' });
        const formData = new FormData();
        formData.append('testFile', testContent, 'test.txt');
        
        const res = await fetch('/api/direct-upload?test=fs', {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();
        
        setFsStatus({
          loading: false,
          status: data.success ? 'accessible' : 'erreur',
          details: data
        });
      } catch (error) {
        console.error('Erreur lors du test du système de fichiers:', error);
        setFsStatus({
          loading: false,
          status: 'erreur',
          details: { error: error.message }
        });
      }
    };
    
    checkFileSystem();
  }, []);
  
  // Réutilisable pour les indicateurs d'état
  const StatusIndicator = ({ status, label }) => {
    let color;
    let icon;
    
    switch (status) {
      case 'connecté':
      case 'accessible':
        color = 'bg-green-100 text-green-800 border-green-200';
        icon = '✅';
        break;
      case 'erreur':
        color = 'bg-red-100 text-red-800 border-red-200';  
        icon = '❌';
        break;
      default:
        color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        icon = '⏳';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon} {label}
      </span>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Diagnostic AppVoyage</h1>
      
      {/* Résumé des statuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-3">Base de données</h2>
          <div className="flex items-center space-x-2">
            <StatusIndicator 
              status={dbStatus.status} 
              label={dbStatus.loading ? 'Vérification...' : dbStatus.status}
            />
            
            {dbStatus.status === 'erreur' && (
              <Link 
                href="/init-db" 
                className="ml-2 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full transition"
              >
                Initialiser les tables
              </Link>
            )}
          </div>
          
          {dbStatus.details && !dbStatus.loading && (
            <div className="mt-4">
              <details>
                <summary className="cursor-pointer text-blue-600">Voir les détails</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(dbStatus.details, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-3">Système de fichiers</h2>
          <div className="flex items-center space-x-2">
            <StatusIndicator 
              status={fsStatus.status}
              label={fsStatus.loading ? 'Vérification...' : fsStatus.status}
            />
          </div>
          
          {fsStatus.details && !fsStatus.loading && (
            <div className="mt-4">
              <details>
                <summary className="cursor-pointer text-blue-600">Voir les détails</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(fsStatus.details, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
      
      {/* Pages de test */}
      <h2 className="text-2xl font-semibold mb-4">Pages de test</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Link href="/test-upload" className="block">
          <div className="bg-white rounded-lg border hover:border-blue-500 hover:shadow-md transition p-4">
            <h3 className="text-lg font-medium text-blue-600">Test d'upload</h3>
            <p className="text-sm text-gray-600 mt-1">
              Tester l'upload d'image via formidable
            </p>
          </div>
        </Link>
        
        <Link href="/direct-upload" className="block">
          <div className="bg-white rounded-lg border hover:border-blue-500 hover:shadow-md transition p-4">
            <h3 className="text-lg font-medium text-blue-600">Upload direct</h3>
            <p className="text-sm text-gray-600 mt-1">
              Tester l'upload d'image sans formidable
            </p>
          </div>
        </Link>
        
        <Link href="/places/add" className="block">
          <div className="bg-white rounded-lg border hover:border-blue-500 hover:shadow-md transition p-4">
            <h3 className="text-lg font-medium text-blue-600">Ajouter un lieu</h3>
            <p className="text-sm text-gray-600 mt-1">
              Page principale pour ajouter un lieu
            </p>
          </div>
        </Link>
        
        <Link href="/init-db" className="block">
          <div className="bg-white rounded-lg border hover:border-blue-500 hover:shadow-md transition p-4">
            <h3 className="text-lg font-medium text-blue-600">Initialisation BD</h3>
            <p className="text-sm text-gray-600 mt-1">
              Créer/réinitialiser les tables de la BD
            </p>
          </div>
        </Link>

        <Link href="/diagnostic/categories" className="block">
          <div className="bg-white rounded-lg border hover:border-blue-500 hover:shadow-md transition p-4">
            <h3 className="text-lg font-medium text-blue-600">Catégories</h3>
            <p className="text-sm text-gray-600 mt-1">
              Gérer les catégories de lieux
            </p>
          </div>
        </Link>

        <Link href="/diagnostic/db-check" className="block">
          <div className="bg-white rounded-lg border hover:border-blue-500 hover:shadow-md transition p-4">
            <h3 className="text-lg font-medium text-blue-600">Vérification BD</h3>
            <p className="text-sm text-gray-600 mt-1">
              Vérifier la connexion et les tables
            </p>
          </div>
        </Link>

        <Link href="/diagnostic/initialize" className="block">
          <div className="bg-white rounded-lg border hover:border-blue-500 hover:shadow-md transition p-4">
            <h3 className="text-lg font-medium text-blue-600">Initialiser tables</h3>
            <p className="text-sm text-gray-600 mt-1">
              Initialiser toutes les tables nécessaires
            </p>
          </div>
        </Link>

        <Link href="/diagnostic/upload-test" className="block">
          <div className="bg-white rounded-lg border hover:border-blue-500 hover:shadow-md transition p-4">
            <h3 className="text-lg font-medium text-blue-600">Test d'upload amélioré</h3>
            <p className="text-sm text-gray-600 mt-1">
              Page de test pour l'upload d'images dans n'importe quel dossier
            </p>
          </div>
        </Link>
      </div>
      
      {/* Informations système */}
      <h2 className="text-2xl font-semibold mb-4">Informations système</h2>
      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Configuration Next.js</h3>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Version: </span>
              {process.env.NEXT_PUBLIC_VERSION || 'Information non disponible'}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Environnement: </span>
              {process.env.NODE_ENV}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Mode de rendu: </span>
              {"Client-side (ce composant est 'use client')"}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Chemins importants</h3>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Base de données: </span>
              {process.env.NEXT_PUBLIC_DB_PATH || './db.sqlite'}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Dossier d'upload: </span>
              {'./public/uploads (par défaut)'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Guide de dépannage */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">Guide de dépannage</h2>
        
        <h3 className="font-medium text-blue-700 mt-4">Problèmes de base de données</h3>
        <ul className="list-disc list-inside text-blue-900 text-sm mt-2 ml-2 space-y-1">
          <li>Vérifiez que le fichier de base de données existe et est accessible</li>
          <li>Vérifiez les permissions du fichier de base de données</li>
          <li>Assurez-vous que la table 'places' existe avec les bons champs</li>
        </ul>
        
        <h3 className="font-medium text-blue-700 mt-4">Problèmes d'upload d'images</h3>
        <ul className="list-disc list-inside text-blue-900 text-sm mt-2 ml-2 space-y-1">
          <li>Vérifiez que le dossier 'public/uploads/places' existe et est accessible en écriture</li>
          <li>Vérifiez les permissions du dossier et des sous-dossiers</li>
          <li>Comparez les résultats des tests d'upload direct et via formidable</li>
          <li>Vérifiez les messages d'erreur dans la console du navigateur et du serveur</li>
        </ul>
        
        <div className="bg-white border border-blue-100 rounded p-3 mt-4">
          <p className="text-sm text-gray-800">
            <span className="font-bold">Astuce:</span> Si le test d'upload direct fonctionne mais 
            pas l'upload via formidable, le problème vient probablement de la configuration de 
            formidable ou de la façon dont les requêtes sont traitées.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage; 