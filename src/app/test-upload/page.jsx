'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function TestUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Gérer la sélection de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    setResult(null);
    
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }
    
    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image (JPEG, PNG, etc.).');
      return;
    }
    
    setSelectedFile(file);
    
    // Créer une URL pour prévisualiser l'image
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };
  
  // Tester l'upload
  const testUpload = async () => {
    if (!selectedFile) {
      setError('Veuillez d\'abord sélectionner une image.');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('test', 'true');
      
      console.log('Envoi du test d\'upload...');
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur pendant l\'upload');
      }
      
      console.log('Réponse reçue:', data);
      setResult(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-blue-800">Test d'Upload d'Images</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Sélectionnez une image à tester</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Fichier image:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          
          {previewUrl && (
            <div className="mb-4">
              <p className="text-gray-700 mb-2">Aperçu:</p>
              <div className="relative h-48 w-full bg-gray-100 rounded overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Aperçu"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
          
          <button
            onClick={testUpload}
            disabled={isUploading || !selectedFile}
            className={`px-4 py-2 rounded font-semibold text-white ${
              isUploading || !selectedFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Test en cours...' : 'Tester l\'upload'}
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Résultat du test</h3>
            
            <div className="mb-4">
              <p className="font-medium">Statut: 
                <span className="ml-2 text-green-600 font-bold">Réussi</span>
              </p>
              <p className="font-medium">Image enregistrée: 
                <span className="ml-2">{result.imagePath}</span>
              </p>
            </div>
            
            {result.imageDetails && (
              <div className="mb-4">
                <p className="font-medium">Détails de l'image:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Nom original: {result.imageDetails.name}</li>
                  <li>Type MIME: {result.imageDetails.type}</li>
                  <li>Taille: {Math.round(result.imageDetails.size / 1024)} KB</li>
                </ul>
              </div>
            )}
            
            {result.systemInfo && (
              <div className="text-xs text-gray-500 mt-4">
                <p>Informations système:</p>
                <ul>
                  <li>Chemin du répertoire: {result.systemInfo.testDir}</li>
                  <li>Horodatage: {new Date(result.systemInfo.timestamp).toLocaleString()}</li>
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={() => router.push('/ajouter-lieu')}
            className="text-blue-600 hover:text-blue-800"
          >
            Retour à l'ajout de lieu
          </button>
        </div>
      </div>
    </div>
  );
} 