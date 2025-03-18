import { NextResponse } from 'next/server';
import { handleImageUpload } from '@/lib/uploadService';

// Configuration - Désactiver le parser de corps pour les fichiers
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Handler API pour l'upload d'images
 * 
 * Exemple d'utilisation client:
 * ```javascript
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 * formData.append('folder', 'accommodations');
 * 
 * const response = await fetch('/api/upload', {
 *   method: 'POST',
 *   body: formData
 * });
 * const result = await response.json();
 * ```
 */
export async function POST(req) {
  try {
    // Extraire les paramètres de la requête
    const url = new URL(req.url);
    // Permet d'utiliser 'folder' ou 'category' pour la compatibilité
    const subdirectory = url.searchParams.get('folder') || url.searchParams.get('category') || 'places';
    // Permet d'utiliser 'file' ou 'image' pour la compatibilité
    const field = url.searchParams.get('field') || 'file';
    // Mode test (juste pour vérifier/créer le dossier sans upload)
    const isTest = url.searchParams.get('test') === 'true';
    
    console.log(`Upload demandé: dossier=${subdirectory}, champ=${field}, test=${isTest}`);
    
    // Mode test - juste créer le dossier sans upload
    if (isTest) {
      const { ensureUploadDirectory } = await import('@/lib/uploadService');
      const directoryExists = ensureUploadDirectory(subdirectory);
      
      return NextResponse.json({
        success: directoryExists,
        message: directoryExists 
          ? `Dossier '${subdirectory}' vérifié et prêt pour l'upload` 
          : `Impossible de créer/vérifier le dossier '${subdirectory}'`,
        directory: subdirectory
      });
    }
    
    // Mode normal - upload complet
    return handleImageUpload(req, subdirectory, field);
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 