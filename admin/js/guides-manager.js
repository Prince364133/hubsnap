// Guides Management Logic
import { auth, database, firestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, ref, get, query, limit, orderBy, startAfter } from '../../js/firebase-config.js';

let allGuides = [];
let lastVisibleDoc = null;
const ITEMS_PER_PAGE = 20;
const selectedGuides = new Set();

// Auth guard
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    await loadGuides();
});

// Load Guides with Pagination
async function loadGuides(loadMore = false) {
    try {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;

        let q;
        const guidesRef = collection(firestore, 'guides');

        // Note: 'createdAt' field is assumed. If not present, we might need another order or standard fetch.
        if (loadMore && lastVisibleDoc) {
            q = query(guidesRef, orderBy('createdAt', 'desc'), startAfter(lastVisibleDoc), limit(ITEMS_PER_PAGE));
        } else {
            q = query(guidesRef, orderBy('createdAt', 'desc'), limit(ITEMS_PER_PAGE));
            allGuides = [];
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            loadMoreBtn.style.display = 'none';
            if (!loadMore) renderTable();
            return;
        }

        lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

        const newGuides = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (loadMore) {
            allGuides = [...allGuides, ...newGuides];
        } else {
            allGuides = newGuides;
        }

        renderTable();

        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.disabled = false;
        loadMoreBtn.style.display = snapshot.docs.length < ITEMS_PER_PAGE ? 'none' : 'inline-block';

    } catch (error) {
        console.error('Error loading guides:', error);
        if (error.message.includes('requires an index')) {
            console.warn('Index missing for guides, fetching simple list');
            const fallbackSnapshot = await getDocs(collection(firestore, 'guides'));
            allGuides = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderTable();
            document.getElementById('loadMoreBtn').style.display = 'none';
        } else {
            alert('Error loading guides: ' + error.message);
        }
    }
}

document.getElementById('loadMoreBtn').addEventListener('click', () => loadGuides(true));

function renderTable() {
    const tbody = document.getElementById('guidesTableBody');
    const filterType = document.getElementById('filterType').value;
    const searchQuery = document.getElementById('searchGuides').value.toLowerCase();

    let displayGuides = allGuides.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchQuery);
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    if (displayGuides.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No items found</td></tr>';
        return;
    }

    tbody.innerHTML = displayGuides.map(item => `
        <tr>
            <td><input type="checkbox" class="guide-select" value="${item.id}" ${selectedGuides.has(item.id) ? 'checked' : ''} onchange="toggleSelect('${item.id}', this.checked)"></td>
            <td><strong>${item.title}</strong></td>
            <td><span class="badge" style="background: ${item.type === 'blueprint' ? '#9c27b0' : '#2196f3'}">${item.type || 'guide'}</span></td>
            <td>${item.category || 'General'}</td>
            <td>${item.difficulty || 'N/A'}</td>
            <td>${item.read_time || 'N/A'}</td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${item.active !== false ? 'checked' : ''} onchange="toggleActive('${item.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td class="action-buttons">
                <button class="btn btn-glass btn-sm" onclick="editGuide('${item.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-glass btn-sm" onclick="deleteGuide('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    updateBulkToolbar();
}

// Bulk Actions
window.toggleSelect = function (id, checked) {
    if (checked) selectedGuides.add(id);
    else selectedGuides.delete(id);
    updateBulkToolbar();
};

document.getElementById('selectAll').addEventListener('change', (e) => {
    const checked = e.target.checked;
    document.querySelectorAll('.guide-select').forEach(cb => {
        cb.checked = checked;
        toggleSelect(cb.value, checked);
    });
});

function updateBulkToolbar() {
    const toolbar = document.getElementById('bulkActions');
    document.getElementById('selectedCount').textContent = `${selectedGuides.size} items selected`;
    toolbar.style.display = selectedGuides.size > 0 ? 'flex' : 'none';
}

window.bulkToggleStatus = async function (active) {
    if (!confirm(`Mark ${selectedGuides.size} items as ${active ? 'Active' : 'Inactive'}?`)) return;
    try {
        const promises = Array.from(selectedGuides).map(id => updateDoc(doc(firestore, 'guides', id), { active }));
        await Promise.all(promises);

        allGuides.forEach(t => { if (selectedGuides.has(t.id)) t.active = active; });

        selectedGuides.clear();
        renderTable();
        alert('Bulk update successful');
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

window.bulkDelete = async function () {
    if (!confirm(`Delete ${selectedGuides.size} items?`)) return;
    try {
        const promises = Array.from(selectedGuides).map(id => deleteDoc(doc(firestore, 'guides', id)));
        await Promise.all(promises);

        allGuides = allGuides.filter(t => !selectedGuides.has(t.id));
        selectedGuides.clear();
        renderTable();
        alert('Bulk delete successful');
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// Excel Import
document.getElementById('excelInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            if (json.length === 0) { alert('Empty file'); return; }
            if (!confirm(`Import ${json.length} items?`)) return;

            let count = 0;
            for (const row of json) {
                const item = {
                    title: row['Title'],
                    type: row['Type']?.toLowerCase() || 'guide',
                    category: row['Category'],
                    description: row['Description'],
                    content: row['Content'],
                    difficulty: row['Difficulty'],
                    read_time: row['Read Time'],
                    image_url: row['Image URL'],
                    active: true,
                    createdAt: new Date().toISOString()
                };

                const newId = `guide-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                await setDoc(doc(firestore, 'guides', newId), item);
                count++;
            }
            alert(`Imported ${count} items`);
            loadGuides();
        } catch (err) {
            console.error(err);
            alert('Import failed: ' + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
});

