/**
 * Temporary script to set admin role for current user
 * Run this once to grant yourself admin access
 */

import { db, auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

async function setAdminRole() {
    const user = auth.currentUser;

    if (!user) {
        console.error('No user is currently logged in. Please log in first.');
        return;
    }

    console.log(`Setting admin role for user: ${user.email} (${user.uid})`);

    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            // Update existing user document
            await setDoc(userRef, { role: 'admin' }, { merge: true });
            console.log('✅ Admin role updated successfully!');
        } else {
            // Create new user document with admin role
            await setDoc(userRef, {
                id: user.uid,
                email: user.email,
                name: user.displayName || user.email,
                role: 'admin',
                plan: 'pro_plus',
                walletBalance: 0,
                createdAt: new Date()
            });
            console.log('✅ User document created with admin role!');
        }

        console.log('You can now use the URL shortener and other admin features.');
    } catch (error) {
        console.error('Error setting admin role:', error);
    }
}

// Auto-run when auth state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        setAdminRole();
    }
});

export { setAdminRole };
