import { Auth0Troubleshooter } from '@/components/auth/Auth0Troubleshooter';
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function Auth0HelpScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Auth0 Help',
        headerBackTitle: 'Back',
      }} />
      <Auth0Troubleshooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 