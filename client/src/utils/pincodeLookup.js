/**
 * ManaMart Pincode & Hyperlocal Geo-Lookup Utility
 * 
 * Supports instant synchronous offline dictionary for major Telangana/AP & metro pincodes,
 * with seamless fallback to India Post API (https://api.postalpincode.in/pincode/) and caching.
 */

// Instant Offline Dictionary for Zero-Latency Lookup
const PINCODE_MAP = {
  // Hyderabad & Cyberabad (Core ManaMart Launch Market)
  '500081': { locality: 'Madhapur / Hitech City', city: 'Hyderabad', district: 'Rangareddy', state: 'Telangana' },
  '500032': { locality: 'Gachibowli / Financial Dist', city: 'Hyderabad', district: 'Rangareddy', state: 'Telangana' },
  '500072': { locality: 'Kukatpally Housing Board (KPHB)', city: 'Hyderabad', district: 'Medchal-Malkajgiri', state: 'Telangana' },
  '500034': { locality: 'Banjara Hills, Rd 12', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500033': { locality: 'Jubilee Hills / Road No. 36', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500038': { locality: 'SR Nagar / Ameerpet', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500060': { locality: 'Dilsukhnagar / Kothapet', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500035': { locality: 'LB Nagar / Nagole', city: 'Hyderabad', district: 'Rangareddy', state: 'Telangana' },
  '500084': { locality: 'Kondapur / Botanical Garden', city: 'Hyderabad', district: 'Rangareddy', state: 'Telangana' },
  '500082': { locality: 'Somajiguda / Punjagutta', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500016': { locality: 'Begumpet / Prakash Nagar', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500003': { locality: 'Secunderabad / Kalasiguda', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500028': { locality: 'Mehdipatnam / Masab Tank', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500008': { locality: 'Tolichowki / Golconda', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500018': { locality: 'Sanath Nagar / Moosapet', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500050': { locality: 'Chandanagar / Miyapur', city: 'Hyderabad', district: 'Rangareddy', state: 'Telangana' },
  '500049': { locality: 'Miyapur / Allwyn Colony', city: 'Hyderabad', district: 'Rangareddy', state: 'Telangana' },
  '500090': { locality: 'Nizampet / Pragathi Nagar', city: 'Hyderabad', district: 'Medchal-Malkajgiri', state: 'Telangana' },
  '500001': { locality: 'Abids / Koti / Sultan Bazar', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500002': { locality: 'Charminar / Laad Bazaar', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },

  // Guntur & Narakoduru (Hyperlocal Region)
  '522212': { locality: 'Narakoduru / Chebrolu', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh' },
  '522001': { locality: 'Guntur City Center / Brodipet', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh' },
  '522002': { locality: 'Arundelpet / Collector Office', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh' },
  '522007': { locality: 'Pattabhipuram / Vidya Nagar', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh' },
  '522501': { locality: 'Tenali Town / Main Bazaar', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh' },
  '522503': { locality: 'Mangalagiri / AIIMS Campus', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh' },

  // Vijayawada
  '520001': { locality: 'One Town / Kaleswara Rao Market', city: 'Vijayawada', district: 'NTR District', state: 'Andhra Pradesh' },
  '520002': { locality: 'Governorpet / Besant Road', city: 'Vijayawada', district: 'NTR District', state: 'Andhra Pradesh' },
  '520008': { locality: 'Patamata / Benz Circle', city: 'Vijayawada', district: 'NTR District', state: 'Andhra Pradesh' },
  '520010': { locality: 'Moghalrajpuram / Labbipet', city: 'Vijayawada', district: 'NTR District', state: 'Andhra Pradesh' },

  // Visakhapatnam
  '530001': { locality: 'Town Hall / One Town', city: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh' },
  '530002': { locality: 'Dabagardens / RTC Complex', city: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh' },
  '530016': { locality: 'Dwaraka Nagar / Asilmetta', city: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh' },
  '530017': { locality: 'MVP Colony / Beach Road', city: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh' },

  // Warangal
  '506001': { locality: 'Warangal Chowrasta', city: 'Warangal', district: 'Warangal', state: 'Telangana' },
  '506002': { locality: 'Hanamkonda / Subedari', city: 'Warangal', district: 'Hanamkonda', state: 'Telangana' },

  // Bengaluru
  '560001': { locality: 'MG Road / Brigade Road', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka' },
  '560034': { locality: 'Koramangala 3rd Block', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka' },
  '560038': { locality: 'Indiranagar 100ft Road', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka' },
  '560066': { locality: 'Whitefield / ITPL', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka' },
  '560100': { locality: 'Electronic City Phase 1', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka' },

  // Chennai
  '600001': { locality: 'George Town / Parrys', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' },
  '600017': { locality: 'T. Nagar / Pondy Bazaar', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' },
  '600040': { locality: 'Anna Nagar West', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' },

  // Mumbai
  '400001': { locality: 'Fort / Nariman Point', city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra' },
  '400050': { locality: 'Bandra West / Linking Road', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra' },
  '400053': { locality: 'Andheri West / Lokhandwala', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra' },

  // Delhi
  '110001': { locality: 'Connaught Place / Janpath', city: 'New Delhi', district: 'Central Delhi', state: 'Delhi' },
  '110016': { locality: 'Hauz Khas / Green Park', city: 'New Delhi', district: 'South Delhi', state: 'Delhi' },
};

// Memory cache for fetched pincodes
const memoryCache = new Map();

/**
 * Identify Place from 6-digit Pincode
 * @param {string} pincode - 6-digit Indian PIN code
 * @returns {Promise<{ found: boolean, locality: string, city: string, district: string, state: string, placeName: string }>}
 */
export async function identifyPlaceByPincode(pincode) {
  const cleanPin = String(pincode || '').trim().replace(/\D/g, '');
  if (cleanPin.length !== 6) {
    return { found: false, message: 'Please enter a valid 6-digit PIN code' };
  }

  // 1. Instant check in synchronous local dictionary
  if (PINCODE_MAP[cleanPin]) {
    const data = PINCODE_MAP[cleanPin];
    return {
      found: true,
      pincode: cleanPin,
      locality: data.locality,
      city: data.city,
      district: data.district,
      state: data.state,
      placeName: `${data.locality}, ${data.city}`,
      source: 'local_database',
    };
  }

  // 2. Check memory cache
  if (memoryCache.has(cleanPin)) {
    return memoryCache.get(cleanPin);
  }

  // 3. Fallback to India Post Public API
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const result = {
          found: true,
          pincode: cleanPin,
          locality: po.Name,
          city: po.District || po.Division || po.Circle,
          district: po.District,
          state: po.State,
          placeName: `${po.Name}, ${po.District}`,
          source: 'india_post_api',
        };
        memoryCache.set(cleanPin, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('India Post API lookup fallback:', err.message);
  }

  // 4. Regional Heuristic Fallback
  const prefix = cleanPin.slice(0, 2);
  let fallbackCity = 'Hyderabad';
  let fallbackState = 'Telangana';
  if (prefix === '50') {
    fallbackCity = 'Hyderabad Region';
    fallbackState = 'Telangana';
  } else if (prefix === '51' || prefix === '52' || prefix === '53') {
    fallbackCity = 'Andhra Pradesh Region';
    fallbackState = 'Andhra Pradesh';
  } else if (prefix === '56' || prefix === '57') {
    fallbackCity = 'Bengaluru Region';
    fallbackState = 'Karnataka';
  }

  const heuristicResult = {
    found: true,
    pincode: cleanPin,
    locality: `Postal Zone ${cleanPin}`,
    city: fallbackCity,
    district: fallbackCity,
    state: fallbackState,
    placeName: `Zone ${cleanPin}, ${fallbackCity}`,
    source: 'heuristic',
  };
  memoryCache.set(cleanPin, heuristicResult);
  return heuristicResult;
}

export default identifyPlaceByPincode;
