import { useIsFocused } from '@react-navigation/native';
import { router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export default function LogoutScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation();

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
            onPress: () => {
              // Navigate to login screen
              router.replace("/login");
            }
          }
        ]
      );
    }
  }, [isFocused, navigation]);

  // This component doesn't render anything visible
  return null;
} 