import { NextResponse } from 'next/server';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';

// Configuration pour le parser de corps
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convertit la NextRequest en flux lisible pour formidable
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

// Vérifie et crée les répertoires nécessaires
function ensureDirectories() {
  const projectRoot = process.cwd();
  const publicDir = path.join(projectRoot, 'public');
  const uploadsDir = path.join(publicDir, 'uploads');
  const testDir = path.join(uploadsDir, 'test');
  
  console.log('📂 Vérification des répertoires pour les tests d\'upload:');
  
  // Créer le répertoire public s'il n'existe pas
  if (!fs.existsSync(publicDir)) {
    try {
      console.log(' - Création du répertoire public');
      fs.mkdirSync(publicDir, { recursive: true });
    } catch (err) {
      console.error('❌ Erreur lors de la création du répertoire public:', err);
      return { success: false, error: err.message };
    }
  }
  
  // Créer le répertoire uploads s'il n'existe pas
  if (!fs.existsSync(uploadsDir)) {
    try {
      console.log(' - Création du répertoire uploads');
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (err) {
      console.error('❌ Erreur lors de la création du répertoire uploads:', err);
      return { success: false, error: err.message };
    }
  }
  
  // Créer le répertoire de test s'il n'existe pas
  if (!fs.existsSync(testDir)) {
    try {
      console.log(' - Création du répertoire test');
      fs.mkdirSync(testDir, { recursive: true });
    } catch (err) {
      console.error('❌ Erreur lors de la création du répertoire test:', err);
      return { success: false, error: err.message };
    }
  }
  
  // Tester l'accès en écriture
  try {
    const testFile = path.join(testDir, `test-${Date.now()}.txt`);
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
    return { success: false, error: writeErr.message };
  }
  
  return { 
    success: true,
    paths: {
      projectRoot,
      publicDir,
      uploadsDir,
      testDir
    }
  };
}

// POST /api/test-upload - Test d'upload d'image simple
export async function POST(req) {
  console.log('📤 Test d\'upload d\'image simple');
  
  // Vérifier les répertoires
  const dirCheck = ensureDirectories();
  if (!dirCheck.success) {
    console.error('❌ Problème avec les répertoires:', dirCheck.error);
    return NextResponse.json({
      success: false,
      error: `Problème avec les répertoires: ${dirCheck.error}`
    }, { status: 500 });
  }
  
  // Configuration pour formidable
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'test');
  const options = {
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    filter: (part) => {
      return part.mimetype?.includes('image/');
    },
    filename: (name, ext) => {
      const uniqueId = randomUUID().substring(0, 8);
      const timestamp = Date.now();
      return `test_img_${timestamp}_${uniqueId}${ext}`;
    }
  };
  
  try {
    // Convertir la NextRequest en flux lisible
    console.log('🔄 Conversion de la requête en flux...');
    const streamReq = await requestToStream(req);
    
    // Créer une instance de formidable
    const form = formidable(options);
    
    // Promisifier le parsing du formulaire
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(streamReq, (err, fields, files) => {
        if (err) {
          console.error('❌ Erreur formidable:', err);
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });
    
    // Extraire le fichier image (la clé peut varier selon le formulaire)
    const fileKey = Object.keys(files).find(key => 
      files[key][0]?.mimetype?.includes('image/')
    );
    
    if (!fileKey) {
      console.error('❌ Aucune image n\'a été trouvée dans la requête');
      return NextResponse.json({
        success: false,
        error: 'Aucune image n\'a été trouvée dans la requête'
      }, { status: 400 });
    }
    
    const imageFile = files[fileKey][0];
    
    // Obtenir le chemin relatif de l'image pour les URLs
    const newFilename = path.basename(imageFile.filepath);
    const publicPath = `/uploads/test/${newFilename}`;
    
    console.log('✅ Upload réussi:', {
      originalFilename: imageFile.originalFilename,
      newFilename,
      size: `${Math.round(imageFile.size / 1024)} KB`,
      type: imageFile.mimetype,
      publicPath
    });
    
    return NextResponse.json({
      success: true,
      message: 'Image téléchargée avec succès',
      file: {
        name: imageFile.originalFilename,
        size: imageFile.size,
        type: imageFile.mimetype,
        path: publicPath,
        url: publicPath
      },
      fields: Object.keys(fields).reduce((acc, key) => {
        acc[key] = Array.isArray(fields[key]) && fields[key].length === 1 
          ? fields[key][0] 
          : fields[key];
        return acc;
      }, {})
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'upload:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 