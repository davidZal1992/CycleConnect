import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  
  // Get the colors from the theme
  const primaryColor = Colors[colorScheme].primary;
  const tabIconDefaultColor = Colors[colorScheme].tabIconDefault;
  const tabIconSelectedColor = Colors[colorScheme].tabIconSelected;
  const backgroundColor = Colors[colorScheme].card;
  const borderColor = Colors[colorScheme].border;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabIconSelectedColor,
        tabBarInactiveTintColor: tabIconDefaultColor,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 10,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: backgroundColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 3,
          borderBottomColor: borderColor,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTintColor: Colors[colorScheme].text,
      }}
    >
      <Tabs.Screen
        name="logout"
        options={{
          title: 'התנתק',
          tabBarIcon: ({ color }) => <Ionicons name="log-out" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: 'רכיבות',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bike" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'ראשי',
          headerTitle: 'CycleConnect',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'הודעות',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'פרופיל',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
