import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/categories/[slug]
export async function GET(request, { params }) {
  try {
    const { slug } = params;
    console.log(`API: Récupération de la catégorie avec le slug: ${slug}`);
    
    if (!slug) {
      console.error('API: Pas de slug fourni pour récupérer la catégorie');
      return NextResponse.json(
        { error: 'Slug de catégorie non fourni', debug_info: { slug } },
        { status: 400 }
      );
    }
    
    // Récupérer la catégorie par son slug
    const query = 'SELECT * FROM place_categories WHERE slug = ?';
    console.log(`API: Exécution de la requête SQL: ${query} avec le slug: ${slug}`);
    
    const categories = await executeQuery({ query, values: [slug] });
    console.log(`API: Résultat de la requête:`, JSON.stringify(categories));
    
    if (categories.length === 0) {
      console.log(`API: Aucune catégorie trouvée avec le slug: ${slug}`);
      return NextResponse.json(
        { error: 'Catégorie non trouvée', debug_info: { slug, query } },
        { status: 404 }
      );
    }
    
    console.log(`API: Catégorie trouvée:`, JSON.stringify(categories[0]));
    return NextResponse.json(categories[0]);
  } catch (error) {
    console.error(`API: Erreur lors de la récupération de la catégorie:`, error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération de la catégorie',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 