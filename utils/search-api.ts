import { Config } from '@/constants/Config';
import { FilterState } from '@/types/ride';

export interface RideSearchRequest {
  searchQuery?: string;
  distanceRange?: number;
  latitude?: number;
  longitude?: number;
  bikeTypes?: string[];
  rideTypes?: string[];
  difficultyLevels?: string[];
  technicalLevels?: string[];
  speedLevels?: string[];
  includeUpcomingOnly?: boolean;
}

export interface SearchResponse {
  content: any[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export class RideSearchAPI {
  private static BASE_URL = `${Config.API_BASE_URL}/api/v1/rides`;

  static async searchRides(
    searchCriteria: RideSearchRequest,
    page: number = 0,
    size: number = 10
  ): Promise<SearchResponse> {
    const url = `${this.BASE_URL}/search?page=${page}&size=${size}`;
    
    console.log('🔥 RideSearchAPI - Calling backend search:', url);
    console.log('🔥 RideSearchAPI - Search criteria:', searchCriteria);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchCriteria)
    });

    console.log('🔥 RideSearchAPI - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔥 RideSearchAPI - Error response:', errorText);
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🔥 RideSearchAPI - Search results:', result);
    return result;
  }

  static buildSearchRequest(
    searchQuery: string,
    filterState: FilterState,
    userLocation?: { latitude: number; longitude: number }
  ): RideSearchRequest {
    // Don't include filter arrays if ALL options are selected (treat as no filter)
    const allBikeTypes = ['electric', 'analog'];
    const allRideTypes = ['road', 'offroad', 'trails', 'urban'];
    const allDifficulties = ['easy', 'medium', 'hard'];
    const allTechnicalLevels = ['none', 'easy', 'medium', 'hard'];
    const allSpeedLevels = ['slow', 'medium', 'medium-high', 'fast'];
    
    const hasAllBikeTypes = filterState.selectedBikeTypes.length === allBikeTypes.length && 
                           allBikeTypes.every(type => filterState.selectedBikeTypes.includes(type));
    const hasAllRideTypes = filterState.selectedTypes.length === allRideTypes.length && 
                           allRideTypes.every(type => filterState.selectedTypes.includes(type));
    const hasAllDifficulties = filterState.selectedDifficulties.length === allDifficulties.length && 
                              allDifficulties.every(diff => filterState.selectedDifficulties.includes(diff));
    const hasAllTechnicalLevels = filterState.selectedTechnicalLevels.length === allTechnicalLevels.length && 
                                 allTechnicalLevels.every(level => filterState.selectedTechnicalLevels.includes(level));
    const hasAllSpeedLevels = filterState.selectedSpeeds.length === allSpeedLevels.length && 
                             allSpeedLevels.every(speed => filterState.selectedSpeeds.includes(speed));
    
    const request = {
      searchQuery: searchQuery.trim() || undefined,
      distanceRange: filterState.distanceRange,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude,
      bikeTypes: (!hasAllBikeTypes && filterState.selectedBikeTypes.length > 0) ? filterState.selectedBikeTypes : undefined,
      rideTypes: (!hasAllRideTypes && filterState.selectedTypes.length > 0) ? filterState.selectedTypes : undefined,
      difficultyLevels: (!hasAllDifficulties && filterState.selectedDifficulties.length > 0) ? filterState.selectedDifficulties : undefined,
      technicalLevels: (!hasAllTechnicalLevels && filterState.selectedTechnicalLevels.length > 0) ? filterState.selectedTechnicalLevels : undefined,
      speedLevels: (!hasAllSpeedLevels && filterState.selectedSpeeds.length > 0) ? filterState.selectedSpeeds : undefined,
      includeUpcomingOnly: true
    };
    
    console.log('🔥 RideSearchAPI - Built search request:', request);
    return request;
  }
} 