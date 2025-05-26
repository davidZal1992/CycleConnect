import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Create context to track app state
export const AppStateContext = createContext<{
  isAppReady: boolean;
}>({
  isAppReady: false,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // System fonts are automatically loaded by default
  });
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
      
      // Set app as ready when it becomes active
      if (nextAppState === 'active') {
        // Wait a moment to ensure everything is initialized
        setTimeout(() => {
          setIsAppReady(true);
        }, 500);
      } else {
        setIsAppReady(false);
      }
    });

    // Initial state check
    if (appState === 'active') {
      setTimeout(() => {
        setIsAppReady(true);
      }, 500);
    }

    return () => {
      subscription.remove();
    };
  }, [appState]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }
  
  return (
    <AppStateContext.Provider value={{ isAppReady }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#F8FAFC', // Match web colors
          },
          headerBackTitle: 'חזור', // Set default back button text to "חזור"
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen 
            name="post-ride" 
            options={{ 
              title: 'פרסם רכיבה',
              headerTitleAlign: 'center',
              headerBackTitle: 'חזור'
            }} 
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppStateContext.Provider>
  );
}
