'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function CityCard({ name, slug, countrySlug, imagePath }) {
  return (
    <Link href={`/countries/${countrySlug}/cities/${slug}`} className="city-card-link">
      <div className="city-card">
        <div className="image-container">
          {imagePath ? (
            <div className="city-image">
              <img src={imagePath} alt={name} className="city-img" />
            </div>
          ) : (
            <div className="placeholder-image">
              <div className="city-initial">{name.charAt(0)}</div>
            </div>
          )}
        </div>
        <div className="card-content">
          <h3>{name}</h3>
        </div>
      </div>
      
      <style jsx>{`
        .city-card-link {
          text-decoration: none;
          display: block;
        }
        
        .city-card {
          width: 280px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin: 15px;
          background-color: white;
        }
        
        .city-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        .image-container {
          width: 100%;
          height: 180px;
          position: relative;
        }
        
        .placeholder-image {
          width: 100%;
          height: 100%;
          background-color: #e74c3c;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .city-image {
          width: 100%;
          height: 100%;
        }
        
        .city-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .city-initial {
          font-size: 4rem;
          font-weight: bold;
          color: white;
        }
        
        .card-content {
          padding: 15px;
          text-align: center;
        }
        
        h3 {
          color: #2c3e50;
          margin: 0;
          font-size: 1.3rem;
        }
      `}</style>
    </Link>
  );
} 