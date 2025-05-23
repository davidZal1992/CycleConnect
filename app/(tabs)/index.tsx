import { RideCard } from '@/components/RideCard';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { mockRides } from '@/data/mockRides';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define allowed filter categories for type safety
type FilterCategory = 'type' | 'difficulty' | 'technical' | 'speed' | 'bikeType';

// Interface for user's location
interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [distanceRange, setDistanceRange] = useState(30); // Default 30km
  const [locationRange, setLocationRange] = useState(15); // Default 15km
  
  // Multiple selection filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTechnicalLevels, setSelectedTechnicalLevels] = useState<string[]>([]);
  const [selectedSpeeds, setSelectedSpeeds] = useState<string[]>([]);
  const [selectedBikeTypes, setSelectedBikeTypes] = useState<string[]>([]);
  
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Location-based filtering
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Get user's location using expo-location
  useEffect(() => {
    if (useLocation && !userLocation) {
      (async () => {
        setLocationLoading(true);
        
        try {
          // Request location permissions
          const { status } = await Location.requestForegroundPermissionsAsync();
          
          if (status !== 'granted') {
            Alert.alert(
              'שגיאת הרשאות',
              'לא התקבלו הרשאות מיקום. לא ניתן לסנן לפי מרחק.',
              [{ text: 'אישור', onPress: () => setUseLocation(false) }]
            );
            setLocationLoading(false);
            return;
          }
          
          // Get current location
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        } catch (error) {
          console.error('Error getting location:', error);
          Alert.alert(
            'שגיאת מיקום',
            'לא הצלחנו לקבל את המיקום שלך. בדוק את ההגדרות ונסה שוב.',
            [{ text: 'אישור', onPress: () => setUseLocation(false) }]
          );
        } finally {
          setLocationLoading(false);
        }
      })();
    }
  }, [useLocation]);
  
  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  // Calculate the distance from user to each ride location
  const getDistanceToRide = (rideCoordinates: { latitude: number, longitude: number } | undefined): number | null => {
    if (!userLocation || !rideCoordinates) return null;
    
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      rideCoordinates.latitude,
      rideCoordinates.longitude
    );
  };
  
  const toggleFilter = (category: FilterCategory, value: string) => {
    switch(category) {
      case 'type':
        setSelectedTypes(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'difficulty':
        setSelectedDifficulties(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'technical':
        setSelectedTechnicalLevels(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'speed':
        setSelectedSpeeds(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'bikeType':
        setSelectedBikeTypes(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
    }
  };
  
  const applyFilters = () => {
    setFiltersApplied(true);
    setFilterModalVisible(false);
  };
  
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedDifficulties([]);
    setSelectedTechnicalLevels([]);
    setSelectedSpeeds([]);
    setSelectedBikeTypes([]);
    setDistanceRange(30);
    setLocationRange(15);
    setFiltersApplied(false);
  };
  
  // Filter rides based on search and filter criteria
  const getFilteredRides = () => {
    return mockRides.filter(ride => {
      // Text search (title or location)
      if (searchQuery) {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesSearch = 
          ride.title.toLowerCase().includes(normalizedQuery) ||
          ride.location.toLowerCase().includes(normalizedQuery);
        
        if (!matchesSearch) return false;
      }
      
      // Only apply other filters if filters are applied
      if (filtersApplied) {
        // Ride type filter
        if (selectedTypes.length > 0 && !selectedTypes.includes(ride.rideType)) {
          return false;
        }
        
        // Difficulty level filter
        if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(ride.difficultyLevel)) {
          return false;
        }
        
        // Technical level filter
        if (selectedTechnicalLevels.length > 0 && !selectedTechnicalLevels.includes(ride.technicalLevel)) {
          return false;
        }
        
        // Speed level filter
        if (selectedSpeeds.length > 0 && !selectedSpeeds.includes(ride.speedLevel)) {
          return false;
        }
        
        // Bike type filter
        if (selectedBikeTypes.length > 0 && !selectedBikeTypes.includes(ride.bikeType || 'analog')) {
          return false;
        }
        
        // Distance filter 
        if (ride.distance > distanceRange) {
          return false;
        }
        
        // Location range filter - if location filtering is enabled
        if (useLocation && userLocation && ride.coordinates) {
          const distanceToRide = getDistanceToRide(ride.coordinates);
          if (distanceToRide !== null && distanceToRide > locationRange) {
            return false;
          }
        }
      }
      
      // Ride passes all filters
      return true;
    });
  };
  
  const FilterTag = ({ 
    label, 
    isSelected, 
    onPress 
  }: { 
    label: string, 
    isSelected: boolean, 
    onPress: () => void 
  }) => (
    <TouchableOpacity
      style={[styles.filterTag, isSelected && styles.filterTagSelected]}
      onPress={onPress}
    >
      <ThemedText style={[styles.filterTagText, isSelected && styles.filterTagTextSelected]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
  
  const router = useRouter();
  
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      {/* Main Content */}
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header Section with Welcome and Name */}
        <View style={styles.headerContainer}>
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.welcomeSmallText}>ברוך הבא,</ThemedText>
            <ThemedText style={styles.nameText}>דוד זלצמן</ThemedText>
          </View>
        </View>
        
        {/* Featured Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('@/assets/images/cyclists.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerContent}>
            <ThemedText style={styles.bannerText}>
              המקום להתחבר ולרכב ביחד
            </ThemedText>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filtersApplied && { backgroundColor: Colors.light.primary + '20' }
            ]}
            onPress={() => setFilterModalVisible(true)}
          >
            <ThemedText 
              style={[
                styles.filterText, 
                filtersApplied && { color: Colors.light.primary }
              ]}
            >
              סינון
              {filtersApplied ? ' ✓' : ''}
            </ThemedText>
            <Ionicons 
              name="options-outline" 
              size={16} 
              color={filtersApplied ? Colors.light.primary : Colors.light.text} 
            />
          </TouchableOpacity>
          
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color={Colors.light.text + "99"} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="...חפש רכיבות לפי כותרת או מיקום"
              placeholderTextColor={Colors.light.text + "99"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>
        </View>
        
        {/* Upcoming Rides Section */}
        <View style={styles.sectionContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            רכיבות מתוכננות
          </ThemedText>
          
          {mockRides.length > 0 ? (
            // Filter rides based on search query and filters
            (() => {
              const filteredRides = getFilteredRides();
              
              // If location filtering is on, sort by distance
              if (useLocation && userLocation) {
                filteredRides.sort((a, b) => {
                  const distA = getDistanceToRide(a.coordinates) || 9999;
                  const distB = getDistanceToRide(b.coordinates) || 9999;
                  return distA - distB;
                });
              }
              
              // Display ride cards or "no results" message
              return filteredRides.length > 0 ? (
                <View style={styles.ridesContainer}>
                  {filteredRides.map(ride => {
                    // Calculate distance to ride if location is available
                    const distanceToRide = useLocation && userLocation && ride.coordinates 
                      ? getDistanceToRide(ride.coordinates) 
                      : null;
                    
                    return (
                      <View key={ride.id}>
                        <RideCard {...ride} />
                        {distanceToRide !== null && (
                          <View style={styles.distanceBadge}>
                            <ThemedText style={styles.distanceBadgeText}>
                              {distanceToRide.toFixed(1)} ק"מ ממך
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.actionCard}>
                  <ThemedText style={styles.cardContent}>
                    {searchQuery 
                      ? `לא נמצאו רכיבות התואמות את החיפוש "${searchQuery}"` 
                      : 'לא נמצאו רכיבות העונות לפילטרים שנבחרו'}
                  </ThemedText>
                  {filtersApplied && (
                    <TouchableOpacity 
                      style={styles.clearFiltersButton} 
                      onPress={clearFilters}
                    >
                      <ThemedText style={styles.clearFiltersText}>
                        נקה פילטרים
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })()
          ) : (
            // No rides message
            <View style={styles.actionCard}>
              <ThemedText style={styles.cardContent}>
                טרם נקבעו רכיבות. חפש רכיבות באזורך או צור רכיבה חדשה!
              </ThemedText>
            </View>
          )}
          
          {/* Add Ride Button */}
          <TouchableOpacity 
            style={styles.floatingAddButton}
            onPress={() => router.push('/post-ride')}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Filter Modal - Redesigned */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
        presentationStyle="formSheet"
      >
        <View style={styles.newModalContainer}>
          <View style={styles.newModalContent}>
            <View style={styles.newModalHeader}>
              <ThemedText style={styles.newModalTitle}>סינון רכיבות</ThemedText>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterScrollView}>
              {/* Location Based Filtering - New Section */}
              <View style={styles.filterSection}>
                <View style={styles.locationFilterHeader}>
                  <ThemedText style={styles.filterSectionTitle}>סינון לפי מיקום שלי</ThemedText>
                  <Switch
                    trackColor={{ false: '#767577', true: Colors.light.primary + '50' }}
                    thumbColor={useLocation ? Colors.light.primary : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setUseLocation}
                    value={useLocation}
                  />
                </View>
                
                {useLocation && (
                  <>
                    {locationLoading ? (
                      <ThemedText style={styles.loadingText}>מאתר את המיקום שלך...</ThemedText>
                    ) : userLocation ? (
                      <View style={styles.locationSettings}>
                        <ThemedText style={styles.locationFoundText}>המיקום שלך נמצא</ThemedText>
                        <View style={styles.sliderContainer}>
                          <ThemedText style={styles.sliderValue}>5</ThemedText>
                          <Slider
                            style={styles.slider}
                            minimumValue={5}
                            maximumValue={50}
                            step={5}
                            value={locationRange}
                            onValueChange={setLocationRange}
                            minimumTrackTintColor={Colors.light.primary}
                            maximumTrackTintColor="#DDDDDD"
                            thumbTintColor={Colors.light.primary}
                          />
                          <ThemedText style={styles.sliderValue}>50</ThemedText>
                        </View>
                        <ThemedText style={styles.rangeDescription}>
                          הצג רכיבות במרחק של עד {locationRange} ק"מ ממך
                        </ThemedText>
                      </View>
                    ) : (
                      <ThemedText style={styles.locationErrorText}>
                        לא הצלחנו לקבל את המיקום שלך. אנא ודא שהרשאות מיקום מופעלות.
                      </ThemedText>
                    )}
                  </>
                )}
              </View>
              
              {/* Bike Type - New Section */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>סוג אופניים</ThemedText>
                <View style={styles.tagsContainer}>
                  <FilterTag 
                    label="אנלוגי" 
                    isSelected={selectedBikeTypes.includes('analog')} 
                    onPress={() => toggleFilter('bikeType', 'analog')} 
                  />
                  <FilterTag 
                    label="חשמלי" 
                    isSelected={selectedBikeTypes.includes('electric')} 
                    onPress={() => toggleFilter('bikeType', 'electric')} 
                  />
                </View>
              </View>
              
              {/* Distance Range Slider - Moved down */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>
                  מרחק רכיבה (עד {distanceRange} ק"מ)
                </ThemedText>
                <View style={styles.sliderContainer}>
                  <ThemedText style={styles.sliderValue}>5</ThemedText>
                  <Slider
                    style={styles.slider}
                    minimumValue={5}
                    maximumValue={100}
                    step={5}
                    value={distanceRange}
                    onValueChange={setDistanceRange}
                    minimumTrackTintColor={Colors.light.primary}
                    maximumTrackTintColor="#DDDDDD"
                    thumbTintColor={Colors.light.primary}
                  />
                  <ThemedText style={styles.sliderValue}>100</ThemedText>
                </View>
              </View>
              
              {/* Ride Type - Horizontal Tags */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>סוג רכיבה</ThemedText>
                <View style={styles.tagsContainer}>
                  <FilterTag 
                    label="כביש" 
                    isSelected={selectedTypes.includes('road')} 
                    onPress={() => toggleFilter('type', 'road')} 
                  />
                  <FilterTag 
                    label="שטח" 
                    isSelected={selectedTypes.includes('offroad')} 
                    onPress={() => toggleFilter('type', 'offroad')} 
                  />
                  <FilterTag 
                    label="שבילים" 
                    isSelected={selectedTypes.includes('trails')} 
                    onPress={() => toggleFilter('type', 'trails')} 
                  />
                  <FilterTag 
                    label="עירוני" 
                    isSelected={selectedTypes.includes('urban')} 
                    onPress={() => toggleFilter('type', 'urban')} 
                  />
                </View>
              </View>
              
              {/* Difficulty Level - Horizontal Tags */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>רמת קושי</ThemedText>
                <View style={styles.tagsContainer}>
                  <FilterTag 
                    label="קל" 
                    isSelected={selectedDifficulties.includes('easy')} 
                    onPress={() => toggleFilter('difficulty', 'easy')} 
                  />
                  <FilterTag 
                    label="בינוני" 
                    isSelected={selectedDifficulties.includes('medium')} 
                    onPress={() => toggleFilter('difficulty', 'medium')} 
                  />
                  <FilterTag 
                    label="קשה" 
                    isSelected={selectedDifficulties.includes('hard')} 
                    onPress={() => toggleFilter('difficulty', 'hard')} 
                  />
                </View>
              </View>
              
              {/* Technical Level - Horizontal Tags */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>רמה טכנית</ThemedText>
                <View style={styles.tagsContainer}>
                  <FilterTag 
                    label="לא טכני" 
                    isSelected={selectedTechnicalLevels.includes('none')} 
                    onPress={() => toggleFilter('technical', 'none')} 
                  />
                  <FilterTag 
                    label="טכני קל" 
                    isSelected={selectedTechnicalLevels.includes('easy')} 
                    onPress={() => toggleFilter('technical', 'easy')} 
                  />
                  <FilterTag 
                    label="טכני בינוני" 
                    isSelected={selectedTechnicalLevels.includes('medium')} 
                    onPress={() => toggleFilter('technical', 'medium')} 
                  />
                  <FilterTag 
                    label="טכני מאוד" 
                    isSelected={selectedTechnicalLevels.includes('hard')} 
                    onPress={() => toggleFilter('technical', 'hard')} 
                  />
                </View>
              </View>
              
              {/* Speed - Horizontal Tags */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>מהירות</ThemedText>
                <View style={styles.tagsContainer}>
                  <FilterTag 
                    label="איטי" 
                    isSelected={selectedSpeeds.includes('slow')} 
                    onPress={() => toggleFilter('speed', 'slow')} 
                  />
                  <FilterTag 
                    label="זורם" 
                    isSelected={selectedSpeeds.includes('medium')} 
                    onPress={() => toggleFilter('speed', 'medium')} 
                  />
                  <FilterTag 
                    label="מהיר" 
                    isSelected={selectedSpeeds.includes('fast')} 
                    onPress={() => toggleFilter('speed', 'fast')} 
                  />
                </View>
              </View>
            </ScrollView>
            
            {/* Apply Filters Button */}
            <View style={styles.modalButtonsContainer}>
              {filtersApplied && (
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={clearFilters}
                >
                  <ThemedText style={styles.clearFiltersText}>נקה פילטרים</ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={applyFilters}
              >
                <ThemedText style={styles.applyFiltersText}>סנן</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeSection: {
    alignItems: 'flex-end',
  },
  welcomeSmallText: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'right',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  // Section styling
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'right',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  ridesContainer: {
    marginBottom: 16,
  },
  addRideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  floatingAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  bannerContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
  },
  bannerText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.8,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12, 
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginLeft: 10,
    width: 80,
    height: 38,
  },
  filterText: {
    marginRight: 6,
    fontSize: 15,
    textAlign: 'right',
    fontWeight: '500',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'right',
    fontWeight: '400',
  },
  actionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardContent: {
    color: Colors.light.text,
    opacity: 0.8,
    textAlign: 'right',
    fontSize: 16,
    lineHeight: 24,
  },
  // Modal styles
  newModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newModalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  newModalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  filterScrollView: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.light.text,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderValue: {
    fontSize: 15,
    width: 30,
    textAlign: 'center',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    minWidth: 80,
    alignItems: 'center',
  },
  filterTagSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterTagText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
  },
  filterTagTextSelected: {
    color: 'white',
  },
  applyFiltersButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    height: 44,
    width: '40%',
    alignSelf: 'center',
  },
  applyFiltersText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  // Distance badges for ride cards
  distanceBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: Colors.light.primary + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary + '50',
  },
  distanceBadgeText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  // Location filter styles
  locationFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    color: Colors.light.text + 'CC',
  },
  locationFoundText: {
    color: '#4caf50',
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 10,
  },
  locationErrorText: {
    color: '#f44336',
    textAlign: 'right',
    marginTop: 10,
  },
  locationSettings: {
    marginTop: 8,
  },
  rangeDescription: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.light.text + 'DD',
    textAlign: 'center',
  },
  // Add missing styles for linter errors
  clearFiltersButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginRight: 10,
    height: 44,
    width: '40%',
  },
  clearFiltersText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});
