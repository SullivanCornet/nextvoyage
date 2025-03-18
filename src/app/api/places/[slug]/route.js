import { executeQuery, update, remove } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/places/[slug]
export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('city_id');
    
    console.log(`API: Récupération du lieu avec le slug: ${slug}`);
    
    let placeQuery;
    let queryValues;
    
    if (cityId) {
      // Récupérer le lieu par son slug et l'ID de la ville
      placeQuery = 'SELECT * FROM places WHERE slug = ? AND city_id = ?';
      queryValues = [slug, cityId];
    } else {
      // Récupérer le lieu par son slug uniquement
      placeQuery = 'SELECT * FROM places WHERE slug = ?';
      queryValues = [slug];
    }
    
    const places = await executeQuery({ query: placeQuery, values: queryValues });
    
    if (places.length === 0) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }
    
    const place = places[0];
    
    // Récupérer la catégorie associée
    const categoryQuery = 'SELECT * FROM place_categories WHERE id = ?';
    const categories = await executeQuery({ 
      query: categoryQuery, 
      values: [place.category_id] 
    });
    
    // Récupérer la ville associée
    const cityQuery = 'SELECT * FROM cities WHERE id = ?';
    const cities = await executeQuery({ 
      query: cityQuery, 
      values: [place.city_id] 
    });
    
    // Ajouter les informations associées au lieu
    const placeWithDetails = {
      ...place,
      category: categories[0] || null,
      city: cities[0] || null
    };
    
    return NextResponse.json(placeWithDetails);
  } catch (error) {
    console.error(`API: Erreur lors de la récupération du lieu:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du lieu' },
      { status: 500 }
    );
  }
}

// PUT /api/places/[slug]
export async function PUT(request, { params }) {
  try {
    const { slug } = params;
    const data = await request.json();
    
    // Vérifier que le lieu existe
    const cityId = data.city_id;
    let placeQuery;
    let queryValues;
    
    if (cityId) {
      placeQuery = 'SELECT id FROM places WHERE slug = ? AND city_id = ?';
      queryValues = [slug, cityId];
    } else {
      placeQuery = 'SELECT id FROM places WHERE slug = ?';
      queryValues = [slug];
    }
    
    const places = await executeQuery({ query: placeQuery, values: queryValues });
    
    if (places.length === 0) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }
    
    const placeId = places[0].id;
    
    // Ne pas mettre à jour le champ created_at
    if (data.created_at) {
      delete data.created_at;
    }
    
    // Ajouter un champ updated_at
    data.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Mettre à jour le lieu
    const updatedPlace = await update('places', placeId, data);
    
    return NextResponse.json(updatedPlace);
  } catch (error) {
    console.error(`API: Erreur lors de la mise à jour du lieu:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du lieu' },
      { status: 500 }
    );
  }
}

// DELETE /api/places/[slug]
export async function DELETE(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('city_id');
    
    // Vérifier que le lieu existe
    let placeQuery;
    let queryValues;
    
    if (cityId) {
      placeQuery = 'SELECT id FROM places WHERE slug = ? AND city_id = ?';
      queryValues = [slug, cityId];
    } else {
      placeQuery = 'SELECT id FROM places WHERE slug = ?';
      queryValues = [slug];
    }
    
    const places = await executeQuery({ query: placeQuery, values: queryValues });
    
    if (places.length === 0) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }
    
    const placeId = places[0].id;
    
    // Supprimer le lieu
    await remove('places', placeId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API: Erreur lors de la suppression du lieu:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du lieu' },
      { status: 500 }
    );
  }
} 