import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { mockRides } from '@/data/mockRides';
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

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ride, setRide] = useState(mockRides.find(r => r.id === id));
  const [loading, setLoading] = useState(!ride);
  const router = useRouter();
  
  // For demo purposes, assume the current user is the organizer
  // In a real app, you would check if the current user ID matches the organizer ID
  const isOrganizer = true;
  
  // Simulate loading if ride not found immediately
  useEffect(() => {
    if (!ride) {
      const timeout = setTimeout(() => {
        setRide(mockRides.find(r => r.id === id));
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [id, ride]);
  
  const handleEditRide = () => {
    // Navigate to post-ride screen with edit parameters
    router.push({
      pathname: '/post-ride',
      params: { 
        editMode: 'true', 
        rideId: ride?.id,
        // You could also pass other ride details directly if needed
      }
    });
  };
  
  const handleDeleteRide = () => {
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
          onPress: () => {
            // In a real app, you would delete from the server
            console.log('Delete ride with ID:', ride?.id);
            // Navigate back after deletion
            router.back();
          }
        }
      ],
      { cancelable: true }
    );
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
  
  // Configure the header with custom title
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: ride?.title,
          headerRight: isOrganizer ? () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleEditRide}
              >
                <Ionicons name="create-outline" size={24} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleDeleteRide}
              >
                <Ionicons name="trash-outline" size={24} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          ) : undefined
        }} 
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView}>
          {/* Organizer */}
          <View style={styles.section}>
            <View style={styles.organizerContainer}>
              <Image 
                source={{ uri: ride.organizer.avatar }} 
                style={styles.organizerAvatar} 
              />
              <View style={styles.organizerInfo}>
                <ThemedText style={styles.organizerLabel}>מארגן/ת הרכיבה</ThemedText>
                <ThemedText style={styles.organizerName}>{ride.organizer.name}</ThemedText>
              </View>
            </View>
            
            {/* Contact options */}
            <View style={styles.contactOptions}>
              <View style={styles.bikeTypeContainer}>
                <ThemedText style={styles.bikeTypeText}>
                  {ride.bikeType === 'electric' ? 'חשמלי' : 'אנלוגי'}
                </ThemedText>
              </View>
              
              <View style={styles.contactButtonsContainer}>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => {
                    // Logic to open WhatsApp
                    const phoneNumber = ride.organizer.phone || '';
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
                    const phoneNumber = ride.organizer.phone || '';
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
          
          {/* Specs Container */}
          <View style={styles.specsContainer}>
            <View style={styles.specItem}>
              <ThemedText style={styles.specLabel}>סוג רכיבה</ThemedText>
              <ThemedText style={styles.specValue}>
                {ride.rideType === 'road' ? 'כביש' : 
                 ride.rideType === 'offroad' ? 'שטח' : 
                 ride.rideType === 'trails' ? 'שבילים' : 
                 ride.rideType === 'urban' ? 'עירוני' : 'גראבל'}
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
  organizerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 12,
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
  },
  spacer: {
    flex: 1,
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 


