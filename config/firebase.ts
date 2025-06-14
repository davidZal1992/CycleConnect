import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyAg0-YFnGnfg4-BNoiXgD52rghhHxWC--c",
  authDomain: "cycleconnect-3681d.firebaseapp.com",
  projectId: "cycleconnect-3681d",
  storageBucket: "cycleconnect-3681d.firebasestorage.app",
  messagingSenderId: "696545960135",
  appId: "1:696545960135:ios:f1e5fc4a412672f9e5dee2"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Connect to emulators in development
if (__DEV__) {
  console.log('🔥 Connecting to Firebase emulators...');
  console.log('🔥 Auth emulator: http://localhost:9099');
  
  try {
    firebase.auth().useEmulator('http://localhost:9099');
    console.log('🔥 ✅ Auth emulator connected successfully');
  } catch (error) {
    console.error('🔥 ❌ Failed to connect to Auth emulator:', error);
  }
}

console.log('🔥 Firebase initialized with web SDK');
console.log('🔥 Firebase apps:', firebase.apps.length);

// Export auth and storage functions
export const auth = firebase.auth;

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '696545960135-crhdd2fi9ngj1j4jp5af0vrao7jspenv.apps.googleusercontent.com',
  iosClientId: '696545960135-crhdd2fi9ngj1j4jp5af0vrao7jspenv.apps.googleusercontent.com',
  offlineAccess: true,
});

// Check if user has a profile
export const checkUserProfile = async (userId: string) => {
  try {
    console.log('🔥 Checking user profile for userId:', userId);
    const response = await fetch(`http://localhost:8080/api/v1/profiles/exists/${userId}`);
    console.log('🔥 Response status:', response.status);
    console.log('🔥 Response headers:', response.headers);
    
    const hasProfile = await response.json();
    console.log('🔥 Response data (hasProfile):', hasProfile);
    
    return hasProfile;
  } catch (error: any) {
    console.error('🔥 Error checking user profile:', error);
    console.error('🔥 Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return false;
  }
};

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('שגיאה בהתחברות. לא התקבל מידע על המשתמש.');
    }
    
    // Check if user has a profile
    const hasProfile = await checkUserProfile(userCredential.user.uid);
    
    return {
      user: userCredential.user,
      hasProfile
    };
  } catch (error: any) {
    console.error('🔥 Error signing in with email:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/user-not-found') {
      throw new Error('משתמש לא נמצא. אנא בדוק את כתובת המייל או הירשם כמשתמש חדש.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('סיסמה שגויה. אנא נסה שוב.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('כתובת המייל אינה תקינה.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('החשבון הזה חסום. אנא פנה לתמיכה.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('יותר מדי ניסיונות התחברות. אנא נסה שוב מאוחר יותר.');
    }
    
    // Generic error for other cases
    throw new Error('שגיאה בהתחברות. אנא נסה שוב.');
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('שגיאה בהרשמה. לא התקבל מידע על המשתמש.');
    }
    
    // Only update profile if displayName is provided
    if (displayName) {
      await userCredential.user?.updateProfile({ displayName });
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error('🔥 Error signing up with email:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('כתובת האימייל כבר קיימת במערכת. אנא התחבר או השתמש בכתובת אחרת');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('כתובת האימייל אינה תקינה');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('הרשמה באמצעות אימייל אינה זמינה כרגע');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('הסיסמה חלשה מדי. אנא בחר סיסמה חזקה יותר');
    }
    
    // Generic error for other cases
    throw new Error('שגיאה בהרשמה. אנא נסה שוב מאוחר יותר');
  }
};

export const signInWithGoogle = async () => {
  try {
    // First, sign out from Google to ensure a fresh sign-in
    await GoogleSignin.signOut();
    
    // Start the sign-in process
    const userInfo = await GoogleSignin.signIn();
    if (!userInfo) {
      throw new Error('ההתחברות בוטלה');
    }
    
    const { accessToken } = await GoogleSignin.getTokens();
    if (!accessToken) {
      throw new Error('ההתחברות בוטלה');
    }
    
    // Create a Google credential with the token
    const googleCredential = firebase.auth.GoogleAuthProvider.credential(accessToken);
    
    // Sign in with credential
    const userCredential = await firebase.auth().signInWithCredential(googleCredential);
    
    // Check if user has a profile
    if (!userCredential.user) {
      throw new Error('שגיאה בהתחברות. לא התקבל מידע על המשתמש.');
    }
    const hasProfile = await checkUserProfile(userCredential.user.uid);
    
    return {
      user: userCredential.user,
      hasProfile
    };
  } catch (error: any) {
    console.error('🔥 Error signing in with Google:', error);
    if (error.code === 'auth/cancelled-popup-request' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.message === 'ההתחברות בוטלה') {
      throw new Error('ההתחברות בוטלה');
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    // Sign out from Firebase
    await firebase.auth().signOut();
    
    // Sign out from Google
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.revokeAccess();
    } catch (error) {
      // Ignore error if user is not signed in
    }
    
    console.log('🔥 Successfully signed out from all providers');
  } catch (error) {
    console.error('🔥 Error signing out:', error);
    throw error;
  }
};

export { appleAuth, GoogleSignin };

