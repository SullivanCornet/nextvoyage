import { getAll, insert, executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/categories
export async function GET() {
  try {
    console.log('API: Récupération des catégories de lieux');
    
    // Récupérer toutes les catégories
    const categories = await getAll('place_categories');
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('API: Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST /api/categories
export async function POST(request) {
  try {
    console.log('API: Réception d\'une requête POST pour /api/categories');
    
    const contentType = request.headers.get('content-type');
    console.log('API: Content-Type de la requête:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await request.json();
      console.log('API: Données JSON reçues pour création de catégorie:', data);
    } else {
      return NextResponse.json(
        { error: 'Le Content-Type doit être application/json' },
        { status: 400 }
      );
    }
    
    // Vérifier que les champs requis sont présents
    if (!data.name || !data.slug) {
      console.log('API: Champs requis manquants:', { 
        name: Boolean(data.name), 
        slug: Boolean(data.slug)
      });
      
      return NextResponse.json(
        { error: 'Les champs nom et slug sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier que le slug n'est pas déjà utilisé
    const slugCheckQuery = 'SELECT id FROM place_categories WHERE slug = ?';
    console.log(`API: Vérification que le slug '${data.slug}' n'est pas déjà utilisé`);
    
    const existingCategories = await executeQuery({ 
      query: slugCheckQuery, 
      values: [data.slug] 
    });
    
    if (existingCategories.length > 0) {
      console.log(`API: Une catégorie avec le slug '${data.slug}' existe déjà`);
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 409 }
      );
    }
    
    // Préparer les données pour l'insertion
    const categoryData = {
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.log('API: Données préparées pour insertion de catégorie:', categoryData);
    
    // Insérer la catégorie dans la base de données
    try {
      const category = await insert('place_categories', categoryData);
      console.log('API: Catégorie créée avec succès:', category);
      
      return NextResponse.json(category, { status: 201 });
    } catch (insertError) {
      console.error('API: Erreur spécifique d\'insertion de catégorie:', insertError);
      return NextResponse.json(
        { error: `Erreur lors de la création de la catégorie: ${insertError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { error: `Erreur lors de la création de la catégorie: ${error.message}` },
      { status: 500 }
    );
  }
} 