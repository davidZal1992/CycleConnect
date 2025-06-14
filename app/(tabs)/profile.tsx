import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// API endpoint for profile
const API_BASE_URL = 'http://localhost:8080/api/v1/profiles';

interface UserProfile {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profileImage?: string;
  bikeModel?: string;
  location?: string;
  bio?: string;
}

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(async () => {
    if (!user?.uid) {
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    try {
      console.log('🔥 Profile - Fetching user profile for userId:', user.uid);
      const response = await fetch(`${API_BASE_URL}/${user.uid}`);
      
      if (response.ok) {
        const profile = await response.json();
        console.log('🔥 Profile - User profile fetched successfully:', profile);
        setUserProfile(profile);
      } else {
        console.log('🔥 Profile - No profile found for user, using Firebase displayName');
        // Fallback to Firebase displayName if no profile exists
        if (user.displayName) {
          setUserProfile({
            userId: user.uid,
            fullName: user.displayName,
            phoneNumber: '',
            email: user.email || '',
          });
        }
      }
    } catch (error) {
      console.error('🔥 Profile - Error fetching user profile:', error);
      // Fallback to Firebase displayName on error
      if (user.displayName) {
        setUserProfile({
          userId: user.uid,
          fullName: user.displayName,
          phoneNumber: '',
          email: user.email || '',
        });
      }
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user]);

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  // Get display name (full name or fallback)
  const getDisplayName = (fullName?: string): string => {
    if (!fullName) return 'רוכב חדש';
    return fullName.trim() || 'רוכב חדש';
  };

  const handleLogout = () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    Alert.alert(
      "התנתקות",
      "האם אתה בטוח שברצונך להתנתק?",
      [
        {
          text: "ביטול",
          style: "cancel"
        },
        { 
          text: "התנתק", 
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              console.log('🔥 Profile - Starting logout process...');
              
              // Sign out from Firebase
              await signOut();
              console.log('🔥 Profile - SignOut completed successfully');
              
              // Force navigation to login page
              console.log('🔥 Profile - Forcing navigation to login');
              router.replace('/login');
              
            } catch (error) {
              console.error('🔥 Profile - Error signing out:', error);
              Alert.alert('שגיאה', 'אירעה שגיאה בהתנתקות. אנא נסה שוב.');
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  // Show loading spinner while profile is loading
  if (isLoadingProfile) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={styles.loadingText}>טוען פרופיל...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView style={styles.container}>
        {/* Header Section with Stats */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.profileHeaderContent}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  <Ionicons name="person" size={60} color="#FFFFFF" />
                </View>
              </View>
              
              <ThemedText style={styles.username}>{getDisplayName(userProfile?.fullName)}</ThemedText>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>0</ThemedText>
                  <ThemedText style={styles.statLabel}>רכיבות</ThemedText>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>0</ThemedText>
                  <ThemedText style={styles.statLabel}>חברים</ThemedText>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>0</ThemedText>
                  <ThemedText style={styles.statLabel}>ק"מ</ThemedText>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/profile-edit')}>
            <Ionicons name="create-outline" size={20} color={Colors.light.text} />
            <ThemedText style={styles.actionButtonText}>ערוך פרופיל</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={20} color={Colors.light.text} />
            <ThemedText style={styles.actionButtonText}>הגדרות</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* About Me Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>קצת עלי</ThemedText>
          <ThemedText style={styles.aboutMeText}>
            {userProfile?.bio || 'ברוכים הבאים לפרופיל שלי! אני רוכב חדש באפליקציה, מחפש חברים לרכיבות משותפות באזור.'}
          </ThemedText>
        </ThemedView>
        
        {/* My Bikes Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>האופניים שלי</ThemedText>
          
          <View style={styles.emptyStateContainer}>
            <Ionicons name="bicycle" size={40} color={Colors.light.tabIconDefault} />
            <ThemedText style={styles.emptyStateText}>
              {userProfile?.bikeModel || 'לא הוספת עדיין אופניים לפרופיל'}
            </ThemedText>
          </View>
        </ThemedView>
        
        {/* Recent Activities Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>פעילות אחרונה</ThemedText>
          
          <View style={styles.emptyStateContainer}>
            <Ionicons name="trail-sign" size={40} color={Colors.light.tabIconDefault} />
            <ThemedText style={styles.emptyStateText}>
              אין פעילות אחרונה להצגה
            </ThemedText>
          </View>
        </ThemedView>
        
        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#E74C3C" />
          <ThemedText style={styles.logoutButtonText}>התנתק</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerGradient: {
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeaderContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  username: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.muted,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionTitle: {
    marginBottom: 12,
    textAlign: 'right',
  },
  aboutMeText: {
    lineHeight: 22,
    textAlign: 'right',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyStateText: {
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#E74C3C',
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 