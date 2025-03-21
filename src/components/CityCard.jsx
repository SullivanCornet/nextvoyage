'use client';

import Link from 'next/link';

export default function CityCard({ name, slug, countrySlug, imagePath }) {
  return (
    <Link href={`/countries/${countrySlug}/cities/${slug}`} className="city-card-link">
      <div className="city-card">
        <div 
          className="card-image" 
          style={{ 
            backgroundImage: imagePath 
              ? `url(${imagePath})` 
              : `linear-gradient(45deg, #3498db, #1976D2)` 
          }}
        >
        </div>
        <div className="card-content">
          <div className="card-title">{name}</div>
        </div>
      </div>
      
      <style jsx>{`
        .city-card-link {
          text-decoration: none;
          display: block;
          width: 100%;
          height: 100%;
        }
        
        .city-card {
          width: 100%;
          height: 220px;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          box-shadow: var(--card-shadow);
          transition: all 0.3s ease;
          cursor: pointer;
          background-color: var(--card-bg);
        }
        
        .city-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--hover-shadow);
        }
        
        .card-image {
          height: 100%;
          width: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease;
        }
        
        .city-card:hover .card-image {
          transform: scale(1.05);
        }
        
        .card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 15px;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          color: var(--white);
        }
        
        .card-title {
          font-size: 18px;
          font-weight: 600;
        }
      `}</style>
    </Link>
  );
} 