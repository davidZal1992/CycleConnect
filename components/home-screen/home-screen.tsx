import { ThemedText } from '@/components/ThemedText';
import { StaticBanner } from '@/components/common/StaticBanner';
import { FilterModal } from '@/components/filter-modal/filter-modal';
import { RideCard } from '@/components/ride-card/ride-card';
import { SearchBar } from '@/components/search-bar/search-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors } from '@/constants/Colors';
import { Config } from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounceSearch } from '@/hooks/use-debounced-search';
import { useFilterState } from '@/hooks/use-filter-state';
import { FilterState, Ride } from '@/types/ride';
import { createEmptyFilterState } from '@/utils/filter-helpers';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// API endpoints
const RIDES_API_BASE_URL = `${Config.API_BASE_URL}/api/v1/rides`;

// Global cache for rides data
interface RidesCache {
  data: RideDTO[];
  timestamp: number;
  isLoading: boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const ridesCache: RidesCache = {
  data: [],
  timestamp: 0,
  isLoading: false
};

// Global function to invalidate cache (can be called from anywhere)
export const invalidateRidesCache = () => {
  console.log('🔥 HomeScreen - Cache invalidated externally');
  ridesCache.timestamp = 0;
  ridesCache.data = [];
};

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

// Pagination response interface - matches Spring Boot Page response
interface PaginationResponse {
  content: RideDTO[];
  totalElements: number;
  totalPages: number;
  number: number; // This is the page number in Spring Boot
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Separate component for search results to prevent search bar re-renders
const SearchResultsList = React.memo(({ 
  rides, 
  searchResults, 
  isLoading, 
  hasSearchQuery, 
  isFiltersActive,
  searchError,
  searchQuery,
  onRefresh,
  isRefreshing 
}: {
  rides: RideDTO[];
  searchResults: any;
  isLoading: boolean;
  hasSearchQuery: boolean;
  isFiltersActive: boolean;
  searchError: string | null;
  searchQuery: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}) => {
  
  // Convert DTO to Ride format
  const convertRideDto = useCallback((rideDto: RideDTO): Ride => ({
    id: rideDto.id.toString(),
    title: rideDto.title,
    description: rideDto.description,
    location: rideDto.location,
    date: rideDto.date,
    time: rideDto.time,
    distance: rideDto.distance,
    maxParticipants: rideDto.maxParticipants,
    participantsCount: 0,
    rideType: rideDto.rideType as any,
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
  }), []);

  // Get rides to display - ISOLATED from search bar
  const ridesToDisplay: Ride[] = useMemo(() => {
    console.log('🔥 SearchResultsList - Computing rides to display');
    console.log('🔥 SearchResultsList - Has search query:', hasSearchQuery);
    console.log('🔥 SearchResultsList - Search results:', searchResults);
    console.log('🔥 SearchResultsList - Default rides:', rides.length);

    // If we have search results (either from search query or filters), use them
    if (searchResults && searchResults.content) {
      console.log('🔥 SearchResultsList - Using backend search results:', searchResults.content.length);
      return searchResults.content.map(convertRideDto);
    } else if (hasSearchQuery) {
      // If there's a search query but no results yet, show empty
      console.log('🔥 SearchResultsList - No search results yet, showing empty');
      return [];
    } else {
      // Use default fetched rides
      console.log('🔥 SearchResultsList - Using default rides:', rides.length);
      return rides.map(convertRideDto);
    }
  }, [hasSearchQuery, searchResults, rides, convertRideDto]);

  const renderRideCard = useCallback(({ item }: { item: Ride }) => (
    <RideCard {...item} />
  ), []);

  const renderEmptyState = useCallback(() => {
    // Show search error if exists
    if (searchError) {
      return (
        <EmptyState
          title="שגיאה בחיפוש"
          description={`שגיאה: ${searchError}. נסה שוב.`}
          iconName="alert-circle-outline"
        />
      );
    }

    // Different empty state for search/filters vs no rides
    if (hasSearchQuery || isFiltersActive) {
      return (
        <EmptyState
          title="לא נמצאו תוצאות"
          description="לא נמצאו רכיבות מתאימות. אנא הזן מיקום או כותרת"
          iconName="search-outline"
        />
      );
    }
    
    return (
      <EmptyState
        title="אין רכיבות זמינות"
        description="כרגע אין רכיבות פעילות באזור. השתמש בכפתור למעלה כדי להוסיף רכיבה חדשה!"
        iconName="bicycle-outline"
      />
    );
  }, [hasSearchQuery, searchQuery, searchError, isFiltersActive]);

  const renderLoadingSpinner = useCallback(() => (
    <View style={styles.ridesLoadingContainer}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <ThemedText style={styles.loadingText}>
        {hasSearchQuery ? 'מחפש רכיבות...' : 'טוען רכיבות...'}
      </ThemedText>
    </View>
  ), [hasSearchQuery]);

  return (
    <View style={styles.resultsContainer}>
      <FlatList
        data={ridesToDisplay}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={ridesToDisplay.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={isLoading ? renderLoadingSpinner : renderEmptyState}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        style={styles.flatListStyle}
      />
    </View>
  );
});

function HomeScreenComponent() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rides, setRides] = useState<RideDTO[]>([]);
  
