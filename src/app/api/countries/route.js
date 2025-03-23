import { executeQuery, insert } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/countries
export async function GET() {
  try {
    console.log('API: Récupération de tous les pays');
    
    // Requête SQL pour récupérer les pays avec le nombre de villes
    const query = `
      SELECT 
        c.*,
        COUNT(ct.id) as cities_count,
        COALESCE(SUM(ct_places.places_count), 0) as places_count
      FROM 
        countries c
      LEFT JOIN 
        cities ct ON c.id = ct.country_id
      LEFT JOIN (
        SELECT 
          city_id, 
          COUNT(id) as places_count 
        FROM 
          places 
        GROUP BY 
          city_id
      ) ct_places ON ct.id = ct_places.city_id
      GROUP BY 
        c.id
      ORDER BY 
        c.name ASC
    `;
    
    const countries = await executeQuery(query);
    console.log('API: Pays récupérés avec succès');
    return NextResponse.json(countries);
  } catch (error) {
    console.error('API: Erreur lors de la récupération des pays:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pays' },
      { status: 500 }
    );
  }
}

// POST /api/countries
export async function POST(request) {
  try {
    const data = await request.json();
    console.log('API: Données reçues pour création de pays:', data);
    
    // Vérifier que les champs requis sont présents
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Les champs nom et slug sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Préparer les données pour l'insertion en tenant compte de tous les champs de la table
    const countryData = {
      name: data.name,
      slug: data.slug,
      country_code: data.country_code || null,
      description: data.description || '',
      language: data.language || null,
      population: data.population || null,
      area: data.area || null,
      capital: data.capital || null,
      currency: data.currency || null,
      currency_code: data.currency_code || null,
      image_path: data.image_path || null,
      flag_image: data.flag_image || null,
      status: data.status || 'published',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.log('API: Données préparées pour insertion:', countryData);
    
    try {
      // Insérer le pays dans la base de données
      const country = await insert('countries', countryData);
      console.log('API: Pays créé avec succès:', country);
      
      return NextResponse.json(country, { status: 201 });
    } catch (insertError) {
      console.error('API: Erreur spécifique d\'insertion:', insertError);
      // On essaie de capturer plus de détails sur l'erreur
      return NextResponse.json(
        { error: `Erreur lors de la création du pays: ${insertError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Erreur détaillée lors de la création du pays:', error);
    return NextResponse.json(
      { error: `Erreur lors de la création du pays: ${error.message}` },
      { status: 500 }
    );
  }
} 