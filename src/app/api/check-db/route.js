import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';

// GET /api/check-db
export async function GET() {
  try {
    console.log('Tentative de connexion à la base de données...');
    const connection = await connect();
    
    // Si nous arrivons ici, c'est que la connexion a réussi
    connection.release(); // Important: libérer la connexion
    
    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données réussie',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 