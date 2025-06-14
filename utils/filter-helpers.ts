import { FilterState, Ride } from '@/types/ride';

export function filterRidesBySearch(rides: Ride[], searchQuery: string): Ride[] {
  if (!searchQuery.trim()) return rides;
  
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return rides.filter(ride => 
    ride.title.toLowerCase().includes(normalizedQuery) ||
    ride.location.toLowerCase().includes(normalizedQuery)
  );
}

export function filterRidesByFilters(rides: Ride[], filterState: FilterState): Ride[] {
  return rides.filter(ride => {
    // Type filter
    if (filterState.selectedTypes.length > 0 && !filterState.selectedTypes.includes(ride.rideType)) {
      return false;
    }
    
    // Difficulty filter
    if (filterState.selectedDifficulties.length > 0 && !filterState.selectedDifficulties.includes(ride.difficultyLevel)) {
      return false;
    }
    
    // Technical level filter
    if (filterState.selectedTechnicalLevels.length > 0 && !filterState.selectedTechnicalLevels.includes(ride.technicalLevel)) {
      return false;
    }
    
    // Speed filter
    if (filterState.selectedSpeeds.length > 0 && !filterState.selectedSpeeds.includes(ride.speedLevel)) {
      return false;
    }
    
    // Bike type filter
    const rideBikeType = ride.bikeType || 'analog';
    if (filterState.selectedBikeTypes.length > 0 && !filterState.selectedBikeTypes.includes(rideBikeType)) {
      return false;
    }
    
    // Distance filter
    if (ride.distance > filterState.distanceRange) {
      return false;
    }
    
    return true;
  });
}

export function getFilteredRides(rides: Ride[], filterState: FilterState): Ride[] {
  let filteredRides = filterRidesBySearch(rides, filterState.searchQuery);
  filteredRides = filterRidesByFilters(filteredRides, filterState);
  return filteredRides;
}

export function hasActiveFilters(filterState: FilterState): boolean {
  return (
    filterState.selectedTypes.length > 0 ||
    filterState.selectedDifficulties.length > 0 ||
    filterState.selectedTechnicalLevels.length > 0 ||
    filterState.selectedSpeeds.length > 0 ||
    filterState.selectedBikeTypes.length > 0 ||
    filterState.distanceRange < 100 ||
    filterState.searchQuery.trim() !== ''
  );
}

export function createEmptyFilterState(): FilterState {
  return {
    selectedTypes: [],
    selectedDifficulties: [],
    selectedTechnicalLevels: [],
    selectedSpeeds: [],
    selectedBikeTypes: [],
    distanceRange: 100,
    searchQuery: ''
  };
} 