// Guide detail page logic
async function initGuideDetail() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const content = document.getElementById('guideContent');

    if (!slug) {
        content.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--accent-warning);"></i>
                <p style="margin-top: 1rem;">Guide not found</p>
                <a href="guides.html" class="btn btn-primary" style="margin-top: 2rem;">Browse All Guides</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch('data/guides.json');
        const guides = await response.json();
        const guide = guides.find(g => g.slug === slug);

        if (!guide) {
            content.innerHTML = `
                <div style="text-align: center; padding: 4rem;">
                    <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--accent-warning);"></i>
                    <p style="margin-top: 1rem;">Guide not found</p>
                    <a href="guides.html" class="btn btn-primary" style="margin-top: 2rem;">Browse All Guides</a>
                </div>
            `;
            return;
        }

        // Update page title
        document.getElementById('guideTitle').textContent = `${guide.title} | HubSnap`;

        // Check access if locked
        if (guide.locked && typeof PaywallManager !== 'undefined') {
            const paywall = new PaywallManager();
            const accessCheck = await paywall.checkAccess(guide.id, 'guide');

            if (!accessCheck.hasAccess) {
                paywall.showPaywallPopup({
                    access_type: guide.access_type,
                    price: guide.price,
                    reason: `This ${guide.type.toLowerCase()} requires ${guide.access_type === 'SUBSCRIPTION' ? 'a subscription' : 'a one-time purchase'} to access.`
                });
            }
        }

        renderGuideDetail(guide);

    } catch (error) {
        console.error('Error loading guide:', error);
        content.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--accent-danger);"></i>
                <p style="margin-top: 1rem; color: var(--accent-danger);">Error loading guide</p>
                <a href="guides.html" class="btn btn-primary" style="margin-top: 2rem;">Browse All Guides</a>
            </div>
        `;
    }
}

function renderGuideDetail(guide) {
    const content = document.getElementById('guideContent');

    const accessBadge = guide.access_type === 'FREE' ?
        '<span class="badge badge-free">FREE</span>' :
        guide.access_type === 'SUBSCRIPTION' ?
            '<span class="badge badge-paid">SUBSCRIPTION</span>' :
            '<span class="badge badge-free-paid">ONE-TIME PURCHASE</span>';

    const priceDisplay = guide.price > 0 ? `₹${guide.price}` : 'Free Access';

    content.innerHTML = `
        <!-- Header -->
        <div class="glass" style="padding: 3rem; margin-bottom: 3rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                        ${accessBadge}
                        <span style="font-size: 0.85rem; padding: 0.4rem 0.8rem; background: var(--accent-primary); border-radius: 4px; color: white;">
                            ${guide.type}
                        </span>
                    </div>
                    <h1 class="gradient-text" style="margin-bottom: 1rem;">${guide.title}</h1>
                    <p style="color: var(--text-dim); font-size: 1.1rem; margin-bottom: 1.5rem;">
                        ${guide.short_description}
                    </p>
                    <div style="display: flex; gap: 2rem; flex-wrap: wrap; color: var(--text-dim); font-size: 0.9rem;">
                        <span><i class="fas fa-layer-group"></i> ${guide.category}</span>
                        <span><i class="fas fa-signal"></i> ${guide.difficulty}</span>
                        <span><i class="fas fa-clock"></i> ${guide.estimated_time}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--accent-primary); margin-bottom: 0.5rem;">
                        ${priceDisplay}
                    </div>
                    ${guide.locked ?
            `<button class="btn btn-primary" onclick="unlockGuide('${guide.id}', '${guide.access_type}', ${guide.price})">
                            <i class="fas fa-unlock"></i> Unlock Access
                        </button>` :
            `<button class="btn btn-primary">
                            <i class="fas fa-download"></i> Access Now
                        </button>`
        }
                </div>
            </div>
        </div>

        <!-- Description -->
        <div class="glass" style="padding: 2.5rem; margin-bottom: 2rem;">
            <h2 style="margin-bottom: 1.5rem;">About This ${guide.type}</h2>
            <p style="color: var(--text-dim); line-height: 1.8; font-size: 1.05rem;">
                ${guide.full_description}
            </p>
        </div>

        <!-- What's Included -->
        <div class="glass" style="padding: 2.5rem; margin-bottom: 2rem;">
            <h2 style="margin-bottom: 1.5rem;"><i class="fas fa-check-circle" style="color: var(--accent-success);"></i> What's Included</h2>
            <ul style="list-style: none; padding: 0;">
                ${guide.includes.map(item => `
                    <li style="padding: 0.75rem 0; border-bottom: 1px solid var(--glass-border); color: var(--text-dim);">
                        <i class="fas fa-check" style="color: var(--accent-success); margin-right: 0.75rem;"></i>
                        ${item}
                    </li>
                `).join('')}
            </ul>
        </div>

        <!-- Tools Used -->
        <div class="glass" style="padding: 2.5rem; margin-bottom: 2rem;">
            <h2 style="margin-bottom: 1.5rem;"><i class="fas fa-tools"></i> AI Tools Used</h2>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                ${guide.tools_used.map(tool => `
                    <span style="padding: 0.5rem 1rem; background: var(--bg-main); border-radius: 6px; border: 1px solid var(--glass-border);">
                        ${tool}
                    </span>
                `).join('')}
            </div>
        </div>

        <!-- CTA -->
        <div class="glass" style="padding: 3rem; text-align: center; background: linear-gradient(135deg, hsla(210, 100%, 60%, 0.1), hsla(280, 100%, 60%, 0.1));">
            <h2 style="margin-bottom: 1rem;">Ready to Get Started?</h2>
            <p style="color: var(--text-dim); margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                ${guide.locked ?
            `Unlock this ${guide.type.toLowerCase()} and start executing with AI today.` :
            `Access this free ${guide.type.toLowerCase()} and start executing with AI today.`
        }
            </p>
            ${guide.locked ?
            `<button class="btn btn-primary btn-lg" onclick="unlockGuide('${guide.id}', '${guide.access_type}', ${guide.price})">
                    <i class="fas fa-unlock"></i> Unlock for ${priceDisplay}
                </button>` :
            `<button class="btn btn-primary btn-lg">
                    <i class="fas fa-download"></i> Download Now
                </button>`
        }
        </div>
    `;
}

function unlockGuide(guideId, accessType, price) {
    if (typeof PaywallManager !== 'undefined') {
        const paywall = new PaywallManager();
        paywall.showPaywallPopup({
            access_type: accessType,
            price: price,
            reason: `Unlock this guide to access all templates, resources, and step-by-step instructions.`
        });
    } else {
        alert('Payment system is currently unavailable. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', initGuideDetail);
