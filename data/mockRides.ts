import { RideCardProps } from '@/components/RideCard';

export const mockRides: RideCardProps[] = [
  {
    id: '1',
    title: 'רכיבת בוקר בפארק הירקון',
    location: 'פארק הירקון, תל אביב',
    coordinates: {
      latitude: 32.0993,
      longitude: 34.8148
    },
    date: '15/07/2023',
    time: '06:30',
    distance: 25,
    organizer: {
      id: 'user1',
      name: 'דוד זלצמן',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    participantsCount: 3,
    maxParticipants: 8,
    rideType: 'road',
    difficultyLevel: 'easy',
    technicalLevel: 'none',
    speedLevel: 'medium',
    bikeType: 'analog',
  },
  {
    id: '2',
    title: 'רכיבת שטח ביער בן שמן',
    location: 'יער בן שמן, מודיעין',
    coordinates: {
      latitude: 31.9361,
      longitude: 34.9574
    },
    date: '18/07/2023',
    time: '16:00',
    distance: 35,
    organizer: {
      id: 'user2',
      name: 'יעל כהן',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    participantsCount: 5,
    maxParticipants: 10,
    rideType: 'offroad',
    difficultyLevel: 'medium',
    technicalLevel: 'medium',
    speedLevel: 'medium',
    bikeType: 'electric',
  },
  {
    id: '3',
    title: 'רכיבת גראבל באזור ירושלים',
    location: 'הרי ירושלים, מבשרת ציון',
    coordinates: {
      latitude: 31.8018,
      longitude: 35.1149
    },
    date: '20/07/2023',
    time: '07:00',
    distance: 60,
    organizer: {
      id: 'user3',
      name: 'אבי לוי',
      avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    },
    participantsCount: 2,
    maxParticipants: 6,
    rideType: 'gravel',
    difficultyLevel: 'hard',
    technicalLevel: 'hard',
    speedLevel: 'fast',
    bikeType: 'analog',
  },
  {
    id: '4',
    title: 'סינגלים וטכניקה בבן שמן',
    location: 'פארק בן שמן, שער הגיא',
    coordinates: {
      latitude: 31.9284,
      longitude: 34.9607
    },
    date: '25/07/2023',
    time: '15:30',
    distance: 20,
    organizer: {
      id: 'user4',
      name: 'נועה ברק',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    },
    participantsCount: 4,
    maxParticipants: 8,
    rideType: 'trails',
    difficultyLevel: 'medium',
    technicalLevel: 'hard',
    speedLevel: 'medium',
    bikeType: 'analog',
  }
]; 