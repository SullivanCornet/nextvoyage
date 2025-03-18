import React from 'react';
import Link from 'next/link';

const NoDataMessage = ({ message, actionLink, actionText }) => {
  return (
    <div className="empty-container">
      <div className="empty-content">
        <div className="empty-icon">📭</div>
        <h2 className="empty-title">Aucune donnée disponible</h2>
        <p className="empty-message">{message}</p>
        {actionLink && actionText && (
          <Link href={actionLink} className="action-button">
            {actionText}
          </Link>
        )}
      </div>
      
      <style jsx>{`
        .empty-container {
          padding: 50px 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .empty-content {
          background-color: #f8f9fa;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 15px;
          opacity: 0.7;
        }
        
        .empty-title {
          font-size: 1.8rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .empty-message {
          color: #666;
          margin-bottom: 25px;
          line-height: 1.5;
        }
        
        .action-button {
          display: inline-block;
          background-color: #4a6fa5;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }
        
        .action-button:hover {
          background-color: #3a5a80;
        }
      `}</style>
    </div>
  );
};

export default NoDataMessage; 