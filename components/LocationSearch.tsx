import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Define the props interface
interface LocationSearchProps {
  placeholder?: string;
  onLocationSelect: (data: {
    description: string;
    location: {
      latitude: number;
      longitude: number;
    } | null;
  }) => void;
}

// Define the ref interface
export interface LocationSearchRef {
  clear: () => void;
}

// Interface for place prediction item
interface PlacePrediction {
  description: string;
  placeId: string;
  mainText?: string;
  secondaryText?: string;
}

// Get API URLs from environment or use defaults
// In a real app, you would use a secure storage method for the API key
const PROXY_URL = Constants.expoConfig?.extra?.proxyUrl || 'http://localhost:3000/places-proxy/autocomplete';

// We'll also add a direct API URL option for fallback
const DIRECT_API_URL = 'https://places.googleapis.com/v1/places:autocomplete';
// Never directly include API keys in client code in a production app
// Use a server-side proxy like we've implemented
const GOOGLE_API_KEY = ''; // Empty string as we're using the proxy

// Fallback mock data in case the server is unavailable
const FALLBACK_LOCATIONS = [
  { description: 'תל אביב, ישראל', placeId: 'tel-aviv', mainText: 'תל אביב', secondaryText: 'ישראל' },
  { description: 'ירושלים, ישראל', placeId: 'jerusalem', mainText: 'ירושלים', secondaryText: 'ישראל' },
  { description: 'חיפה, ישראל', placeId: 'haifa', mainText: 'חיפה', secondaryText: 'ישראל' },
  { description: 'באר שבע, ישראל', placeId: 'beer-sheva', mainText: 'באר שבע', secondaryText: 'ישראל' },
  { description: 'אילת, ישראל', placeId: 'eilat', mainText: 'אילת', secondaryText: 'ישראל' },
  { description: 'נתניה, ישראל', placeId: 'netanya', mainText: 'נתניה', secondaryText: 'ישראל' },
  { description: 'פארק הירקון, תל אביב', placeId: 'yarkon-park', mainText: 'פארק הירקון', secondaryText: 'תל אביב' },
];

// Fallback coordinate mapping for mock locations
const FALLBACK_COORDINATES = {
  'tel-aviv': { latitude: 32.0853, longitude: 34.7818 },
  'jerusalem': { latitude: 31.7683, longitude: 35.2137 },
  'haifa': { latitude: 32.7940, longitude: 34.9896 },
  'beer-sheva': { latitude: 31.2530, longitude: 34.7915 },
  'eilat': { latitude: 29.5577, longitude: 34.9519 },
  'netanya': { latitude: 32.3328, longitude: 34.8599 },
  'yarkon-park': { latitude: 32.0990, longitude: 34.8146 },
};

