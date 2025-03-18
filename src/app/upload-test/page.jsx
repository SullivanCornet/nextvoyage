'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadTest() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('places');

  // Gérer la sélection de fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      
      // Créer un aperçu de l'image
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        setPreview(event.target.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setResult(null);
      
      // Préparer les données du formulaire
      const formData = new FormData();
      formData.append('image', file);
      
      // Envoyer la requête à l'API
      const response = await fetch(`/api/upload?category=${category}&field=image`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test du Service d'Upload Unifié</h1>
      
      <Link href="/" className="text-blue-500 hover:underline mb-6 block">
        ← Retour à l'accueil
      </Link>
      
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block mb-2 font-medium">
              Catégorie
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="places">Lieux</option>
              <option value="users">Utilisateurs</option>
              <option value="products">Produits</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="file" className="block mb-2 font-medium">
              Sélectionner une image
            </label>
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          {preview && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Aperçu :</h3>
              <img
                src={preview}
                alt="Aperçu"
                className="max-w-xs h-auto rounded border"
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={uploading || !file}
            className={`px-4 py-2 rounded font-medium text-white ${
              uploading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Envoi en cours...' : 'Téléverser l\'image'}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Erreur : </strong>
          <span>{error}</span>
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold text-lg mb-2">Upload réussi !</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Nom du fichier :</strong> {result.filename}
              </p>
              <p>
                <strong>Taille :</strong> {Math.round(result.size / 1024)} Ko
              </p>
              <p>
                <strong>Type :</strong> {result.type}
              </p>
              <p>
                <strong>URL :</strong>{' '}
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {result.url}
                </a>
              </p>
            </div>
            <div>
              <img
                src={result.url}
                alt="Image téléversée"
                className="max-w-full h-auto rounded border"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 