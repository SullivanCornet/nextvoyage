import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    console.log('Initialisation de la table places...');
    
    // Vérifier si la table existe déjà
    try {
      const tableCheck = await executeQuery(`
        SHOW TABLES LIKE 'places'
      `);
      
      if (tableCheck.length > 0) {
        console.log('La table places existe déjà');
        
        // Vérifier si elle contient des données
        const countCheck = await executeQuery('SELECT COUNT(*) as count FROM places');
        if (countCheck[0].count > 0) {
          return NextResponse.json({
            success: true,
            message: 'La table places existe déjà et contient des données',
            count: countCheck[0].count
          });
        }
      } else {
        // Créer la table si elle n'existe pas
        await executeQuery(`
          CREATE TABLE places (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            city_id INT,
            category_id INT,
            description TEXT,
            location VARCHAR(255),
            image_path VARCHAR(255),
            status VARCHAR(50) DEFAULT 'published',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (city_id) REFERENCES cities(id),
            FOREIGN KEY (category_id) REFERENCES categories(id),
            UNIQUE(slug, city_id)
          )
        `);
        console.log('Table places créée avec succès');
      }
      
      // Vérifier si les tables de référence existent
      await executeQuery(`
        SHOW TABLES LIKE 'categories'
      `).then(async (results) => {
        if (results.length === 0) {
          console.log('La table categories n\'existe pas, redirection vers son initialisation...');
          // Faire une requête à l'API d'initialisation des catégories
          const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/categories/init`);
          const categoriesData = await categoriesResponse.json();
          console.log('Résultat de l\'initialisation des catégories:', categoriesData);
        }
      });
      
      await executeQuery(`
        SHOW TABLES LIKE 'cities'
      `).then(async (results) => {
        if (results.length === 0) {
          console.log('La table cities n\'existe pas, redirection vers son initialisation...');
          // Faire une requête à l'API d'initialisation des villes
          const citiesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/cities/init`);
          const citiesData = await citiesResponse.json();
          console.log('Résultat de l\'initialisation des villes:', citiesData);
        }
      });
      
      // Insérer quelques lieux d'exemple si la table est vide
      const countCheck = await executeQuery('SELECT COUNT(*) as count FROM places');
      if (countCheck[0].count === 0) {
        // Récupérer des IDs de villes et catégories pour les exemples
        const cities = await executeQuery('SELECT id, name FROM cities LIMIT 3');
        const categories = await executeQuery('SELECT id, name FROM categories LIMIT 3');
        
        if (cities.length > 0 && categories.length > 0) {
          // Créer quelques exemples de lieux
          const examplePlaces = [
            {
              name: 'Tour Eiffel',
              slug: 'tour-eiffel',
              city_id: cities.find(c => c.name === 'Paris')?.id || cities[0].id,
              category_id: categories.find(c => c.name === 'Monuments')?.id || categories[0].id,
              description: 'Monument emblématique de Paris',
              location: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris'
            },
            {
              name: 'Musée du Louvre',
              slug: 'musee-du-louvre',
              city_id: cities.find(c => c.name === 'Paris')?.id || cities[0].id,
              category_id: categories.find(c => c.name === 'Musées')?.id || categories[0].id,
              description: 'Le plus grand musée d\'art et d\'antiquités au monde',
              location: 'Rue de Rivoli, 75001 Paris'
            },
            {
              name: 'Sagrada Familia',
              slug: 'sagrada-familia',
              city_id: cities.find(c => c.name === 'Barcelone')?.id || cities[1].id,
              category_id: categories.find(c => c.name === 'Monuments')?.id || categories[0].id,
              description: 'Basilique conçue par l\'architecte Antoni Gaudí',
              location: 'Carrer de Mallorca, 401, 08013 Barcelona, Espagne'
            }
          ];
          
          for (const place of examplePlaces) {
            try {
              await executeQuery(
                'INSERT IGNORE INTO places (name, slug, city_id, category_id, description, location) VALUES (?, ?, ?, ?, ?, ?)',
                [place.name, place.slug, place.city_id, place.category_id, place.description, place.location]
              );
            } catch (insertError) {
              console.warn(`Impossible d'insérer le lieu ${place.name}:`, insertError.message);
            }
          }
        }
      }
      
      // Vérifier combien de lieux ont été insérés
      const finalCount = await executeQuery('SELECT COUNT(*) as count FROM places');
      
      return NextResponse.json({
        success: true,
        message: 'Table places initialisée avec succès',
        count: finalCount[0].count
      });
      
    } catch (error) {
      console.error('Erreur lors de la vérification ou création de la table places:', error);
      return NextResponse.json({
        success: false,
        error: `Erreur lors de l'initialisation: ${error.message}`
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erreur générale lors de l\'initialisation de la table places:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur générale: ${error.message}`
    }, { status: 500 });
  }
} 