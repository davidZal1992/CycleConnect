import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { mockRides } from '@/data/mock-rides';
import { Ride } from '@/types/ride';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Extended interface for rides with expiration status
interface RideWithExpiration extends Ride {
  isExpired?: boolean;
}

export default function FavoritesScreen() {
  const [favoriteRides, setFavoriteRides] = useState<RideWithExpiration[]>([]);
  
  useEffect(() => {
    // Get current date for accurate comparison
    const currentDate = new Date();
    
    // Filter rides that are marked as favorites
    const userFavorites = mockRides
      .filter(ride => ride.isFavorite)
      .map(ride => {
        // Parse the date parts correctly
        const [day, month, year] = ride.date.split('/').map(Number);
        const [hours, minutes] = ride.time.split(':').map(Number);
        
        // Create a date object with the correct year
        const fullYear = year < 100 ? 2000 + year : year;
        const rideDate = new Date(fullYear, month - 1, day, hours, minutes);
        
        // Compare with current date
        const isExpired = rideDate < currentDate;
        
        return {
          ...ride,
          isExpired
        };
      });
    
    setFavoriteRides(userFavorites);
  }, []);
  
  const handleViewRideDetails = (rideId: string) => {
    router.push({
      pathname: '/ride/[id]',
      params: { id: rideId }
    });
  };

  const renderRideItem = ({ item }: { item: RideWithExpiration }) => (
    <View style={[
      styles.rideItem, 
      item.isExpired && styles.expiredRideItem
    ]}>
      <View style={styles.actionsContainer}>
        {item.isExpired && (
          <View style={styles.expiredBanner}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <ThemedText style={styles.expiredBannerText}>פג תוקף</ThemedText>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.rideContent}
        onPress={() => handleViewRideDetails(item.id)}
        activeOpacity={0.7}
      >
        <ThemedText style={[
          styles.rideTitle,
          item.isExpired && styles.expiredText
        ]}>
          {item.title}
        </ThemedText>
        <View style={styles.rideDetails}>
          <View style={styles.dateTimeContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={item.isExpired ? Colors.light.text + "80" : Colors.light.text + "99"} 
              style={styles.icon} 
            />
            <ThemedText style={[
              styles.dateTime,
              item.isExpired && styles.expiredDetailText
            ]}>
              {item.date}
            </ThemedText>
          </View>
          <View style={styles.dateTimeContainer}>
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={item.isExpired ? Colors.light.text + "80" : Colors.light.text + "99"} 
              style={styles.icon} 
            />
            <ThemedText style={[
              styles.dateTime,
              item.isExpired && styles.expiredDetailText
            ]}>
              {item.time}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ThemedText type="title" style={styles.title}>מועדפים</ThemedText>
      
      <FlatList
        data={favoriteRides}
        renderItem={renderRideItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart" size={64} color={Colors.light.text + "40"} />
            <ThemedText style={styles.emptyText}>
              אין לך רכיבות מועדפות
            </ThemedText>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/')}
            >
              <ThemedText style={styles.browseButtonText}>עיין ברכיבות</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'right',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
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
    justifyContent: 'center',
    width: 70,
    paddingRight: 8,
  },
  expiredBanner: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
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
  },
  browseButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 