import { LocationSearchRef } from '@/components/LocationSearch';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Config } from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import { mockRides } from '@/data/mock-rides';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Constants from 'expo-constants';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppStateContext } from './_layout';

// Get proxy URL from environment variables
const PROXY_URL = Constants.expoConfig?.extra?.proxyUrl || 'http://localhost:3000/places-proxy/autocomplete';

// Define allowed filter categories for type safety
type FilterCategory = 'type' | 'difficulty' | 'technical' | 'speed' | 'bikeType';

// Define interface for search result items
interface SearchResultItem {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
  coordinates?: { latitude: number; longitude: number };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionTitle: {
    marginBottom: 12,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    backgroundColor: Colors.light.inputBg,
  },
  inputWrapperError: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  inputIcon: {
    padding: 10,
  },
  textAreaIcon: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    textAlign: 'right',
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  // Location styling
  locationContainer: {
    position: 'relative',
  },
  locationLoadingIcon: {
    position: 'absolute',
    right: 40,
  },
  locationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    justifyContent: 'flex-end',
  },
  locationStatusText: {
    fontSize: 14,
    color: Colors.light.text,
    marginRight: 6,
  },
  locationErrorText: {
    color: '#e74c3c',
  },
  // Participants styling
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsIcon: {
    marginRight: 12,
  },
  participantsOptions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  participantOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  participantOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  participantText: {
    fontSize: 14,
    fontWeight: '500',
  },
  participantTextSelected: {
    color: 'white',
  },
  // Tags styling
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    minWidth: 80,
    alignItems: 'center',
  },
  filterTagError: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  filterTagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagIcon: {
    marginLeft: 8,
  },
  filterTagSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterTagText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  filterTagTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  // Google Places styles
  googlePlacesContainer: {
    marginBottom: 10,
  },
  placesContainer: {
    flex: 0,
    width: '100%',
  },
  placesInput: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    backgroundColor: Colors.light.inputBg,
    color: Colors.light.text,
    fontSize: 14,
    paddingHorizontal: 15,
    textAlign: 'right',
  },
  placesListView: {
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placesRow: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
  },
  suggestionsDropdown: {
    backgroundColor: '#fff',
    borderColor: Colors.light.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    zIndex: 999,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  suggestionText: {
    fontSize: 15,
    color: Colors.light.text,
    textAlign: 'right',
  },
  suggestionSubtext: {
    fontSize: 13,
    color: Colors.light.text + '80',
    textAlign: 'right',
    marginTop: 2,
  },
  testButton: {
    backgroundColor: Colors.light.secondary || '#4a6fa5',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  testButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  customSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  suggestionsScroll: {
    maxHeight: 180,
  },
  // Distance slider styles
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  distanceValue: {
    fontSize: 14,
    color: Colors.light.text,
    minWidth: 30,
    textAlign: 'center',
  },
  // Added style for hidden location search
  hiddenLocationSearch: {
    marginTop: 10,
    zIndex: 999,
  },
  characterCount: {
    fontSize: 14,
    color: Colors.light.text + '80',
    marginLeft: 10,
  },
  requiredFieldIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
});

