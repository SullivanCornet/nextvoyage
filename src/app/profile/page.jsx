'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Remplir le formulaire avec les données utilisateur une fois chargées
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);
  
  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Pour une démonstration simple, nous vérifions juste les données
      if (!formData.name || !formData.email) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Dans une version plus complète, vous pourriez envoyer une requête API
      // pour mettre à jour les informations de l'utilisateur
      
      setSuccessMessage('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setErrorMessage('Une erreur est survenue lors de la mise à jour du profil');
    }
  };
  
  if (isLoading) {
    return <div className="profile-container"><p>Chargement...</p></div>;
  }
  
  if (!isAuthenticated) {
    return null; // Redirection gérée par useEffect
  }
  
  return (
    <div className="profile-container">
      <h1>Mon Profil</h1>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <div className="profile-card">
        <div className="profile-header">
          <h2>{user.name}</h2>
          <span className="role-badge">{user.role}</span>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Nom</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                disabled // Email ne peut pas être modifié pour simplifier
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-save">
                Enregistrer
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setErrorMessage('');
                  // Réinitialiser les données du formulaire
                  if (user) {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                    });
                  }
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Rôle:</span>
              <span className="info-value">{user.role}</span>
            </div>
            
            <button 
              className="btn-edit" 
              onClick={() => setIsEditing(true)}
            >
              Modifier le profil
            </button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 1rem;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .error-message, .success-message {
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .error-message {
          background-color: #ffecec;
          color: #f44336;
          border: 1px solid #f44336;
        }
        
        .success-message {
          background-color: #e7f7e7;
          color: #28a745;
          border: 1px solid #28a745;
        }
        
        .profile-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }
        
        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        
        .profile-header h2 {
          margin: 0;
          color: #2c3e50;
        }
        
        .role-badge {
          background-color: #3498db;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          text-transform: capitalize;
        }
        
        .profile-info {
          margin-bottom: 1.5rem;
        }
        
        .info-item {
          margin-bottom: 1rem;
          display: flex;
        }
        
        .info-label {
          min-width: 100px;
          font-weight: bold;
          color: #7f8c8d;
        }
        
        .info-value {
          color: #2c3e50;
        }
        
        .profile-form {
          margin-top: 1rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: #7f8c8d;
        }
        
        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .form-input:disabled {
          background-color: #f9f9f9;
          cursor: not-allowed;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .btn-edit, .btn-save, .btn-cancel {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .btn-edit {
          background-color: #3498db;
          color: white;
          margin-top: 1rem;
        }
        
        .btn-save {
          background-color: #2ecc71;
          color: white;
        }
        
        .btn-cancel {
          background-color: #e74c3c;
          color: white;
        }
        
        .btn-edit:hover {
          background-color: #2980b9;
        }
        
        .btn-save:hover {
          background-color: #27ae60;
        }
        
        .btn-cancel:hover {
          background-color: #c0392b;
        }
      `}</style>
    </div>
  );
} 