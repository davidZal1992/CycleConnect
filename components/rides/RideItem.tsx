import { Ride } from '@/app/types/Ride';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../common/ThemedText';

interface RideItemProps {
  ride: Ride;
  onView: (rideId: string) => void;
  onEdit?: (rideId: string) => void;
  onDelete?: (rideId: string) => void;
  showActions?: boolean;
}

export function RideItem({ 
  ride, 
  onView, 
  onEdit, 
  onDelete, 
  showActions = true 
}: RideItemProps) {
  return (
    <View style={[
      styles.rideItem, 
      ride.isExpired && styles.expiredRideItem
    ]}>
      {showActions && (
        <View style={styles.actionsContainer}>
          {ride.isExpired && (
            <View style={styles.expiredBanner}>
              <Ionicons name="time-outline" size={14} color="#fff" />
              <ThemedText style={styles.expiredBannerText}>פג תוקף</ThemedText>
            </View>
          )}
          
          <View style={styles.actionButtonsContainer}>
            {!ride.isExpired && onEdit && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => onEdit(ride.id)}
              >
                <Ionicons name="create-outline" size={22} color={Colors.light.primary} />
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => onDelete(ride.id)}
              >
                <Ionicons name="trash-outline" size={22} color="#ff3b30" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.rideContent}
        onPress={() => onView(ride.id)}
        activeOpacity={0.7}
      >
        <ThemedText style={[
          styles.rideTitle,
          ride.isExpired && styles.expiredText
        ]}>
          {ride.title}
        </ThemedText>
        <View style={styles.rideDetails}>
          <View style={styles.dateTimeContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={ride.isExpired ? Colors.light.text + "80" : Colors.light.text + "99"} 
              style={styles.icon} 
            />
            <ThemedText style={[
              styles.dateTime,
              ride.isExpired && styles.expiredDetailText
            ]}>
              {ride.date}
            </ThemedText>
          </View>
          <View style={styles.dateTimeContainer}>
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={ride.isExpired ? Colors.light.text + "80" : Colors.light.text + "99"} 
              style={styles.icon} 
            />
            <ThemedText style={[
              styles.dateTime,
              ride.isExpired && styles.expiredDetailText
            ]}>
              {ride.time}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  rideItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  expiredRideItem: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    opacity: 0.85,
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    width: 70,
    paddingRight: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 60,
  },
  actionButton: {
    padding: 6,
    marginBottom: 4,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  expiredBanner: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  expiredBannerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  rideContent: {
    flex: 1,
    paddingLeft: 8,
    position: 'relative',
  },
  rideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  expiredText: {
    color: Colors.light.text + "99",
  },
  expiredDetailText: {
    color: Colors.light.text + "80",
  },
  rideDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  icon: {
    marginRight: 4,
  },
  dateTime: {
    fontSize: 14,
    color: Colors.light.text + "99",
  },
}); 