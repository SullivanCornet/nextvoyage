'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <li className="nav-item">
            <Link href="/countries" className="nav-links">
              Pays
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/diagnostic" className="nav-links">
              Diagnostic
            </Link>
          </li>
        </ul>
      </div>
      
      <style jsx>{`
        .navbar {
          background-color: #2c3e50;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.2rem;
          position: sticky;
          top: 0;
          z-index: 999;
        }
        
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 80px;
          max-width: 1200px;
          padding: 0 24px;
        }
        
        .navbar-logo {
          color: #fff;
          justify-self: start;
          cursor: pointer;
          text-decoration: none;
          font-size: 2rem;
          display: flex;
          align-items: center;
          font-weight: bold;
        }
        
        .nav-menu {
          display: flex;
          align-items: center;
          list-style: none;
          text-align: center;
          margin-right: 24px;
        }
        
        .nav-item {
          height: 80px;
          border-bottom: 2px solid transparent;
        }
        
        .nav-item:hover {
          border-bottom: 2px solid #fff;
        }
        
        .nav-links {
          color: #fff;
          display: flex;
          align-items: center;
          text-decoration: none;
          padding: 0.5rem 1rem;
          height: 100%;
        }
        
        .menu-icon {
          display: none;
          color: #fff;
          font-size: 1.8rem;
          cursor: pointer;
        }
        
        @media screen and (max-width: 960px) {
          .nav-menu {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 90vh;
            position: absolute;
            top: 80px;
            left: -100%;
            opacity: 1;
            transition: all 0.5s ease;
            padding: 0;
          }
          
          .nav-menu.active {
            background: #2c3e50;
            left: 0;
            opacity: 1;
            transition: all 0.5s ease;
            z-index: 1;
          }
          
          .nav-item {
            width: 100%;
            border: none;
          }
          
          .nav-links {
            text-align: center;
            padding: 2rem;
            width: 100%;
            display: table;
          }
          
          .menu-icon {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            transform: translate(-100%, 60%);
            font-size: 1.8rem;
            cursor: pointer;
          }
        }
      `}</style>
    </nav>
  );
} 