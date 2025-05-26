import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "@/constants/auth0-config";
import { Colors } from "@/constants/Colors";
import { hasCompletedProfile } from "@/utils/auth-helpers";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { router } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Complete auth session if needed
maybeCompleteAuthSession();

// Use different redirect URIs for development and production
// In Expo Go, we need to use the expo-development scheme
const redirectUri = __DEV__ 
  ? Linking.createURL('auth') // This creates a URL like exp://192.168.x.x:port/--/auth in Expo Go
  : 'cycleconnect://auth';

// Log the redirectUri for debugging
console.log('Auth0 Redirect URI:', redirectUri);
// Print a message about what to do with this URI
console.log('IMPORTANT: Add this exact URL to your Auth0 allowed callback URLs in the Auth0 dashboard');

export function SocialLogin() {
  const textColor = Colors.light.text;
  const borderColor = Colors.light.border;
  const googleIconColor = '#DB4437';
  const appleIconColor = Colors.light.text;
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Extract the token from the URL
  const extractTokenFromUrl = (url: string): { idToken?: string; accessToken?: string } => {
    console.log('Extracting tokens from URL:', url);
    
    const idTokenMatch = url.match(/#id_token=([^&]+)/);
    const accessTokenMatch = url.match(/#access_token=([^&]+)/) || url.match(/&access_token=([^&]+)/);
    
    const result = {
      idToken: idTokenMatch ? decodeURIComponent(idTokenMatch[1]) : undefined,
      accessToken: accessTokenMatch ? decodeURIComponent(accessTokenMatch[1]) : undefined
    };
    
    console.log('Extracted tokens:', {
      idToken: result.idToken ? result.idToken.substring(0, 50) + '...' : 'none',
      accessToken: result.accessToken ? result.accessToken.substring(0, 50) + '...' : 'none'
    });
    
    return result;
  };

  // Handle navigation after successful login
  const navigateToMainScreen = async (token: string) => {
    console.log("Navigating to main screen with token", token.substring(0, 10) + "...");
    // Store token if needed
    setAccessToken(token);
    
    try {
      // Check if user has completed their profile
      const profileCompleted = await hasCompletedProfile(token);
      
      if (profileCompleted) {
        // User has completed profile, go to main app
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      } else {
        // New user or incomplete profile, go to profile creation
        setTimeout(() => {
          router.push({
            pathname: '/profile-creation',
            params: { email: '', token }
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      // Default to profile creation on error
      setTimeout(() => {
        router.push({
          pathname: '/profile-creation',
          params: { email: '', token }
        });
      }, 100);
    }
  };

  // Set up a listener for when Auth0 redirects back to our app
  useEffect(() => {
    const handleRedirect = (event: { url: string }) => {
      console.log("Deep link detected:", event.url);
      
      // Check for both possible redirect formats
      if (event.url.includes('/--/auth') || event.url.startsWith('cycleconnect://auth')) {
        setIsLoggingIn(false);
        
        // Handle successful login
        if (event.url.includes('access_token=')) {
          console.log("Successfully logged in!");
          const token = extractTokenFromUrl(event.url);
          
          if (token.accessToken) {
            navigateToMainScreen(token.accessToken);
          } else if (token.idToken) {
            navigateToMainScreen(token.idToken);
          } else {
            setAuthError("Could not extract access token");
            Alert.alert("Login Failed", "Could not extract access token");
          }
        } else if (event.url.includes('error=')) {
          // Extract and display the error
          const errorMatch = event.url.match(/error_description=([^&]+)/);
          const errorMessage = errorMatch 
            ? decodeURIComponent(errorMatch[1]).replace(/\+/g, ' ') 
            : "Unknown error occurred";
          
          console.log("Auth error:", errorMessage);
          setAuthError(errorMessage);
          
          if (errorMessage.includes("callback") || errorMessage.includes("redirect")) {
            Alert.alert(
              "Auth0 Configuration Error", 
              "There's an issue with the callback URL. Tap 'Fix Configuration' for help.",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Fix Configuration", 
                  onPress: () => router.push('/auth0-help')
                }
              ]
            );
          } else {
            Alert.alert("Login Failed", errorMessage);
          }
        } else {
          setAuthError("Could not get access token from Auth0");
          Alert.alert("Login Failed", "Could not get access token from Auth0");
        }
      }
    };

    // Set up the event listener
    const subscription = Linking.addEventListener('url', handleRedirect);

    // Check for an initial URL (in case the app was opened via a redirect)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleRedirect({ url });
      }
    });

    // Clean up
    return () => subscription.remove();
  }, []);

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isLoggingIn) {
      return; // Prevent multiple login attempts
    }
    
    setIsLoggingIn(true);
    setAuthError(null);
    
    try {
      // Get the current URL for better redirect handling
      const currentURL = await Linking.getInitialURL();
      console.log('Current URL before auth:', currentURL);
      
      // Make sure redirect URI is properly URL encoded
      const encodedRedirectUri = encodeURIComponent(redirectUri);
      console.log('Encoded redirect URI:', encodedRedirectUri);
      
      const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
        `client_id=${AUTH0_CLIENT_ID}` +
        `&redirect_uri=${encodedRedirectUri}` +
        `&response_type=id_token%20token` +
        `&scope=openid%20profile%20email` +
        `&connection=google-oauth2` +
        `&prompt=login`;  // Force prompt to avoid cached sessions
      
      console.log("Opening Auth URL:", authUrl);
      
      // Use a more robust approach
      try {
        // Attempt to use the WebBrowser module
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
          {
            showInRecents: true,
            preferEphemeralSession: true, // Use ephemeral session for better iOS compatibility
          }
        );
        
        console.log('Browser result:', result);
        
        if (result.type === 'success' && result.url) {
          const token = extractTokenFromUrl(result.url);
          if (token.accessToken) {
            navigateToMainScreen(token.accessToken);
            return;
          } else if (token.idToken) {
            navigateToMainScreen(token.idToken);
            return;
          }
        } else if (result.type === 'cancel') {
          console.log('Auth canceled by user or system');
          setIsLoggingIn(false);
          return;
        } else {
          // If we get here, the auth didn't succeed and wasn't explicitly canceled
          setIsLoggingIn(false);
          Alert.alert('Google Login Error', 'Authentication was not completed successfully.');
          return; // Don't navigate anywhere on failure
        }
      } catch (webBrowserError) {
        console.log('WebBrowser error:', webBrowserError);
        
        // Fallback to opening URL directly (less reliable)
        try {
          const canOpen = await Linking.canOpenURL(authUrl);
          if (canOpen) {
            await Linking.openURL(authUrl);
          } else {
            throw new Error('Cannot open authentication URL');
          }
        } catch (linkingError) {
          console.log('Linking error:', linkingError);
          throw linkingError;
        }
      }
    } catch (e) {
      setIsLoggingIn(false);
      console.log('Login error:', e);
      setAuthError(e instanceof Error ? e.message : 'Unknown error');
      Alert.alert('Login Error', 'There was a problem with the login process. Please try again.');
    }
  };

  const handleAppleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isLoggingIn) {
      return; // Prevent multiple login attempts
    }
    
    setIsLoggingIn(true);
    setAuthError(null);
    
    try {
      // Generate a random nonce for Apple authentication
      const generateNonce = () => {
        const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
        let result = '';
        for (let i = 0; i < 32; i++) {
          result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
      };
      
      const nonce = generateNonce();
      
      // Make sure redirect URI is properly URL encoded
      const encodedRedirectUri = encodeURIComponent(redirectUri);
      console.log('Apple Login - Encoded redirect URI:', encodedRedirectUri);
      console.log('Apple Login - Generated nonce:', nonce);
      
      const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
        `client_id=${AUTH0_CLIENT_ID}` +
        `&redirect_uri=${encodedRedirectUri}` +
        `&response_type=id_token%20token` +
        `&scope=openid%20profile%20email` +
        `&connection=apple` +
        `&nonce=${nonce}` +
        `&prompt=login`;  // Force prompt to avoid cached sessions
      
      console.log("Opening Apple Auth URL:", authUrl);
      
      try {
        // Use WebBrowser for Apple login with specific iOS settings
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
          {
            showInRecents: false, // Changed to false for Apple
            preferEphemeralSession: false, // Changed to false for Apple - persistent session works better
            createTask: false, // Add this for iOS
          }
        );
        
        console.log('Apple login browser result:', result);
        
        if (result.type === 'success' && result.url) {
          const token = extractTokenFromUrl(result.url);
          if (token.accessToken) {
            navigateToMainScreen(token.accessToken);
          } else if (token.idToken) {
            navigateToMainScreen(token.idToken);
          } else {
            setIsLoggingIn(false);
            setAuthError("Could not extract access token");
            Alert.alert("Login Failed", "Could not extract access token");
          }
        } else if (result.type === 'cancel') {
          console.log('Apple auth canceled by user or system');
          setIsLoggingIn(false);
          
          // Show helpful message for cancellation
          Alert.alert(
            'Apple Login Issue', 
            'Apple authentication was canceled. This might be due to:\n\n' +
            '• Apple connection not configured in Auth0\n' +
            '• Invalid redirect URI\n' +
            '• iOS simulator limitations\n\n' +
            'Try using Google login or test on a physical device.',
            [
              { text: 'OK', style: 'default' },
              { text: 'Try Google', onPress: handleGoogleLogin }
            ]
          );
          return;
        } else {
          // If we get here, the auth didn't succeed and wasn't explicitly canceled
          setIsLoggingIn(false);
          console.log('Apple auth failed with result:', result);
          Alert.alert(
            'Apple Login Error', 
            'Authentication was not completed successfully. This might be due to Apple connection configuration issues in Auth0.',
            [
              { text: 'OK', style: 'default' },
              { text: 'Try Google', onPress: handleGoogleLogin }
            ]
          );
          return; // Don't navigate anywhere on failure
        }
      } catch (webBrowserError) {
        console.log('Apple WebBrowser error:', webBrowserError);
        setIsLoggingIn(false);
        
        // More specific error handling for Apple
        const errorMessage = webBrowserError instanceof Error ? webBrowserError.message : 'Unknown error';
        
        if (errorMessage.includes('AuthenticationServices') || errorMessage.includes('WebAuthenticationSession')) {
          Alert.alert(
            'Apple Authentication Error',
            'Apple Sign-In is not available or properly configured. This could be due to:\n\n' +
            '• Running on iOS Simulator (Apple Sign-In works better on real devices)\n' +
            '• Apple connection not set up in Auth0\n' +
            '• Network connectivity issues\n\n' +
            'Please try Google login or test on a physical device.',
            [
              { text: 'OK', style: 'default' },
              { text: 'Try Google', onPress: handleGoogleLogin }
            ]
          );
        } else {
          // Fallback to opening URL directly
          try {
            const canOpen = await Linking.canOpenURL(authUrl);
            if (canOpen) {
              await Linking.openURL(authUrl);
            } else {
              throw new Error('Cannot open Apple authentication URL');
            }
          } catch (linkingError) {
            console.log('Apple Linking error:', linkingError);
            Alert.alert(
              'Apple Login Error',
              'Unable to open Apple authentication. Please try Google login instead.',
              [
                { text: 'OK', style: 'default' },
                { text: 'Try Google', onPress: handleGoogleLogin }
              ]
            );
          }
        }
      }
    } catch (e) {
      setIsLoggingIn(false);
      console.log('Apple login error:', e);
      setAuthError(e instanceof Error ? e.message : 'Unknown error');
      Alert.alert(
        'Apple Login Error', 
        'There was a problem with the Apple login process. Please try Google login instead.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Try Google', onPress: handleGoogleLogin }
        ]
      );
    }
  };

  const navigateToHelp = () => {
    router.push('/auth0-help');
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
          <Ionicons name="logo-google" size={20} color={googleIconColor} />
          <Text style={[styles.socialButtonText, { color: textColor }]}>גוגל</Text>
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
      
      {authError && (
        <TouchableOpacity style={styles.helpButton} onPress={navigateToHelp}>
          <Ionicons name="help-circle-outline" size={16} color="white" style={styles.helpIcon} />
          <Text style={styles.helpButtonText}>בעיות התחברות? לחץ כאן לעזרה</Text>
        </TouchableOpacity>
      )}
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
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary + '99',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  helpButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  helpIcon: {
    marginRight: 8,
  },
}); 