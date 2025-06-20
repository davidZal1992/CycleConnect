import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ride } from '@/types/ride';
import {
  getBikeTypeText,
  getDifficultyColor,
  getRideTypeText,
  getSpeedColor,
  getSpeedText,
  getTechnicalColor,
  getTechnicalLevelText
} from '@/utils/ride-helpers';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface RideCardProps extends Ride {
  // Remove action-related props since we don't need them anymore
}

export function RideCard({ 
  id,
  title, 
  location, 
  date, 
  time,
  distance,
  organizer,
  participantsCount,
  maxParticipants,
  rideType,
  difficultyLevel,
  technicalLevel,
  speedLevel,
  bikeType = 'analog'
}: RideCardProps) {
  
  return (
    <View style={styles.cardContainer}>
      <Link href={{ pathname: '/ride/[id]', params: { id } }} asChild>
        <TouchableOpacity style={styles.cardContent}>
          {/* Date, Time and Organizer Header */}
          <View style={styles.headerRow}>
            <View style={styles.dateTimeSection}>
              <ThemedText style={styles.dateTimeText}>📅{date} 🕐{time}</ThemedText>
            </View>
            <View style={styles.organizerSection}>
              <ThemedText style={styles.organizerName}>{organizer.name}</ThemedText>
              {organizer.avatar && organizer.avatar.trim() !== '' ? (
                <Image source={{ uri: organizer.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={16} color={Colors.light.text} />
                </View>
              )}
            </View>
          </View>
          
          {/* Ride Title */}
          <ThemedText style={styles.title}>{title}</ThemedText>
          
          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.light.primary} />
            <ThemedText style={styles.locationText}>{location}</ThemedText>
          </View>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <ThemedText style={styles.statBadgeText}>{distance} ק"מ</ThemedText>
            </View>
            <View style={styles.statBadge}>
              <ThemedText style={styles.statBadgeText}>{getBikeTypeText(bikeType)}</ThemedText>
            </View>
            <View style={styles.statBadge}>
              <ThemedText style={styles.statBadgeText}>{getRideTypeText(rideType)}</ThemedText>
            </View>
          </View>
          
          {/* Level Badges */}
          <View style={styles.badgesRow}>
            <View style={[
              styles.badge, 
              { 
                backgroundColor: getDifficultyColor(difficultyLevel) + '20',
                borderColor: getDifficultyColor(difficultyLevel),
                borderWidth: 1
              }
            ]}>
              <ThemedText style={[
                styles.badgeText,
                { color: getDifficultyColor(difficultyLevel) }
              ]}>
                {difficultyLevel === 'easy' ? 'קושי קל' : 
                 difficultyLevel === 'medium' ? 'קושי בינוני' : 'קושי קשה'}
              </ThemedText>
            </View>
            
            <View style={[
              styles.badge, 
              { 
                backgroundColor: getTechnicalColor(technicalLevel) + '20',
                borderColor: getTechnicalColor(technicalLevel),
                borderWidth: 1
              }
            ]}>
              <ThemedText style={[
                styles.badgeText,
                { color: getTechnicalColor(technicalLevel) }
              ]}>
                {getTechnicalLevelText(technicalLevel)}
              </ThemedText>
            </View>
            
            <View style={[
              styles.badge, 
              { 
                backgroundColor: getSpeedColor(speedLevel) + '20',
                borderColor: getSpeedColor(speedLevel),
                borderWidth: 1
              }
            ]}>
              <ThemedText style={[
                styles.badgeText,
                { color: getSpeedColor(speedLevel) }
              ]}>
                {getSpeedText(speedLevel)}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeSection: {
    flex: 1,
    justifyContent: 'center',
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  organizerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'right',
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: Colors.light.text + 'DD',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    gap: 6,
  },
  statBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: Colors.light.primary + '15',
    borderRadius: 4,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 