window.downloadTemplate = function () {
    const template = [{ "Title": "How to Prompt", "Type": "guide", "Category": "Prompting", "Description": "Start here", "Content": "<b>Full HTML content</b>", "Difficulty": "Beginner", "Read Time": "5 min", "Image URL": "http..." }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(template), "Guides");
    XLSX.writeFile(wb, "guides_template.xlsx");
};

// Modal & CRUD
const modal = document.getElementById('guideModal');
const form = document.getElementById('guideForm');

document.getElementById('addGuideBtn').onclick = () => {
    form.reset();
    document.getElementById('guideId').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Guide';
    modal.style.display = 'block';
};

document.getElementById('cancelBtn').onclick = () => modal.style.display = 'none';
document.querySelector('.modal-close').onclick = () => modal.style.display = 'none';

window.editGuide = function (id) {
    const item = allGuides.find(g => g.id === id);
    if (!item) return;

    document.getElementById('guideId').value = id;
    document.getElementById('title').value = item.title;
    document.getElementById('type').value = item.type;
    document.getElementById('category').value = item.category;
    document.getElementById('description').value = item.description;
    document.getElementById('content').value = item.content;
    document.getElementById('difficulty').value = item.difficulty;
    document.getElementById('read_time').value = item.read_time;
    document.getElementById('image_url').value = item.image_url || '';
    document.getElementById('isActive').checked = item.active !== false;

    document.getElementById('modalTitle').textContent = 'Edit Guide';
    modal.style.display = 'block';
};

window.deleteGuide = async function (id) {
    if (!confirm('Delete this guide?')) return;
    await deleteDoc(doc(firestore, 'guides', id));
    allGuides = allGuides.filter(g => g.id !== id);
    renderTable();
};

window.toggleActive = async function (id, active) {
    await updateDoc(doc(firestore, 'guides', id), { active });
    const item = allGuides.find(g => g.id === id);
    if (item) item.active = active;
};

form.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('guideId').value;
    const data = {
        title: document.getElementById('title').value,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        content: document.getElementById('content').value,
        difficulty: document.getElementById('difficulty').value,
        read_time: document.getElementById('read_time').value,
        image_url: document.getElementById('image_url').value,
        active: document.getElementById('isActive').checked,
        updatedAt: new Date().toISOString()
    };

    try {
        if (id) {
            await updateDoc(doc(firestore, 'guides', id), data);
            showNotification('Guide updated!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            const newId = `guide-${Date.now()}`;
            await setDoc(doc(firestore, 'guides', newId), data);
            showNotification('Guide created!', 'success');
        }
        modal.style.display = 'none';
        loadGuides();
    } catch (err) {
        showNotification('Error: ' + err.message, 'error');
    }
};

function showNotification(message, type = 'success') {
    const div = document.createElement('div');
    div.className = `notification-toast ${type}`;
    div.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Search
document.getElementById('searchGuides').oninput = renderTable;
document.getElementById('filterType').onchange = renderTable;
