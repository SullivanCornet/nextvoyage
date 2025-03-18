import { NextResponse } from 'next/server';
import pool from '@/services/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    
    if (!table) {
      return NextResponse.json({
        success: false,
        error: 'Le paramètre "table" est requis'
      }, { status: 400 });
    }
    
    // Liste des tables sécurisées que l'on peut vérifier
    const allowedTables = [
      'countries', 'cities', 'categories', 'places', 
      'city_transports', 'city_accommodations'
    ];
    
    if (!allowedTables.includes(table)) {
      return NextResponse.json({
        success: false,
        error: `La table "${table}" n'est pas autorisée à être vérifiée`
      }, { status: 403 });
    }
    
    // 1. Vérifier si la table existe
    const [tables] = await pool.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME || 'nextvoyageplus', table]
    );
    
    if (tables.length === 0) {
      return NextResponse.json({
        success: false,
        exists: false,
        message: `La table "${table}" n'existe pas dans la base de données`
      });
    }
    
    // 2. Récupérer la structure de la table
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT 
       FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME || 'nextvoyageplus', table]
    );
    
    // 3. Compter le nombre de lignes
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM ${table}`
    );
    
    // 4. Récupérer un échantillon des données
    const [sampleData] = await pool.query(
      `SELECT * FROM ${table} LIMIT 5`
    );
    
    return NextResponse.json({
      success: true,
      exists: true,
      table: table,
      structure: columns,
      rowCount: countResult[0].total,
      sample: sampleData
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la table:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 