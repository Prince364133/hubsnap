// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBTnObqmItsT-FfO_hqxVcfTMeQWPYmTLI",
    authDomain: "start-ups-64204.firebaseapp.com",
    projectId: "start-ups-64204",
    storageBucket: "start-ups-64204.firebasestorage.app",
    messagingSenderId: "33627840663",
    appId: "1:33627840663:web:d3b4a10bd1efe3954d49d2",
    measurementId: "G-PS9X8L7S98",
    databaseURL: "https://start-ups-64204-default-rtdb.firebaseio.com"
};

import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);
const functions = getFunctions(app);

// Analytics (only supported in browser)
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

const auth = getAuth(app);

export { app, db, auth, analytics, storage, rtdb, functions };
