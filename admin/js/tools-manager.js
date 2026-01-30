// Tools Management Logic
import { auth, database, firestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, ref, get, query, limit, orderBy, startAfter } from '../../js/firebase-config.js';

let allTools = [];
let lastVisibleDoc = null;
const ITEMS_PER_PAGE = 20;
const selectedTools = new Set();

// Auth guard
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    // Strict admin check removed as per user request
    await loadTools();
});

// Load Tools with Pagination
async function loadTools(loadMore = false) {
    try {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;

        let q;
        const toolsRef = collection(firestore, 'tools');

        if (loadMore && lastVisibleDoc) {
            q = query(toolsRef, orderBy('createdAt', 'desc'), startAfter(lastVisibleDoc), limit(ITEMS_PER_PAGE));
        } else {
            q = query(toolsRef, orderBy('createdAt', 'desc'), limit(ITEMS_PER_PAGE));
            allTools = []; // Reset if not loading more
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            loadMoreBtn.style.display = 'none';
            if (!loadMore) {
                renderToolsTable();
            }
            return;
        }

        lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

        const newTools = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (loadMore) {
            allTools = [...allTools, ...newTools];
        } else {
            allTools = newTools;
        }

        renderToolsTable();

        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.disabled = false;
        loadMoreBtn.style.display = snapshot.docs.length < ITEMS_PER_PAGE ? 'none' : 'inline-block';

    } catch (error) {
        console.error('Error loading tools:', error);
        // Fallback for missing createdAt index or field
        if (error.message.includes('requires an index')) {
            console.warn('Index missing, falling back to unsorted fetch');
            const fallbackSnapshot = await getDocs(collection(firestore, 'tools'));
            allTools = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderToolsTable();
            document.getElementById('loadMoreBtn').style.display = 'none';
        } else {
            alert('Error loading tools: ' + error.message);
        }
    }
}

// Make loadTools available globally for filters
window.loadTools = loadTools;
document.getElementById('loadMoreBtn').addEventListener('click', () => loadTools(true));

