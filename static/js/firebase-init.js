// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOnXD4mX2gzSEpXyFjKlODIf2-X_tFm3o",
  authDomain: "habit-tracker-2f643.firebaseapp.com",
  projectId: "habit-tracker-2f643",
  storageBucket: "habit-tracker-2f643.firebasestorage.app",
  messagingSenderId: "884669563278",
  appId: "1:884669563278:web:b50d8c15bd7d66e2a3e4df",
  measurementId: "G-4NXVSG27QD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Make app and analytics globally available for other scripts if needed
window.firebaseApp = app;
window.firebaseAnalytics = analytics;
