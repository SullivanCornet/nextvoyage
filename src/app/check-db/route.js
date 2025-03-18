import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/check-db
export async function GET() {
  try {
    console.log('API: Vérification de la base de données');
    
    // Vérifier la structure de la table place_categories
    const tableInfoQuery = `
      SHOW COLUMNS FROM place_categories
    `;
    
    const tableInfo = await executeQuery({ query: tableInfoQuery });
    
    // Vérifier les catégories existantes
    const categoriesQuery = `
      SELECT * FROM place_categories
    `;
    
    const categories = await executeQuery({ query: categoriesQuery });
    
    // Vérifier si les slugs sont corrects
    const slugsCheck = categories.map(cat => {
      const slug = cat.slug;
      const latinSlug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const isSlugLatin = slug === latinSlug;
      
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        isSlugLatin,
        recommendation: isSlugLatin ? 'OK' : `Slug devrait être "${latinSlug}"`
      };
    });
    
    // Essayer de trouver la catégorie "Commerces" spécifiquement
    const commercesQuery = `
      SELECT * FROM place_categories WHERE slug = 'commerces'
    `;
    
    const commercesCategory = await executeQuery({ query: commercesQuery });
    
    return NextResponse.json({
      table_structure: tableInfo,
      categories: categories,
      slugs_check: slugsCheck,
      commerces_category: commercesCategory.length > 0 ? commercesCategory[0] : null,
      message: 'Vérification terminée'
    });
  } catch (error) {
    console.error('API: Erreur lors de la vérification de la base de données:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la vérification de la base de données',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 