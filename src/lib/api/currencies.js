import { API_KEYS, API_URLS } from '../../app/config/apiKeys';

/**
 * Table de correspondance pour normaliser les codes de devise
 * Certaines devises peuvent être représentées par différents symboles ou codes
 */
const CURRENCY_CODE_MAP = {
  // Symboles qui peuvent être confondus avec des codes de devise
  '£': 'GBP', // Livre sterling (par défaut)
  '€': 'EUR', // Euro
  '$': 'USD', // Dollar américain (par défaut)
  '¥': 'JPY', // Yen japonais
  '₹': 'INR', // Roupie indienne
  '₽': 'RUB', // Rouble russe
  
  // Correspondances spécifiques par pays
  'Egyptian pound': 'EGP',
  'Livre égyptienne': 'EGP',
  'Egyptian £': 'EGP',
  
  // Autres correspondances potentielles
  'US Dollar': 'USD',
  'Euro': 'EUR',
  'British Pound': 'GBP',
  'Japanese Yen': 'JPY',
};

/**
 * Normalise un code de devise ou un symbole en code ISO standard
 * @param {string} currencyCode - Code ou symbole de devise à normaliser
 * @param {string} countryName - Nom du pays (optionnel, pour aider à la désambiguïsation)
 * @returns {string} Code de devise normalisé
 */
export function normalizeCurrencyCode(currencyCode, countryName = '') {
  if (!currencyCode) return 'USD'; // Valeur par défaut
  
  // Si le code est déjà au format ISO (3 lettres majuscules), le retourner tel quel
  if (/^[A-Z]{3}$/.test(currencyCode)) {
    return currencyCode;
  }
  
  // Vérifier dans la table de correspondance
  const normalizedCode = CURRENCY_CODE_MAP[currencyCode];
  if (normalizedCode) {
    return normalizedCode;
  }
  
  // Cas spéciaux basés sur le pays
  if (countryName) {
    const lowerCountry = countryName.toLowerCase();
    
    // Livre égyptienne
    if (lowerCountry.includes('egypt') && (
        currencyCode === '£' || 
        currencyCode.toLowerCase().includes('pound') || 
        currencyCode.toLowerCase().includes('livre'))) {
      return 'EGP';
    }
    
    // Livre sterling
    if ((lowerCountry.includes('united kingdom') || 
         lowerCountry.includes('great britain') || 
         lowerCountry.includes('uk') || 
         lowerCountry.includes('england')) && 
        (currencyCode === '£' || 
         currencyCode.toLowerCase().includes('pound') || 
         currencyCode.toLowerCase().includes('livre'))) {
      return 'GBP';
    }
    
    // Dollar américain
    if ((lowerCountry.includes('united states') || 
         lowerCountry.includes('usa') || 
         lowerCountry.includes('us')) && 
        (currencyCode === '$' || 
         currencyCode.toLowerCase().includes('dollar'))) {
      return 'USD';
    }
  }
  
  // Si aucune correspondance n'est trouvée, retourner le code tel quel
  // ou une valeur par défaut si c'est un symbole connu
  if (currencyCode === '£') return 'GBP';
  if (currencyCode === '$') return 'USD';
  if (currencyCode === '€') return 'EUR';
  
  console.warn(`Code de devise non reconnu: ${currencyCode}`);
  return currencyCode;
}

/**
 * Récupère les taux de change actuels depuis l'API
 * @param {string} baseCurrency - Devise de base (ex: EUR, USD)
 * @returns {Promise<Object>} Taux de change
 */
