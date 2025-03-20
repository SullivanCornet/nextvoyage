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
          AppVoyage
        </Link>
        
        <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}>
            {isMenuOpen ? '✕' : '☰'}
          </i>
        </div>
        
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item nav-center">
            <Link href="/countries" className="nav-links">
              Pays
            </Link>
          </li>
          
          <div className="auth-section">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <span className="nav-links user-name">
                    {user.name}
                  </span>
                </li>
                
                <li className="nav-item logout-item">
                  <button onClick={handleLogout} className="nav-links logout-btn">
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item login-item">
                  <Link href="/auth/login" className="nav-links">
                    Connexion
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/auth/register" className="nav-links register-link">
                    Inscription
                  </Link>
                </li>
              </>
            )}
          </div>
        </ul>
      </div>
      
      <style jsx>{`
        .navbar {
          background-color: #2c3e50;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.2rem;
          position: sticky;
          top: 0;
          z-index: 999;
          color: #ecf0f1;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 60px;
          max-width: 1200px;
          padding: 0 24px;
        }
        
        .navbar-logo {
          color: #ecf0f1;
          cursor: pointer;
          text-decoration: none;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          font-weight: bold;
          letter-spacing: 1px;
          transition: color 0.3s ease;
          margin-right: 20px;
        }
        
        .navbar-logo:hover {
          color: #3498db;
        }
        
        .nav-menu {
          display: flex;
          align-items: center;
          list-style: none;
          text-align: center;
          margin: 0;
          padding: 0;
          height: 100%;
          flex: 1;
          justify-content: space-between;
        }
        
        .nav-center {
          margin: 0 auto;
          flex: 1;
          justify-content: center;
          display: flex;
        }
        
        .auth-section {
          display: flex;
          align-items: center;
          margin-left: auto;
        }
        
        .nav-item {
          border-bottom: 2px solid transparent;
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .nav-item:hover {
          border-bottom: 2px solid #3498db;
        }
        
        .nav-links {
          color: #ecf0f1;
          display: flex;
          align-items: center;
          text-decoration: none;
          padding: 0 1rem;
          height: 100%;
          transition: all 0.3s ease;
        }
        
        .nav-links:hover {
          color: #3498db;
        }
        
        .user-name {
          font-weight: bold;
          color: #3498db;
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          padding: 0.4rem 0.8rem;
          margin: 0 8px;
          letter-spacing: 0.5px;
        }
        
        .logout-item {
          margin-left: 8px;
          margin-right: 8px;
        }
        
        .logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: #e74c3c;
          font-weight: bold;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .logout-btn:hover {
          background-color: rgba(231, 76, 60, 0.2);
          color: #c0392b;
        }
        
        .login-item {
          margin-right: 8px;
        }
        
        .register-link {
          background-color: #3498db;
          border-radius: 4px;
          padding: 0.4rem 0.8rem;
          margin-left: 8px;
          margin-right: 8px;
          transition: background-color 0.3s ease;
        }
        
        .register-link:hover {
          background-color: #2980b9;
          color: #ecf0f1;
        }
        
        .menu-icon {
          display: none;
          color: #ecf0f1;
          font-size: 1.8rem;
          cursor: pointer;
        }
        
        @media screen and (max-width: 960px) {
          .navbar {
            padding: 0;
          }
          
          .nav-menu {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: auto;
            max-height: 80vh;
            overflow-y: auto;
            position: absolute;
            top: 60px;
            left: -100%;
            opacity: 0;
            transition: all 0.5s ease;
            padding: 0;
          }
          
          .nav-menu.active {
            background: #2c3e50;
            left: 0;
            opacity: 1;
            transition: all 0.5s ease;
            z-index: 1;
            color: #ecf0f1;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }
          
          .nav-center {
            margin: 0;
            justify-content: center;
          }
          
          .auth-section {
            flex-direction: column;
            width: 100%;
            margin: 0;
          }
          
          .nav-item {
            width: 100%;
            border: none;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .nav-item:last-child {
            border-bottom: none;
          }
          
          .nav-item:hover {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background-color: rgba(52, 152, 219, 0.1);
          }
          
          .nav-links {
            text-align: center;
            padding: 1rem;
            width: 100%;
            display: flex;
            justify-content: center;
          }
          
          .user-name, 
          .logout-btn,
          .register-link {
            margin: 0;
            width: 100%;
            padding: 1rem;
            border-radius: 0;
          }
          
          .logout-item,
          .login-item {
            margin: 0;
          }
          
          .menu-icon {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            transform: translate(-100%, 30%);
            font-size: 1.8rem;
            cursor: pointer;
          }
        }
      `}</style>
    </nav>
  );
} 