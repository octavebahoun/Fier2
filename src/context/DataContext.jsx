import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState({}); // indexed by countryId
  const [branches, setBranches] = useState({}); // indexed by universityId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pré-chargement récursif et en cascade au montage du composant racine
  const preloadMetadata = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Récupération des Pays
      const countryRes = await api.org.getCountries();
      if (!countryRes.success) {
        throw new Error(countryRes.message || "Impossible de charger la liste des pays.");
      }
      
      const countriesList = countryRes.data || [];
      setCountries(countriesList);

      const tempUniversities = {};
      const tempBranches = {};

      // 2. Récupération des Universités en parallèle pour chaque pays
      await Promise.all(
        countriesList.map(async (country) => {
          try {
            const uniRes = await api.org.getUniversities(country.id);
            if (uniRes.success) {
              const uniList = uniRes.data || [];
              tempUniversities[country.id] = uniList;

              // 3. Récupération des Branches pour chaque université en parallèle
              await Promise.all(
                uniList.map(async (uni) => {
                  try {
                    const branchRes = await api.org.getBranches(uni.id);
                    if (branchRes.success) {
                      tempBranches[uni.id] = branchRes.data || [];
                    }
                  } catch (err) {
                    console.error(`[DataContext] Échec du chargement des branches pour l'université ${uni.id}:`, err);
                  }
                })
              );
            }
          } catch (err) {
            console.error(`[DataContext] Échec du chargement des universités pour le pays ${country.id}:`, err);
          }
        })
      );

      setUniversities(tempUniversities);
      setBranches(tempBranches);
    } catch (err) {
      console.error("[DataContext] Échec global du pré-chargement des métadonnées :", err);
      setError(err.message || "Erreur de connexion réseau lors de l'initialisation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    preloadMetadata();
  }, []);

  // API de sélection et de requête instantanée
  const getUniversitiesByCountry = (countryId) => {
    if (!countryId) return [];
    return universities[countryId] || [];
  };

  const getBranchesByUniversity = (universityId) => {
    if (!universityId) return [];
    return branches[universityId] || [];
  };

  const value = {
    countries,
    universities,
    branches,
    loading,
    error,
    getUniversitiesByCountry,
    getBranchesByUniversity,
    refreshMetadata: preloadMetadata
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData doit être utilisé au sein d'un DataProvider.");
  }
  return context;
};

export default DataContext;
