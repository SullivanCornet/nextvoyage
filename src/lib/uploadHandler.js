import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import crypto from 'crypto';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

// Configuration pour le téléchargement de fichiers
const uploadConfig = {
  uploadDir: path.join(process.cwd(), 'public/uploads/images'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

/**
 * Convertit une NextRequest en flux lisible pour formidable
 */
async function requestToStream(request) {
  // Récupérer le contenu de la requête sous forme de buffer
  const arrayBuffer = await request.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Créer un objet qui simule une requête HTTP compatible avec formidable
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  // Créer un mock de requête HTTP qui utilise un Readable comme source
  const stream = new Readable();
  
  // Configuration du stream pour qu'il soit compatible avec formidable
  stream.headers = headers;
  stream.method = request.method;
  stream.url = request.url;
  
  // Override des méthodes manquantes
  stream.on = function(event, handler) {
    if (event === 'data') {
      // Appeler immédiatement le handler avec les données
      handler(buffer);
    } else if (event === 'end') {
      // Appeler immédiatement le handler de fin
      handler();
    }
    // Retourner le stream pour permettre le chaînage
    return this;
  };
  
  // Simuler les méthodes pipe et resume
  stream.pipe = function(destination) {
    destination.write(buffer);
    destination.end();
    return destination;
  };
  
  stream.resume = function() {
    return this;
  };
  
  return stream;
}

/**
 * Vérifie et crée les répertoires nécessaires pour les uploads
 * @returns {Object} Résultat de la vérification
 */
export function ensureUploadDirectories() {
  const projectRoot = process.cwd();
  const publicDir = path.join(projectRoot, 'public');
  const uploadsDir = path.join(publicDir, 'uploads');
  const placesDir = path.join(uploadsDir, 'places');
  
  console.log('📂 Vérification des répertoires pour l\'upload:');
  
  // Créer le répertoire public s'il n'existe pas
  if (!fs.existsSync(publicDir)) {
    try {
      console.log(' - Création du répertoire public');
      fs.mkdirSync(publicDir, { recursive: true });
    } catch (err) {
      console.error('❌ Erreur lors de la création du répertoire public:', err);
      return { success: false, error: err.message, step: 'public' };
    }
  }
  
  // Créer le répertoire uploads s'il n'existe pas
  if (!fs.existsSync(uploadsDir)) {
    try {
      console.log(' - Création du répertoire uploads');
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (err) {
      console.error('❌ Erreur lors de la création du répertoire uploads:', err);
      return { success: false, error: err.message, step: 'uploads' };
    }
  }
  
  // Créer le répertoire places s'il n'existe pas
  if (!fs.existsSync(placesDir)) {
    try {
      console.log(' - Création du répertoire places');
      fs.mkdirSync(placesDir, { recursive: true });
    } catch (err) {
      console.error('❌ Erreur lors de la création du répertoire places:', err);
      return { success: false, error: err.message, step: 'places' };
    }
  }
  
  // Tester l'accès en écriture
  try {
    const testFile = path.join(placesDir, `test-${Date.now()}.txt`);
    const testData = 'Test d\'écriture';
    fs.writeFileSync(testFile, testData);
    console.log(' - ✅ Test d\'écriture réussi');
    try {
      fs.unlinkSync(testFile);
    } catch (cleanupErr) {
      console.warn('⚠️ Impossible de supprimer le fichier de test:', cleanupErr);
    }
  } catch (writeErr) {
    console.error('❌ Erreur lors du test d\'écriture:', writeErr);
    return { success: false, error: writeErr.message, step: 'write-test' };
  }
  
  return { 
    success: true,
    paths: {
      projectRoot,
      publicDir,
      uploadsDir,
      placesDir
    }
  };
}

/**
 * Traite le formulaire avec une image
 * @param {Request} req - La requête HTTP
 * @param {string} [subdirectory='places'] - Le sous-répertoire pour l'upload
 * @returns {Promise<Object>} Les champs du formulaire et le chemin de l'image
 */
export async function processFormWithImage(req, subdirectory = 'places') {
  const dirCheck = ensureUploadDirectories();
  
  if (!dirCheck.success) {
    throw new Error(`Erreur lors de la vérification des répertoires: ${dirCheck.error} (étape: ${dirCheck.step})`);
  }
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdirectory);
  console.log(`📤 Traitement du formulaire avec image (répertoire: ${uploadDir})`);
  
  // Configurer formidable pour le traitement du formulaire
  const formOptions = {
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    filter: (part) => {
      // Accepter uniquement les fichiers image
      if (part.name === 'image' && part.mimetype) {
        return part.mimetype.includes('image/');
      }
      return true; // Accepter les autres champs
    },
    filename: (name, ext) => {
      // Générer un nom de fichier unique
      const uniqueId = randomUUID().substring(0, 8);
      const timestamp = Date.now();
      return `img_${timestamp}_${uniqueId}${ext}`;
    },
  };
  
  // Créer une instance de formidable avec les options
  const form = formidable(formOptions);
  
  try {
    // Convertir la requête en flux lisible pour formidable
    const reqStream = await requestToStream(req);
    
    // Promisifier l'analyse du formulaire
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(reqStream, (err, fields, files) => {
        if (err) {
          console.error('❌ Erreur lors de l\'analyse du formulaire:', err);
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });
    
    console.log('📋 Champs reçus:', Object.keys(fields));
    console.log('📁 Fichiers reçus:', Object.keys(files).map(key => key));
    
    // Traitement des champs pour simplifier la structure
    const processedFields = {};
    for (const [key, value] of Object.entries(fields)) {
      // Si la valeur est un tableau avec un seul élément, extraire cet élément
      processedFields[key] = Array.isArray(value) && value.length === 1 
        ? value[0] 
        : value;
    }
    
    // Obtenir le fichier image s'il existe
    const imageFile = files.image?.[0];
    let imagePath = null;
    
    if (imageFile) {
      // Obtenir le nouveau nom de fichier à partir du chemin complet
      const newFilename = path.basename(imageFile.filepath);
      
      // Construire le chemin public relatif pour l'image
      imagePath = `/uploads/${subdirectory}/${newFilename}`;
      
      console.log('✅ Image traitée avec succès:', {
        originalFilename: imageFile.originalFilename,
        newFilename,
        size: `${Math.round(imageFile.size / 1024)} KB`,
        type: imageFile.mimetype,
        publicPath: imagePath
      });
    } else {
      console.log('⚠️ Aucune image n\'a été fournie dans le formulaire');
    }
    
    // Retourner les champs traités et le chemin de l'image
    return {
      fields: processedFields,
      imagePath
    };
  } catch (error) {
    console.error('❌ Erreur lors du traitement du formulaire avec image:', error);
    throw new Error(`Erreur lors du traitement du formulaire: ${error.message}`);
  }
}

// Fonction pour sauvegarder une image directement (approche alternative)
export const saveImage = async (imageFile, prefix = '') => {
  if (!imageFile) return null;
  
  // S'assurer que le répertoire existe
  ensureUploadDirectories();
  
  try {
    // Extraire l'extension
    const fileExt = path.extname(imageFile.name).toLowerCase();
    
    // Valider l'extension
    if (!uploadConfig.allowedExtensions.includes(fileExt)) {
      throw new Error(`Type de fichier non autorisé: ${fileExt}`);
    }
    
    // Créer un nom de fichier unique
    const fileName = `${prefix}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadConfig.uploadDir, fileName);
    
    // Lire le fichier
    const fileData = await imageFile.arrayBuffer();
    const buffer = Buffer.from(fileData);
    
    // Écrire le fichier
    fs.writeFileSync(filePath, buffer);
    
    // Retourner le chemin relatif
    return `/uploads/images/${fileName}`;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
}; 