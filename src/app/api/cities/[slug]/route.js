import { executeQuery, update, remove } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/cities/[slug]
export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const countrySlug = searchParams.get('country_slug');
    
    console.log(`API: Récupération de la ville avec le slug: ${slug} pour le pays: ${countrySlug}`);
    
    let cityQuery;
    let queryValues;
    
    if (countrySlug) {
      // Récupérer la ville par son slug et le slug du pays
      cityQuery = `
        SELECT c.* 
        FROM cities c
        JOIN countries co ON c.country_id = co.id
        WHERE c.slug = ? AND co.slug = ?
      `;
      queryValues = [slug, countrySlug];
    } else {
      // Récupérer la ville par son slug uniquement
      cityQuery = 'SELECT * FROM cities WHERE slug = ?';
      queryValues = [slug];
    }
    
    const cities = await executeQuery({ query: cityQuery, values: queryValues });
    
    if (cities.length === 0) {
      return NextResponse.json(
        { error: 'Ville non trouvée' },
        { status: 404 }
      );
    }
    
    // Récupérer le pays associé
    const countryQuery = 'SELECT * FROM countries WHERE id = ?';
    const countries = await executeQuery({ 
      query: countryQuery, 
      values: [cities[0].country_id] 
    });
    
    // Ajouter les informations du pays à la ville
    const city = {
      ...cities[0],
      country: countries[0] || null
    };
    
    return NextResponse.json(city);
  } catch (error) {
    console.error(`API: Erreur lors de la récupération de la ville:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la ville' },
      { status: 500 }
    );
  }
}

// PUT /api/cities/[slug]
export async function PUT(request, { params }) {
  try {
    const { slug } = params;
    const data = await request.json();
    
    // Vérifier que la ville existe
    const query = 'SELECT id FROM cities WHERE slug = ?';
    const cities = await executeQuery({ query, values: [slug] });
    
    if (cities.length === 0) {
      return NextResponse.json(
        { error: 'Ville non trouvée' },
        { status: 404 }
      );
    }
    
    const cityId = cities[0].id;
    
    // Ne pas mettre à jour le champ created_at
    if (data.created_at) {
      delete data.created_at;
    }
    
    // Ajouter un champ updated_at
    data.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Mettre à jour la ville
    const updatedCity = await update('cities', cityId, data);
    
    return NextResponse.json(updatedCity);
  } catch (error) {
    console.error(`API: Erreur lors de la mise à jour de la ville:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la ville' },
      { status: 500 }
    );
  }
}

// DELETE /api/cities/[slug]
export async function DELETE(request, { params }) {
  try {
    const { slug } = params;
    
    // Vérifier que la ville existe
    const query = 'SELECT id FROM cities WHERE slug = ?';
    const cities = await executeQuery({ query, values: [slug] });
    
    if (cities.length === 0) {
      return NextResponse.json(
        { error: 'Ville non trouvée' },
        { status: 404 }
      );
    }
    
    const cityId = cities[0].id;
    
    // Supprimer la ville
    await remove('cities', cityId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API: Erreur lors de la suppression de la ville:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la ville' },
      { status: 500 }
    );
  }
} 