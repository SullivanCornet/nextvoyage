'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          Cornet de Voyage
        </Link>
        
        <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}>
            {isMenuOpen ? '✕' : '☰'}
          </i>
        </div>
        
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <div className="auth-section">
            {isAuthenticated ? (
              <div className="auth-buttons">
                <span className="user-name">
                  {user.name}
                </span>
                
                <button onClick={handleLogout} className="logout-btn">
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link href="/auth/login" className="login-btn">
                  Connexion
                </Link>
                <Link href="/auth/register" className="register-link">
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
} 