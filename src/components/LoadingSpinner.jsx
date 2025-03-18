import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Chargement en cours...</p>
      
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px 20px;
          min-height: 300px;
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(74, 111, 165, 0.2);
          border-top-color: #4a6fa5;
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-text {
          color: #666;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 