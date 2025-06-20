import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Config } from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterType = 'all' | 'future' | 'my';

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

// Pagination response interface
interface PaginationResponse {
  content: RideDTO[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  hasNext: boolean;
}

const RIDES_API_BASE_URL = `${Config.API_BASE_URL}/api/v1/rides`;

export default function RidesScreen() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>('my');
  const [rides, setRides] = useState<RideDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch rides from API
  const fetchRides = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔥 RidesScreen - Fetching rides from API');
      
      // Fetch all rides (including past ones for filtering)
      const url = `${RIDES_API_BASE_URL}?page=0&size=100&includeAll=true`;
      console.log('🔥 RidesScreen - Fetching URL:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PaginationResponse = await response.json();
      console.log('🔥 RidesScreen - API response:', data);
      
      setRides(data.content);
      
    } catch (error) {
      console.error('🔥 RidesScreen - Error fetching rides:', error);
      // Fallback to mock data on error
      setRides([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Focus effect to ensure data is fetched when navigating to this tab
  useFocusEffect(
    useCallback(() => {
      console.log('🔥 RidesScreen - Tab focused, fetching rides');
      fetchRides();
    }, [fetchRides])
  );
  
  const handleEditRide = (rideId: string) => {
    router.push({
      pathname: '/post-ride',
      params: { 
        editMode: 'true', 
        rideId: rideId
      }
    });
  };
  
  const handleDeleteRide = (rideId: string) => {
    // Simple mock delete - just log for now
    console.log('Delete ride:', rideId);
  };
  
  const handleViewRideDetails = (rideId: string) => {
    router.push({
      pathname: '/ride/[id]',
      params: { id: rideId }
    });
  };

  const handleCreateRide = () => {
    router.push('/post-ride');
  };

  // Filter rides based on the active filter with expiration status
  const filteredRides = (() => {
    const currentDate = new Date();
    
    const ridesWithExpiration = rides.map(ride => {
      // Parse the date parts correctly
      const [day, month, year] = ride.date.split('/').map(Number);
      const [hours, minutes] = ride.time.split(':').map(Number);
      
      // Create a date object with the correct year
      const fullYear = year < 100 ? 2000 + year : year;
      const rideDate = new Date(fullYear, month - 1, day, hours, minutes);
      
      const isExpired = rideDate < currentDate;
      
      return {
        ...ride,
        isExpired
      };
    });

    if (activeFilter === 'all') {
      return ridesWithExpiration;
    } else if (activeFilter === 'future') {
      return ridesWithExpiration.filter(ride => !ride.isExpired);
    } else {
      // 'my' filter shows rides where current user is the organizer
      return ridesWithExpiration.filter(ride => {
        return user?.uid === ride.organizerId;
      });
    }
  })();
  
  const renderRideItem = ({ item }: { item: RideDTO & { isExpired?: boolean } }) => {
    // Check if current user is the organizer of this ride
    // This compares the Firebase UID with the organizerId stored in the backend
    const isCurrentUserOrganizer = user?.uid === item.organizerId;
    
    return (
      <View style={[
        styles.rideItem, 
        item.isExpired && styles.expiredRideItem
      ]}>
        <View style={styles.actionsContainer}>
          {item.isExpired ? (
            <View style={styles.expiredBanner}>
              <Ionicons name="time-outline" size={14} color="#fff" />
              <ThemedText style={styles.expiredBannerText}>פג תוקף</ThemedText>
            </View>
          ) : isCurrentUserOrganizer ? (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleEditRide(item.id.toString())}
              >
                <Ionicons name="create-outline" size={22} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleDeleteRide(item.id.toString())}
              >
                <Ionicons name="trash-outline" size={22} color="#ff3b30" />
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      
      <TouchableOpacity 
        style={styles.rideContent}
        onPress={() => handleViewRideDetails(item.id.toString())}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.rideTitle}>
          {item.title}
        </ThemedText>
        <View style={styles.rideDetails}>
          <View style={styles.dateTimeContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={Colors.light.text + "99"} 
              style={styles.icon} 
            />
            <ThemedText style={styles.dateTime}>
              {item.date}
            </ThemedText>
          </View>
          <View style={styles.dateTimeContainer}>
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={Colors.light.text + "99"} 
              style={styles.icon} 
            />
            <ThemedText style={styles.dateTime}>
              {item.time}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.rideDetails}>
          <View style={styles.locationContainer}>
            <Ionicons 
              name="location-outline" 
              size={16} 
              color={Colors.light.text + "99"} 
              style={styles.icon} 
            />
            <ThemedText style={styles.location} numberOfLines={1}>
              {item.location}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.rideDetails}>
          <View style={styles.distanceContainer}>
            <Ionicons 
              name="bicycle-outline" 
              size={16} 
              color={Colors.light.text + "99"} 
              style={styles.icon} 
            />
            <ThemedText style={styles.distance}>
              {item.distance} ק"מ
            </ThemedText>
          </View>
          <View style={styles.participantsContainer}>
            <Ionicons 
              name="people-outline" 
              size={16} 
              color={Colors.light.text + "99"} 
              style={styles.icon} 
            />
            <ThemedText style={styles.participants}>
              עד {item.maxParticipants} משתתפים
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bicycle-outline" size={64} color={Colors.light.text + "40"} />
      <ThemedText style={styles.emptyTitle}>
        {activeFilter === 'my' ? 'אין לך רכיבות שיצרת עדיין' : 'אין רכיבות להצגה'}
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        {activeFilter === 'my' 
          ? 'צור את הרכיבה הראשונה שלך ומצא שותפים לרכיבה'
          : 'נסה לשנות את המסננים או לחזור מאוחר יותר'
        }
      </ThemedText>
      {activeFilter === 'my' && (
        <TouchableOpacity style={styles.createButton} onPress={handleCreateRide}>
          <Ionicons name="add" size={20} color="white" />
          <ThemedText style={styles.createButtonText}>צור רכיבה חדשה</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoadingSpinner = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <ThemedText style={styles.loadingText}>טוען רכיבות...</ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'all' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('all')}
        >
          <ThemedText style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            הכל
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'future' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('future')}
        >
          <ThemedText style={[styles.filterText, activeFilter === 'future' && styles.activeFilterText]}>
            עתידיות
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'my' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('my')}
        >
          <ThemedText style={[styles.filterText, activeFilter === 'my' && styles.activeFilterText]}>
            שלי
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Rides List */}
      {isLoading ? (
        renderLoadingSpinner()
      ) : (
        <FlatList
          data={filteredRides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.text,
  },
  activeFilterText: {
    color: 'white',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  rideItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  expiredRideItem: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    opacity: 0.85,
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 70,
    paddingRight: 8,
  },
  actionButton: {
    padding: 8,
    marginBottom: 4,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  expiredBanner: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  expiredBannerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  rideContent: {
    flex: 1,
    paddingLeft: 8,
  },
  rideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  rideDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  icon: {
    marginRight: 4,
  },
  dateTime: {
    fontSize: 14,
    color: Colors.light.text + "99",
  },
  location: {
    fontSize: 14,
    color: Colors.light.text + "99",
  },
  distance: {
    fontSize: 14,
    color: Colors.light.text + "99",
  },
  participants: {
    fontSize: 14,
    color: Colors.light.text + "99",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.light.text + 'AA',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 