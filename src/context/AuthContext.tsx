"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { UserProfile, dbService } from "@/lib/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { nanoid } from "nanoid";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
    isAdmin: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Subscribe to real-time profile updates
                const userRef = doc(db, "users", firebaseUser.uid);
                const unsubscribeProfile = onSnapshot(userRef, (doc) => {
                    if (doc.exists()) {
                        setProfile({ id: doc.id, ...doc.data() } as UserProfile);
                    } else {
                        // Create initial profile if it doesn't exist
                        const newProfile: Partial<UserProfile> = {
                            email: firebaseUser.email || "",
                            name: firebaseUser.displayName || "Creator",
                            plan: "free",
                            role: "user",
                            walletBalance: 0,
                            referralCode: (firebaseUser.displayName?.slice(0, 4) || "USER").toUpperCase() + nanoid(4).toUpperCase(),
                            createdAt: new Date().toISOString()
                        };
                        dbService.saveUserProfile(firebaseUser.uid, newProfile);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to profile:", error);
                    setLoading(false);
                });

                return () => unsubscribeProfile();
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            // Check if profile exists, if not create it
            const existingProfile = await dbService.getUserProfile(firebaseUser.uid);
            if (!existingProfile) {
                const referralCode = (firebaseUser.displayName?.slice(0, 4) || "USER").toUpperCase() + nanoid(4).toUpperCase();
                const newProfile: Partial<UserProfile> = {
                    email: firebaseUser.email || "",
                    name: firebaseUser.displayName || "Creator",
                    plan: "free",
                    role: "user",
                    walletBalance: 0,
                    referralCode: referralCode,
                    createdAt: new Date().toISOString()
                };
                await dbService.saveUserProfile(firebaseUser.uid, newProfile);
            }
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    const isAdmin = profile?.role === "admin";

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
