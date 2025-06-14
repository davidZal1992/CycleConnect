import { ProfileCreation } from '@/components/profile-creation/profile-creation';
import { signOut } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function ProfileCreationScreen() {
  const handleBackPress = async () => {
    try {
      // Sign out the user to clear all auth information
      await signOut();
      console.log('🔥 User signed out during profile creation');
      // Navigate back to login
      router.replace('/login');
    } catch (error) {
      console.error('🔥 Error signing out:', error);
      // Even if sign out fails, still navigate back
      router.replace('/login');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'יצירת פרופיל',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleBackPress}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }} 
      />
      <ProfileCreation />
    </>
  );
} 