  const {
    filterState,
    toggleFilter,
    setDistance,
    setSearch,
    clearFilters
  } = useFilterState();

  // Separate state for applied filters (only updated when user clicks "סנן")
  const [appliedFilterState, setAppliedFilterState] = useState<FilterState>(() => 
    createEmptyFilterState()
  );

  // Use backend search only when there's a search query
  const hasSearchQuery = useMemo(() => 
    filterState.searchQuery.trim().length > 0, 
    [filterState.searchQuery]
  );

  // Create combined filter state for search (current search query + applied filters)
  const searchFilterState = useMemo(() => ({
    ...appliedFilterState,
    searchQuery: filterState.searchQuery // Use current search query, not applied
  }), [appliedFilterState, filterState.searchQuery]);

  const { 
    searchResults, 
    isLoading: isSearchLoading, 
    error: searchError 
  } = useDebounceSearch({
    searchQuery: filterState.searchQuery,
    filterState: searchFilterState, // Use combined state
    debounceMs: 500
  });

  // Fetch rides from API - NO CACHING (for debugging)
  const fetchRides = useCallback(async (forceRefresh = false) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔥 HomeScreen - [${timestamp}] ALWAYS fetching fresh data (cache disabled)`);
    
    // Prevent multiple simultaneous requests
    if (ridesCache.isLoading) {
      console.log('🔥 HomeScreen - Already loading, skipping request');
      return;
    }
    
    try {
      ridesCache.isLoading = true;
      setIsLoadingRides(true);
      console.log('🔥 HomeScreen - Fetching fresh rides from API');
      
      // Fetch only upcoming/active rides for home screen
      const url = `${RIDES_API_BASE_URL}?page=0&size=10&includeAll=false`;
      console.log('🔥 HomeScreen - Fetching URL:', url);

      const response = await fetch(url);
      console.log('🔥 HomeScreen - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 HomeScreen - Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data: PaginationResponse = await response.json();
      console.log('🔥 HomeScreen - API response:', data);
      console.log('🔥 HomeScreen - Total rides fetched:', data.content.length);
      console.log('🔥 HomeScreen - Rides data:', data.content);
      
      // Update cache (disabled for debugging)
      ridesCache.data = data.content;
      ridesCache.timestamp = Date.now();
      
      setRides(data.content);
      
    } catch (error) {
      console.error('🔥 HomeScreen - Error fetching rides:', error);
      
      // If we have cached data, use it even if stale
      if (ridesCache.data.length > 0) {
        console.log('🔥 HomeScreen - Using stale cached data due to error');
        setRides(ridesCache.data);
      }
    } finally {
      ridesCache.isLoading = false;
      setIsLoadingRides(false);
    }
  }, []);

  // Load rides on component mount, use cached data for subsequent navigations
  useEffect(() => {
    console.log('🔥 HomeScreen - Component mounted, loading rides');
    fetchRides();
  }, [fetchRides]);

  // Focus effect to ensure data is fetched when navigating to this tab
  useFocusEffect(
    useCallback(() => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🔥 HomeScreen - [${timestamp}] ========= HOME TAB FOCUSED =========`);
      // Always fetch fresh data (cache disabled for debugging)
      fetchRides(true);
    }, [fetchRides])
  );

  // Method to force refresh (can be called from pull-to-refresh or manual refresh)
  const handleRefresh = useCallback(async () => {
    console.log('🔥 HomeScreen - Manual refresh triggered');
    setIsRefreshing(true);
    await fetchRides(true); // Force refresh
    setIsRefreshing(false);
  }, [fetchRides]);

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

  // Determine loading state
  const isLoading = useMemo(() => {
    if (hasSearchQuery) {
      return isSearchLoading;
    }
    return isLoadingRides;
  }, [hasSearchQuery, isSearchLoading, isLoadingRides]);

  // Check if filters are active (search query exists OR filters are applied) - memoized
  const isFiltersActive = useMemo(() => {
    const hasFilters = appliedFilterState.selectedTypes.length > 0 ||
                      appliedFilterState.selectedDifficulties.length > 0 ||
                      appliedFilterState.selectedTechnicalLevels.length > 0 ||
                      appliedFilterState.selectedSpeeds.length > 0 ||
                      appliedFilterState.selectedBikeTypes.length > 0 ||
                      appliedFilterState.distanceRange < 100;
    
    return hasSearchQuery || hasFilters;
  }, [hasSearchQuery, appliedFilterState]);

  const handleFilterPress = useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setFilterModalVisible(false);
    // Apply the current filter selections to trigger search
    setAppliedFilterState({ ...filterState });
  }, [filterState]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    // Also clear applied filters to stop search
    setAppliedFilterState(createEmptyFilterState());
  }, [clearFilters]);

  const handleAddRidePress = useCallback(() => {
    router.push('/post-ride');
  }, [router]);

  // Memoized welcome section to prevent banner re-renders
  const welcomeSection = useMemo(() => (
    <View style={styles.welcomeSection}>
      <ThemedText style={styles.welcomeSmallText}>ברוך הבא,</ThemedText>
      <ThemedText style={styles.welcomeNameText}>
        {getDisplayName(userProfile?.fullName || user?.displayName || '')}
      </ThemedText>
    </View>
  ), [userProfile?.fullName, user?.displayName]);

  // Memoized search section - ISOLATED from results
  const searchSection = useMemo(() => (
    <View style={styles.searchSection}>
      <SearchBar
        value={filterState.searchQuery}
        onChangeText={setSearch}
        onFilterPress={handleFilterPress}
        hasActiveFilters={isFiltersActive}
        placeholder="חפש רכיבות לפי כותרת או מיקום..."
        maintainFocus={hasSearchQuery}
      />
      
      {/* Add Button, Section Title and Refresh Button Row */}
      <View style={styles.titleRefreshContainer}>
        {/* Add Button - NO ICON */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddRidePress}>
          <ThemedText style={styles.addButtonText}>הוסף רכיבה</ThemedText>
        </TouchableOpacity>
        
        {/* Section Title */}
        <ThemedText style={styles.sectionTitleInline}>
          {isFiltersActive ? 'תוצאות חיפוש' : 'רכיבות קרובות'}
        </ThemedText>
        
      </View>
    </View>
  ), [
    filterState.searchQuery, 
    setSearch, 
    handleFilterPress, 
    isFiltersActive, 
    hasSearchQuery, 
    handleAddRidePress,
    handleRefresh, 
    isRefreshing
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Fixed header section that doesn't re-render */}
      <View style={styles.headerContainer}>
        {/* Welcome Section */}
        {welcomeSection}

        {/* Featured Banner */}
        <StaticBanner />

        {/* Search Section */}
        {searchSection}
      </View>

      {/* Results section - isolated from search bar */}
      <SearchResultsList
        rides={rides}
        searchResults={searchResults}
        isLoading={isLoading}
        hasSearchQuery={hasSearchQuery}
        isFiltersActive={isFiltersActive}
        searchError={searchError}
        searchQuery={filterState.searchQuery}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
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
    paddingBottom: 8,
    paddingTop: 0,
    backgroundColor: Colors.light.background,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
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
  searchSection: {
    paddingBottom: 8,
  },

  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshSpinner: {
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  sectionTitleInline: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
    color: Colors.light.text,
    marginHorizontal: 8,
    paddingRight: 24,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  flatListStyle: {
    flex: 1,
  },
  ridesLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  titleRefreshContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

// Export memoized component to prevent unnecessary re-renders
export const HomeScreen = React.memo(HomeScreenComponent); 