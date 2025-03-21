import { useState, useEffect } from 'react';
import { convertCurrency, formatCurrency, normalizeCurrencyCode } from '../lib/api/currencies';

/**
 * Composant de conversion de devises simplifié
 * Affiche deux convertisseurs côte à côte:
 * 1. Une devise (par défaut Euro) vers devise du pays
 * 2. Devise du pays vers une devise (par défaut Euro)
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.rates - Taux de change
 * @param {Object} props.countryCurrency - Information complète sur la devise du pays (code, nom, symbole)
 * @param {string} props.countryName - Nom du pays pour aider à la normalisation des codes de devise
 */
export default function CurrencyConverter({
  rates,
  countryCurrency,
  countryName = ''
}) {
  // États pour les montants des deux convertisseurs
  const [amountToCountry, setAmountToCountry] = useState(1);
  const [amountFromCountry, setAmountFromCountry] = useState(1);
  
  // États pour les devises des deux convertisseurs (par défaut EUR)
  const [selectedCurrencyToCountry, setSelectedCurrencyToCountry] = useState('EUR');
  const [selectedCurrencyFromCountry, setSelectedCurrencyFromCountry] = useState('EUR');
  
  // États pour les résultats des deux convertisseurs
  const [resultToCountry, setResultToCountry] = useState(null);
  const [resultFromCountry, setResultFromCountry] = useState(null);
  
  // Devise du pays normalisée
  const countryCurrencyCode = countryCurrency && countryCurrency.code 
    ? normalizeCurrencyCode(countryCurrency.code, countryName)
    : 'USD';
  
  // Générer la liste des devises disponibles
  const availableCurrencies = rates && rates.rates 
    ? Object.keys({...rates.rates, [rates.base]: 1})
        .filter(code => code !== countryCurrencyCode)
        .map(code => ({ code, rate: code === rates.base ? 1 : rates.rates[code] }))
    : [
        { code: 'EUR', rate: 1 },
        { code: 'USD', rate: 1.1 },
        { code: 'GBP', rate: 0.85 },
        { code: 'JPY', rate: 130 },
        { code: 'CHF', rate: 0.95 }
      ];
  
  // Calcul du résultat devise sélectionnée vers devise du pays
  useEffect(() => {
    if (rates && rates.rates) {
      // Vérifier si les codes de devise existent dans les taux disponibles
      const fromExists = rates.rates[selectedCurrencyToCountry] !== undefined || selectedCurrencyToCountry === rates.base;
      const toExists = rates.rates[countryCurrencyCode] !== undefined || countryCurrencyCode === rates.base;
      
      if (!fromExists || !toExists) {
        console.warn(`Devise non supportée pour la conversion: ${!fromExists ? selectedCurrencyToCountry : countryCurrencyCode}`);
        setResultToCountry(null);
        return;
      }
      
      const calculatedResult = convertCurrency(amountToCountry, selectedCurrencyToCountry, countryCurrencyCode, rates);
      setResultToCountry(calculatedResult);
    }
  }, [amountToCountry, selectedCurrencyToCountry, countryCurrencyCode, rates]);
  
  // Calcul du résultat devise du pays vers devise sélectionnée
  useEffect(() => {
    if (rates && rates.rates) {
      // Vérifier si les codes de devise existent dans les taux disponibles
      const fromExists = rates.rates[countryCurrencyCode] !== undefined || countryCurrencyCode === rates.base;
      const toExists = rates.rates[selectedCurrencyFromCountry] !== undefined || selectedCurrencyFromCountry === rates.base;
      
      if (!fromExists || !toExists) {
        console.warn(`Devise non supportée pour la conversion: ${!fromExists ? countryCurrencyCode : selectedCurrencyFromCountry}`);
        setResultFromCountry(null);
        return;
      }
      
      const calculatedResult = convertCurrency(amountFromCountry, countryCurrencyCode, selectedCurrencyFromCountry, rates);
      setResultFromCountry(calculatedResult);
    }
  }, [amountFromCountry, selectedCurrencyFromCountry, countryCurrencyCode, rates]);
  
  // Gérer le changement du montant vers pays
  const handleAmountToCountryChange = (e) => {
    const value = parseFloat(e.target.value);
    setAmountToCountry(isNaN(value) ? 0 : value);
  };
  
  // Gérer le changement du montant depuis pays
  const handleAmountFromCountryChange = (e) => {
    const value = parseFloat(e.target.value);
    setAmountFromCountry(isNaN(value) ? 0 : value);
  };
  
  // Gérer le changement de devise vers pays
  const handleCurrencyToCountryChange = (e) => {
    setSelectedCurrencyToCountry(e.target.value);
  };
  
  // Gérer le changement de devise depuis pays
  const handleCurrencyFromCountryChange = (e) => {
    setSelectedCurrencyFromCountry(e.target.value);
  };
  
  // Vérifier si les taux de change sont disponibles
  const isLoading = !rates || !rates.rates;
  
  // Obtenir le nom formaté d'une devise
  const getCurrencyLabel = (code) => {
    // Pour la devise du pays, afficher son nom complet
    if (code === countryCurrencyCode && countryCurrency && countryCurrency.name) {
      return `${countryCurrency.name} ${countryCurrency.symbol ? `(${countryCurrency.symbol})` : ''} ${code}`;
    }
    
    // Pour les autres devises, afficher des noms plus descriptifs si disponibles
    const currencyNames = {
      'EUR': 'Euro (€)',
      'USD': 'Dollar américain ($)',
      'GBP': 'Livre sterling (£)',
      'JPY': 'Yen japonais (¥)',
      'CHF': 'Franc suisse (CHF)',
      'CAD': 'Dollar canadien (C$)',
      'AUD': 'Dollar australien (A$)',
      'CNY': 'Yuan chinois (¥)',
      'INR': 'Roupie indienne (₹)',
      'BRL': 'Real brésilien (R$)',
      'RUB': 'Rouble russe (₽)',
      'MXN': 'Peso mexicain ($)'
    };
    
    return currencyNames[code] || code;
  };
  
  return (
    <div className="currency-converter-container">
      {/* Afficher un message si les taux sont fictifs (en cas d'erreur API) */}
      {rates && rates.error && (
        <div className="converter-warning">
          <p>Les taux affichés sont approximatifs. Service de taux de change temporairement indisponible.</p>
        </div>
      )}
      
      <div className="converters-grid">
        {/* Convertisseur devise sélectionnée vers devise du pays */}
        <div className="converter-card">
          <h4>Convertir vers {getCurrencyLabel(countryCurrencyCode)}</h4>
          
          <div className="input-group">
            <input
              type="number"
              value={amountToCountry}
              onChange={handleAmountToCountryChange}
              min="0"
              step="0.01"
              disabled={isLoading}
              className="converter-amount"
            />
            <select 
              value={selectedCurrencyToCountry}
              onChange={handleCurrencyToCountryChange}
              disabled={isLoading}
              className="currency-select"
            >
              {availableCurrencies.map((currency) => (
                <option key={`to-${currency.code}`} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
          
          <div className="result-group">
            <div className="result-equals">=</div>
            {isLoading ? (
              <div className="loading-spinner small"></div>
            ) : (
              <div className="result-amount">
                {resultToCountry !== null ? formatCurrency(resultToCountry, countryCurrencyCode) : '—'}
              </div>
            )}
          </div>
        </div>
        
        {/* Convertisseur devise du pays vers devise sélectionnée */}
        <div className="converter-card">
          <h4>Convertir depuis {getCurrencyLabel(countryCurrencyCode)}</h4>
          
          <div className="input-group">
            <input
              type="number"
              value={amountFromCountry}
              onChange={handleAmountFromCountryChange}
              min="0"
              step="0.01"
              disabled={isLoading}
              className="converter-amount"
            />
            <span className="country-currency">{countryCurrencyCode}</span>
          </div>
          
          <div className="result-group">
            <div className="result-equals">=</div>
            {isLoading ? (
              <div className="loading-spinner small"></div>
            ) : (
              <div className="result-container">
                <div className="result-amount">
                  {resultFromCountry !== null ? formatCurrency(resultFromCountry, selectedCurrencyFromCountry) : '—'}
                </div>
                <select 
                  value={selectedCurrencyFromCountry}
                  onChange={handleCurrencyFromCountryChange}
                  disabled={isLoading}
                  className="result-currency-select"
                >
                  {availableCurrencies.map((currency) => (
                    <option key={`from-${currency.code}`} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Date de mise à jour des taux */}
      {rates && rates.date && (
        <div className="converter-date">
          <small>Taux de change au {new Date(rates.date).toLocaleDateString('fr-FR')}</small>
        </div>
      )}

      <style jsx>{`
        .currency-converter-container {
          background-color: var(--card-bg);
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: var(--card-shadow);
          color: var(--text);
          font-family: 'Montserrat', Arial, sans-serif;
        }
        
        .converter-title {
          font-size: 1.25rem;
          color: var(--text-dark);
          margin-top: 0;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .converter-warning {
          background-color: rgba(255, 243, 205, 0.2);
          color: #ffd54f;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        
        .converter-warning p {
          margin: 0;
        }
        
        .converters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .converter-card {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .converter-card h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: var(--text-dark);
          font-size: 1rem;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .input-group {
          display: flex;
          margin-bottom: 15px;
        }
        
        .converter-amount {
          flex: 1;
          padding: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 5px 0 0 5px;
          font-size: 1rem;
          text-align: right;
          min-width: 0;
          background-color: rgba(0, 0, 0, 0.2);
          color: var(--text);
        }
        
        .currency-select, .country-currency {
          padding: 10px;
          background-color: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-left: none;
          border-radius: 0 5px 5px 0;
          font-weight: bold;
          min-width: 60px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
        }
        
        .currency-select {
          appearance: none;
          padding-right: 25px;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23ddd' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          cursor: pointer;
        }
        
        .result-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        
        .result-equals {
          color: var(--text-light);
          font-size: 1.2rem;
        }
        
        .result-amount {
          font-weight: bold;
          color: var(--text-dark);
          font-size: 1.2rem;
          text-align: center;
          margin-right: 5px;
        }
        
        .result-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        
        .result-currency-select {
          padding: 5px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 0.9rem;
          background-color: rgba(0, 0, 0, 0.2);
          color: var(--text);
          appearance: none;
          padding-right: 20px;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23ddd' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 5px center;
          cursor: pointer;
        }
        
        .converter-date {
          text-align: center;
          color: var(--text-light);
          font-size: 0.8rem;
          margin-top: 10px;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .converters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 