// Admin Dashboard Logic
import { auth, database, firestore, collection, getDocs, getCountFromServer, signOut, onAuthStateChanged } from '../../js/firebase-config.js';

// Auth guard
// Auth guard
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    await loadDashboardStats();
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
});

async function loadDashboardStats() {
    try {
        // 1. Tools Count
        const toolsRef = collection(firestore, 'tools');
        const toolsSnapshot = await getCountFromServer(toolsRef);
        document.getElementById('totalTools').textContent = toolsSnapshot.data().count;

        // 2. Guides Count
        const guidesRef = collection(firestore, 'guides');
        const guidesSnapshot = await getCountFromServer(guidesRef);
        document.getElementById('totalGuides').textContent = guidesSnapshot.data().count;

        // 3. Locked Content (Count tools where locked == true)
        // Note: count() with query is more efficient
        const allToolsSnap = await getDocs(toolsRef);
        const lockedCount = allToolsSnap.docs.filter(doc => doc.data().locked).length;
        document.getElementById('lockedContent').textContent = lockedCount;

        // 4. Users Count (Simulated or Real)
        // If we have a users collection:
        // const usersRef = collection(firestore, 'users');
        // const usersSnap = await getCountFromServer(usersRef);
        // document.getElementById('totalUsers').textContent = usersSnap.data().count;
        document.getElementById('totalUsers').textContent = '0'; // Placeholder for now

        // 5. Recent Activity (Simulated from tools for now)
        // We can show recently added tools
        const recentTools = allToolsSnap.docs
            .map(d => ({ ...d.data(), id: d.id }))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);

        const activityLog = document.getElementById('activityLog');
        if (recentTools.length > 0) {
            activityLog.innerHTML = recentTools.map(tool => `
                <div class="activity-item" style="padding: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 1rem;">
                    <div style="background: rgba(0, 247, 255, 0.1); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-plus" style="color: var(--accent-primary); font-size: 0.8rem;"></i>
                    </div>
                    <div>
                        <p style="margin: 0; font-weight: 500;">New Tool Added: ${tool.name}</p>
                        <p style="margin: 0; font-size: 0.8rem; color: var(--text-dim);">${new Date(tool.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>
            `).join('');
        } else {
            activityLog.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 1rem;">No recent activity</p>';
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('totalTools').textContent = '-';
        document.getElementById('totalGuides').textContent = '-';
        document.getElementById('lockedContent').textContent = '-';
        document.getElementById('activityLog').innerHTML = `
            <p style="color: var(--accent-danger);"><i class="fas fa-exclamation-circle"></i> Error loading dashboard data: ${error.message}</p>
        `;
    }
}
