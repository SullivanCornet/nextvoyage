import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Chargement en cours...</p>
    </div>
  );
};

export default LoadingSpinner; 