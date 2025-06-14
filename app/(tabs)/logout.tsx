import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

export default function LogoutScreen() {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Show logout confirmation when this tab is accessed
    handleLogout();
  }, []);

  const handleLogout = () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    Alert.alert(
      "התנתקות",
      "האם אתה בטוח שברצונך להתנתק?",
      [
        {
          text: "ביטול",
          style: "cancel",
          onPress: () => {
            // Navigate back to profile tab if user cancels
            router.replace('/(tabs)/profile');
          }
        },
        { 
          text: "התנתק", 
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              console.log('🔥 Logout Tab - Starting logout process...');
              
              // Sign out from Firebase
              await signOut();
              console.log('🔥 Logout Tab - SignOut completed successfully');
              
              // Force navigation to login page
              console.log('🔥 Logout Tab - Forcing navigation to login');
              router.replace('/login');
              
            } catch (error) {
              console.error('🔥 Logout Tab - Error signing out:', error);
              Alert.alert('שגיאה', 'אירעה שגיאה בהתנתקות. אנא נסה שוב.');
              // Navigate back to profile on error
              router.replace('/(tabs)/profile');
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  // Show loading state while logging out
  if (isLoggingOut) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>מתנתק...</ThemedText>
      </View>
    );
  }

  // This should not be visible as the alert shows immediately
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
      <ThemedText>מתנתק...</ThemedText>
    </View>
  );
} 