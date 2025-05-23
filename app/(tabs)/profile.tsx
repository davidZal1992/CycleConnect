import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const handleLogout = () => {
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
          onPress: () => {
            // Navigate to the login screen
            router.replace("/login");
          }
        }
      ]
    );
  };

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
              
              <ThemedText style={styles.username}>רוכב חדש</ThemedText>
              
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
          <TouchableOpacity style={styles.actionButton}>
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
            ברוכים הבאים לפרופיל שלי! אני רוכב חדש באפליקציה, מחפש חברים לרכיבות משותפות באזור.
          </ThemedText>
        </ThemedView>
        
        {/* My Bikes Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>האופניים שלי</ThemedText>
          
          <View style={styles.emptyStateContainer}>
            <Ionicons name="bicycle" size={40} color={Colors.light.tabIconDefault} />
            <ThemedText style={styles.emptyStateText}>
              לא הוספת עדיין אופניים לפרופיל
            </ThemedText>
            <TouchableOpacity style={styles.emptyStateButton}>
              <ThemedText style={styles.emptyStateButtonText}>הוסף אופניים</ThemedText>
            </TouchableOpacity>
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
  emptyStateButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '500',
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
}); 