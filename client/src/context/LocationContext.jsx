import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [currentCity, setCurrentCity] = useState('Hyderabad');
  const [selectedLocality, setSelectedLocality] = useState('Madhapur');
  const [coordinates, setCoordinates] = useState({ lat: 17.4480, lng: 78.3910 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    // Fetch available cities
    api.get('/discovery/cities').then((res) => {
      if (res.data.success) {
        setCities(res.data.cities);
      }
    }).catch((err) => console.error('Failed to load cities:', err));
  }, []);

  const detectGPSLocation = () => {
    setIsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setCurrentCity('Hyderabad');
          setSelectedLocality('GPS Detected Locality');
          setIsDetecting(false);
          setIsModalOpen(false);
        },
        (error) => {
          console.warn('GPS detection denied or failed:', error.message);
          setIsDetecting(false);
          // Keep default Hyderabad / Madhapur
        },
        { timeout: 6000 }
      );
    } else {
      setIsDetecting(false);
    }
  };

  const selectCityAndLocality = (city, locality, coords) => {
    setCurrentCity(city);
    setSelectedLocality(locality);
    if (coords) {
      setCoordinates(coords);
    }
    setIsModalOpen(false);
  };

  return (
    <LocationContext.Provider
      value={{
        cities,
        currentCity,
        selectedLocality,
        coordinates,
        isModalOpen,
        isDetecting,
        setIsModalOpen,
        detectGPSLocation,
        selectCityAndLocality,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

