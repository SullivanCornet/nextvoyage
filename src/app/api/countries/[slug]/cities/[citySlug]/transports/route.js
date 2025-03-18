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

    // Récupérer tous les transports de cette ville
    const transportsQuery = `
      SELECT * FROM city_transports 
      WHERE city_id = ? 
      ORDER BY name ASC
    `;
    
    const [transports] = await pool.query(transportsQuery, [cityId]);
    
    // Transforme les résultats pour qu'ils correspondent à ce qu'attendait notre interface
    const formattedTransports = transports.map(item => ({
      ...item,
      // Notre interface utilise location pour afficher l'emplacement
      location: item.name, // Utilisé comme approximation, puisque city_transports n'a pas de champ location
      // Certaines entrées pourraient ne pas avoir de ID, générons-en un basé sur le nom pour notre interface
      slug: item.id.toString(),
      // Notre interface utilise route, qui existe déjà dans la table, mais au cas où il serait null
      route: item.route || `${item.name} route`
    }));

    return NextResponse.json(formattedTransports);
  } catch (error) {
    console.error("Erreur lors de la récupération des transports:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des transports" },
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

    // Insérer le nouveau transport - adapté à la structure de table existante
    const insertQuery = `
      INSERT INTO city_transports (
        city_id, name, description, transport_type,
        price_info, schedule, tips, image_path, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())
    `;

    const [result] = await pool.query(insertQuery, [
      cityId,
      data.name,
      data.description || null,
      data.transport_type || null,
      data.price_info || null,
      data.schedule || null,
      data.tips || null,
      data.image_path || null
    ]);

    return NextResponse.json({
      id: result.insertId,
      ...data,
      city_id: cityId
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de la création du transport:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du transport" },
      { status: 500 }
    );
  }
} 