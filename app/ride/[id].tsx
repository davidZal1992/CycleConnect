import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { mockRides } from '@/data/mockRides';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ride, setRide] = useState(mockRides.find(r => r.id === id));
  const [loading, setLoading] = useState(!ride);
  
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
      <Stack.Screen options={{ title: ride.title }} />
      
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
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => {
                  // Logic to open WhatsApp would go here
                  console.log('Open WhatsApp with:', ride.organizer.phone || 'No phone number available');
                }}
              >
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                <ThemedText style={styles.contactButtonText}>WhatsApp</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => {
                  // Logic to make a call would go here
                  console.log('Call organizer:', ride.organizer.phone || 'No phone number available');
                }}
              >
                <Ionicons name="call" size={20} color="#007AFF" />
                <ThemedText style={styles.contactButtonText}>התקשר</ThemedText>
              </TouchableOpacity>
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
          
          {/* Participants */}
          <View style={styles.participantsSection}>
            <View style={styles.participantsHeader}>
              <ThemedText style={styles.participantsTitle}>משתתפים</ThemedText>
              <View style={styles.participantsCount}>
                <ThemedText style={styles.participantsCountText}>
                  {ride.participantsCount}/{ride.maxParticipants || '∞'}
                </ThemedText>
              </View>
            </View>
            
            {/* Join Button */}
            <TouchableOpacity style={styles.joinButton}>
              <ThemedText style={styles.joinButtonText}>הצטרף לרכיבה</ThemedText>
            </TouchableOpacity>
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
  organizerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  organizerLabel: {
    fontSize: 14,
    color: Colors.light.text + "99",
    marginBottom: 4,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  participantsSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  participantsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantsCount: {
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantsCountText: {
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  joinButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 8,
  },
  contactButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
}); 