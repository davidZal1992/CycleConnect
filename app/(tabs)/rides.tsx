import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ride } from '@/types/ride';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Extended interface for rides with expiration status
interface RideWithExpiration extends Ride {
  isExpired?: boolean;
}

type FilterType = 'all' | 'future';

export default function RidesScreen() {
  const [myRides, setMyRides] = useState<RideWithExpiration[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Simulate current user ID - in a real app, this would come from authentication
  const currentUserId = 'user1';  // This should match one of the organizer IDs in mockRides
  
  useEffect(() => {
    // Get current date for accurate comparison
    const currentDate = new Date();
    console.log('Current date:', currentDate.toISOString());
    
    // TODO: Replace with actual API call to fetch user rides
    const userRides: RideWithExpiration[] = [];
    
    setMyRides(userRides);
  }, []);
  
  const handleEditRide = (rideId: string) => {
    router.push({
      pathname: '/post-ride',
      params: { 
        editMode: 'true', 
        rideId: rideId
      }
    });
  };
  
  const handleDeleteRide = (rideId: string) => {
    Alert.alert(
      "מחיקת רכיבה",
      "האם אתה בטוח שברצונך למחוק את הרכיבה?",
      [
        {
          text: "לא",
          style: "cancel"
        },
        {
          text: "כן",
          style: "destructive",
          onPress: () => {
            // In a real app, you would delete from the server
            // Here we'll just remove it from the local state
            setMyRides(prev => prev.filter(ride => ride.id !== rideId));
          }
        }
      ],
      { cancelable: true }
    );
  };
  
  const handleViewRideDetails = (rideId: string) => {
    router.push({
      pathname: '/ride/[id]',
      params: { id: rideId }
    });
  };

  // Filter rides based on the active filter
  const filteredRides = activeFilter === 'all' 
    ? myRides 
    : myRides.filter(ride => !ride.isExpired);
  
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
        {!item.isExpired && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleEditRide(item.id)}
          >
            <Ionicons name="create-outline" size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleDeleteRide(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#ff3b30" />
        </TouchableOpacity>
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
      <View style={styles.filterContainer}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonLeft,
              activeFilter === 'all' && styles.activeToggleButton
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <ThemedText style={[
              styles.filterText,
              activeFilter === 'all' && styles.activeFilterText
            ]}>
              הכל
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonRight,
              activeFilter === 'future' && styles.activeToggleButton
            ]}
            onPress={() => setActiveFilter('future')}
          >
            <ThemedText style={[
              styles.filterText,
              activeFilter === 'future' && styles.activeFilterText
            ]}>
              רכיבות עתידיות
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredRides}
        renderItem={renderRideItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={64} color={Colors.light.text + "40"} />
            <ThemedText style={styles.emptyText}>
              {activeFilter === 'future' 
                ? 'אין לך רכיבות עתידיות' 
                : 'אין לך רכיבות'}
            </ThemedText>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/post-ride')}
            >
              <ThemedText style={styles.createButtonText}>צור רכיבה חדשה</ThemedText>
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
  filterContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    minWidth: 100,
    alignItems: 'center',
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  toggleButtonRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  activeToggleButton: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    paddingTop: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
    marginBottom: 4,
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
  expiredBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 8,
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
  createButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 