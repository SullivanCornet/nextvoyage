'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CityCard from '@/components/CityCard';
import { useAuth } from '@/app/contexts/AuthContext';
import CurrencyConverter from '@/components/CurrencyConverter';
import { normalizeCurrencyCode, fetchExchangeRates } from '@/lib/api/currencies';

export default function CountryDetails() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const { isAuthenticated } = useAuth();
  
  const [country, setCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour les taux de change
  const [exchangeRates, setExchangeRates] = useState(null);
  
  // Récupérer les informations du pays et ses villes
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        console.log('Récupération des informations du pays avec le slug:', slug);
        const response = await fetch(`/api/countries/${slug}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des informations du pays');
        }
        
        const data = await response.json();
        console.log('Informations du pays récupérées:', data);
        setCountry(data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    if (slug) {
      fetchCountry();
    }
  }, [slug]);
  
  // Récupérer les taux de change
  useEffect(() => {
    const getRates = async () => {
      if (!isLoading && country) {
        try {
          const rates = await fetchExchangeRates('EUR');
          
          // Si le pays a une devise qui n'est pas déjà dans les taux et que nous avons un code de devise
          if (country.currency_code && rates && rates.rates) {
            const currencyCode = normalizeCurrencyCode(country.currency_code, country.name);
            if (!rates.rates[currencyCode] && currencyCode !== rates.base) {
              // Ajouter un taux fictif pour cette devise (pourrait être remplacé par une conversion approximative)
              rates.rates[currencyCode] = 1.2; // Taux fictif
              rates.error = true; // Marquer comme ayant des erreurs
            }
          }
          
          setExchangeRates(rates);
        } catch (error) {
          console.error('Erreur lors de la récupération des taux de change:', error);
          // En cas d'erreur, utiliser des taux fictifs
          const baseCurrency = 'EUR';
          setExchangeRates({
            base: baseCurrency,
            date: new Date().toISOString().split('T')[0],
            rates: {
              USD: 1.1,
              GBP: 0.85,
              JPY: 130,
              CHF: 0.95,
              CAD: 1.4,
              AUD: 1.5,
              CNY: 7.1,
              INR: 82,
              BRL: 5.5,
              RUB: 80,
              MXN: 20,
              // Ajouter la devise du pays si elle est connue
              ...(country.currency_code ? 
                  { [normalizeCurrencyCode(country.currency_code, country.name)]: 1.2 } : {})
            },
            error: true // Indiquer que ce sont des taux fictifs
          });
        }
      }
    };
    
    getRates();
  }, [isLoading, country]);
  
  // Gérer la suppression d'un pays
  const handleDeleteCountry = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pays ? Cette action est irréversible.')) {
      try {
        const response = await fetch(`/api/countries/${slug}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du pays');
        }
        
        // Rediriger vers la liste des pays
        router.push('/countries');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Une erreur est survenue lors de la suppression du pays');
      }
    }
  };
  
  // Propriétés du convertisseur de devise
  const countryCurrency = country && country.currency ? {
    code: country.currency_code || (country.currency || '').toUpperCase(),
    name: country.currency,
    symbol: country.currency_symbol
  } : null;
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement des informations du pays...</p>
        
        <style jsx>{`
          .loading-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            margin-top: 100px;
            font-family: Arial, sans-serif;
          }
        `}</style>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p>Erreur: {error}</p>
        <Link href="/countries" className="back-button">
          Retour à la liste des pays
        </Link>
        
        <style jsx>{`
          .error-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            margin-top: 100px;
            font-family: Arial, sans-serif;
            color: #e74c3c;
          }
          
          .back-button {
            display: inline-block;
            margin-top: 20px;
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }
  
  if (!country) {
    return (
      <div className="not-found-container">
        <p>Pays non trouvé.</p>
        <Link href="/countries" className="back-button">
          Retour à la liste des pays
        </Link>
        
        <style jsx>{`
          .not-found-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            margin-top: 100px;
            font-family: Arial, sans-serif;
          }
          
          .back-button {
            display: inline-block;
            margin-top: 20px;
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <div className="country-details-container">
      {country.flag_image && (
        <div className="country-banner" style={{ backgroundImage: `url(${country.flag_image})` }}>
          <div className="banner-overlay">
            <h1>{country.name}</h1>
          </div>
        </div>
      )}
      
      <div className="country-header">
        {!country.flag_image && <h1>{country.name}</h1>}
        
        <div className="header-actions">
          <Link href="/countries" className="action-button back-button">
            Retour à la liste des pays
          </Link>
          <div className="spacer"></div>
          {isAuthenticated && (
            <button onClick={handleDeleteCountry} className="action-button delete-button">
              Supprimer de la liste
            </button>
          )}
        </div>
      </div>
      
      <div className="country-info">
        <div className="country-description">
          <h2>À propos</h2>
          <p>{country.description || 'Aucune description disponible.'}</p>
          
          <div className="country-meta">
            {country.country_code && (
              <div className="meta-item">
                <strong>Code pays:</strong> {country.country_code}
              </div>
            )}
            {country.language && (
              <div className="meta-item">
                <strong>Langue(s):</strong> {country.language}
              </div>
            )}
            {country.population && (
              <div className="meta-item">
                <strong>Population:</strong> {parseInt(country.population).toLocaleString()} habitants
              </div>
            )}
            {country.area && (
              <div className="meta-item">
                <strong>Superficie:</strong> {parseInt(country.area).toLocaleString()} km²
              </div>
            )}
            {country.capital && (
              <div className="meta-item">
                <strong>Capitale:</strong> {country.capital}
              </div>
            )}
            {country.currency && (
              <div className="meta-item">
                <strong>Monnaie:</strong> {country.currency} {country.currency_code ? `(${country.currency_code})` : ''}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Ajout du convertisseur de devise */}
      {country.currency && exchangeRates && (
        <div className="currency-converter-section">
          <h2>Convertisseur de devise</h2>
          <CurrencyConverter 
            countryCurrency={countryCurrency}
            countryName={country.name}
            rates={exchangeRates}
          />
        </div>
      )}
      
      <div className="cities-section">
        <div className="cities-header">
          <h2>Villes</h2>
        </div>
        
        <div className="cities-grid">
          {country.cities && country.cities.length > 0 ? (
            country.cities.map((city) => (
              <div key={city.id} className="city-card-wrapper">
                <CityCard
                  name={city.name}
                  slug={city.slug}
                  countrySlug={slug}
                  imagePath={city.image_path}
                />
              </div>
            ))
          ) : (
            <div className="no-cities">
              <p>Aucune ville n'a été ajoutée pour ce pays.</p>
              {isAuthenticated && (
                <p>Cliquez sur le bouton + ci-dessous pour ajouter une ville.</p>
              )}
            </div>
          )}
        </div>
        
        {isAuthenticated && (
          <Link href={`/countries/${slug}/add-city`} className="button-circle" title="Ajouter une ville">
            +
          </Link>
        )}
      </div>
      
      <style jsx>{`
        .country-details-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 40px;
          font-family: 'Montserrat', Arial, sans-serif;
          color: var(--text);
          margin-top: 80px;
        }
        
        .country-banner {
          height: 300px;
          background-size: cover;
          background-position: center;
          border-radius: 10px;
          margin-bottom: 30px;
          position: relative;
          overflow: hidden;
        }
        
        .banner-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
          padding: 20px;
          display: flex;
          align-items: flex-end;
          height: 100%;
        }
        
        .banner-overlay h1 {
          color: white;
          margin: 0;
          font-size: 2.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        
        .country-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        h1 {
          color: var(--text-dark);
          font-size: 2.2rem;
          margin: 0 0 20px 0;
        }
        
        .header-actions {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin: 0;
          padding: 0;
          height: 38px;
          min-height: 38px;
        }
        
        .spacer {
          flex-grow: 1;
        }
        
        .action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          border-radius: 5px;
          font-weight: bold;
          transition: background-color 0.3s ease;
          font-size: 0.9rem;
          height: 36px;
          min-height: 36px;
          max-height: 36px;
          white-space: nowrap;
          box-sizing: border-box;
          margin: 0;
          line-height: 1;
          border: none;
          vertical-align: middle;
          text-align: center;
          text-decoration: none;
          font-family: 'Montserrat', Arial, sans-serif;
        }
        
        button.action-button {
          cursor: pointer;
          outline: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding-top: 0;
          padding-bottom: 0;
          height: 38px;
          min-height: 38px;
          max-height: 38px;
          font-size: 1rem;
        }
        
        a.action-button {
          position: relative;
          top: 0;
          padding: 6px 16px;
        }
        
        .back-button {
          background-color: var(--primary);
          color: white;
        }
        
        .back-button:hover {
          background-color: var(--primary-dark);
        }
        
        .delete-button {
          background-color: #e74c3c;
          color: white;
          cursor: pointer;
        }
        
        .delete-button:hover {
          background-color: #c0392b;
        }
        
        .country-info {
          background-color: var(--card-bg);
          border-radius: 10px;
          padding: 30px;
          margin-bottom: 40px;
          box-shadow: var(--card-shadow);
        }
        
        .country-description h2 {
          color: var(--text-dark);
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1.5rem;
        }
        
        .country-description p {
          color: var(--text);
          line-height: 1.6;
          margin-bottom: 25px;
        }
        
        .country-meta {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
          background-color: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }
        
        .meta-item {
          font-size: 1rem;
          color: var(--text);
        }
        
        .meta-item strong {
          color: var(--text-dark);
          margin-right: 5px;
        }
        
        /* Styles pour la section convertisseur de devise */
        .currency-converter-section {
          margin-bottom: 40px;
          background-color: var(--card-bg);
          border-radius: 10px;
          padding: 30px;
          box-shadow: var(--card-shadow);
        }
        
        .currency-converter-section h2 {
          color: var(--text-dark);
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }
        
        .cities-section {
          margin-top: 40px;
        }
        
        .cities-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .cities-header h2 {
          color: var(--text-dark);
          margin: 0;
          font-size: 1.8rem;
        }
        
        .cities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }
        
        .city-card-wrapper {
          width: 100%;
        }
        
        .no-cities {
          background-color: var(--card-bg);
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          color: var(--text-light);
          grid-column: 1 / -1;
        }
        
        .button-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: var(--primary);
          color: var(--white);
          border-radius: 50%;
          cursor: pointer;
          font-size: 24px;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(33, 150, 243, 0.4);
          margin: 30px auto;
          text-decoration: none;
        }
        
        .button-circle:hover {
          background: var(--primary-dark);
          transform: translateY(-3px);
          box-shadow: 0 6px 14px rgba(33, 150, 243, 0.5);
        }
        
        @media (max-width: 768px) {
          .cities-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
          
          .header-actions {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .back-button, .delete-button {
            white-space: nowrap;
          }
          
          .spacer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
} 