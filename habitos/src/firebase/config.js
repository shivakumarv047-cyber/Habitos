import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOnXD4mX2gzSEpXyFjKlODIf2-X_tFm3o",
  authDomain: "habit-tracker-2f643.firebaseapp.com",
  projectId: "habit-tracker-2f643",
  storageBucket: "habit-tracker-2f643.firebasestorage.app",
  messagingSenderId: "884669563278",
  appId: "1:884669563278:web:b50d8c15bd7d66e2a3e4df",
  measurementId: "G-4NXVSG27QD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
