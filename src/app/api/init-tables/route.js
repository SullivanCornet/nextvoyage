import { NextResponse } from 'next/server';
import pool from '@/services/db';

export async function GET(request) {
  try {
    // Vérifier et créer la table des pays si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        image_path VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Vérifier et créer la table des villes si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        country_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        image_path VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
        UNIQUE KEY uk_city_country (slug, country_id)
      )
    `);

    // Vérifier et créer la table des catégories de lieux si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS place_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Vérifier et créer la table des lieux si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS places (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city_id INT NOT NULL,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        contact_info TEXT,
        website VARCHAR(255),
        image_path VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES place_categories(id) ON DELETE CASCADE,
        UNIQUE KEY uk_place_city (slug, city_id)
      )
    `);

    // Vérifier et créer la table des logements si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS city_accommodations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        accommodation_type VARCHAR(100),
        price_range VARCHAR(100),
        contact_info TEXT,
        website VARCHAR(255),
        image_path VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
        UNIQUE KEY uk_accommodation_city (slug, city_id)
      )
    `);

    // Vérifier et créer la table des transports si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS city_transports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        transport_type VARCHAR(100),
        route VARCHAR(255),
        schedule TEXT,
        price_info VARCHAR(255),
        image_path VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
        UNIQUE KEY uk_transport_city (slug, city_id)
      )
    `);

    return NextResponse.json({
      success: true,
      message: "Toutes les tables ont été vérifiées et créées si nécessaire",
      tables: [
        "countries",
        "cities",
        "place_categories",
        "places",
        "city_accommodations", 
        "city_transports"
      ]
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation des tables:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'initialisation des tables: " + error.message
      },
      { status: 500 }
    );
  }
} 