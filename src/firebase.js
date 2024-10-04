import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';  // Firebase Storage
import AsyncStorage from '@react-native-async-storage/async-storage';



const firebaseConfig = {
    apiKey: "AIzaSyANFl4AN5bbyKkvQg3aH10BKMW9vSIJSUo",
    authDomain: "mentorzone-e24d2.firebaseapp.com",
    projectId: "mentorzone-e24d2",
    storageBucket: "mentorzone-e24d2.appspot.com",  // Sørg for at 'storageBucket' er korrekt
    messagingSenderId: "409680774156",
    appId: "1:409680774156:web:36b800aafc958f8a451a29"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);  // Firebase Storage

export { auth, db, storage };