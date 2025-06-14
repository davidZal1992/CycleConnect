import { Colors } from '@/constants/Colors';
import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      {icon}
      <ThemedText style={styles.emptyText}>{title}</ThemedText>
      
      {actionLabel && onAction && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onAction}
        >
          <ThemedText style={styles.actionButtonText}>{actionLabel}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    color: Colors.light.text + "80",
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 