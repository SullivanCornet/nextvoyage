import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// Configuration pour le téléchargement de fichiers
export const fileUploadConfig = {
  uploadDir: path.join(process.cwd(), 'public/uploads/images'),
  keepExtensions: true,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
};

// Fonction pour s'assurer que le répertoire d'upload existe
const ensureUploadDirExists = () => {
  try {
    if (!fs.existsSync(fileUploadConfig.uploadDir)) {
      console.log('Création du répertoire d\'upload:', fileUploadConfig.uploadDir);
      fs.mkdirSync(fileUploadConfig.uploadDir, { recursive: true });
      console.log('Répertoire d\'upload créé avec succès');
    } else {
      console.log('Répertoire d\'upload existant:', fileUploadConfig.uploadDir);
    }
    return true;
  } catch (error) {
    console.error('Erreur lors de la création du répertoire d\'upload:', error);
    return false;
  }
};

// Fonction pour analyser le formulaire multipart
export const parseForm = async (req) => {
  console.log('Début de l\'analyse du formulaire multipart');
  
  // S'assurer que le répertoire d'upload existe
  if (!ensureUploadDirExists()) {
    throw new Error('Impossible de créer le répertoire d\'upload');
  }
  
  const form = new IncomingForm({
    uploadDir: fileUploadConfig.uploadDir,
    keepExtensions: fileUploadConfig.keepExtensions,
    maxFileSize: fileUploadConfig.maxFileSize,
    multiples: false, // Désactiver les fichiers multiples pour simplifier
  });
  
  console.log('Options de formidable configurées:', {
    uploadDir: fileUploadConfig.uploadDir,
    keepExtensions: fileUploadConfig.keepExtensions,
    maxFileSize: fileUploadConfig.maxFileSize,
  });

  return new Promise((resolve, reject) => {
    try {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Erreur lors du parsing du formulaire:', err);
          reject(err);
          return;
        }
        console.log('Formulaire parsé avec succès:', {
          fieldsCount: Object.keys(fields).length,
          filesCount: Object.keys(files).length, 
          fileNames: Object.keys(files).map(key => files[key].originalFilename || 'sans nom')
        });
        resolve({ fields, files });
      });
    } catch (error) {
      console.error('Exception lors du parsing du formulaire:', error);
      reject(error);
    }
  });
};

// Fonction pour valider le type de fichier
export const validateFileType = (file) => {
  if (!file) return true;
  
  console.log('Validation du type de fichier:', file.originalFilename);
  const ext = path.extname(file.originalFilename).toLowerCase();
  const isValid = fileUploadConfig.allowedExtensions.includes(ext);
  
  console.log('Extension:', ext, 'Est valide:', isValid);
  return isValid;
};

// Fonction pour déplacer le fichier téléchargé vers son emplacement final
export const moveUploadedFile = (file, entityType, entityId) => {
  if (!file) return null;
  
  console.log('Déplacement du fichier:', {
    originalFilename: file.originalFilename,
    filepath: file.filepath,
    size: file.size,
    entityType,
    entityId
  });
  
  try {
    // S'assurer que le répertoire d'upload existe
    ensureUploadDirExists();
    
    // Créer un nom de fichier unique
    const timestamp = Date.now();
    const ext = path.extname(file.originalFilename);
    const newFilename = `${entityType}_${entityId}_${timestamp}${ext}`;
    
    // Chemin du nouveau fichier
    const newPath = path.join(fileUploadConfig.uploadDir, newFilename);
    
    console.log('Déplacement du fichier de', file.filepath, 'vers', newPath);
    
    // Vérifier que le fichier source existe
    if (!fs.existsSync(file.filepath)) {
      console.error('Le fichier source n\'existe pas:', file.filepath);
      return null;
    }
    
    // Déplacer le fichier
    fs.renameSync(file.filepath, newPath);
    console.log('Fichier déplacé avec succès');
    
    // Retourner le chemin relatif pour stockage en base de données
    return `/uploads/images/${newFilename}`;
  } catch (error) {
    console.error('Erreur lors du déplacement du fichier:', error);
    return null;
  }
};

// Fonction pour supprimer un fichier
export const deleteFile = (filePath) => {
  if (!filePath) return;
  
  const fullPath = path.join(process.cwd(), 'public', filePath);
  
  console.log('Suppression du fichier:', fullPath);
  
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('Fichier supprimé avec succès');
    } else {
      console.log('Le fichier n\'existe pas, aucune suppression nécessaire');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
  }
}; 