'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaUser, FaLock, FaSignInAlt, FaHome } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Rediriger après un court délai en cas de succès
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500); // Attendre 1,5 secondes avant de rediriger
      
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation basique
    if (!formData.email || !formData.password) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    
    try {
      setLoading(true);
      
      // Utiliser la fonction login du contexte d'authentification
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la connexion');
      }
      
      // Afficher un message de succès
      setSuccess(`Connexion réussie ! Bienvenue, ${result.user.name}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-nav">
        <Link href="/" className="home-link">
          <FaHome /> Retour à l'accueil
        </Link>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <FaUser />
          </div>
          <h1>Connexion</h1>
          <p className="login-subtitle">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <p>{success}</p>
            <p className="redirect-message">Redirection en cours...</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaUser className="input-icon" /> Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" /> Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || success}
            className={`login-button ${loading || success ? 'disabled' : ''}`}
          >
            <FaSignInAlt className="button-icon" />
            {loading ? 'Connexion en cours...' : success ? 'Connecté !' : 'Se connecter'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Vous n'avez pas encore de compte ? 
          </p>
          <Link href="/auth/register" className="register-link">
            Créer un compte
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .login-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Montserrat', Arial, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-color);
          color: var(--text);
        }
        
        .login-nav {
          position: absolute;
          top: 20px;
          left: 20px;
        }
        
        .home-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--primary);
          text-decoration: none;
          font-weight: bold;
          transition: color 0.3s;
        }
        
        .home-link:hover {
          color: var(--primary-dark);
        }
        
        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          background-color: var(--card-bg);
          border-radius: 12px;
          box-shadow: var(--card-shadow);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .login-icon {
          width: 60px;
          height: 60px;
          background-color: var(--primary);
          color: var(--white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          font-size: 24px;
        }
        
        h1 {
          color: var(--text-dark);
          font-size: 28px;
          margin: 0 0 10px 0;
        }
        
        .login-subtitle {
          color: var(--text-light);
          margin: 0;
          font-size: 16px;
        }
        
        .error-message {
          background-color: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 25px;
          font-size: 14px;
        }
        
        .success-message {
          background-color: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 25px;
          font-size: 14px;
        }
        
        .redirect-message {
          margin-top: 5px;
          font-style: italic;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          color: var(--text-dark);
          margin-bottom: 8px;
          font-size: 15px;
        }
        
        .input-icon {
          color: var(--primary);
        }
        
        input {
          width: 100%;
          padding: 12px 15px;
          background-color: var(--dark-light);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 16px;
          color: var(--text);
          transition: border-color 0.3s;
        }
        
        input:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }
        
        .login-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background-color: var(--primary);
          color: var(--white);
          border: none;
          border-radius: 8px;
          padding: 14px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
          box-shadow: 0 4px 6px rgba(33, 150, 243, 0.3);
        }
        
        .login-button:hover:not(.disabled) {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(33, 150, 243, 0.4);
        }
        
        .login-button.disabled {
          background-color: #566573;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .button-icon {
          font-size: 18px;
        }
        
        .login-footer {
          text-align: center;
          margin-top: 30px;
          color: var(--text-light);
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .login-footer p {
          margin: 0;
        }
        
        .register-link {
          color: var(--primary);
          font-weight: bold;
          text-decoration: none;
          transition: color 0.3s;
          padding: 8px 16px;
          border-radius: 5px;
          background-color: rgba(33, 150, 243, 0.1);
        }
        
        .register-link:hover {
          color: var(--primary-dark);
          background-color: rgba(33, 150, 243, 0.2);
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .login-card {
            padding: 25px;
            max-width: 100%;
          }
          
          .login-nav {
            position: relative;
            top: 0;
            left: 0;
            margin-bottom: 30px;
          }
          
          .login-container {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
} 