/**
 * Utilitaires pour la gestion des JWT
 * Ce fichier contient les fonctions pour créer et vérifier les tokens JWT
 */

import jwt from 'jsonwebtoken';

// Clé secrète pour signer les tokens JWT
// Idéalement, cette valeur devrait être dans les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET || 'nextvoyage-secret-key-dev';

// Durée de validité du token (en secondes)
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 jours

/**
 * Créer un token JWT
 * @param {Object} user - L'utilisateur pour lequel créer le token
 * @returns {string} - Le token JWT généré
 */
export function createToken(user) {
  try {
    // Créer le payload du token avec les informations de l'utilisateur
    const payload = {
      sub: user.id, // subject: identifiant de l'utilisateur
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    // Signer le token avec la clé secrète
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY
    });
    
    return token;
  } catch (error) {
    console.error('Erreur lors de la création du token JWT:', error);
    throw new Error('Impossible de créer le token JWT');
  }
}

/**
 * Vérifier et décoder un token JWT
 * @param {string} token - Le token JWT à vérifier
 * @returns {Object|null} - Les informations décodées du token ou null si invalide
 */
export function verifyToken(token) {
  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Erreur lors de la vérification du token JWT:', error);
    return null;
  }
}

/**
 * Extraire le token JWT des cookies
 * @param {Object} cookies - Les cookies de la requête
 * @returns {string|null} - Le token JWT ou null si non trouvé
 */
export function getTokenFromCookies(cookies) {
  return cookies?.authToken || null;
}

/**
 * Extraire le token JWT de l'en-tête Authorization
 * @param {Object} headers - Les en-têtes de la requête
 * @returns {string|null} - Le token JWT ou null si non trouvé
 */
export function getTokenFromHeaders(headers) {
  const authHeader = headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // Extraire le token après "Bearer "
  return authHeader.substring(7);
} 