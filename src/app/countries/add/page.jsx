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
            font-family: 'Montserrat', Arial, sans-serif;
            color: var(--text);
            margin-top: 80px;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          h1 {
            color: var(--text-dark);
            font-size: 1.8rem;
            margin: 0;
          }
          
          .back-button {
            display: inline-block;
            background-color: var(--primary);
            color: white;
            padding: 6px 16px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
          }
          
          .back-button:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
          }
          
          .success-message {
            background-color: rgba(46, 204, 113, 0.2);
            color: #2ecc71;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
            border: 1px solid rgba(46, 204, 113, 0.4);
          }
          
          .form-container {
            background-color: var(--card-bg);
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: var(--card-shadow);
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: var(--text-dark);
          }
          
          select {
            width: 100%;
            padding: 12px;
            background-color: var(--input-bg, rgba(255, 255, 255, 0.05));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            font-size: 1rem;
            color: var(--text);
            transition: all 0.3s ease;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6' fill='rgba(255,255,255,0.5)' viewBox='0 0 12 6'%3E%3Cpath d='M0 0l6 6 6-6z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 12px;
            padding-right: 30px;
            -webkit-appearance: none;
            -moz-appearance: none;
          }
          
          select option {
            background-color: var(--card-bg, #1e1e2e);
            color: var(--text);
            padding: 10px;
          }
          
          select::-ms-expand {
            display: none;
          }
          
          /* Styles pour Firefox */
          select:-moz-focusring { 
            color: transparent;
            text-shadow: 0 0 0 var(--text);
          }
          
          /* Styles pour assurer que l'option sélectionnée est bien visible dans le thème sombre */
          select option:checked,
          select option:hover,
          select option:focus {
            background-color: var(--primary);
            color: white;
          }
          
          select:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
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
            background-color: rgba(231, 76, 60, 0.2);
            border: 1px solid rgba(231, 76, 60, 0.4);
            color: #e74c3c;
            padding: 10px;
            border-radius: 8px;
            margin-top: 15px;
            text-align: center;
            font-weight: bold;
          }
          
          .form-actions {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            margin-top: 30px;
          }
          
          .preview-button {
            flex: 1;
            padding: 12px;
            background-color: rgba(149, 165, 166, 0.8);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .preview-button:hover:not(:disabled) {
            background-color: rgba(127, 140, 141, 1);
            transform: translateY(-2px);
            box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
          }
          
          .submit-button {
            flex: 2;
            background: linear-gradient(to right, var(--primary), var(--primary-dark));
            color: white;
            border: none;
            padding: 14px;
            border-radius: 30px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 10px rgba(33, 150, 243, 0.3);
          }
          
          .submit-button:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(33, 150, 243, 0.4);
          }
          
          .preview-button:disabled,
          .submit-button:disabled {
            background: linear-gradient(to right, #95a5a6, #7f8c8d);
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          .country-preview {
            background-color: var(--card-bg);
            border-radius: 10px;
            padding: 25px;
            box-shadow: var(--card-shadow);
          }
          
          .country-preview h2 {
            color: var(--text-dark);
            margin-top: 0;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
          }
          
          .preview-info h3 {
            color: var(--text-dark);
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 1.5rem;
          }
          
          .preview-meta {
            display: grid;
            gap: 15px;
            background-color: rgba(0, 0, 0, 0.2);
            padding: 20px;
            border-radius: 8px;
          }
          
          .meta-item {
            font-size: 1rem;
            color: var(--text);
          }
          
          .meta-item strong {
            color: var(--text-dark);
            margin-right: 5px;
          }
          
          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 15px;
            }
            
            .form-container, .country-preview {
              padding: 20px;
            }
            
            .form-actions {
              flex-direction: column;
            }
            
            .preview-button, .submit-button {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </AuthCheck>
  );
} 