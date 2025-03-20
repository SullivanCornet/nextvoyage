/**
 * API d'inscription (register)
 * Cette API permet à un utilisateur de créer un compte
 */

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { hashPassword } from '@/lib/authUtils';
import { createToken } from '@/lib/jwtUtils';

export async function POST(request) {
  try {
    // Récupérer les données de la requête
    const { name, email, password } = await request.json();
    
    // Vérifier que tous les champs nécessaires sont fournis
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'email est déjà utilisé
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    const existingUsers = await executeQuery(checkUserQuery, [email]);
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }
    
    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);
    
    // Créer l'utilisateur en base de données
    const insertUserQuery = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, 'user')
    `;
    
    const result = await executeQuery(insertUserQuery, [name, email, hashedPassword]);
    
    // Récupérer l'utilisateur nouvellement créé
    const userData = {
      id: result.insertId,
      name,
      email,
      role: 'user'
    };
    
    // Générer un token JWT
    const token = createToken(userData);
    
    // Retourner la réponse sans le mot de passe
    return NextResponse.json(
      {
        message: 'Inscription réussie',
        user: userData,
        token
      },
      { 
        status: 201,
        headers: {
          'Set-Cookie': `authToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        }
      }
    );
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
} 