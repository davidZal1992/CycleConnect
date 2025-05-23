/**
 * Location and Distance Utility Functions
 * 
 * This file contains utility functions for:
 * - Calculating distance between two coordinates
 * - Converting between different coordinate formats
 * - Filtering locations based on distance
 */

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  // Convert latitude and longitude from degrees to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLon1 = (Math.PI * lon1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const radLon2 = (Math.PI * lon2) / 180;

  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Earth radius in kilometers
  const earthRadius = 6371;
  const distance = earthRadius * c;
  
  return distance;
};

/**
 * Calculate distance between two location objects
 * @param location1 First location object with latitude and longitude
 * @param location2 Second location object with latitude and longitude
 * @returns Distance in kilometers
 */
export const calculateDistanceBetweenLocations = (
  location1: { latitude: number; longitude: number } | null,
  location2: { latitude: number; longitude: number } | null
): number => {
  if (!location1 || !location2) {
    return Infinity; // Return a large value if locations are not valid
  }
  
  return calculateDistance(
    location1.latitude,
    location1.longitude,
    location2.latitude,
    location2.longitude
  );
};

/**
 * Filter rides based on distance from user
 * @param rides Array of ride objects
 * @param userLocation User's current location
 * @param maxDistance Maximum distance in kilometers
 * @returns Filtered array of rides within the specified distance
 */
export const filterRidesByDistance = (
  rides: any[], 
  userLocation: { latitude: number; longitude: number } | null,
  maxDistance: number
): any[] => {
  if (!userLocation) {
    return rides; // Return all rides if user location is not available
  }
  
  return rides.filter(ride => {
    if (!ride.coordinates) return false;
    
    const distance = calculateDistanceBetweenLocations(userLocation, ride.coordinates);
    return distance <= maxDistance;
  });
};

/**
 * Format distance to a human-readable string
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    // Convert to meters for distances less than 1km
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    // Show one decimal place for distances less than 10km
    return `${distance.toFixed(1)}km`;
  } else {
    // Round to nearest km for larger distances
    return `${Math.round(distance)}km`;
  }
};

export default {
  calculateDistance,
  calculateDistanceBetweenLocations,
  filterRidesByDistance,
  formatDistance,
}; 