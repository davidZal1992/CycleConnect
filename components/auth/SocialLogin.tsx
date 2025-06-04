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
  ? Linking.createURL('auth') // This creates a URL like exp://172.20.10.2:8081/--/auth in Expo Go
  : 'cycleconnect://auth';

// Also create a localhost fallback for development
const fallbackRedirectUri = __DEV__ ? 'exp://localhost:8081/--/auth' : redirectUri;

// Log the redirectUri for debugging
console.log('🔗 Auth0 Redirect URI:', redirectUri);
console.log('🔗 Fallback Redirect URI:', fallbackRedirectUri);
// Print a message about what to do with this URI
console.log('⚠️  IMPORTANT: Add this exact URL to your Auth0 allowed callback URLs in the Auth0 dashboard');
console.log('📋 Copy this URL:', redirectUri);
console.log('');
console.log('🚨 AUTH0 SETUP REQUIRED:');
console.log('1. Go to https://dev-lwik063shdh4q48o.us.auth0.com');
console.log('2. Applications → CycleConnect → Settings');
console.log('3. Add this to "Allowed Callback URLs":', redirectUri);
console.log('4. Save changes');
console.log('');

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
      // Check for both possible redirect formats
      if (event.url.includes('/--/auth') || event.url.startsWith('cycleconnect://auth')) {
        setIsLoggingIn(false);
        
        // Handle successful login
        if (event.url.includes('access_token=') || event.url.includes('id_token=')) {
          const token = extractTokenFromUrl(event.url);
          
          if (token.accessToken) {
            navigateToMainScreen(token.accessToken);
          } else if (token.idToken) {
            navigateToMainScreen(token.idToken);
          } else {
            const errorMsg = `❌ Could not extract any token from URL: ${event.url.substring(0, 100)}...`;
            setAuthError(errorMsg);
            Alert.alert("Login Failed", "Could not extract access token from Auth0 response\n\nTap 'OK' to try again", 
              [
                { text: 'OK' },
              ]
            );
          }
        } else if (event.url.includes('error=')) {
          // Extract and display the error
          const errorMatch = event.url.match(/error=([^&]+)/);
          const errorDescMatch = event.url.match(/error_description=([^&]+)/);
          
          const error = errorMatch ? decodeURIComponent(errorMatch[1]) : "unknown_error";
          const errorDescription = errorDescMatch 
            ? decodeURIComponent(errorDescMatch[1]).replace(/\+/g, ' ') 
            : "Unknown error occurred";
          
          const errorMsg = `❌ Auth error: ${error} - ${errorDescription}`;
          setAuthError(errorDescription);
          
          if (errorDescription.includes("callback") || errorDescription.includes("redirect") || error === "redirect_uri_mismatch") {
            Alert.alert(
              "Auth0 Configuration Error", 
              `Callback URL mismatch detected.\n\nExpected: ${redirectUri}\n\nReceived error: ${error}\n\nPlease update your Auth0 settings with the correct callback URL.`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Fix Configuration", 
                  onPress: () => router.push('/auth0-help')
                },
              ]
            );
          } else {
            Alert.alert("Login Failed", `Error: ${error}\n\nDescription: ${errorDescription}`, 
              [
                { text: 'OK' },
              ]
            );
          }
        } else {
          const errorMsg = `❌ Unknown redirect format: ${event.url}`;
          setAuthError(errorMsg);
          Alert.alert("Login Failed", "Unexpected response format from Auth0", 
            [
              { text: 'OK' },
            ]
          );
        }
      } else {
        console.log('🔍 Ignoring non-auth deep link: ', event.url.substring(0, 50), '...');
      }
    };

    // Set up the event listener
    const subscription = Linking.addEventListener('url', handleRedirect);

    // Check for an initial URL (in case the app was opened via a redirect)
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('🚀 Initial URL detected: ', url);
        handleRedirect({ url });
      } else {
        console.log('📱 No initial URL detected');
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
      console.log('📱 Current URL before auth: ', currentURL || 'none');
      
      // Make sure redirect URI is properly URL encoded
      const encodedRedirectUri = encodeURIComponent(redirectUri);
      const encodedFallbackRedirectUri = encodeURIComponent(fallbackRedirectUri);
      console.log('🔒 Encoded redirect URI: ', encodedRedirectUri);
      
      // Generate a random nonce for Google authentication (required for id_token)
      const generateNonce = () => {
        const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
        let result = '';
        for (let i = 0; i < 32; i++) {
          result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
      };
      
      const nonce = generateNonce();
      console.log('🔐 Generated nonce: ', nonce.substring(0, 10), '...');
      
      const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
        `client_id=${AUTH0_CLIENT_ID}` +
        `&redirect_uri=${encodedRedirectUri}` +
        `&response_type=id_token%20token` +
        `&scope=openid%20profile%20email` +
        `&connection=google-oauth2` +
        `&nonce=${nonce}` +
        `&prompt=login`;  // Force prompt to avoid cached sessions
      
      console.log('🌐 Auth URL: ', authUrl.substring(0, 100), '...');
      
      // Test if we can open the URL first
      const canOpenAuth = await Linking.canOpenURL(authUrl);
      console.log('🔍 Can open auth URL: ', canOpenAuth);
      
      if (!canOpenAuth) {
        throw new Error('Cannot open authentication URL - URL format invalid');
      }
      
      // Use a more robust approach
      try {
        console.log('📱 Opening WebBrowser auth session...');
        // Attempt to use the WebBrowser module
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
          {
            showInRecents: true,
            preferEphemeralSession: true, // Use ephemeral session for better iOS compatibility
          }
        );
        
        console.log('📊 Browser result type: ', result.type);
        console.log('📊 Browser result URL: ', result.type === 'success' && 'url' in result ? result.url.substring(0, 100) + '...' : 'none');
        
        if (result.type === 'success' && 'url' in result && result.url) {
          console.log('✅ Auth session completed successfully');
          const token = extractTokenFromUrl(result.url);
          if (token.accessToken) {
            console.log('🎫 Successfully extracted access token');
            navigateToMainScreen(token.accessToken);
            return;
          } else if (token.idToken) {
            console.log('🎫 Successfully extracted ID token');
            navigateToMainScreen(token.idToken);
            return;
          } else {
            setIsLoggingIn(false);
            const errorMessage = 'Could not extract access token from response';
            console.log('❌ Token extraction failed: ', result.url.substring(0, 100), '...');
            setAuthError(errorMessage);
            Alert.alert('Google Login Error', errorMessage + '\n\nThis might be due to Auth0 configuration issues.', 
              [
                { text: 'OK' },
              ]
            );
            return;
          }
        } else if (result.type === 'cancel') {
          console.log('⚠️ Auth canceled by user or system');
          setIsLoggingIn(false);
          return;
        } else {
          // If we get here, the auth didn't succeed and wasn't explicitly canceled
          setIsLoggingIn(false);
          const errorMessage = 'Authentication was not completed successfully. This might be due to Auth0 configuration issues.';
          console.log('❌ Auth failed with result: ', JSON.stringify(result));
          setAuthError(errorMessage);
          Alert.alert('Google Login Error', errorMessage + '\n\nTap OK to try again', 
            [
              { text: 'OK' },
            ]
          );
          return; // Don't navigate anywhere on failure
        }
      } catch (webBrowserError) {
        console.log('❌ WebBrowser error: ', webBrowserError);
        
        // More specific error handling
        const errorMessage = webBrowserError instanceof Error ? webBrowserError.message : 'Unknown WebBrowser error';
        
        if (errorMessage.includes('callback') || errorMessage.includes('redirect_uri')) {
          setIsLoggingIn(false);
          setAuthError('Auth0 redirect URI configuration error');
          Alert.alert(
            'Configuration Error',
            `There's an issue with the Auth0 callback URL configuration.\n\nExpected: ${redirectUri}\n\nPlease check the help section for instructions.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Get Help', onPress: () => router.push('/auth0-help') },
            ]
          );
          return;
        }
        
        // Fallback to opening URL directly (less reliable)
        try {
          const canOpen = await Linking.canOpenURL(authUrl);
          if (canOpen) {
            console.log('🔄 Falling back to direct URL opening');
            await Linking.openURL(authUrl);
            // Note: When using direct URL opening, we rely on the deep link handler
          } else {
            throw new Error('Cannot open authentication URL');
          }
        } catch (linkingError) {
          console.log('❌ Linking error: ', linkingError);
          throw linkingError;
        }
      }
    } catch (e) {
      setIsLoggingIn(false);
      console.log('❌ Login error: ', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setAuthError(errorMessage);
      
      // Provide more helpful error messages
      if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.', 
          [
            { text: 'OK' },
          ]
        );
      } else if (errorMessage.includes('auth0') || errorMessage.includes('Auth0')) {
        Alert.alert(
          'Auth0 Configuration Error', 
          'There seems to be an issue with the authentication service configuration.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Get Help', onPress: () => router.push('/auth0-help') },
          ]
        );
      } else {
        Alert.alert('Login Error', 'There was a problem with the login process.', 
          [
            { text: 'OK' },
          ]
        );
      }
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