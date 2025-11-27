// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwDjAExN5lWNqMLiXiDnB9N94aDR6NIKc",
  authDomain: "campus-a8de9.firebaseapp.com",
  projectId: "campus-a8de9",
  storageBucket: "campus-a8de9.firebasestorage.app",
  messagingSenderId: "509597388538",
  appId: "1:509597388538:web:c0d153952e5a4b40470343"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;