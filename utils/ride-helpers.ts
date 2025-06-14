import { BikeType, DifficultyLevel, RideType, SpeedLevel, TechnicalLevel } from '@/types/ride';

export function formatDateAndTime(dateObj: Date): { date: string; time: string } {
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`
  };
}

export function getTechnicalLevelText(level: TechnicalLevel): string {
  const technicalLevelMap: Record<TechnicalLevel, string> = {
    none: 'לא טכני',
    easy: 'טכני קל',
    medium: 'טכני בינוני',
    hard: 'טכני מאוד'
  };
  return technicalLevelMap[level];
}

export function getSpeedText(speed: SpeedLevel): string {
  const speedMap: Record<SpeedLevel, string> = {
    slow: 'קצב איטי',
    medium: 'קצב בינוני',
    'medium-high': 'קצב בינוני-גבוה',
    fast: 'קצב מהיר'
  };
  return speedMap[speed];
}

export function getRideTypeText(type: RideType): string {
  const rideTypeMap: Record<RideType, string> = {
    road: 'כביש',
    offroad: 'שטח',
    trails: 'שבילים',
    urban: 'עירוני',
    gravel: 'גראבל'
  };
  return rideTypeMap[type];
}

export function getBikeTypeText(type: BikeType): string {
  const bikeTypeMap: Record<BikeType, string> = {
    electric: 'חשמלי',
    analog: 'אנלוגי'
  };
  return bikeTypeMap[type];
}

export function getRideTypeIcon(type: RideType): string {
  const iconMap: Record<RideType, string> = {
    road: 'road',
    offroad: 'bike',
    trails: 'hiking',
    urban: 'city',
    gravel: 'road-variant'
  };
  return iconMap[type];
}

export function getBikeTypeIcon(type: BikeType): string {
  return type === 'electric' ? 'flash' : 'bicycle-outline';
}

export function getLevelColor(level: 'easy' | 'medium' | 'hard'): string {
  const colorMap: Record<'easy' | 'medium' | 'hard', string> = {
    easy: '#4caf50',
    medium: '#ff9800',
    hard: '#f44336'
  };
  return colorMap[level];
}

export function getDifficultyColor(level: DifficultyLevel): string {
  return getLevelColor(level);
}

export function getTechnicalColor(level: TechnicalLevel): string {
  if (level === 'none') return '#9e9e9e';
  return getLevelColor(level as 'easy' | 'medium' | 'hard');
}

export function getSpeedColor(level: SpeedLevel): string {
  const speedColorMap: Record<SpeedLevel, string> = {
    slow: getLevelColor('easy'),
    medium: getLevelColor('medium'),
    'medium-high': getLevelColor('hard'),
    fast: getLevelColor('hard')
  };
  return speedColorMap[level];
} 