const LocationSearch = forwardRef<LocationSearchRef, LocationSearchProps>(
  ({ placeholder = 'חיפוש מיקום...', onLocationSelect }, ref) => {
    const [searchText, setSearchText] = useState('');
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [useLocalSearch, setUseLocalSearch] = useState(false);
    const inputRef = useRef<TextInput>(null);
    
    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      clear: () => {
        setSearchText('');
        setPredictions([]);
        setShowResults(false);
        if (inputRef.current) {
          inputRef.current.clear();
        }
      }
    }));
    
    // Function to search via proxy server
    const searchPlaces = async (query: string) => {
      if (!query || query.length < 2) {
        setPredictions([]);
        setShowResults(false);
        return;
      }
      
      setLoading(true);
      setShowResults(true);
      
      // If we're already in local search mode, just use that
      if (useLocalSearch) {
        console.log('Using local search (already set)');
        filterLocalPlaces(query);
        return;
      }
      
      // Format request params for GET to proxy
      const requestParams = {
        input: query
      };
      
      // Format request body for direct API call (exact format from Postman)
      const directApiBody = {
        input: query,
        languageCode: "iw"
      };
      
      try {
        // First approach: Try the proxy server
        console.log('Attempting proxy request to:', PROXY_URL);
        let response;
        
        try {
          response = await axios.get(PROXY_URL, { params: requestParams });
          console.log('Proxy response successful:', response.status);
        } catch (error: any) {
          console.log('Proxy request failed:', error.message || 'Unknown error');
          console.log('Attempting direct API request as fallback...');
          
          // Second approach: Try direct API access with exact format from Postman
          try {
            response = await axios.post(DIRECT_API_URL, directApiBody, {
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_API_KEY
              }
            });
            console.log('Direct API request successful:', response.status);
          } catch (error: any) {
            console.log('Direct API request failed:', error.message || 'Unknown error');
            throw new Error('Both proxy and direct API requests failed');
          }
        }
        
        // Process the response if we got one from either approach
        if (response?.data?.suggestions) {
          const formattedResults = response.data.suggestions.map((suggestion: any) => {
            const prediction = suggestion.placePrediction;
            return {
              description: prediction.text?.text || '',
              placeId: prediction.placeId,
              mainText: prediction.structuredFormat?.mainText?.text || prediction.text?.text || '',
              secondaryText: prediction.structuredFormat?.secondaryText?.text || ''
            };
          });
          
          console.log(`Found ${formattedResults.length} results`);
          setPredictions(formattedResults);
        } else if (response?.data?.places) {
          // In case we get direct API response in a different format
          const formattedResults = response.data.places.map((place: any) => ({
            description: place.displayName?.text || '',
            placeId: place.id,
            mainText: place.displayName?.text || '',
            secondaryText: place.formattedAddress || ''
          }));
          
          console.log(`Found ${formattedResults.length} results`);
          setPredictions(formattedResults);
        } else {
          console.log('No results found or unexpected response format');
          console.log('Response data:', JSON.stringify(response?.data).slice(0, 200) + '...');
          throw new Error('No results found or unexpected response format');
        }
      } catch (error) {
        console.error('All API approaches failed, falling back to local search:', error);
        setUseLocalSearch(true);
        filterLocalPlaces(query);
      } finally {
        setLoading(false);
      }
    };
    
    // Local search fallback
    const filterLocalPlaces = (query: string) => {
      const results = FALLBACK_LOCATIONS.filter(location => 
        location.description.toLowerCase().includes(query.toLowerCase()) ||
        (location.mainText && location.mainText.toLowerCase().includes(query.toLowerCase())) ||
        (location.secondaryText && location.secondaryText.toLowerCase().includes(query.toLowerCase()))
      );
      
      setPredictions(results);
      setLoading(false);
    };
    
    // Handle place selection and fetch coordinates
    const handleSelectPlace = async (place: PlacePrediction) => {
      console.log('Selected place:', place);
      
      try {
        let location = null;
        
        // First check if we have fallback coordinates for quick selection
        if (FALLBACK_COORDINATES[place.placeId as keyof typeof FALLBACK_COORDINATES]) {
          location = FALLBACK_COORDINATES[place.placeId as keyof typeof FALLBACK_COORDINATES];
          console.log('Using fallback coordinates for', place.placeId, location);
        } else if (place.placeId) {
          // For Google Place IDs, fetch the coordinates using our proxy
          try {
            console.log('Fetching place details for place_id:', place.placeId);
            
            // Use our new place details endpoint
            const placeDetailsUrl = `${Constants.expoConfig?.extra?.proxyUrl.replace('autocomplete', 'place-details')}?place_id=${place.placeId}`;
            const response = await axios.get(placeDetailsUrl);
            
            if (response.data?.result?.geometry?.location) {
              // Extract location data from the response
              const locationData = response.data.result.geometry.location;
              location = {
                latitude: locationData.latitude || locationData.lat,
                longitude: locationData.longitude || locationData.lng
              };
              console.log('Successfully fetched coordinates:', location);
            } else {
              console.log('Place details response did not contain location data', response.data);
              throw new Error('No location data in response');
            }
          } catch (error) {
            console.error('Error fetching place details:', error);
            // Fall back to approximate coordinates for Israel if API fails
            location = {
              latitude: 31.5 + (Math.random() * 2 - 1),
              longitude: 34.8 + (Math.random() * 2 - 1)
            };
            console.log('Using fallback random coordinates in Israel:', location);
          }
        } else {
          // Last resort fallback
          location = {
            latitude: 31.5 + (Math.random() * 2 - 1),
            longitude: 34.8 + (Math.random() * 2 - 1)
          };
          console.log('No place ID available, using random coordinates:', location);
        }
        
        onLocationSelect({
          description: place.description,
          location
        });
        
        // Clear the search after selection
        setShowResults(false);
        setPredictions([]);
      } catch (error) {
        console.error('Error in handleSelectPlace:', error);
        onLocationSelect({
          description: place.description,
          location: null
        });
      }
    };
    
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor={Colors.light.text + "99"}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              searchPlaces(text);
            }}
            textAlign="right"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => {
              if (searchText) setShowResults(true);
            }}
          />
          <View style={styles.iconContainer}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.light.primary} />
            ) : (
              <Ionicons name="search" size={18} color={Colors.light.text + "99"} />
            )}
          </View>
        </View>
        
        {showResults && predictions.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.placeId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectPlace(item)}
                >
                  <Text style={styles.mainText}>
                    {item.mainText || item.description.split(',')[0]}
                  </Text>
                  {item.secondaryText && (
                    <Text style={styles.secondaryText}>
                      {item.secondaryText}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={styles.list}
            />
            {useLocalSearch && (
              <View style={styles.fallbackNotice}>
                <Text style={styles.fallbackText}>
                  חיפוש מקומי (ללא חיבור לשרת)
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    height: 40,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    height: 38,
    fontSize: 16,
    color: Colors.light.text,
    paddingRight: 30,
    paddingLeft: 10,
    textAlign: 'right',
    direction: 'rtl',
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginTop: 5,
    borderWidth: 1,
    borderColor: Colors.light.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    maxHeight: 200,
    zIndex: 999,
  },
  list: {
    width: '100%',
  },
  resultItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mainText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'right',
  },
  secondaryText: {
    fontSize: 12,
    color: Colors.light.text + '99',
    textAlign: 'right',
    marginTop: 2,
  },
  fallbackNotice: {
    padding: 8,
    backgroundColor: '#FFF9C4',
    borderTopWidth: 1,
    borderTopColor: '#FFF176',
  },
  fallbackText: {
    fontSize: 12,
    color: '#616161',
    textAlign: 'center',
  },
});

export default LocationSearch; 