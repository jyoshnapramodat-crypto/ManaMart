// Utility for calculating Haversine distance, travel duration, and delivery fees

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 2.5; // default fallback 2.5 km
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

export function estimateDeliveryTime(distanceKm, prepTimeMins = 15) {
  // Assume avg city speed of 20 km/h -> 3 mins per km + preparation time
  const travelTime = Math.ceil(distanceKm * 3.5);
  const totalTime = prepTimeMins + travelTime;
  return {
    minTime: Math.max(10, totalTime - 5),
    maxTime: totalTime + 5,
    formatted: `${Math.max(10, totalTime - 5)}-${totalTime + 5} mins`,
  };
}

export function calculateDeliveryFee(distanceKm) {
  const baseFare = 25; // Base fee for up to 2 km
  if (distanceKm <= 2) return baseFare;
  const extraKm = distanceKm - 2;
  const extraFare = Math.ceil(extraKm * 10); // ₹10 per additional km
  return baseFare + extraFare;
}

