// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword as firebaseSignIn, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuth, GoogleAuthProvider, signInWithPopup as firebasePopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref as firebaseRef, get as firebaseGet, set as firebaseSet, update as firebaseUpdate, remove as firebaseRemove, onValue as firebaseOnValue, runTransaction as firebaseTransaction, query as dbQuery, limitToLast, orderByKey } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

const firebaseConfig = {
    apiKey: "AIzaSyArGnOC4ldVR3C161-6mvoruAF6WZHNptY",
    authDomain: "yt-tool-1c8fe.firebaseapp.com",
    databaseURL: "https://yt-tool-1c8fe-default-rtdb.firebaseio.com",
    projectId: "yt-tool-1c8fe",
    storageBucket: "yt-tool-1c8fe.firebasestorage.app",
    messagingSenderId: "597639946272",
    appId: "1:597639946272:web:974763ad16d207487edc45",
    measurementId: "G-TS3EKFV47B"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);

// Configure Google Provider for YouTube Access
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/youtube.readonly');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Export instances and functions
export { app, analytics, auth, database, firestore, functions, googleProvider };

// Re-export Realtime Database functions
export const ref = firebaseRef;
export const get = firebaseGet;
export const set = firebaseSet;
export const update = firebaseUpdate;
export const remove = firebaseRemove;
export const onValue = firebaseOnValue;
export const runTransaction = firebaseTransaction;
export { dbQuery, limitToLast, orderByKey };

// Re-export Auth functions
export const signInWithEmailAndPassword = firebaseSignIn;
export const signOut = firebaseSignOut;
export const onAuthStateChanged = firebaseOnAuth;
export const signInWithPopup = firebasePopup;
export { GoogleAuthProvider };

// Re-export Firestore functions
export { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, getCountFromServer };

// Re-export Functions
export { getFunctions, httpsCallable };
