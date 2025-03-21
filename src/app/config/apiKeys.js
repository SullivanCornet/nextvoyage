/**
 * Configuration des clés API pour les services externes
 * Dans un environnement de production, ces clés devraient être stockées dans des variables d'environnement
 */
export const API_KEYS = {
  // Clé pour l'API de taux de change (ExchangeRate-API)
  // Remplacer par votre propre clé ou utiliser des variables d'environnement
  EXCHANGE_RATE_API: process.env.EXCHANGE_RATE_API || 'votre_clé_exchange_rate_api',
  
  // Clé pour l'API de météo (si nécessaire)
  WEATHER_API: process.env.WEATHER_API || 'votre_clé_weather_api',
  
  // Autres clés API si nécessaire
};

/**
 * Configuration des URLs de base pour les API externes
 */
export const API_URLS = {
  // URL de base pour l'API RestCountries (gratuite, pas besoin de clé)
  COUNTRIES_API: 'https://restcountries.com/v3.1',
  
  // URL de base pour l'API de taux de change
  EXCHANGE_RATE_API: 'https://api.exchangerate-api.com/v4/latest',
  
  // URL de base pour l'API de météo (si nécessaire)
  WEATHER_API: 'https://api.openweathermap.org/data/2.5',
}; 