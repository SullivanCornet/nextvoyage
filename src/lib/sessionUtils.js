/**
 * Utilitaires pour la gestion des sessions utilisateur
 * Ce fichier contient les fonctions pour gérer les sessions utilisateur sans table sessions en BDD
 */

import { verifyToken } from './jwtUtils';
import { getAuthToken, getAuthTokenFromAppRouter } from './cookieUtils';

/**
 * Récupérer la session utilisateur depuis les cookies
 * @param {Object} req - L'objet requête HTTP (optionnel pour Next.js Pages Router)
 * @returns {Object|null} - Les données utilisateur ou null si non authentifié
 */
export function getSession(req) {
  try {
    // Récupérer le token depuis les cookies
    const token = req ? getAuthToken(req) : getAuthTokenFromAppRouter();
    
    if (!token) {
      return null;
    }
    
    // Vérifier et décoder le token
    const userData = verifyToken(token);
    
    // Retourner les données utilisateur sans le champ exp (expiration)
    const { exp, iat, ...userSession } = userData;
    return userSession;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }
}

/**
 * Vérifier si l'utilisateur est authentifié
 * @param {Object} req - L'objet requête HTTP
 * @returns {boolean} - true si l'utilisateur est authentifié, false sinon
 */
export function isAuthenticated(req) {
  return getSession(req) !== null;
}

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 * @param {Object} req - L'objet requête HTTP
 * @param {string|string[]} roles - Le(s) rôle(s) requis
 * @returns {boolean} - true si l'utilisateur a le rôle requis, false sinon
 */
export function hasRole(req, roles) {
  const session = getSession(req);
  
  if (!session) {
    return false;
  }
  
  // Si roles est un tableau, vérifier si le rôle de l'utilisateur est dans le tableau
  if (Array.isArray(roles)) {
    return roles.includes(session.role);
  }
  
  // Sinon, comparer directement avec le rôle unique
  return session.role === roles;
} 