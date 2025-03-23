import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

/**
 * Configuration pour le téléchargement de fichiers
 */
export const uploadConfig = {
  basePath: path.join(process.cwd(), 'public', 'uploads'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

/**
 * Assure que les répertoires d'upload existent
 * @param {string} subdirectory - Sous-répertoire (ex: 'places', 'users')
 * @returns {boolean} - True si le répertoire existe ou a été créé, false sinon
 */
export function ensureUploadDirectory(subdirectory = 'places') {
  try {
    // S'assurer que le répertoire de base existe
    if (!fs.existsSync(uploadConfig.basePath)) {
      console.log(`Création du répertoire de base: ${uploadConfig.basePath}`);
      fs.mkdirSync(uploadConfig.basePath, { recursive: true });
    }
    
    // Construire le chemin complet pour le sous-répertoire
    const targetDir = path.join(uploadConfig.basePath, subdirectory);
    
    // Vérifier si le répertoire existe
    console.log(`Vérification du répertoire: ${targetDir}`);
    if (!fs.existsSync(targetDir)) {
      console.log(`Création du répertoire: ${targetDir}`);
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Répertoire créé avec succès: ${targetDir}`);
    }
    
    // Tester l'accès en écriture
    const testFilePath = path.join(targetDir, '.write-test');
    fs.writeFileSync(testFilePath, 'test');
    fs.unlinkSync(testFilePath);
    console.log(`Test d'écriture réussi dans: ${targetDir}`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la création/vérification du répertoire:', error);
    return false;
  }
}

/**
 * Valide le type de fichier
 * @param {File} file - Fichier à valider
 * @returns {boolean} - True si le fichier est valide, false sinon
 */
export function validateFile(file) {
  if (!file) return false;
  
  // Vérifier le type MIME
  const isValidType = uploadConfig.allowedTypes.includes(file.type);
  if (!isValidType) {
    console.warn(`Type de fichier non autorisé: ${file.type}`);
    return false;
  }
  
  // Vérifier l'extension
  const fileName = file.name || '';
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const isValidExtension = uploadConfig.allowedExtensions.includes(extension);
  if (!isValidExtension) {
    console.warn(`Extension de fichier non autorisée: ${extension}`);
    return false;
  }
  
  // Vérifier la taille
  if (file.size > uploadConfig.maxFileSize) {
    console.warn(`Fichier trop volumineux: ${file.size} bytes (max: ${uploadConfig.maxFileSize} bytes)`);
    return false;
  }
  
  return true;
}

/**
 * Fonction principale pour traiter l'upload d'image
 * @param {FormData} formData - FormData contenant l'image
 * @param {string} fileField - Nom du champ contenant l'image
 * @param {string} subdirectory - Sous-répertoire où sauvegarder l'image
 * @param {string} prefix - Préfixe pour le nom du fichier
 * @returns {Object} - Résultat de l'upload
 */
export async function uploadImage(formData, fileField = 'image', subdirectory = 'places', prefix = '') {
  try {
    console.log(`Début de l'upload: champ=${fileField}, dossier=${subdirectory}`);
    
    // Vérifier que le répertoire existe
    if (!ensureUploadDirectory(subdirectory)) {
      throw new Error(`Impossible de créer/accéder au répertoire d'upload: ${subdirectory}`);
    }
    
    // Récupérer l'image du formulaire
    const imageFile = formData.get(fileField);
    if (!imageFile || !(imageFile instanceof Blob)) {
      console.error(`Aucune image trouvée dans le champ '${fileField}'`, formData);
      return {
        success: false,
        error: `Aucune image trouvée dans le champ '${fileField}'`
      };
    }
    
    console.log(`Image reçue: nom=${imageFile.name}, type=${imageFile.type}, taille=${imageFile.size}`);
    
    // Valider le fichier
    if (!validateFile(imageFile)) {
      return {
        success: false,
        error: "Le fichier ne respecte pas les critères (type, taille, extension)"
      };
    }
    
    // Créer un nom de fichier unique
    const uniqueId = randomUUID().substring(0, 8);
    const timestamp = Date.now();
    const extension = imageFile.name.substring(imageFile.name.lastIndexOf('.')).toLowerCase();
    const filename = `${prefix}${timestamp}_${uniqueId}${extension}`;
    
    // Chemin complet pour le fichier
    const uploadDir = path.join(uploadConfig.basePath, subdirectory);
    const filePath = path.join(uploadDir, filename);
    
    // Convertir le blob en buffer et l'écrire
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    
    // Chemin relatif pour accéder au fichier depuis le navigateur
    const relativePath = `/uploads/${subdirectory}/${filename}`;
    
    console.log(`Upload réussi: ${relativePath}`);
    
    return {
      success: true,
      filename,
      filePath: relativePath, // Chemin relatif pour l'API
      path: filePath,         // Chemin absolu (pour le système de fichiers)
      url: relativePath,      // URL pour le navigateur
      size: imageFile.size,
      type: imageFile.type
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Supprimer un fichier
 * @param {string} filePath - Chemin complet ou relatif du fichier à supprimer
 * @returns {boolean} - True si le fichier a été supprimé avec succès
 */
export function deleteFile(filePath) {
  try {
    // Si c'est un chemin relatif à partir de /uploads
    let fullPath = filePath;
    if (filePath.startsWith('/uploads/')) {
      fullPath = path.join(process.cwd(), 'public', filePath);
    }
    
    // Vérifier si le fichier existe
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Fichier supprimé avec succès: ${fullPath}`);
      return true;
    } else {
      console.warn(`Fichier introuvable: ${fullPath}`);
      return false;
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
    return false;
  }
}

/**
 * API Route Handler pour l'upload d'image
 * @param {Request} req - Requête Next.js
 * @returns {NextResponse} - Réponse Next.js
 */
export async function handleImageUpload(req, subdirectory = 'places', fileField = 'image') {
  try {
    const formData = await req.formData();
    
    const result = await uploadImage(formData, fileField, subdirectory);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors du traitement de l\'upload:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 