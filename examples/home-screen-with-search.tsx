import { ThemedText } from '@/components/common/ThemedText';
import { FilterModal } from '@/components/filter-modal/filter-modal';
import { RideCard } from '@/components/ride-card/ride-card';
import { SearchBar } from '@/components/search-bar/search-bar';
import { useDebounceSearch } from '@/hooks/use-debounced-search';
import { useFilterState } from '@/hooks/use-filter-state';
import { Ride } from '@/types/ride';
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';

// Example component showing how to integrate the search API
export function HomeScreenWithSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  
  const { filterState, toggleFilter, setDistance, clearFilters } = useFilterState();
  
  // Use the debounced search hook
  const { searchResults, isLoading, error, refetch } = useDebounceSearch({
    searchQuery,
    filterState,
    userLocation,
    debounceMs: 500
  });

  // Get user location on component mount
  useEffect(() => {
    // This is just an example - you might want to use expo-location or similar
    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     setUserLocation({
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude
    //     });
    //   },
    //   (error) => {
    //     console.log('Error getting location:', error);
    //   }
    // );
  }, []);

  const handleFilterApply = () => {
    setIsFilterModalVisible(false);
    // Search will be triggered automatically by the useDebounceSearch hook
  };

  const handleFilterClear = () => {
    clearFilters();
    setIsFilterModalVisible(false);
  };

  const hasActiveFilters = () => {
    return filterState.selectedTypes.length > 0 ||
           filterState.selectedDifficulties.length > 0 ||
           filterState.selectedTechnicalLevels.length > 0 ||
           filterState.selectedSpeeds.length > 0 ||
           filterState.selectedBikeTypes.length > 0 ||
           filterState.distanceRange !== 50; // Assuming 50 is default
  };

  const renderRideItem = ({ item }: { item: Ride }) => (
    <RideCard {...item} />
  );

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Error: {error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => setIsFilterModalVisible(true)}
        hasActiveFilters={hasActiveFilters()}
        placeholder="חפש רכיבות לפי מיקום או כותרת..."
      />

      {isLoading && (
        <View style={{ padding: 16 }}>
          <ThemedText>מחפש רכיבות...</ThemedText>
        </View>
      )}

      <FlatList
        data={searchResults?.content || []}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <ThemedText>לא נמצאו רכיבות מתאימות</ThemedText>
          </View>
        )}
      />

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        filterState={filterState}
        onFilterChange={toggleFilter}
        onDistanceChange={setDistance}
      />
    </View>
  );
}

// Example usage in your main home screen component:
/*
export function HomeScreen() {
  return <HomeScreenWithSearch />;
}
*/ 