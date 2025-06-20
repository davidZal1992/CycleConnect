import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/config/firebase';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

// Get proxy URL from environment variables
const PROXY_URL = Constants.expoConfig?.extra?.proxyUrl || 'http://localhost:3000/places-proxy/autocomplete';

// API endpoint for profile
const API_BASE_URL = 'http://localhost:8080/api/v1/profiles';

// Default profile picture URL
const DEFAULT_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80';

// Firebase Storage upload function
const uploadImageToFirebaseStorage = async (imageUri: string, userId: string): Promise<string> => {
  try {
    console.log('🔥 Starting image upload to Firebase Storage...');
    
    // Use a consistent filename to overwrite existing profile image
    const filename = 'profile.jpg';
    const storageRef = storage().ref(`profile-images/${userId}/${filename}`);
    
    // Convert the image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    console.log('🔥 Uploading image blob to Firebase Storage (will overwrite existing)...');
    
    // Upload the image - this will overwrite any existing file with the same name
    const uploadTask = await storageRef.put(blob);
    
    // Get the download URL
    const downloadURL = await uploadTask.ref.getDownloadURL();
    
    console.log('🔥 ✅ Image uploaded successfully (overwrote existing):', downloadURL);
    return downloadURL;
    
  } catch (error) {
    console.error('🔥 ❌ Error uploading image to Firebase Storage:', error);
    throw new Error('Failed to upload image');
  }
};

// Define interface for search result items
interface SearchResultItem {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

interface UserProfile {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profileImage?: string;
  bikeModel?: string;
  location?: string;
  bio?: string;
}

export default function ProfileEditScreen() {
  const { user, updateStoredProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Refs
  const cityInputRef = useRef<TextInput>(null);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  
  // Image upload states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Location search states
  const [cityInput, setCityInput] = useState('');
  const [showCityResults, setShowCityResults] = useState(false);
  const [citySearchResults, setCitySearchResults] = useState<SearchResultItem[]>([]);
  const [validCitySelected, setValidCitySelected] = useState(false);
  const [cityStatus, setCityStatus] = useState<'none' | 'loading' | 'error' | 'success'>('none');

  // Validation errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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

  // Fetch user profile from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔥 ProfileEdit - Fetching user profile for userId:', user.uid);
        const response = await fetch(`${API_BASE_URL}/${user.uid}`);
        
        if (response.ok) {
          const profile = await response.json();
          console.log('🔥 ProfileEdit - User profile fetched successfully:', profile);
          setUserProfile(profile);
          
          // Populate form fields
          const nameParts = profile.fullName?.split(' ') || [];
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
          setPhoneNumber(profile.phoneNumber || '');
          setBikeModel(profile.bikeModel || '');
          setLocation(profile.location || '');
          setCityInput(profile.location || '');
          setBio(profile.bio || '');
          setProfileImage(profile.profileImage || null);
        } else {
          console.log('🔥 ProfileEdit - No profile found for user');
          // Initialize with Firebase data if available
          if (user.displayName) {
            const nameParts = user.displayName.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
          }
        }
      } catch (error) {
        console.error('🔥 ProfileEdit - Error fetching user profile:', error);
        Alert.alert('שגיאה', 'אירעה שגיאה בטעינת הפרופיל');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'שם פרטי הוא שדה חובה';
    } else if (firstName.length > 10) {
      newErrors.firstName = 'שם פרטי לא יכול להיות יותר מ-10 תווים';
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'שם משפחה הוא שדה חובה';
    } else if (lastName.length > 10) {
      newErrors.lastName = 'שם משפחה לא יכול להיות יותר מ-10 תווים';
    }

    // Phone validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'מספר טלפון הוא שדה חובה';
    } else if (!/^05\d{8}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'מספר טלפון חייב להיות בפורמט 05XXXXXXXX';
    }

