/**
 * API pour récupérer les informations de l'utilisateur connecté
 * Cette API permet de vérifier si l'utilisateur est authentifié et de récupérer ses informations
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/jwtUtils';

export async function GET() {
  try {
    // Récupérer le token des cookies
    const cookieStore = cookies();
    const token = cookieStore.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    // Vérifier et décoder le token JWT
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    // Récupérer l'utilisateur depuis la base de données pour s'assurer qu'il existe toujours
    const userId = decoded.sub;
    const findUserQuery = 'SELECT id, name, email, role FROM users WHERE id = ?';
    const users = await executeQuery(findUserQuery, [userId]);
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    const user = users[0];
    
    // Retourner les informations de l'utilisateur
    return NextResponse.json({ user });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des infos utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations utilisateur' },
      { status: 500 }
    );
  }
} 