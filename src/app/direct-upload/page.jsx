'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const DirectUploadPage = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Gérer la sélection de fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      
      console.log('Fichier sélectionné:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: `${Math.round(selectedFile.size / 1024)} KB`
      });
    } else {
      setFile(null);
      setImagePreview(null);
    }
  };
  
  // Tester l'upload vers /api/direct-upload
  const testDirectUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner une image');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setResult(null);
    
    console.log('Test d\'upload direct vers /api/direct-upload');
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('test', 'direct upload test');
      
      const response = await fetch('/api/direct-upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('Résultat du test d\'upload direct:', data);
      
      setResult({
        endpoint: '/api/direct-upload',
        success: data.success,
        timestamp: new Date().toISOString(),
        data
      });
    } catch (error) {
      console.error('Erreur lors du test d\'upload direct:', error);
      setError(`Test d'upload direct échoué: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link 
          href="/diagnostic" 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          ← Retour au diagnostic
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Test d'upload direct (sans formidable)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section sélection d'image */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">1. Sélectionner une image</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="font-medium">Fichier image :</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border rounded p-2"
              />
            </div>
            
            {file && (
              <div className="px-4 py-2 bg-gray-100 rounded">
                <p><span className="font-medium">Nom:</span> {file.name}</p>
                <p><span className="font-medium">Type:</span> {file.type}</p>
                <p><span className="font-medium">Taille:</span> {Math.round(file.size / 1024)} KB</p>
              </div>
            )}
            
            {imagePreview && (
              <div className="mt-4 border rounded p-2">
                <p className="text-sm font-medium mb-2">Aperçu:</p>
                <img 
                  src={imagePreview} 
                  alt="Aperçu" 
                  className="max-h-48 max-w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Section test d'upload */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">2. Tester l'upload</h2>
          
          <div className="space-y-4">
            <button
              onClick={testDirectUpload}
              disabled={isUploading || !file}
              className={`w-full py-2 px-4 rounded text-white font-medium ${
                isUploading || !file
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Upload en cours...' : 'Tester upload direct'}
            </button>
            
            <p className="text-sm text-gray-500 italic">
              Note: Cette méthode utilise l'API FormData native de Next.js au lieu de formidable
            </p>
          </div>
        </div>
      </div>
      
      {/* Section résultats */}
      <div className="mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-4">
            <h3 className="font-semibold">Erreur :</h3>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className={`border rounded p-4 mb-4 ${
            result.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h3 className="font-semibold">
              {result.success ? '✅ Upload réussi!' : '⚠️ Problème avec l\'upload'}
            </h3>
            <p className="text-sm mb-2">
              <span className="font-medium">Endpoint:</span> {result.endpoint}
            </p>
            <p className="text-sm mb-2">
              <span className="font-medium">Timestamp:</span> {result.timestamp}
            </p>
            
            <div className="mt-4">
              <details>
                <summary className="cursor-pointer font-medium">Détails de la réponse</summary>
                <pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-x-auto text-sm">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </div>
            
            {result.success && result.data.file && result.data.file.url && (
              <div className="mt-4">
                <h4 className="font-medium">Image téléchargée:</h4>
                <div className="border rounded p-2 mt-2">
                  <img 
                    src={result.data.file.url} 
                    alt="Image téléchargée" 
                    className="max-h-96 max-w-full object-contain mx-auto"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Section aide */}
      <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded">
        <h2 className="text-lg font-semibold text-blue-800">À propos de cette page</h2>
        <p className="mt-2 text-blue-900">
          Cette page teste l'upload d'image directement via l'API FormData de Next.js, sans utiliser 
          la bibliothèque formidable. Elle peut aider à isoler les problèmes liés à formidable 
          des problèmes liés au système de fichiers ou aux permissions.
        </p>
      </div>
    </div>
  );
};

export default DirectUploadPage; 