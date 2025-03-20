'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function AuthCheck({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Attendre que l'état d'authentification soit chargé
    if (!isLoading && !isAuthenticated) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Afficher un message de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="auth-check-loading">
        <p>Vérification de l'authentification...</p>
        
        <style jsx>{`
          .auth-check-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
          }
        `}</style>
      </div>
    );
  }

  // Ne rendre les enfants que si l'utilisateur est authentifié
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 