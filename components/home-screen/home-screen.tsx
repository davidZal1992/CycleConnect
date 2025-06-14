import { ThemedText } from '@/components/ThemedText';
import { FilterModal } from '@/components/filter-modal/filter-modal';
import { RideCard } from '@/components/ride-card/ride-card';
import { SearchBar } from '@/components/search-bar/search-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors } from '@/constants/Colors';
import { mockRides } from '@/data/mock-rides';
import { useFilterState } from '@/hooks/use-filter-state';
import { Ride } from '@/types/ride';
import { getFilteredRides, hasActiveFilters } from '@/utils/filter-helpers';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  const router = useRouter();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  
  const {
    filterState,
    toggleFilter,
    setDistance,
    setSearch,
    clearFilters
  } = useFilterState();

  const filteredRides = useMemo(() => 
    getFilteredRides(mockRides, filterState), 
    [filterState]
  );

  const isFiltersActive = useMemo(() => 
    hasActiveFilters(filterState), 
    [filterState]
  );

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
      title="לא נמצאו רכיבות"
      description="נסה לשנות את הפילטרים או לחפש משהו אחר"
      iconName="search-outline"
      buttonText="נקה פילטרים"
      onButtonPress={handleClearFilters}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeSmallText}>ברוך הבא,</ThemedText>
        <ThemedText style={styles.welcomeNameText}>דוד זלצמן</ThemedText>
      </View>

      {/* Featured Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={require('@/assets/images/cyclists.jpg')}
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

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRidePress}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>הוסף רכיבה</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.sectionTitle}>רכיבות קרובות</ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={filteredRides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filteredRides.length === 0 ? styles.emptyContent : undefined}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  emptyContent: {
    flexGrow: 1,
  },
}); 