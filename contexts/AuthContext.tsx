import { auth, signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/config/firebase';
import firebase from 'firebase/compat/app';
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = firebase.User | null;

interface AuthContextType {
  user: User;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 Setting up auth state listener...');
    const unsubscribe = auth().onAuthStateChanged((user) => {
      console.log('🔥 Auth state changed:', !!user);
      if (user) {
        console.log('🔥 User details:', {
          displayName: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          metadata: user.metadata,
          photoURL: user.photoURL,
          providerData: user.providerData,
          uid: user.uid,
        });
      }
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('🔥 Error signing in with email:', error);
      throw error;
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string, displayName: string) => {
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
      await auth().signOut();
    } catch (error) {
      console.error('🔥 Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
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