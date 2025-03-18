import { getAll, insert, executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/transports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('city_id');
    
    let transports;
    
    if (cityId) {
      // Récupérer les transports d'une ville spécifique
      transports = await getAll('city_transports', { city_id: cityId });
    } else {
      // Récupérer tous les transports
      transports = await getAll('city_transports');
    }
    
    return NextResponse.json(transports);
  } catch (error) {
    console.error('API: Erreur lors de la récupération des transports:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des transports' },
      { status: 500 }
    );
  }
}

// POST /api/transports
export async function POST(request) {
  try {
    console.log('API: Réception d\'une requête POST pour /api/transports');
    
    const contentType = request.headers.get('content-type');
    console.log('API: Content-Type de la requête:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await request.json();
      console.log('API: Données JSON reçues pour création de transport:', data);
    } else {
      return NextResponse.json(
        { error: 'Le Content-Type doit être application/json' },
        { status: 400 }
      );
    }
    
    // Vérifier que les champs requis sont présents
    if (!data.name || !data.city_id || !data.transport_type) {
      console.log('API: Champs requis manquants:', { 
        name: Boolean(data.name), 
        city_id: Boolean(data.city_id), 
        transport_type: Boolean(data.transport_type) 
      });
      
      return NextResponse.json(
        { error: 'Les champs nom, ville et type de transport sont obligatoires' },
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
    const transportData = {
      city_id: data.city_id,
      transport_type: data.transport_type,
      name: data.name,
      description: data.description || '',
      price_info: data.price_info || null,
      schedule: data.schedule || null,
      tips: data.tips || null,
      image_path: data.image_path || null,
      created_by: data.created_by || null,
      status: data.status || 'published',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.log('API: Données préparées pour insertion de transport:', transportData);
    
    // Insérer le transport dans la base de données
    try {
      const transport = await insert('city_transports', transportData);
      console.log('API: Transport créé avec succès:', transport);
      
      return NextResponse.json(transport, { status: 201 });
    } catch (insertError) {
      console.error('API: Erreur spécifique d\'insertion de transport:', insertError);
      return NextResponse.json(
        { error: `Erreur lors de la création du transport: ${insertError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Erreur lors de la création du transport:', error);
    return NextResponse.json(
      { error: `Erreur lors de la création du transport: ${error.message}` },
      { status: 500 }
    );
  }
} 