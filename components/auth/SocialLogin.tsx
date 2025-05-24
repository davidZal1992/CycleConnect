import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "@/constants/Auth0Config";
import { Colors } from "@/constants/Colors";
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
  const extractTokenFromUrl = (url: string): string | null => {
    const match = url.match(/#access_token=([^&]+)/);
    return match ? match[1] : null;
  };

  // Handle navigation after successful login
  const navigateToMainScreen = (token: string) => {
    console.log("Navigating to main screen with token", token.substring(0, 10) + "...");
    // Store token if needed
    setAccessToken(token);
    
    // Navigate directly to the main tab interface
    setTimeout(() => {
      router.replace('/');
    }, 100);
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
          
          if (token) {
            Alert.alert("התחברת בהצלחה", "ברוך הבא ל-CycleConnect!");
            navigateToMainScreen(token);
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
        `&response_type=token` +
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
          if (token) {
            navigateToMainScreen(token);
            return;
          }
        }
        
        if (result.type === 'cancel') {
          console.log('Auth canceled by user or system');
          setIsLoggingIn(false);
          
          // Look for specific error patterns
          if (result.error && typeof result.error === 'string') {
            console.log('Auth error details:', result.error);
            
            if (result.error.includes('Authentication') || result.error.includes('WebAuthenticationSession')) {
              Alert.alert(
                "Authentication Error",
                "There may be a configuration issue with the app's authentication. Tap 'Get Help' to troubleshoot.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Get Help", onPress: () => router.push('/auth0-help') }
                ]
              );
              return;
            }
          }
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

  const handleAppleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert('Apple login is not implemented in this demo.');
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