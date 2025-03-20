import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/init-auth
 * Initialiser les tables d'authentification
 */
export async function GET() {
  try {
    // Lire le script SQL
    const sqlFilePath = path.join(process.cwd(), 'sql/auth-init.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Diviser le script en requêtes individuelles
    const queries = sqlScript
      .split(';')
      .filter(query => query.trim() !== '')
      .map(query => query.trim() + ';');
    
    // Exécuter chaque requête
    for (const query of queries) {
      await executeQuery(query);
    }
    
    // Retourner un message de succès
    return NextResponse.json({
      message: "Tables d'authentification initialisées avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des tables d\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation des tables d\'authentification', details: error.message },
      { status: 500 }
    );
  }
} 