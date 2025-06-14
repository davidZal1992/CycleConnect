import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FilterTagProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function FilterTag({ label, isSelected, onPress }: FilterTagProps) {
  return (
    <TouchableOpacity
      style={[
        styles.filterTag,
        isSelected ? styles.selectedTag : styles.unselectedTag
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.filterTagText,
          isSelected ? styles.selectedTagText : styles.unselectedTagText
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedTag: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  unselectedTag: {
    backgroundColor: 'transparent',
    borderColor: Colors.light.border,
  },
  filterTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
  unselectedTagText: {
    color: Colors.light.text,
  },
}); 