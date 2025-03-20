'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Créer le contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  return useContext(AuthContext);
}

// Provider du contexte d'authentification
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Vérifier si l'utilisateur est connecté au chargement de la page
  useEffect(() => {
    // Fonction pour récupérer l'utilisateur actuel
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fonction pour se connecter
  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour l'état utilisateur immédiatement
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  };

  // Fonction pour s'inscrire
  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour l'état utilisateur immédiatement
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  };

  // Fonction pour se déconnecter
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Effacer l'état utilisateur immédiatement
      setUser(null);
      router.push('/');
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return { success: false, error: 'Erreur lors de la déconnexion' };
    }
  };

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = !!user;

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (roles) => {
    // Si roles est un tableau, vérifier si l'utilisateur a l'un des rôles
    if (Array.isArray(roles)) {
      return user && roles.includes(user.role);
    }
    // Sinon, vérifier si l'utilisateur a le rôle spécifié
    return user?.role === roles;
  };

  // Vérifier si l'utilisateur est modérateur ou admin
  const isModerator = () => {
    return user?.role === 'moderator' || user?.role === 'admin';
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Vérifier si l'utilisateur est le créateur d'une ressource
  const isOwner = (resourceCreatorId) => {
    return user?.id === resourceCreatorId;
  };

  // Valeurs et fonctions exposées par le contexte
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    isModerator,
    isAdmin,
    isOwner
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 