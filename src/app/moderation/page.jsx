'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ModerationPage() {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Rediriger si l'utilisateur n'est pas authentifié ou n'a pas les droits nécessaires
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (!hasRole(['admin', 'moderator'])) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, hasRole, router]);
  
  // Simuler le chargement des utilisateurs
  useEffect(() => {
    if (isAuthenticated && hasRole(['admin', 'moderator'])) {
      // Dans une application réelle, vous récupéreriez les utilisateurs depuis l'API
      // Ici, nous simulons des données pour la démonstration
      setTimeout(() => {
        setUsers([
          { id: 1, name: 'Alice Dupont', email: 'alice@example.com', role: 'admin', active: true },
          { id: 2, name: 'Bob Martin', email: 'bob@example.com', role: 'moderator', active: true },
          { id: 3, name: 'Charlie Dubois', email: 'charlie@example.com', role: 'user', active: true },
          { id: 4, name: 'David Petit', email: 'david@example.com', role: 'user', active: false },
        ]);
        setIsLoadingUsers(false);
      }, 1000);
    }
  }, [isAuthenticated, hasRole]);
  
  const handleToggleUserStatus = (userId) => {
    // Dans une application réelle, vous enverriez une requête à l'API
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, active: !user.active };
      }
      return user;
    }));
    
    setSuccessMessage('Statut de l\'utilisateur mis à jour avec succès');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const handleChangeRole = (userId, newRole) => {
    // Dans une application réelle, vous enverriez une requête à l'API
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole };
      }
      return user;
    }));
    
    setSuccessMessage('Rôle de l\'utilisateur mis à jour avec succès');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  if (isLoading) {
    return <div className="moderation-container"><p>Chargement...</p></div>;
  }
  
  if (!isAuthenticated || !hasRole(['admin', 'moderator'])) {
    return null; // Redirection gérée par useEffect
  }
  
  return (
    <div className="moderation-container">
      <h1>Espace de Modération</h1>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <div className="user-role-info">
        <p>Vous êtes connecté en tant que: <span className="highlight">{user.name}</span></p>
        <p>Votre rôle: <span className="role-badge">{user.role}</span></p>
      </div>
      
      <div className="moderation-card">
        <h2>Gestion des Utilisateurs</h2>
        
        {isLoadingUsers ? (
          <p>Chargement des utilisateurs...</p>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={!user.active ? 'inactive-user' : ''}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select 
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="role-select"
                        disabled={!hasRole('admin')} // Seuls les admins peuvent changer les rôles
                      >
                        <option value="user">Utilisateur</option>
                        <option value="moderator">Modérateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-indicator ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`btn-toggle ${user.active ? 'deactivate' : 'activate'}`}
                      >
                        {user.active ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .moderation-container {
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 1rem;
        }
        
        h1, h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
        }
        
        h1 {
          text-align: center;
        }
        
        .error-message, .success-message {
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .error-message {
          background-color: #ffecec;
          color: #f44336;
          border: 1px solid #f44336;
        }
        
        .success-message {
          background-color: #e7f7e7;
          color: #28a745;
          border: 1px solid #28a745;
        }
        
        .user-role-info {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .highlight {
          font-weight: bold;
          color: #3498db;
        }
        
        .role-badge {
          background-color: #3498db;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.9rem;
          text-transform: capitalize;
        }
        
        .moderation-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .users-table-container {
          overflow-x: auto;
        }
        
        .users-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .users-table th,
        .users-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eaeaea;
        }
        
        .users-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #2c3e50;
        }
        
        .inactive-user {
          background-color: #f8f9fa;
          color: #95a5a6;
        }
        
        .status-indicator {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.8rem;
        }
        
        .status-indicator.active {
          background-color: #e7f7e7;
          color: #28a745;
        }
        
        .status-indicator.inactive {
          background-color: #ffecec;
          color: #f44336;
        }
        
        .role-select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ddd;
          background-color: white;
        }
        
        .role-select:disabled {
          background-color: #f9f9f9;
          cursor: not-allowed;
        }
        
        .btn-toggle {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .btn-toggle.activate {
          background-color: #2ecc71;
          color: white;
        }
        
        .btn-toggle.deactivate {
          background-color: #e74c3c;
          color: white;
        }
        
        .btn-toggle.activate:hover {
          background-color: #27ae60;
        }
        
        .btn-toggle.deactivate:hover {
          background-color: #c0392b;
        }
        
        @media screen and (max-width: 768px) {
          .user-role-info {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .users-table th,
          .users-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.9rem;
          }
          
          .btn-toggle {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
} 