/**
 * Google Places API Proxy Server
 * 
 * This server proxies requests to the Google Places API to avoid CORS and
 * App Transport Security issues in React Native. It forwards requests to
 * the Google Places API and returns the responses.
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Configuration
const app = express();
const port = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const PLACES_API_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const PLACE_DETAILS_API_URL = 'https://places.googleapis.com/v1/places/';

// Verify the API key is available
if (!GOOGLE_API_KEY) {
  console.error('ERROR: Google API Key not found in environment variables.');
  console.error('Please create a .env file with GOOGLE_API_KEY=your_api_key');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Google Places API Proxy Server is running');
});

/**
 * Proxy endpoint for Google Places API autocomplete
 * 
 * This endpoint forwards requests to the Google Places API autocomplete
 * endpoint and returns the responses. It adds the API key to the request
 * headers so it doesn't need to be exposed in the client code.
 */
app.get('/places-proxy/autocomplete', async (req, res) => {
  try {
    // Format exactly as per working Postman request
    const requestBody = {
      input: req.query.input,
      languageCode: "iw"
    };

    // Log the request for debugging
    console.log('Request to Places API (GET):', JSON.stringify(requestBody, null, 2));
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': '[API_KEY_HIDDEN]'
    });
    console.log('API URL:', PLACES_API_URL);

    const response = await axios({
      method: 'post',
      url: PLACES_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY
      },
      data: requestBody
    });
    
    console.log('Response status:', response.status);
    console.log('Response data (sample):', JSON.stringify(response.data).substring(0, 300) + '...');
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data));
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'An error occurred while proxying the request' });
    }
  }
});

// Keeping the POST endpoint for backward compatibility
app.post('/places-proxy/autocomplete', async (req, res) => {
  try {
    // Format exactly as per working Postman request
    const requestBody = {
      input: req.body.input,
      languageCode: "iw"
    };

    // Log the request for debugging
    console.log('Request to Places API (POST):', JSON.stringify(requestBody, null, 2));
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': '[API_KEY_HIDDEN]'
    });
    console.log('API URL:', PLACES_API_URL);

    const response = await axios({
      method: 'post',
      url: PLACES_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY
      },
      data: requestBody
    });
    
    console.log('Response status:', response.status);
    console.log('Response data (sample):', JSON.stringify(response.data).substring(0, 300) + '...');
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data));
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'An error occurred while proxying the request' });
    }
  }
});

/**
 * Proxy endpoint for Google Place Details API (using Places API v1)
 * 
 * This endpoint fetches detailed information about a place by its place_id.
 * It uses the new Places API v1 format.
 */
app.get('/places-proxy/place-details', async (req, res) => {
  try {
    // Get place_id from request query
    const placeId = req.query.place_id;
    
    if (!placeId) {
      return res.status(400).json({ error: 'place_id parameter is required' });
    }
    
    // Log request (hiding API key)
    console.log('Place Details request for place_id:', placeId);
    
    // Make the request to the Places API v1
    const response = await axios({
      method: 'get',
      url: `${PLACE_DETAILS_API_URL}${placeId}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'displayName,formattedAddress,location'
      }
    });
    
    console.log('Place Details response status:', response.status);
    console.log('Place Details response data (sample):', 
      JSON.stringify(response.data).substring(0, 300) + '...');
    
    // Format the response to match the structure expected by the client
    const formattedResponse = {
      result: {
        name: response.data.displayName?.text || '',
        formatted_address: response.data.formattedAddress || '',
        geometry: {
          location: response.data.location || { lat: 0, lng: 0 }
        }
      },
      status: "OK"
    };
    
    // Return the formatted response
    res.json(formattedResponse);
    
  } catch (error) {
    console.error('Place Details Proxy Error:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data));
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'An error occurred while fetching place details' });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});