    // Bio validation
    if (bio.length > 30) {
      newErrors.bio = 'ביו לא יכול להיות יותר מ-30 תווים';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'firstName':
        setFirstName(value.slice(0, 10));
        break;
      case 'lastName':
        setLastName(value.slice(0, 10));
        break;
      case 'phoneNumber':
        // Remove non-digits and limit to 10 characters
        const cleanedPhone = value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(cleanedPhone);
        break;
      case 'bikeModel':
        setBikeModel(value);
        break;
      case 'bio':
        setBio(value.slice(0, 30));
        break;
    }
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async () => {
    if (!user?.uid) {
      return;
    }

    try {
      setIsUploadingImage(true);
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size (max 5MB)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('קובץ גדול מדי', 'אנא בחר תמונה קטנה יותר (עד 5MB)');
          return;
        }

        console.log('🔥 Uploading image to Firebase Storage...');
        
        // Upload to Firebase Storage
        const downloadURL = await uploadImageToFirebaseStorage(asset.uri, user.uid);
        
        // Update profile image state
        setProfileImage(downloadURL);
      }
    } catch (error) {
      console.error('🔥 Error in handleImageUpload:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm() || !user?.uid) {
      return;
    }

    setIsSaving(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      
      const profileData = {
        userId: user.uid,
        fullName,
        phoneNumber: phoneNumber.trim(),
        email: user.email || '',
        profileImage: profileImage || userProfile?.profileImage || null,
        bikeModel: bikeModel.trim() || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
      };

      console.log('🔥 ProfileEdit - Updating profile:', profileData);

      const response = await fetch(`${API_BASE_URL}/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log('🔥 ProfileEdit - Profile updated successfully:', updatedProfile);
        
        // Update the stored profile in AuthContext
        updateStoredProfile(updatedProfile);
        
        // Navigate back to profile with update flag (no alert)
        router.navigate({
          pathname: '/(tabs)/profile',
          params: { profileUpdated: 'true' }
        });
      } else {
        const errorData = await response.text();
        console.error('🔥 ProfileEdit - Error updating profile:', errorData);
        Alert.alert('שגיאה', 'אירעה שגיאה בעדכון הפרופיל. אנא נסה שוב.');
      }
    } catch (error) {
      console.error('🔥 ProfileEdit - Network error:', error);
      Alert.alert('שגיאה', 'אירעה שגיאת רשת. אנא בדוק את החיבור שלך ונסה שוב.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={styles.loadingText}>טוען פרטי פרופיל...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'עריכת פרופיל',
          headerShown: true,
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Card Container */}
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <ThemedText style={styles.title}>עריכת פרופיל</ThemedText>
                <ThemedText style={styles.subtitle}>
                  עדכן את הפרטים שלך כדי לשמור על הפרופיל מעודכן
                </ThemedText>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                {/* Profile Image Section */}
                <View style={styles.imageSection}>
                  <TouchableOpacity 
                    style={[styles.avatarContainer, isUploadingImage && styles.avatarContainerDisabled]} 
                    onPress={handleImageUpload}
                    disabled={isUploadingImage}
                  >
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={32} color={Colors.light.primary} />
                      </View>
                    )}
                    <View style={styles.cameraButton}>
                      {isUploadingImage ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <ThemedText style={styles.imageLabel}>
                    {isUploadingImage ? 'מעלה תמונה...' : 'ערוך תמונת פרופיל'}
                  </ThemedText>
                </View>

                {/* Personal Information */}
                <View style={styles.formSection}>
                  <View style={styles.row}>
                    <View style={styles.inputContainer}>
                      <View style={styles.labelContainer}>
                        <Ionicons name="person" size={16} color="#666" />
                        <ThemedText style={styles.label}>שם משפחה</ThemedText>
                      </View>
                      <TextInput
                        style={[styles.input, errors.lastName && styles.inputError]}
                        value={lastName}
                        onChangeText={(value) => handleInputChange('lastName', value)}
                        placeholder="הכנס שם משפחה"
                        placeholderTextColor="#999"
                        textAlign="right"
                        maxLength={10}
                      />
                      {errors.lastName && (
                        <ThemedText style={styles.errorText}>{errors.lastName}</ThemedText>
                      )}
                    </View>

                    <View style={styles.inputContainer}>
                      <View style={styles.labelContainer}>
                        <Ionicons name="person" size={16} color="#666" />
                        <ThemedText style={styles.label}>שם פרטי</ThemedText>
                      </View>
                      <TextInput
                        style={[styles.input, errors.firstName && styles.inputError]}
                        value={firstName}
                        onChangeText={(value) => handleInputChange('firstName', value)}
                        placeholder="הכנס שם פרטי"
                        placeholderTextColor="#999"
                        textAlign="right"
                        maxLength={10}
                      />
                      {errors.firstName && (
                        <ThemedText style={styles.errorText}>{errors.firstName}</ThemedText>
                      )}
                    </View>
                  </View>

                  {/* Contact Information */}
                  <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="call" size={16} color="#666" />
                      <ThemedText style={styles.label}>מספר טלפון</ThemedText>
                    </View>
                    <TextInput
                      style={[styles.input, errors.phoneNumber && styles.inputError]}
                      value={phoneNumber}
                      onChangeText={(value) => handleInputChange('phoneNumber', value)}
                      placeholder="0541234567"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      textAlign="right"
                      maxLength={10}
                    />
                    {errors.phoneNumber && (
                      <ThemedText style={styles.errorText}>{errors.phoneNumber}</ThemedText>
                    )}
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
                          color={location ? Colors.light.primary : Colors.light.text + '80'} 
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
                              if (!validCitySelected && cityInput !== location) {
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

                      {/* Dropdown of search results - positioned directly under input */}
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
                                  setLocation(result.description);
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

                  {/* Bike Model */}
                  <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="bicycle" size={16} color="#666" />
                      <ThemedText style={styles.label}>דגם אופניים (אופציונלי)</ThemedText>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={bikeModel}
                      onChangeText={(value) => handleInputChange('bikeModel', value)}
                      placeholder="לדוגמה: Trek Domane, Giant Defy, Specialized Allez..."
                      placeholderTextColor="#999"
                      textAlign="right"
                    />
                  </View>

                  {/* Bio */}
                  <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="information-circle" size={16} color="#666" />
                      <ThemedText style={styles.label}>ספר על עצמך (אופציונלי)</ThemedText>
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
                      value={bio}
                      onChangeText={(value) => handleInputChange('bio', value)}
                      placeholder="ספר לקהילה קצת על עצמך, תחביבים, ותחומי עניין..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={4}
                      textAlign="right"
                      textAlignVertical="top"
                      maxLength={30}
                    />
                    <ThemedText style={styles.characterCounter}>
                      {bio.length}/30 תווים
                    </ThemedText>
                    {errors.bio && (
                      <ThemedText style={styles.errorText}>{errors.bio}</ThemedText>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.buttonSection}>
                    <TouchableOpacity 
                      style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                      onPress={handleSave}
                      disabled={isSaving}
                    >
                      <ThemedText style={styles.submitButtonText}>
                        {isSaving ? 'שומר שינויים...' : 'שמור שינויים'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
    textAlign: 'center',
    flex: 2,
  },
  placeholder: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
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
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Colors.light.primary}1A`, // Adding 1A for 10% opacity
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
  inputError: {
    borderColor: '#E74C3C',
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
  },
  suggestionsScroll: {
    maxHeight: 180,
  },
  suggestionItem: {
    paddingVertical: 12,
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
  characterCounter: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 4,
  },
  avatarContainerDisabled: {
    opacity: 0.5,
  },
}); 