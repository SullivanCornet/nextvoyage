import { NextResponse } from 'next/server';
import pool from '@/services/db';

export async function GET(request, { params }) {
  const { slug, citySlug } = params;

  try {
    // D'abord, récupérer l'ID de la ville à partir de son slug et du slug du pays
    const cityQuery = `
      SELECT cities.id 
      FROM cities 
      JOIN countries ON cities.country_id = countries.id 
      WHERE cities.slug = ? AND countries.slug = ?
    `;
    const [cityRows] = await pool.query(cityQuery, [citySlug, slug]);

    if (cityRows.length === 0) {
      return NextResponse.json({ error: "Ville non trouvée" }, { status: 404 });
    }

    const cityId = cityRows[0].id;

    // Récupérer tous les logements de cette ville
    const accommodationsQuery = `
      SELECT * FROM city_accommodations 
      WHERE city_id = ? 
      ORDER BY name ASC
    `;
    
    const [accommodations] = await pool.query(accommodationsQuery, [cityId]);
    
    // Transforme les résultats pour qu'ils correspondent à ce qu'attendait notre interface
    const formattedAccommodations = accommodations.map(item => ({
      ...item,
      // Dans la base de données, le champ s'appelle "address", mais notre interface utilise "location"
      location: item.address || null,
      // Certaines entrées pourraient ne pas avoir de ID, générons-en un basé sur le nom pour notre interface
      slug: item.id.toString()
    }));

    return NextResponse.json(formattedAccommodations);
  } catch (error) {
    console.error("Erreur lors de la récupération des logements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des logements" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const { slug, citySlug } = params;

  try {
    const data = await request.json();

    // Vérifier que le champ requis est présent
    if (!data.name) {
      return NextResponse.json(
        { error: "Le champ name est requis" },
        { status: 400 }
      );
    }

    // Récupérer l'ID de la ville
    const cityQuery = `
      SELECT cities.id 
      FROM cities 
      JOIN countries ON cities.country_id = countries.id 
      WHERE cities.slug = ? AND countries.slug = ?
    `;
    const [cityRows] = await pool.query(cityQuery, [citySlug, slug]);

    if (cityRows.length === 0) {
      return NextResponse.json({ error: "Ville non trouvée" }, { status: 404 });
    }

    const cityId = cityRows[0].id;

    // Insérer le nouveau logement - adapté à la structure de table existante
    const insertQuery = `
      INSERT INTO city_accommodations (
        city_id, name, description, address, 
        accommodation_type, price_range, phone, website, 
        image_path, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())
    `;

    const [result] = await pool.query(insertQuery, [
      cityId,
      data.name,
      data.description || null,
      data.location || null,     // Utiliser location comme address
      data.accommodation_type || null,
      data.price_range || null,
      data.contact_info || null, // Utiliser contact_info comme phone
      data.website || null,
      data.image_path || null
    ]);

    return NextResponse.json({
      id: result.insertId,
      ...data,
      city_id: cityId
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de la création du logement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du logement" },
      { status: 500 }
    );
  }
} 