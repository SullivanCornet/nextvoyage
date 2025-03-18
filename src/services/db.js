// On importe le pool de lib/db.js pour n'avoir qu'un seul pool de connexions
import { executeQuery, getAll, getById, insert, update, remove, getConnection, connect } from '@/lib/db';

// On réexporte les fonctions de lib/db.js
export { executeQuery, getAll, getById, insert, update, remove, getConnection, connect };

// Pour la compatibilité avec le code existant qui utilise le pool directement
// On exporte un objet qui ressemble à un pool mais qui utilise les fonctions de lib/db.js
const pool = {
  execute: async (query, values) => {
    return executeQuery(query, values);
  },
  query: async (query, values) => {
    // Retourner un tableau [results] pour être compatible avec mysql2 qui retourne [rows, fields]
    const results = await executeQuery(query, values);
    return [results];
  },
  getConnection: async () => {
    return getConnection();
  }
};

export default pool; 