export async function fetchExchangeRates(baseCurrency = 'EUR') {
  try {
    // Ajouter un timeout pour éviter les attentes trop longues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout
    
    // Appel à l'API de taux de change
    const response = await fetch(
      `${API_URLS.EXCHANGE_RATE_API}/${baseCurrency}`,
      { 
        signal: controller.signal,
        headers: {
          // Certaines API nécessitent une clé d'API dans les en-têtes
          // 'Authorization': `Bearer ${API_KEYS.EXCHANGE_RATE_API}`
        }
      }
    );
    
    // Nettoyer le timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Vérifier que les données sont valides
    if (!data || !data.rates) {
      throw new Error('Données de taux de change invalides');
    }
    
    return {
      base: data.base,
      date: data.date,
      rates: data.rates,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des taux de change:', error);
    
    // En cas d'erreur, retourner des taux fictifs pour ne pas bloquer l'application
    return {
      base: baseCurrency,
      date: new Date().toISOString().split('T')[0],
      rates: {
        EUR: baseCurrency === 'EUR' ? 1 : 0.91,
        USD: baseCurrency === 'USD' ? 1 : 1.1,
        GBP: baseCurrency === 'GBP' ? 1 : 0.85,
        JPY: baseCurrency === 'JPY' ? 1 : 130,
        CHF: baseCurrency === 'CHF' ? 1 : 0.95,
        CAD: baseCurrency === 'CAD' ? 1 : 1.4,
        AUD: baseCurrency === 'AUD' ? 1 : 1.5,
        CNY: baseCurrency === 'CNY' ? 1 : 7.1,
        INR: baseCurrency === 'INR' ? 1 : 82,
        BRL: baseCurrency === 'BRL' ? 1 : 5.5,
        RUB: baseCurrency === 'RUB' ? 1 : 80,
        MXN: baseCurrency === 'MXN' ? 1 : 20,
      },
      error: true,
    };
  }
}

/**
 * Convertit un montant d'une devise à une autre
 * @param {number} amount - Montant à convertir
 * @param {string} fromCurrency - Devise de départ
 * @param {string} toCurrency - Devise d'arrivée
 * @param {Object} rates - Taux de change
 * @returns {number|null} Montant converti ou null en cas d'erreur
 */
export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (!rates || !rates.rates) {
    return null;
  }
  
  // Si les devises sont identiques, retourner le montant tel quel
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Si la devise de base est celle de départ
  if (fromCurrency === rates.base) {
    return amount * rates.rates[toCurrency];
  }
  
  // Si la devise de base est celle d'arrivée
  if (toCurrency === rates.base) {
    return amount / rates.rates[fromCurrency];
  }
  
  // Sinon, convertir via la devise de base
  return (amount / rates.rates[fromCurrency]) * rates.rates[toCurrency];
}

/**
 * Récupère la liste des devises disponibles
 * @param {Object} rates - Taux de change
 * @returns {Array} Liste des devises disponibles
 */
export function getAvailableCurrencies(rates) {
  if (!rates || !rates.rates) {
    return [];
  }
  
  // Ajouter la devise de base aux taux
  const allRates = {
    ...rates.rates,
    [rates.base]: 1,
  };
  
  // Créer un tableau de devises avec leur code
  return Object.keys(allRates).map(code => ({
    code,
    rate: allRates[code],
  })).sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Formate un montant avec le symbole de la devise
 * @param {number} amount - Montant à formater
 * @param {string} currencyCode - Code de la devise
 * @returns {string} Montant formaté
 */
export function formatCurrency(amount, currencyCode = 'EUR') {
  // Définir les options de formatage pour différentes devises
  const formatOptions = {
    EUR: { style: 'currency', currency: 'EUR' },
    USD: { style: 'currency', currency: 'USD' },
    GBP: { style: 'currency', currency: 'GBP' },
    JPY: { style: 'currency', currency: 'JPY' },
    // Ajouter d'autres devises au besoin
  };
  
  // Utiliser les options spécifiques à la devise ou des options par défaut
  const options = formatOptions[currencyCode] || { 
    style: 'currency', 
    currency: currencyCode 
  };
  
  try {
    // Utiliser l'API Intl pour formater le montant
    return new Intl.NumberFormat('fr-FR', options).format(amount);
  } catch (error) {
    // En cas d'erreur (devise non supportée), utiliser un format simple
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
} 