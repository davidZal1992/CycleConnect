import { useAuth } from '@/contexts/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import { router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export default function LogoutScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { signOut } = useAuth();

  useEffect(() => {
    if (isFocused) {
      // Show logout confirmation when this screen becomes focused
      Alert.alert(
        "התנתקות",
        "האם אתה בטוח שברצונך להתנתק?",
        [
          {
            text: "ביטול",
            style: "cancel",
            onPress: () => {
              // Navigate to the home tab instead of going back
              router.replace("/");
            }
          },
          { 
            text: "התנתק", 
            style: "destructive",
            onPress: async () => {
              try {
                // Sign out from Firebase
                await signOut();
                console.log('🔥 User signed out successfully');
                // Navigation will be handled by the auth guard in index.tsx
              } catch (error) {
                console.error('🔥 Error signing out:', error);
                Alert.alert('שגיאה', 'אירעה שגיאה בהתנתקות. אנא נסה שוב.');
              }
            }
          }
        ]
      );
    }
  }, [isFocused, navigation, signOut]);

  // This component doesn't render anything visible
  return null;
} 