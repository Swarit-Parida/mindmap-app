// Firebase configuration
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAVoUYtChqxrSBLiWTOk__NvpJV9RpRcXo",
  authDomain: "emotional-pattern-tracker.firebaseapp.com",
  projectId: "emotional-pattern-tracker",
  storageBucket: "emotional-pattern-tracker.firebasestorage.app",
  messagingSenderId: "838172428913",
  appId: "1:838172428913:web:1ba7a27da82669927ee9d0",
  measurementId: "G-4B3YJ86JNV",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  _auth = getAuth(app);
  _db = getFirestore(app);
}

export const firebaseApp = app;
export const auth = _auth;
export const db = _db;
