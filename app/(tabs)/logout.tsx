import { Redirect } from 'expo-router';

export default function LogoutScreen() {
  // Redirect to profile tab instead of showing logout popup
  return <Redirect href="/(tabs)/profile" />;
} 