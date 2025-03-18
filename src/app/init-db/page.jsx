'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const InitDbPage = () => {
  const [status, setStatus] = useState({
    loading: false,
    message: 'Prêt à initialiser la base de données',
    error: null,
    success: false,
    results: {}
  });
  
  const [steps, setSteps] = useState([
    { id: 'categories', name: 'Catégories', status: 'pending', result: null },
    { id: 'cities', name: 'Villes', status: 'pending', result: null },
    { id: 'places', name: 'Lieux', status: 'pending', result: null }
  ]);
  
  const initDatabase = async () => {
    // Mettre à jour le statut initial
    setStatus({
      loading: true,
      message: 'Initialisation de la base de données en cours...',
      error: null,
      success: false,
      results: {}
    });
    
    const updatedSteps = [...steps].map(step => ({ ...step, status: 'pending' }));
    setSteps(updatedSteps);
    
    let allResults = {};
    
    try {
      // Étape 1: Initialisation des catégories
      updatedSteps[0].status = 'loading';
      setSteps([...updatedSteps]);
      
      try {
        const categoriesResponse = await fetch('/api/categories/init');
        const categoriesData = await categoriesResponse.json();
        
        updatedSteps[0].status = categoriesData.success ? 'success' : 'error';
        updatedSteps[0].result = categoriesData;
        setSteps([...updatedSteps]);
        
        allResults.categories = categoriesData;
      } catch (error) {
        updatedSteps[0].status = 'error';
        updatedSteps[0].result = { error: error.message };
        setSteps([...updatedSteps]);
        throw new Error(`Erreur lors de l'initialisation des catégories: ${error.message}`);
      }
      
      // Étape 2: Initialisation des villes
      updatedSteps[1].status = 'loading';
      setSteps([...updatedSteps]);
      
      try {
        const citiesResponse = await fetch('/api/cities/init');
        const citiesData = await citiesResponse.json();
        
        updatedSteps[1].status = citiesData.success ? 'success' : 'error';
        updatedSteps[1].result = citiesData;
        setSteps([...updatedSteps]);
        
        allResults.cities = citiesData;
      } catch (error) {
        updatedSteps[1].status = 'error';
        updatedSteps[1].result = { error: error.message };
        setSteps([...updatedSteps]);
        throw new Error(`Erreur lors de l'initialisation des villes: ${error.message}`);
      }
      
      // Étape 3: Initialisation des lieux
      updatedSteps[2].status = 'loading';
      setSteps([...updatedSteps]);
      
      try {
        const placesResponse = await fetch('/api/places/init');
        const placesData = await placesResponse.json();
        
        updatedSteps[2].status = placesData.success ? 'success' : 'error';
        updatedSteps[2].result = placesData;
        setSteps([...updatedSteps]);
        
        allResults.places = placesData;
      } catch (error) {
        updatedSteps[2].status = 'error';
        updatedSteps[2].result = { error: error.message };
        setSteps([...updatedSteps]);
        throw new Error(`Erreur lors de l'initialisation des lieux: ${error.message}`);
      }
      
      // Mise à jour du statut final avec succès
      setStatus({
        loading: false,
        message: 'Initialisation de la base de données terminée avec succès !',
        error: null,
        success: true,
        results: allResults
      });
      
    } catch (error) {
      // Mise à jour du statut final avec erreur
      setStatus({
        loading: false,
        message: 'Erreur lors de l\'initialisation de la base de données',
        error: error.message,
        success: false,
        results: allResults
      });
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 border-green-300 text-green-800';
      case 'error': return 'bg-red-100 border-red-300 text-red-800';
      case 'loading': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'loading': return '⏳';
      default: return '⏸️';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Initialisation de la base de données</h1>
      
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">À propos de cette page</h2>
        <p className="text-blue-900">
          Cette page vous permet d'initialiser la base de données en créant toutes les tables 
          nécessaires et en ajoutant des données initiales. Utilisez cette page si vous rencontrez 
          des erreurs du type "table non trouvée" dans l'application.
        </p>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Statut actuel</h2>
          <p className={`mt-1 ${status.error ? 'text-red-600' : status.success ? 'text-green-600' : 'text-gray-600'}`}>
            {status.message}
          </p>
        </div>
        
        <button
          onClick={initDatabase}
          disabled={status.loading}
          className={`px-4 py-2 rounded text-white font-medium ${
            status.loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {status.loading ? 'Initialisation en cours...' : 'Initialiser la base de données'}
        </button>
      </div>
      
      <div className="space-y-4 mb-8">
        {steps.map((step) => (
          <div key={step.id} className={`p-4 border rounded-lg ${getStatusColor(step.status)}`}>
            <h3 className="font-medium flex items-center">
              <span className="mr-2">{getStatusIcon(step.status)}</span>
              {step.name}
            </h3>
            
            {step.status === 'loading' && (
              <p className="text-sm mt-1">Initialisation en cours...</p>
            )}
            
            {step.result && (
              <div className="mt-2">
                <details>
                  <summary className="cursor-pointer text-sm font-medium">Détails</summary>
                  <pre className="mt-2 p-2 bg-white/50 rounded text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                    {JSON.stringify(step.result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {status.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Base de données initialisée avec succès</h3>
          <p className="text-green-700 mb-4">
            Toutes les tables nécessaires ont été créées et les données initiales ont été ajoutées.
            Vous pouvez maintenant utiliser l'application normalement.
          </p>
          
          <div className="flex space-x-4">
            <Link href="/diagnostic" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
              Voir le diagnostic
            </Link>
            <Link href="/places/add" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
              Ajouter un lieu
            </Link>
            <Link href="/" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      )}
      
      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Erreur lors de l'initialisation</h3>
          <p className="text-red-700 mb-2">{status.error}</p>
          <p className="text-red-600 text-sm">
            Consultez les détails des étapes ci-dessus pour plus d'informations sur ce qui s'est mal passé.
          </p>
        </div>
      )}
    </div>
  );
};

export default InitDbPage; 