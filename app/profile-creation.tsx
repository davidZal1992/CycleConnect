import { ProfileCreation } from '@/components/profile-creation/profile-creation';
import { Stack } from 'expo-router';

export default function ProfileCreationScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'יצירת פרופיל',
          headerBackTitle: 'חזור',
          headerShown: true,
          headerBackVisible: false,
        }} 
      />
      <ProfileCreation />
    </>
  );
} 