/**
 * Utilitaires pour l'authentification
 * Ce fichier contient les fonctions pour le hachage et la vérification des mots de passe
 */

import bcryptjs from 'bcryptjs';

/**
 * Hacher un mot de passe
 * @param {string} password - Le mot de passe en clair
 * @returns {Promise<string>} - Le mot de passe haché
 */
export async function hashPassword(password) {
  try {
    // Générer un sel avec 10 rounds (valeur par défaut recommandée)
    const salt = await bcryptjs.genSalt(10);
    
    // Hacher le mot de passe avec le sel
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    return hashedPassword;
  } catch (error) {
    console.error('Erreur lors du hachage du mot de passe:', error);
    throw new Error('Impossible de hacher le mot de passe');
  }
}

/**
 * Vérifier si un mot de passe correspond à sa version hachée
 * @param {string} password - Le mot de passe en clair
 * @param {string} hashedPassword - Le mot de passe haché
 * @returns {Promise<boolean>} - true si le mot de passe correspond, false sinon
 */
export async function verifyPassword(password, hashedPassword) {
  try {
    // Comparer le mot de passe avec la version hachée
    const isMatch = await bcryptjs.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
    throw new Error('Impossible de vérifier le mot de passe');
  }
} 