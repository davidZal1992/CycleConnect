import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPiso8CHf9YmIYO0fU_9DLa_kV53X1MEE",
  authDomain: "cycleconnect-3681d.firebaseapp.com",
  projectId: "cycleconnect-3681d",
  storageBucket: "cycleconnect-3681d.appspot.com",
  messagingSenderId: "696545960135",
  appId: "1:696545960135:web:abcdef123456789" // Need the actual web app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;