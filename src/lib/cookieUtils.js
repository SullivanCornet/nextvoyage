/**
 * Utilitaires pour la gestion des cookies
 * Ce fichier contient les fonctions pour gérer les cookies d'authentification
 */

import Cookies from 'js-cookie';

// Nom du cookie d'authentification
const AUTH_COOKIE_NAME = 'authToken';

// Options par défaut pour les cookies
const COOKIE_OPTIONS = {
  // La valeur secure doit être true en production
  secure: process.env.NODE_ENV === 'production',
  // Le cookie est accessible uniquement par le serveur
  httpOnly: false, // doit être false pour js-cookie (côté client)
  // Empêche les attaques CSRF en limitant l'accès aux cookies
  sameSite: 'strict',
  // Durée de validité du cookie (en jours)
  expires: 7 // 7 jours
};

/**
 * Enregistrer le token d'authentification dans les cookies
 * @param {string} token - Le token JWT à enregistrer
 */
export function setAuthCookie(token) {
  Cookies.set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Récupérer le token d'authentification depuis les cookies
 * @returns {string|undefined} - Le token JWT ou undefined si non trouvé
 */
export function getAuthCookie() {
  return Cookies.get(AUTH_COOKIE_NAME);
}

/**
 * Supprimer le token d'authentification des cookies
 */
export function removeAuthCookie() {
  Cookies.remove(AUTH_COOKIE_NAME);
}

/**
 * Vérifier si un utilisateur est connecté (présence du cookie d'authentification)
 * @returns {boolean} - true si l'utilisateur est connecté, false sinon
 */
export function isLoggedIn() {
  return !!getAuthCookie();
} 