import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LocationContext = createContext(null);

// Preset coordinates for major cities and localities
export const CITY_PRESETS = {
  Hyderabad: {
    lat: 17.3850,
    lng: 78.4867,
    pincodes: ['500081', '500032', '500034', '500033', '500072', '500003', '500060', '500084', '500090'],
    localities: {
      Madhapur: { lat: 17.4480, lng: 78.3910, pincode: '500081' },
      'Banjara Hills': { lat: 17.4156, lng: 78.4357, pincode: '500034' },
      Gachibowli: { lat: 17.4401, lng: 78.3489, pincode: '500032' },
      Kukatpally: { lat: 17.4948, lng: 78.3996, pincode: '500072' },
      Secunderabad: { lat: 17.4399, lng: 78.4983, pincode: '500003' },
      Dilsukhnagar: { lat: 17.3688, lng: 78.5247, pincode: '500060' },
      'Jubilee Hills': { lat: 17.4319, lng: 78.4073, pincode: '500033' },
      Kondapur: { lat: 17.4699, lng: 78.3578, pincode: '500084' },
      Miyapur: { lat: 17.4968, lng: 78.3614, pincode: '500049' },
    },
  },
  Vijayawada: {
    lat: 16.5062,
    lng: 80.6480,
    pincodes: ['520010', '520002', '520001', '520007', '520008'],
    localities: {
      'Benz Circle': { lat: 16.5003, lng: 80.6515, pincode: '520010' },
      'MG Road': { lat: 16.5085, lng: 80.6402, pincode: '520002' },
      Governorpet: { lat: 16.5165, lng: 80.6288, pincode: '520001' },
      Patamata: { lat: 16.4942, lng: 80.6653, pincode: '520007' },
      Kanuru: { lat: 16.4851, lng: 80.6971, pincode: '520008' },
    },
  },
  Visakhapatnam: {
    lat: 17.6868,
    lng: 83.2185,
    pincodes: ['530003', '530017', '530002', '530026'],
    localities: {
      Siripuram: { lat: 17.7212, lng: 83.3155, pincode: '530003' },
      'MVP Colony': { lat: 17.7423, lng: 83.3371, pincode: '530017' },
      Jagadamba: { lat: 17.7121, lng: 83.3005, pincode: '530002' },
      Gajuwaka: { lat: 17.6896, lng: 83.2084, pincode: '530026' },
    },
  },
  Warangal: {
    lat: 17.9689,
    lng: 79.5941,
    pincodes: ['506001', '506004', '506002'],
    localities: {
      Hanamkonda: { lat: 18.0135, lng: 79.5603, pincode: '506001' },
      Kazipet: { lat: 17.9818, lng: 79.5218, pincode: '506004' },
      Subedari: { lat: 18.0068, lng: 79.5638, pincode: '506001' },
      'Warangal Fort': { lat: 17.9554, lng: 79.6231, pincode: '506002' },
    },
  },
  Tirupati: {
    lat: 13.6288,
    lng: 79.4192,
    pincodes: ['517501', '517507'],
    localities: {
      Alipiri: { lat: 13.6543, lng: 79.3995, pincode: '517507' },
      'Bhavani Nagar': { lat: 13.6350, lng: 79.4210, pincode: '517501' },
      'KT Road': { lat: 13.6315, lng: 79.4260, pincode: '517501' },
      Chandragiri: { lat: 13.5855, lng: 79.3142, pincode: '517101' },
    },
  },
};