export default function PostRideScreen() {
  const { isAppReady } = useContext(AppStateContext);
  const { user, userProfile } = useAuth();
  const { editMode, rideId } = useLocalSearchParams<{ editMode?: string; rideId?: string }>();
  const isEditMode = editMode === 'true';

  // Refs
  const searchRef = useRef<LocationSearchRef>(null);
  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  // States for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [locationStatus, setLocationStatus] = useState<'none' | 'loading' | 'error' | 'success'>('none');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState(10);
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [filters, setFilters] = useState({
    type: 'road',
    difficulty: 'medium',
    technical: 'none',
    speed: 'medium',
    bikeType: 'analog'
  });
  
  // Date and time picker visibility
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  
  // Loading state for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation error states
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  
  // Effect to load ride data if in edit mode
  useEffect(() => {
    if (isEditMode && rideId) {
      // Find the ride in mock data
      const rideToEdit = mockRides.find(r => r.id === rideId);
      
      if (rideToEdit) {
        // Populate the form with ride data
        setTitle(rideToEdit.title);
        setDescription(rideToEdit.description || '');
        setLocation(rideToEdit.location);
        setLocationInput(rideToEdit.location);
        
        if (rideToEdit.coordinates) {
          setLocationCoords(rideToEdit.coordinates);
          setLocationStatus('success');
        }
        
        // Parse date and time
        const dateObj = new Date();
        const [day, month, year] = rideToEdit.date.split('/').map(Number);
        dateObj.setFullYear(2000 + year, month - 1, day);
        setDate(dateObj);
        
        const timeObj = new Date();
        const [hours, minutes] = rideToEdit.time.split(':').map(Number);
        timeObj.setHours(hours, minutes);
        setTime(timeObj);
        
        setDistance(rideToEdit.distance);
        setMaxParticipants(rideToEdit.maxParticipants || 8);
        
        // Set participants based on participantsCount
        if (rideToEdit.participantsCount) {
          const count = rideToEdit.participantsCount;
          setParticipants(count >= 5 ? "5+" : count.toString());
        }
        
        // Set filter values
        const rideType = rideToEdit.rideType || 'road';
        const difficulty = rideToEdit.difficultyLevel || 'medium';
        const technical = rideToEdit.technicalLevel || 'none';
        const speed = rideToEdit.speedLevel || 'medium';
        const bikeTypeValue = rideToEdit.bikeType || 'analog';
        
        // Update all filter states
        setSelectedTypes([rideType]);
        setSelectedDifficulties([difficulty]);
        setSelectedTechnicalLevels([technical]);
        setSelectedSpeeds([speed]);
        setBikeType(bikeTypeValue);
        
        // Set filters object for submission
        setFilters({
          type: rideType,
          difficulty: difficulty,
          technical: technical,
          speed: speed,
          bikeType: bikeTypeValue
        });
      }
    }
  }, [isEditMode, rideId]);
  
  // Ride details
  const [locationInput, setLocationInput] = useState('');
  const [participants, setParticipants] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTechnicalLevels, setSelectedTechnicalLevels] = useState<string[]>([]);
  const [selectedSpeeds, setSelectedSpeeds] = useState<string[]>([]);
  const [bikeType, setBikeType] = useState<string>('analog'); // Default to analog
  
  // Simple location search state
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [validLocationSelected, setValidLocationSelected] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for LocationSearch component
  const locationSearchRef = useRef<LocationSearchRef>(null);
  const locationInputRef = useRef<TextInput>(null);
  
  // Handle outside press
  const handleOutsidePress = () => {
    Keyboard.dismiss();
    if (showResults) {
      setShowResults(false);
      
      // If dropdown is closed without selecting a valid item, clear the input
      if (!validLocationSelected && locationInput !== location) {
        setLocationInput('');
      }
    }
  };
  
  // Handle location selection from the autocomplete
  const handleLocationSelect = (data: { description: string; location: { latitude: number; longitude: number } | null }) => {
    setLocation(data.description);
    setLocationInput(data.description);
    setLocationCoords(data.location);
    setLocationStatus(data.location ? 'success' : 'error');
    setValidLocationSelected(true);
    Keyboard.dismiss();
    setShowResults(false);
  };
  
  // Date picker handlers
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  
  const handleConfirmDate = (date: Date) => {
    setDate(date);
    hideDatePicker();
  };
  
  // Time picker handlers
  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };
  
  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };
  
  const handleConfirmTime = (time: Date) => {
    setTime(time);
    hideTimePicker();
  };
  
  // Filter toggling function
  const toggleFilter = (category: FilterCategory, value: string) => {
    switch(category) {
      case 'type':
        // For type selection, replace previous selection
        const newTypes = selectedTypes.includes(value) ? 
          selectedTypes.filter(item => item !== value) : 
          [value]; // Only one type can be selected
        setSelectedTypes(newTypes);
        setFilters(prev => ({...prev, type: newTypes[0] || prev.type}));
        break;
      case 'difficulty':
        // For difficulty selection, replace previous selection
        const newDifficulties = selectedDifficulties.includes(value) ? 
          selectedDifficulties.filter(item => item !== value) : 
          [value]; // Only one difficulty can be selected
        setSelectedDifficulties(newDifficulties);
        setFilters(prev => ({...prev, difficulty: newDifficulties[0] || prev.difficulty}));
        break;
      case 'technical':
        // For technical selection, replace previous selection
        const newTechnical = selectedTechnicalLevels.includes(value) ? 
          selectedTechnicalLevels.filter(item => item !== value) : 
          [value]; // Only one technical level can be selected
        setSelectedTechnicalLevels(newTechnical);
        setFilters(prev => ({...prev, technical: newTechnical[0] || prev.technical}));
        break;
      case 'speed':
        // For speed selection, replace previous selection
        const newSpeeds = selectedSpeeds.includes(value) ? 
          selectedSpeeds.filter(item => item !== value) : 
          [value]; // Only one speed can be selected
        setSelectedSpeeds(newSpeeds);
        setFilters(prev => ({...prev, speed: newSpeeds[0] || prev.speed}));
        break;
      case 'bikeType':
        setBikeType(value);
        setFilters(prev => ({...prev, bikeType: value}));
        break;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Reset previous validation errors
    setValidationErrors({});
    
    // Comprehensive form validation with visual indicators
    const errors: {[key: string]: boolean} = {};
    let firstErrorField: string | null = null;
    
    if (!title.trim()) {
      errors.title = true;
      if (!firstErrorField) firstErrorField = 'title';
    }
    
    if (!description.trim()) {
      errors.description = true;
      if (!firstErrorField) firstErrorField = 'description';
    } else if (description.trim().length < 10) {
      errors.description = true;
      if (!firstErrorField) firstErrorField = 'description';
    }
    
    if (!location || !locationCoords) {
      errors.location = true;
      if (!firstErrorField) firstErrorField = 'location';
    }
    
    if (!date) {
      errors.date = true;
      if (!firstErrorField) firstErrorField = 'date';
    }
    
    if (!time) {
      errors.time = true;
      if (!firstErrorField) firstErrorField = 'time';
    }
    
    if (selectedTypes.length === 0) {
      errors.rideType = true;
      if (!firstErrorField) firstErrorField = 'rideType';
    }
    
    if (selectedDifficulties.length === 0) {
      errors.difficulty = true;
      if (!firstErrorField) firstErrorField = 'difficulty';
    }
    
    if (selectedTechnicalLevels.length === 0) {
      errors.technical = true;
      if (!firstErrorField) firstErrorField = 'technical';
    }
    
    if (selectedSpeeds.length === 0) {
      errors.speed = true;
      if (!firstErrorField) firstErrorField = 'speed';
    }
    
    if (!bikeType) {
      errors.bikeType = true;
      if (!firstErrorField) firstErrorField = 'bikeType';
    }
    
    if (distance < 1) {
      errors.distance = true;
      if (!firstErrorField) firstErrorField = 'distance';
    }
    
    if (maxParticipants < 2) {
      errors.participants = true;
      if (!firstErrorField) firstErrorField = 'participants';
    }
    
    // If there are validation errors, set them and focus the first error field
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Focus the first error field
      setTimeout(() => {
        if (firstErrorField === 'title' && titleRef.current) {
          titleRef.current.focus();
        } else if (firstErrorField === 'description' && descriptionRef.current) {
          descriptionRef.current.focus();
        } else if (firstErrorField === 'location' && locationInputRef.current) {
          locationInputRef.current.focus();
        }
      }, 100);
      
      return;
    }
    
    // Start submission
    setIsSubmitting(true);
    
    try {
      // Format the ride data to match your backend DTO
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      const formattedTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      
      const rideData = {
        title: title.trim(),
        description: description.trim(),
        location,
        coordinates: {
          latitude: locationCoords!.latitude,
          longitude: locationCoords!.longitude
        },
        date: formattedDate,
        time: formattedTime,
        distance,
        maxParticipants,
        rideType: selectedTypes[0],
        difficultyLevel: selectedDifficulties[0],
        technicalLevel: selectedTechnicalLevels[0],
        speedLevel: selectedSpeeds[0],
        bikeType: bikeType,
        organizerId: user?.uid || 'current-user', // Use Firebase uid
        organizerName: userProfile?.fullName || user?.displayName || 'רוכב חדש', // Use profile fullName first
        organizerPhone: userProfile?.phoneNumber || '',
        organizerAvatar: userProfile?.profileImage || user?.photoURL || ''
      };
      
      console.log('🔥 PostRide - Submitting ride data:', rideData);
      
      const API_BASE_URL = `${Config.API_BASE_URL}/api/v1/rides`;
      
      let response;
      if (isEditMode && rideId) {
        // Update existing ride
        response = await fetch(`${API_BASE_URL}/${rideId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rideData),
        });
      } else {
        // Create new ride
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rideData),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('🔥 PostRide - API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedRide = await response.json();
      console.log('🔥 PostRide - Ride saved successfully:', savedRide);
      
      // Navigate to home tab after successful creation/update
      if (isEditMode) {
        // If editing, go back to the previous screen
        router.back();
      } else {
        // If creating new ride, redirect to home tab
        router.replace('/(tabs)');
      }
      
    } catch (error) {
      console.error('🔥 PostRide - Error submitting ride:', error);
      Alert.alert(
        'שגיאה', 
        isEditMode 
          ? 'אירעה שגיאה בעדכון הרכיבה. אנא נסה שוב.' 
          : 'אירעה שגיאה ביצירת הרכיבה. אנא נסה שוב.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter tag component with icon support
  const FilterTag = ({ 
    label, 
    isSelected, 
    onPress,
    icon,
    hasError
  }: { 
    label: string, 
    isSelected: boolean, 
    onPress: () => void,
    icon?: React.ReactNode,
    hasError?: boolean
  }) => (
    <TouchableOpacity
      style={[
        styles.filterTag, 
        isSelected && styles.filterTagSelected,
        hasError && !isSelected && styles.filterTagError
      ]}
      onPress={onPress}
    >
      <View style={styles.filterTagContent}>
        {icon}
        <ThemedText style={[styles.filterTagText, isSelected && styles.filterTagTextSelected]}>
          {label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
  
  // Participant count selector
  const ParticipantOption = ({ 
    value, 
    isSelected, 
    onPress 
  }: { 
    value: string, 
    isSelected: boolean, 
    onPress: () => void 
  }) => (
    <TouchableOpacity
      style={[styles.participantOption, isSelected && styles.participantOptionSelected]}
      onPress={onPress}
    >
      <ThemedText style={[styles.participantText, isSelected && styles.participantTextSelected]}>
        {value}
      </ThemedText>
    </TouchableOpacity>
  );

  // Mock locations for testing
  const mockLocations = [
    {
      placeId: 'mock_1',
      description: 'פארק הירקון, תל אביב',
      mainText: 'פארק הירקון',
      secondaryText: 'תל אביב',
      coordinates: { latitude: 32.0993, longitude: 34.8148 }
    },
    {
      placeId: 'mock_2',
      description: 'יער בן שמן, מודיעין',
      mainText: 'יער בן שמן',
      secondaryText: 'מודיעין',
      coordinates: { latitude: 31.9361, longitude: 34.9574 }
    },
    {
      placeId: 'mock_3',
      description: 'הרי ירושלים, מבשרת ציון',
      mainText: 'הרי ירושלים',
      secondaryText: 'מבשרת ציון',
      coordinates: { latitude: 31.8018, longitude: 35.1149 }
    },
    {
      placeId: 'mock_4',
      description: 'טיילת תל אביב, נמל תל אביב',
      mainText: 'טיילת תל אביב',
      secondaryText: 'נמל תל אביב',
      coordinates: { latitude: 32.0872, longitude: 34.7731 }
    },
    {
      placeId: 'mock_5',
      description: 'פארק פרס, חולון',
      mainText: 'פארק פרס',
      secondaryText: 'חולון',
      coordinates: { latitude: 32.0123, longitude: 34.7799 }
    },
    {
      placeId: 'mock_6',
      description: 'שביל ישראל, כרמל',
      mainText: 'שביל ישראל',
      secondaryText: 'כרמל',
      coordinates: { latitude: 32.7767, longitude: 35.0231 }
    },
    {
      placeId: 'mock_7',
      description: 'עמק החולה, ירושלים',
      mainText: 'עמק החולה',
      secondaryText: 'ירושלים',
      coordinates: { latitude: 31.7857, longitude: 35.2007 }
    },
    {
      placeId: 'mock_8',
      description: 'פארק זכרון יעקב',
      mainText: 'פארק זכרון יעקב',
      secondaryText: 'זכרון יעקב',
      coordinates: { latitude: 32.5698, longitude: 34.9438 }
    },
    {
      placeId: 'mock_9',
      description: 'שמורת עין גדי',
      mainText: 'שמורת עין גדי',
      secondaryText: 'ים המלח',
      coordinates: { latitude: 31.4612, longitude: 35.3889 }
    },
    {
      placeId: 'mock_10',
      description: 'רמת הגולן, מצפה',
      mainText: 'רמת הגולן',
      secondaryText: 'מצפה',
      coordinates: { latitude: 32.9347, longitude: 35.6896 }
    },
    {
      placeId: 'mock_11',
      description: 'פארק אשכול, קרית גת',
      mainText: 'פארק אשכול',
      secondaryText: 'קרית גת',
      coordinates: { latitude: 31.6100, longitude: 34.7642 }
    },
    {
      placeId: 'mock_12',
      description: 'נחל אלכסנדר, נתניה',
      mainText: 'נחל אלכסנדר',
      secondaryText: 'נתניה',
      coordinates: { latitude: 32.3215, longitude: 34.8532 }
    }
  ];

  const searchLocation = async (text: string) => {
    if (!text) {
      setShowResults(false);
      return;
    }
    
    setLocationInput(text);
    setLocationStatus('loading');
    setValidLocationSelected(false);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        // Filter mock locations based on search text
        const filteredResults = mockLocations.filter(location => 
          location.description.includes(text) || 
          location.mainText.includes(text) ||
          location.secondaryText.includes(text)
        );
        
        if (filteredResults.length > 0) {
          setSearchResults(filteredResults);
          setShowResults(true);
          setLocationStatus('none');
        } else {
          // If no exact matches, show all locations for demo purposes
          setSearchResults(mockLocations.slice(0, 6)); // Show first 6 results
          setShowResults(true);
          setLocationStatus('none');
        }
      } catch (error) {
        console.error('Error in mock search:', error);
        setSearchResults([]);
        setShowResults(false);
        setLocationStatus('error');
      }
    }, 300); // Simulate network delay
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: isEditMode ? 'עריכת רכיבה' : 'יצירת רכיבה חדשה',
          headerBackTitle: 'חזרה',
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Ride Title */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.characterCount}>{title.length}/50</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>כותרת הרכיבה *</ThemedText>
              </View>
              <View style={[styles.inputWrapper, validationErrors.title && styles.inputWrapperError]}>
                <Ionicons name="bicycle" size={20} color={Colors.light.text + '80'} style={styles.inputIcon} />
                <TextInput
                  ref={titleRef}
                  style={styles.input}
                  placeholder="הזן כותרת לרכיבה..."
                  placeholderTextColor={Colors.light.text + '80'}
                  value={title}
                  onChangeText={(text) => {
                    // Limit title to 50 characters
                    if (text.length <= 50) {
                      setTitle(text);
                    }
                    // Clear validation error when user starts typing
                    if (validationErrors.title) {
                      setValidationErrors(prev => ({ ...prev, title: false }));
                    }
                  }}
                  maxLength={50}
                  textAlign="right"
                />
              </View>
            </View>
            
            {/* Ride Description */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.characterCount}>{description.length}/200</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>תיאור הרכיבה *</ThemedText>
              </View>
              <View style={[styles.inputWrapper, validationErrors.description && styles.inputWrapperError]}>
                <Ionicons name="document-text-outline" size={20} color={Colors.light.text + '80'} style={[styles.inputIcon, styles.textAreaIcon]} />
                <TextInput
                  ref={descriptionRef}
                  style={[styles.input, styles.textArea]}
                  placeholder="תאר/י את הרכיבה, נקודות עניין, דברים שחשוב לדעת..."
                  placeholderTextColor={Colors.light.text + '80'}
                  value={description}
                  onChangeText={(text) => {
                    // Limit description to 200 characters
                    if (text.length <= 200) {
                      setDescription(text);
                    }
                    // Clear validation error when user starts typing
                    if (validationErrors.description) {
                      setValidationErrors(prev => ({ ...prev, description: false }));
                    }
                  }}
                  maxLength={200}
                  multiline
                  numberOfLines={4}
                  textAlign="right"
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            {/* Date and Time */}
            <View style={styles.formSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>תאריך ושעה *</ThemedText>
              <View style={styles.rowInputs}>
                <TouchableOpacity 
                  style={styles.inputHalf}
                  onPress={() => {
                    showTimePicker();
                    // Clear validation error when user interacts
                    if (validationErrors.time) {
                      setValidationErrors(prev => ({ ...prev, time: false }));
                    }
                  }}
                >
                  <View style={[styles.inputWrapper, validationErrors.time && styles.inputWrapperError]}>
                    <Ionicons name="time-outline" size={20} color={Colors.light.text + '80'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="שעה"
                      placeholderTextColor={Colors.light.text + '80'}
                      value={time ? time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : ''}
                      editable={false}
                      textAlign="right"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.inputHalf}
                  onPress={() => {
                    showDatePicker();
                    // Clear validation error when user interacts
                    if (validationErrors.date) {
                      setValidationErrors(prev => ({ ...prev, date: false }));
                    }
                  }}
                >
                  <View style={[styles.inputWrapper, validationErrors.date && styles.inputWrapperError]}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.light.text + '80'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="תאריך"
                      placeholderTextColor={Colors.light.text + '80'}
                      value={date ? date.toLocaleDateString('he-IL') : ''}
                      editable={false}
                      textAlign="right"
                    />
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Date and Time Pickers */}
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
                minimumDate={new Date()}
                locale="he"
                confirmTextIOS="אישור"
                cancelTextIOS="ביטול"
                modalPropsIOS={{
                  presentationStyle: 'overFullScreen'
                }}
              />
              
              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleConfirmTime}
                onCancel={hideTimePicker}
                locale="he"
                confirmTextIOS="אישור"
                cancelTextIOS="ביטול"
                minuteInterval={1}
                modalPropsIOS={{
                  presentationStyle: 'overFullScreen'
                }}
              />
            </View>
            
            {/* Location Search Section */}
            <View style={styles.formSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>מיקום *</ThemedText>
              
              <View style={styles.googlePlacesContainer}>
                <View style={[styles.inputWrapper, validationErrors.location && styles.inputWrapperError]}>
                  <Ionicons 
                    name="location" 
                    size={20} 
                    color={location ? Colors.light.primary : Colors.light.text + '80'} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    ref={locationInputRef}
                    style={styles.input}
                    placeholder="הקלד את מיקום הרכיבה..."
                    placeholderTextColor={Colors.light.text + '80'}
                    value={locationInput}
                    onChangeText={(text) => {
                      setLocationInput(text);
                      setValidLocationSelected(false);
                      
                      // Clear validation error when user starts typing
                      if (validationErrors.location) {
                        setValidationErrors(prev => ({ ...prev, location: false }));
                      }
                      
                      if (text.length > 2) {
                        setLocationStatus('loading');
                        setShowResults(true);
                        
                        // Call the proxy API to get search results
                        searchLocation(text);
                      } else {
                        setSearchResults([]);
                        setShowResults(false);
                      }
                    }}
                    onBlur={() => {
                      // If user leaves field without selecting a valid option, clear input
                      setTimeout(() => {
                        if (!validLocationSelected && locationInput !== location) {
                          setLocationInput('');
                        }
                        setShowResults(false);
                      }, 200); // Small delay to allow for selection click to complete
                    }}
                    textAlign="right"
                  />
                  {locationStatus === 'loading' && (
                    <ActivityIndicator 
                      size="small" 
                      color={Colors.light.primary} 
                      style={styles.locationLoadingIcon} 
                    />
                  )}
                </View>
                
                {/* Dropdown of search results */}
                {showResults && searchResults.length > 0 && (
                  <View style={styles.suggestionsDropdown}>
                    <ScrollView 
                      style={styles.suggestionsScroll}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {searchResults.map((result, index) => (
                        <TouchableOpacity
                          key={`${result.placeId}-${index}`}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setLocation(result.description);
                            setLocationInput(result.description);
                            setLocationCoords(result.coordinates || null);
                            setLocationStatus('success');
                            setValidLocationSelected(true);
                            setShowResults(false);
                            Keyboard.dismiss();
                          }}
                        >
                          <ThemedText style={styles.suggestionText}>
                            {result.mainText || result.description.split(',')[0]}
                          </ThemedText>
                          {result.secondaryText && (
                            <ThemedText style={styles.suggestionSubtext}>
                              {result.secondaryText}
                            </ThemedText>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
                {locationStatus === 'error' && !showResults && (
                  <View style={styles.locationStatusContainer}>
                    <ThemedText style={[styles.locationStatusText, styles.locationErrorText]}>
                      לא נמצאו נקודות ציון למיקום זה
                    </ThemedText>
                    <Ionicons name="alert-circle" size={16} color="#e74c3c" />
                  </View>
                )}
              </View>
            </View>
            
            {/* Distance */}
            <View style={styles.formSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>מרחק (בק"מ) *</ThemedText>
              <View style={styles.sliderContainer}>
                <ThemedText style={styles.distanceValue}>1</ThemedText>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={100}
                  step={1}
                  value={distance}
                  onValueChange={setDistance}
                  minimumTrackTintColor={Colors.light.primary}
                  maximumTrackTintColor="#DDDDDD"
                  thumbTintColor={Colors.light.primary}
                />
                <ThemedText style={styles.distanceValue}>100</ThemedText>
              </View>
              <View style={{alignItems: 'center', marginTop: 5}}>
                <ThemedText type="defaultSemiBold">
                  {distance} ק"מ
                </ThemedText>
              </View>
            </View>
            
            {/* Participants */}
            <View style={styles.formSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>מספר משתתפים *</ThemedText>
              <View style={styles.participantsContainer}>
                <Ionicons name="people-outline" size={20} color={Colors.light.text + '80'} style={styles.participantsIcon} />
                <View style={styles.participantsOptions}>
                  <ParticipantOption 
                    value="1" 
                    isSelected={participants === "1"} 
                    onPress={() => setParticipants("1")} 
                  />
                  <ParticipantOption 
                    value="2" 
                    isSelected={participants === "2"} 
                    onPress={() => setParticipants("2")} 
                  />
                  <ParticipantOption 
                    value="3" 
                    isSelected={participants === "3"} 
                    onPress={() => setParticipants("3")} 
                  />
                  <ParticipantOption 
                    value="4" 
                    isSelected={participants === "4"} 
                    onPress={() => setParticipants("4")} 
                  />
                  <ParticipantOption 
                    value="5+" 
                    isSelected={participants === "5+"} 
                    onPress={() => setParticipants("5+")} 
                  />
                </View>
              </View>
            </View>
            
            {/* Ride Type */}
            <View style={styles.formSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>סוג רכיבה *</ThemedText>
              <View style={styles.tagsContainer}>
                <FilterTag
                  label="כביש"
                  isSelected={selectedTypes.includes('road')}
                  hasError={validationErrors.rideType}
                  onPress={() => {
                    toggleFilter('type', 'road');
                    if (validationErrors.rideType) {
                      setValidationErrors(prev => ({ ...prev, rideType: false }));
                    }
                  }}
                />
                <FilterTag
                  label="שטח"
                  isSelected={selectedTypes.includes('offroad')}
                  hasError={validationErrors.rideType}
                  onPress={() => {
                    toggleFilter('type', 'offroad');
                    if (validationErrors.rideType) {
                      setValidationErrors(prev => ({ ...prev, rideType: false }));
                    }
                  }}
                />
                <FilterTag
                  label="שבילים"
                  isSelected={selectedTypes.includes('trails')}
                  hasError={validationErrors.rideType}
                  onPress={() => {
                    toggleFilter('type', 'trails');
                    if (validationErrors.rideType) {
                      setValidationErrors(prev => ({ ...prev, rideType: false }));
                    }
                  }}
                />
                <FilterTag
                  label="עירוני"
                  isSelected={selectedTypes.includes('urban')}
                  hasError={validationErrors.rideType}
                  onPress={() => {
                    toggleFilter('type', 'urban');
                    if (validationErrors.rideType) {
                      setValidationErrors(prev => ({ ...prev, rideType: false }));
                    }
                  }}
                />
              </View>
            </View>
            
            {/* Difficulty Level */}
            <View style={styles.formSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>רמת קושי *</ThemedText>
              <View style={styles.tagsContainer}>
                <FilterTag
                  label="קל"
                  isSelected={selectedDifficulties.includes('easy')} 
                  onPress={() => toggleFilter('difficulty', 'easy')}
                />
                <FilterTag
                  label="בינוני"
                  isSelected={selectedDifficulties.includes('medium')} 
                  onPress={() => toggleFilter('difficulty', 'medium')}
                />
                <FilterTag
                  label="קשה"
                  isSelected={selectedDifficulties.includes('hard')} 
                  onPress={() => toggleFilter('difficulty', 'hard')}
                />
              </View>
            </View>
            
            {/* Technical Level */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleContainer}>
                <MaterialCommunityIcons name="bike-fast" size={20} color={Colors.light.text + '80'} />
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>רמה טכנית *</ThemedText>
              </View>
              <View style={styles.tagsContainer}>
                <FilterTag
                  label="לא טכני"
                  isSelected={selectedTechnicalLevels.includes('none')}
                  onPress={() => toggleFilter('technical', 'none')}
                />
                <FilterTag
                  label="טכני קל"
                  isSelected={selectedTechnicalLevels.includes('easy')}
                  onPress={() => toggleFilter('technical', 'easy')}
                />
                <FilterTag
                  label="טכני בינוני"
                  isSelected={selectedTechnicalLevels.includes('medium')}
                  onPress={() => toggleFilter('technical', 'medium')}
                />
                <FilterTag
                  label="טכני מאוד" 
                  isSelected={selectedTechnicalLevels.includes('hard')}
                  onPress={() => toggleFilter('technical', 'hard')}
                />
              </View>
            </View>
            
            {/* Speed */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleContainer}>
                <MaterialCommunityIcons name="speedometer" size={20} color={Colors.light.text + '80'} />
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>מהירות *</ThemedText>
              </View>
              <View style={styles.tagsContainer}>
                <FilterTag
                  label="איטי"
                  isSelected={selectedSpeeds.includes('slow')}
                  onPress={() => toggleFilter('speed', 'slow')}
                />
                <FilterTag
                  label="זורם"
                  isSelected={selectedSpeeds.includes('medium')}
                  onPress={() => toggleFilter('speed', 'medium')}
                />
                <FilterTag
                  label="מהיר"
                  isSelected={selectedSpeeds.includes('fast')}
                  onPress={() => toggleFilter('speed', 'fast')}
                />
              </View>
            </View>
            
            {/* Bike Type */}
            <View style={styles.formSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>סוג אופניים *</ThemedText>
              <View style={styles.tagsContainer}>
                <FilterTag
                  label="אנלוגי"
                  isSelected={bikeType === 'analog'} 
                  onPress={() => {
                    setBikeType('analog');
                    setFilters(prev => ({...prev, bikeType: 'analog'}));
                  }}
                />
                <FilterTag
                  label="חשמלי"
                  isSelected={bikeType === 'electric'} 
                  onPress={() => {
                    setBikeType('electric');
                    setFilters(prev => ({...prev, bikeType: 'electric'}));
                  }}
                />
              </View>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <ThemedText style={styles.submitButtonText}>
                  {isEditMode ? 'עדכן רכיבה' : 'צור רכיבה'}
                </ThemedText>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

 