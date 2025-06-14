import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../common/ThemedText';

interface FilterOption<T = string> {
  key: T;
  label: string;
}

interface FilterTabsProps<T = string> {
  options: FilterOption<T>[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
}

export function FilterTabs<T = string>({ 
  options, 
  activeFilter, 
  onFilterChange 
}: FilterTabsProps<T>) {
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={String(option.key)}
            style={[
              styles.tab,
              activeFilter === option.key && styles.activeTab
            ]}
            onPress={() => onFilterChange(option.key)}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeFilter === option.key && styles.activeTabText
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.muted,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  activeTabText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
}); 