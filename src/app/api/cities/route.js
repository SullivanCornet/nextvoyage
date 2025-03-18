import { getAll, insert, executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/cities
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');
    
    let cities;
    
    if (countryId) {
      // Récupérer les villes d'un pays spécifique
      cities = await getAll('cities', { country_id: countryId });
    } else {
      // Récupérer toutes les villes
      cities = await getAll('cities');
    }
    
    return NextResponse.json(cities);
  } catch (error) {
    console.error('API: Erreur lors de la récupération des villes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des villes' },
      { status: 500 }
    );
  }
}

// POST /api/cities
export async function POST(request) {
  try {
    // Log de la requête entrante
    console.log('API: Réception d\'une requête POST pour /api/cities');
    
    const contentType = request.headers.get('content-type');
    console.log('API: Content-Type de la requête:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await request.json();
      console.log('API: Données JSON reçues pour création de ville:', data);
    } else {
      return NextResponse.json(
        { error: 'Le Content-Type doit être application/json' },
        { status: 400 }
      );
    }
    
    // Vérifier que les champs requis sont présents
    if (!data.name || !data.slug || !data.country_id) {
      console.log('API: Champs requis manquants:', { 
        name: Boolean(data.name), 
        slug: Boolean(data.slug), 
        country_id: Boolean(data.country_id) 
      });
      
      return NextResponse.json(
        { error: 'Les champs nom, slug et country_id sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier que le pays existe
    const countryQuery = 'SELECT id FROM countries WHERE id = ?';
    console.log(`API: Vérification que le pays avec ID ${data.country_id} existe`);
    
    const countries = await executeQuery({ query: countryQuery, values: [data.country_id] });
    
    if (countries.length === 0) {
      console.log(`API: Pays avec ID ${data.country_id} non trouvé`);
      return NextResponse.json(
        { error: 'Le pays spécifié n\'existe pas' },
        { status: 404 }
      );
    }
    
    // Vérifier que le slug n'est pas déjà utilisé pour ce pays
    const slugCheckQuery = 'SELECT id FROM cities WHERE country_id = ? AND slug = ?';
    console.log(`API: Vérification que le slug '${data.slug}' n'est pas déjà utilisé pour ce pays`);
    
    const existingCities = await executeQuery({ 
      query: slugCheckQuery, 
      values: [data.country_id, data.slug] 
    });
    
    if (existingCities.length > 0) {
      console.log(`API: Une ville avec le slug '${data.slug}' existe déjà pour ce pays`);
      return NextResponse.json(
        { error: 'Une ville avec ce nom existe déjà pour ce pays' },
        { status: 409 }
      );
    }
    
    // Préparer les données pour l'insertion
    const cityData = {
      name: data.name,
      slug: data.slug,
      country_id: data.country_id,
      country_code: data.country_code,
      description: data.description || '',
      image_path: data.image_path || null,
      created_by: data.created_by || null,
      status: data.status || 'published',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.log('API: Données préparées pour insertion de ville:', cityData);
    
    // Insérer la ville dans la base de données
    try {
      const city = await insert('cities', cityData);
      console.log('API: Ville créée avec succès:', city);
      
      return NextResponse.json(city, { status: 201 });
    } catch (insertError) {
      console.error('API: Erreur spécifique d\'insertion de ville:', insertError);
      return NextResponse.json(
        { error: `Erreur lors de la création de la ville: ${insertError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Erreur lors de la création de la ville:', error);
    return NextResponse.json(
      { error: `Erreur lors de la création de la ville: ${error.message}` },
      { status: 500 }
    );
  }
} 