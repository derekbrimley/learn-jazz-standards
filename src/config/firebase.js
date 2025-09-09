import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your Firebase config - you'll need to replace these with your actual values
// Get these from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyBeqqHOyTxwDkJTPgQju5c4O_NeOlE3dcc",
  authDomain: "standards-workbook.firebaseapp.com",
  projectId: "standards-workbook",
  storageBucket: "standards-workbook.firebasestorage.app",
  messagingSenderId: "754177496949",
  appId: "1:754177496949:web:9183716217d1246cbee53c",
  measurementId: "G-M23FFVCHXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;