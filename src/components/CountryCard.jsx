'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function CountryCard({ name, slug }) {
  return (
    <div className="country-card">
      <div className="image-container">
        <div className="placeholder-image">
          <div className="country-initial">{name.charAt(0)}</div>
        </div>
      </div>
      <div className="card-content">
        <h2>{name}</h2>
        <Link href={`/countries/${slug}`} className="view-button">
          Découvrir
        </Link>
      </div>
      
      <style jsx>{`
        .country-card {
          width: 300px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin: 15px;
          background-color: white;
        }
        
        .country-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        .image-container {
          width: 100%;
          height: 200px;
          position: relative;
        }
        
        .placeholder-image {
          width: 100%;
          height: 100%;
          background-color: #3498db;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .country-initial {
          font-size: 5rem;
          font-weight: bold;
          color: white;
        }
        
        .card-content {
          padding: 15px;
        }
        
        h2 {
          color: #2c3e50;
          margin: 0 0 15px 0;
          font-size: 1.5rem;
        }
        
        .view-button {
          display: inline-block;
          background-color: #3498db;
          color: white;
          padding: 8px 16px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        
        .view-button:hover {
          background-color: #2980b9;
        }
      `}</style>
    </div>
  );
} 