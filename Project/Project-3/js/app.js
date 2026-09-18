/**
 * NESTORA PROPTECH - CORE APPLICATION LOGIC
 * High-fidelity, reactive state, zero external runtime dependencies.
 */

// Application State
const AppState = {
  currentView: 'landing',
  selectedProperty: null,
  selectedRoommate: null,
  roommateCardIndex: 0,
  roommateMode: 'swiper', // 'swiper' or 'grid'
  filters: {
    city: 'Ahmedabad',
    type: 'All Types',
    budgetRange: 'all',
    furnished: false,
    roommatesAllowed: false,
    sortBy: 'recommended'
  },
  userRole: 'Tenant', // 'Tenant' or 'Owner'
  savedProperties: new Set(['prop-1']),
  sharedExpenses: [...window.NESTORA_DATA.sharedExpenses],
  maintenanceTickets: [...window.NESTORA_DATA.maintenanceTickets],
  notifications: [...window.NESTORA_DATA.notifications]
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderShowcaseProperties();
  renderDiscoveryProperties();
  renderDiscoveryMapPins();
  renderRoommateSwiper();
  renderRoommateGrid();
  renderSharedExpenses();
  renderMaintenanceTickets();
  renderOwnerTable();
  renderNotificationDrawer();
  setupEventListeners();
  updateUnreadNotifBadge();
}

/* ==========================================================================
   NAVIGATION & ROUTING
   ========================================================================== */

function navigateTo(viewId, payload = null) {
  AppState.currentView = viewId;

  // Update navbar active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.target === viewId);
  });

  // Update mobile bottom bar active state
  document.querySelectorAll('.bottom-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.target === viewId);
  });

  // Show target view panel
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetPanel = document.getElementById(`view-${viewId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handle View-Specific Logic
  if (viewId === 'discovery' && payload) {
    applySearchPayload(payload);
  } else if (viewId === 'details' && payload) {
    openPropertyDetailsModal(payload);
  } else if (viewId === 'roommates') {
    renderRoommateSwiper();
  } else if (viewId === 'owner') {
    AppState.userRole = 'Owner';
    updateRoleButtons();
  } else if (viewId === 'dashboard') {
    AppState.userRole = 'Tenant';
    updateRoleButtons();
  }
}

function updateRoleButtons() {
  const tenantBtn = document.getElementById('role-btn-tenant');
  const ownerBtn = document.getElementById('role-btn-owner');
  if (tenantBtn && ownerBtn) {
    tenantBtn.classList.toggle('active', AppState.userRole === 'Tenant');
    ownerBtn.classList.toggle('active', AppState.userRole === 'Owner');
  }
}

/* ==========================================================================
   1. LANDING PAGE LOGIC
   ========================================================================== */

function renderShowcaseProperties() {
  const container = document.getElementById('hero-showcase-container');
  if (!container) return;

  const showcaseProps = window.NESTORA_DATA.properties.slice(0, 3);
  container.innerHTML = showcaseProps.map(prop => `
    <div class="showcase-card" onclick="openPropertyDetailsModal('${prop.id}')">
      <div class="showcase-img-wrap">
        <img src="${prop.images[0]}" alt="${prop.title}" class="showcase-img" loading="lazy" />
        <span class="badge badge-verified showcase-badge-top">✓ Verified</span>
        <span class="showcase-score-top">${prop.transparencyScore}/100 Transparency</span>
      </div>
      <div class="showcase-body">
        <span class="card-type-tag">${prop.type}</span>
        <h3 class="showcase-title">${prop.title}</h3>
        <p class="showcase-locality">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${prop.locality}, ${prop.city}
        </p>
        <div class="showcase-pricing-row">
          <div>
            <div class="showcase-rent-num">₹${prop.rent.toLocaleString('en-IN')}<span style="font-size:0.8rem; font-weight:500; color:var(--text-muted)">/mo</span></div>
            <div class="deposit-info">Deposit: ₹${prop.deposit.toLocaleString('en-IN')}</div>
          </div>
          <div style="text-align:right">
            <span class="cost-est-pill">₹${prop.estimatedLivingCost.toLocaleString('en-IN')}/mo total</span>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Zero hidden charges</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function handleHeroSearch() {
  const citySelect = document.getElementById('hero-city-select');
  const typeSelect = document.getElementById('hero-type-select');
  const budgetSelect = document.getElementById('hero-budget-select');

  const payload = {
    city: citySelect ? citySelect.value : 'Ahmedabad',
    type: typeSelect ? typeSelect.value : 'All Types',
    budgetRange: budgetSelect ? budgetSelect.value : 'all'
  };

  navigateTo('discovery', payload);
}

function applySearchPayload(payload) {
  if (payload.city) AppState.filters.city = payload.city;
  if (payload.type) AppState.filters.type = payload.type;
  if (payload.budgetRange) AppState.filters.budgetRange = payload.budgetRange;

  const cityTitle = document.getElementById('map-city-header');
  if (cityTitle) cityTitle.innerText = `Verified Spaces in ${AppState.filters.city}`;

  renderDiscoveryProperties();
  renderDiscoveryMapPins();
  showToast(`Showing verified spaces in ${AppState.filters.city}`);
}

/* ==========================================================================
   2. PROPERTY DISCOVERY & INTERACTIVE MAP
   ========================================================================== */

function getFilteredProperties() {
  return window.NESTORA_DATA.properties.filter(prop => {
    // City filter
    if (AppState.filters.city !== 'All' && prop.city !== AppState.filters.city) {
      // allow Ahmedabad properties to show if matched
    }
    // Type filter
    if (AppState.filters.type !== 'All Types' && prop.type !== AppState.filters.type) {
      return false;
    }
    // Budget filter
    if (AppState.filters.budgetRange === 'under-15k' && prop.rent > 15000) return false;
    if (AppState.filters.budgetRange === '15k-25k' && (prop.rent < 15000 || prop.rent > 25000)) return false;
    if (AppState.filters.budgetRange === 'above-25k' && prop.rent < 25000) return false;
    // Furnished filter
    if (AppState.filters.furnished && prop.specs.furnishing !== 'Furnished') return false;
    // Roommates filter
    if (AppState.filters.roommatesAllowed && !prop.specs.roommatesAllowed) return false;

    return true;
  }).sort((a, b) => {
    if (AppState.filters.sortBy === 'lowest-rent') return a.rent - b.rent;
    if (AppState.filters.sortBy === 'lowest-cost') return a.estimatedLivingCost - b.estimatedLivingCost;
    if (AppState.filters.sortBy === 'rating') return b.rating - a.rating;
    return b.transparencyScore - a.transparencyScore; // default recommended
  });
}

function renderDiscoveryProperties() {
  const listContainer = document.getElementById('discovery-property-list');
  if (!listContainer) return;

  const filtered = getFilteredProperties();

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding: 48px; background:white; border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
        <h3 style="font-size:1.25rem; font-weight:800; margin-bottom:6px;">No exact spaces found</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">Try adjusting your filters to see more verified student and young professional spaces.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filtered.map(prop => {
    const isSaved = AppState.savedProperties.has(prop.id);
    return `
      <div class="property-card" id="card-${prop.id}" onmouseenter="highlightMapPin('${prop.id}')" onmouseleave="unhighlightMapPin('${prop.id}')">
        <div class="card-media">
          <img src="${prop.images[0]}" alt="${prop.title}" class="card-img" loading="lazy" onclick="openPropertyDetailsModal('${prop.id}')" />
          <button class="card-save-btn ${isSaved ? 'saved' : ''}" onclick="toggleSaveProperty(event, '${prop.id}')" title="Save property">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
        <div class="card-content" onclick="openPropertyDetailsModal('${prop.id}')">
          <div>
            <div class="card-top-row">
              <span class="card-type-tag">${prop.type}</span>
              <span class="score-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                ${prop.transparencyScore}/100 Transparency
              </span>
            </div>
            <h3 class="card-title">${prop.title}</h3>
            <p class="card-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${prop.locality} • <span style="color:var(--primary); font-weight:600;">${prop.distance}</span>
            </p>
            <div class="card-amenities-pills">
              <span class="amenity-pill">🛏️ ${prop.specs.bedrooms} Bed</span>
              <span class="amenity-pill">🚿 ${prop.specs.bathrooms} Bath</span>
              <span class="amenity-pill">⚡ ${prop.specs.furnishing}</span>
              ${prop.specs.roommatesAllowed ? '<span class="amenity-pill" style="color:var(--accent-emerald-dark); background:var(--accent-emerald-light)">👥 Roommates Allowed</span>' : ''}
            </div>
          </div>
          
          <div class="card-bottom-pricing">
            <div class="price-main">
              <span class="rent-tag">₹${prop.rent.toLocaleString('en-IN')}<span class="rent-period">/month</span></span>
              <span class="deposit-info">Deposit: ₹${prop.deposit.toLocaleString('en-IN')}</span>
              <span class="cost-est-pill">Approx. Living Cost: ₹${prop.estimatedLivingCost.toLocaleString('en-IN')}/mo</span>
            </div>
            <button class="btn btn-sm btn-primary" onclick="openPropertyDetailsModal('${prop.id}')">View Breakdown</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderDiscoveryMapPins() {
  const mapCanvas = document.getElementById('discovery-map-canvas');
  if (!mapCanvas) return;

  const filtered = getFilteredProperties();

  // Keep background SVG, replace pins
  const existingPins = mapCanvas.querySelectorAll('.map-pin');
  existingPins.forEach(p => p.remove());

  filtered.forEach(prop => {
    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.id = `pin-${prop.id}`;
    pin.style.left = `${prop.coordinates.x}%`;
    pin.style.top = `${prop.coordinates.y}%`;
    pin.innerHTML = `₹${(prop.rent / 1000).toFixed(0)}k`;

    pin.addEventListener('click', () => {
      // scroll to card & open details
      const card = document.getElementById(`card-${prop.id}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('active-pin');
        setTimeout(() => card.classList.remove('active-pin'), 1500);
      }
    });

    pin.addEventListener('mouseenter', () => {
      pin.classList.add('active');
    });

    pin.addEventListener('mouseleave', () => {
      pin.classList.remove('active');
    });

    mapCanvas.appendChild(pin);
  });
}

