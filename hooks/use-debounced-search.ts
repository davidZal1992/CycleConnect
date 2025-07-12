import { FilterState } from '@/types/ride';
import { RideSearchAPI, SearchResponse } from '@/utils/search-api';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDebounceSearchProps {
  searchQuery: string;
  filterState: FilterState;
  userLocation?: { latitude: number; longitude: number };
  debounceMs?: number;
}

export function useDebounceSearch({ 
  searchQuery, 
  filterState, 
  userLocation,
  debounceMs = 500 
}: UseDebounceSearchProps) {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (
    query: string,
    filters: FilterState,
    location?: { latitude: number; longitude: number }
  ) => {
    console.log('🔥 useDebounceSearch - performSearch called with query:', query);
    
    // Check if we have any filters applied
    const hasFilters = filters.selectedTypes.length > 0 ||
                      filters.selectedDifficulties.length > 0 ||
                      filters.selectedTechnicalLevels.length > 0 ||
                      filters.selectedSpeeds.length > 0 ||
                      filters.selectedBikeTypes.length > 0 ||
                      filters.distanceRange < 100;
    
    // Don't search if query is empty AND no filters are applied
    if ((!query || query.trim().length === 0) && !hasFilters) {
      console.log('🔥 useDebounceSearch - Empty query and no filters, skipping search');
      setSearchResults(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('🔥 useDebounceSearch - Starting search for:', query, 'with filters:', hasFilters);

    try {
      const searchRequest = RideSearchAPI.buildSearchRequest(query, filters, location);
      console.log('🔥 useDebounceSearch - Built search request:', searchRequest);
      
      const results = await RideSearchAPI.searchRides(searchRequest);
      console.log('🔥 useDebounceSearch - Search completed:', results);
      
      setSearchResults(results);
    } catch (err) {
      console.error('🔥 useDebounceSearch - Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear the previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      performSearch(searchQuery, filterState, userLocation);
    }, debounceMs);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery, filterState, userLocation, debounceMs, performSearch]);

  const refetch = useCallback(() => {
    // Check if we have any filters applied
    const hasFilters = filterState.selectedTypes.length > 0 ||
                      filterState.selectedDifficulties.length > 0 ||
                      filterState.selectedTechnicalLevels.length > 0 ||
                      filterState.selectedSpeeds.length > 0 ||
                      filterState.selectedBikeTypes.length > 0 ||
                      filterState.distanceRange < 100;
    
    if ((searchQuery && searchQuery.trim().length > 0) || hasFilters) {
      performSearch(searchQuery, filterState, userLocation);
    }
  }, [searchQuery, filterState, userLocation, performSearch]);

  return {
    searchResults,
    isLoading,
    error,
    refetch
  };
} 