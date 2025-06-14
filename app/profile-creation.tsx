import { ProfileCreation } from '@/components/profile-creation/profile-creation';
import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileCreationScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'יצירת פרופיל',
          headerBackTitle: 'חזור',
          headerShown: true,
        }} 
      />
      <ProfileCreation />
    </>
  );
} 