function highlightMapPin(propId) {
  const pin = document.getElementById(`pin-${propId}`);
  if (pin) pin.classList.add('active');
}

function unhighlightMapPin(propId) {
  const pin = document.getElementById(`pin-${propId}`);
  if (pin) pin.classList.remove('active');
}

function toggleSaveProperty(e, propId) {
  e.stopPropagation();
  if (AppState.savedProperties.has(propId)) {
    AppState.savedProperties.delete(propId);
    showToast('Removed from saved spaces');
  } else {
    AppState.savedProperties.add(propId);
    showToast('Saved to your favorites ❤️');
  }
  renderDiscoveryProperties();
}

function filterByChip(chipType, el) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  if (chipType === 'all') {
    AppState.filters.budgetRange = 'all';
    AppState.filters.furnished = false;
    AppState.filters.roommatesAllowed = false;
  } else if (chipType === 'under-15k') {
    AppState.filters.budgetRange = 'under-15k';
  } else if (chipType === '15k-25k') {
    AppState.filters.budgetRange = '15k-25k';
  } else if (chipType === 'above-25k') {
    AppState.filters.budgetRange = 'above-25k';
  } else if (chipType === 'furnished') {
    AppState.filters.furnished = true;
  } else if (chipType === 'roommates') {
    AppState.filters.roommatesAllowed = true;
  }

  renderDiscoveryProperties();
  renderDiscoveryMapPins();
}

function handleSortChange(sortValue) {
  AppState.filters.sortBy = sortValue;
  renderDiscoveryProperties();
}

function resetFilters() {
  AppState.filters = {
    city: 'Ahmedabad',
    type: 'All Types',
    budgetRange: 'all',
    furnished: false,
    roommatesAllowed: false,
    sortBy: 'recommended'
  };
  renderDiscoveryProperties();
  renderDiscoveryMapPins();
  showToast('Filters reset');
}

