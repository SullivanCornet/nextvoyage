import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/categories/recreate
export async function GET() {
  try {
    console.log("Suppression de toutes les catégories existantes...");
    
    // Supprimer toutes les catégories existantes
    await executeQuery("DELETE FROM place_categories");
    
    console.log("Création des catégories de base...");
    
    // Créer les catégories de base
    const baseCategories = [
      {
        name: "Commerces",
        slug: "commerces",
        description: "Boutiques, magasins et marchés"
      },
      {
        name: "Restaurants",
        slug: "restaurants",
        description: "Restaurants, cafés et bars"
      },
      {
        name: "Lieux à visiter",
        slug: "lieux-a-visiter",
        description: "Monuments, musées et sites touristiques"
      },
      {
        name: "Transports",
        slug: "transports",
        description: "Gares, aéroports et moyens de transport"
      },
      {
        name: "Logements",
        slug: "logements",
        description: "Hôtels, appartements et hébergements"
      }
    ];
    
    const createdCategories = [];
    
    // Insérer chaque catégorie
    for (const category of baseCategories) {
      const result = await executeQuery(
        "INSERT INTO place_categories (name, slug, description) VALUES (?, ?, ?)",
        [category.name, category.slug, category.description]
      );
      
      console.log(`Catégorie créée: ${category.name} avec ID ${result.insertId}`);
      
      createdCategories.push({
        id: result.insertId,
        ...category
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Catégories recréées avec succès", 
      categories: createdCategories
    });
    
  } catch (error) {
    console.error("Erreur lors de la recréation des catégories:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Erreur lors de la recréation des catégories", 
      error: error.message 
    }, { status: 500 });
  }
} 