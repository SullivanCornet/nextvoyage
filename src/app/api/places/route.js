import { getAll, insert, executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/places
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('city_id');
    const categoryId = searchParams.get('category_id');
    
    let places;
    let conditions = {};
    
    // Filtrage par ville et/ou catégorie
    if (cityId) {
      conditions.city_id = cityId;
    }
    
    if (categoryId) {
      conditions.category_id = categoryId;
    }
    
    // Si des conditions sont définies, filtrer les résultats
    if (Object.keys(conditions).length > 0) {
      places = await getAll('places', conditions);
    } else {
      // Sinon, récupérer tous les lieux
      places = await getAll('places');
    }
    
    // Pour chaque lieu, récupérer sa catégorie
    const placesWithCategory = await Promise.all(places.map(async (place) => {
      const categoryQuery = 'SELECT * FROM place_categories WHERE id = ?';
      const categories = await executeQuery({ 
        query: categoryQuery, 
        values: [place.category_id] 
      });
      
      return {
        ...place,
        category: categories[0] || null
      };
    }));
    
    return NextResponse.json(placesWithCategory);
  } catch (error) {
    console.error('API: Erreur lors de la récupération des lieux:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des lieux' },
      { status: 500 }
    );
  }
}

// POST /api/places
export async function POST(request) {
  try {
    console.log('API: Réception d\'une requête POST pour /api/places');
    
    const contentType = request.headers.get('content-type');
    console.log('API: Content-Type de la requête:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await request.json();
      console.log('API: Données JSON reçues pour création de lieu:', data);
    } else {
      return NextResponse.json(
        { error: 'Le Content-Type doit être application/json' },
        { status: 400 }
      );
    }
    
    // Vérifier que les champs requis sont présents
    if (!data.name || !data.slug || !data.city_id || !data.category_id) {
      console.log('API: Champs requis manquants:', { 
        name: Boolean(data.name), 
        slug: Boolean(data.slug),
        city_id: Boolean(data.city_id), 
        category_id: Boolean(data.category_id) 
      });
      
      return NextResponse.json(
        { error: 'Les champs nom, slug, ville et catégorie sont obligatoires' },
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
    
    // Vérifier que la catégorie existe
    const categoryQuery = 'SELECT id FROM place_categories WHERE id = ?';
    console.log(`API: Vérification que la catégorie avec ID ${data.category_id} existe`);
    
    const categories = await executeQuery({ query: categoryQuery, values: [data.category_id] });
    
    if (categories.length === 0) {
      console.log(`API: Catégorie avec ID ${data.category_id} non trouvée`);
      return NextResponse.json(
        { error: 'La catégorie spécifiée n\'existe pas' },
        { status: 404 }
      );
    }
    
    // Vérifier que le slug n'est pas déjà utilisé pour cette ville
    const slugCheckQuery = 'SELECT id FROM places WHERE city_id = ? AND slug = ?';
    console.log(`API: Vérification que le slug '${data.slug}' n'est pas déjà utilisé pour cette ville`);
    
    const existingPlaces = await executeQuery({ 
      query: slugCheckQuery, 
      values: [data.city_id, data.slug] 
    });
    
    if (existingPlaces.length > 0) {
      console.log(`API: Un lieu avec le slug '${data.slug}' existe déjà pour cette ville`);
      return NextResponse.json(
        { error: 'Un lieu avec ce nom existe déjà pour cette ville' },
        { status: 409 }
      );
    }
    
    // Préparer les données pour l'insertion
    const placeData = {
      city_id: data.city_id,
      category_id: data.category_id,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      practical_info: data.practical_info || null,
      location: data.location || null,
      image_path: data.image_path || null,
      created_by: data.created_by || null,
      status: data.status || 'published',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.log('API: Données préparées pour insertion de lieu:', placeData);
    
    // Insérer le lieu dans la base de données
    try {
      const place = await insert('places', placeData);
      console.log('API: Lieu créé avec succès:', place);
      
      return NextResponse.json(place, { status: 201 });
    } catch (insertError) {
      console.error('API: Erreur spécifique d\'insertion de lieu:', insertError);
      return NextResponse.json(
        { error: `Erreur lors de la création du lieu: ${insertError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Erreur lors de la création du lieu:', error);
    return NextResponse.json(
      { error: `Erreur lors de la création du lieu: ${error.message}` },
      { status: 500 }
    );
  }
} 