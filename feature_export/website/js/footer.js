// Universal Footer Template
function loadFooter() {
    const footerHTML = `
    <footer style="background: var(--bg-surface); border-top: 1px solid var(--glass-border); padding: 4rem 0 2rem;">
        <div class="container">
            <!-- Footer Main Content -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin-bottom: 3rem;">
                
                <!-- Brand Column -->
                <div>
                    <h3 class="gradient-text" style="margin-bottom: 1rem; font-size: 1.5rem;">HubSnap</h3>
                    <p style="color: var(--text-dim); margin-bottom: 1.5rem; line-height: 1.6;">
                        Discover the right AI. Execute faster. Build smarter.
                    </p>
                    <p style="color: var(--text-dim); font-size: 0.9rem; line-height: 1.6;">
                        Your comprehensive directory of 1,100+ AI tools, organized by real-world use cases with execution guides and templates.
                    </p>
                </div>

                <!-- Platform Links -->
                <div>
                    <h4 style="margin-bottom: 1rem; color: var(--text-main);">Platform</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.75rem;">
                            <a href="explore.html" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-compass" style="margin-right: 0.5rem; width: 20px;"></i>Explore AI Tools
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="guides.html" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-book" style="margin-right: 0.5rem; width: 20px;"></i>Guides & Templates
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="explore.html?pricing=FREE" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-gift" style="margin-right: 0.5rem; width: 20px;"></i>Free AI Tools
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="services.html" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-box" style="margin-right: 0.5rem; width: 20px;"></i>Services
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Categories -->
                <div>
                    <h4 style="margin-bottom: 1rem; color: var(--text-main);">Popular Categories</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.75rem;">
                            <a href="explore.html?category=Text%20%26%20Writing" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-pen-nib" style="margin-right: 0.5rem; width: 20px;"></i>Text & Writing
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="explore.html?category=Image%20%26%20Design" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-palette" style="margin-right: 0.5rem; width: 20px;"></i>Image & Design
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="explore.html?category=Video%20Editing" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-video" style="margin-right: 0.5rem; width: 20px;"></i>Video Editing
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="explore.html?category=Automation" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-robot" style="margin-right: 0.5rem; width: 20px;"></i>Automation
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Company -->
                <div>
                    <h4 style="margin-bottom: 1rem; color: var(--text-main);">Company</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.75rem;">
                            <a href="about.html" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-info-circle" style="margin-right: 0.5rem; width: 20px;"></i>About Us
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="contact.html" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-envelope" style="margin-right: 0.5rem; width: 20px;"></i>Contact
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="#" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-file-alt" style="margin-right: 0.5rem; width: 20px;"></i>Privacy Policy
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="#" style="color: var(--text-dim); text-decoration: none; transition: color 0.2s;">
                                <i class="fas fa-gavel" style="margin-right: 0.5rem; width: 20px;"></i>Terms of Service
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Social & Newsletter -->
            <div style="border-top: 1px solid var(--glass-border); padding-top: 2rem; margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2rem;">
                    
                    <!-- Social Links -->
                    <div>
                        <p style="color: var(--text-dim); margin-bottom: 1rem; font-size: 0.9rem;">Follow us for AI tool updates</p>
                        <div style="display: flex; gap: 1rem;">
                            <a href="#" class="btn btn-glass" style="padding: 0.75rem; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;" title="Twitter">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="#" class="btn btn-glass" style="padding: 0.75rem; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;" title="LinkedIn">
                                <i class="fab fa-linkedin"></i>
                            </a>
                            <a href="#" class="btn btn-glass" style="padding: 0.75rem; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;" title="GitHub">
                                <i class="fab fa-github"></i>
                            </a>
                            <a href="#" class="btn btn-glass" style="padding: 0.75rem; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;" title="YouTube">
                                <i class="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Newsletter Signup -->
                    <div style="flex: 1; max-width: 400px;">
                        <p style="color: var(--text-dim); margin-bottom: 1rem; font-size: 0.9rem;">Get weekly AI tool updates</p>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="email" placeholder="Enter your email" style="flex: 1; padding: 0.75rem 1rem; background: var(--bg-main); border: 1px solid var(--glass-border); border-radius: 8px; color: white; font-size: 0.95rem;" />
                            <button class="btn btn-primary" style="white-space: nowrap;">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Copyright -->
            <div style="text-align: center; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
                <p style="color: var(--text-dim); font-size: 0.9rem;">
                    © 2026 HubSnap. All rights reserved. | Discover the right AI. Execute faster. Build smarter.
                </p>
            </div>
        </div>
    </footer>
    `;

    // Insert footer at the end of body (before scripts)
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Load footer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    loadFooter();
}
