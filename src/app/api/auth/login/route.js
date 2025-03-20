/**
 * API de connexion (login)
 * Cette API permet à un utilisateur de se connecter
 */

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyPassword } from '@/lib/authUtils';
import { createToken } from '@/lib/jwtUtils';

export async function POST(request) {
  try {
    // Récupérer les données de la requête
    const { email, password } = await request.json();
    
    // Vérifier que tous les champs nécessaires sont fournis
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Récupérer l'utilisateur par son email
    const findUserQuery = 'SELECT * FROM users WHERE email = ?';
    const users = await executeQuery(findUserQuery, [email]);
    
    // Vérifier si l'utilisateur existe
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    // Préparer les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    // Générer un token JWT
    const token = createToken(userData);
    
    // Retourner la réponse
    return NextResponse.json(
      {
        message: 'Connexion réussie',
        user: userData,
        token
      },
      { 
        status: 200,
        headers: {
          'Set-Cookie': `authToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        }
      }
    );
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
} 