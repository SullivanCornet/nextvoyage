import mysql from 'mysql2/promise';

// Configuration de la connexion à la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'nextvoyageplususr',
  password: process.env.DB_PASSWORD || 'nextvoyageplususr',
  database: process.env.DB_NAME || 'nextvoyageplus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Création d'un pool de connexions
const pool = mysql.createPool(dbConfig);

/**
 * Exécute une requête SQL
 * Cette fonction peut être appelée de deux façons:
 * 1. executeQuery({ query, values })
 * 2. executeQuery(query, values)
 */
export async function executeQuery(queryOrConfig, valuesParam) {
  let query;
  let values = [];
  
  // Déterminer le mode d'appel (objet ou arguments séparés)
  if (typeof queryOrConfig === 'object' && queryOrConfig !== null && 'query' in queryOrConfig) {
    // Mode 1: executeQuery({ query, values })
    query = queryOrConfig.query;
    values = queryOrConfig.values || [];
  } else {
    // Mode 2: executeQuery(query, values)
    query = queryOrConfig;
    values = valuesParam || [];
  }
  
  // Vérifier que la requête est une chaîne valide
  if (typeof query !== 'string' || query.trim() === '') {
    throw new Error('La requête SQL doit être une chaîne non vide');
  }
  
  try {
    console.log('DB: Exécution de la requête SQL:', query);
    console.log('DB: Avec les valeurs:', values);
    
    // Obtenir une connexion du pool
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête SQL:', error.message);
    console.error('Query:', query);
    console.error('Values:', values);
    throw error;
  }
}

// Fonction pour obtenir un élément par son ID
export async function getById(table, id) {
  try {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    const results = await executeQuery(query, [id]);
    return results[0];
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'élément dans ${table}:`, error);
    throw error;
  }
}

// Fonction pour obtenir tous les éléments d'une table
export async function getAll(table, conditions = {}, limit = 100) {
  try {
    let query = `SELECT * FROM ${table}`;
    const values = [];
    
    // Ajouter des conditions WHERE si elles existent
    if (Object.keys(conditions).length > 0) {
      const whereConditions = [];
      for (const [key, value] of Object.entries(conditions)) {
        whereConditions.push(`${key} = ?`);
        values.push(value);
      }
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` LIMIT ${limit}`;
    
    return await executeQuery(query, values);
  } catch (error) {
    console.error(`Erreur lors de la récupération des éléments dans ${table}:`, error);
    throw error;
  }
}

// Fonction pour insérer des données dans une table
export async function insert(table, data) {
  try {
    console.log(`DB: Préparation de l'insertion dans la table '${table}'`);
    
    // Créer les parties de la requête SQL
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    // Construire la requête SQL
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    console.log(`DB: Requête préparée: ${query.substring(0, 100)}...`);
    console.log(`DB: Valeurs: ${JSON.stringify(values)}`);
    
    // Exécuter la requête en utilisant le pool via executeQuery
    const result = await executeQuery(query, values);
    
    console.log(`DB: Insertion réussie dans ${table}, ID: ${result.insertId}`);
    
    // Ajouter les données envoyées au résultat pour une meilleure cohérence
    const insertedRecord = {
      id: result.insertId,
      ...data
    };
    
    return insertedRecord;
  } catch (error) {
    console.error(`DB: Erreur lors de l'insertion dans ${table}:`, error);
    throw error;
  }
}

// Fonction pour mettre à jour un élément
export async function update(table, id, data) {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    
    await executeQuery(query, [...values, id]);
    return { id, ...data };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour dans ${table}:`, error);
    throw error;
  }
}

// Fonction pour supprimer un élément
export async function remove(table, id) {
  try {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    await executeQuery(query, [id]);
    return { success: true };
  } catch (error) {
    console.error(`Erreur lors de la suppression dans ${table}:`, error);
    throw error;
  }
}

// Fonction pour obtenir une connexion à la base de données
export async function getConnection() {
  try {
    console.log('DB: Obtention d\'une connexion à la base de données');
    const connection = await pool.getConnection();
    
    // Ajout d'un wrapper pour la méthode release originale
    const originalRelease = connection.release;
    connection.release = () => {
      console.log('DB: Libération d\'une connexion');
      originalRelease.call(connection);
    };
    
    return connection;
  } catch (error) {
    console.error('DB: Erreur lors de l\'obtention d\'une connexion:', error);
    throw error;
  }
}

// Fonction pour se connecter à la base de données (utilisée pour les tests)
export async function connect() {
  try {
    console.log('DB: Tentative de connexion à la base de données');
    return await pool.getConnection();
  } catch (error) {
    console.error('DB: Erreur de connexion à la base de données:', error);
    throw error;
  }
} 