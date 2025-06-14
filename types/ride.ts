export type RideType = 'road' | 'offroad' | 'trails' | 'urban' | 'gravel';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type TechnicalLevel = 'none' | 'easy' | 'medium' | 'hard';
export type SpeedLevel = 'slow' | 'medium' | 'medium-high' | 'fast';
export type BikeType = 'electric' | 'analog';
export type FilterCategory = 'type' | 'difficulty' | 'technical' | 'speed' | 'bikeType';

export interface RideCoordinates {
  latitude: number;
  longitude: number;
}

export interface RideOrganizer {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
}

export interface Ride {
  id: string;
  title: string;
  location: string;
  coordinates?: RideCoordinates;
  date: string;
  time: string;
  distance: number;
  description?: string;
  organizer: RideOrganizer;
  participantsCount: number;
  maxParticipants?: number;
  rideType: RideType;
  difficultyLevel: DifficultyLevel;
  technicalLevel: TechnicalLevel;
  speedLevel: SpeedLevel;
  bikeType?: BikeType;
  isFavorite?: boolean;
}

export interface FilterState {
  selectedTypes: string[];
  selectedDifficulties: string[];
  selectedTechnicalLevels: string[];
  selectedSpeeds: string[];
  selectedBikeTypes: string[];
  distanceRange: number;
  searchQuery: string;
}

export interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  filterState: FilterState;
  onFilterChange: (category: FilterCategory, value: string) => void;
  onDistanceChange: (value: number) => void;
} 