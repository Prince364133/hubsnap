// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, set, update, remove, onValue, runTransaction, query as dbQuery, limitToLast, orderByKey } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);

// Expose for non-module scripts
window.firebaseDb = database;
window.firebaseRef = ref;
window.firebaseGet = get;

// Export instances
export {
    app, analytics, auth, database, firestore,
    signInWithEmailAndPassword, signOut, onAuthStateChanged,
    ref, get, set, update, remove, onValue, runTransaction, dbQuery as queryDb, limitToLast, orderByKey,
    collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, getCountFromServer
};
