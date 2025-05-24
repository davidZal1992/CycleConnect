import { RideCard } from '@/components/RideCard';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define allowed filter categories for type safety
type FilterCategory = 'type' | 'difficulty' | 'technical' | 'speed' | 'bikeType';

// בשביל קוד מסודר, נייצר פונקציית עזר לפורמט תאריכים
const formatDateAndTime = (dateObj: Date): { date: string, time: string } => {
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`
  };
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [distanceRange, setDistanceRange] = useState(30); // Default 30km
  
  // Multiple selection filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTechnicalLevels, setSelectedTechnicalLevels] = useState<string[]>([]);
  const [selectedSpeeds, setSelectedSpeeds] = useState<string[]>([]);
  const [selectedBikeTypes, setSelectedBikeTypes] = useState<string[]>([]);
  
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  const toggleFilter = (category: FilterCategory, value: string) => {
    console.log(`Toggling ${category} filter: ${value}`);
    console.log(`Before toggle - ${category} selected:`, 
      category === 'type' ? selectedTypes :
      category === 'difficulty' ? selectedDifficulties :
      category === 'technical' ? selectedTechnicalLevels :
      category === 'speed' ? selectedSpeeds :
      category === 'bikeType' ? selectedBikeTypes : []
    );
    
    switch(category) {
      case 'type':
        setSelectedTypes(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'difficulty':
        console.log(`Toggle difficulty: ${value}`);
        console.log('Current selectedDifficulties:', selectedDifficulties);
        // This is the exact string value used to check for inclusion
        console.log('Hard key check:', 'hard' === value, value === 'hard');
        
        setSelectedDifficulties(prev => {
          const newDifficulties = prev.includes(value) 
            ? prev.filter(item => item !== value) 
            : [...prev, value];
          console.log(`New difficulties after toggling ${value}:`, newDifficulties);
          return newDifficulties;
        });
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
        console.log(`Toggle bike type: ${value}`);
        console.log('Current selectedBikeTypes:', selectedBikeTypes);
        
        setSelectedBikeTypes(prev => {
          const newBikeTypes = prev.includes(value) 
            ? prev.filter(item => item !== value) 
            : [...prev, value];
          console.log(`New bike types after toggling ${value}:`, newBikeTypes);
          return newBikeTypes;
        });
        break;
    }
  };
  
  const applyFilters = () => {
    console.log("Applied filters:");
    console.log("Type:", selectedTypes);
    console.log("Difficulty:", selectedDifficulties);
    console.log("Technical:", selectedTechnicalLevels);
    console.log("Speed:", selectedSpeeds);
    console.log("Bike type:", selectedBikeTypes);
    console.log("Distance range:", distanceRange);
    
    // Test specific issue with difficulty filtering
    if (selectedDifficulties.length > 0) {
      let testFilter = rides.filter(ride => 
        selectedDifficulties.includes(ride.difficultyLevel)
      );
      
      console.log("Difficulty filtered rides:", testFilter.map(r => ({
        title: r.title,
        difficulty: r.difficultyLevel
      })));
    }
    
    // Test specific issue with bike type filtering
    if (selectedBikeTypes.length > 0) {
      let testFilter = rides.filter(ride => 
        selectedBikeTypes.includes(ride.bikeType || 'analog')
      );
      
      console.log("Bike type filtered rides:", testFilter.map(r => ({
        title: r.title,
        bikeType: r.bikeType || 'analog'
      })));
    }
    
    // Set filters as applied if any filter is selected
    const hasAnyFilter = 
      selectedTypes.length > 0 || 
      selectedDifficulties.length > 0 || 
      selectedTechnicalLevels.length > 0 || 
      selectedSpeeds.length > 0 || 
      selectedBikeTypes.length > 0 ||
      distanceRange < 100; // If distance is limited
    
    console.log("Has any filter:", hasAnyFilter);
    setFiltersApplied(hasAnyFilter);
    
    // Close the modal
    setFilterModalVisible(false);
    
    // Force re-filtering
    const filtered = getFilteredRides();
    console.log("Filtered rides count:", filtered.length);
    setFilteredRides(filtered);
  };
  
  const clearFilters = () => {
    console.log('Clearing all filters');
    
    // Reset all filter arrays to empty
    setSelectedTypes([]);
    setSelectedDifficulties([]);
    setSelectedTechnicalLevels([]);
    setSelectedSpeeds([]);
    setSelectedBikeTypes([]);
    
    // Reset distance range to maximum
    setDistanceRange(100);
    
    // Reset search query
    setSearchQuery('');
    
    // Set filters as not applied
    setFiltersApplied(false);
    
    // Log the state after clearing
    console.log("After clearing filters:");
    console.log("selectedTypes:", []);
    console.log("selectedDifficulties:", []);
    console.log("selectedBikeTypes:", []);
    console.log("distanceRange:", 100);
    
    // Force update filtered rides to show all rides
    console.log("Resetting to all rides:", rides.length);
    setFilteredRides(rides);
  };
  
  // Filter rides based on search and filter criteria
  const getFilteredRides = () => {
    // Use the rides state variable instead of mockRides directly
    let results = [...rides];
    
    console.log("Starting filtering with", results.length, "rides");
    
    // Filter by search query (title or location)
    if (searchQuery.trim() !== '') {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      results = results.filter(ride => {
        const matchesTitle = ride.title.toLowerCase().includes(normalizedQuery);
        const matchesLocation = ride.location.toLowerCase().includes(normalizedQuery);
        return matchesTitle || matchesLocation;
      });
      console.log("After search filter:", results.length, "rides remain");
    }
    
    // Only apply other filters if filters are applied
    if (filtersApplied) {
      // Ride type filter
      if (selectedTypes.length > 0) {
        console.log("Filtering by types:", selectedTypes);
        results = results.filter(ride => selectedTypes.includes(ride.rideType));
        console.log("After type filter:", results.length, "rides remain");
      }
      
      // Difficulty level filter
      if (selectedDifficulties.length > 0) {
        console.log("Filtering by difficulties:", selectedDifficulties);
        console.log("Current rides before difficulty filter:", results.map(r => ({ title: r.title, difficulty: r.difficultyLevel })));
        
        results = results.filter(ride => {
          const difficulty = ride.difficultyLevel;
          const isIncluded = selectedDifficulties.includes(difficulty);
          console.log(`Checking ride "${ride.title}" with difficulty "${difficulty}": ${isIncluded ? 'KEEP' : 'FILTER OUT'}`);
          return isIncluded;
        });
        
        console.log("After difficulty filter:", results.length, "rides remain");
      }
      
      // Technical level filter
      if (selectedTechnicalLevels.length > 0) {
        results = results.filter(ride => selectedTechnicalLevels.includes(ride.technicalLevel));
        console.log("After technical filter:", results.length, "rides remain");
      }
      
      // Speed level filter
      if (selectedSpeeds.length > 0) {
        results = results.filter(ride => selectedSpeeds.includes(ride.speedLevel));
        console.log("After speed filter:", results.length, "rides remain");
      }
      
      // Bike type filter
      if (selectedBikeTypes.length > 0) {
        console.log("Filtering by bike types:", selectedBikeTypes);
        
        // Log each ride's bike type before filtering
        console.log("Rides before bike type filtering:", results.length);
        results.forEach(ride => {
          const bikeType = ride.bikeType || 'analog';
          console.log(`Ride "${ride.title}": bikeType = ${bikeType}`);
        });
        
        // Filter rides that match ANY of the selected bike types
        results = results.filter(ride => {
          const bikeType = ride.bikeType || 'analog';
          const matches = selectedBikeTypes.includes(bikeType);
          console.log(`Ride "${ride.title}" with bikeType "${bikeType}": ${matches ? 'KEEP' : 'REMOVE'}`);
          return matches;
        });
        
        console.log("After bike type filter:", results.length, "rides remain");
      }
      
      // Distance filter 
      if (distanceRange < 100) { // Only if not at max
        results = results.filter(ride => ride.distance <= distanceRange);
        console.log("After distance filter:", results.length, "rides remain");
      }
    }
    
    console.log("Final filtered rides:", results.length);
    return results;
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
  
  // Add state for rides
  const [rides, setRides] = useState<any[]>([]);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<any>({});
  
  // Fetch rides from API or mock data
  useEffect(() => {
    // Simulated API fetch
    setTimeout(() => {
      // Mock data - in a real app, this would come from your API
      const date1 = new Date('2025-06-01T07:30:00');
      const date2 = new Date('2025-06-02T16:00:00');
      const date3 = new Date('2025-06-03T18:30:00');
      const date4 = new Date('2025-06-04T06:00:00');
      const date5 = new Date('2025-06-05T10:00:00');
      
      // Log before setting up the rides
      console.log("Setting up mock rides with these difficulty values:");
      console.log("קל (easy), בינוני (medium), קשה (hard)");
      
      const mockRides = [
        {
          id: '1',
          title: 'רכיבת בוקר בפארק הירקון',
          date: formatDateAndTime(date1).date,
          time: formatDateAndTime(date1).time,
          organizer: {
            id: '101',
            name: 'אבי כהן',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          },
          participantsCount: 3,
          maxParticipants: 8,
          distance: 25,
          location: 'פארק הירקון, תל אביב',
          coordinates: { latitude: 32.099, longitude: 34.815 }, // Yarkon Park
          rideType: 'road',
          difficultyLevel: 'medium',
          technicalLevel: 'easy',
          speedLevel: 'medium',
          bikeType: 'analog'
        },
        {
          id: '2',
          title: 'רכיבת שטח ביער בן שמן',
          date: formatDateAndTime(date2).date,
          time: formatDateAndTime(date2).time,
          organizer: {
            id: '102',
            name: 'מיכל לוי',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          },
          participantsCount: 5,
          maxParticipants: 10,
          distance: 18,
          location: 'יער בן שמן',
          coordinates: { latitude: 31.996, longitude: 34.947 }, // Ben Shemen Forest
          rideType: 'trails',
          difficultyLevel: 'hard',
          technicalLevel: 'medium',
          speedLevel: 'slow',
          bikeType: 'electric'
        },
        {
          id: '3',
          title: 'רכיבה עירונית בירושלים',
          date: formatDateAndTime(date3).date,
          time: formatDateAndTime(date3).time,
          organizer: {
            id: '103',
            name: 'דוד זלצמן',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
          },
          participantsCount: 2,
          maxParticipants: 6,
          distance: 15,
          location: 'רחביה, ירושלים',
          coordinates: { latitude: 31.768, longitude: 35.214 }, // Jerusalem
          rideType: 'urban',
          difficultyLevel: 'easy',
          technicalLevel: 'none',
          speedLevel: 'medium',
          bikeType: 'electric'
        },
        {
          id: '4',
          title: 'רכיבת כביש מהירה לאורך החוף',
          date: formatDateAndTime(date4).date,
          time: formatDateAndTime(date4).time,
          organizer: {
            id: '104',
            name: 'רון אילון',
            avatar: 'https://randomuser.me/api/portraits/men/40.jpg',
          },
          participantsCount: 8,
          maxParticipants: 12,
          distance: 40,
          location: 'חיפה',
          coordinates: { latitude: 32.794, longitude: 34.990 }, // Haifa
          rideType: 'road',
          difficultyLevel: 'hard',
          technicalLevel: 'hard',
          speedLevel: 'fast',
          bikeType: 'analog'
        },
        {
          id: '5',
          title: 'טיול אופניים משפחתי',
          date: formatDateAndTime(date5).date,
          time: formatDateAndTime(date5).time,
          organizer: {
            id: '105',
            name: 'נועה ברק',
            avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
          },
          participantsCount: 4,
          maxParticipants: 15,
          distance: 10,
          location: 'נתניה',
          coordinates: { latitude: 32.333, longitude: 34.860 }, // Netanya
          rideType: 'trails',
          difficultyLevel: 'easy',
          technicalLevel: 'none',
          speedLevel: 'slow',
          bikeType: 'analog'
        }
      ];
      
      // Log the difficulty levels directly
      console.log("Mock rides difficulty values:");
      mockRides.forEach(ride => {
        console.log(`${ride.title}: ${ride.difficultyLevel}`);
      });
      
      setRides(mockRides);
      setFilteredRides(mockRides);
      setLoading(false);
    }, 1500);
  }, []);
  
  // Apply all filters 
  useEffect(() => {
    if (rides.length === 0) return;
    
    // Create a copy of the original rides
    let filtered = [...rides];
    
    // Filter by ride type
    if (activeFilters.rideType && activeFilters.rideType.length > 0) {
      filtered = filtered.filter(ride => 
        activeFilters.rideType.includes(ride.rideType)
      );
    }
    
    // Filter by difficulty level
    if (activeFilters.difficultyLevel && activeFilters.difficultyLevel.length > 0) {
      filtered = filtered.filter(ride => 
        activeFilters.difficultyLevel.includes(ride.difficultyLevel)
      );
    }
    
    setFilteredRides(filtered);
  }, [rides, activeFilters]);
  
  // Handle filter changes
  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };
  
  // עדכון הקוד כך שיציג את הרכיבות המסוננות בכל פעם שמשתנה חיפוש או פילטרים
  useEffect(() => {
    console.log("Filtering update triggered");
    console.log("Search query:", searchQuery);
    console.log("Filters applied:", filtersApplied);
    
    // Get filtered rides based on current filters and search
    const filteredResults = getFilteredRides();
    console.log(`Found ${filteredResults.length} rides after filtering`);
    
    // Update the state with filtered results
    setFilteredRides(filteredResults);
  }, [
    searchQuery, 
    filtersApplied, 
    selectedTypes, 
    selectedDifficulties, 
    selectedTechnicalLevels, 
    selectedSpeeds, 
    selectedBikeTypes, 
    distanceRange
  ]);
  
  // Print out the difficultyLevel values for each ride for debugging
  useEffect(() => {
    if (rides.length > 0) {
      console.log("All rides with difficulty levels:");
      rides.forEach(ride => {
        console.log(`Ride "${ride.title}": ${ride.difficultyLevel}`);
      });
    }
  }, [rides]);
  
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      {/* Main Content */}
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section with Welcome and Name */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>ברוך הבא,</ThemedText>
          <ThemedText style={styles.subtitle}>דוד זלצמן</ThemedText>
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
        <View style={styles.searchContainer}>
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
              placeholder="חפש שותפים על פי מיקום או כותרת"
              placeholderTextColor={Colors.light.text + '60'}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                console.log('Search query updated:', text);
              }}
              onSubmitEditing={() => {
                console.log('Search submitted:', searchQuery);
                setFilteredRides(getFilteredRides());
              }}
              returnKeyType="search"
              textAlign="right"
            />
          </View>
        </View>
        
        {/* Upcoming Rides Section */}
        <View style={styles.sectionContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            רכיבות מתוכננות
          </ThemedText>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <ThemedText style={styles.loadingText}>טוען רכיבות...</ThemedText>
            </View>
          ) : filteredRides.length > 0 ? (
            <View style={styles.ridesContainer}>
              {filteredRides.map(ride => (
                <View key={ride.id} style={styles.rideCardContainer}>
                  <RideCard {...ride} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons 
                name="search-outline" 
                size={60} 
                color={Colors.light.text + '40'} 
              />
              <ThemedText style={styles.emptyStateTitle}>
                {searchQuery 
                  ? `לא נמצאו רכיבות` 
                  : 'לא נמצאו רכיבות מתאימות'}
              </ThemedText>
              <ThemedText style={styles.emptyStateDescription}>
                {searchQuery 
                  ? `החיפוש "${searchQuery}" לא החזיר תוצאות` 
                  : 'נסה להסיר חלק מהפילטרים כדי לראות יותר רכיבות'}
              </ThemedText>
              
              {filtersApplied && (
                <View style={styles.emptyStateButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.emptyStateButton} 
                    onPress={clearFilters}
                  >
                    <ThemedText style={styles.emptyStateButtonText}>
                      נקה
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          
          {/* כפתור הוספת רכיבה - מוזז למטה */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/post-ride')}
          >
            <Ionicons name="add" size={22} color="white" style={styles.addButtonIcon} />
            <ThemedText style={styles.addButtonText}>הוספת רכיבה</ThemedText>
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
              {/* Location Based Filtering - Removed for now */}
              
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
                    label="קושי קל" 
                    isSelected={selectedDifficulties.includes('easy')} 
                    onPress={() => toggleFilter('difficulty', 'easy')} 
                  />
                  <FilterTag 
                    label="קושי בינוני" 
                    isSelected={selectedDifficulties.includes('medium')} 
                    onPress={() => toggleFilter('difficulty', 'medium')} 
                  />
                  <FilterTag 
                    label="קושי קשה" 
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
                    label="קצב איטי" 
                    isSelected={selectedSpeeds.includes('slow')} 
                    onPress={() => toggleFilter('speed', 'slow')} 
                  />
                  <FilterTag 
                    label="קצב זורם" 
                    isSelected={selectedSpeeds.includes('medium')} 
                    onPress={() => toggleFilter('speed', 'medium')} 
                  />
                  <FilterTag 
                    label="קצב מהיר" 
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
                  style={styles.emptyStateButton}
                  onPress={clearFilters}
                >
                  <ThemedText style={styles.emptyStateButtonText}>נקה</ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={applyFilters}
              >
                <ThemedText style={styles.emptyStateButtonText}>סנן</ThemedText>
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
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    color: Colors.light.text + '99',
    textAlign: 'right',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  searchContainer: {
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  filterTagSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterTagText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  filterTagTextSelected: {
    color: 'white',
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.text,
  },
  toggleSwitch: {
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'right',
  },
  ridesContainer: {
    marginTop: 10,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  emptyMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyMessageText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'right',
    lineHeight: 24,
    flex: 1,
  },
  smallClearFiltersButton: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    height: 32,
  },
  smallClearFiltersText: {
    color: Colors.light.primary,
    fontWeight: '500',
    fontSize: 13,
  },
  createButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  locationWarning: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 5,
  },
  locationInfo: {
    color: '#4caf50',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.text + 'CC',
    textAlign: 'center',
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
    marginRight: 10,
    width: 80,
    height: 40,
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
  locationFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  clearFiltersButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 36,
    margin: 0,
  },
  clearFiltersText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 16,
    height: 36,
  },
  applyFiltersButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 36,
    margin: 0,
  },
  applyFiltersText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  rideCardContainer: {
    position: 'relative',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 25,
    padding: 12,
    marginTop: 20,
    marginBottom: 16,
    alignSelf: 'center',
    width: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  addButtonIcon: {
    marginLeft: 4,
  },
  testingDistanceContainer: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 6,
    margin: 10,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 99,
  },
  testingDistanceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
  distanceLabelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999,
  },
  emptyStateContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 15,
    color: Colors.light.text + 'AA',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
    height: 36,
  },
  emptyStateButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 36,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
});
