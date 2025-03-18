import { NextResponse } from 'next/server';
import pool from '@/services/db';

export async function GET(request, { params }) {
  const { slug, citySlug } = params;

  console.log(`API: Récupération de la ville ${citySlug} pour le pays ${slug}`);

  try {
    // Récupérer les informations de la ville par son slug et le slug du pays
    const query = `
      SELECT c.*, 
             co.name as country_name, 
             co.slug as country_slug
      FROM cities c
      JOIN countries co ON c.country_id = co.id
      WHERE c.slug = ? AND co.slug = ?
    `;
    
    console.log('API: Exécution de la requête SQL pour récupérer la ville');
    console.log('API: Paramètres -', { citySlug, countrySlug: slug });
    
    const [rows] = await pool.query(query, [citySlug, slug]);
    console.log(`API: Résultat de la requête - ${rows.length} lignes trouvées`);

    if (rows.length === 0) {
      console.log(`API: Ville "${citySlug}" non trouvée pour le pays "${slug}"`);
      return NextResponse.json(
        { error: "Ville non trouvée" },
        { status: 404 }
      );
    }

    console.log(`API: Ville "${rows[0].name}" (ID: ${rows[0].id}) récupérée avec succès`);
    // Retourner les données de la ville
    return NextResponse.json(rows[0]);
    
  } catch (error) {
    console.error("API: Erreur détaillée lors de la récupération des données de la ville:", error);
    console.error("API: Message d'erreur:", error.message);
    console.error("API: Stack trace:", error.stack);
    
    return NextResponse.json(
      { 
        error: "Erreur lors de la récupération des données de la ville",
        details: error.message,
        params: { slug, citySlug }
      },
      { status: 500 }
    );
  }
} 