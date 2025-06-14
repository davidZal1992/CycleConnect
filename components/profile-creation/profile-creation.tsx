import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get proxy URL from environment variables
const PROXY_URL = Constants.expoConfig?.extra?.proxyUrl || 'http://localhost:3000/places-proxy/autocomplete';

// Define interface for search result items
interface SearchResultItem {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

interface ProfileCreationProps {
  userEmail?: string;
}

export function ProfileCreation({ userEmail = '' }: ProfileCreationProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const email = (params.email as string) || userEmail;
  const token = params.token as string;
  
  // Refs
  const cityInputRef = useRef<TextInput>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: new Date(),
    city: '',
    bio: '',
    profileImage: null as string | null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
  // Location search states
  const [cityInput, setCityInput] = useState('');
  const [showCityResults, setShowCityResults] = useState(false);
  const [citySearchResults, setCitySearchResults] = useState<SearchResultItem[]>([]);
  const [validCitySelected, setValidCitySelected] = useState(false);
  const [cityStatus, setCityStatus] = useState<'none' | 'loading' | 'error' | 'success'>('none');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date
    }));
  };

  // Date picker handlers
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    handleDateChange(date);
    hideDatePicker();
  };

  // Location search function
  const searchCity = async (text: string) => {
    if (!text) {
      setShowCityResults(false);
      return;
    }
    
    setCityInput(text);
    setCityStatus('loading');
    setValidCitySelected(false);
    
    console.log('Searching for city:', text);
    console.log('Using PROXY_URL:', PROXY_URL);
    
    try {
      const response = await axios.get(PROXY_URL, {
        params: { input: text, language: 'iw' }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.predictions) {
        console.log('Found predictions:', response.data.predictions.length);
        const results = response.data.predictions.map((item: any) => ({
          placeId: item.place_id,
          description: item.description,
          mainText: item.structured_formatting.main_text,
          secondaryText: item.structured_formatting.secondary_text
        }));
        
        setCitySearchResults(results);
        setShowCityResults(true);
        setCityStatus('none');
      } else {
        console.log('No predictions found in response');
        setCitySearchResults([]);
        setShowCityResults(false);
        setCityStatus('error');
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setCitySearchResults([]);
      setShowCityResults(false);
      setCityStatus('error');
    }
  };

  const handleImageUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('הרשאה נדרשת', 'אנא אפשר גישה לגלריית התמונות');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('קובץ גדול מדי', 'אנא בחר תמונה קטנה יותר (עד 5MB)');
          return;
        }

        setFormData(prev => ({ ...prev, profileImage: asset.uri }));
      }
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לטעון תמונה');
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('שגיאה', 'אנא הזן שם פרטי');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      Alert.alert('שגיאה', 'אנא הזן שם משפחה');
      return false;
    }

    if (!formData.phone.trim()) {
      Alert.alert('שגיאה', 'אנא הזן מספר טלפון');
      return false;
    }

    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/[-\s]/g, ''))) {
      Alert.alert('שגיאה', 'אנא הזן מספר טלפון תקין (05xxxxxxxx)');
      return false;
    }

    if (!formData.city.trim()) {
      Alert.alert('שגיאה', 'אנא הזן עיר מגורים');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save the profile data
      console.log('Profile saved:', formData);
      
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשמירת הפרופיל');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.replace('/login')}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
              <ThemedText style={styles.backButtonText}>חזור</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Card Container */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <ThemedText style={styles.title}>צור את הפרופיל שלך</ThemedText>
              <ThemedText style={styles.subtitle}>
                בואו נכיר! ספר לנו קצת על עצמך כדי שנוכל ליצור חוויה מותאמת אישית
              </ThemedText>
            </View>

            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* Profile Image Section */}
              <View style={styles.imageSection}>
                <TouchableOpacity style={styles.avatarContainer} onPress={handleImageUpload}>
                  {formData.profileImage ? (
                    <Image source={{ uri: formData.profileImage }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={32} color={Colors.light.primary} />
                    </View>
                  )}
                  <View style={styles.cameraButton}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <ThemedText style={styles.imageLabel}>הוסף תמונת פרופיל</ThemedText>
              </View>

              {/* Personal Information */}
              <View style={styles.formSection}>
                <View style={styles.row}>
                  <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="person" size={16} color="#666" />
                      <ThemedText style={styles.label}>שם פרטי</ThemedText>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={formData.firstName}
                      onChangeText={(value) => handleInputChange('firstName', value)}
                      placeholder="הכנס שם פרטי"
                      placeholderTextColor="#999"
                      textAlign="right"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="person" size={16} color="#666" />
                      <ThemedText style={styles.label}>שם משפחה</ThemedText>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={formData.lastName}
                      onChangeText={(value) => handleInputChange('lastName', value)}
                      placeholder="הכנס שם משפחה"
                      placeholderTextColor="#999"
                      textAlign="right"
                    />
                  </View>
                </View>

                {/* Contact Information */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="call" size={16} color="#666" />
                    <ThemedText style={styles.label}>מספר טלפון</ThemedText>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="050-123-4567"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    textAlign="right"
                  />
                </View>

                {/* Date of Birth */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <ThemedText style={styles.label}>תאריך לידה</ThemedText>
                  </View>
                  <TouchableOpacity onPress={showDatePicker}>
                    <TextInput
                      style={styles.input}
                      value={formData.dateOfBirth ? formData.dateOfBirth.toLocaleDateString('he-IL') : ''}
                      placeholder="בחר תאריך לידה"
                      placeholderTextColor="#999"
                      textAlign="right"
                      editable={false}
                      pointerEvents="none"
                    />
                  </TouchableOpacity>
                </View>

                {/* Location */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="location" size={16} color="#666" />
                    <ThemedText style={styles.label}>עיר מגורים</ThemedText>
                  </View>
                  <View style={styles.locationContainer}>
                    <View style={styles.inputWrapper}>
                      <Ionicons 
                        name="location" 
                        size={20} 
                        color={formData.city ? Colors.light.primary : Colors.light.text + '80'} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        ref={cityInputRef}
                        style={styles.locationInput}
                        placeholder="הקלד את עיר המגורים..."
                        placeholderTextColor={Colors.light.text + '80'}
                        value={cityInput}
                        onChangeText={(text) => {
                          setCityInput(text);
                          setValidCitySelected(false);
                          
                          if (text.length > 2) {
                            setCityStatus('loading');
                            setShowCityResults(true);
                            
                            // Call the proxy API to get search results
                            searchCity(text);
                          } else {
                            setCitySearchResults([]);
                            setShowCityResults(false);
                          }
                        }}
                        onBlur={() => {
                          // If user leaves field without selecting a valid option, clear input
                          setTimeout(() => {
                            if (!validCitySelected && cityInput !== formData.city) {
                              setCityInput('');
                            }
                            setShowCityResults(false);
                          }, 200); // Small delay to allow for selection click to complete
                        }}
                        textAlign="right"
                      />
                      {cityStatus === 'loading' && (
                        <ActivityIndicator 
                          size="small" 
                          color={Colors.light.primary} 
                          style={styles.locationLoadingIcon} 
                        />
                      )}
                    </View>
                    
                    {/* Dropdown of search results */}
                    {showCityResults && citySearchResults.length > 0 && (
                      <View style={styles.suggestionsDropdown}>
                        <ScrollView 
                          style={styles.suggestionsScroll}
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="handled"
                        >
                          {citySearchResults.map((result, index) => (
                            <TouchableOpacity
                              key={`${result.placeId}-${index}`}
                              style={styles.suggestionItem}
                              onPress={() => {
                                setFormData(prev => ({ ...prev, city: result.description }));
                                setCityInput(result.description);
                                setCityStatus('success');
                                setValidCitySelected(true);
                                setShowCityResults(false);
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
                  </View>
                </View>

                {/* Bio */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="information-circle" size={16} color="#666" />
                    <ThemedText style={styles.label}>ספר על עצמך (אופציונלי)</ThemedText>
                  </View>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.bio}
                    onChangeText={(value) => handleInputChange('bio', value)}
                    placeholder="ספר לקהילה קצת על עצמך, תחביבים, ותחומי עניין..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlign="right"
                    textAlignVertical="top"
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonSection}>
                  <TouchableOpacity 
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    <ThemedText style={styles.submitButtonText}>
                      {isLoading ? 'יוצר פרופיל...' : 'יצירת פרופיל'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Date Picker Modal */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
            maximumDate={new Date()}
            locale="he"
            confirmTextIOS="אישור"
            cancelTextIOS="ביטול"
            modalPropsIOS={{
              presentationStyle: 'overFullScreen'
            }}
          />

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Gradient-like background
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: `${Colors.light.primary}33`, // Adding 33 for 20% opacity
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Colors.light.primary}1A`, // Adding 1A for 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  formSection: {
    gap: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputContainer: {
    flex: 1,
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    textAlign: 'right',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Location search styles
  locationContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  inputIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  locationInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    textAlign: 'right',
  },
  locationLoadingIcon: {
    position: 'absolute',
    right: 40,
  },
  suggestionsDropdown: {
    backgroundColor: '#fff',
    borderColor: '#D1D5DB',
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
  suggestionsScroll: {
    maxHeight: 180,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  suggestionText: {
    fontSize: 15,
    color: '#111827',
    textAlign: 'right',
  },
  suggestionSubtext: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 2,
  },
  buttonSection: {
    gap: 12,
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
}); 