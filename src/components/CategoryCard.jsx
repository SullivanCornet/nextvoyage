'use client';

import Link from 'next/link';

export default function CategoryCard({ title, icon, color, link }) {
  return (
    <Link href={link} className="category-card-link">
      <div className="category-card" style={{ backgroundColor: color }}>
        <div className="category-icon">{icon}</div>
        <h3 className="category-title">{title}</h3>
      </div>
      
      <style jsx>{`
        .category-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          width: 100%;
        }
        
        .category-card {
          width: 100%;
          height: 180px;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
        }
        
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        .category-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }
        
        .category-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
          color: white;
        }
        
        @media (max-width: 768px) {
          .category-card {
            height: 150px;
          }
          
          .category-icon {
            font-size: 2.5rem;
          }
          
          .category-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </Link>
  );
} 