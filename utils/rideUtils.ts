/**
 * Ride Utility Functions
 */
import {
    BikeType,
    DifficultyLevel,
    Ride,
    RideType,
    SpeedLevel,
    TechnicalLevel
} from '@/app/types/Ride';
import { isRideExpired } from './dateUtils';

/**
 * Get color based on level
 */
export function getLevelColor(level: 'easy' | 'medium' | 'hard'): string {
  switch(level) {
    case 'easy': return '#4caf50'; // Green
    case 'medium': return '#ff9800'; // Orange
    case 'hard': return '#f44336'; // Red
  }
}

/**
 * Get color for difficulty level
 */
export function getDifficultyColor(level: DifficultyLevel): string {
  return getLevelColor(level);
}

/**
 * Get color for technical level
 */
export function getTechnicalColor(level: TechnicalLevel): string {
  switch(level) {
    case 'none': return '#9e9e9e'; // Gray
    case 'easy': return getLevelColor('easy');
    case 'medium': return getLevelColor('medium');
    case 'hard': return getLevelColor('hard');
  }
}

/**
 * Get color for speed level
 */
export function getSpeedColor(level: SpeedLevel): string {
  switch(level) {
    case 'slow': return getLevelColor('easy');
    case 'medium': return getLevelColor('medium');
    case 'fast': return getLevelColor('hard');
  }
}

/**
 * Get technical level text in Hebrew
 */
export function getTechnicalLevelText(level: TechnicalLevel): string {
  switch(level) {
    case 'none': return 'לא טכני';
    case 'easy': return 'טכני קל';
    case 'medium': return 'טכני בינוני';
    case 'hard': return 'טכני מאוד';
  }
}

/**
 * Get speed level text in Hebrew
 */
export function getSpeedText(speed: SpeedLevel): string {
  switch(speed) {
    case 'slow': return 'קצב איטי';
    case 'medium': return 'קצב זורם';
    case 'fast': return 'קצב מהיר';
  }
}

/**
 * Get ride type text in Hebrew
 */
export function getRideTypeText(type: RideType): string {
  switch(type) {
    case 'road': return 'כביש';
    case 'offroad': return 'שטח';
    case 'trails': return 'שבילים';
    case 'urban': return 'עירוני';
    case 'gravel': return 'גראבל';
  }
}

/**
 * Get bike type text in Hebrew
 */
export function getBikeTypeName(type: BikeType): string {
  return type === 'electric' ? 'חשמלי' : 'אנלוגי';
}

/**
 * Get icon name for ride type
 */
export function getRideTypeIcon(type: RideType): string {
  switch(type) {
    case 'road': return 'road';
    case 'offroad': return 'bike';
    case 'trails': return 'hiking';
    case 'urban': return 'city';
    case 'gravel': return 'road-variant';
  }
}

/**
 * Get bike type icon name
 */
export function getBikeTypeIcon(type: BikeType): string {
  return type === 'electric' ? 'flash' : 'bicycle-outline';
}

/**
 * Update isExpired flag on rides
 */
export function updateRideExpirationStatus(rides: Ride[]): Ride[] {
  return rides.map(ride => ({
    ...ride,
    isExpired: isRideExpired(ride.date, ride.time)
  }));
}

/**
 * Sort rides by expiration and date
 */
export function sortRidesByDate(rides: Ride[]): Ride[] {
  return [...rides].sort((a, b) => {
    // If one is expired and the other isn't, the non-expired comes first
    if (a.isExpired && !b.isExpired) return 1;
    if (!a.isExpired && b.isExpired) return -1;
    
    // If both are either expired or not expired, sort by date
    const [dayA, monthA, yearA] = a.date.split('/').map(Number);
    const [dayB, monthB, yearB] = b.date.split('/').map(Number);
    
    const fullYearA = yearA < 100 ? 2000 + yearA : yearA;
    const fullYearB = yearB < 100 ? 2000 + yearB : yearB;
    
    const dateA = new Date(fullYearA, monthA - 1, dayA);
    const dateB = new Date(fullYearB, monthB - 1, dayB);
    
    // For non-expired rides, sort by earliest first
    if (!a.isExpired) return dateA.getTime() - dateB.getTime();
    
    // For expired rides, sort by most recent first
    return dateB.getTime() - dateA.getTime();
  });
} 