// Distance calculation between 2 coordinates (Haversine formula in KM)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
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

  // Saved Addresses Collection (Home, Work, Other)
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem('manamart_saved_addresses');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'addr-1',
        tag: 'Home',
        flatNo: 'Flat 402, Sri Sai Towers',
        street: '100 Feet Road, Ayyappa Society',
        landmark: 'Opposite Meridian School',
        locality: 'Madhapur',
        city: 'Hyderabad',
        pincode: '500081',
        phone: '9876543210',
        instructions: 'Leave at front door. Ring bell once.',
        isDefault: true,
        lat: 17.4480,
        lng: 78.3910,
      },
      {
        id: 'addr-2',
        tag: 'Work',
        flatNo: 'Building 12B, 4th Floor',
        street: 'Mindspace Cyberabad IT Park',
        landmark: 'Near Inorbit Mall Gate 2',
        locality: 'Madhapur',
        city: 'Hyderabad',
        pincode: '500081',
        phone: '9876543210',
        instructions: 'Hand over to reception desk / security.',
        isDefault: false,
        lat: 17.4412,
        lng: 78.3814,
      },
    ];
  });

  // Currently active selected address
  const [activeAddress, setActiveAddress] = useState(() => {
    return savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'manamart_location',
        JSON.stringify({ currentCity, selectedLocality, coordinates })
      );
    } catch (e) {
      console.warn('Failed to save location:', e);
    }
  }, [currentCity, selectedLocality, coordinates]);

  useEffect(() => {
    try {
      localStorage.setItem('manamart_saved_addresses', JSON.stringify(savedAddresses));
    } catch (e) {}
  }, [savedAddresses]);

  useEffect(() => {
    api
      .get('/discovery/cities')
      .then((res) => {
        if (res.data.success && res.data.cities) {
          setCities(res.data.cities);
        }
      })
      .catch(() => {});
  }, []);

  // Check serviceability of an area or pincode
  const checkServiceability = (query) => {
    if (!query) return { serviceable: false, reason: 'Empty location specified' };
    const clean = query.trim().toLowerCase();

    // Check against all supported localities across cities
    for (const [cityName, cityData] of Object.entries(CITY_PRESETS)) {
      if (clean.includes(cityName.toLowerCase())) {
        return { serviceable: true, city: cityName, locality: Object.keys(cityData.localities)[0] };
      }
      for (const [locName, locData] of Object.entries(cityData.localities)) {
        if (clean.includes(locName.toLowerCase()) || clean.includes(locData.pincode)) {
          return { serviceable: true, city: cityName, locality: locName, coords: locData };
        }
      }
    }

    return {
      serviceable: false,
      query,
      reason: `ManaMart hyperlocal service is currently active across Hyderabad, Vijayawada, Visakhapatnam, Warangal, and Tirupati. We are actively expanding to new pin codes!`,
    };
  };

  const addSavedAddress = (address) => {
    const newAddr = {
      ...address,
      id: `addr-${Date.now()}`,
      isDefault: savedAddresses.length === 0,
    };
    setSavedAddresses((prev) => [...prev, newAddr]);
    if (newAddr.isDefault) {
      setActiveAddress(newAddr);
      setSelectedLocality(newAddr.locality);
      setCurrentCity(newAddr.city);
    }
    return newAddr;
  };

  const updateSavedAddress = (id, updatedFields) => {
    setSavedAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? { ...addr, ...updatedFields } : addr))
    );
    if (activeAddress?.id === id) {
      setActiveAddress((prev) => ({ ...prev, ...updatedFields }));
    }
  };

  const deleteSavedAddress = (id) => {
    setSavedAddresses((prev) => {
      const remaining = prev.filter((addr) => addr.id !== id);
      if (activeAddress?.id === id && remaining.length > 0) {
        setActiveAddress(remaining[0]);
      }
      return remaining;
    });
  };

  const setDefaultAddress = (id) => {
    setSavedAddresses((prev) =>
      prev.map((addr) => ({ ...addr, isDefault: addr.id === id }))
    );
    const target = savedAddresses.find((a) => a.id === id);
    if (target) {
      setActiveAddress({ ...target, isDefault: true });
      setSelectedLocality(target.locality);
      setCurrentCity(target.city);
      if (target.lat && target.lng) {
        setCoordinates({ lat: target.lat, lng: target.lng });
      }
    }
  };

  // Real GPS Location Detection with Distance Matching & Reverse Geocoding
  const detectGPSLocation = () => {
    setIsDetecting(true);

    if (!('geolocation' in navigator)) {
      alert('Geolocation sensor is not supported by your browser. Please select your area manually.');
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
        } catch (err) {}

        // 2. Fallback to closest preset
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
        console.warn('Geolocation sensor error/denial:', error);
        setIsDetecting(false);
        // Do not force GPS, keep default city gracefully
      },
      { timeout: 7000 }
    );
  };

  const selectCityAndLocality = (cityName, localityName, coords) => {
    setCurrentCity(cityName);
    setSelectedLocality(localityName);
    if (coords) {
      setCoordinates(coords);
    } else if (CITY_PRESETS[cityName]?.localities[localityName]) {
      setCoordinates(CITY_PRESETS[cityName].localities[localityName]);
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
        savedAddresses,
        activeAddress,
        setIsModalOpen,
        detectGPSLocation,
        selectCityAndLocality,
        checkServiceability,
        addSavedAddress,
        updateSavedAddress,
        deleteSavedAddress,
        setDefaultAddress,
        setActiveAddress,
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
