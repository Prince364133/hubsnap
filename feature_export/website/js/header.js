// Universal Header Template
function loadHeader() {
    const headerHTML = `
    <nav class="navbar glass">
        <a href="index.html" class="nav-logo gradient-text">HubSnap</a>
        <div class="nav-links">
            <a href="explore.html" class="nav-link"><i class="fas fa-compass"></i> Explore</a>
            <a href="guides.html" class="nav-link"><i class="fas fa-book"></i> Guides</a>
            <a href="services.html" class="nav-link"><i class="fas fa-box"></i> Services</a>
            <a href="creator-os.html" class="nav-link"><i class="fas fa-rocket"></i> Creator OS</a>
            <a href="about.html" class="nav-link"><i class="fas fa-info-circle"></i> About</a>
            <a href="contact.html" class="nav-link"><i class="fas fa-phone"></i> Contact</a>
        </div>
    </nav>
    `;

    // Insert header at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Load header when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}
