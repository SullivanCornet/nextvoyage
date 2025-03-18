import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET /api/test-db
export async function GET(request) {
  console.log('📊 Test de connexion à la base de données...');
  
  try {
    // Test simple de connexion à la base de données
    const testResult = await executeQuery({ query: 'SELECT 1 as test', values: [] });
    
    if (!testResult || !testResult.length) {
      throw new Error('Test de connexion a échoué');
    }
    
    console.log('✅ Connexion à la base de données réussie');
    
    // Examiner la structure de la table places
    let tableStructure = [];
    let insertTest = {};
    
    try {
      const columnsResult = await executeQuery({ query: 'SHOW COLUMNS FROM places', values: [] });
      
      if (columnsResult && columnsResult.length > 0) {
        tableStructure = columnsResult.map(col => ({
          name: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          key: col.Key,
          default: col.Default,
          extra: col.Extra
        }));
        
        // Préparer un test d'insertion fictif pour voir si la structure est correcte
        const testData = {
          name: 'Test Place',
          slug: 'test-place',
          city_id: 1,
          category_id: 1,
          description: 'Test description',
          location: 'Test address',
          image_path: '/uploads/test/test-image.jpg',
          status: 'published'
        };
        
        // Générer les colonnes et les valeurs
        const columns = Object.keys(testData).join(', ');
        const placeholders = Object.keys(testData).map(() => '?').join(', ');
        const values = Object.values(testData);
        
        // Tester uniquement avec EXPLAIN (ne modifie pas la base de données)
        const explainQuery = `EXPLAIN INSERT INTO places (${columns}) VALUES (${placeholders})`;
        const explainResult = await executeQuery({ query: explainQuery, values });
        
        insertTest = {
          success: true,
          query: `INSERT INTO places (${columns}) VALUES (...)`,
          explanation: explainResult
        };
      } else {
        throw new Error('Table places non trouvée ou sans colonnes');
      }
    } catch (tableError) {
      console.error('❌ Erreur lors de la vérification de la table places:', tableError);
      tableStructure = { error: tableError.message };
    }
    
    // Renvoyer un résultat positif avec la structure de la table
    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données réussie',
      databaseVersion: await executeQuery({ query: 'SELECT VERSION() as version', values: [] }).then(r => r[0]?.version),
      tableStructure,
      insertTest,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 