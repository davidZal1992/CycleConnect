/**
 * Types related to Rides
 */

// Ride Types
export type RideType = 'road' | 'offroad' | 'trails' | 'urban' | 'gravel';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type TechnicalLevel = 'none' | 'easy' | 'medium' | 'hard';
export type SpeedLevel = 'slow' | 'medium' | 'fast';
export type BikeType = 'electric' | 'analog';
export type FilterType = 'all' | 'future' | 'my';

// User/Organizer Interface
export interface User {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
}

// Core Ride Interface
export interface Ride {
  id: string;
  title: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  date: string;
  time: string;
  distance: number;
  description?: string;
  organizer: User;
  participantsCount: number;
  maxParticipants?: number;
  rideType: RideType;
  difficultyLevel: DifficultyLevel;
  technicalLevel: TechnicalLevel;
  speedLevel: SpeedLevel;
  bikeType: BikeType;
  isExpired?: boolean;
} 