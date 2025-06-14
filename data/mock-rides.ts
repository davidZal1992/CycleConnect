import { Ride } from '@/types/ride';

export const mockRides: Ride[] = [
  {
    id: '11',
    title: 'רכיבה מיוחדת בחולון',
    location: 'פארק פרס, חולון',
    coordinates: {
      latitude: 32.0123,
      longitude: 34.7799
    },
    date: '15/06/2025',
    time: '08:30',
    distance: 28,
    description: 'רכיבה מיוחדת בפארק פרס בחולון. נרכב במסלול המיוחד של הפארק ונעצור לקפה באגם. רכיבה קלילה מתאימה לכל הרמות.',
    organizer: {
      id: 'user1',
      name: 'דוד זלצמן',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      phone: '050-1234567',
    },
    participantsCount: 0,
    maxParticipants: 15,
    rideType: 'urban',
    difficultyLevel: 'easy',
    technicalLevel: 'none',
    speedLevel: 'medium',
    bikeType: 'analog',
    isFavorite: false
  },
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
    description: 'רכיבת בוקר נינוחה לאורך פארק הירקון המרהיב. הרכיבה מתאימה לכל הרמות, כולל עצירה לקפה ומאפה באמצע הדרך. נפגשים בכניסה הצפונית של הפארק.',
    organizer: {
      id: 'user1',
      name: 'דוד זלצמן',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      phone: '050-1234567',
    },
    participantsCount: 3,
    maxParticipants: 8,
    rideType: 'road',
    difficultyLevel: 'easy',
    technicalLevel: 'none',
    speedLevel: 'medium',
    bikeType: 'analog',
    isFavorite: true
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
    description: 'רכיבת שטח מאתגרת ביער בן שמן. נעבור בשבילים טכניים ומהנים, מסלול מעגלי שמתאים לרוכבים בעלי ניסיון בינוני. יש להביא מספיק מים ומזון.',
    organizer: {
      id: 'user2',
      name: 'יעל כהן',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      phone: '052-7654321',
    },
    participantsCount: 5,
    maxParticipants: 10,
    rideType: 'offroad',
    difficultyLevel: 'medium',
    technicalLevel: 'medium',
    speedLevel: 'medium',
    bikeType: 'electric',
    isFavorite: false
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
    description: 'רכיבת גראבל ארוכה ומאתגרת בהרי ירושלים. נטפס כ-1000 מטרים במצטבר, נעבור בנופים מרהיבים ובדרכי עפר היסטוריות. מיועד לרוכבים מנוסים בכושר טוב.',
    organizer: {
      id: 'user3',
      name: 'אבי לוי',
      avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
      phone: '054-9876543',
    },
    participantsCount: 2,
    maxParticipants: 6,
    rideType: 'gravel',
    difficultyLevel: 'hard',
    technicalLevel: 'hard',
    speedLevel: 'fast',
    bikeType: 'analog',
    isFavorite: false
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
    description: 'סדנת טכניקה ורכיבה בסינגלים של בן שמן. נתמקד בשיפור מיומנויות בירידות ופניות. מתאים לרוכבים המעוניינים לשפר את היכולות הטכניות שלהם.',
    organizer: {
      id: 'user4',
      name: 'נועה ברק',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      phone: '053-1472583',
    },
    participantsCount: 4,
    maxParticipants: 8,
    rideType: 'trails',
    difficultyLevel: 'medium',
    technicalLevel: 'hard',
    speedLevel: 'medium',
    bikeType: 'analog',
    isFavorite: false
  },
  {
    id: '5',
    title: 'רכיבת ערב בטיילת תל אביב',
    location: 'טיילת תל אביב, נמל תל אביב',
    coordinates: {
      latitude: 32.0872,
      longitude: 34.7731
    },
    date: '30/06/2024',
    time: '19:00',
    distance: 15,
    description: 'רכיבה קלילה לאורך הטיילת של תל אביב בשעת שקיעה. נעצור לשתייה קלה באחד מבתי הקפה בנמל. מתאים לכל הרמות, אווירה כיפית ורגועה.',
    organizer: {
      id: 'user1',
      name: 'דוד זלצמן',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      phone: '050-1234567',
    },
    participantsCount: 6,
    maxParticipants: 12,
    rideType: 'urban',
    difficultyLevel: 'easy',
    technicalLevel: 'none',
    speedLevel: 'slow',
    bikeType: 'analog',
    isFavorite: true
  }
]; 