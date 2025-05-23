import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

export function FontLoader({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    // System fonts are automatically loaded by default
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
} 