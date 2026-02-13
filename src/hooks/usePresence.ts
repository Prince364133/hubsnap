import { useEffect, useState } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, onDisconnect, set, serverTimestamp, push } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { nanoid } from "nanoid";

export function usePresence() {
    const { user } = useAuth();
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        // 1. Identify User (Auth ID or Anonymous Session ID)
        let userId = user?.uid;
        if (!userId) {
            let storedId = localStorage.getItem("analytics_anon_id");
            if (!storedId) {
                storedId = nanoid(10);
                localStorage.setItem("analytics_anon_id", storedId);
            }
            userId = `anon_${storedId}`;
        }

        // 2. References
        const userStatusRef = ref(rtdb, `/status/${userId}`);
        const connectedRef = ref(rtdb, ".info/connected");
        const allStatusRef = ref(rtdb, "/status");

        // 3. Handle Connection
        const unsubscribeConnected = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                // We're connected (or reconnected)!

                // Set to offline when we disconnect (close tab, lose internet)
                onDisconnect(userStatusRef).set({
                    state: "offline",
                    last_changed: serverTimestamp(),
                }).then(() => {
                    // Set to online NOW
                    set(userStatusRef, {
                        state: "online",
                        last_changed: serverTimestamp(),
                        userId: user?.uid || null, // Store real ID if available
                        platform: 'web'
                    });
                });
            }
        });

        // 4. Count Online Users
        const unsubscribeCount = onValue(allStatusRef, (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                // Count keys where state == 'online'
                const count = Object.values(data).filter((s: any) => s.state === 'online').length;
                setOnlineCount(count);
            } else {
                setOnlineCount(0);
            }
        });

        return () => {
            unsubscribeConnected();
            unsubscribeCount();
            // Optional: Set offline on unmount (navigation) if needed, 
            // but onDisconnect handles the robust cases.
        };
    }, [user]);

    return { onlineCount };
}
