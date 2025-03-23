import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET /api/categories/init
export async function GET() {
  try {
    console.log('Initialisation de la table categories...');
    
    // Vérifier si la table existe déjà
    try {
      const tableCheck = await executeQuery(`
        SHOW TABLES LIKE 'categories'
      `);
      
      if (tableCheck.length > 0) {
        console.log('La table categories existe déjà');
        
        // Vérifier si elle contient des données
        const countCheck = await executeQuery('SELECT COUNT(*) as count FROM categories');
        if (countCheck[0].count > 0) {
          return NextResponse.json({
            success: true,
            message: 'La table categories existe déjà et contient des données',
            count: countCheck[0].count
          });
        }
      } else {
        // Créer la table si elle n'existe pas
        await executeQuery(`
          CREATE TABLE categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            icon VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log('Table categories créée avec succès');
      }
      
      // Insérer des catégories par défaut
      const defaultCategories = [
        { name: 'Monuments', slug: 'monuments', description: 'Sites historiques et monuments', icon: 'monument' },
        { name: 'Musées', slug: 'musees', description: 'Musées et galeries d\'art', icon: 'museum' },
        { name: 'Parcs', slug: 'parcs', description: 'Parcs et jardins', icon: 'tree' },
        { name: 'Restaurants', slug: 'restaurants', description: 'Restaurants et gastronomie', icon: 'utensils' },
        { name: 'Hébergements', slug: 'hebergements', description: 'Hôtels et autres hébergements', icon: 'bed' },
        { name: 'Plages', slug: 'plages', description: 'Plages et côtes', icon: 'umbrella-beach' },
        { name: 'Shopping', slug: 'shopping', description: 'Centres commerciaux et boutiques', icon: 'shopping-bag' },
        { name: 'Vie nocturne', slug: 'vie-nocturne', description: 'Bars et clubs', icon: 'moon' }
      ];
      
      for (const category of defaultCategories) {
        try {
          await executeQuery(
            'INSERT IGNORE INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
            [category.name, category.slug, category.description, category.icon]
          );
        } catch (insertError) {
          console.warn(`Impossible d'insérer la catégorie ${category.slug}:`, insertError.message);
        }
      }
      
      // Vérifier combien de catégories ont été insérées
      const finalCount = await executeQuery('SELECT COUNT(*) as count FROM categories');
      
      return NextResponse.json({
        success: true,
        message: 'Table categories initialisée avec succès',
        count: finalCount[0].count
      });
      
    } catch (error) {
      console.error('Erreur lors de la vérification ou création de la table categories:', error);
      return NextResponse.json({
        success: false,
        error: `Erreur lors de l'initialisation: ${error.message}`
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erreur générale lors de l\'initialisation de la table categories:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur générale: ${error.message}`
    }, { status: 500 });
  }
} 