import { FilterCategory, FilterState } from '@/types/ride';
import { createEmptyFilterState } from '@/utils/filter-helpers';
import { useCallback, useReducer } from 'react';

type FilterAction = 
  | { type: 'TOGGLE_FILTER'; category: FilterCategory; value: string }
  | { type: 'SET_DISTANCE'; value: number }
  | { type: 'SET_SEARCH'; value: string }
  | { type: 'CLEAR_FILTERS' };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'TOGGLE_FILTER': {
      const { category, value } = action;
      
      switch (category) {
        case 'type':
          return {
            ...state,
            selectedTypes: state.selectedTypes.includes(value)
              ? state.selectedTypes.filter(item => item !== value)
              : [...state.selectedTypes, value]
          };
        case 'difficulty':
          return {
            ...state,
            selectedDifficulties: state.selectedDifficulties.includes(value)
              ? state.selectedDifficulties.filter(item => item !== value)
              : [...state.selectedDifficulties, value]
          };
        case 'technical':
          return {
            ...state,
            selectedTechnicalLevels: state.selectedTechnicalLevels.includes(value)
              ? state.selectedTechnicalLevels.filter(item => item !== value)
              : [...state.selectedTechnicalLevels, value]
          };
        case 'speed':
          return {
            ...state,
            selectedSpeeds: state.selectedSpeeds.includes(value)
              ? state.selectedSpeeds.filter(item => item !== value)
              : [...state.selectedSpeeds, value]
          };
        case 'bikeType':
          return {
            ...state,
            selectedBikeTypes: state.selectedBikeTypes.includes(value)
              ? state.selectedBikeTypes.filter(item => item !== value)
              : [...state.selectedBikeTypes, value]
          };
        default:
          return state;
      }
    }
    case 'SET_DISTANCE':
      return { ...state, distanceRange: action.value };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.value };
    case 'CLEAR_FILTERS':
      return createEmptyFilterState();
    default:
      return state;
  }
}

export function useFilterState() {
  const [filterState, dispatch] = useReducer(filterReducer, createEmptyFilterState());

  const toggleFilter = useCallback((category: FilterCategory, value: string) => {
    dispatch({ type: 'TOGGLE_FILTER', category, value });
  }, []);

  const setDistance = useCallback((value: number) => {
    dispatch({ type: 'SET_DISTANCE', value });
  }, []);

  const setSearch = useCallback((value: string) => {
    dispatch({ type: 'SET_SEARCH', value });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  return {
    filterState,
    toggleFilter,
    setDistance,
    setSearch,
    clearFilters
  };
} 