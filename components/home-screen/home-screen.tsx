import { ThemedText } from '@/components/ThemedText';
import { FilterModal } from '@/components/filter-modal/filter-modal';
import { RideCard } from '@/components/ride-card/ride-card';
import { SearchBar } from '@/components/search-bar/search-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors } from '@/constants/Colors';
import { Config } from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import { useFilterState } from '@/hooks/use-filter-state';
import { Ride } from '@/types/ride';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// API endpoints
const PROFILE_API_BASE_URL = 'http://localhost:8080/api/v1/profiles';
const RIDES_API_BASE_URL = `${Config.API_BASE_URL}/api/v1/rides`;

// Cache the banner image source to prevent re-rendering
const BANNER_IMAGE_SOURCE = require('@/assets/images/cyclists.jpg');

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

function HomeScreenComponent() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  const [rides, setRides] = useState<RideDTO[]>([]);
  
  const {
    filterState,
    toggleFilter,
    setDistance,
    setSearch,
    clearFilters
  } = useFilterState();

  // Fetch rides from API
  const fetchRides = useCallback(async () => {
    try {
      setIsLoadingRides(true);
      console.log('🔥 HomeScreen - Fetching rides from API');
      
      // Fetch only upcoming/active rides for home screen
      const url = `${RIDES_API_BASE_URL}?page=0&size=10&includeAll=false`;
      console.log('🔥 HomeScreen - Fetching URL:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PaginationResponse = await response.json();
      console.log('🔥 HomeScreen - API response:', data);
      
      setRides(data.content);
      
    } catch (error) {
      console.error('🔥 HomeScreen - Error fetching rides:', error);
      // Don't show alert on home screen, just log the error
    } finally {
      setIsLoadingRides(false);
    }
  }, []);

  // Focus effect to ensure data is fetched when navigating to this tab
  useFocusEffect(
    useCallback(() => {
      console.log('🔥 HomeScreen - Tab focused, fetching rides');
      fetchRides();
    }, [fetchRides])
  );

  // Extract first name from full name
  const getFirstName = (fullName?: string): string => {
    if (!fullName) return 'רוכב';
    const nameParts = fullName.trim().split(' ');
    return nameParts[0] || 'רוכב';
  };

  // Get display name (full name or fallback)
  const getDisplayName = (fullName?: string): string => {
    if (!fullName) return 'רוכב';
    return fullName.trim() || 'רוכב';
  };

  // Convert RideDTO to Ride format for the RideCard component
  const filteredRides: Ride[] = rides.map(rideDto => ({
    id: rideDto.id.toString(),
    title: rideDto.title,
    description: rideDto.description,
    location: rideDto.location,
    date: rideDto.date,
    time: rideDto.time,
    distance: rideDto.distance,
    maxParticipants: rideDto.maxParticipants,
    participantsCount: 0, // Default to 0, could be enhanced later
    rideType: rideDto.rideType as any, // Type assertion for now
    difficultyLevel: rideDto.difficultyLevel as any,
    technicalLevel: rideDto.technicalLevel as any,
    speedLevel: rideDto.speedLevel as any,
    bikeType: rideDto.bikeType as any,
    organizer: {
      id: rideDto.organizerId,
      name: rideDto.organizerName,
      avatar: rideDto.organizerAvatar || '',
      phone: rideDto.organizerPhone
    },
    coordinates: rideDto.coordinates
  }));

  // No active filters since we're not using filter helpers
  const isFiltersActive = false;

  const handleFilterPress = () => {
    setFilterModalVisible(true);
  };

  const handleApplyFilters = () => {
    setFilterModalVisible(false);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleAddRidePress = () => {
    router.push('/post-ride');
  };

  const renderRideCard = ({ item }: { item: Ride }) => (
    <RideCard {...item} />
  );

  const renderEmptyState = () => (
    <EmptyState
      title="אין רכיבות זמינות"
      description="כרגע אין רכיבות פעילות באזור. השתמש בכפתור למעלה כדי להוסיף רכיבה חדשה!"
      iconName="bicycle-outline"
    />
  );

  const renderLoadingSpinner = () => (
    <View style={styles.ridesLoadingContainer}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <ThemedText style={styles.loadingText}>טוען רכיבות...</ThemedText>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeSmallText}>ברוך הבא,</ThemedText>
        <ThemedText style={styles.welcomeNameText}>
          {getDisplayName(userProfile?.fullName || user?.displayName || '')}
        </ThemedText>
      </View>

      {/* Featured Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={BANNER_IMAGE_SOURCE}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <View style={styles.bannerTextContainer}>
            <ThemedText style={styles.bannerMainText}>מעכשיו</ThemedText>
            <ThemedText style={styles.bannerSubText}>מפסיקים לרכב לבד</ThemedText>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={filterState.searchQuery}
        onChangeText={setSearch}
        onFilterPress={handleFilterPress}
        hasActiveFilters={isFiltersActive}
      />

      {/* Add Button and Section Title Row */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRidePress}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>הוסף רכיבה</ThemedText>
        </TouchableOpacity>
        
        {/* Section Title - Only when there are rides */}
        {filteredRides.length > 0 && !isLoadingRides && (
          <ThemedText style={styles.sectionTitle}>רכיבות קרובות</ThemedText>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={isLoadingRides ? [] : filteredRides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={isLoadingRides ? renderLoadingSpinner : renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        filterState={filterState}
        onFilterChange={toggleFilter}
        onDistanceChange={setDistance}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    paddingBottom: 16,
    paddingTop: 0,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    marginTop: 8,
  },
  welcomeSmallText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'right',
    marginBottom: 2,
  },
  welcomeNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'right',
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerTextContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  bannerMainText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 2,
  },
  bannerSubText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    opacity: 0.95,
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  contentContainer: {
    flexGrow: 1,
  },
  ridesLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
});

// Export memoized component to prevent unnecessary re-renders
export const HomeScreen = React.memo(HomeScreenComponent); 