import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_a0613IAaI7LlUOMPm36jDGxZ4iaAW78",
  authDomain: "workout-companion-3ebc8.firebaseapp.com",
  projectId: "workout-companion-3ebc8",
  storageBucket: "workout-companion-3ebc8.firebasestorage.app",
  messagingSenderId: "929707092624",
  appId: "1:929707092624:web:3748bb270d3c5c33a68615",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
