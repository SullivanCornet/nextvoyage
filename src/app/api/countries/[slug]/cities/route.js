import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/countries/[slug]/cities
export async function GET(request, { params }) {
  try {
    const { slug } = params;
    console.log(`API: Récupération des villes du pays avec le slug: ${slug}`);
    
    // D'abord, obtenir l'ID du pays à partir du slug
    const countryQuery = 'SELECT id FROM countries WHERE slug = ?';
    const countries = await executeQuery({ query: countryQuery, values: [slug] });
    
    if (countries.length === 0) {
      return NextResponse.json(
        { error: 'Pays non trouvé' },
        { status: 404 }
      );
    }
    
    const countryId = countries[0].id;
    
    // Récupérer toutes les villes de ce pays
    const citiesQuery = 'SELECT * FROM cities WHERE country_id = ?';
    const cities = await executeQuery({ query: citiesQuery, values: [countryId] });
    
    return NextResponse.json(cities);
  } catch (error) {
    console.error(`API: Erreur lors de la récupération des villes:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des villes' },
      { status: 500 }
    );
  }
} 