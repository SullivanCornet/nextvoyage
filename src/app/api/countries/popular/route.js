import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/countries/popular
export async function GET() {
  try {
    console.log('API: Récupération des pays populaires (ayant le plus de lieux)');
    
    // Requête SQL pour récupérer les pays avec au moins une ville
    // triés par nombre de lieux décroissant
    const query = `
      SELECT 
        c.*,
        COUNT(ct.id) as cities_count,
        COALESCE(SUM(ct_places.places_count), 0) as places_count,
        (
          SELECT city_images.image_path
          FROM cities city_images
          WHERE city_images.country_id = c.id AND city_images.image_path IS NOT NULL
          LIMIT 1
        ) as city_image_path
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
      HAVING 
        COUNT(ct.id) > 0
      ORDER BY 
        places_count DESC, c.name ASC
      LIMIT 4
    `;
    
    const countries = await executeQuery(query);
    console.log('API: Pays populaires récupérés avec succès');
    return NextResponse.json(countries);
  } catch (error) {
    console.error('API: Erreur lors de la récupération des pays populaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pays populaires' },
      { status: 500 }
    );
  }
} 