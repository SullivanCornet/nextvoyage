import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    console.log('Initialisation de la table cities...');
    
    // Vérifier si la table existe déjà
    try {
      const tableCheck = await executeQuery(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='cities'
      `);
      
      if (tableCheck.length > 0) {
        console.log('La table cities existe déjà');
        
        // Vérifier si elle contient des données
        const countCheck = await executeQuery('SELECT COUNT(*) as count FROM cities');
        if (countCheck[0].count > 0) {
          return NextResponse.json({
            success: true,
            message: 'La table cities existe déjà et contient des données',
            count: countCheck[0].count
          });
        }
      } else {
        // Créer la table si elle n'existe pas
        await executeQuery(`
          CREATE TABLE cities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            country_id INTEGER,
            description TEXT,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (country_id) REFERENCES countries(id)
          )
        `);
        console.log('Table cities créée avec succès');
      }
      
      // Vérifier si la table countries existe, sinon la créer aussi
      const countriesCheck = await executeQuery(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='countries'
      `);
      
      if (countriesCheck.length === 0) {
        await executeQuery(`
          CREATE TABLE countries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            code TEXT,
            description TEXT,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('Table countries créée avec succès');
        
        // Ajouter quelques pays par défaut
        const defaultCountries = [
          { name: 'France', slug: 'france', code: 'FR' },
          { name: 'Espagne', slug: 'espagne', code: 'ES' },
          { name: 'Italie', slug: 'italie', code: 'IT' },
          { name: 'Allemagne', slug: 'allemagne', code: 'DE' },
          { name: 'Royaume-Uni', slug: 'royaume-uni', code: 'GB' }
        ];
        
        for (const country of defaultCountries) {
          try {
            await executeQuery(
              'INSERT OR IGNORE INTO countries (name, slug, code) VALUES (?, ?, ?)',
              [country.name, country.slug, country.code]
            );
          } catch (insertError) {
            console.warn(`Impossible d'insérer le pays ${country.name}:`, insertError.message);
          }
        }
      }
      
      // Récupérer les IDs des pays pour les références étrangères
      const countries = await executeQuery('SELECT id, name, slug FROM countries');
      const countryMap = {};
      countries.forEach(country => {
        countryMap[country.slug] = country.id;
      });
      
      // Insérer des villes par défaut
      const defaultCities = [
        { name: 'Paris', slug: 'paris', country_slug: 'france', description: 'Capitale de la France' },
        { name: 'Lyon', slug: 'lyon', country_slug: 'france', description: 'Ville gastronomique' },
        { name: 'Marseille', slug: 'marseille', country_slug: 'france', description: 'Cité phocéenne' },
        { name: 'Barcelone', slug: 'barcelone', country_slug: 'espagne', description: 'Ville de Gaudí' },
        { name: 'Madrid', slug: 'madrid', country_slug: 'espagne', description: 'Capitale de l\'Espagne' },
        { name: 'Rome', slug: 'rome', country_slug: 'italie', description: 'La ville éternelle' },
        { name: 'Venise', slug: 'venise', country_slug: 'italie', description: 'La cité des canaux' },
        { name: 'Berlin', slug: 'berlin', country_slug: 'allemagne', description: 'Capitale de l\'Allemagne' },
        { name: 'Londres', slug: 'londres', country_slug: 'royaume-uni', description: 'Capitale du Royaume-Uni' }
      ];
      
      for (const city of defaultCities) {
        const countryId = countryMap[city.country_slug];
        if (countryId) {
          try {
            await executeQuery(
              'INSERT OR IGNORE INTO cities (name, slug, country_id, description) VALUES (?, ?, ?, ?)',
              [city.name, city.slug, countryId, city.description]
            );
          } catch (insertError) {
            console.warn(`Impossible d'insérer la ville ${city.name}:`, insertError.message);
          }
        } else {
          console.warn(`Pays non trouvé pour la ville ${city.name} (${city.country_slug})`);
        }
      }
      
      // Vérifier combien de villes ont été insérées
      const finalCount = await executeQuery('SELECT COUNT(*) as count FROM cities');
      
      return NextResponse.json({
        success: true,
        message: 'Table cities initialisée avec succès',
        count: finalCount[0].count
      });
      
    } catch (error) {
      console.error('Erreur lors de la vérification ou création de la table cities:', error);
      return NextResponse.json({
        success: false,
        error: `Erreur lors de l'initialisation: ${error.message}`
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erreur générale lors de l\'initialisation de la table cities:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur générale: ${error.message}`
    }, { status: 500 });
  }
} 