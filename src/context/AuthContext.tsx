"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut as firebaseSignOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { UserProfile, dbService } from "@/lib/firestore";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { nanoid } from "nanoid";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean; // Now based on password session
    adminAuthenticated: boolean;
    loginAdmin: (password: string) => Promise<boolean>;
    updateAdminPassword: (oldPass: string, newPass: string) => Promise<void>;
    adminEmails: string[];
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
    isAdmin: false,
    adminAuthenticated: false,
    loginAdmin: async () => false,
    updateAdminPassword: async () => { },
    adminEmails: []
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [adminEmails, setAdminEmails] = useState<string[]>([]);
    const [adminAuthenticated, setAdminAuthenticated] = useState(false);
    const [storedAdminPassword, setStoredAdminPassword] = useState("");

    useEffect(() => {
        // Subscribe to admin auth settings
        const adminSettingsRef = doc(db, "settings", "admin-auth");
        const unsubscribeAdmin = onSnapshot(adminSettingsRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setAdminEmails(data.allowedEmails || []);
                setStoredAdminPassword(data.adminPassword || "Prince364133");
            }
        });

        // Check for existing session
        const session = sessionStorage.getItem("admin_session");
        if (session === "true") {
            setAdminAuthenticated(true);
        }

        return () => unsubscribeAdmin();
    }, []);

    useEffect(() => {
        // Handle redirect result
        const handleRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    await handleUserSignIn(result.user);
                }
            } catch (error) {
                console.error("Error with redirect result:", error);
            }
        };
        handleRedirect();

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
            await handleUserSignIn(firebaseUser);
        } catch (error) {
            console.error("Error signing in with Google:", error);
            // Fallback to redirect if popup fails
            try {
                const provider = new GoogleAuthProvider();
                await signInWithRedirect(auth, provider);
            } catch (redirectError) {
                console.error("Error with Google Redirect:", redirectError);
                throw redirectError;
            }
        }
    };

    const handleUserSignIn = async (firebaseUser: User) => {
        // Double check if profile exists, if not create it
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
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            // Also clear admin session on logout
            logoutAdmin();
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    const loginAdmin = async (password: string) => {
        if (password === storedAdminPassword) {
            setAdminAuthenticated(true);
            sessionStorage.setItem("admin_session", "true");
            return true;
        }
        return false;
    };

    const logoutAdmin = () => {
        setAdminAuthenticated(false);
        sessionStorage.removeItem("admin_session");
    };

    const updateAdminPassword = async (oldPass: string, newPass: string) => {
        if (oldPass !== storedAdminPassword) {
            throw new Error("Incorrect old password");
        }
        const adminSettingsRef = doc(db, "settings", "admin-auth");
        await updateDoc(adminSettingsRef, { adminPassword: newPass });
    };

    const isAdmin = adminAuthenticated;

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            signInWithGoogle,
            logout,
            isAdmin,
            adminAuthenticated,
            loginAdmin,
            updateAdminPassword,
            adminEmails
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
