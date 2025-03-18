import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

/**
 * Vérifie l'état des répertoires d'upload
 */
export async function GET(req) {
  console.log('🔍 Diagnostic: Vérification des répertoires d\'upload');
  
  try {
    const projectRoot = process.cwd();
    const publicDir = path.join(projectRoot, 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    const placesDir = path.join(uploadsDir, 'places');
    const testDir = path.join(uploadsDir, 'test');
    
    // Structure pour stocker les résultats
    const results = {
      success: true,
      directories: {
        publicDir: { path: publicDir, exists: false, writable: false },
        uploadsDir: { path: uploadsDir, exists: false, writable: false },
        placesDir: { path: placesDir, exists: false, writable: false },
        testDir: { path: testDir, exists: false, writable: false }
      },
      tests: {
        writeTest: { status: 'pending', details: null }
      }
    };
    
    // Vérifier l'existence des répertoires
    if (fs.existsSync(publicDir)) {
      results.directories.publicDir.exists = true;
      
      // Vérifier le répertoire uploads
      if (fs.existsSync(uploadsDir)) {
        results.directories.uploadsDir.exists = true;
        
        // Vérifier le répertoire places
        if (fs.existsSync(placesDir)) {
          results.directories.placesDir.exists = true;
        } else {
          try {
            fs.mkdirSync(placesDir, { recursive: true });
            results.directories.placesDir.exists = true;
            console.log('✅ Répertoire places créé avec succès');
          } catch (err) {
            results.success = false;
            results.error = `Impossible de créer le répertoire places: ${err.message}`;
            console.error('❌ Impossible de créer le répertoire places:', err);
          }
        }
        
        // Vérifier le répertoire de test
        if (fs.existsSync(testDir)) {
          results.directories.testDir.exists = true;
        } else {
          try {
            fs.mkdirSync(testDir, { recursive: true });
            results.directories.testDir.exists = true;
            console.log('✅ Répertoire test créé avec succès');
          } catch (err) {
            results.success = false;
            results.error = `Impossible de créer le répertoire test: ${err.message}`;
            console.error('❌ Impossible de créer le répertoire test:', err);
          }
        }
      } else {
        try {
          fs.mkdirSync(uploadsDir, { recursive: true });
          results.directories.uploadsDir.exists = true;
          
          // Créer aussi le répertoire places
          fs.mkdirSync(placesDir, { recursive: true });
          results.directories.placesDir.exists = true;
          
          // Créer aussi le répertoire de test
          fs.mkdirSync(testDir, { recursive: true });
          results.directories.testDir.exists = true;
          
          console.log('✅ Répertoires uploads, places et test créés avec succès');
        } catch (err) {
          results.success = false;
          results.error = `Impossible de créer le répertoire uploads: ${err.message}`;
          console.error('❌ Impossible de créer le répertoire uploads:', err);
        }
      }
    } else {
      try {
        fs.mkdirSync(publicDir, { recursive: true });
        results.directories.publicDir.exists = true;
        
        // Créer aussi les autres répertoires
        fs.mkdirSync(uploadsDir, { recursive: true });
        results.directories.uploadsDir.exists = true;
        
        fs.mkdirSync(placesDir, { recursive: true });
        results.directories.placesDir.exists = true;
        
        fs.mkdirSync(testDir, { recursive: true });
        results.directories.testDir.exists = true;
        
        console.log('✅ Tous les répertoires créés avec succès');
      } catch (err) {
        results.success = false;
        results.error = `Impossible de créer le répertoire public: ${err.message}`;
        console.error('❌ Impossible de créer le répertoire public:', err);
      }
    }
    
    // Tester l'accès en écriture pour chaque répertoire existant
    if (results.directories.publicDir.exists) {
      try {
        const testFile = path.join(publicDir, `write-test-${Date.now()}.txt`);
        fs.writeFileSync(testFile, 'Test d\'écriture');
        results.directories.publicDir.writable = true;
        try { fs.unlinkSync(testFile); } catch (e) { }
      } catch (err) {
        results.directories.publicDir.writable = false;
        console.warn('⚠️ Répertoire public non accessible en écriture:', err.message);
      }
    }
    
    if (results.directories.uploadsDir.exists) {
      try {
        const testFile = path.join(uploadsDir, `write-test-${Date.now()}.txt`);
        fs.writeFileSync(testFile, 'Test d\'écriture');
        results.directories.uploadsDir.writable = true;
        try { fs.unlinkSync(testFile); } catch (e) { }
      } catch (err) {
        results.directories.uploadsDir.writable = false;
        console.warn('⚠️ Répertoire uploads non accessible en écriture:', err.message);
      }
    }
    
    if (results.directories.placesDir.exists) {
      try {
        const testFile = path.join(placesDir, `write-test-${Date.now()}.txt`);
        fs.writeFileSync(testFile, 'Test d\'écriture');
        results.directories.placesDir.writable = true;
        try { fs.unlinkSync(testFile); } catch (e) { }
      } catch (err) {
        results.directories.placesDir.writable = false;
        console.warn('⚠️ Répertoire places non accessible en écriture:', err.message);
      }
    }
    
    if (results.directories.testDir.exists) {
      try {
        const testFile = path.join(testDir, `write-test-${Date.now()}.txt`);
        fs.writeFileSync(testFile, 'Test d\'écriture');
        results.directories.testDir.writable = true;
        try { fs.unlinkSync(testFile); } catch (e) { }
      } catch (err) {
        results.directories.testDir.writable = false;
        console.warn('⚠️ Répertoire test non accessible en écriture:', err.message);
      }
    }
    
    // Test d'écriture et lecture d'une image simple
    try {
      // Créer une petite image de test (un pixel noir en PNG)
      const pixelBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
        0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      
      const testImagePath = path.join(testDir, `test-image-${Date.now()}.png`);
      fs.writeFileSync(testImagePath, pixelBuffer);
      
      // Vérifier que l'image a été correctement écrite
      const fileStats = fs.statSync(testImagePath);
      
      results.tests.writeTest = {
        status: 'success',
        details: {
          path: testImagePath,
          size: fileStats.size,
          created: fileStats.birthtime,
          isFile: fileStats.isFile()
        }
      };
      
      // Tenter de supprimer le fichier de test
      try {
        fs.unlinkSync(testImagePath);
        results.tests.writeTest.details.cleanup = 'success';
      } catch (cleanupErr) {
        results.tests.writeTest.details.cleanup = 'failed';
        results.tests.writeTest.details.cleanupError = cleanupErr.message;
      }
      
    } catch (imageTestErr) {
      results.tests.writeTest = {
        status: 'failed',
        details: {
          error: imageTestErr.message
        }
      };
      console.error('❌ Test d\'écriture d\'image échoué:', imageTestErr);
    }
    
    // Récupérer les permissions des répertoires (uniquement sur les systèmes Unix)
    try {
      const isWindows = process.platform === 'win32';
      if (!isWindows) {
        results.permissions = {
          publicDir: fs.existsSync(publicDir) ? fs.statSync(publicDir).mode.toString(8) : null,
          uploadsDir: fs.existsSync(uploadsDir) ? fs.statSync(uploadsDir).mode.toString(8) : null,
          placesDir: fs.existsSync(placesDir) ? fs.statSync(placesDir).mode.toString(8) : null,
          testDir: fs.existsSync(testDir) ? fs.statSync(testDir).mode.toString(8) : null,
        };
      }
    } catch (permErr) {
      console.warn('⚠️ Impossible de récupérer les permissions:', permErr.message);
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des répertoires:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 