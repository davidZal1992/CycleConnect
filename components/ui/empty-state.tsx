import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  buttonText?: string;
  onButtonPress?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  iconName = 'search-outline',
  buttonText,
  onButtonPress 
}: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={iconName} size={64} color={Colors.light.icon} />
      <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
      <ThemedText style={styles.emptyDescription}>{description}</ThemedText>
      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.emptyButton} onPress={onButtonPress}>
          <ThemedText style={styles.emptyButtonText}>{buttonText}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.light.icon,
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 