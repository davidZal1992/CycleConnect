import { auth, signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/config/firebase';
import { UserProfile } from '@/types/profile';
import firebase from 'firebase/compat/app';
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = firebase.User | null;

interface AuthContextType {
  user: User;
  userProfile: UserProfile | null;
  signInWithEmail: (email: string, password: string) => Promise<{ hasProfile: boolean }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateStoredProfile: (profile: UserProfile) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  signInWithEmail: async () => ({ hasProfile: false }),
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  updateStoredProfile: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // API endpoint for profiles
  const PROFILE_API_BASE_URL = 'http://localhost:8080/api/v1/profiles';

  useEffect(() => {
    console.log('🔥 Setting up auth state listener...');
    const unsubscribe = auth().onAuthStateChanged((user) => {
      console.log('🔥 Auth state changed:', !!user);
      if (user) {
        console.log('🔥 User details:', {
          displayName: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          uid: user.uid,
        });
      } else {
        console.log('🔥 User is null - logged out');
        setUserProfile(null); // Clear profile when user logs out
      }
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch profile when user changes
  useEffect(() => {
    if (user?.uid) {
      refreshProfile();
    }
  }, [user?.uid]);

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmail(email, password);
      return { hasProfile: result.hasProfile };
    } catch (error) {
      console.error('🔥 Error signing in with email:', error);
      throw error;
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      await signUpWithEmail(email, password, displayName);
    } catch (error) {
      console.error('🔥 Error signing up with email:', error);
      throw error;
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('🔥 Error signing in with Google:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🔥 Starting Firebase signOut...');
      await auth().signOut();
      setUserProfile(null); // Clear profile on sign out
      console.log('🔥 Firebase signOut completed');
    } catch (error) {
      console.error('🔥 Error signing out:', error);
      throw error;
    }
  };

  // Fetch user profile from backend
  const refreshProfile = async () => {
    if (!user?.uid) {
      setUserProfile(null);
      return;
    }

    try {
      console.log('🔥 AuthContext - Fetching user profile for userId:', user.uid);
      const response = await fetch(`${PROFILE_API_BASE_URL}/${user.uid}`);
      
      if (response.ok) {
        const profile = await response.json();
        console.log('🔥 AuthContext - User profile fetched successfully:', profile);
        setUserProfile(profile);
      } else {
        console.log('🔥 AuthContext - No profile found for user');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('🔥 AuthContext - Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  // Update stored profile (used when profile is updated)
  const updateStoredProfile = (profile: UserProfile) => {
    console.log('🔥 AuthContext - Updating stored profile:', profile);
    setUserProfile(profile);
  };

  const value = {
    user,
    userProfile,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    refreshProfile,
    updateStoredProfile,
    isLoading,
  };

  // Always render children, but let individual components handle loading states
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 