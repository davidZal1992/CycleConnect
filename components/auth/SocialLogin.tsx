import { Colors } from "@/constants/Colors";
import { auth } from "@/constants/firebase-config";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { router } from "expo-router";
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";

export function SocialLogin() {
  const textColor = Colors.light.text;
  const borderColor = Colors.light.border;
  const googleIconColor = '#DB4437';
  const appleIconColor = Colors.light.text;
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '696545960135-g8nibvriabrglh7bu3ld7a2llicnk6rh.apps.googleusercontent.com', // From your google-services.json
    });
  }, []);

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isLoggingIn) {
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the user's ID token
      const userInfo = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(userInfo.data?.idToken);
      
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      console.log('Google sign-in successful:', userCredential.user.email);
      Alert.alert('התחברות הצליחה!', `ברוך הבא ${userCredential.user.displayName || userCredential.user.email}!`);
      
      // Navigate to the main app
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Google login error:', error);
      
      if (error.code === 'statusCodes.SIGN_IN_CANCELLED') {
        Alert.alert('התחברות בוטלה', 'התחברות באמצעות Google בוטלה');
      } else if (error.code === 'statusCodes.IN_PROGRESS') {
        Alert.alert('התחברות בתהליך', 'התחברות כבר מתבצעת');
      } else if (error.code === 'statusCodes.PLAY_SERVICES_NOT_AVAILABLE') {
        Alert.alert('שירותי Google Play לא זמינים', 'אנא עדכן את שירותי Google Play');
      } else {
        Alert.alert('שגיאה בהתחברות', 'נכשל להתחבר באמצעות Google');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAppleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isLoggingIn) {
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      // Note: For Apple Sign-In in React Native, you'll need to install and configure
      // @invertase/react-native-apple-authentication package
      Alert.alert(
        "Apple Sign-In Setup Required",
        "To enable Apple Sign-In, you need to:\n\n1. Install @invertase/react-native-apple-authentication\n2. Configure Apple Sign-In in Firebase Console\n3. Set up Apple Developer account\n\nFor now, use email/password login.",
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Apple login error:', error);
      Alert.alert('Login Error', 'Failed to sign in with Apple');
    } finally {
      setIsLoggingIn(false);
    }
  };


  return (
    <>
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: borderColor }]} />
        <Text style={[styles.dividerText, { color: Colors.light.tabIconDefault }]}>או המשך באמצעות</Text>
        <View style={[styles.divider, { backgroundColor: borderColor }]} />
      </View>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.socialButton, 
            { borderColor },
            Platform.OS === 'android' && styles.singleButton
          ]}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
          disabled={isLoggingIn}
        >
          <Ionicons name="logo-google" size={20} color={googleIconColor} />
          <Text style={[styles.socialButtonText, { color: textColor }]}>גוגל</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.socialButton, { borderColor }]}
            onPress={handleAppleLogin}
            activeOpacity={0.8}
            disabled={isLoggingIn}
          >
            <Ionicons name="logo-apple" size={20} color={appleIconColor} />
            <Text style={[styles.socialButtonText, { color: textColor }]}>אפל</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24, 
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12, 
    fontSize: 12,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 6, 
  },
  singleButton: {
    marginHorizontal: 0,
  },
  socialButtonText: {
    marginLeft: 10, 
    fontSize: 14,
    fontWeight: '600',
  },
}); 