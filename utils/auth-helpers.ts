import { auth, db } from '@/constants/firebase-config';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const hasCompletedProfile = async (user: User): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Check if user has completed required profile fields
      return !!(userData.profileCompleted || 
        (userData.name && userData.phoneNumber && userData.city));
    }
    
    return false;
  } catch (error) {
    console.error('Error checking profile completion:', error);
    // On error, assume profile is not completed
    return false;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const getUserProfile = async (user: User): Promise<any> => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: user.uid, ...userDoc.data() };
    }
    
    // Return basic profile from Firebase Auth if no Firestore doc exists
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      profileCompleted: false
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return basic profile on error
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      profileCompleted: false
    };
  }
};