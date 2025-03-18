import { getAll, insert, executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/accommodations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('city_id');
    
    let accommodations;
    
    if (cityId) {
      // Récupérer les logements d'une ville spécifique
      accommodations = await getAll('city_accommodations', { city_id: cityId });
    } else {
      // Récupérer tous les logements
      accommodations = await getAll('city_accommodations');
    }
    
    return NextResponse.json(accommodations);
  } catch (error) {
    console.error('API: Erreur lors de la récupération des logements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logements' },
      { status: 500 }
    );
  }
}

// POST /api/accommodations
export async function POST(request) {
  try {
    console.log('API: Réception d\'une requête POST pour /api/accommodations');
    
    const contentType = request.headers.get('content-type');
    console.log('API: Content-Type de la requête:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await request.json();
      console.log('API: Données JSON reçues pour création de logement:', data);
    } else {
      return NextResponse.json(
        { error: 'Le Content-Type doit être application/json' },
        { status: 400 }
      );
    }
    
    // Vérifier que les champs requis sont présents
    if (!data.name || !data.city_id || !data.accommodation_type) {
      console.log('API: Champs requis manquants:', { 
        name: Boolean(data.name), 
        city_id: Boolean(data.city_id), 
        accommodation_type: Boolean(data.accommodation_type) 
      });
      
      return NextResponse.json(
        { error: 'Les champs nom, ville et type de logement sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier que la ville existe
    const cityQuery = 'SELECT id FROM cities WHERE id = ?';
    console.log(`API: Vérification que la ville avec ID ${data.city_id} existe`);
    
    const cities = await executeQuery({ query: cityQuery, values: [data.city_id] });
    
    if (cities.length === 0) {
      console.log(`API: Ville avec ID ${data.city_id} non trouvée`);
      return NextResponse.json(
        { error: 'La ville spécifiée n\'existe pas' },
        { status: 404 }
      );
    }
    
    // Préparer les données pour l'insertion
    const accommodationData = {
      city_id: data.city_id,
      accommodation_type: data.accommodation_type,
      name: data.name,
      description: data.description || '',
      address: data.address || null,
      price_range: data.price_range || null,
      comfort_level: data.comfort_level || 3,
      phone: data.phone || null,
      website: data.website || null,
      image_path: data.image_path || null,
      created_by: data.created_by || null,
      status: data.status || 'published',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.log('API: Données préparées pour insertion de logement:', accommodationData);
    
    // Insérer le logement dans la base de données
    try {
      const accommodation = await insert('city_accommodations', accommodationData);
      console.log('API: Logement créé avec succès:', accommodation);
      
      return NextResponse.json(accommodation, { status: 201 });
    } catch (insertError) {
      console.error('API: Erreur spécifique d\'insertion de logement:', insertError);
      return NextResponse.json(
        { error: `Erreur lors de la création du logement: ${insertError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Erreur lors de la création du logement:', error);
    return NextResponse.json(
      { error: `Erreur lors de la création du logement: ${error.message}` },
      { status: 500 }
    );
  }
} 