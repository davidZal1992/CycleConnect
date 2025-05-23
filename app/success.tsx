import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, Easing, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function SuccessScreen() {
  // Animation values
  const bikePosition = useRef(new Animated.Value(-100)).current;
  const bikeRotation = useRef(new Animated.Value(0)).current;
  const bikeYPosition = useRef(new Animated.Value(0)).current;
  
  // Create a cycling wheel rotation animation
  const wheelSpin = bikeRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    // Vertical bouncing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bikeYPosition, {
          toValue: -10,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(bikeYPosition, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();

    // Horizontal movement animation
    Animated.loop(
      Animated.sequence([
        // Move bike from left to right
        Animated.parallel([
          Animated.timing(bikePosition, {
            toValue: width + 100,
            duration: 5000,
            easing: Easing.linear,
            useNativeDriver: true
          }),
          // Rotate the wheels continuously
          Animated.loop(
            Animated.timing(bikeRotation, {
              toValue: 360,
              duration: 800,
              easing: Easing.linear,
              useNativeDriver: true
            }),
            { iterations: 6 } // Approximately match the 5000ms movement duration
          )
        ]),
        // Reset position for the next cycle
        Animated.timing(bikePosition, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={80} color="#2ECC71" />
        <Text style={styles.title}>התחברת בהצלחה!</Text>
        <Text style={styles.subtitle}>מיד תועבר לאפליקציה</Text>
        
        {/* Animated bicycle */}
        <View style={styles.animationContainer}>
          <Animated.View 
            style={[
              styles.bikeContainer,
              { 
                transform: [
                  { translateX: bikePosition },
                  { translateY: bikeYPosition }
                ] 
              }
            ]}
          >
            <View style={styles.bikeWrapper}>
              <MaterialCommunityIcons name="bicycle" size={50} color="#3498DB" />
              
              {/* Animated wheels */}
              <Animated.View 
                style={[
                  styles.wheelLeft, 
                  { transform: [{ rotate: wheelSpin }] }
                ]}
              >
                <View style={styles.wheelSpoke} />
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.wheelRight, 
                  { transform: [{ rotate: wheelSpin }] }
                ]}
              >
                <View style={styles.wheelSpoke} />
              </Animated.View>
            </View>
          </Animated.View>
        </View>

        {/* Logout button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>התנתק</Text>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 8,
    textAlign: 'center',
  },
  animationContainer: {
    height: 70,
    width: '100%',
    marginTop: 40,
    overflow: 'hidden',
    position: 'relative'
  },
  bikeContainer: {
    position: 'absolute'
  },
  bikeWrapper: {
    position: 'relative',
  },
  wheelLeft: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3498DB',
    left: 8,
    bottom: 5
  },
  wheelRight: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3498DB',
    right: 8,
    bottom: 5
  },
  wheelSpoke: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#3498DB',
    top: '50%',
    left: 0,
    marginTop: -1
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutIcon: {
    marginLeft: 8,
  }
}); 