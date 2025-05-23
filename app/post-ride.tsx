import { LocationSearchRef } from '@/components/LocationSearch';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useContext, useRef, useState } from 'react';
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

// Define interface for fallback locations
interface FallbackLocation {
  description: string;
  placeId: string;
}

// Define interface for search result items
interface SearchResultItem {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

// Fallback locations for when API fails
const FALLBACK_LOCATIONS: FallbackLocation[] = [
  { description: 'תל אביב, ישראל', placeId: 'tel-aviv' },
  { description: 'ירושלים, ישראל', placeId: 'jerusalem' },
  { description: 'חיפה, ישראל', placeId: 'haifa' },
  { description: 'באר שבע, ישראל', placeId: 'beer-sheva' },
  { description: 'אילת, ישראל', placeId: 'eilat' },
  { description: 'נתניה, ישראל', placeId: 'netanya' },
  { description: 'פארק הירקון, תל אביב', placeId: 'yarkon-park' },
];

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
});

export default function PostRideScreen() {
  // Get app state from context
  const { isAppReady } = useContext(AppStateContext);
  
  // Ride details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationCoordinates, setLocationCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState(30);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [participants, setParticipants] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTechnicalLevels, setSelectedTechnicalLevels] = useState<string[]>([]);
  const [selectedSpeeds, setSelectedSpeeds] = useState<string[]>([]);
  const [bikeType, setBikeType] = useState<string>('analog'); // Default to analog
  
  // Simple location search state
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [validLocationSelected, setValidLocationSelected] = useState(false);
  
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
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
    setLocationCoordinates(data.location);
    setLocationStatus(data.location ? 'success' : 'error');
    setValidLocationSelected(true);
    Keyboard.dismiss();
    setShowResults(false);
  };
  
  // Date picker handlers
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };
  
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };
  
  const handleConfirmDate = (date: Date) => {
    setDate(date);
    hideDatePicker();
  };
  
  // Time picker handlers
  const showTimePicker = () => {
    setTimePickerVisible(true);
  };
  
  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };
  
  const handleConfirmTime = (time: Date) => {
    setTime(time);
    hideTimePicker();
  };
  
  // Filter toggling function
  const toggleFilter = (category: FilterCategory, value: string) => {
    switch(category) {
      case 'type':
        setSelectedTypes(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'difficulty':
        setSelectedDifficulties(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'technical':
        setSelectedTechnicalLevels(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'speed':
        setSelectedSpeeds(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'bikeType':
        setBikeType(value);
        break;
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    let requiredFields = [];
    if (!title) requiredFields.push('כותרת');
    if (!location) requiredFields.push('מיקום');
    if (!date) requiredFields.push('תאריך');
    if (!time) requiredFields.push('שעה');
    if (!selectedDifficulties.length) requiredFields.push('רמת קושי');
    
    if (requiredFields.length > 0) {
      Alert.alert(
        'שדות חסרים',
        `אנא מלא את השדות הבאים: ${requiredFields.join(', ')}`,
        [{ text: 'אישור', style: 'default' }]
      );
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    setTimeout(() => {
      // Mock data for a new ride
      const newRide = {
        id: `ride-${Date.now()}`,
        title,
        description,
        location,
        date,
        time,
        distance,
        organizer: {
          id: 'user1', // In a real app, this would be the current user's ID
          name: 'דוד זלצמן', // Would be the current user's name
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg', // Would be the user's avatar
        },
        participantsCount: participants === "5+" ? 5 : parseInt(participants) || 1,
        maxParticipants: participants === "5+" ? 10 : parseInt(participants) * 2,
        rideType: selectedTypes.length ? selectedTypes[0] : 'road', // Default to road if none selected
        difficultyLevel: selectedDifficulties.length ? selectedDifficulties[0] : 'easy',
        technicalLevel: selectedTechnicalLevels.length ? selectedTechnicalLevels[0] : 'none',
        speedLevel: selectedSpeeds.length ? selectedSpeeds[0] : 'medium',
        bikeType,
      };
      
      console.log('Creating new ride:', newRide);
      
      // Hide loading and navigate back
      setIsLoading(false);
      
      // Show success message
      Alert.alert(
        'רכיבה נוצרה בהצלחה!',
        'הרכיבה שלך פורסמה ומוכנה להרשמה',
        [{ text: 'אישור', onPress: () => router.back() }]
      );
    }, 1500); // Simulate network request
  };
  
  // Filter tag component with icon support
  const FilterTag = ({ 
    label, 
    isSelected, 
    onPress,
    icon
  }: { 
    label: string, 
    isSelected: boolean, 
    onPress: () => void,
    icon?: React.ReactNode
  }) => (
    <TouchableOpacity
      style={[styles.filterTag, isSelected && styles.filterTagSelected]}
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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']} key="post-ride-screen">
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
                <ThemedText style={styles.characterCount}>{title.length}/15</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>כותרת הרכיבה</ThemedText>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="bicycle" size={20} color={Colors.light.text + '80'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="הזן כותרת לרכיבה..."
                  placeholderTextColor={Colors.light.text + '80'}
                  value={title}
                  onChangeText={(text) => {
                    // Limit title to 15 characters
                    if (text.length <= 15) {
                      setTitle(text);
                    }
                  }}
                  maxLength={15}
                  textAlign="right"
                />
              </View>
            </View>
            
            {/* Ride Description */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.characterCount}>{description.length}/50</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>תיאור הרכיבה</ThemedText>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="document-text-outline" size={20} color={Colors.light.text + '80'} style={[styles.inputIcon, styles.textAreaIcon]} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="תאר/י את הרכיבה, נקודות עניין, דברים שחשוב לדעת..."
                  placeholderTextColor={Colors.light.text + '80'}
                  value={description}
                  onChangeText={(text) => {
                    // Limit description to 50 characters
                    if (text.length <= 50) {
                      setDescription(text);
                    }
                  }}
                  maxLength={50}
                  multiline
                  numberOfLines={4}
                  textAlign="right"
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            {/* Date and Time */}
            <View style={styles.formSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>תאריך ושעה</ThemedText>
              <View style={styles.rowInputs}>
                <TouchableOpacity 
                  style={styles.inputHalf}
                  onPress={showTimePicker}
                >
                  <View style={styles.inputWrapper}>
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
                  onPress={showDatePicker}
                >
                  <View style={styles.inputWrapper}>
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
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>מיקום</ThemedText>
              
              <View style={styles.googlePlacesContainer}>
                <View style={styles.inputWrapper}>
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
                      
                      if (text.length > 2) {
                        setLocationStatus('loading');
                        setShowResults(true);
                        
                        // Call the proxy API to get search results
                        axios.get(`${PROXY_URL}?input=${encodeURIComponent(text)}`)
                          .then(response => {
                            if (response.data?.suggestions && response.data.suggestions.length > 0) {
                              // Store all results for dropdown
                              const results = response.data.suggestions.map((suggestion: any) => ({
                                description: suggestion.placePrediction.text?.text || '',
                                placeId: suggestion.placePrediction.placeId,
                                mainText: suggestion.placePrediction.structuredFormat?.mainText?.text || '',
                                secondaryText: suggestion.placePrediction.structuredFormat?.secondaryText?.text || ''
                              }));
                              
                              setSearchResults(results);
                              setLocationStatus('idle');
                            } else {
                              setSearchResults([]);
                              setLocationStatus('error');
                            }
                          })
                          .catch(() => {
                            // Try local search if API fails
                            const localResults = FALLBACK_LOCATIONS.filter(
                              loc => loc.description.toLowerCase().includes(text.toLowerCase())
                            ).map(loc => ({
                              description: loc.description,
                              placeId: loc.placeId,
                              mainText: loc.description.split(',')[0],
                              secondaryText: loc.description.split(',')[1] || ''
                            }));
                            
                            setSearchResults(localResults);
                            setLocationStatus(localResults.length ? 'idle' : 'error');
                          });
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
                            setLocationCoordinates({
                              latitude: 31.5 + (Math.random() * 2 - 1),
                              longitude: 34.8 + (Math.random() * 2 - 1)
                            });
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
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>מרחק (בק"מ)</ThemedText>
              <View style={styles.sliderContainer}>
                <ThemedText style={styles.distanceValue}>5</ThemedText>
                <Slider
                  style={styles.slider}
                  minimumValue={5}
                  maximumValue={100}
                  step={5}
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
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>מספר משתתפים</ThemedText>
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
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>סוג רכיבה</ThemedText>
              <View style={styles.tagsContainer}>
                <FilterTag
                  label="כביש"
                  isSelected={selectedTypes.includes('road')}
                  onPress={() => toggleFilter('type', 'road')}
                />
                <FilterTag
                  label="שטח"
                  isSelected={selectedTypes.includes('offroad')}
                  onPress={() => toggleFilter('type', 'offroad')}
                />
                <FilterTag
                  label="שבילים"
                  isSelected={selectedTypes.includes('trails')}
                  onPress={() => toggleFilter('type', 'trails')}
                />
                <FilterTag
                  label="עירוני"
                  isSelected={selectedTypes.includes('urban')}
                  onPress={() => toggleFilter('type', 'urban')}
                />
              </View>
            </View>
            
            {/* Difficulty Level */}
            <View style={styles.formSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>רמת קושי</ThemedText>
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
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>רמה טכנית</ThemedText>
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
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>מהירות</ThemedText>
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
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>סוג אופניים</ThemedText>
              <View style={styles.tagsContainer}>
                <FilterTag
                  label="אנלוגי"
                  isSelected={bikeType === 'analog'} 
                  onPress={() => setBikeType('analog')}
                />
                <FilterTag
                  label="חשמלי"
                  isSelected={bikeType === 'electric'} 
                  onPress={() => setBikeType('electric')}
                />
              </View>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.submitButtonText}>פרסם רכיבה</ThemedText>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

 