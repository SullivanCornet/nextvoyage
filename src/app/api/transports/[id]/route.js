import { getById, remove, update } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/transports/[id]
export async function GET(request, { params }) {
  const id = params.id;
  
  try {
    const transport = await getById('city_transports', id);
    
    if (!transport) {
      return NextResponse.json(
        { error: 'Transport non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(transport);
  } catch (error) {
    console.error('API: Erreur lors de la récupération du transport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du transport' },
      { status: 500 }
    );
  }
}

// PUT /api/transports/[id]
export async function PUT(request, { params }) {
  const id = params.id;
  
  try {
    const data = await request.json();
    
    // Vérifier si le transport existe
    const transport = await getById('city_transports', id);
    
    if (!transport) {
      return NextResponse.json(
        { error: 'Transport non trouvé' },
        { status: 404 }
      );
    }
    
    // Préparer les données pour la mise à jour
    const updateData = {
      name: data.name,
      description: data.description || null,
      transport_type: data.transport_type || null,
      price_info: data.price_info || null,
      schedule: data.schedule || null,
      tips: data.tips || null,
      image_path: data.image_path || transport.image_path,
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    // Mettre à jour le transport
    const updatedTransport = await update('city_transports', id, updateData);
    
    return NextResponse.json(updatedTransport);
  } catch (error) {
    console.error('API: Erreur lors de la mise à jour du transport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du transport' },
      { status: 500 }
    );
  }
}

// DELETE /api/transports/[id]
export async function DELETE(request, { params }) {
  const id = params.id;
  
  try {
    // Vérifier si le transport existe
    const transport = await getById('city_transports', id);
    
    if (!transport) {
      return NextResponse.json(
        { error: 'Transport non trouvé' },
        { status: 404 }
      );
    }
    
    // Supprimer le transport
    await remove('city_transports', id);
    
    return NextResponse.json(
      { message: 'Transport supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API: Erreur lors de la suppression du transport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du transport' },
      { status: 500 }
    );
  }
} 