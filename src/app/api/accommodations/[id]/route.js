import { getById, remove, update } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/accommodations/[id]
export async function GET(request, { params }) {
  const id = params.id;
  
  try {
    const accommodation = await getById('city_accommodations', id);
    
    if (!accommodation) {
      return NextResponse.json(
        { error: 'Logement non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(accommodation);
  } catch (error) {
    console.error('API: Erreur lors de la récupération du logement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du logement' },
      { status: 500 }
    );
  }
}

// PUT /api/accommodations/[id]
export async function PUT(request, { params }) {
  const id = params.id;
  
  try {
    const data = await request.json();
    
    // Vérifier si le logement existe
    const accommodation = await getById('city_accommodations', id);
    
    if (!accommodation) {
      return NextResponse.json(
        { error: 'Logement non trouvé' },
        { status: 404 }
      );
    }
    
    // Préparer les données pour la mise à jour
    const updateData = {
      name: data.name,
      description: data.description || null,
      accommodation_type: data.accommodation_type || null,
      address: data.address || null,
      price_range: data.price_range || null,
      comfort_level: data.comfort_level || accommodation.comfort_level || 3,
      phone: data.phone || null,
      website: data.website || null,
      image_path: data.image_path || accommodation.image_path,
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    // Mettre à jour le logement
    const updatedAccommodation = await update('city_accommodations', id, updateData);
    
    return NextResponse.json(updatedAccommodation);
  } catch (error) {
    console.error('API: Erreur lors de la mise à jour du logement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du logement' },
      { status: 500 }
    );
  }
}

// DELETE /api/accommodations/[id]
export async function DELETE(request, { params }) {
  const id = params.id;
  
  try {
    // Vérifier si le logement existe
    const accommodation = await getById('city_accommodations', id);
    
    if (!accommodation) {
      return NextResponse.json(
        { error: 'Logement non trouvé' },
        { status: 404 }
      );
    }
    
    // Supprimer le logement
    await remove('city_accommodations', id);
    
    return NextResponse.json(
      { message: 'Logement supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API: Erreur lors de la suppression du logement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du logement' },
      { status: 500 }
    );
  }
} 