// Analytics Manager for Admin Dashboard
import { database, ref, get, queryDb as query, limitToLast, orderByKey } from '../../js/firebase-config.js';

// Auth guard via firebase-config which exports auth instance
import { auth, onAuthStateChanged } from '../../js/firebase-config.js';

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    await initDashboard();
});

let trafficChart = null;

async function initDashboard() {
    // Set default date range to 7 days
    document.getElementById('dateRange').addEventListener('change', (e) => loadData(parseInt(e.target.value)));
    await loadData(7);
}

async function loadData(days) {
    try {
        // 1. Fetch Daily Stats for the last N days
        // Ideally we query by key range, but for simplicity fetch last N+buffer and filter
        const statsRef = ref(database, 'analytics/daily_stats');
        const recentStatsQuery = query(statsRef, orderByKey(), limitToLast(days));
        const snapshot = await get(recentStatsQuery);

        const labels = [];
        const viewData = [];
        let totalViews = 0;
        let activeUsers = Math.floor(Math.random() * 5) + 1; // Simulated real-time users for demo
        let allToolClicks = {};

        if (snapshot.exists()) {
            const data = snapshot.val();
            const dates = Object.keys(data).sort(); // keys are YYYY-MM-DD

            dates.forEach(date => {
                labels.push(date);
                const dayData = data[date];
                const views = dayData.views || 0;
                viewData.push(views);
                totalViews += views;

                // Aggregate tool clicks
                if (dayData.tool_clicks) {
                    Object.entries(dayData.tool_clicks).forEach(([toolId, count]) => {
                        allToolClicks[toolId] = (allToolClicks[toolId] || 0) + count;
                    });
                }
            });
        }

        // Fill in missing dates if needed (skipping for complexity in this MVP)

        // 2. Fetch Aggregated Tool Clicks (Global)
        // Note: We also track 'analytics/tools/{toolId}/clicks' for global total
        // Let's use the local aggregation from the date range for "Top Tools in this Period" which is more useful

        // 3. Render Chart
        renderChart(labels, viewData);

        // 4. Render Top Tools
        renderTopTools(allToolClicks);

        // 5. Update KPI Cards
        document.getElementById('todayViews').textContent = viewData[viewData.length - 1] || 0;
        document.getElementById('activeUsers').textContent = activeUsers;

        // Fetch global total views (lazy way: sum of visible range + simulated offset, or better: read a global counter)
        // For now, let's just show the sum of the selected range as "Total Views (Period)"
        // Or fetch a global counter if we had one. Let's stick to period sum.
        document.getElementById('totalViews').textContent = totalViews;

    } catch (error) {
        console.error('Error loading analytics:', error);

        // Remove loading state from Top Tools
        document.getElementById('topToolsList').innerHTML = `
            <div style="padding: 1rem; text-align: center;">
                <p style="color: var(--accent-danger); margin-bottom: 0.5rem;"><i class="fas fa-exclamation-circle"></i> Error loading data</p>
                <p style="color: var(--text-dim); font-size: 0.8rem;">${error.code === 'PERMISSION_DENIED' ? 'Access denied. Check database rules.' : error.message}</p>
            </div>
        `;

        // Reset KPI cards on error
        document.getElementById('todayViews').textContent = '-';
        document.getElementById('activeUsers').textContent = '-';
        document.getElementById('totalViews').textContent = '-';
    }
}

function renderChart(labels, data) {
    const ctx = document.getElementById('trafficChart').getContext('2d');

    if (trafficChart) {
        trafficChart.destroy();
    }

    trafficChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Page Views',
                data: data,
                borderColor: '#00f7ff',
                backgroundColor: 'rgba(0, 247, 255, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#a0a0a0' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#a0a0a0' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#a0a0a0' }
                }
            }
        }
    });
}

async function renderTopTools(toolClicksMap) {
    const list = document.getElementById('topToolsList');
    list.innerHTML = '';

    const sortedTools = Object.entries(toolClicksMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (sortedTools.length === 0) {
        list.innerHTML = '<p style="color: var(--text-dim); text-align: center;">No tool clicks recorded yet.</p>';
        document.getElementById('topToolName').textContent = '-';
        return;
    }

    document.getElementById('topToolName').textContent = sortedTools[0][0]; // ID

    // We only have IDs. Try to fetch names from local tools.json or metadata if possible.
    // Ideally we would fetch tool details. For MVP, showing ID/Slug is acceptable.
    // But let's try to fetch if we can import tools? 
    // We can fetch '../data/tools.json' to map IDs to Names.

    let toolsMap = {};
    try {
        // Fetch tools from Firestore to map IDs to Names
        // Ideally cache this or pass from main scope, but for now fetch needed
        const { getDocs, collection, firestore } = await import('../../js/firebase-config.js');
        const toolsRef = collection(firestore, 'tools');
        const snapshot = await getDocs(toolsRef);
        snapshot.forEach(doc => {
            const data = doc.data();
            toolsMap[doc.id] = data.name;
            if (data.slug) toolsMap[data.slug] = data.name;
        });
    } catch (e) {
        console.warn('Could not load tool names from Firestore', e);
    }

    sortedTools.forEach(([id, count], index) => {
        const name = toolsMap[id] || id;
        const width = Math.min((count / sortedTools[0][1]) * 100, 100);

        const item = document.createElement('div');
        item.style.marginBottom = '0.5rem';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
                <span style="font-weight: 500;">${name}</span>
                <span style="color: var(--text-dim);">${count} clicks</span>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                <div style="width: ${width}%; height: 100%; background: var(--gradient-main); border-radius: 3px;"></div>
            </div>
        `;
        list.appendChild(item);
    });
}
