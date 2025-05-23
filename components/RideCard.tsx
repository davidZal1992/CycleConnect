import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

type RideType = 'road' | 'offroad' | 'trails' | 'urban' | 'gravel';
type DifficultyLevel = 'easy' | 'medium' | 'hard';
type TechnicalLevel = 'none' | 'easy' | 'medium' | 'hard';
type SpeedLevel = 'slow' | 'medium' | 'fast';
type BikeType = 'electric' | 'analog';

export interface RideCardProps {
  id: string;
  title: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  date: string;
  time: string;
  distance: number;
  organizer: {
    id: string;
    name: string;
    avatar: string;
    phone?: string;  // Optional phone number for contact
  };
  participantsCount: number;
  maxParticipants?: number;
  rideType: RideType;
  difficultyLevel: DifficultyLevel;
  technicalLevel: TechnicalLevel;
  speedLevel: SpeedLevel;
  bikeType?: BikeType; // New property (optional for backward compatibility)
}

export const RideCard = ({ 
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
  bikeType = 'analog' // Default to analog if not specified
}: RideCardProps) => {
  
  // Map technical level to human-readable Hebrew text
  const getTechnicalLevelText = (level: TechnicalLevel): string => {
    switch(level) {
      case 'none': return 'לא טכני';
      case 'easy': return 'טכני קל';
      case 'medium': return 'טכני בינוני';
      case 'hard': return 'טכני מאוד';
    }
  };
  
  // Map speed level to human-readable Hebrew text
  const getSpeedLevelText = (level: SpeedLevel): string => {
    switch(level) {
      case 'slow': return 'קצב איטי';
      case 'medium': return 'קצב בינוני';
      case 'fast': return 'קצב מהיר';
      default: return 'קצב בינוני';
    }
  };
  
  // Get icon name for ride type that works with MaterialCommunityIcons
  const getRideTypeIcon = (type: RideType) => {
    switch(type) {
      case 'road': return 'road';
      case 'offroad': return 'bike';
      case 'trails': return 'hiking';
      case 'urban': return 'city';
      case 'gravel': return 'road-variant';
    }
  };
  
  // Get bike type icon and name
  const getBikeTypeIcon = (type: BikeType) => {
    return type === 'electric' ? 'flash' : 'bicycle-outline';
  };
  
  const getBikeTypeName = (type: BikeType) => {
    return type === 'electric' ? 'חשמלי' : 'אנלוגי';
  };
  
  // Map difficulty level to color
  const getLevelColor = (level: 'easy' | 'medium' | 'hard'): string => {
    switch(level) {
      case 'easy': return '#4caf50'; // Green
      case 'medium': return '#ff9800'; // Orange
      case 'hard': return '#f44336'; // Red
    }
  };
  
  // Map difficulty level to color
  const getDifficultyColor = (level: DifficultyLevel): string => {
    return getLevelColor(level);
  };
  
  // Map technical level to color
  const getTechnicalColor = (level: TechnicalLevel): string => {
    switch(level) {
      case 'none': return '#9e9e9e'; // Gray
      case 'easy': return getLevelColor('easy');
      case 'medium': return getLevelColor('medium');
      case 'hard': return getLevelColor('hard');
    }
  };
  
  // Map speed level to color
  const getSpeedColor = (level: SpeedLevel): string => {
    switch(level) {
      case 'slow': return getLevelColor('easy');
      case 'medium': return getLevelColor('medium');
      case 'fast': return getLevelColor('hard');
      default: return getLevelColor('medium');
    }
  };
  
  // Handle contact actions - these would be implemented for real functionality
  const handleWhatsAppPress = () => {
    // Implementation would link to WhatsApp with the organizer's number
    console.log('Open WhatsApp with:', organizer.phone);
  };
  
  const handlePhonePress = () => {
    // Implementation would make a phone call
    console.log('Call organizer:', organizer.phone);
  };
  
  return (
    <Link href={{ pathname: '/ride/[id]', params: { id } }} asChild>
      <TouchableOpacity style={styles.cardContainer}>
        {/* Organizer and Time Info */}
        <View style={styles.cardHeader}>
          {/* Restore date & time to the top left */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateContainer}>
              <ThemedText style={styles.dateText}>{date}</ThemedText>
              <Ionicons name="calendar" size={14} color={Colors.light.text + 'CC'} />
            </View>
            <View style={styles.timeContainer}>
              <ThemedText style={styles.timeText}>{time}</ThemedText>
              <Ionicons name="time" size={14} color={Colors.light.text + 'CC'} />
            </View>
          </View>
          
          <View style={styles.organizerContainer}>
            <View style={styles.nameContainer}>
              <ThemedText style={styles.organizerName} numberOfLines={1}>{organizer.name}</ThemedText>
            </View>
            <Image source={{ uri: organizer.avatar }} style={styles.avatar} />
          </View>
        </View>
        
        {/* Ride Title */}
        <ThemedText style={styles.rideTitle} numberOfLines={1}>{title}</ThemedText>
        
        {/* Location */}
        <View style={styles.locationContainer}>
          <ThemedText style={styles.locationText} numberOfLines={1}>{location}</ThemedText>
          <Ionicons name="location" size={16} color={Colors.light.primary} />
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          {/* Distance */}
          <View style={styles.statItem}>
            <ThemedText style={styles.statText}>{distance} ק"מ</ThemedText>
          </View>
          
          {/* Ride Type */}
          <View style={styles.statItem}>
            <ThemedText style={styles.statText}>
              {rideType === 'road' ? 'כביש' : 
               rideType === 'offroad' ? 'שטח' : 
               rideType === 'trails' ? 'שבילים' : 
               rideType === 'urban' ? 'עירוני' : 'גראבל'}
            </ThemedText>
          </View>
          
          {/* Bike Type - New */}
          <View style={styles.statItem}>
            <ThemedText style={styles.statText}>{getBikeTypeName(bikeType)}</ThemedText>
          </View>
        </View>
        
        {/* Difficulty and Contact */}
        <View style={styles.footerContainer}>
          <View style={styles.badgesContainer}>
            {/* Speed level badge */}
            <View style={[styles.speedBadge, { backgroundColor: getSpeedColor(speedLevel) + '20', borderColor: getSpeedColor(speedLevel) }]}>
              <ThemedText style={[styles.speedText, { color: getSpeedColor(speedLevel) }]}>
                {getSpeedLevelText(speedLevel)}
              </ThemedText>
            </View>
            
            {/* Technical level badge */}
            <View style={[styles.technicalBadge, { backgroundColor: getTechnicalColor(technicalLevel) + '20', borderColor: getTechnicalColor(technicalLevel) }]}>
              <ThemedText style={[styles.technicalText, { color: getTechnicalColor(technicalLevel) }]}>
                {getTechnicalLevelText(technicalLevel)}
              </ThemedText>
            </View>
            
            {/* Difficulty level badge */}
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(difficultyLevel) + '20', borderColor: getDifficultyColor(difficultyLevel) }]}>
              <ThemedText style={[styles.difficultyText, { color: getDifficultyColor(difficultyLevel) }]}>
                {difficultyLevel === 'easy' ? 'קושי קל' : 
                  difficultyLevel === 'medium' ? 'קושי בינוני' : 'קושי קשה'}
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 150,
  },
  nameContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'right',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 12,
  },
  dateText: {
    fontSize: 14,
    marginRight: 8,
    color: Colors.light.text,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    marginRight: 8,
    color: Colors.light.text,
    fontWeight: '500',
  },
  rideTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
    paddingRight: 2,
    letterSpacing: 0.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  locationText: {
    fontSize: 15,
    marginRight: 10,
    color: Colors.light.text,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 4,
    gap: 6,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  statText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  footerContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    marginRight: 4,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButton: {
    marginLeft: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  technicalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  technicalText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    marginRight: 4,
  },
  speedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    marginRight: 4,
  },
});