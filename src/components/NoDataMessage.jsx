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
    </div>
  );
};

export default NoDataMessage; 