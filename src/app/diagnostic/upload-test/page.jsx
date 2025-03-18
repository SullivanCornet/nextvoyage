'use client';

import { useState } from 'react';

export default function UploadTest() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [folder, setFolder] = useState('test');
  const [imagePreview, setImagePreview] = useState(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleFolderChange = (e) => {
    setFolder(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }
    
    try {
      setLoading(true);
    setError(null);
    setResult(null);
    
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/upload?folder=${folder}&field=file`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('Résultat de l\'upload:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="upload-test-container">
      <h1>Test d'upload d'images</h1>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="folder">Dossier de destination :</label>
              <input
            type="text" 
            id="folder" 
            value={folder} 
            onChange={handleFolderChange} 
            placeholder="Nom du dossier (ex: accommodations)" 
              />
            </div>
            
        <div className="form-group">
          <label htmlFor="file">Sélectionnez une image :</label>
          <input 
            type="file" 
            id="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="file-input" 
          />
            
            {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Aperçu" className="image-preview" />
              </div>
            )}
        </div>
        
            <button
          type="submit" 
          className="upload-button" 
          disabled={loading || !file}
        >
          {loading ? 'Envoi en cours...' : 'Envoyer'}
            </button>
      </form>
      
        {error && (
        <div className="error-message">
          <h3>Erreur</h3>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
        <div className="result-container">
          <h3>Résultat de l'upload</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          
          {result.url && (
            <div className="uploaded-image-container">
              <h4>Image téléchargée :</h4>
              <img 
                src={result.url} 
                alt="Uploaded" 
                className="uploaded-image" 
              />
            </div>
          )}
          </div>
        )}
      
      <style jsx>{`
        .upload-test-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          color: #333;
          margin-bottom: 30px;
        }
        
        .upload-form {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        input[type="text"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .file-input {
          margin-bottom: 10px;
        }
        
        .image-preview-container {
          margin-top: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          max-width: 300px;
        }
        
        .image-preview {
          width: 100%;
          height: auto;
        }
        
        .upload-button {
          background-color: #4a6fa5;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .upload-button:hover:not(:disabled) {
          background-color: #3a5a80;
        }
        
        .upload-button:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
        }
        
        .result-container {
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f8ff;
          border-radius: 4px;
        }
        
        pre {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
        }
        
        .uploaded-image-container {
          margin-top: 15px;
        }
        
        .uploaded-image {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
} 