export interface Organizer {
  id: string;
  name: string;
  avatar?: string;
}

export interface Ride {
  id: string;
  title: string;
  description: string;
  date: string; // Format: DD/MM/YY
  time: string; // Format: HH:MM
  location: string;
  startLocation: string;
  endLocation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxParticipants: number;
  currentParticipants: number;
  organizer: Organizer;
  participants: string[];
  route?: string;
  estimatedDuration: string;
}