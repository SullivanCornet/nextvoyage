import { executeQuery, update, remove } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/countries/[slug]
export async function GET(request, { params }) {
  try {
    const { slug } = params;
    console.log(`API: Récupération du pays avec le slug: ${slug}`);
    
    // Requête SQL pour obtenir le pays par son slug
    const query = 'SELECT * FROM countries WHERE slug = ?';
    const countries = await executeQuery({ query, values: [slug] });
    
    if (countries.length === 0) {
      return NextResponse.json(
        { error: 'Pays non trouvé' },
        { status: 404 }
      );
    }
    
    // Récupérer les villes associées à ce pays
    const citiesQuery = 'SELECT * FROM cities WHERE country_id = ?';
    const cities = await executeQuery({ 
      query: citiesQuery, 
      values: [countries[0].id] 
    });
    
    // Ajouter les villes au pays
    const country = {
      ...countries[0],
      cities: cities || []
    };
    
    return NextResponse.json(country);
  } catch (error) {
    console.error(`API: Erreur lors de la récupération du pays:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du pays' },
      { status: 500 }
    );
  }
}

// PUT /api/countries/[slug]
export async function PUT(request, { params }) {
  try {
    const { slug } = params;
    const data = await request.json();
    
    // Vérifier que le pays existe
    const query = 'SELECT id FROM countries WHERE slug = ?';
    const countries = await executeQuery({ query, values: [slug] });
    
    if (countries.length === 0) {
      return NextResponse.json(
        { error: 'Pays non trouvé' },
        { status: 404 }
      );
    }
    
    const countryId = countries[0].id;
    
    // Ne pas mettre à jour le champ created_at
    if (data.created_at) {
      delete data.created_at;
    }
    
    // Ajouter un champ updated_at
    data.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Mettre à jour le pays
    const updatedCountry = await update('countries', countryId, data);
    
    return NextResponse.json(updatedCountry);
  } catch (error) {
    console.error(`API: Erreur lors de la mise à jour du pays:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du pays' },
      { status: 500 }
    );
  }
}

// DELETE /api/countries/[slug]
export async function DELETE(request, { params }) {
  try {
    const { slug } = params;
    
    // Vérifier que le pays existe
    const query = 'SELECT id FROM countries WHERE slug = ?';
    const countries = await executeQuery({ query, values: [slug] });
    
    if (countries.length === 0) {
      return NextResponse.json(
        { error: 'Pays non trouvé' },
        { status: 404 }
      );
    }
    
    const countryId = countries[0].id;
    
    // Supprimer le pays
    await remove('countries', countryId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API: Erreur lors de la suppression du pays:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du pays' },
      { status: 500 }
    );
  }
} 