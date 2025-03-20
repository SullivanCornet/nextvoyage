/**
 * API de déconnexion (logout)
 * Cette API permet à un utilisateur de se déconnecter
 */

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Pour se déconnecter, il suffit de supprimer le cookie d'authentification
    // en lui affectant une valeur vide et une date d'expiration passée
    
    return NextResponse.json(
      { message: 'Déconnexion réussie' },
      { 
        status: 200,
        headers: {
          'Set-Cookie': `authToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        }
      }
    );
    
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
} 