import { NextResponse } from 'next/server';
import { processFormWithImage, ensureUploadDir } from '@/lib/uploadHandler';
import { connect as connectToDB } from '@/lib/db';
import path from 'path';
import fs from 'fs';

// GET /api/diagnostic/upload-test
export async function GET() {
  // Vérifier que le répertoire d'upload existe
  const uploadDir = path.join(process.cwd(), 'public/uploads/images');
  const exists = fs.existsSync(uploadDir);
  
  let canCreate = false;
  if (!exists) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      canCreate = true;
    } catch (error) {
      canCreate = false;
    }
  }
  
  // Tester les permissions d'écriture
  let canWrite = false;
  try {
    const testFile = path.join(uploadDir, 'test.txt');
    fs.writeFileSync(testFile, 'Test');
    fs.unlinkSync(testFile);
    canWrite = true;
  } catch (error) {
    canWrite = false;
  }
  
  return NextResponse.json({
    success: true,
    uploadDirectory: {
      path: uploadDir,
      exists: exists || canCreate,
      canWrite
    },
    formidableVersion: require('formidable/package.json').version,
    nodeVersion: process.version
  });
}

// Désactiver le body parser pour gérer le multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// POST /api/diagnostic/upload-test
export async function POST(request) {
  console.log('DIAGNOSTIC: Test d\'upload d\'image démarré');
  
  // 1. Vérifier si les répertoires d'upload existent
  const uploadDirStatus = ensureUploadDir();
  console.log('DIAGNOSTIC: État du répertoire d\'upload:', uploadDirStatus ? 'OK' : 'Échec');
  
  if (!uploadDirStatus) {
    return NextResponse.json({
      success: false,
      error: 'Impossible de créer ou d\'accéder au répertoire d\'upload',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
  
  try {
    // 2. Tester le traitement du formulaire multipart avec l'image
    console.log('DIAGNOSTIC: Traitement du formulaire avec image');
    const { fields, imagePath, imageSize, imageType } = await processFormWithImage(request, 'test_');
    
    // Ne pas conserver l'image de test si elle a été créée
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
        console.log('DIAGNOSTIC: Image de test supprimée:', imagePath);
      } catch (deleteError) {
        console.error('DIAGNOSTIC: Erreur lors de la suppression de l\'image de test:', deleteError);
      }
    }
    
    // 3. Tester la connexion à la base de données
    console.log('DIAGNOSTIC: Test de connexion à la base de données');
    let dbStatus = 'Non testé';
    let dbError = null;
    
    try {
      const connection = await connectToDB();
      if (connection) {
        const [dbVersionResults] = await connection.execute('SELECT VERSION() as version');
        dbStatus = dbVersionResults[0]?.version || 'Connecté, mais aucune info de version';
        console.log('DIAGNOSTIC: Connexion à la base de données réussie:', dbStatus);
      } else {
        dbStatus = 'Échec: connection est null';
        console.log('DIAGNOSTIC: Échec de connexion à la base de données:', dbStatus);
      }
    } catch (dbTestError) {
      dbStatus = 'Échec';
      dbError = dbTestError.message;
      console.error('DIAGNOSTIC: Erreur lors du test de la base de données:', dbError);
    }
    
    // 4. Construire la réponse détaillée
    const fieldsReceived = Object.keys(fields || {});
    const response = {
      success: true,
      message: 'Test d\'upload d\'image réussi',
      test_results: {
        upload_directory: {
          status: uploadDirStatus ? 'OK' : 'Échec',
          directory: process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
        },
        form_processing: {
          status: 'OK',
          fields_received: fieldsReceived,
          image_received: !!imagePath,
          image_size: imageSize ? `${Math.round(imageSize / 1024)} KB` : null,
          image_type: imageType || null
        },
        database: {
          status: dbStatus === 'Échec' ? 'Échec' : 'OK',
          version: dbStatus,
          error: dbError
        }
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('DIAGNOSTIC: Test d\'upload terminé avec succès');
    return NextResponse.json(response);
  } catch (error) {
    console.error('DIAGNOSTIC: Erreur lors du test d\'upload:', error);
    
    return NextResponse.json({
      success: false,
      error: `Erreur lors du test d'upload: ${error.message}`,
      error_stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 