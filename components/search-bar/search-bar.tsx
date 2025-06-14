import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  placeholder?: string;
  hasActiveFilters?: boolean;
}

export function SearchBar({ 
  value, 
  onChangeText, 
  onFilterPress, 
  placeholder = "חפש רכיבות...",
  hasActiveFilters = false 
}: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={Colors.light.icon} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={Colors.light.icon}
        />
      </View>
      <TouchableOpacity 
        style={[
          styles.filterButton,
          hasActiveFilters && styles.filterButtonActive
        ]} 
        onPress={onFilterPress}
      >
        <Ionicons 
          name="filter" 
          size={20} 
          color={hasActiveFilters ? Colors.light.primary : Colors.light.icon} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'right',
  },
  filterButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.light.card,
    borderColor: Colors.light.border,
  },
}); 