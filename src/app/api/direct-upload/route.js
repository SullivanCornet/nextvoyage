import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Configuration - Désactiver le parser de corps pour les fichiers
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Endpoint très simplifié pour tester l'upload de fichier
 * Utilise une approche manuelle plutôt que formidable
 */
export async function POST(req) {
  console.log('📥 Test d\'upload direct reçu');
  
  try {
    // Lire le contenu de la requête
    const formData = await req.formData();
    console.log('FormData reçu avec les champs:', Array.from(formData.keys()));
    
    // Chercher l'image dans le FormData
    const image = formData.get('image') || formData.get('testImage');
    
    if (!image || !(image instanceof Blob)) {
      return NextResponse.json({
        success: false,
        error: 'Aucune image n\'a été fournie dans la requête'
      }, { status: 400 });
    }
    
    // Obtenir les informations sur l'image
    const imageInfo = {
      name: image.name,
      type: image.type,
      size: image.size
    };
    console.log('Image reçue:', imageInfo);
    
    // Assurer que le répertoire existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'direct');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Créer un nom de fichier unique
    const uniqueId = randomUUID().substring(0, 8);
    const timestamp = Date.now();
    const extension = image.name.substring(image.name.lastIndexOf('.'));
    const filename = `direct_${timestamp}_${uniqueId}${extension}`;
    const filePath = path.join(uploadDir, filename);
    
    // Convertir le blob en ArrayBuffer puis en Buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Écrire le fichier
    fs.writeFileSync(filePath, buffer);
    console.log('✅ Fichier écrit avec succès:', filePath);
    
    // Retourner une réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Upload direct réussi',
      file: {
        name: image.name,
        type: image.type,
        size: image.size,
        path: `/uploads/direct/${filename}`,
        url: `/uploads/direct/${filename}`
      },
      fields: Object.fromEntries(formData.entries())
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload direct:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 