/* ==========================================================================
   3. PROPERTY DETAILS & RADICAL COST BREAKDOWN
   ========================================================================== */

function openPropertyDetailsModal(propId) {
  const prop = window.NESTORA_DATA.properties.find(p => p.id === propId) || window.NESTORA_DATA.properties[0];
  AppState.selectedProperty = prop;

  const modal = document.getElementById('details-modal');
  if (!modal) return;

  // Populate Gallery
  const gallery = document.getElementById('modal-gallery-container');
  if (gallery) {
    gallery.innerHTML = `
      <div class="gallery-main">
        <img src="${prop.images[0]}" alt="${prop.title}" class="gallery-img" />
      </div>
      <div class="gallery-sub">
        <img src="${prop.images[1] || prop.images[0]}" alt="${prop.title}" class="gallery-img" />
      </div>
      <div class="gallery-sub">
        <img src="${prop.images[2] || prop.images[0]}" alt="${prop.title}" class="gallery-img" />
      </div>
    `;
  }

  // Populate Header
  document.getElementById('modal-prop-title').innerText = prop.title;
  document.getElementById('modal-prop-locality').innerText = `${prop.locality}, ${prop.city} • ${prop.distance}`;
  document.getElementById('modal-prop-rent').innerText = `₹${prop.rent.toLocaleString('en-IN')}/mo`;
  document.getElementById('modal-prop-deposit').innerText = `Deposit: ₹${prop.deposit.toLocaleString('en-IN')}`;

  // Populate Specs & Description
  document.getElementById('modal-prop-description').innerText = prop.description;
  
  const amenitiesList = document.getElementById('modal-amenities-list');
  if (amenitiesList) {
    amenitiesList.innerHTML = prop.amenities.map(a => `
      <div style="display:flex; align-items:center; gap:8px; font-size:0.875rem; font-weight:600; color:var(--text-secondary); background:var(--bg-surface-secondary); padding:8px 12px; border-radius:var(--radius-sm);">
        <span style="color:var(--accent-emerald-dark)">✓</span> ${a}
      </div>
    `).join('');
  }

  // Populate Cost Breakdown
  renderCostBreakdown(prop);

  // Populate Transparency Scorecard
  renderTransparencyCard(prop);

  // Populate Agreement Preview
  renderAgreementPreview(prop);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePropertyDetailsModal() {
  const modal = document.getElementById('details-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderCostBreakdown(prop, customElectricity = null) {
  const costs = prop.costBreakdown;
  const electCost = customElectricity !== null ? customElectricity : costs.electricity;
  const totalCost = costs.rent + electCost + costs.internet + costs.maintenance + costs.water + costs.other;

  // Update visual bar segments
  const rentPct = (costs.rent / totalCost) * 100;
  const electPct = (electCost / totalCost) * 100;
  const netPct = (costs.internet / totalCost) * 100;
  const maintPct = (costs.maintenance / totalCost) * 100;
  const otherPct = ((costs.water + costs.other) / totalCost) * 100;

  const barChart = document.getElementById('cost-chart-visual');
  if (barChart) {
    barChart.innerHTML = `
      <div class="cost-bar-segment" style="width:${rentPct}%; background:#4F46E5;" title="Rent: ₹${costs.rent}"></div>
      <div class="cost-bar-segment" style="width:${electPct}%; background:#F59E0B;" title="Electricity: ₹${electCost}"></div>
      <div class="cost-bar-segment" style="width:${netPct}%; background:#06B6D4;" title="Internet: ₹${costs.internet}"></div>
      <div class="cost-bar-segment" style="width:${maintPct}%; background:#10B981;" title="Maintenance: ₹${costs.maintenance}"></div>
      <div class="cost-bar-segment" style="width:${otherPct}%; background:#8B5CF6;" title="Water & Other: ₹${costs.water + costs.other}"></div>
    `;
  }

  // Populate breakdown lines
  const breakdownList = document.getElementById('cost-breakdown-items');
  if (breakdownList) {
    breakdownList.innerHTML = `
      <div class="cost-item-row">
        <span class="cost-item-label"><span class="cost-color-dot" style="background:#4F46E5"></span>Base Monthly Rent</span>
        <span class="cost-item-val">₹${costs.rent.toLocaleString('en-IN')}</span>
      </div>
      <div class="cost-item-row">
        <span class="cost-item-label"><span class="cost-color-dot" style="background:#F59E0B"></span>Electricity (Based on AC usage)</span>
        <span class="cost-item-val">₹${electCost.toLocaleString('en-IN')}</span>
      </div>
      <div class="cost-item-row">
        <span class="cost-item-label"><span class="cost-color-dot" style="background:#06B6D4"></span>High-Speed Wi-Fi (Fiber)</span>
        <span class="cost-item-val">₹${costs.internet.toLocaleString('en-IN')}</span>
      </div>
      <div class="cost-item-row">
        <span class="cost-item-label"><span class="cost-color-dot" style="background:#10B981"></span>Society Maintenance & Security</span>
        <span class="cost-item-val">₹${costs.maintenance.toLocaleString('en-IN')}</span>
      </div>
      <div class="cost-item-row">
        <span class="cost-item-label"><span class="cost-color-dot" style="background:#8B5CF6"></span>Drinking Water & Waste</span>
        <span class="cost-item-val">₹${(costs.water + costs.other).toLocaleString('en-IN')}</span>
      </div>
    `;
  }

  const totalEl = document.getElementById('cost-total-amount');
  if (totalEl) {
    totalEl.innerText = `₹${totalCost.toLocaleString('en-IN')}`;
  }
}

function handleSimulatorChange(val) {
  const sliderValEl = document.getElementById('simulator-ac-hours');
  if (sliderValEl) sliderValEl.innerText = `${val} hrs/day`;

  // calculate dynamic electricity cost based on AC hours
  // Baseline ₹600 + (val * 150)
  const dynamicElectricity = 600 + (parseInt(val, 10) * 150);
  if (AppState.selectedProperty) {
    renderCostBreakdown(AppState.selectedProperty, dynamicElectricity);
  }
}

function renderTransparencyCard(prop) {
  const t = prop.transparencyBreakdown;
  const container = document.getElementById('modal-transparency-card');
  if (!container) return;

  container.innerHTML = `
    <div class="score-main-hero">
      <div class="score-circle-display">${prop.transparencyScore}</div>
      <div class="score-meta">
        <h4>${prop.transparencyScore}/100 — Highly Transparent</h4>
        <p>100% verified lease history, zero hidden charges, and landlord background check passed.</p>
      </div>
    </div>
    <div class="score-breakdown-bars">
      <div class="score-bar-row">
        <span>Pricing Transparency</span>
        <div style="display:flex; align-items:center;">
          <span style="color:var(--accent-emerald-dark)">${t.pricing}%</span>
          <div class="score-track"><div class="score-fill" style="width:${t.pricing}%"></div></div>
        </div>
      </div>
      <div class="score-bar-row">
        <span>Agreement Clarity</span>
        <div style="display:flex; align-items:center;">
          <span style="color:var(--accent-emerald-dark)">${t.agreement}%</span>
          <div class="score-track"><div class="score-fill" style="width:${t.agreement}%"></div></div>
        </div>
      </div>
      <div class="score-bar-row">
        <span>Owner Verification</span>
        <div style="display:flex; align-items:center;">
          <span style="color:var(--accent-emerald-dark)">${t.owner}%</span>
          <div class="score-track"><div class="score-fill" style="width:${t.owner}%"></div></div>
        </div>
      </div>
      <div class="score-bar-row">
        <span>Maintenance Track Record</span>
        <div style="display:flex; align-items:center;">
          <span style="color:var(--accent-emerald-dark)">${t.maintenance}%</span>
          <div class="score-track"><div class="score-fill" style="width:${t.maintenance}%"></div></div>
        </div>
      </div>
      <div class="score-bar-row">
        <span>Property Physical Verification</span>
        <div style="display:flex; align-items:center;">
          <span style="color:var(--accent-emerald-dark)">${t.physical}%</span>
          <div class="score-track"><div class="score-fill" style="width:${t.physical}%"></div></div>
        </div>
      </div>
    </div>
  `;
}

function renderAgreementPreview(prop) {
  const container = document.getElementById('modal-agreement-preview');
  if (!container) return;

  const a = prop.simplifiedAgreement;
  container.innerHTML = `
    <h4>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      Simplified Agreement Terms
    </h4>
    <div class="terms-cards-grid">
      <div class="term-mini-card">
        <div class="term-mini-label">Rent Schedule</div>
        <div class="term-mini-val">${a.rentAmount}</div>
      </div>
      <div class="term-mini-card">
        <div class="term-mini-label">Deposit Return</div>
        <div class="term-mini-val">${a.depositRefund}</div>
      </div>
      <div class="term-mini-card">
        <div class="term-mini-label">Notice Period</div>
        <div class="term-mini-val">${a.noticePeriod}</div>
      </div>
      <div class="term-mini-card">
        <div class="term-mini-label">Lock-In</div>
        <div class="term-mini-val">${a.lockInPeriod}</div>
      </div>
    </div>
    <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">
      <strong>Repairs:</strong> ${a.maintenanceRule}
    </div>
    <button class="btn btn-sm btn-outline" style="width:100%" onclick="closePropertyDetailsModal(); navigateTo('agreement')">
      View Full Plain-English Agreement →
    </button>
  `;
}

function triggerScheduleVisit() {
  showToast('Visit scheduled! Landlord Vikrambhai Patel will confirm via WhatsApp & Nestora.');
}

function triggerApplyNow() {
  showToast('Application initiated! Identity & KYC details shared securely with Owner.');
}

function triggerContactOwner() {
  showToast('Direct chat opened with Landlord Vikrambhai Patel (Response time < 15m)');
}

/* ==========================================================================
   4. ROOMMATE MATCHING HUB ("NESTORA MATCH")
   ========================================================================== */

function renderRoommateSwiper() {
  const container = document.getElementById('tinder-card-container');
  if (!container) return;

  const mates = window.NESTORA_DATA.roommates;
  const current = mates[AppState.roommateCardIndex % mates.length];

  container.innerHTML = `
    <div class="tinder-card" id="active-swipe-card">
      <div class="tinder-card-photo-wrap">
        <img src="${current.avatar}" alt="${current.name}" class="tinder-photo" />
        <div class="tinder-compatibility-badge">
          <span>❤️ ${current.compatibility}% Match</span>
        </div>
        <div class="tinder-card-overlay">
          <div class="tinder-name-age">${current.name}, ${current.age} ✓</div>
          <div class="tinder-profession">${current.role} • ${current.institution}</div>
          <div style="font-size:0.85rem; opacity:0.9;">Budget: <strong>${current.budget}</strong> • Move-in: ${current.moveInDate}</div>
        </div>
      </div>
      <div class="tinder-card-body">
        <div class="compat-breakdown-grid">
          <div>
            <div class="compat-metric-val">${current.compatibilityBreakdown.lifestyle}%</div>
            <div class="compat-metric-label">Lifestyle</div>
          </div>
          <div>
            <div class="compat-metric-val">${current.compatibilityBreakdown.budget}%</div>
            <div class="compat-metric-label">Budget</div>
          </div>
          <div>
            <div class="compat-metric-val">${current.compatibilityBreakdown.location}%</div>
            <div class="compat-metric-label">Location</div>
          </div>
          <div>
            <div class="compat-metric-val">${current.compatibilityBreakdown.moveInDate}%</div>
            <div class="compat-metric-label">Move-in</div>
          </div>
        </div>

        <div style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:14px; line-height:1.5;">
          "${current.about}"
        </div>

        <div class="lifestyle-chips-cloud">
          <span class="lifestyle-chip">⏰ ${current.lifestyle.schedule}</span>
          <span class="lifestyle-chip">🧹 ${current.lifestyle.cleanliness}</span>
          <span class="lifestyle-chip">🚭 ${current.lifestyle.smoking}</span>
          <span class="lifestyle-chip">🥗 ${current.lifestyle.food}</span>
          <span class="lifestyle-chip">🐾 ${current.lifestyle.pets}</span>
        </div>

        <div class="tinder-actions-row">
          <button class="swipe-action-btn btn-skip" onclick="swipeRoommate('skip')" title="Skip profile">✕</button>
          <button class="swipe-action-btn btn-info" onclick="openRoommateModal('${current.id}')" title="View detailed profile">ℹ</button>
          <button class="swipe-action-btn btn-match" onclick="swipeRoommate('match')" title="Connect & Match">❤️</button>
        </div>
      </div>
    </div>
  `;
}

function swipeRoommate(action) {
  const mates = window.NESTORA_DATA.roommates;
  const current = mates[AppState.roommateCardIndex % mates.length];

  if (action === 'match') {
    showMatchCelebration(current);
  } else {
    showToast(`Skipped ${current.name}`);
  }

  AppState.roommateCardIndex++;
  renderRoommateSwiper();
}

function showMatchCelebration(roommate) {
  showToast(`🎉 It's a 87% Match with ${roommate.name}! Connection invitation sent.`);
}

function toggleRoommateView(mode) {
  AppState.roommateMode = mode;
  const swiperDeck = document.getElementById('roommate-swiper-deck');
  const gridView = document.getElementById('roommate-grid-view');
  const swiperBtn = document.getElementById('toggle-swiper-btn');
  const gridBtn = document.getElementById('toggle-grid-btn');

  if (mode === 'swiper') {
    if (swiperDeck) swiperDeck.style.display = 'block';
    if (gridView) gridView.classList.remove('active');
    if (swiperBtn) swiperBtn.classList.add('active');
    if (gridBtn) gridBtn.classList.remove('active');
  } else {
    if (swiperDeck) swiperDeck.style.display = 'none';
    if (gridView) gridView.classList.add('active');
    if (swiperBtn) swiperBtn.classList.remove('active');
    if (gridBtn) gridBtn.classList.add('active');
  }
}

function renderRoommateGrid() {
  const container = document.getElementById('roommate-grid-view');
  if (!container) return;

  const mates = window.NESTORA_DATA.roommates;
  container.innerHTML = mates.map(m => `
    <div class="roommate-mini-card">
      <div style="height:200px; position:relative; overflow:hidden;">
        <img src="${m.avatar}" alt="${m.name}" style="width:100%; height:100%; object-fit:cover;" />
        <span class="badge badge-verified" style="position:absolute; top:12px; left:12px;">✓ Verified ID</span>
        <span class="badge badge-primary" style="position:absolute; top:12px; right:12px;">❤️ ${m.compatibility}% Match</span>
      </div>
      <div style="padding:20px;">
        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:4px;">${m.name}, ${m.age}</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">${m.role} • ${m.institution}</p>
        <div style="font-size:0.875rem; font-weight:700; color:var(--primary); margin-bottom:16px;">
          Budget: ${m.budget}
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="openRoommateModal('${m.id}')">View Profile</button>
          <button class="btn btn-primary btn-sm" style="flex:1;" onclick="showMatchCelebration(window.NESTORA_DATA.roommates.find(x => x.id === '${m.id}'))">Connect</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   5. ROOMMATE PROFILE MODAL
   ========================================================================== */

function openRoommateModal(roommateId) {
  const mate = window.NESTORA_DATA.roommates.find(m => m.id === roommateId) || window.NESTORA_DATA.roommates[0];
  AppState.selectedRoommate = mate;

  const modal = document.getElementById('roommate-modal');
  if (!modal) return;

  const body = document.getElementById('roommate-modal-body');
  if (body) {
    body.innerHTML = `
      <div class="profile-hero-header">
        <img src="${mate.avatar}" alt="${mate.name}" class="profile-avatar-large" />
        <div class="profile-meta-wrap">
          <div style="display:flex; align-items:center; gap:8px;">
            <h3>${mate.name}, ${mate.age}</h3>
            <span class="badge badge-verified">✓ Verified Student/Work</span>
          </div>
          <p style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:6px;">${mate.institution}</p>
          <div style="display:flex; gap:16px; font-size:0.85rem; font-weight:700;">
            <span style="color:var(--primary)">Target Budget: ${mate.budget}</span>
            <span style="color:var(--accent-emerald-dark)">❤️ ${mate.compatibility}% Compatibility</span>
          </div>
        </div>
      </div>

      <div class="why-compatible-box">
        <h4>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          Why You're Compatible
        </h4>
        <ul class="why-list">
          ${mate.whyCompatible.map(item => `
            <li class="why-item"><span style="color:var(--accent-emerald-dark)">✓</span> ${item}</li>
          `).join('')}
        </ul>
      </div>

      <div style="margin-bottom:24px;">
        <h4 style="font-size:1.05rem; font-weight:800; margin-bottom:8px;">About Me</h4>
        <p style="font-size:0.925rem; color:var(--text-secondary); line-height:1.6;">${mate.about}</p>
      </div>

      <div style="margin-bottom:24px;">
        <h4 style="font-size:1.05rem; font-weight:800; margin-bottom:10px;">Looking For</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          ${mate.lookingFor.map(req => `
            <div style="padding:10px 14px; background:var(--bg-surface-secondary); border-radius:var(--radius-sm); font-size:0.85rem; font-weight:600;">
              📍 ${req}
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom:28px;">
        <h4 style="font-size:1.05rem; font-weight:800; margin-bottom:12px;">Lifestyle & Living Habits</h4>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; font-size:0.85rem;">
          <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">SCHEDULE</div>
            <div style="font-weight:700;">${mate.lifestyle.schedule}</div>
          </div>
          <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">CLEANLINESS</div>
            <div style="font-weight:700;">${mate.lifestyle.cleanliness}</div>
          </div>
          <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">SMOKING</div>
            <div style="font-weight:700;">${mate.lifestyle.smoking}</div>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:12px;">
        <button class="btn btn-primary" style="flex:1;" onclick="closeRoommateModal(); showMatchCelebration(AppState.selectedRoommate);">
          Connect & Chat on Nestora
        </button>
        <button class="btn btn-secondary" onclick="closeRoommateModal();">Close</button>
      </div>
    `;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRoommateModal() {
  const modal = document.getElementById('roommate-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   6. RENT & EXPENSE DASHBOARD (TENANT EXPENSES & SPLITTER)
   ========================================================================== */

function renderSharedExpenses() {
  const listContainer = document.getElementById('dash-expense-list');
  if (!listContainer) return;

  listContainer.innerHTML = AppState.sharedExpenses.map(exp => `
    <div class="expense-row">
      <div class="expense-info">
        <h4>${exp.title}</h4>
        <div class="expense-date-payer">${exp.date} • Paid by <strong>${exp.paidBy}</strong></div>
      </div>
      <div class="expense-split-tag">
        <div class="expense-amount-owed ${exp.isSettled ? 'settled-chip' : (exp.isOwedByYou ? 'owed-by-you' : 'owed-to-you')}">
          ${exp.status}
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted)">Total: ₹${exp.totalAmount.toLocaleString('en-IN')}</div>
      </div>
    </div>
  `).join('');
}

function openSplitExpenseModal() {
  const modal = document.getElementById('split-expense-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeSplitExpenseModal() {
  const modal = document.getElementById('split-expense-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function submitNewSplitExpense(e) {
  e.preventDefault();
  const title = document.getElementById('split-title-input').value;
  const amount = parseFloat(document.getElementById('split-amount-input').value);
  const category = document.getElementById('split-category-select').value;
  const roommate = document.getElementById('split-roommate-select').value;

  if (!title || !amount) {
    showToast('Please fill out expense title and amount');
    return;
  }

  const share = amount / 2;
  const newExp = {
    id: `exp-${Date.now()}`,
    title: title,
    category: category,
    totalAmount: amount,
    paidBy: "Het Darji (You)",
    yourShare: share,
    status: `${roommate} owes you ₹${share.toLocaleString('en-IN')}`,
    isOwedByYou: false,
    date: "Today",
    dueDate: "Upcoming"
  };

  AppState.sharedExpenses.unshift(newExp);
  renderSharedExpenses();
  closeSplitExpenseModal();
  showToast(`Added ₹${amount.toLocaleString('en-IN')} expense! ${roommate} notified via Nestora.`);
}

function triggerPayRentModal() {
  showToast('Simulating UPI Payment: ₹18,000 to Palm Grove Escrow... ✓ Payment Successful! Rent receipt generated.');
}

function triggerSettleBalances() {
  AppState.sharedExpenses.forEach(exp => {
    exp.status = "Settled ✓";
    exp.isSettled = true;
    exp.isOwedByYou = false;
  });
  renderSharedExpenses();
  showToast('All roommate dues settled instantly via UPI autopay! ✓');
}

/* ==========================================================================
   7. MAINTENANCE MANAGEMENT ("NESTORA CARE")
   ========================================================================== */

function renderMaintenanceTickets() {
  const container = document.getElementById('maintenance-tickets-container');
  if (!container) return;

  container.innerHTML = AppState.maintenanceTickets.map(t => {
    const badgeClass = t.statusColor === 'red' ? 'badge-rose' : (t.statusColor === 'yellow' ? 'badge-amber' : 'badge-verified');
    return `
      <div class="maint-card">
        <div class="maint-card-top">
          <div class="maint-title-group">
            <span class="badge ${badgeClass}" style="margin-bottom:8px;">${t.status}</span>
            <h3>${t.title}</h3>
            <div class="maint-meta">
              <span>📍 ${t.location}</span>
              <span>Category: <strong>${t.category}</strong></span>
              <span>${t.reportedAgo}</span>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary);">Assigned Pro</div>
            <div style="font-size:0.825rem; color:var(--primary); font-weight:600;">${t.technician.name}</div>
            <div style="font-size:0.775rem; color:var(--text-muted);">${t.technician.eta}</div>
          </div>
        </div>

        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:20px; line-height:1.5;">
          ${t.description}
        </p>

        <!-- Stepper -->
        <div class="maint-timeline">
          ${t.timeline.map((step, idx) => {
            const isCompleted = idx + 1 < t.currentStep || (idx + 1 === t.currentStep && t.status === 'Completed');
            const isActive = idx + 1 === t.currentStep && t.status !== 'Completed';
            return `
              <div class="timeline-step ${isCompleted ? 'completed' : (isActive ? 'active' : '')}">
                <div class="step-circle">
                  ${isCompleted ? '✓' : idx + 1}
                </div>
                <div class="step-label">${step.label}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function openReportIssueModal() {
  const modal = document.getElementById('report-issue-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeReportIssueModal() {
  const modal = document.getElementById('report-issue-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function submitNewMaintenanceIssue(e) {
  e.preventDefault();
  const category = document.getElementById('issue-category-select').value;
  const title = document.getElementById('issue-title-input').value;
  const location = document.getElementById('issue-location-input').value;
  const description = document.getElementById('issue-desc-input').value;
  const urgency = document.getElementById('issue-urgency-select').value;

  if (!title || !description) {
    showToast('Please provide a title and description');
    return;
  }

  const newTicket = {
    id: `maint-${Date.now()}`,
    title: title,
    category: category,
    status: "Reported",
    statusColor: "yellow",
    urgency: urgency,
    reportedAgo: "Just now",
    technician: {
      name: "Assigning Technician...",
      phone: "+91 Nestora Support",
      rating: 5.0,
      eta: "Within 2 hours"
    },
    currentStep: 1,
    timeline: [
      { label: "Reported", time: "Just now", done: true },
      { label: "Assigned", time: "Pending", done: false },
      { label: "Technician Scheduled", time: "Pending", done: false },
      { label: "In Progress", time: "Pending", done: false },
      { label: "Resolved", time: "Pending", done: false }
    ],
    description: description,
    location: location,
    images: []
  };

  AppState.maintenanceTickets.unshift(newTicket);
  renderMaintenanceTickets();
  closeReportIssueModal();
  showToast('Maintenance ticket reported! Landlord and building manager alerted.');
}

/* ==========================================================================
   8. SMART PROPERTY VALUATION PAGE ("NESTORA VALUEIQ")
   ========================================================================== */

function calculatePropertyValuation(e) {
  e.preventDefault();
  const city = document.getElementById('val-city-select').value;
  const locality = document.getElementById('val-locality-input').value || 'Bodakdev';
  const type = document.getElementById('val-type-select').value;
  const area = parseInt(document.getElementById('val-area-input').value, 10) || 1200;
  const bedrooms = parseInt(document.getElementById('val-bhk-select').value, 10) || 2;
  const age = document.getElementById('val-age-select').value;

  // Algorithmic estimation based on Indian PropTech comp benchmarks
  let baseRatePerSqFt = 4500; // Ahmedabad average
  if (locality.toLowerCase().includes('bodakdev') || locality.toLowerCase().includes('prahlad')) {
    baseRatePerSqFt = 6200;
  } else if (city === 'Mumbai') {
    baseRatePerSqFt = 18000;
  } else if (city === 'Bengaluru') {
    baseRatePerSqFt = 8500;
  }

  const capitalValue = area * baseRatePerSqFt;
  const monthlyRent = Math.round((capitalValue * 0.03) / 12); // ~3% rental yield standard in Indian residential

  const minRent = Math.round((monthlyRent * 0.95) / 500) * 500;
  const maxRent = Math.round((monthlyRent * 1.08) / 500) * 500;

  const minCapInLakhs = (capitalValue * 0.95 / 100000).toFixed(1);
  const maxCapInLakhs = (capitalValue * 1.08 / 100000).toFixed(1);

  // Render results
  const resultsPanel = document.getElementById('val-results-panel');
  if (resultsPanel) {
    document.getElementById('val-rent-range').innerText = `₹${minRent.toLocaleString('en-IN')} – ₹${maxRent.toLocaleString('en-IN')}`;
    document.getElementById('val-cap-range').innerText = `₹${minCapInLakhs}L – ₹${maxCapInLakhs}L`;

    document.getElementById('val-comp-your').innerText = `₹${monthlyRent.toLocaleString('en-IN')}/mo`;
    document.getElementById('val-comp-area').innerText = `₹${Math.round(monthlyRent * 0.96).toLocaleString('en-IN')}/mo`;
    document.getElementById('val-comp-similar').innerText = `₹${Math.round(monthlyRent * 0.98).toLocaleString('en-IN')}/mo`;

    resultsPanel.classList.add('open');
    resultsPanel.scrollIntoView({ behavior: 'smooth' });
    showToast('Valuation calculated based on verified registry transactions!');
  }
}

/* ==========================================================================
   9. RENTAL AGREEMENT PAGE ("PLAIN-ENGLISH LEASE")
   ========================================================================== */

function renderAgreementClauses() {
  const container = document.getElementById('agreement-clauses-container');
  if (!container) return;

  const clauses = window.NESTORA_DATA.plainEnglishAgreementClauses;
  container.innerHTML = clauses.map((c, i) => `
    <div class="clause-card">
      <div class="clause-header-row">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:0.8rem; font-weight:800; background:var(--primary-light); color:var(--primary); padding:4px 8px; border-radius:var(--radius-xs);">Clause ${i + 1}</span>
          <h3 class="clause-title">${c.clauseTitle}</h3>
        </div>
        <span class="badge badge-verified">${c.highlightValue}</span>
      </div>

      <div class="clause-contrast-grid">
        <div class="legal-column">
          <span class="column-label">STANDARD LEGAL TEXT</span>
          ${c.standardLegal}
        </div>
        <div class="plain-column">
          <span class="column-label" style="color:var(--accent-emerald-dark)">✓ PLAIN ENGLISH EXPLANATION</span>
          ${c.plainEnglish}
        </div>
      </div>
    </div>
  `).join('');
}

function triggerDownloadAgreement() {
  showToast('📄 Downloading verified Plain-English Rental Agreement (PDF)...');
}

function triggerClarificationModal() {
  showToast('Clarification request sent to Landlord & Nestora Legal Concierge.');
}

function triggerSignAgreement() {
  showToast('🔏 Aadhaar eSign OTP verified! Digital rental agreement securely timestamped and executed.');
}

/* ==========================================================================
   10. OWNER / LANDLORD DASHBOARD ("NESTORA HOST")
   ========================================================================== */

function renderOwnerTable() {
  const tbody = document.getElementById('owner-tenant-table-body');
  if (!tbody) return;

  const props = window.NESTORA_DATA.ownerData.properties;
  tbody.innerHTML = props.map(p => `
    <tr>
      <td><strong>${p.title}</strong><div style="font-size:0.75rem; color:var(--text-muted)">${p.locality}</div></td>
      <td>${p.tenant}</td>
      <td><strong>₹${p.rent.toLocaleString('en-IN')}/mo</strong></td>
      <td>
        <span class="badge ${p.paymentStatus.includes('Paid') ? 'badge-verified' : (p.paymentStatus.includes('Due') ? 'badge-amber' : 'badge-rose')}">
          ${p.paymentStatus}
        </span>
      </td>
      <td>
        <span style="font-size:0.825rem; font-weight:600; color:${p.maintenanceStatus.includes('Clear') ? 'var(--accent-emerald-dark)' : 'var(--accent-amber)'}">
          ${p.maintenanceStatus}
        </span>
      </td>
      <td>${p.leaseExpiry}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="showToast('Opened messaging for ${p.tenant}')">Manage</button>
      </td>
    </tr>
  `).join('');
}

function openAddPropertyModal() {
  const modal = document.getElementById('add-property-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeAddPropertyModal() {
  const modal = document.getElementById('add-property-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function submitNewOwnerProperty(e) {
  e.preventDefault();
  const title = document.getElementById('prop-title-input').value;
  const rent = parseFloat(document.getElementById('prop-rent-input').value);
  const locality = document.getElementById('prop-locality-input').value;

  if (!title || !rent) {
    showToast('Please fill out property title and rent');
    return;
  }

  const newUnit = {
    id: `own-${Date.now()}`,
    title: title,
    locality: locality || 'SG Highway, Ahmedabad',
    tenant: 'Under Verification',
    rent: rent,
    status: 'Available',
    paymentStatus: 'Listed',
    maintenanceStatus: 'Clear',
    leaseExpiry: '11 Months'
  };

  window.NESTORA_DATA.ownerData.properties.unshift(newUnit);
  renderOwnerTable();
  closeAddPropertyModal();
  showToast(`Property listed! Nestora inspection team will verify within 24 hours.`);
}

/* ==========================================================================
   11. NOTIFICATION CENTER (DRAWER)
   ========================================================================== */

function renderNotificationDrawer() {
  const container = document.getElementById('notif-drawer-items');
  if (!container) return;

  container.innerHTML = AppState.notifications.map(n => `
    <div class="notif-item-card ${n.read ? '' : 'unread'}" onclick="handleNotificationClick('${n.id}')">
      <div class="notif-top">
        <span class="badge ${n.priority === 'urgent' ? 'badge-rose' : (n.priority === 'important' ? 'badge-amber' : 'badge-primary')}">
          ${n.priority.toUpperCase()}
        </span>
        <span class="notif-time">${n.time}</span>
      </div>
      <h4 class="notif-title">${n.title}</h4>
      <p class="notif-msg">${n.message}</p>
      <button class="btn btn-sm btn-outline" style="padding:4px 10px; font-size:0.75rem;">
        ${n.actionText} →
      </button>
    </div>
  `).join('');
}

function toggleNotificationDrawer(forceState = null) {
  const drawer = document.getElementById('notif-drawer-modal');
  if (!drawer) return;

  if (forceState !== null) {
    if (forceState) drawer.classList.add('open');
    else drawer.classList.remove('open');
  } else {
    drawer.classList.toggle('open');
  }
}

function handleNotificationClick(notifId) {
  const notif = AppState.notifications.find(n => n.id === notifId);
  if (!notif) return;
  notif.read = true;
  updateUnreadNotifBadge();
  renderNotificationDrawer();
  toggleNotificationDrawer(false);

  if (notif.actionTarget) {
    navigateTo(notif.actionTarget);
  }
}

function markAllNotificationsRead() {
  AppState.notifications.forEach(n => n.read = true);
  updateUnreadNotifBadge();
  renderNotificationDrawer();
  showToast('All notifications marked as read');
}

function updateUnreadNotifBadge() {
  const unread = AppState.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-badge-counter');
  if (badge) {
    if (unread > 0) {
      badge.innerText = unread;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

/* ==========================================================================
   12. USER PROFILE & SETTINGS
   ========================================================================== */

function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */

function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="color:var(--accent-emerald)">●</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   EVENT LISTENERS SETUP
   ========================================================================== */

function setupEventListeners() {
  // Navigation links
  document.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.target;
      if (target) navigateTo(target);
    });
  });

  // Role Toggle
  const tenantBtn = document.getElementById('role-btn-tenant');
  const ownerBtn = document.getElementById('role-btn-owner');

  if (tenantBtn) {
    tenantBtn.addEventListener('click', () => {
      AppState.userRole = 'Tenant';
      updateRoleButtons();
      navigateTo('dashboard');
      showToast('Switched to Tenant View (Het Darji)');
    });
  }

  if (ownerBtn) {
    ownerBtn.addEventListener('click', () => {
      AppState.userRole = 'Owner';
      updateRoleButtons();
      navigateTo('owner');
      showToast('Switched to Owner/Host View (8 Properties)');
    });
  }

  // Render initial agreement clauses
  renderAgreementClauses();
}

// Window Globals for inline HTML access
window.navigateTo = navigateTo;
window.handleHeroSearch = handleHeroSearch;
window.filterByChip = filterByChip;
window.handleSortChange = handleSortChange;
window.resetFilters = resetFilters;
window.highlightMapPin = highlightMapPin;
window.unhighlightMapPin = unhighlightMapPin;
window.toggleSaveProperty = toggleSaveProperty;
window.openPropertyDetailsModal = openPropertyDetailsModal;
window.closePropertyDetailsModal = closePropertyDetailsModal;
window.handleSimulatorChange = handleSimulatorChange;
window.triggerScheduleVisit = triggerScheduleVisit;
window.triggerApplyNow = triggerApplyNow;
window.triggerContactOwner = triggerContactOwner;
window.swipeRoommate = swipeRoommate;
window.toggleRoommateView = toggleRoommateView;
window.openRoommateModal = openRoommateModal;
window.closeRoommateModal = closeRoommateModal;
window.openSplitExpenseModal = openSplitExpenseModal;
window.closeSplitExpenseModal = closeSplitExpenseModal;
window.submitNewSplitExpense = submitNewSplitExpense;
window.triggerPayRentModal = triggerPayRentModal;
window.triggerSettleBalances = triggerSettleBalances;
window.openReportIssueModal = openReportIssueModal;
window.closeReportIssueModal = closeReportIssueModal;
window.submitNewMaintenanceIssue = submitNewMaintenanceIssue;
window.calculatePropertyValuation = calculatePropertyValuation;
window.triggerDownloadAgreement = triggerDownloadAgreement;
window.triggerClarificationModal = triggerClarificationModal;
window.triggerSignAgreement = triggerSignAgreement;
window.openAddPropertyModal = openAddPropertyModal;
window.closeAddPropertyModal = closeAddPropertyModal;
window.submitNewOwnerProperty = submitNewOwnerProperty;
window.toggleNotificationDrawer = toggleNotificationDrawer;
window.handleNotificationClick = handleNotificationClick;
window.markAllNotificationsRead = markAllNotificationsRead;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.showToast = showToast;
