import { auth, checkUserProfile, firebaseConfig, GoogleSignin } from '@/config/firebase';
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import firebase from 'firebase/compat/app';
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function SocialLogin() {
  const textColor = Colors.light.text;
  const borderColor = Colors.light.border;
  const googleIconColor = '#DB4437';
  const appleIconColor = Colors.light.text;
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsLoggingIn(true);

      console.log('🔥 Starting Google Sign-In...');

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // First, sign out from Google to ensure a fresh sign-in
      await GoogleSignin.signOut();
      
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      console.log('🔥 Google Sign-In result:', signInResult);
      
      // Check if user cancelled
      if (!signInResult || signInResult.type === 'cancelled') {
        console.log('🔥 Google Sign-In was cancelled');
        return;
      }
      
      // Extract tokens from the response
      const idToken = signInResult.data?.idToken;
      const serverAuthCode = signInResult.data?.serverAuthCode;

      console.log('DATA' + JSON.stringify(signInResult.data))
      
      console.log('🔥 ID Token:', idToken ? 'Found' : 'Not found');
      console.log('🔥 Server Auth Code:', serverAuthCode ? 'Found' : 'Not found');
      console.log('🔥 Sign-in result keys:', Object.keys(signInResult));
      console.log('🔥 Sign-in result data keys:', signInResult.data ? Object.keys(signInResult.data) : 'No data');

      // Use either ID token or access token for Firebase auth
      let credential;
      if (idToken) {
        console.log('🔥 Creating credential with ID token...');
        credential = firebase.auth.GoogleAuthProvider.credential(idToken);
      } else {
        throw new Error('No authentication tokens received from Google Sign-In. Please try again.');
      }

      console.log('🔥 Signing in with credential...');
      console.log('🔥 Firebase config check:', {
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId
      });
      
      // Test Firebase connectivity before signing in
      console.log('🔥 Testing Firebase connectivity...');
      try {
        const testUser = await auth().currentUser;
        console.log(testUser + "Test")
        console.log('🔥 Firebase auth instance accessible:', testUser !== undefined);
      } catch (connectivityError) {
        console.log('🔥 Firebase connectivity issue:', connectivityError);
      }
      
      // Sign-in the user with the credential
      console.log('🔥 About to sign in with credential to Firebase Auth...');
      
      const userCredential = await auth().signInWithCredential(credential);
      
      if (!userCredential.user) {
        throw new Error('Failed to get user after sign in');
      }

      console.log('🔥 ✅ User signed in with Google successfully:', userCredential.user.email);
      
      // Check if user has a profile
      const hasProfile = await checkUserProfile(userCredential.user.uid);
      
      // Navigate based on profile status
      if (hasProfile) {
        router.replace('/(tabs)');
      } else {
        router.replace('/profile-creation');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      // Don't show error for user cancellation
      if (error.code === 'sign_in_cancelled' || error.code === 'SIGN_IN_CANCELLED') {
        console.log('🔥 User cancelled sign-in, no error shown');
        return;
      }
      
      let errorMessage = 'שגיאה בהתחברות עם גוגל';
      
      if (error.message && error.message.includes('No authentication tokens')) {
        errorMessage = 'שגיאה בקבלת פרטי ההתחברות מגוגל. נסה שוב.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'חשבון עם כתובת מייל זו כבר קיים עם ספק אחר';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'פרטי ההתחברות לא תקינים';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'התחברות עם גוגל לא מופעלת';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'החשבון הזה חסום';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'משתמש לא נמצא';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'סיסמה שגויה';
      }
      
      Alert.alert('שגיאה', errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAppleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // TODO: Implement Apple Sign-In
    Alert.alert(
      'Apple Sign-In',
      'התחברות עם Apple תתווסף בקרוב',
      [{ text: 'אישור' }]
    );
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
          style={[styles.socialButton, { borderColor }]}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <ActivityIndicator size="small" color={googleIconColor} />
          ) : (
            <Ionicons name="logo-google" size={20} color={googleIconColor} />
          )}
          <Text style={[styles.socialButtonText, { color: textColor }]}>
            {isLoggingIn ? 'מתחבר...' : 'גוגל'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, { borderColor }]}
          onPress={handleAppleLogin}
          activeOpacity={0.8}
          disabled={isLoggingIn}
        >
          <Ionicons name="logo-apple" size={20} color={appleIconColor} />
          <Text style={[styles.socialButtonText, { color: textColor }]}>אפל</Text>
        </TouchableOpacity>
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
  socialButtonText: {
    marginLeft: 10, 
    fontSize: 14,
    fontWeight: '600',
  },
}); 