function renderToolsTable() {
    const tbody = document.getElementById('toolsTableBody');
    const filterLocked = document.getElementById('filterLocked').value;
    const searchQuery = document.getElementById('searchTools').value.toLowerCase();

    let displayTools = allTools.filter(tool => {
        const matchesSearch = tool.name?.toLowerCase().includes(searchQuery) || tool.company?.toLowerCase().includes(searchQuery);
        const matchesLock = filterLocked === 'all' || (filterLocked === 'locked' && tool.locked) || (filterLocked === 'unlocked' && !tool.locked);
        return matchesSearch && matchesLock;
    });

    if (displayTools.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No tools found</td></tr>';
        return;
    }

    tbody.innerHTML = displayTools.map(tool => `
        <tr>
            <td><input type="checkbox" class="tool-select" value="${tool.id}" ${selectedTools.has(tool.id) ? 'checked' : ''} onchange="toggleSelect('${tool.id}', this.checked)"></td>
            <td><strong>${tool.name}</strong></td>
            <td>${tool.company || 'N/A'}</td>
            <td>${(tool.categories || []).slice(0, 2).join(', ')}</td>
            <td><span class="badge badge-${tool.access_type === 'FREE' ? 'free' : tool.access_type === 'SUBSCRIPTION' ? 'free-paid' : 'paid'}">${tool.access_type || 'FREE'}</span></td>
            <td>₹${tool.price || 0}</td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${tool.locked ? 'checked' : ''} onchange="toggleLock('${tool.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td class="action-buttons">
                <button class="btn btn-glass btn-sm" onclick="editTool('${tool.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-glass btn-sm" onclick="deleteTool('${tool.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    updateBulkToolbar();
}

// --- Bulk Actions ---

window.toggleSelect = function (id, checked) {
    if (checked) selectedTools.add(id);
    else selectedTools.delete(id);
    updateBulkToolbar();
};

document.getElementById('selectAll').addEventListener('change', (e) => {
    const checked = e.target.checked;
    document.querySelectorAll('.tool-select').forEach(cb => {
        cb.checked = checked;
        toggleSelect(cb.value, checked);
    });
});

function updateBulkToolbar() {
    const toolbar = document.getElementById('bulkActions');
    const countSpan = document.getElementById('selectedCount');

    if (selectedTools.size > 0) {
        toolbar.style.display = 'flex';
        countSpan.textContent = `${selectedTools.size} items selected`;
    } else {
        toolbar.style.display = 'none';
        document.getElementById('selectAll').checked = false;
    }
}

window.bulkToggleLock = async function (locked) {
    if (!confirm(`Are you sure you want to ${locked ? 'lock' : 'unlock'} ${selectedTools.size} items?`)) return;

    try {
        const promises = Array.from(selectedTools).map(id =>
            updateDoc(doc(firestore, 'tools', id), { locked })
        );
        await Promise.all(promises);

        // Update local state
        allTools.forEach(t => {
            if (selectedTools.has(t.id)) t.locked = locked;
        });

        selectedTools.clear();
        renderToolsTable();
        alert('Bulk update successful');
    } catch (error) {
        console.error('Bulk update error:', error);
        alert('Error updating items: ' + error.message);
    }
};

window.bulkDelete = async function () {
    if (!confirm(`Are you sure you want to DELETE ${selectedTools.size} items? This cannot be undone.`)) return;

    try {
        const promises = Array.from(selectedTools).map(id =>
            deleteDoc(doc(firestore, 'tools', id))
        );
        await Promise.all(promises);

        // Update local state
        const deletedIds = new Set(selectedTools);
        allTools = allTools.filter(t => !deletedIds.has(t.id));

        selectedTools.clear();
        renderToolsTable();
        alert('Bulk delete successful');
    } catch (error) {
        console.error('Bulk delete error:', error);
        alert('Error deleting items: ' + error.message);
    }
};

// --- Excel Import/Export ---

document.getElementById('excelInput').addEventListener('change', handleExcelUpload);

async function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) {
                alert('Excel file is empty.');
                return;
            }

            if (!confirm(`Found ${json.length} items. Import now?`)) return;

            let successCount = 0;
            for (const row of json) {
                // Map fields (assuming Excel headers match or are close)
                const toolData = {
                    name: row['Name'] || row['name'],
                    company: row['Company'] || row['company'],
                    website_url: row['URL'] || row['website_url'] || row['Website'],
                    short_description: row['Description'] || row['short_description'],
                    full_description: row['Full Description'] || row['full_description'] || row['Description'],
                    categories: (row['Categories'] || row['categories'] || '').split(',').map(s => s.trim()),
                    access_type: row['Access Type'] || row['access_type'] || 'FREE',
                    price: row['Price'] || row['price'] || 0,
                    locked: false,
                    createdAt: new Date().toISOString()
                };

                // Generate ID
                const slug = toolData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
                const newId = `${slug}-${Math.floor(Math.random() * 10000)}`;

                await setDoc(doc(firestore, 'tools', newId), toolData);
                successCount++;
            }

            alert(`Successfully imported ${successCount} tools!`);
            loadTools(); // Refresh
        } catch (error) {
            console.error('Excel import error:', error);
            alert('Error parsing Excel: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

window.downloadTemplate = function () {
    const template = [
        {
            "Name": "Example Tool",
            "Company": "OpenAI",
            "URL": "https://example.com",
            "Description": "Short summary here",
            "Full Description": "Long details here",
            "Categories": "Chatbot, Writing",
            "Access Type": "FREE",
            "Price": 0
        }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "tools_import_template.xlsx");
};


// --- Search & Filter ---
document.getElementById('searchTools').addEventListener('input', renderToolsTable);
document.getElementById('filterLocked').addEventListener('change', renderToolsTable);


// --- Standard Modal Controls & CRUD (from previous version, updated) ---

const modal = document.getElementById('toolModal');
const addToolBtn = document.getElementById('addToolBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.modal-close');
const toolForm = document.getElementById('toolForm');
const toolLocked = document.getElementById('toolLocked');
const lockReasonGroup = document.getElementById('lockReasonGroup');

addToolBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add New Tool';
    toolForm.reset();
    document.getElementById('toolId').value = '';
    modal.style.display = 'block';
});

cancelBtn.addEventListener('click', () => modal.style.display = 'none');
closeBtn.addEventListener('click', () => modal.style.display = 'none');

toolLocked.addEventListener('change', (e) => {
    lockReasonGroup.style.display = e.target.checked ? 'block' : 'none';
});

toolForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Gather data...
    const toolData = {
        name: document.getElementById('toolName').value,
        company: document.getElementById('toolCompany').value || '',
        short_description: document.getElementById('toolShortDesc').value || '',
        full_description: document.getElementById('toolFullDesc').value || '',
        website_url: document.getElementById('toolWebsite').value,
        launch_year: parseInt(document.getElementById('toolYear').value) || null,
        categories: document.getElementById('toolCategories').value.split(',').map(c => c.trim()).filter(c => c),
        tags: document.getElementById('toolTags').value.split(',').map(t => t.trim()).filter(t => t),
        use_cases: document.getElementById('toolUseCases').value.split(',').map(u => u.trim()).filter(u => u),
        platforms_supported: document.getElementById('toolPlatforms').value.split(',').map(p => p.trim()).filter(p => p),
        pricing_model: document.getElementById('toolPricingModel').value,
        // Remove badge_color logic if generic
        access_type: document.getElementById('toolAccessType').value,
        price: parseInt(document.getElementById('toolPrice').value) || 0,
        locked: document.getElementById('toolLocked').checked,
        lock_reason: document.getElementById('toolLockReason').value || null,
        updatedAt: new Date().toISOString()
    };

    const toolId = document.getElementById('toolId').value;

    try {
        if (toolId) {
            await updateDoc(doc(firestore, 'tools', toolId), toolData);
            alert('Tool updated successfully');
        } else {
            const slug = toolData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
            const newId = `${slug}-${Math.floor(Math.random() * 100000)}`;
            toolData.createdAt = new Date().toISOString();
            await setDoc(doc(firestore, 'tools', newId), toolData);
            alert('Tool created successfully');
        }
        modal.style.display = 'none';
        toolForm.reset();
        allTools = []; // Force reload
        loadTools();
    } catch (error) {
        console.error('Error saving tool:', error);
        alert('Error saving tool: ' + error.message);
    }
});

window.editTool = function (id) {
    const tool = allTools.find(t => t.id === id);
    if (!tool) return;

    document.getElementById('modalTitle').textContent = 'Edit Tool';
    document.getElementById('toolId').value = tool.id;
    document.getElementById('toolName').value = tool.name;
    document.getElementById('toolCompany').value = tool.company || '';
    document.getElementById('toolShortDesc').value = tool.short_description || '';
    document.getElementById('toolFullDesc').value = tool.full_description || '';
    document.getElementById('toolWebsite').value = tool.website_url || '';
    document.getElementById('toolYear').value = tool.launch_year || '';
    document.getElementById('toolCategories').value = (tool.categories || []).join(', ');
    document.getElementById('toolTags').value = (tool.tags || []).join(', ');
    document.getElementById('toolUseCases').value = (tool.use_cases || []).join(', ');
    document.getElementById('toolPlatforms').value = (tool.platforms_supported || []).join(', ');
    document.getElementById('toolPricingModel').value = tool.pricing_model || 'FREE';
    document.getElementById('toolAccessType').value = tool.access_type || 'FREE';
    document.getElementById('toolPrice').value = tool.price || 0;
    document.getElementById('toolLocked').checked = tool.locked || false;
    document.getElementById('toolLockReason').value = tool.lock_reason || '';

    lockReasonGroup.style.display = tool.locked ? 'block' : 'none';
    modal.style.display = 'block';
};

window.deleteTool = async function (id) {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    try {
        await deleteDoc(doc(firestore, 'tools', id));

        // Remove from local array
        allTools = allTools.filter(t => t.id !== id);
        renderToolsTable();
        alert('Tool deleted!');
    } catch (error) {
        console.error('Error deleting tool:', error);
        alert('Error deleting tool');
    }
};

window.toggleLock = async function (id, locked) {
    try {
        await updateDoc(doc(firestore, 'tools', id), { locked });
        // Update local state is handled if we reload or manually update. 
        // For quick toggle, just finding it in allTools is enough:
        const t = allTools.find(tool => tool.id === id);
        if (t) t.locked = locked;
    } catch (err) {
        console.error(err);
        alert('Failed to toggle lock');
    }
};
