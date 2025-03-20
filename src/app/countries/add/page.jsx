'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCheck from '@/app/components/AuthCheck';

export default function AddCountry() {
  const router = useRouter();
  
  // États pour le formulaire
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countryData, setCountryData] = useState(null);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Récupération de la liste des pays lors du chargement du composant
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
        
        if (!response.ok) {
          throw new Error('Impossible de récupérer la liste des pays');
        }
        
        const data = await response.json();
        
        // Trier les pays par nom en français ou par défaut en anglais
        const sortedCountries = data.sort((a, b) => {
          const nameA = a.name.translations?.fra?.common || a.name.common;
          const nameB = b.name.translations?.fra?.common || b.name.common;
          return nameA.localeCompare(nameB);
        });
        
        // Formater les données pour le menu déroulant
        const formattedCountries = sortedCountries.map(country => ({
          name: country.name.translations?.fra?.common || country.name.common,
          code: country.cca2,
          flag: country.flags.svg
        }));
        
        setCountries(formattedCountries);
        setIsLoadingCountries(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des pays:', error);
        setErrors(prev => ({ ...prev, api: 'Impossible de charger la liste des pays' }));
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);
  
  // Création d'un slug depuis un nom
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };
  
  // Récupération des données d'un pays
  const fetchCountryData = async (countryCode) => {
    try {
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      
      if (!response.ok) {
        throw new Error('Impossible de récupérer les données du pays');
      }
      
      const data = await response.json();
      return data[0]; // L'API retourne un tableau, nous prenons le premier élément
    } catch (error) {
      console.error('Erreur lors de la récupération des données du pays:', error);
      throw error;
    }
  };
  
  // Formatage des langues parlées dans le pays
  const formatLanguages = (languages) => {
    if (!languages) return null;
    return Object.values(languages).join(', ');
  };
  
  // Formatage de la devise du pays
  const formatCurrency = (currencies) => {
    if (!currencies) return { name: null, code: null };
    
    const currencyCode = Object.keys(currencies)[0];
    const currency = currencies[currencyCode];
    
    return {
      name: currency.name,
      code: currencyCode
    };
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCountry) {
      setErrors(prev => ({ ...prev, country: 'Veuillez sélectionner un pays' }));
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      // Récupérer les données complètes du pays
      const countryDetails = await fetchCountryData(selectedCountry);
      setCountryData(countryDetails);
      
      // Le nom du pays en français ou par défaut en anglais
      const countryName = countryDetails.name.translations?.fra?.common || countryDetails.name.common;
      const countrySlug = createSlug(countryName);
      
      // Préparer les données pour l'insertion dans la base de données
      const currencyInfo = formatCurrency(countryDetails.currencies);
      
      const countryData = {
        name: countryName,
        slug: countrySlug,
        country_code: countryDetails.cca2,
        description: `${countryName} est un pays situé en ${countryDetails.region}${countryDetails.subregion ? `, plus précisément en ${countryDetails.subregion}` : ''}.`,
        language: formatLanguages(countryDetails.languages),
        population: countryDetails.population?.toString() || null,
        area: countryDetails.area?.toString() || null,
        capital: countryDetails.capital?.[0] || null,
        currency: currencyInfo.name,
        currency_code: currencyInfo.code,
        flag_image: countryDetails.flags.svg,
        image_path: countryDetails.flags.svg
      };
      
      // Envoyer les données au serveur
      const response = await fetch('/api/countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(countryData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du pays');
      }
      
      setSuccessMessage(`Le pays ${countryName} a été ajouté avec succès !`);
      
      // Rediriger vers la page du pays après un court délai
      setTimeout(() => {
        router.push(`/countries/${countrySlug}`);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la création du pays:', error);
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Afficher l'aperçu des données du pays sélectionné
  const handlePreview = async () => {
    if (!selectedCountry) return;
    
    try {
      setIsSubmitting(true);
      setErrors({});
      
      // Récupérer les données complètes du pays
      const countryDetails = await fetchCountryData(selectedCountry);
      setCountryData(countryDetails);
      
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'aperçu:', error);
      setErrors(prev => ({ ...prev, preview: 'Impossible de charger l\'aperçu' }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AuthCheck>
      <div className="add-country-container">
        <div className="page-header">
          <h1>Ajouter un pays</h1>
          <Link href="/countries" className="back-button">
            Retour à la liste des pays
          </Link>
        </div>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="country">Sélectionnez un pays *</label>
              <select
                id="country"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setCountryData(null);
                }}
                className={errors.country ? 'error' : ''}
                disabled={isLoadingCountries || isSubmitting}
              >
                <option value="">-- Choisir un pays --</option>
                {isLoadingCountries ? (
                  <option value="" disabled>Chargement des pays...</option>
                ) : (
                  countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))
                )}
              </select>
              {errors.country && <div className="error-message">{errors.country}</div>}
              {errors.api && <div className="error-message">{errors.api}</div>}
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="preview-button"
                onClick={handlePreview}
                disabled={isLoadingCountries || isSubmitting || !selectedCountry}
              >
                Aperçu
              </button>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoadingCountries || isSubmitting || !selectedCountry}
              >
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter le pays'}
              </button>
            </div>
            
            {errors.submit && (
              <div className="error-message submit-error">
                {errors.submit}
              </div>
            )}
          </form>
        </div>
        
        {countryData && (
          <div className="country-preview">
            <h2>Aperçu du pays</h2>
            
            <div className="preview-content">
              <div className="preview-flag">
                <img 
                  src={countryData.flags.svg} 
                  alt={`Drapeau de ${countryData.name.translations?.fra?.common || countryData.name.common}`}
                />
              </div>
              
              <div className="preview-info">
                <h3>{countryData.name.translations?.fra?.common || countryData.name.common}</h3>
                
                <div className="preview-meta">
                  {countryData.capital && (
                    <div className="meta-item">
                      <strong>Capitale:</strong> {countryData.capital[0]}
                    </div>
                  )}
                  
                  {countryData.population && (
                    <div className="meta-item">
                      <strong>Population:</strong> {countryData.population.toLocaleString()} habitants
                    </div>
                  )}
                  
                  {countryData.area && (
                    <div className="meta-item">
                      <strong>Superficie:</strong> {countryData.area.toLocaleString()} km²
                    </div>
                  )}
                  
                  {countryData.languages && (
                    <div className="meta-item">
                      <strong>Langue(s):</strong> {formatLanguages(countryData.languages)}
                    </div>
                  )}
                  
                  {countryData.currencies && (
                    <div className="meta-item">
                      <strong>Devise:</strong> {Object.values(countryData.currencies).map(c => 
                        `${c.name} (${c.symbol || '-'})`
                      ).join(', ')}
                    </div>
                  )}
                  
                  <div className="meta-item">
                    <strong>Région:</strong> {countryData.region}{countryData.subregion ? `, ${countryData.subregion}` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <style jsx>{`
          .add-country-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
          }
          
          h1 {
            color: #2c3e50;
            font-size: 1.8rem;
            margin: 0;
          }
          
          .back-button {
            display: inline-block;
            background-color: #7f8c8d;
            color: white;
            padding: 8px 16px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            transition: background-color 0.3s ease;
          }
          
          .back-button:hover {
            background-color: #6c7a7d;
          }
          
          .success-message {
            background-color: #2ecc71;
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
          }
          
          .form-container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #2c3e50;
          }
          
          select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
          }
          
          select:focus {
            border-color: #3498db;
            outline: none;
          }
          
          select.error {
            border-color: #e74c3c;
          }
          
          .error-message {
            color: #e74c3c;
            margin-top: 5px;
            font-size: 0.9rem;
          }
          
          .submit-error {
            background-color: #fce4e4;
            border: 1px solid #e74c3c;
            padding: 10px;
            border-radius: 5px;
            margin-top: 15px;
          }
          
          .form-actions {
            display: flex;
            justify-content: space-between;
            gap: 15px;
          }
          
          .preview-button {
            flex: 1;
            padding: 10px;
            background-color: #95a5a6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s ease;
          }
          
          .preview-button:hover:not(:disabled) {
            background-color: #7f8c8d;
          }
          
          .submit-button {
            flex: 2;
            padding: 10px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s ease;
          }
          
          .submit-button:hover:not(:disabled) {
            background-color: #2980b9;
          }
          
          .preview-button:disabled,
          .submit-button:disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
          }
          
          .country-preview {
            background-color: #fff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          
          .country-preview h2 {
            color: #2c3e50;
            margin-top: 0;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          
          .preview-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          
          @media (min-width: 768px) {
            .preview-content {
              flex-direction: row;
            }
            
            .preview-flag {
              width: 30%;
            }
            
            .preview-info {
              width: 70%;
            }
          }
          
          .preview-flag img {
            width: 100%;
            border: 1px solid #eee;
            border-radius: 5px;
          }
          
          .preview-info h3 {
            color: #2c3e50;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 1.5rem;
          }
          
          .preview-meta {
            display: grid;
            gap: 10px;
          }
          
          .meta-item {
            font-size: 1rem;
            color: #34495e;
          }
          
          .meta-item strong {
            color: #2c3e50;
          }
        `}</style>
      </div>
    </AuthCheck>
  );
} 