import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RidesScreen() {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' or 'nearby'
  
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView style={styles.container}>
        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              activeFilter !== 'all' && styles.filterButtonInactive
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <ThemedText 
              style={
                activeFilter === 'all' 
                  ? styles.filterButtonText 
                  : styles.filterButtonTextInactive
              }
            >
              הכל
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              activeFilter !== 'nearby' && styles.filterButtonInactive
            ]}
            onPress={() => setActiveFilter('nearby')}
          >
            <ThemedText 
              style={
                activeFilter === 'nearby' 
                  ? styles.filterButtonText 
                  : styles.filterButtonTextInactive
              }
            >
              קרובות
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        <ThemedView style={styles.emptyStateContainer}>
          <Ionicons name="bicycle" size={60} color={Colors.light.tabIconDefault} />
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
            אין רכיבות {activeFilter === 'nearby' ? 'קרובות' : ''} זמינות
          </ThemedText>
          <ThemedText style={styles.emptyStateText}>
            צור רכיבה חדשה או חפש רכיבות באזורך
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  filterButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  filterButtonInactive: {
    backgroundColor: Colors.light.muted,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  filterButtonTextInactive: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
  },
}); 