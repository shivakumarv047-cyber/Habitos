import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export const createUserProfile = async (user, name) => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    const today = new Date().toDateString();
    await setDoc(userRef, {
      name: name || user.displayName || "Habit Builder",
      email: user.email,
      provider: user.providerData[0]?.providerId || "email",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      lastLoginDate: today,
      xp: 0,
      level: 1,
      loginStreak: 1,
      waterGoal: 2000,
      weekStart: "monday"
    });
  }
};

export const updateLoginStreak = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    const lastLoginDate = data.lastLoginDate;
    
    const today = new Date();
    const todayStr = today.toDateString();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    let newStreak = data.loginStreak || 1;
    
    if (lastLoginDate === yesterdayStr) {
      newStreak += 1;
    } else if (lastLoginDate !== todayStr) {
      newStreak = 1;
    }
    
    await updateDoc(userRef, {
      loginStreak: newStreak,
      lastLogin: serverTimestamp(),
      lastLoginDate: todayStr
    });
  }
};

export const signUpWithEmail = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(userCredential.user, name);
  return userCredential.user;
};

export const signInWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await updateLoginStreak(userCredential.user.uid);
  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    await createUserProfile(user, user.displayName);
  } else {
    await updateLoginStreak(user.uid);
  }
  return user;
};

export const resetPassword = async (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const logOut = async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "/";
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
