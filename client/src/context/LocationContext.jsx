import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LocationContext = createContext(null);

// Preset coordinates for major cities and localities
const CITY_PRESETS = {
  Hyderabad: {
    lat: 17.3850,
    lng: 78.4867,
    localities: {
      Madhapur: { lat: 17.4480, lng: 78.3910 },
      'Banjara Hills': { lat: 17.4156, lng: 78.4357 },
      Gachibowli: { lat: 17.4401, lng: 78.3489 },
      Kukatpally: { lat: 17.4948, lng: 78.3996 },
      Secunderabad: { lat: 17.4399, lng: 78.4983 },
      Dilsukhnagar: { lat: 17.3688, lng: 78.5247 },
      'Jubilee Hills': { lat: 17.4319, lng: 78.4073 },
    },
  },
  Vijayawada: {
    lat: 16.5062,
    lng: 80.6480,
    localities: {
      'Benz Circle': { lat: 16.5003, lng: 80.6515 },
      'MG Road': { lat: 16.5085, lng: 80.6402 },
      Governorpet: { lat: 16.5165, lng: 80.6288 },
      Patamata: { lat: 16.4942, lng: 80.6653 },
      Kanuru: { lat: 16.4851, lng: 80.6971 },
    },
  },
  Visakhapatnam: {
    lat: 17.6868,
    lng: 83.2185,
    localities: {
      Siripuram: { lat: 17.7212, lng: 83.3155 },
      'MVP Colony': { lat: 17.7423, lng: 83.3371 },
      Jagadamba: { lat: 17.7121, lng: 83.3005 },
      Gajuwaka: { lat: 17.6896, lng: 83.2084 },
    },
  },
  Warangal: {
    lat: 17.9689,
    lng: 79.5941,
    localities: {
      Hanamkonda: { lat: 18.0135, lng: 79.5603 },
      Kazipet: { lat: 17.9818, lng: 79.5218 },
      Subedari: { lat: 18.0068, lng: 79.5638 },
      'Warangal Fort': { lat: 17.9554, lng: 79.6231 },
    },
  },
  Tirupati: {
    lat: 13.6288,
    lng: 79.4192,
    localities: {
      Alipiri: { lat: 13.6543, lng: 79.3995 },
      'Bhavani Nagar': { lat: 13.6350, lng: 79.4210 },
      'KT Road': { lat: 13.6315, lng: 79.4260 },
      Chandragiri: { lat: 13.5855, lng: 79.3142 },
    },
  },
};

// Distance calculation between 2 coordinates (Haversine formula in KM)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function LocationProvider({ children }) {
  // Load saved location from localStorage if available
  const [savedLoc] = useState(() => {
    try {
      const stored = localStorage.getItem('manamart_location');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [cities, setCities] = useState([]);
  const [currentCity, setCurrentCity] = useState(savedLoc?.currentCity || 'Hyderabad');
  const [selectedLocality, setSelectedLocality] = useState(savedLoc?.selectedLocality || 'Madhapur');
  const [coordinates, setCoordinates] = useState(
    savedLoc?.coordinates || { lat: 17.4480, lng: 78.3910 }
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Sync to localStorage whenever location changes
  useEffect(() => {
    try {
      localStorage.setItem(
        'manamart_location',
        JSON.stringify({ currentCity, selectedLocality, coordinates })
      );
    } catch (e) {
      console.warn('Failed to save location to localStorage:', e);
    }
  }, [currentCity, selectedLocality, coordinates]);

  useEffect(() => {
    api
      .get('/discovery/cities')
      .then((res) => {
        if (res.data.success) {
          setCities(res.data.cities);
        }
      })
      .catch((err) => console.error('Failed to load cities:', err));
  }, []);

  // Real GPS Location Detection with Distance Matching & Reverse Geocoding
  const detectGPSLocation = () => {
    setIsDetecting(true);

    if (!('geolocation' in navigator)) {
      alert('Geolocation sensor is not supported by your browser.');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        // 1. Try reverse geocoding via OpenStreetMap Nominatim
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const localityFound =
              address.suburb ||
              address.neighbourhood ||
              address.residential ||
              address.village ||
              address.town;
            const cityFound =
              address.city || address.state_district || address.county;

            if (localityFound) setSelectedLocality(localityFound);
            if (cityFound) setCurrentCity(cityFound);

            setIsDetecting(false);
            setIsModalOpen(false);
            return;
          }
        } catch (err) {
          // Fallback to closest preset city
        }

        // 2. Intelligent Distance-Based Closest Preset Match
        let closestCity = 'Hyderabad';
        let minCityDist = Infinity;

        Object.keys(CITY_PRESETS).forEach((cityName) => {
          const cityData = CITY_PRESETS[cityName];
          const dist = calculateDistanceKm(latitude, longitude, cityData.lat, cityData.lng);
          if (dist < minCityDist) {
            minCityDist = dist;
            closestCity = cityName;
          }
        });

        // Find closest locality inside that city
        let closestLocality = 'Madhapur';
        let minLocDist = Infinity;
        const localities = CITY_PRESETS[closestCity]?.localities || {};

        Object.keys(localities).forEach((locName) => {
          const locCoords = localities[locName];
          const dist = calculateDistanceKm(latitude, longitude, locCoords.lat, locCoords.lng);
          if (dist < minLocDist) {
            minLocDist = dist;
            closestLocality = locName;
          }
        });

        setCurrentCity(closestCity);
        setSelectedLocality(closestLocality);
        setIsDetecting(false);
        setIsModalOpen(false);
      },
      (error) => {
        console.warn('GPS detection denied or timed out:', error.message);
        setIsDetecting(false);
        // Default to Madhapur, Hyderabad if permission denied
        setCurrentCity('Hyderabad');
        setSelectedLocality('Madhapur');
        setCoordinates({ lat: 17.4480, lng: 78.3910 });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const selectCityAndLocality = (city, locality, coords) => {
    setCurrentCity(city);
    setSelectedLocality(locality);

    // Look up accurate coordinates for the selected locality
    const presetCoords = CITY_PRESETS[city]?.localities?.[locality];
    if (presetCoords) {
      setCoordinates(presetCoords);
    } else if (coords) {
      setCoordinates(coords);
    } else if (CITY_PRESETS[city]) {
      setCoordinates({ lat: CITY_PRESETS[city].lat, lng: CITY_PRESETS[city].lng });
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
