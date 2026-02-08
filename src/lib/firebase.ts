// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyArGnOC4ldVR3C161-6mvoruAF6WZHNptY",
    authDomain: "yt-tool-1c8fe.firebaseapp.com",
    databaseURL: "https://yt-tool-1c8fe-default-rtdb.firebaseio.com",
    projectId: "yt-tool-1c8fe",
    storageBucket: "yt-tool-1c8fe.firebasestorage.app",
    messagingSenderId: "597639946272",
    appId: "1:597639946272:web:4d545466c6f77e387edc45",
    measurementId: "G-4Y4LGEH17W"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Analytics (only supported in browser)
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, analytics };
