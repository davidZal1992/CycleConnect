// Configuration constants for the application

// Note: In a production app, you should use environment variables and secure storage
// for sensitive information like API keys. This is just for demo purposes.

export const Config = {
  // API endpoints
  API_BASE_URL: 'http://localhost:8080', // Your backend server
  
  // Places API proxy endpoints
  placesProxyAutocomplete: 'https://a9a3-85-65-219-57.ngrok-free.app/places-proxy/autocomplete',
  placesProxyDetails: 'https://a9a3-85-65-219-57.ngrok-free.app/places-proxy/details',
  
  // IMPORTANT: REPLACE WITH YOUR ACTUAL GOOGLE MAPS API KEY
  // The key must have Places API enabled in your Google Cloud Console
  GOOGLE_MAPS_API_KEY: 'AIzaXXXXXXXXXXXXXXXXXXXXXXX', // Replace with your real key
  
  // API Settings
  USE_DIRECT_GOOGLE_API: true, // Set to true to bypass the proxy and use direct Google API calls
  
  // Default location (Tel Aviv)
  DEFAULT_LOCATION: {
    latitude: 32.0853,
    longitude: 34.7818,
  },
  
  // App settings
  DEFAULT_LANGUAGE: 'he',
  DEFAULT_COUNTRY: 'il',
};

export default Config; 