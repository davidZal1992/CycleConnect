import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Config } from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface matching your backend RideDTO
interface RideDTO {
  id: number;
  title: string;
  description: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  date: string;
  time: string;
  distance: number;
  maxParticipants: number;
  rideType: string;
  difficultyLevel: string;
  technicalLevel: string;
  speedLevel: string;
  bikeType: string;
  organizerId: string;
  organizerName: string;
  organizerPhone: string;
  organizerAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

const RIDES_API_BASE_URL = `${Config.API_BASE_URL}/api/v1/rides`;

// Global cache to store ride data across navigation
const rideCache = new Map<string, RideDTO>();

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ride, setRide] = useState<RideDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Check if the current user is the organizer of this ride
  const isOrganizer = user?.uid === ride?.organizerId;
  
  // Get the organizer's avatar URL - use local profile if it's the current user's ride
  const getOrganizerAvatar = (): string | undefined => {
    if (isOrganizer && userProfile?.profileImage) {
      // Use local stored profile image for current user's rides
      return userProfile.profileImage;
    }
    // Use backend provided avatar for other users' rides
    return ride?.organizerAvatar;
  };

  // Get the organizer's name - use local profile if it's the current user's ride
  const getOrganizerName = (): string => {
    if (isOrganizer && userProfile?.fullName) {
      // Use local stored full name for current user's rides
      return userProfile.fullName;
    }
    // Use backend provided name for other users' rides
    return ride?.organizerName || 'מארגן';
  };
  
  // Fetch ride details from API only if not cached
  useEffect(() => {
    const loadRideDetails = async () => {
      if (!id) return;
      
      // Check if ride is already cached
      const cachedRide = rideCache.get(id);
      if (cachedRide) {
        console.log('🔥 RideDetail - Loading from cache for ID:', id);
        setRide(cachedRide);
        setLoading(false);
        return;
      }
      
      // Only fetch if not in cache
      try {
        setLoading(true);
        console.log('🔥 RideDetail - Fetching ride details for ID:', id);
        
        const response = await fetch(`${RIDES_API_BASE_URL}/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rideData: RideDTO = await response.json();
        console.log('🔥 RideDetail - API response:', rideData);
        console.log('🔥 RideDetail - Organizer avatar URL:', rideData.organizerAvatar);
        console.log('🔥 RideDetail - Avatar exists?', !!rideData.organizerAvatar);
        console.log('🔥 RideDetail - Avatar length:', rideData.organizerAvatar?.length);
        
        setRide(rideData);
        
        // Cache the ride data
        rideCache.set(id, rideData);
        
      } catch (error) {
        console.error('🔥 RideDetail - Error fetching ride details:', error);
        Alert.alert(
          'שגיאה',
          'לא ניתן לטעון את פרטי הרכיבה. אנא נסה שוב.',
          [
            {
              text: 'חזור',
              onPress: () => router.back()
            }
          ]
        );
      } finally {
        setLoading(false);
      }
    };

    loadRideDetails();
  }, [id]);
  
  const handleEditRide = () => {
    if (!ride) return;
    
    // Navigate to post-ride screen with edit parameters
    router.push({
      pathname: '/post-ride',
      params: { 
        editMode: 'true', 
        rideId: ride.id.toString()
      }
    });
  };
  
  const handleDeleteRide = async () => {
    if (!ride) return;
    
    // Show confirmation dialog
    Alert.alert(
      "מחיקת רכיבה",
      "האם אתה בטוח שברצונך למחוק את הרכיבה?",
      [
        {
          text: "לא",
          style: "cancel"
        },
        {
          text: "כן",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('🔥 RideDetail - Deleting ride with ID:', ride.id);
              
              const response = await fetch(`${RIDES_API_BASE_URL}/${ride.id}`, {
                method: 'DELETE',
              });
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              console.log('🔥 RideDetail - Ride deleted successfully');
              
              // Show success message and navigate to home page
              Alert.alert(
                'הצלחה',
                'הרכיבה נמחקה בהצלחה',
                [
                  {
                    text: 'אישור',
                    onPress: () => router.push('/(tabs)')
                  }
                ]
              );
              
            } catch (error) {
              console.error('🔥 RideDetail - Error deleting ride:', error);
              Alert.alert(
                'שגיאה',
                'לא ניתן למחוק את הרכיבה. אנא נסה שוב.'
              );
            }
          }
        }
      ],
      { cancelable: true }
    );
  };
  
  const handleToggleFavorite = () => {
    if (!user) {
      Alert.alert('שגיאה', 'יש להתחבר כדי להוסיף למועדפים');
      return;
    }

    // Don't allow favoriting your own rides
    if (ride?.organizerId === user.uid) {
      Alert.alert('שגיאה', 'לא ניתן להוסיף את הרכיבה שלך למועדפים');
      return;
    }

    setIsFavorite(!isFavorite);
    // TODO: In a real app, you would update this in your backend
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={styles.loadingText}>טוען פרטי רכיבה...</ThemedText>
      </View>
    );
  }
  
  if (!ride) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#f44336" />
        <ThemedText style={styles.errorText}>לא נמצאה רכיבה</ThemedText>
      </View>
    );
  }
  
  const getLevelColor = (level: string): string => {
    switch(level) {
      case 'easy': return '#4caf50'; // Green
      case 'medium': return '#ff9800'; // Orange
      case 'hard': return '#f44336'; // Red
      default: return '#4caf50'; // Default green
    }
  };
  
  const getDifficultyColor = (level: string): string => {
    return getLevelColor(level);
  };
  
  const getTechnicalLevelText = (level: string): string => {
    switch(level) {
      case 'none': return 'לא טכני';
      case 'easy': return 'טכני קל';
      case 'medium': return 'טכני בינוני';
      case 'hard': return 'טכני מאוד';
      default: return 'לא טכני';
    }
  };

  const getRideTypeText = (rideType: string): string => {
    switch(rideType) {
      case 'road': return 'כביש';
      case 'offroad': return 'שטח';
      case 'trails': return 'שבילים';
      case 'urban': return 'עירוני';
      case 'gravel': return 'גראבל';
      default: return rideType;
    }
  };

  const getBikeTypeText = (bikeType: string): string => {
    switch(bikeType) {
      case 'electric': return 'חשמלי';
      case 'analog': return 'אנלוגי';
      default: return bikeType;
    }
  };
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "פרטי רכיבה",
          headerBackTitle: "חזור",
          headerShown: true
        }} 
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            {isOrganizer && (
              <View style={styles.headerActionButtons}>
                <TouchableOpacity 
                  style={styles.headerActionButton}
                  onPress={handleEditRide}
                >
                  <Ionicons name="create-outline" size={20} color={Colors.light.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerActionButton}
                  onPress={handleDeleteRide}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            )}
            <ThemedText type="title" style={styles.title}>{ride.title}</ThemedText>
            <View style={styles.headerSpacer} />
          </View>
          
          {/* Organizer */}
          <View style={styles.section}>
            <View style={styles.organizerContainer}>
              <View style={styles.avatarContainer}>
                {getOrganizerAvatar() && getOrganizerAvatar()!.trim() !== '' ? (
                  <Image 
                    source={{ uri: getOrganizerAvatar() }} 
                    style={styles.organizerAvatar}
                    onError={(e) => {
                      console.log('🔥 RideDetail - Avatar load error:', e.nativeEvent.error);
                      console.log('🔥 RideDetail - Failed URL:', getOrganizerAvatar());
                    }}
                    onLoad={() => {
                      console.log('🔥 RideDetail - Avatar loaded successfully:', getOrganizerAvatar());
                    }}
                  />
                ) : (
                  <View style={[styles.organizerAvatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={30} color={Colors.light.text} />
                  </View>
                )}
              </View>
              <View style={styles.organizerInfo}>
                <ThemedText style={styles.organizerLabel}>מארגן/ת הרכיבה</ThemedText>
                <ThemedText style={styles.organizerName}>{getOrganizerName()}</ThemedText>
              </View>
            </View>
            
            {/* Contact options */}
            <View style={styles.contactOptions}>
              <View style={styles.leftSection}>
                <View style={styles.bikeTypeContainer}>
                  <ThemedText style={styles.bikeTypeText}>
                    {getBikeTypeText(ride.bikeType)}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.contactButtonsContainer}>
                {user && !isOrganizer && (
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={handleToggleFavorite}
                  >
                    <Ionicons 
                      name={isFavorite ? "heart" : "heart-outline"} 
                      size={24} 
                      color={isFavorite ? "#ff3b30" : Colors.light.text} 
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => {
                    // Logic to open WhatsApp
                    const phoneNumber = ride.organizerPhone || '';
                    if (phoneNumber) {
                      // Remove any hyphens or spaces for WhatsApp format
                      const formattedNumber = phoneNumber.replace(/-/g, '').replace(/\s/g, '');
                      // Add country code if not present (using Israel +972 code)
                      const whatsappNumber = formattedNumber.startsWith('0') 
                        ? '972' + formattedNumber.substring(1) 
                        : formattedNumber;
                      
                      Linking.openURL(`whatsapp://send?phone=${whatsappNumber}`)
                        .catch(err => console.error('Error opening WhatsApp:', err));
                    }
                  }}
                >
                  <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => {
                    // Logic to make a call
                    const phoneNumber = ride.organizerPhone || '';
                    if (phoneNumber) {
                      Linking.openURL(`tel:${phoneNumber}`)
                        .catch(err => console.error('Error opening phone:', err));
                    }
                  }}
                >
                  <Ionicons name="call" size={26} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles.descriptionSection}>
            <ThemedText style={styles.descriptionTitle}>תיאור הרכיבה</ThemedText>
            <ThemedText style={styles.descriptionText}>
              {ride.description || 'אין תיאור זמין לרכיבה זו.'}
            </ThemedText>
          </View>
          
          {/* Map */}
          <View style={styles.section}>
            <View style={styles.mapContainer}>
              {ride.coordinates && (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: ride.coordinates.latitude,
                    longitude: ride.coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: ride.coordinates.latitude,
                      longitude: ride.coordinates.longitude,
                    }}
                    title={ride.title}
                    description={ride.location}
                  />
                </MapView>
              )}
            </View>
          </View>
          
          {/* Date & Time */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="calendar" size={24} color={Colors.light.primary} />
                </View>
                <ThemedText style={styles.infoLabel}>תאריך</ThemedText>
                <ThemedText style={styles.infoValue}>{ride.date}</ThemedText>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="time" size={24} color={Colors.light.primary} />
                </View>
                <ThemedText style={styles.infoLabel}>שעה</ThemedText>
                <ThemedText style={styles.infoValue}>{ride.time}</ThemedText>
              </View>
            </View>
          </View>
          
          {/* Location & Distance */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="location" size={24} color={Colors.light.primary} />
                </View>
                <ThemedText style={styles.infoLabel}>מיקום</ThemedText>
                <ThemedText style={styles.infoValue}>{ride.location}</ThemedText>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="map-marker-distance" size={24} color={Colors.light.primary} />
                </View>
                <ThemedText style={styles.infoLabel}>מרחק</ThemedText>
                <ThemedText style={styles.infoValue}>{ride.distance} ק"מ</ThemedText>
              </View>
            </View>
          </View>

          {/* Participants */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="people" size={24} color={Colors.light.primary} />
                </View>
                <ThemedText style={styles.infoLabel}>משתתפים</ThemedText>
                <ThemedText style={styles.infoValue}>עד {ride.maxParticipants}</ThemedText>
              </View>
            </View>
          </View>
          
          {/* Specs Container */}
          <View style={styles.specsContainer}>
            <View style={styles.specItem}>
              <ThemedText style={styles.specLabel}>סוג רכיבה</ThemedText>
              <ThemedText style={styles.specValue}>
                {getRideTypeText(ride.rideType)}
              </ThemedText>
            </View>
            
            <View style={styles.specItem}>
              <ThemedText style={styles.specLabel}>רמת קושי</ThemedText>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(ride.difficultyLevel) }]}>
                <ThemedText style={styles.difficultyText}>
                  {ride.difficultyLevel === 'easy' ? 'קל' : 
                   ride.difficultyLevel === 'medium' ? 'בינוני' : 'קשה'}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.specItem}>
              <ThemedText style={styles.specLabel}>רמה טכנית</ThemedText>
              <View style={[styles.difficultyBadge, { backgroundColor: ride.technicalLevel === 'none' ? '#9e9e9e' : getLevelColor(ride.technicalLevel) }]}>
                <ThemedText style={styles.difficultyText}>
                  {getTechnicalLevelText(ride.technicalLevel)}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.specItem}>
              <ThemedText style={styles.specLabel}>מהירות</ThemedText>
              <View style={[styles.difficultyBadge, { backgroundColor: getLevelColor(ride.speedLevel === 'slow' ? 'easy' : ride.speedLevel === 'medium' ? 'medium' : 'hard') }]}>
                <ThemedText style={styles.difficultyText}>
                  {ride.speedLevel === 'slow' ? 'איטי' : 
                   ride.speedLevel === 'medium' ? 'זורם' : 'מהיר'}
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginLeft: 12,
  },
  organizerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  debugText: {
    fontSize: 8,
    color: Colors.light.text,
    marginTop: 2,
  },
  bikeTypeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginRight: 0,
    marginLeft: 12,
  },
  bikeTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  organizerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  organizerLabel: {
    fontSize: 14,
    color: Colors.light.text + "99",
    marginBottom: 4,
    textAlign: 'right',
  },
  organizerName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.text + "99",
    marginBottom: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  specsContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 14,
    color: Colors.light.text + "99",
    marginBottom: 8,
    textAlign: 'center',
  },
  specValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descriptionSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'right',
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  spacer: {
    flex: 1,
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  contactButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    marginTop: 8,
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerActionButtons: {
    flexDirection: 'row',
    gap: 8,
    width: 96, // Fixed width to balance the title centering
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 96, // Same width as headerActionButtons to balance centering
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
}); 


