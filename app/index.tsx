import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('🔥 Index.tsx - Auth state:', { user: !!user, isLoading });
    
    // Only navigate when not loading
    if (!isLoading) {
      if (user) {
        console.log('🔥 Index.tsx - User authenticated, navigating to /(tabs)');
        router.replace('/(tabs)');
      } else {
        console.log('🔥 Index.tsx - User not authenticated, navigating to /login');
        router.replace('/login');
      }
    }
  }, [user, isLoading]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    console.log('🔥 Index.tsx - Showing loading spinner');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Return loading spinner while navigation is happening
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
} 