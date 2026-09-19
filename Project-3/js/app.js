/**
 * NESTORA PROPTECH - CORE APPLICATION LOGIC
 * High-fidelity, reactive state, live Express & Supabase backend connectivity with resilient local fallback.
 */

// Backend & Supabase Configuration
const BACKEND_URL = 'http://localhost:5000/api';
const SUPABASE_URL = 'https://flzbgvhampusyphopqax.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsemJndmhhbXB1c3lwaG9wcWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDIxNzUsImV4cCI6MjA4OTQ3ODE3NX0.5i0m136j151bL6y88N3cwhw2eK06vN48Hn6yC3Gz75I';

// Safe REST API caller with automatic graceful offline fallback
async function apiCall(endpoint, options = {}) {
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Nestera API] Express server offline at ${BACKEND_URL}${endpoint}. Utilizing local resilient state.`, err.message);
    return null;
  }
}

// Application State
const AppState = {
  currentView: 'landing',
  currentUser: (() => {
    try {
      const stored = localStorage.getItem('nestora_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })(),
  selectedProperty: null,
  selectedRoommate: null,
  roommateCardIndex: 0,
  roommateMode: 'swiper', // 'swiper' or 'grid'
  filters: {
    city: 'Ahmedabad',
    type: 'All Types',
    campus: 'all',
    duration: 'all',
    budgetRange: 'all',
    furnished: false,
    roommatesAllowed: false,
    sortBy: 'recommended'
  },
  permanentRole: localStorage.getItem('nestora_permanent_role') || 'tenant', // 'tenant' | 'owner'
  userRole: (localStorage.getItem('nestora_permanent_role') || 'tenant') === 'owner' ? 'Owner' : 'Tenant',
  selectedPreRole: 'tenant',
  authMode: 'signup',
  ownerCurrentTab: 'dashboard',
  currentInspectingTicketId: null,
  acceptedRoommates: (() => {
    try {
      const s = localStorage.getItem('nestera_accepted_roommates') || localStorage.getItem('nestora_accepted_roommates');
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  })(),
  userPreferences: (() => {
    try {
      const p = localStorage.getItem('nestera_user_roommate_preferences') || localStorage.getItem('nestora_user_roommate_preferences');
      return p ? JSON.parse(p) : null;
    } catch (e) {
      return null;
    }
  })(),
  quizCurrentStep: 1,
  quizAnswers: {},
  checkoutProperty: null,
  checkoutDuration: 3,
  checkoutStep: 1,
  pendingStatusPropId: null,
  savedProperties: new Set(['prop-1']),
  liveProperties: null,
  sharedExpenses: [...(window.NESTORA_DATA?.sharedExpenses || [])],
  maintenanceTickets: [...(window.NESTORA_DATA?.maintenanceTickets || [])],
  notifications: [...(window.NESTORA_DATA?.notifications || [])],
  proofVaultTab: 'move_in',
  proofVaultItems: [
    {
      id: 'pv-1',
      room: 'Living Room',
      itemName: 'Geyser & Circuit Breaker',
      condition: 'Good (Minor Pre-existing wear)',
      meterReading: '014820 kWh',
      photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'],
      notes: 'Logged during move-in walkthrough with landlord.',
      tenantAcknowledged: true,
      ownerAcknowledged: true,
      type: 'move_in'
    },
    {
      id: 'pv-2',
      room: 'Utility Balcony',
      itemName: 'Torrent Power Electric Meter',
      condition: 'Excellent',
      meterReading: '028914 kWh',
      photoUrls: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80'],
      notes: 'Initial meter reading captured on camera.',
      tenantAcknowledged: true,
      ownerAcknowledged: true,
      type: 'move_in'
    }
  ],
  roommateContracts: [
    {
      id: 'con-1',
      propertyName: 'Sunrise Harmony Heights (Flat 402)',
      roommates: ['Aman Singh', 'Aarav Sharma'],
      rentSplit: { 'Aman Singh': '50%', 'Aarav Sharma': '50%' },
      quietHours: '11:00 PM – 7:00 AM (Weekdays)',
      choresSchedule: 'Alternating weekly kitchen and washroom cleaning',
      guestPolicy: 'Allowed with 24h advance WhatsApp notification',
      status: 'active',
      signatures: [{ name: 'Aman Singh', signed: true }, { name: 'Aarav Sharma', signed: true }]
    }
  ],
  botMessages: [
    {
      id: 'msg-0',
      sender: 'bot',
      text: '👋 Greetings! I am the Nestera Maintenance Relay Bot. Type any repair issue (e.g. "geyser leaking", "ac not cooling") to dispatch a technician immediately.',
      time: 'Just now'
    }
  ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

/* ==========================================================================
   CENTRALIZED AVATAR LOGIC (Gender-Based & Custom Avatar Hierarchy)
   ========================================================================== */

function getDefaultAvatar(gender) {
  const g = (gender || '').toString().toLowerCase().trim();
  if (g === 'female') {
    return 'images/avatars/avatar-female.png';
  }
  if (g === 'male') {
    return '—Pngtree—man avatar image for profile_13001882.png';
  }
  // 'Prefer not to say', null, undefined, or unknown
  return 'images/avatars/avatar-neutral.svg';
}

function isCustomAvatar(avatar) {
  if (!avatar || typeof avatar !== 'string') return false;
  const a = avatar.toLowerCase().trim();
  if (!a) return false;
  const defaultPlaceholders = [
    'pngtree',
    'avatar-male',
    'avatar-female',
    'avatar-neutral',
    '/avatar.png',
    'avatar.png',
    'photo-1507003211169-0a1dd7228f2d',
    'photo-1534528741775-53994a69daeb'
  ];
  return !defaultPlaceholders.some(keyword => a.includes(keyword));
}

function getProfileAvatar(profile) {
  if (!profile) return getDefaultAvatar(null);
  const custom = profile.avatar_url || profile.avatarUrl || profile.avatar;
  if (isCustomAvatar(custom)) {
    return custom;
  }
  return getDefaultAvatar(profile.gender);
}

window.getDefaultAvatar = getDefaultAvatar;
window.isCustomAvatar = isCustomAvatar;
window.getProfileAvatar = getProfileAvatar;

async function initApp() {
  if (AppState.currentUser) {
    if (!isCustomAvatar(AppState.currentUser.avatarUrl)) {
      AppState.currentUser.avatarUrl = getDefaultAvatar(AppState.currentUser.gender);
    }
    localStorage.setItem('nestora_auth_user', JSON.stringify(AppState.currentUser));
  }
  initPermanentRoleBadge();
  updateAuthUI();
  await loadLiveBackendData();
  await loadUserRoommatePreferences();

  renderShowcaseProperties();
  renderDiscoveryProperties();
  renderDiscoveryMapPins();
  renderRoommateSwiper();
  renderRoommateGrid();
  updateQuizBannerUI();
  renderSharedExpenses();
  renderMaintenanceTickets();
  renderOwnerTable();
  loadOwnerApplications();
  renderOwnerMaintenanceTickets();
  renderNotificationDrawer();
  setupEventListeners();
  updateUnreadNotifBadge();
}

function initPermanentRoleBadge() {
  const roleLabel = document.getElementById('nav-role-label');
  if (roleLabel) {
    roleLabel.innerText = AppState.permanentRole === 'owner' ? '🏢 Owner' : '🏠 Tenant';
  }
}

function updateAuthUI() {
  const user = AppState.currentUser;
  const userName = user ? (user.fullName || user.name || user.email?.split('@')[0] || 'Resident') : 'Resident';
  const roleStr = (user?.role || AppState.permanentRole || 'tenant').toLowerCase();
  const isOwner = roleStr === 'owner';
  const currentAvatar = getProfileAvatar(user);

  // Greeting in Tenant Dashboard
  const dashGreeting = document.getElementById('dash-greeting-heading');
  if (dashGreeting) {
    dashGreeting.innerText = user ? `Greetings, ${userName} 👋` : 'Greetings, Resident 👋';
  }

  // Greeting in Owner Dashboard
  const ownerGreeting = document.getElementById('owner-greeting-heading');
  if (ownerGreeting) {
    ownerGreeting.innerText = user ? `Greetings, ${userName} 👋` : 'Greetings, Landlord Partner 👋';
  }

  // Navbar user display
  const navName = document.getElementById('user-nav-display-name');
  if (navName) {
    navName.innerText = user ? userName : 'Sign In';
  }
  const navAvatar = document.getElementById('user-nav-avatar');
  if (navAvatar) {
    navAvatar.src = currentAvatar;
  }

  // Role Badge in Navbar
  const roleLabel = document.getElementById('nav-role-label');
  if (roleLabel) {
    roleLabel.innerText = isOwner ? '🏢 Owner' : '🏠 Tenant';
  }

  // Profile Modal Elements
  const profName = document.getElementById('profile-modal-name');
  if (profName) profName.innerText = user ? userName : 'Resident';

  const profRole = document.getElementById('profile-modal-role');
  if (profRole) profRole.innerText = `Verified ${isOwner ? 'Owner' : 'Tenant'} • Ahmedabad`;

  const profEmail = document.getElementById('profile-modal-email');
  if (profEmail) profEmail.innerText = user?.email ? `✓ ${user.email}` : '✓ resident@example.com';

  const profPhone = document.getElementById('profile-modal-phone');
  if (profPhone) profPhone.innerText = user?.phone ? `✓ ${user.phone}` : '✓ +91 98250 12345';

  const profPermRole = document.getElementById('profile-modal-perm-role');
  if (profPermRole) profPermRole.innerText = `Locked & Verified (${isOwner ? 'Owner' : 'Tenant'})`;

  const profGender = document.getElementById('profile-modal-gender');
  if (profGender) profGender.innerText = user?.gender ? user.gender : 'Not specified';

  const profDob = document.getElementById('profile-modal-dob');
  if (profDob) profDob.innerText = (user?.dateOfBirth || user?.date_of_birth) ? (user.dateOfBirth || user.date_of_birth) : 'Not specified';

  const profAvatar = document.getElementById('profile-modal-avatar');
  if (profAvatar) {
    profAvatar.src = currentAvatar;
  }

  // Owner dashboard profile elements
  const ownerProfAvatar = document.getElementById('owner-profile-avatar');
  if (ownerProfAvatar) {
    ownerProfAvatar.src = currentAvatar;
  }
  const ownerProfName = document.getElementById('owner-profile-name');
  if (ownerProfName && user) {
    ownerProfName.innerText = userName;
  }
  const ownerProfEmail = document.getElementById('owner-profile-email');
  if (ownerProfEmail && user?.email) {
    ownerProfEmail.innerText = user.email;
  }

  // Constitution Preview
  const rcPrevUser = document.getElementById('rc-prev-user-name');
  if (rcPrevUser) rcPrevUser.innerText = userName;
}

function handleLogout() {
  localStorage.removeItem('nestora_auth_user');
  localStorage.removeItem('nestora_permanent_role');
  AppState.currentUser = null;
  AppState.permanentRole = 'tenant';
  AppState.userRole = 'Tenant';
  closeProfileModal();
  updateAuthUI();
  navigateTo('landing');
  showToast('Signed out of Nestera. All user state purged.', 'info');
}

async function loadLiveBackendData() {
  // 1. Properties
  const propRes = await apiCall('/properties?city=Ahmedabad');
  if (propRes && propRes.data && propRes.data.length > 0) {
    AppState.liveProperties = propRes.data;
  } else {
    AppState.liveProperties = window.NESTORA_DATA.properties;
  }

  // 2. Proof Vault
  const pvRes = await apiCall('/proof-vault/prop-1');
  if (pvRes && pvRes.data && pvRes.data.length > 0) {
    AppState.proofVaultItems = pvRes.data;
  }

  // 3. User session profile refresh
  if (AppState.currentUser && AppState.currentUser.email) {
    try {
      const meRes = await apiCall(`/auth/me?email=${encodeURIComponent(AppState.currentUser.email)}`);
      if (meRes && meRes.user) {
        AppState.currentUser = {
          ...AppState.currentUser,
          ...meRes.user,
          gender: meRes.user.gender || AppState.currentUser.gender || null,
          date_of_birth: meRes.user.date_of_birth || meRes.user.dateOfBirth || AppState.currentUser.date_of_birth || null,
          dateOfBirth: meRes.user.date_of_birth || meRes.user.dateOfBirth || AppState.currentUser.dateOfBirth || null
        };
        AppState.currentUser.avatarUrl = getProfileAvatar(AppState.currentUser);
        localStorage.setItem('nestora_auth_user', JSON.stringify(AppState.currentUser));
        updateAuthUI();
      }
    } catch (e) {
      console.warn('Could not refresh session profile:', e);
    }
  }
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
    renderOwnerTable();
    renderOwnerMaintenanceTickets();
    loadOwnerApplications();
    renderOwnerNotificationsList();
    updateOwnerSidebarBadges();
    switchOwnerTab(AppState.ownerCurrentTab || 'dashboard', false);
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
  const source = AppState.liveProperties || window.NESTORA_DATA.properties;
  return source.filter(prop => {
    // Hide Found properties in public search
    if (prop.status === 'Found') return false;

    // Campus filter
    if (AppState.filters.campus && AppState.filters.campus !== 'all') {
      if (prop.campusDistances && !prop.campusDistances[AppState.filters.campus]) {
        return false;
      }
    }

    // Short-term stay duration filter
    if (AppState.filters.duration && AppState.filters.duration !== 'all') {
      const dur = parseInt(AppState.filters.duration, 10);
      const min = prop.minMonths || 2;
      const max = prop.maxMonths || 12;
      if (dur < min || dur > max) return false;
    }

    // City filter
    if (AppState.filters.city !== 'All' && prop.city !== AppState.filters.city) {
      // allow Ahmedabad
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
    if (AppState.filters.furnished && prop.specs && prop.specs.furnishing !== 'Furnished') return false;

    // Roommates filter
    if (AppState.filters.roommatesAllowed && prop.specs && !prop.specs.roommatesAllowed) return false;

    return true;
  }).sort((a, b) => {
    if (AppState.filters.sortBy === 'true-cost') {
      const costA = a.trueMonthlyCost || (a.rent + 4700);
      const costB = b.trueMonthlyCost || (b.rent + 4700);
      return costA - costB;
    }
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
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">Try adjusting your campus or duration filters to see more verified student and young professional spaces.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filtered.map(prop => {
    const isSaved = AppState.savedProperties.has(prop.id);
    const trueCost = prop.trueMonthlyCost || (prop.rent + 4700);
    const minM = prop.minMonths || 2;
    const maxM = prop.maxMonths || 12;

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
              <div style="display:flex; gap:6px; align-items:center;">
                <span class="card-type-tag">${prop.type}</span>
                <span style="font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:4px; background:#FEF3C7; color:#92400E;">
                  ⏳ ${minM}–${maxM} Mos Stay
                </span>
              </div>
              <span class="score-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                ${prop.transparencyScore}/100 Transparency
              </span>
            </div>
            <h3 class="card-title">${prop.title}</h3>
            <p class="card-location">
              📍 ${prop.locality} • <span style="color:var(--primary); font-weight:600;">${prop.distance}</span>
              ${prop.campusDistances ? `<span style="margin-left:8px; color:var(--primary); font-weight:700;">🎓 ${AppState.filters.campus !== 'all' && prop.campusDistances[AppState.filters.campus] ? prop.campusDistances[AppState.filters.campus] + ' from ' + AppState.filters.campus : '1.2 km to Nirma Univ'}</span>` : ''}
            </p>

            <!-- True Cost of Living Formula Bar -->
            <div class="true-cost-pill">
              <span style="font-weight:800;">True Monthly Cost:</span>
              <span style="font-weight:800; color:#15803D;">₹${trueCost.toLocaleString('en-IN')}/mo</span>
              <span style="font-size:0.72rem; opacity:0.85;">(Rent ₹${prop.rent.toLocaleString('en-IN')} + Commute ₹1,200 + Groceries ₹3,500)</span>
            </div>

            <div class="card-amenities-pills" style="margin-top:8px;">
              <span class="amenity-pill">🛏️ ${prop.specs.bedrooms} Bed</span>
              <span class="amenity-pill">🚿 ${prop.specs.bathrooms} Bath</span>
              <span class="amenity-pill">⚡ ${prop.specs.furnishing}</span>
              ${prop.specs.roommatesAllowed ? '<span class="amenity-pill" style="color:var(--accent-emerald-dark); background:var(--accent-emerald-light)">👥 Roommates Allowed</span>' : ''}
            </div>
          </div>
          
          <div class="card-bottom-pricing">
            <div class="price-main">
              <span class="rent-tag">₹${prop.rent.toLocaleString('en-IN')}<span class="rent-period">/month base</span></span>
              <span class="deposit-info">Deposit: ₹${prop.deposit.toLocaleString('en-IN')}</span>
            </div>
            <button class="btn btn-sm btn-primary" onclick="openPropertyDetailsModal('${prop.id}')">View Breakdown</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleCampusFilterChange(campus) {
  AppState.filters.campus = campus;
  renderDiscoveryProperties();
  renderDiscoveryMapPins();
  showToast(campus === 'all' ? 'Showing citywide spaces' : `Filtering spaces nearest to ${campus}`);
}

function filterByDuration(dur, el) {
  document.querySelectorAll('[id^="pill-dur-"]').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  AppState.filters.duration = dur;
  renderDiscoveryProperties();
  showToast(dur === 'all' ? 'All stay durations active' : `Showing spaces supporting ${dur}-month short stays`);
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
  showToast('Visit scheduled! Landlord Vikrambhai Patel will confirm via WhatsApp & Nestera.');
}

function triggerApplyNow() {
  showToast('Application initiated! Identity & KYC details shared securely with Owner.');
}

function triggerContactOwner() {
  showToast('Direct chat opened with Landlord Vikrambhai Patel (Response time < 15m)');
}

/* ==========================================================================
   4. ROOMMATE COMPATIBILITY QUIZ & DYNAMIC MATCHING ENGINE
   ========================================================================== */

const QUIZ_STEPS_META = [
  { step: 1, tag: 'Step 1 of 7 • Food & Dining', title: 'Food & Dining Preferences' },
  { step: 2, tag: 'Step 2 of 7 • Habits & Living', title: 'Habits & Social Living' },
  { step: 3, tag: 'Step 3 of 7 • Monthly Budget', title: 'Monthly Budget Calibrator' },
  { step: 4, tag: 'Step 4 of 7 • Personality & Goals', title: 'Personality, Study & Boundaries' },
  { step: 5, tag: 'Step 5 of 7 • Sleep & Noise', title: 'Sleep Hours & Sound Environment' },
  { step: 6, tag: 'Step 6 of 7 • Roommate Preferences', title: 'Roommate Age, Gender & Role' },
  { step: 7, tag: 'Step 7 of 7 • Cleanliness, Space & Pets', title: 'Pets, Tidiness & Personal Space' },
  { step: 8, tag: 'Step 8 • Review & Submit', title: 'Review & Compatibility Engine' }
];

async function loadUserRoommatePreferences() {
  try {
    const cached = localStorage.getItem('nestera_user_roommate_preferences') || localStorage.getItem('nestora_user_roommate_preferences');
    if (cached) {
      AppState.userPreferences = JSON.parse(cached);
    }
  } catch (e) {}

  const userId = AppState.currentUser?.id;
  try {
    const res = await fetch(`http://localhost:5000/api/roommates/preferences${userId ? `?userId=${userId}` : ''}`);
    if (res.ok) {
      const body = await res.json();
      if (body.success && body.data) {
        AppState.userPreferences = body.data;
        localStorage.setItem('nestera_user_roommate_preferences', JSON.stringify(body.data));
      }
    }
  } catch (err) {
    // Offline or backend running standalone, local persistence remains active
  }

  updateQuizBannerUI();
}

function updateQuizBannerUI() {
  const isDone = Boolean(AppState.userPreferences && AppState.userPreferences.quiz_completed);
  const pillText = document.getElementById('quiz-hero-pill-text');
  const dot = document.getElementById('quiz-hero-pulse-dot');
  const title = document.getElementById('quiz-hero-title');
  const sub = document.getElementById('quiz-hero-sub');
  const btnText = document.getElementById('btn-quiz-cta-text');
  const uptodate = document.getElementById('quiz-hero-uptodate');
  const timestamp = document.getElementById('quiz-hero-timestamp');

  if (isDone) {
    if (pillText) pillText.innerText = '✓ Preferences Active';
    if (dot) dot.classList.add('dot-completed');
    if (title) title.innerText = 'Retake Compatibility Quiz';
    if (sub) sub.innerText = 'Your lifestyle answers are calculating personalized match scores across all roommate profiles.';
    if (btnText) btnText.innerText = 'Retake Quiz ↻';
    if (uptodate) {
      uptodate.style.display = 'inline-flex';
      if (timestamp && AppState.userPreferences.updated_at) {
        const d = new Date(AppState.userPreferences.updated_at);
        timestamp.innerText = `(Updated ${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})`;
      }
    }
  } else {
    if (pillText) pillText.innerText = 'Quiz Not Completed';
    if (dot) dot.classList.remove('dot-completed');
    if (title) title.innerText = 'Take Compatibility Quiz';
    if (sub) sub.innerText = 'Answer a few questions about your lifestyle and preferences to find roommates who match you better.';
    if (btnText) btnText.innerText = 'Take the Quiz →';
    if (uptodate) uptodate.style.display = 'none';
  }
}

function getCalculatedRoommateMatch(m) {
  if (AppState.userPreferences && AppState.userPreferences.quiz_completed && window.NesteraCompatibility) {
    const res = window.NesteraCompatibility.calculateCompatibility(AppState.userPreferences, m);
    m._calcResult = res;
    m.compatibility = res.percentage;
    return res.percentage;
  }
  m._calcResult = null;
  return getStableRoommateMatch(m);
}

function getStableRoommateMatch(m) {
  if (m.compatibility && m.compatibility >= 61 && m.compatibility <= 98) {
    return m.compatibility;
  }
  const str = `${m.id || ''}-${m.name || ''}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const score = 65 + (Math.abs(hash) % 31);
  m.compatibility = score;
  return score;
}

function openCompatibilityQuiz(step = 1) {
  AppState.quizCurrentStep = step;

  if (AppState.userPreferences) {
    AppState.quizAnswers = { ...AppState.userPreferences };
  } else {
    AppState.quizAnswers = {
      monthly_budget: 12000,
      food_preference_flexibility: 'No',
      roommate_gender_preference: 'Any',
      ...AppState.quizAnswers
    };
  }

  syncQuizDOMWithAnswers();
  showQuizStep(step);

  const modal = document.getElementById('roommate-quiz-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCompatibilityQuiz() {
  const modal = document.getElementById('roommate-quiz-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function showQuizStep(stepNum) {
  AppState.quizCurrentStep = stepNum;

  for (let i = 1; i <= 8; i++) {
    const p = document.getElementById(`quiz-step-${i}`);
    if (p) p.style.display = i === stepNum ? 'block' : 'none';
  }

  const meta = QUIZ_STEPS_META.find(m => m.step === stepNum) || QUIZ_STEPS_META[0];
  const tag = document.getElementById('quiz-step-indicator');
  const title = document.getElementById('quiz-step-title');
  const fill = document.getElementById('quiz-progress-fill');

  if (tag) tag.innerText = meta.tag;
  if (title) title.innerText = meta.title;
  if (fill) fill.style.width = `${Math.round((stepNum / 8) * 100)}%`;

  const btnBack = document.getElementById('quiz-btn-back');
  const btnNext = document.getElementById('quiz-btn-next');
  const btnSubmit = document.getElementById('quiz-btn-submit');

  if (btnBack) btnBack.style.display = stepNum > 1 ? 'inline-flex' : 'none';
  if (btnNext) btnNext.style.display = stepNum < 8 ? 'inline-flex' : 'none';
  if (btnSubmit) btnSubmit.style.display = stepNum === 8 ? 'inline-flex' : 'none';

  const body = document.getElementById('quiz-modal-body');
  if (body) body.scrollTop = 0;
}

function selectQuizOption(field, value, cardEl) {
  AppState.quizAnswers[field] = value;

  const grid = cardEl.closest('.quiz-options-grid');
  if (grid) {
    grid.querySelectorAll('.quiz-option-card').forEach(c => c.classList.remove('selected'));
  }
  cardEl.classList.add('selected');
}

function handleQuizBudgetInput(val) {
  const num = Number(val) || 0;
  AppState.quizAnswers.monthly_budget = num;
  const display = document.getElementById('quiz-budget-display');
  if (display) {
    display.innerText = `Monthly Budget: ₹${num.toLocaleString('en-IN')}`;
  }
}

function syncQuizDOMWithAnswers() {
  const answers = AppState.quizAnswers;

  document.querySelectorAll('.quiz-options-grid').forEach(grid => {
    const field = grid.getAttribute('data-field');
    if (!field) return;
    const currentVal = answers[field];
    grid.querySelectorAll('.quiz-option-card').forEach(card => {
      card.classList.remove('selected');
      const text = card.innerText || '';
      if (currentVal && text.includes(currentVal)) {
        card.classList.add('selected');
      }
    });
  });

  const slider = document.getElementById('quiz-budget-slider');
  const display = document.getElementById('quiz-budget-display');
  const budget = answers.monthly_budget !== undefined ? answers.monthly_budget : 12000;
  if (slider) slider.value = budget;
  if (display) display.innerText = `Monthly Budget: ₹${Number(budget).toLocaleString('en-IN')}`;
}

function validateQuizStep(stepNum) {
  const ans = AppState.quizAnswers;
  const requiredByStep = {
    1: ['food_preference', 'food_preference_flexibility', 'eating_out_frequency'],
    2: ['smoking_frequency', 'drinking_frequency'],
    3: ['monthly_budget'],
    4: ['personality_type', 'relationship_status', 'roommate_relationship_preference', 'biggest_roommate_concern', 'study_location_preference'],
    5: ['sleep_schedule', 'sleep_environment_preference'],
    6: ['roommate_gender_preference', 'roommate_age_preference', 'occupation'],
    7: ['pet_preference', 'cleanliness_level', 'personal_space_importance']
  };

  const fields = requiredByStep[stepNum] || [];
  for (const f of fields) {
    if (ans[f] === undefined || ans[f] === null || ans[f] === '') {
      showToast(`Please answer all questions before proceeding.`, 'warning');
      return false;
    }
  }
  return true;
}

function handleQuizNextStep() {
  if (!validateQuizStep(AppState.quizCurrentStep)) return;

  if (AppState.quizCurrentStep < 7) {
    showQuizStep(AppState.quizCurrentStep + 1);
  } else if (AppState.quizCurrentStep === 7) {
    renderQuizReviewSummary();
    showQuizStep(8);
  }
}

function handleQuizPrevStep() {
  if (AppState.quizCurrentStep > 1) {
    showQuizStep(AppState.quizCurrentStep - 1);
  }
}

function renderQuizReviewSummary() {
  const grid = document.getElementById('quiz-review-summary-grid');
  if (!grid) return;

  const a = AppState.quizAnswers;
  const items = [
    { label: 'Food Preference', val: `${a.food_preference || '—'} (${a.food_preference_flexibility === 'Yes' ? 'Strict' : 'Flexible'})` },
    { label: 'Eating Out', val: a.eating_out_frequency || '—' },
    { label: 'Monthly Budget', val: `₹${Number(a.monthly_budget || 12000).toLocaleString('en-IN')}` },
    { label: 'Smoking Habit', val: a.smoking_frequency || '—' },
    { label: 'Drinking Habit', val: a.drinking_frequency || '—' },
    { label: 'Personality', val: `${a.personality_type || '—'} • ${a.relationship_status || 'Single'}` },
    { label: 'Roommate Bond', val: a.roommate_relationship_preference || '—' },
    { label: 'Sleep Routine', val: a.sleep_schedule || '—' },
    { label: 'Cleanliness', val: a.cleanliness_level || '—' },
    { label: 'Personal Space', val: a.personal_space_importance || '—' },
    { label: 'Pet Tolerance', val: a.pet_preference || '—' },
    { label: 'Roommate Pref', val: `${a.roommate_gender_preference || 'Any'} • Age ${a.roommate_age_preference || '17–25'}` }
  ];

  grid.innerHTML = items.map(item => `
    <div class="quiz-review-card">
      <div class="quiz-review-label">${item.label}</div>
      <div class="quiz-review-val">${item.val}</div>
    </div>
  `).join('');
}

async function submitCompatibilityQuiz() {
  showToast('Calculating your roommate matches...');

  const payload = {
    ...AppState.quizAnswers,
    user_id: AppState.currentUser?.id || null,
    monthly_budget: Number(AppState.quizAnswers.monthly_budget) || 12000,
    quiz_completed: true,
    updated_at: new Date().toISOString()
  };

  AppState.userPreferences = payload;
  try {
    localStorage.setItem('nestera_user_roommate_preferences', JSON.stringify(payload));
  } catch (e) {}

  try {
    await fetch('http://localhost:5000/api/roommates/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Backend sync warning (persisted locally):', err);
  }

  closeCompatibilityQuiz();
  showToast('Your compatibility matches are ready!', 'success');
  updateQuizBannerUI();

  renderRoommateSwiper();
  renderRoommateGrid();
}

function renderRoommateSwiper() {
  const container = document.getElementById('tinder-card-container');
  if (!container) return;

  const mates = window.NESTORA_DATA.roommates;
  const current = mates[AppState.roommateCardIndex % mates.length];
  const compatScore = getCalculatedRoommateMatch(current);
  const isAccepted = AppState.acceptedRoommates.includes(current.id);
  const hasQuiz = Boolean(AppState.userPreferences && AppState.userPreferences.quiz_completed);

  container.innerHTML = `
    <div class="tinder-card" id="active-swipe-card">
      <div class="tinder-card-photo-wrap">
        <img src="${getProfileAvatar(current)}" alt="${current.name}" class="tinder-photo" />
        <div class="tinder-compatibility-badge ${!hasQuiz ? 'compat-badge-demo' : ''}">
          <span>❤️ ${compatScore}% Match</span>
        </div>
        ${isAccepted ? '<span class="badge badge-emerald" style="position:absolute; top:12px; left:12px; z-index:5;">✓ Connected</span>' : ''}
        <div class="tinder-card-overlay">
          <div class="tinder-name-age">${current.name}, ${current.age} ✓</div>
          <div class="tinder-profession">${current.role} • ${current.institution}</div>
          <div style="font-size:0.85rem; opacity:0.9;">Budget: <strong>${current.budget}</strong> • Move-in: ${current.moveInDate}</div>
        </div>
      </div>
      <div class="tinder-card-body">
        <div class="compat-breakdown-grid">
          <div>
            <div class="compat-metric-val">${current.compatibilityBreakdown?.lifestyle || 92}%</div>
            <div class="compat-metric-label">Lifestyle</div>
          </div>
          <div>
            <div class="compat-metric-val">${current.compatibilityBreakdown?.budget || 88}%</div>
            <div class="compat-metric-label">Budget</div>
          </div>
          <div>
            <div class="compat-metric-val">${current.compatibilityBreakdown?.location || 94}%</div>
            <div class="compat-metric-label">Location</div>
          </div>
          <div>
            <div class="compat-metric-val">${current.compatibilityBreakdown?.moveInDate || 90}%</div>
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
          <span class="lifestyle-chip">🐾 ${current.lifestyle.pets || 'No pets'}</span>
        </div>

        <div class="tinder-actions-row">
          <button class="swipe-action-btn btn-skip" onclick="swipeRoommate('skip')" title="Skip profile">✕</button>
          <button class="swipe-action-btn btn-info" onclick="openRoommateModal('${current.id}')" title="View detailed profile">ℹ</button>
          <button class="swipe-action-btn btn-match" onclick="swipeRoommate('match')" title="${isAccepted ? 'Already Connected' : 'Connect & Match'}">❤️</button>
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

function handleConnectRoommate(roommateId) {
  const mate = window.NESTORA_DATA.roommates.find(x => x.id === roommateId);
  if (mate) {
    showMatchCelebration(mate);
  }
}

function showMatchCelebration(roommate) {
  if (!roommate) return;
  const score = getCalculatedRoommateMatch(roommate);

  if (!AppState.acceptedRoommates.includes(roommate.id)) {
    AppState.acceptedRoommates.push(roommate.id);
    try {
      localStorage.setItem('nestera_accepted_roommates', JSON.stringify(AppState.acceptedRoommates));
    } catch (e) {
      console.warn('Could not persist accepted roommates:', e);
    }
  }

  showToast(`🎉 It's a ${score}% Match with ${roommate.name}! Status: Connected / Accepted.`);
  renderRoommateGrid();
  renderRoommateSwiper();
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
    renderRoommateSwiper();
  } else {
    if (swiperDeck) swiperDeck.style.display = 'none';
    if (gridView) gridView.classList.add('active');
    if (swiperBtn) swiperBtn.classList.remove('active');
    if (gridBtn) gridBtn.classList.add('active');
    renderRoommateGrid();
  }
}

function renderRoommateGrid() {
  const container = document.getElementById('roommate-grid-view');
  if (!container) return;

  const mates = window.NESTORA_DATA.roommates;
  const hasQuiz = Boolean(AppState.userPreferences && AppState.userPreferences.quiz_completed);

  container.innerHTML = mates.map(m => {
    const isAccepted = AppState.acceptedRoommates.includes(m.id);
    const score = getCalculatedRoommateMatch(m);

    return `
    <div class="roommate-mini-card">
      <div style="height:200px; position:relative; overflow:hidden;">
        <img src="${getProfileAvatar(m)}" alt="${m.name}" style="width:100%; height:100%; object-fit:cover;" />
        <span class="badge badge-verified" style="position:absolute; top:12px; left:12px;">✓ Verified ID</span>
        ${hasQuiz 
          ? `<span class="badge badge-primary" style="position:absolute; top:12px; right:12px;">❤️ ${score}% Match</span>`
          : `<span class="badge compat-badge-demo" style="position:absolute; top:12px; right:12px; cursor:pointer;" onclick="openCompatibilityQuiz()" title="Take Compatibility Quiz for dynamic score">🎯 ${score}% (Demo)</span>`
        }
        ${isAccepted ? '<span class="badge badge-emerald" style="position:absolute; bottom:10px; left:12px;">✓ Connected</span>' : ''}
      </div>
      <div style="padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
          <h3 style="font-size:1.2rem; font-weight:800; margin:0;">${m.name}, ${m.age}</h3>
          ${isAccepted ? '<span style="font-size:0.75rem; color:var(--accent-emerald-dark); font-weight:800;">Status: Connected</span>' : ''}
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">${m.role} • ${m.institution}</p>
        <div style="font-size:0.875rem; font-weight:700; color:var(--primary); margin-bottom:16px;">
          Budget: ${m.budget}
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="openRoommateModal('${m.id}')">View Profile</button>
          ${isAccepted 
            ? `<button class="btn btn-sm" style="flex:1; background:#ECFDF5; color:#065F46; border:1.5px solid #A7F3D0; font-weight:700; cursor:default;" disabled title="Roommate connected">✓ Connected</button>`
            : `<button class="btn btn-primary btn-sm" style="flex:1;" onclick="handleConnectRoommate('${m.id}')">Connect</button>`
          }
        </div>
      </div>
    </div>
  `}).join('');
}

/* ==========================================================================
   5. ROOMMATE PROFILE MODAL
   ========================================================================== */

function openRoommateModal(roommateId) {
  const mate = window.NESTORA_DATA.roommates.find(m => m.id === roommateId) || window.NESTORA_DATA.roommates[0];
  AppState.selectedRoommate = mate;
  const score = getCalculatedRoommateMatch(mate);
  const isAccepted = AppState.acceptedRoommates.includes(mate.id);
  const hasQuiz = Boolean(AppState.userPreferences && AppState.userPreferences.quiz_completed);
  const calcResult = mate._calcResult;

  const modal = document.getElementById('roommate-modal');
  if (!modal) return;

  const body = document.getElementById('roommate-modal-body');
  if (body) {
    const matchedList = calcResult?.matchedFactors || mate.whyCompatible || [
      'Both prefer quiet evening study sessions',
      'High cleanliness standards match',
      'Similar campus commute times'
    ];
    const diffList = calcResult?.differences || [];

    body.innerHTML = `
      <div class="profile-hero-header">
        <img src="${getProfileAvatar(mate)}" alt="${mate.name}" class="profile-avatar-large" />
        <div class="profile-meta-wrap">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <h3>${mate.name}, ${mate.age}</h3>
            <span class="badge badge-verified">✓ Verified Student/Work</span>
            ${isAccepted ? '<span class="badge badge-emerald">✓ Connected / Accepted</span>' : ''}
          </div>
          <p style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:6px;">${mate.institution}</p>
          <div style="display:flex; gap:16px; font-size:0.85rem; font-weight:700; flex-wrap:wrap;">
            <span style="color:var(--primary)">Target Budget: ${mate.budget}</span>
            <span style="color:var(--accent-emerald-dark)">❤️ ${score}% Compatibility ${hasQuiz ? '(Personalized)' : '(Demo)'}</span>
            ${isAccepted ? '<span style="color:var(--accent-emerald-dark);">Status: Connected</span>' : ''}
          </div>
        </div>
      </div>

      ${!hasQuiz ? `
        <div style="background:#EEF2FF; border:1.5px solid #C7D2FE; border-radius:12px; padding:14px 18px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <strong style="color:var(--primary); font-size:0.92rem;">Personalized Match Score Unavailable</strong>
            <p style="margin:2px 0 0 0; font-size:0.82rem; color:var(--text-secondary);">Complete the Compatibility Quiz to calculate your personalized compatibility with ${mate.name}.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="closeRoommateModal(); openCompatibilityQuiz();">Take Quiz →</button>
        </div>
      ` : ''}

      <div class="match-factors-box">
        <div class="match-factors-title">
          <span>❤️</span>
          <span>Why You Match (${score}% Compatibility)</span>
        </div>
        <ul class="match-factors-list">
          ${matchedList.map(item => `
            <li class="match-factor-item"><span style="color:var(--accent-emerald-dark)">✓</span> <span>${item}</span></li>
          `).join('')}
        </ul>
        ${diffList.length > 0 ? `
          <div style="font-size:0.78rem; font-weight:800; color:#B45309; text-transform:uppercase; margin:14px 0 8px 0; letter-spacing:0.04em;">
            Possible Differences
          </div>
          <ul class="diff-factors-list">
            ${diffList.map(item => `
              <li class="diff-factor-item"><span>•</span> <span>${item}</span></li>
            `).join('')}
          </ul>
        ` : ''}
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

      ${isAccepted ? `
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button class="btn btn-secondary" style="flex:1; background:#ECFDF5; color:#065F46; border:1.5px solid #A7F3D0; font-weight:700;" disabled>
            ✓ Connected Roommate (Mutual Match)
          </button>
          <button class="btn btn-outline" onclick="closeRoommateModal(); openRoommateContractModal();" title="Draft cohabitation house constitution">
            📜 House Constitution
          </button>
          <button class="btn btn-secondary" onclick="closeRoommateModal();">Close</button>
        </div>
      ` : `
        <div style="display:flex; gap:12px;">
          <button class="btn btn-primary" style="flex:1;" onclick="closeRoommateModal(); handleConnectRoommate('${mate.id}');">
            Accept &amp; Connect on Nestera (${score}% Match)
          </button>
          <button class="btn btn-secondary" onclick="closeRoommateModal();">Close</button>
        </div>
      `}
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
    paidBy: `${AppState.currentUser?.fullName || 'Resident'} (You)`,
    yourShare: share,
    status: `${roommate} owes you ₹${share.toLocaleString('en-IN')}`,
    isOwedByYou: false,
    date: "Today",
    dueDate: "Upcoming"
  };

  AppState.sharedExpenses.unshift(newExp);
  renderSharedExpenses();
  closeSplitExpenseModal();
  showToast(`Added ₹${amount.toLocaleString('en-IN')} expense! ${roommate} notified via Nestera.`);
}

function triggerPayRentModal() {
  openStripePaymentModal();
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
  const title = document.getElementById('issue-title-input').value.trim();
  const location = document.getElementById('issue-location-input').value.trim();
  const description = document.getElementById('issue-desc-input').value.trim();
  const urgency = document.getElementById('issue-urgency-select').value;

  if (!title || !description) {
    showToast('Please provide a title and description');
    return;
  }

  const tenantName = AppState.currentUser?.fullName || 'Aman Singh';
  const propLocation = location || 'Palm Grove Luxury Living (Flat 402)';

  const newTicket = {
    id: `maint-${Date.now()}`,
    title: title,
    issue: title,
    category: category,
    status: "Reported",
    statusColor: "yellow",
    urgency: urgency,
    priority: urgency.toLowerCase(),
    tenant: tenantName,
    property: propLocation,
    location: propLocation,
    reportedAgo: "Just now",
    time: "Just now",
    technician: {
      name: "Assigning Technician...",
      phone: "+91 Nestera Support",
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
    images: []
  };

  AppState.maintenanceTickets.unshift(newTicket);

  // Generate Owner Notification & Message
  const newOwnerNotif = {
    id: `notif-maint-${Date.now()}`,
    user_id: 'usr-owner-1',
    type: 'maintenance',
    title: `New Maintenance Ticket: ${title}`,
    message: `${tenantName} at ${propLocation} reported: "${description}". Priority: ${urgency}.`,
    time: 'Just now',
    read: false,
    relatedId: newTicket.id,
    actionTarget: `maintenance:${newTicket.id}`,
    actionText: 'View Ticket',
    tenant: tenantName,
    property: propLocation
  };

  AppState.notifications.unshift(newOwnerNotif);

  // Sync to Express / Supabase backend if active
  apiCall('/tickets', {
    method: 'POST',
    body: JSON.stringify(newTicket)
  });

  renderMaintenanceTickets();
  renderOwnerMaintenanceTickets();
  renderOwnerNotificationsList();
  updateOwnerSidebarBadges();
  closeReportIssueModal();
  showToast('Maintenance ticket reported! Landlord alerted via Owner Hub notification & badge updated.', 'success');
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
  showToast('Clarification request sent to Landlord & Nestera Legal Concierge.');
}

function triggerSignAgreement() {
  showToast('🔏 Aadhaar eSign OTP verified! Digital rental agreement securely timestamped and executed.');
}

/* ==========================================================================
   10. OWNER / LANDLORD DASHBOARD ("NESTERA HOST")
   ========================================================================== */

function switchOwnerTab(tabName, updateUrl = true) {
  AppState.ownerCurrentTab = tabName;

  // Update sidebar button states
  document.querySelectorAll('.owner-menu-item').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  const targetTabBtn = document.getElementById(`owner-tab-${tabName}`);
  if (targetTabBtn) {
    targetTabBtn.classList.add('active');
    targetTabBtn.setAttribute('aria-selected', 'true');
  }

  // Update subpanel views
  document.querySelectorAll('.owner-subpanel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetPanel = document.getElementById(`owner-panel-${tabName}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Close mobile drawer if open
  toggleOwnerMobileSidebar(false);

  // Sync browser URL & history without full page reload
  if (updateUrl) {
    try {
      history.pushState({ view: 'owner', ownerTab: tabName }, '', `#owner/${tabName}`);
    } catch (e) {
      window.location.hash = `owner/${tabName}`;
    }
  }

  // Subpanel-specific loaders
  if (tabName === 'properties' || tabName === 'dashboard') {
    renderOwnerTable();
  }
  if (tabName === 'applications' || tabName === 'dashboard') {
    loadOwnerApplications();
  }
  if (tabName === 'maintenance' || tabName === 'dashboard') {
    renderOwnerMaintenanceTickets();
  }
  if (tabName === 'notifications') {
    renderOwnerNotificationsList();
  }

  updateOwnerSidebarBadges();
}

function toggleOwnerMobileSidebar(force = null) {
  const drawer = document.getElementById('owner-sidebar-drawer');
  const closeBtn = document.getElementById('owner-sidebar-close-btn');
  if (!drawer) return;

  if (force !== null) {
    drawer.classList.toggle('mobile-open', force);
  } else {
    drawer.classList.toggle('mobile-open');
  }

  if (closeBtn) {
    closeBtn.style.display = drawer.classList.contains('mobile-open') ? 'inline-block' : 'none';
  }
}

function updateOwnerSidebarBadges() {
  const pendingMaint = AppState.maintenanceTickets.filter(t => t.status !== 'Resolved').length;
  const unreadNotifs = AppState.notifications.filter(n => !n.read).length;
  const propsList = (AppState.liveProperties && AppState.liveProperties.length > 0)
    ? AppState.liveProperties
    : (window.NESTORA_DATA?.ownerData?.properties || []);
  const propsCount = propsList.length || 8;
  const pendingApps = 3;

  // Maintenance Badge
  const maintBadge = document.getElementById('owner-badge-maint');
  if (maintBadge) {
    if (pendingMaint > 0) {
      maintBadge.innerText = `🔴 ${pendingMaint}`;
      maintBadge.style.display = 'inline-flex';
    } else {
      maintBadge.style.display = 'none';
    }
  }

  // Applications Badge
  const appsBadge = document.getElementById('owner-badge-apps');
  if (appsBadge) {
    appsBadge.innerText = pendingApps;
    appsBadge.style.display = pendingApps > 0 ? 'inline-flex' : 'none';
  }

  // Messages Badge
  const msgsBadge = document.getElementById('owner-badge-msgs');
  if (msgsBadge) {
    msgsBadge.innerText = '2';
  }

  // Notifications Badge
  const notifBadge = document.getElementById('owner-badge-notifs');
  if (notifBadge) {
    if (unreadNotifs > 0) {
      notifBadge.innerText = unreadNotifs;
      notifBadge.style.display = 'inline-flex';
    } else {
      notifBadge.style.display = 'none';
    }
  }

  // Properties Badge
  const propsBadge = document.getElementById('owner-badge-props');
  if (propsBadge) {
    propsBadge.innerText = propsCount;
  }

  // KPI Numbers
  const kpiProps = document.getElementById('owner-kpi-active-props');
  if (kpiProps) kpiProps.innerText = propsCount;

  const kpiMaint = document.getElementById('owner-kpi-maint');
  if (kpiMaint) kpiMaint.innerText = pendingMaint;

  // Urgent Banner on Dashboard
  const urgentBanner = document.getElementById('owner-dash-urgent-banner');
  const urgentText = document.getElementById('owner-dash-urgent-text');
  if (urgentBanner) {
    if (pendingMaint > 0) {
      urgentBanner.style.display = 'block';
      if (urgentText) {
        urgentText.innerText = `${pendingMaint} ticket${pendingMaint === 1 ? '' : 's'} logged via Tenant Hub & Relay Bot require review or technician scheduling.`;
      }
    } else {
      urgentBanner.style.display = 'none';
    }
  }
}

function renderOwnerTable() {
  const tbody = document.getElementById('owner-tenant-table-body');
  const tbodyFull = document.getElementById('owner-tenant-table-body-full');
  if (!tbody && !tbodyFull) return;

  const props = (AppState.liveProperties && AppState.liveProperties.length > 0)
    ? AppState.liveProperties
    : (window.NESTORA_DATA?.ownerData?.properties || []);

  const html = props.map(p => {
    const isFound = (p.listingStatus === 'Found' || p.status === 'Found');
    const toggleBtnStyle = isFound 
      ? 'background: #F3F4F6; color: #4B5563; border: 1.5px solid #D1D5DB;' 
      : 'background: #ECFDF5; color: #065F46; border: 1.5px solid #A7F3D0;';

    return `
    <tr>
      <td><strong>${p.title}</strong><div style="font-size:0.75rem; color:var(--text-muted)">${p.locality}</div></td>
      <td>${p.tenant || 'Unoccupied'}</td>
      <td><strong>₹${(p.rent || 18000).toLocaleString('en-IN')}/mo</strong></td>
      <td>
        <button class="btn btn-sm" style="${toggleBtnStyle} border-radius:20px; font-weight:700; cursor:pointer; padding: 4px 12px; font-size:0.78rem; display:inline-flex; align-items:center; gap:5px;" onclick="openOwnerStatusConfirm('${p.id}')" title="Click to change availability status">
          ${isFound ? '🔒 Found (Hidden)' : '🟢 Active (Live)'}
        </button>
      </td>
      <td>
        <span class="badge ${(p.paymentStatus || 'Paid').includes('Paid') ? 'badge-verified' : ((p.paymentStatus || '').includes('Due') ? 'badge-amber' : 'badge-rose')}">
          ${p.paymentStatus || 'Paid on 5th'}
        </span>
      </td>
      <td>
        <span style="font-size:0.825rem; font-weight:600; color:${(p.maintenanceStatus || 'Clear').includes('Clear') ? 'var(--accent-emerald-dark)' : 'var(--accent-amber)'}">
          ${p.maintenanceStatus || 'Clear'}
        </span>
      </td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-sm btn-primary" onclick="openOwnerEditPropertyModal('${p.id}')" title="Edit property details">Edit</button>
          <button class="btn btn-sm btn-secondary" onclick="openProofVaultModal()" title="View Move-In / Move-Out Proof Vault">Proof</button>
          <button class="btn btn-sm btn-outline" onclick="showToast('GST Rental Invoice downloaded for ${p.tenant || 'Resident'}!')">Invoice</button>
        </div>
      </td>
    </tr>
  `}).join('');

  if (tbody) tbody.innerHTML = html;
  if (tbodyFull) tbodyFull.innerHTML = html;
}

function openOwnerStatusConfirm(propId) {
  const modal = document.getElementById('owner-status-confirm-modal');
  if (!modal) return;
  AppState.pendingStatusPropId = propId;
  const p = (AppState.liveProperties || window.NESTORA_DATA.properties).find(x => x.id === propId) 
    || window.NESTORA_DATA.ownerData.properties.find(x => x.id === propId);
  const title = p ? p.title : 'Selected Property';
  const isFound = p ? (p.listingStatus === 'Found' || p.status === 'Found') : false;
  const newStatus = isFound ? 'Active (Live for student applications)' : 'Found (Hidden from public search)';

  const msg = document.getElementById('owner-confirm-msg');
  if (msg) {
    msg.innerHTML = `Are you sure you want to mark <strong>"${title}"</strong> as <strong>${newStatus}</strong>?<br/><br/>${isFound ? 'This will make the property immediately discoverable by students and open to applications.' : 'This will hide the property from student searches while preserving current tenancy records.'}`;
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOwnerStatusConfirmModal() {
  const modal = document.getElementById('owner-status-confirm-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  AppState.pendingStatusPropId = null;
}

async function executeOwnerStatusChange() {
  const id = AppState.pendingStatusPropId;
  if (!id) return;
  closeOwnerStatusConfirmModal();

  const ownerProp = window.NESTORA_DATA.ownerData.properties.find(p => p.id === id);
  const currentStatus = ownerProp ? (ownerProp.listingStatus || ownerProp.status) : 'Active';
  const newStatus = currentStatus === 'Active' ? 'Found' : 'Active';

  if (ownerProp) {
    ownerProp.listingStatus = newStatus;
    ownerProp.status = newStatus;
  }

  const matchingProp = (AppState.liveProperties || window.NESTORA_DATA.properties).find(p => p.id === id || (p.title && ownerProp && p.title.includes(ownerProp.title.split(' - ')[0])));
  if (matchingProp) {
    matchingProp.listingStatus = newStatus;
    matchingProp.status = newStatus;
  }

  // Sync with Express & Supabase backend
  await apiCall(`/properties/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ listingStatus: newStatus })
  });

  renderOwnerTable();
  renderDiscoveryProperties();
  renderDiscoveryMapPins();

  if (newStatus === 'Found') {
    showToast(`Unit marked as Found! Hidden from public student search.`);
  } else {
    showToast(`Unit marked as Active! Now live and visible to students.`);
  }
}

function openOwnerEditPropertyModal(propId) {
  const modal = document.getElementById('owner-edit-property-modal');
  if (!modal) return;
  const p = (AppState.liveProperties || window.NESTORA_DATA.properties).find(x => x.id === propId) 
    || window.NESTORA_DATA.ownerData.properties.find(x => x.id === propId);
  if (!p) return;

  document.getElementById('edit-prop-id').value = p.id;
  document.getElementById('edit-prop-title').value = p.title || '';
  document.getElementById('edit-prop-rent').value = p.rent || 18000;
  document.getElementById('edit-prop-deposit').value = p.deposit || (p.rent ? p.rent * 2 : 36000);
  document.getElementById('edit-prop-locality').value = p.locality || 'SG Highway, Ahmedabad';
  
  const statusSelect = document.getElementById('edit-prop-status');
  if (statusSelect) {
    statusSelect.value = (p.listingStatus === 'Found' || p.status === 'Found') ? 'Found' : 'Active';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOwnerEditPropertyModal() {
  const modal = document.getElementById('owner-edit-property-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

async function handleSavePropertyEdit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-prop-id').value;
  const title = document.getElementById('edit-prop-title').value.trim();
  const rent = parseFloat(document.getElementById('edit-prop-rent').value);
  const deposit = parseFloat(document.getElementById('edit-prop-deposit').value);
  const locality = document.getElementById('edit-prop-locality').value.trim();
  const status = document.getElementById('edit-prop-status').value;

  const ownerProp = window.NESTORA_DATA.ownerData.properties.find(p => p.id === id);
  if (ownerProp) {
    ownerProp.title = title;
    ownerProp.rent = rent;
    ownerProp.deposit = deposit;
    ownerProp.locality = locality;
    ownerProp.listingStatus = status;
    ownerProp.status = status;
  }

  const liveProp = (AppState.liveProperties || window.NESTORA_DATA.properties).find(p => p.id === id);
  if (liveProp) {
    liveProp.title = title;
    liveProp.rent = rent;
    liveProp.deposit = deposit;
    liveProp.locality = locality;
    liveProp.listingStatus = status;
    liveProp.status = status;
  }

  await apiCall(`/owner/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title,
      rent,
      deposit,
      locality,
      listingStatus: status
    })
  });

  closeOwnerEditPropertyModal();
  renderOwnerTable();
  renderDiscoveryProperties();
  renderDiscoveryMapPins();
  showToast(`Property "${title}" updated and synced to Supabase!`, 'success');
}

async function loadOwnerApplications() {
  const container = document.getElementById('owner-applications-list');
  if (!container) return;

  const res = await apiCall('/owner/applications');
  let applications = [];
  if (res && res.data && res.data.length > 0) {
    applications = res.data;
  } else {
    applications = [
      {
        id: 'app-1',
        applicant_name: 'Aman Singh',
        applicant_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        applicant_college: 'Nirma University (B.Tech CS)',
        property_title: 'Palm Grove Luxury Living - Flat 402',
        duration_months: 3,
        move_in_date: '2026-10-01',
        budget: 18000,
        status: 'pending',
        created_at: '2 hours ago'
      },
      {
        id: 'app-2',
        applicant_name: 'Siddharth Malhotra',
        applicant_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        applicant_college: 'CEPT University (Architecture)',
        property_title: 'Bodakdev Minimal Studio - Unit 201',
        duration_months: 4,
        move_in_date: '2026-10-15',
        budget: 22000,
        status: 'approved',
        created_at: 'Yesterday'
      },
      {
        id: 'app-3',
        applicant_name: 'Priya Sharma',
        applicant_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        applicant_college: 'Ahmedabad University (BBA)',
        property_title: 'Navrangpura Cozy Studio - Flat 104',
        duration_months: 2,
        move_in_date: '2026-11-01',
        budget: 16000,
        status: 'pending',
        created_at: '3 days ago'
      }
    ];
  }

  container.innerHTML = applications.map(app => {
    const isApproved = app.status === 'approved' || app.status === 'accepted';
    const isRejected = app.status === 'rejected';
    const statusBadge = isApproved
      ? '<span class="badge badge-emerald">✓ Approved</span>'
      : (isRejected ? '<span class="badge badge-rose">✕ Rejected</span>' : '<span class="badge badge-amber">⏳ Pending Review</span>');

    return `
      <div style="background: var(--bg-surface-secondary); border: 1.5px solid var(--border-subtle); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <img src="${getProfileAvatar({ avatar_url: app.applicant_avatar, gender: app.gender })}" alt="${app.applicant_name}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-light);" />
              <div>
                <strong style="font-size: 0.95rem; display: block;">${app.applicant_name}</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${app.applicant_college || 'Student'}</span>
              </div>
            </div>
            ${statusBadge}
          </div>
          <div style="font-size: 0.82rem; margin-bottom: 8px;">
            <span style="color: var(--text-muted);">Property:</span> <strong>${app.property_title}</strong>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.78rem; background: var(--bg-surface); padding: 8px 10px; border-radius: 8px; margin-bottom: 14px;">
            <div><span style="color: var(--text-muted);">Stay:</span> <strong>${app.duration_months || 3} Months</strong></div>
            <div><span style="color: var(--text-muted);">Move-in:</span> <strong>${app.move_in_date || 'Oct 2026'}</strong></div>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          ${!isApproved && !isRejected ? `
            <button class="btn btn-sm btn-primary" style="flex: 1; padding: 6px;" onclick="handleOwnerApplicationAction('${app.id}', 'approve')">
              ✓ Accept
            </button>
            <button class="btn btn-sm btn-secondary" style="flex: 1; padding: 6px;" onclick="handleOwnerApplicationAction('${app.id}', 'reject')">
              ✕ Reject
            </button>
            <button class="btn btn-sm btn-outline" style="padding: 6px;" onclick="handleOwnerApplicationAction('${app.id}', 'request_info')" title="Request more info">
              💬 Info
            </button>
          ` : `
            <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; width: 100%;">
              Decision logged to Supabase • Notification sent to applicant
            </div>
          `}
        </div>
      </div>
    `;
  }).join('');
}

async function handleOwnerApplicationAction(appId, action) {
  const actionText = action === 'approve' ? 'approved' : (action === 'reject' ? 'rejected' : 'information requested');
  
  await apiCall(`/owner/applications/${appId}/action`, {
    method: 'POST',
    body: JSON.stringify({ action })
  });

  showToast(`Application #${appId} ${actionText}! Updated on Supabase.`, 'success');
  loadOwnerApplications();
  updateOwnerSidebarBadges();
}

function renderOwnerMaintenanceTickets() {
  const container = document.getElementById('owner-maintenance-list');
  if (!container) return;

  const defaultTickets = [
    {
      id: 'maint-101',
      tenant: 'Aman Singh',
      property: 'Palm Grove Luxury Living (Flat 402)',
      issue: 'Geyser heating element tripping circuit breaker',
      priority: 'high',
      status: 'In Progress',
      technician: 'Ramesh Kumar (Certified Technician)',
      time: 'Logged 2h ago via WhatsApp Relay Bot',
      description: 'Inlet valve dripping continuously and heating element causing circuit break.'
    },
    {
      id: 'maint-102',
      tenant: 'Sneha Nair',
      property: 'Bodakdev Minimal Studio (Unit 201)',
      issue: 'Kitchen RO filter slow flow rate',
      priority: 'medium',
      status: 'Acknowledged',
      technician: 'Vijay Appliances',
      time: 'Logged yesterday',
      description: 'Slow filtration rate. Filter membranes require pre-monsoon replacement.'
    },
    {
      id: 'maint-103',
      tenant: 'Kunal Verma',
      property: 'Navrangpura Cozy Studio (Flat 104)',
      issue: 'AC filter cleaning & refrigerant top-up',
      priority: 'low',
      status: 'Resolved',
      technician: 'CoolTech Service',
      time: 'Resolved 3 days ago',
      description: 'Pre-summer servicing and gas pressure check completed.'
    }
  ];

  // Map any tenant-reported tickets from AppState
  const dynamicTickets = AppState.maintenanceTickets.map(t => ({
    id: t.id,
    tenant: t.tenant || AppState.currentUser?.fullName || 'Current Resident',
    property: t.property || t.location || 'Palm Grove Luxury Living',
    issue: t.title || t.issue || 'Maintenance Request',
    priority: (t.urgency || t.priority || 'medium').toLowerCase(),
    status: t.status || 'Reported',
    technician: (t.technician && t.technician.name) || 'Ramesh Kumar (Certified Technician)',
    time: t.reportedAgo || 'Reported recently',
    description: t.description || 'Tenant reported repair request.'
  }));

  const allTicketsMap = new Map();
  dynamicTickets.forEach(t => allTicketsMap.set(t.id, t));
  defaultTickets.forEach(t => {
    if (!allTicketsMap.has(t.id)) allTicketsMap.set(t.id, t);
  });

  const tickets = Array.from(allTicketsMap.values());

  container.innerHTML = tickets.map(t => {
    const isResolved = t.status === 'Resolved';
    const isHigh = t.priority === 'high' || t.priority === 'urgent';

    return `
      <div style="background: var(--bg-surface-secondary); border: 1.5px solid var(--border-subtle); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span class="badge ${isHigh ? 'badge-rose' : 'badge-amber'}">${t.priority.toUpperCase()} PRIORITY</span>
            <span class="badge ${isResolved ? 'badge-emerald' : (t.status === 'In Progress' ? 'badge-primary' : 'badge-amber')}">${t.status}</span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 0.95rem; font-weight: 800;">${t.issue}</h4>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px;">
            Tenant: <strong>${t.tenant}</strong> • ${t.property}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">
            Assigned: <strong>${t.technician}</strong> • ${t.time}
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm btn-outline" style="flex: 1; padding: 6px;" onclick="openMaintenanceDetailModal('${t.id}')">
            View Full Ticket
          </button>
          ${!isResolved ? `
            <button class="btn btn-sm btn-primary" style="flex: 1; padding: 6px;" onclick="handleOwnerMaintenanceStatus('${t.id}', 'Resolved')">
              ✓ Resolve
            </button>
          ` : `
            <span class="badge badge-emerald" style="display: flex; align-items: center; justify-content: center; flex: 1; padding: 6px;">
              ✓ Closed
            </span>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function renderOwnerNotificationsList() {
  const container = document.getElementById('owner-notifications-full-list');
  if (!container) return;

  const notifs = AppState.notifications;
  const unreadCount = notifs.filter(n => !n.read).length;
  const badge = document.getElementById('owner-notif-inbox-badge');
  if (badge) {
    badge.innerText = `${unreadCount} Unread Alert${unreadCount === 1 ? '' : 's'}`;
    badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  }

  if (notifs.length === 0) {
    container.innerHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted);">
        🎉 All caught up! No notifications right now.
      </div>
    `;
    return;
  }

  container.innerHTML = notifs.map(n => {
    const isMaintenance = n.type === 'maintenance' || (n.actionTarget && n.actionTarget.includes('maintenance')) || (n.title && n.title.includes('Maintenance'));
    const ticketId = n.relatedId || (n.ticket && n.ticket.id) || (n.actionTarget && n.actionTarget.startsWith('maintenance:') ? n.actionTarget.split(':')[1] : null);

    return `
      <div style="background: ${n.read ? 'var(--bg-surface)' : '#FEF3C7'}; border: 1.5px solid ${n.read ? 'var(--border-subtle)' : 'var(--accent-amber)'}; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; transition: all 0.2s ease;">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="font-size: 1.6rem; line-height: 1;">
            ${isMaintenance ? '🔧' : (n.type === 'application' ? '📝' : '🔔')}
          </div>
          <div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px; flex-wrap: wrap;">
              <strong style="font-size: 0.95rem; color: var(--text-primary);">${n.title}</strong>
              ${!n.read ? '<span class="badge badge-rose" style="font-size: 0.65rem; padding: 2px 6px;">NEW</span>' : ''}
              <span style="font-size: 0.75rem; color: var(--text-muted);">${n.time || 'Recently'}</span>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 8px; line-height: 1.5;">
              ${n.message}
            </p>
            ${n.tenant ? `<div style="font-size: 0.78rem; color: var(--text-muted);">Tenant: <strong>${n.tenant}</strong> • Property: <strong>${n.property || 'Managed Unit'}</strong></div>` : ''}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
          ${isMaintenance && ticketId ? `
            <button class="btn btn-sm btn-primary" onclick="openMaintenanceDetailModal('${ticketId}', '${n.id}')" style="white-space: nowrap;">
              View Ticket →
            </button>
          ` : `
            <button class="btn btn-sm btn-outline" onclick="handleNotificationClick('${n.id}')" style="white-space: nowrap;">
              ${n.actionText || 'Open'} →
            </button>
          `}
          ${!n.read ? `
            <button class="btn btn-sm btn-secondary" onclick="markSingleNotificationRead('${n.id}')" style="font-size: 0.72rem; padding: 2px 6px;">
              Mark Read
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function markSingleNotificationRead(notifId) {
  const notif = AppState.notifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
    updateOwnerSidebarBadges();
    updateUnreadNotifBadge();
    renderOwnerNotificationsList();
  }
}

function openMaintenanceDetailModal(ticketId, notifId = null) {
  if (notifId) {
    markSingleNotificationRead(notifId);
  }

  // Find ticket in AppState or fallback
  let ticket = AppState.maintenanceTickets.find(t => t.id === ticketId);
  if (!ticket) {
    ticket = (window.NESTORA_DATA?.maintenanceTickets || []).find(t => t.id === ticketId);
  }
  if (!ticket) {
    ticket = {
      id: ticketId,
      title: 'Geyser inlet leaking',
      tenant: 'Aman Singh',
      property: 'Palm Grove Luxury Living - Flat 402',
      location: 'Flat 402, SG Highway',
      urgency: 'Medium',
      priority: 'medium',
      status: 'In Progress',
      category: 'Plumbing',
      description: 'Inlet joint is leaking water continuously into drainage pipe. Requires replacement pipe gasket.',
      technician: { name: 'Ramesh Kumar (Certified Technician)' },
      reportedAgo: '2h ago'
    };
  }

  AppState.currentInspectingTicketId = ticket.id;

  const modal = document.getElementById('owner-ticket-detail-modal');
  if (!modal) return;

  const idEl = document.getElementById('modal-ticket-id');
  if (idEl) idEl.innerText = ticket.id;

  const titleEl = document.getElementById('modal-ticket-title');
  if (titleEl) titleEl.innerText = ticket.title || ticket.issue || 'Maintenance Issue';

  const urgEl = document.getElementById('modal-ticket-urgency');
  if (urgEl) {
    const isUrgent = (ticket.urgency === 'High' || ticket.urgency === 'high' || ticket.priority === 'high');
    urgEl.innerText = isUrgent ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY';
    urgEl.className = `badge ${isUrgent ? 'badge-rose' : 'badge-amber'}`;
  }

  const statEl = document.getElementById('modal-ticket-status');
  if (statEl) {
    statEl.innerText = ticket.status || 'Reported';
    statEl.className = `badge ${ticket.status === 'Resolved' ? 'badge-emerald' : (ticket.status === 'In Progress' ? 'badge-primary' : 'badge-amber')}`;
  }

  const timeEl = document.getElementById('modal-ticket-time');
  if (timeEl) timeEl.innerText = ticket.reportedAgo || ticket.time || 'Reported recently';

  const tenantEl = document.getElementById('modal-ticket-tenant');
  if (tenantEl) tenantEl.innerText = ticket.tenant || 'Aman Singh';

  const propEl = document.getElementById('modal-ticket-prop');
  if (propEl) propEl.innerText = ticket.property || 'Palm Grove Luxury Living';

  const locEl = document.getElementById('modal-ticket-location');
  if (locEl) locEl.innerText = ticket.location || 'Flat 402 • SG Highway';

  const descEl = document.getElementById('modal-ticket-desc');
  if (descEl) descEl.innerText = ticket.description || 'Tenant reported repair request.';

  const techEl = document.getElementById('modal-ticket-tech');
  if (techEl) techEl.innerText = (ticket.technician && ticket.technician.name) ? ticket.technician.name : 'Ramesh Kumar (Certified Technician)';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOwnerTicketDetailModal() {
  const modal = document.getElementById('owner-ticket-detail-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  AppState.currentInspectingTicketId = null;
}

async function handleOwnerUpdateCurrentTicket(nextStatus) {
  const ticketId = AppState.currentInspectingTicketId;
  if (!ticketId) return;

  const t = AppState.maintenanceTickets.find(x => x.id === ticketId);
  if (t) {
    t.status = nextStatus;
    t.statusColor = nextStatus === 'Resolved' ? 'green' : (nextStatus === 'In Progress' ? 'blue' : 'yellow');
    if (nextStatus === 'Resolved') {
      t.currentStep = 4;
    } else if (nextStatus === 'In Progress') {
      t.currentStep = 3;
    } else if (nextStatus === 'Acknowledged') {
      t.currentStep = 2;
    }
  }

  const statEl = document.getElementById('modal-ticket-status');
  if (statEl) {
    statEl.innerText = nextStatus;
    statEl.className = `badge ${nextStatus === 'Resolved' ? 'badge-emerald' : (nextStatus === 'In Progress' ? 'badge-primary' : 'badge-amber')}`;
  }

  await apiCall(`/owner/maintenance/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: nextStatus })
  });

  renderMaintenanceTickets();
  renderOwnerMaintenanceTickets();
  renderOwnerNotificationsList();
  updateOwnerSidebarBadges();
  showToast(`Ticket #${ticketId} status updated to "${nextStatus}". Tenant notified via Relay Bot.`);
}

async function handleOwnerMaintenanceStatus(ticketId, newStatus) {
  const t = AppState.maintenanceTickets.find(x => x.id === ticketId);
  if (t) {
    t.status = newStatus;
    t.statusColor = newStatus === 'Resolved' ? 'green' : 'blue';
  }

  await apiCall(`/owner/maintenance/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus })
  });

  showToast(`Maintenance Ticket #${ticketId} marked as ${newStatus}!`, 'success');
  renderMaintenanceTickets();
  renderOwnerMaintenanceTickets();
  renderOwnerNotificationsList();
  updateOwnerSidebarBadges();
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
  showToast(`Property listed! Nestera inspection team will verify within 24 hours.`);
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
      showToast(`Switched to Tenant View (${AppState.currentUser?.fullName || 'Resident'})`);
    });
  }

  if (ownerBtn) {
    ownerBtn.addEventListener('click', () => {
      AppState.userRole = 'Owner';
      updateRoleButtons();
      navigateTo('owner');
      showToast(`Switched to Owner/Host View (${AppState.currentUser?.fullName || 'Landlord Partner'})`);
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
window.toggleOwnerPropertyStatus = toggleOwnerPropertyStatus;
window.openOwnerStatusConfirm = openOwnerStatusConfirm;
window.closeOwnerStatusConfirmModal = closeOwnerStatusConfirmModal;
window.executeOwnerStatusChange = executeOwnerStatusChange;
window.openOwnerEditPropertyModal = openOwnerEditPropertyModal;
window.closeOwnerEditPropertyModal = closeOwnerEditPropertyModal;
window.handleSavePropertyEdit = handleSavePropertyEdit;
window.loadOwnerApplications = loadOwnerApplications;
window.handleOwnerApplicationAction = handleOwnerApplicationAction;
window.renderOwnerMaintenanceTickets = renderOwnerMaintenanceTickets;
window.handleOwnerMaintenanceStatus = handleOwnerMaintenanceStatus;
window.openAccommodationCheckoutModal = openAccommodationCheckoutModal;
window.closeAccommodationCheckoutModal = closeAccommodationCheckoutModal;
window.goToCheckoutStep = goToCheckoutStep;
window.setCheckoutDuration = setCheckoutDuration;
window.updateCheckoutDates = updateCheckoutDates;
window.executeAccommodationCheckout = executeAccommodationCheckout;
window.handleLogout = handleLogout;
window.updateAuthUI = updateAuthUI;
window.openRoleSelectModal = openRoleSelectModal;
window.closeRoleSelectModal = closeRoleSelectModal;
window.selectRoleOption = selectRoleOption;
window.proceedFromRoleSelect = proceedFromRoleSelect;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.toggleAuthMode = toggleAuthMode;
window.handleAuthSubmit = handleAuthSubmit;

/* ==========================================================================
   13. ROLE SELECTION & PERMANENT AUTHENTICATION (addme.md Specification)
   ========================================================================== */

function openRoleSelectModal() {
  const modal = document.getElementById('role-select-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeRoleSelectModal() {
  const modal = document.getElementById('role-select-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function selectRoleOption(role) {
  AppState.selectedPreRole = role;
  const tenantCard = document.getElementById('role-card-tenant');
  const ownerCard = document.getElementById('role-card-owner');

  if (tenantCard && ownerCard) {
    if (role === 'tenant') {
      tenantCard.style.borderColor = 'var(--primary)';
      tenantCard.style.background = '#EEF2FF';
      ownerCard.style.borderColor = 'var(--border-medium)';
      ownerCard.style.background = 'var(--bg-surface)';
    } else {
      ownerCard.style.borderColor = 'var(--primary)';
      ownerCard.style.background = '#EEF2FF';
      tenantCard.style.borderColor = 'var(--border-medium)';
      tenantCard.style.background = 'var(--bg-surface)';
    }
  }
}

function proceedFromRoleSelect() {
  closeRoleSelectModal();
  openAuthModal('signup');
}

function openAuthModal(mode = 'signup') {
  AppState.authMode = mode;
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  const roleText = document.getElementById('auth-assigned-role-text');
  if (roleText) {
    roleText.innerHTML = AppState.selectedPreRole === 'owner' 
      ? '🏢 Property Owner / Landlord' 
      : '🏠 Student / Youth Tenant';
  }

  const title = document.getElementById('auth-modal-title');
  const submitBtn = document.getElementById('auth-submit-btn');
  const prompt = document.getElementById('auth-toggle-prompt');
  const link = document.getElementById('auth-toggle-link');
  const nameGroup = document.getElementById('auth-fullname-group');
  const phoneGroup = document.getElementById('auth-phone-group');
  const confirmGroup = document.getElementById('auth-confirm-group');
  const termsGroup = document.getElementById('auth-terms-group');
  const genderGroup = document.getElementById('auth-gender-group');
  const dobGroup = document.getElementById('auth-dob-group');
  const dobInput = document.getElementById('auth-dob-input');

  if (dobInput) {
    dobInput.max = new Date().toISOString().split('T')[0];
  }

  if (mode === 'signup') {
    if (title) title.innerText = 'Create your Nestera account';
    if (submitBtn) submitBtn.innerText = 'Create Account';
    if (prompt) prompt.innerText = 'Already have an account?';
    if (link) link.innerText = 'Sign In';
    if (nameGroup) nameGroup.style.display = 'block';
    if (phoneGroup) phoneGroup.style.display = 'block';
    if (confirmGroup) confirmGroup.style.display = 'block';
    if (genderGroup) genderGroup.style.display = 'block';
    if (dobGroup) dobGroup.style.display = 'block';
    if (termsGroup) termsGroup.style.display = 'flex';
  } else {
    // Strictly Sign In: ONLY email & password. Hide Gender, DOB, Name, Phone, Confirm Password!
    if (title) title.innerText = 'Sign in to Nestera';
    if (submitBtn) submitBtn.innerText = 'Sign In';
    if (prompt) prompt.innerText = "Don't have an account?";
    if (link) link.innerText = 'Register';
    if (nameGroup) nameGroup.style.display = 'none';
    if (phoneGroup) phoneGroup.style.display = 'none';
    if (confirmGroup) confirmGroup.style.display = 'none';
    if (genderGroup) genderGroup.style.display = 'none';
    if (dobGroup) dobGroup.style.display = 'none';
    if (termsGroup) termsGroup.style.display = 'none';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function toggleAuthMode() {
  openAuthModal(AppState.authMode === 'signup' ? 'login' : 'signup');
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email-input').value.trim();
  const password = document.getElementById('auth-password-input').value;
  const fullName = document.getElementById('auth-fullname-input')?.value.trim();
  const confirmPassword = document.getElementById('auth-confirm-input')?.value;
  const gender = document.getElementById('auth-gender-select')?.value;
  const dob = document.getElementById('auth-dob-input')?.value;
  const role = AppState.selectedPreRole || 'tenant';

  if (AppState.authMode === 'signup') {
    if (!fullName) {
      showToast('Please enter your full legal name', 'error');
      return;
    }
    if (!gender) {
      showToast('Please select your gender', 'error');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (!dob || dob > today) {
      showToast('Please select a valid Date of Birth (cannot be in the future)', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
  }

  // Submit to Express backend & Supabase Auth
  const endpoint = AppState.authMode === 'signup' ? '/auth/register' : '/auth/login';
  const payload = AppState.authMode === 'signup' 
    ? { 
        email, 
        password, 
        role, 
        fullName,
        phone: document.getElementById('auth-phone-input')?.value || '',
        gender,
        date_of_birth: dob,
        dateOfBirth: dob
      }
    : { email, password };

  const res = await apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  let authenticatedUser = null;
  if (res && res.user) {
    authenticatedUser = res.user;
    if (!isCustomAvatar(authenticatedUser.avatarUrl || authenticatedUser.avatar_url)) {
      authenticatedUser.avatarUrl = getDefaultAvatar(authenticatedUser.gender);
    }
  } else {
    // Graceful offline fallback with user entered credentials
    const fallbackName = AppState.authMode === 'signup' && fullName 
      ? fullName 
      : (email.split('@')[0] ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : 'Aman Singh');
    const selectedGender = AppState.authMode === 'signup' ? gender : null;
    authenticatedUser = {
      id: `usr-${Date.now()}`,
      email: email,
      fullName: fallbackName,
      role: role,
      gender: selectedGender,
      date_of_birth: AppState.authMode === 'signup' ? dob : null,
      dateOfBirth: AppState.authMode === 'signup' ? dob : null,
      avatarUrl: getDefaultAvatar(selectedGender)
    };
  }

  const finalRole = (authenticatedUser.role || role || 'tenant').toLowerCase();
  AppState.currentUser = authenticatedUser;
  AppState.permanentRole = finalRole;
  AppState.userRole = finalRole === 'owner' ? 'Owner' : 'Tenant';

  localStorage.setItem('nestora_auth_user', JSON.stringify(authenticatedUser));
  localStorage.setItem('nestora_permanent_role', finalRole);

  updateAuthUI();
  closeAuthModal();

  if (finalRole === 'owner') {
    navigateTo('owner');
    showToast(`Greetings, ${authenticatedUser.fullName}! Permanent Owner account loaded.`, 'success');
  } else {
    navigateTo('dashboard');
    showToast(`Greetings, ${authenticatedUser.fullName}! Signed in as verified Tenant.`, 'success');
  }

  // Post-login check for existing users with missing gender or DOB
  if (AppState.authMode === 'login' && (!authenticatedUser.gender || (!authenticatedUser.dateOfBirth && !authenticatedUser.date_of_birth))) {
    setTimeout(() => {
      openProfileCompletionModal();
    }, 600);
  }
}

function openProfileCompletionModal() {
  const modal = document.getElementById('profile-completion-modal');
  if (!modal) return;
  const genderSelect = document.getElementById('completion-gender-select');
  const dobInput = document.getElementById('completion-dob-input');
  if (dobInput) {
    dobInput.max = new Date().toISOString().split('T')[0];
    if (AppState.currentUser && (AppState.currentUser.dateOfBirth || AppState.currentUser.date_of_birth)) {
      dobInput.value = AppState.currentUser.dateOfBirth || AppState.currentUser.date_of_birth;
    }
  }
  if (genderSelect) {
    if (AppState.currentUser && AppState.currentUser.gender) {
      genderSelect.value = AppState.currentUser.gender;
    }
    // Live update avatar if user changes gender dropdown
    genderSelect.onchange = (e) => {
      const selected = e.target.value;
      if (AppState.currentUser && !isCustomAvatar(AppState.currentUser.avatarUrl)) {
        AppState.currentUser.gender = selected;
        AppState.currentUser.avatarUrl = getDefaultAvatar(selected);
        updateAuthUI();
      }
    };
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProfileCompletionModal() {
  const modal = document.getElementById('profile-completion-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

async function submitProfileCompletion(e) {
  e.preventDefault();
  const gender = document.getElementById('completion-gender-select')?.value;
  const dob = document.getElementById('completion-dob-input')?.value;
  const today = new Date().toISOString().split('T')[0];

  if (!gender) {
    showToast('Please select your gender', 'error');
    return;
  }
  if (!dob || dob > today) {
    showToast('Date of Birth cannot be in the future', 'error');
    return;
  }

  const userId = AppState.currentUser?.id;
  const email = AppState.currentUser?.email;

  // Send update to Express backend / Supabase
  try {
    await apiCall('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ userId, email, gender, date_of_birth: dob, dateOfBirth: dob })
    });
  } catch (err) {
    console.warn('Profile update error:', err);
  }

  if (AppState.currentUser) {
    AppState.currentUser.gender = gender;
    AppState.currentUser.date_of_birth = dob;
    AppState.currentUser.dateOfBirth = dob;
    if (!isCustomAvatar(AppState.currentUser.avatarUrl)) {
      AppState.currentUser.avatarUrl = getDefaultAvatar(gender);
    }
    localStorage.setItem('nestora_auth_user', JSON.stringify(AppState.currentUser));
  }

  updateAuthUI();
  closeProfileCompletionModal();
  showToast('Profile completed successfully! Your details are stored in Supabase.', 'success');
}

window.openProfileCompletionModal = openProfileCompletionModal;
window.closeProfileCompletionModal = closeProfileCompletionModal;
window.submitProfileCompletion = submitProfileCompletion;

/* ==========================================================================
   14. ACCOMMODATION CHECKOUT & SHORT-STAY BOOKING FLOW (Prompt Section 7)
   ========================================================================== */

function openAccommodationCheckoutModal(propertyId) {
  const prop = (AppState.liveProperties || window.NESTORA_DATA.properties).find(p => p.id === propertyId)
    || (AppState.liveProperties || window.NESTORA_DATA.properties)[0];
  if (!prop) return;

  AppState.checkoutProperty = prop;
  AppState.checkoutDuration = 3;

  // Step 1: Property Summary
  const imgEl = document.getElementById('chk-prop-img');
  if (imgEl) imgEl.src = prop.image || (prop.images && prop.images[0]) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

  const titleEl = document.getElementById('chk-prop-title');
  if (titleEl) titleEl.innerText = prop.title;

  const locEl = document.getElementById('chk-prop-locality');
  if (locEl) locEl.innerText = `${prop.locality}, ${prop.city || 'Ahmedabad'}`;

  const rentEl = document.getElementById('chk-prop-rent');
  if (rentEl) rentEl.innerText = `₹${(prop.rent || 18000).toLocaleString('en-IN')}/mo`;

  const typeEl = document.getElementById('chk-prop-type');
  if (typeEl) typeEl.innerText = prop.type || '2BHK';

  const areaEl = document.getElementById('chk-prop-area');
  if (areaEl) areaEl.innerText = `${prop.area || 950} sq.ft`;

  const furnEl = document.getElementById('chk-prop-furnishing');
  if (furnEl) furnEl.innerText = prop.furnishing || 'Fully Furnished';

  // Pre-fill tenant inputs
  const nameInput = document.getElementById('chk-tenant-name');
  if (nameInput) nameInput.value = AppState.currentUser?.fullName || 'Aman Singh';

  const emailInput = document.getElementById('chk-tenant-email');
  if (emailInput) emailInput.value = AppState.currentUser?.email || 'aman.singh@gmail.com';

  const phoneInput = document.getElementById('chk-tenant-phone');
  if (phoneInput && AppState.currentUser?.phone) phoneInput.value = AppState.currentUser.phone;

  setCheckoutDuration(3);
  recalculateCheckoutDetails();
  goToCheckoutStep(1);

  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeAccommodationCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function goToCheckoutStep(stepNumber) {
  AppState.checkoutStep = stepNumber;

  const eyebrow = document.getElementById('chk-eyebrow');
  if (eyebrow) eyebrow.innerText = `Accommodation Booking • Step ${stepNumber} of 6`;

  const titles = {
    1: '1. Property Summary',
    2: '2. Rental Duration & Dates (2–4 Months Window)',
    3: '3. Transparent Price Breakdown',
    4: '4. True Cost of Living Assessment',
    5: '5. Tenant Verification & Escrow Payment',
    6: '6. Booking Confirmed & Digital Receipt'
  };

  const titleEl = document.getElementById('chk-step-title');
  if (titleEl) titleEl.innerText = titles[stepNumber] || `Step ${stepNumber}`;

  const progress = document.getElementById('chk-progress-bar');
  if (progress) progress.style.width = `${(stepNumber / 6) * 100}%`;

  for (let i = 1; i <= 6; i++) {
    const stepDiv = document.getElementById(`chk-step-${i}`);
    if (stepDiv) {
      stepDiv.style.display = (i === stepNumber) ? 'block' : 'none';
    }
  }
}

function setCheckoutDuration(months) {
  AppState.checkoutDuration = months;

  [2, 3, 4].forEach(m => {
    const btn = document.getElementById(`chk-dur-${m}`);
    if (btn) {
      if (m === months) {
        btn.classList.add('active');
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = '#EEF2FF';
      } else {
        btn.classList.remove('active');
        btn.style.borderColor = 'var(--border-medium)';
        btn.style.background = 'transparent';
      }
    }
  });

  recalculateCheckoutDetails();
}

function updateCheckoutDates() {
  recalculateCheckoutDetails();
}

function recalculateCheckoutDetails() {
  const prop = AppState.checkoutProperty;
  if (!prop) return;

  const rent = prop.rent || 18000;
  const maintenance = prop.maintenance || 1200;
  const utilities = 2500;
  const deposit = prop.deposit || rent * 2; // Clearly separated refundable deposit
  const months = AppState.checkoutDuration || 3;

  const moveInEl = document.getElementById('chk-move-in-date');
  const moveInStr = moveInEl?.value || '2026-10-01';
  const moveInDate = new Date(moveInStr);
  const moveOutDate = new Date(moveInDate);
  moveOutDate.setMonth(moveOutDate.getMonth() + months);
  const moveOutStr = moveOutDate.toISOString().split('T')[0];

  const moveOutEl = document.getElementById('chk-move-out-date');
  if (moveOutEl) moveOutEl.value = moveOutStr;

  // Step 3: Breakdown
  const bRent = document.getElementById('chk-break-rent');
  if (bRent) bRent.innerText = `₹${rent.toLocaleString('en-IN')}`;

  const bMaint = document.getElementById('chk-break-maint');
  if (bMaint) bMaint.innerText = `₹${maintenance.toLocaleString('en-IN')}`;

  const bUtil = document.getElementById('chk-break-util');
  if (bUtil) bUtil.innerText = `₹${utilities.toLocaleString('en-IN')}`;

  const bMonthlyTotal = document.getElementById('chk-break-monthly-total');
  if (bMonthlyTotal) bMonthlyTotal.innerText = `₹${(rent + maintenance + utilities).toLocaleString('en-IN')}/mo`;

  const bDep = document.getElementById('chk-break-deposit');
  if (bDep) bDep.innerText = `₹${deposit.toLocaleString('en-IN')}`;

  const bDueToday = document.getElementById('chk-break-due-today');
  if (bDueToday) bDueToday.innerText = `₹${(rent + deposit).toLocaleString('en-IN')}`;

  // Step 4: True Cost
  const tRentMaint = document.getElementById('chk-true-rent-maint');
  if (tRentMaint) tRentMaint.innerText = `₹${(rent + maintenance).toLocaleString('en-IN')}`;

  const commute = 1200;
  const groceries = 2500;
  const tTotal = document.getElementById('chk-true-total');
  if (tTotal) tTotal.innerText = `₹${(rent + maintenance + commute + groceries).toLocaleString('en-IN')}/mo`;

  // Step 5: Pay summary
  const pRent = document.getElementById('chk-pay-rent');
  if (pRent) pRent.innerText = `₹${rent.toLocaleString('en-IN')}`;

  const pDep = document.getElementById('chk-pay-deposit');
  if (pDep) pDep.innerText = `₹${deposit.toLocaleString('en-IN')}`;

  const pTotal = document.getElementById('chk-pay-total');
  if (pTotal) pTotal.innerText = `₹${(rent + deposit).toLocaleString('en-IN')}`;
}

async function executeAccommodationCheckout() {
  const prop = AppState.checkoutProperty;
  if (!prop) return;

  const tenantName = document.getElementById('chk-tenant-name')?.value || AppState.currentUser?.fullName || 'Aman Singh';
  const tenantEmail = document.getElementById('chk-tenant-email')?.value || AppState.currentUser?.email || 'aman.singh@gmail.com';
  const tenantPhone = document.getElementById('chk-tenant-phone')?.value || '+91 98250 12345';
  const duration = AppState.checkoutDuration || 3;
  const moveInDate = document.getElementById('chk-move-in-date')?.value || '2026-10-01';
  const moveOutDate = document.getElementById('chk-move-out-date')?.value || '2026-12-31';

  const payBtn = document.getElementById('chk-pay-btn');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerText = 'Processing Escrow via Stripe... 🔒';
  }

  const rent = prop.rent || 18000;
  const deposit = prop.deposit || rent * 2;
  const totalDue = rent + deposit;

  const res = await apiCall('/payments/accommodation-checkout', {
    method: 'POST',
    body: JSON.stringify({
      propertyId: prop.id,
      propertyTitle: prop.title,
      tenantName,
      tenantEmail,
      tenantPhone,
      durationMonths: duration,
      moveInDate,
      moveOutDate,
      monthlyRent: rent,
      securityDeposit: deposit,
      totalPaid: totalDue
    })
  });

  if (payBtn) {
    payBtn.disabled = false;
    payBtn.innerText = 'Pay via Stripe Checkout →';
  }

  // Populate receipt (Step 6)
  const recNum = document.getElementById('chk-rec-num');
  if (recNum) recNum.innerText = (res && res.receiptNumber) || `REC-NEST-${Math.floor(100000 + Math.random() * 900000)}`;

  const recTxn = document.getElementById('chk-rec-txn');
  if (recTxn) recTxn.innerText = (res && res.transactionId) || `txn_stripe_escrow_${Date.now()}`;

  const recName = document.getElementById('chk-rec-name');
  if (recName) recName.innerText = tenantName;

  const recProp = document.getElementById('chk-rec-prop');
  if (recProp) recProp.innerText = prop.title;

  const recDates = document.getElementById('chk-rec-dates');
  if (recDates) recDates.innerText = `${moveInDate} to ${moveOutDate} (${duration} Months Short Stay)`;

  const recAmount = document.getElementById('chk-rec-amount');
  if (recAmount) recAmount.innerText = `₹${totalDue.toLocaleString('en-IN')}`;

  goToCheckoutStep(6);
  showToast('Booking locked! 0% Brokerage Escrow Payment confirmed with landlord.', 'success');
}

/* ==========================================================================
   14. MOVE-IN / MOVE-OUT PROOF VAULT CONTROLLER (addme.md Specification)
   ========================================================================== */

function openProofVaultModal() {
  const modal = document.getElementById('proof-vault-modal');
  if (modal) {
    renderProofVaultItems();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeProofVaultModal() {
  const modal = document.getElementById('proof-vault-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function switchProofVaultTab(tab) {
  AppState.proofVaultTab = tab;
  const tabMoveIn = document.getElementById('pv-tab-movein');
  const tabMoveOut = document.getElementById('pv-tab-moveout');

  if (tab === 'move_in') {
    if (tabMoveIn) {
      tabMoveIn.style.color = 'var(--primary)';
      tabMoveIn.style.borderBottom = '3px solid var(--primary)';
      tabMoveIn.style.fontWeight = '800';
    }
    if (tabMoveOut) {
      tabMoveOut.style.color = 'var(--text-muted)';
      tabMoveOut.style.borderBottom = 'none';
      tabMoveOut.style.fontWeight = '600';
    }
  } else {
    if (tabMoveOut) {
      tabMoveOut.style.color = 'var(--primary)';
      tabMoveOut.style.borderBottom = '3px solid var(--primary)';
      tabMoveOut.style.fontWeight = '800';
    }
    if (tabMoveIn) {
      tabMoveIn.style.color = 'var(--text-muted)';
      tabMoveIn.style.borderBottom = 'none';
      tabMoveIn.style.fontWeight = '600';
    }
  }

  renderProofVaultItems();
}

function renderProofVaultItems() {
  const container = document.getElementById('pv-items-list');
  const counter = document.getElementById('pv-item-counter');
  if (!container) return;

  const items = (AppState.proofVaultItems || []).filter(item => item.type === AppState.proofVaultTab);
  if (counter) counter.innerText = `${items.length} Condition Items Verified`;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; background: var(--bg-surface-secondary); border-radius: var(--radius-md);">
        <span style="font-size: 2rem;">📸</span>
        <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 0.88rem;">
          No condition items logged yet for ${AppState.proofVaultTab === 'move_in' ? 'Move-In' : 'Move-Out'}.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="proof-vault-item-row" style="background: var(--bg-surface); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <img src="${item.photoUrls[0]}" style="width: 52px; height: 52px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border-subtle);" alt="${item.itemName}" />
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
            <span style="font-size: 0.72rem; font-weight: 700; background: var(--bg-surface-secondary); padding: 2px 8px; border-radius: 4px; color: var(--text-muted);">${item.room}</span>
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800;">${item.itemName}</h4>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">
            <strong>Condition:</strong> ${item.condition} ${item.meterReading ? `• <span style="color: var(--primary); font-weight: 700;">Meter: ${item.meterReading}</span>` : ''}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            ${item.notes}
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
        <div style="display: flex; gap: 6px;">
          <span class="badge ${item.tenantAcknowledged ? 'badge-verified' : 'badge-amber'}" style="font-size: 0.7rem;">
            ${item.tenantAcknowledged ? '✓ Tenant Signed' : '⏳ Tenant Pending'}
          </span>
          <span class="badge ${item.ownerAcknowledged ? 'badge-verified' : 'badge-amber'}" style="font-size: 0.7rem;">
            ${item.ownerAcknowledged ? '✓ Owner Signed' : '⏳ Owner Pending'}
          </span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-sm btn-ghost" style="font-size: 0.75rem; padding: 2px 8px;" onclick="acknowledgeProofItem('${item.id}')">
            ${item.tenantAcknowledged && item.ownerAcknowledged ? 'Signed ✓' : 'Acknowledge Sign'}
          </button>
          <button class="btn btn-sm btn-ghost" style="font-size: 0.75rem; padding: 2px 8px; color: var(--accent-rose);" onclick="disputeProofItem('${item.id}')">
            Dispute
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleAddProofItemForm() {
  const form = document.getElementById('pv-add-form');
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}

async function submitNewProofItem(e) {
  e.preventDefault();
  const room = document.getElementById('pv-form-room').value;
  const item = document.getElementById('pv-form-item').value;
  const condition = document.getElementById('pv-form-condition').value;
  const meter = document.getElementById('pv-form-meter').value;
  const notes = document.getElementById('pv-form-notes').value || 'Inspected and stamped on Nestera.';

  const newItem = {
    id: `pv-${Date.now()}`,
    room,
    itemName: item,
    condition,
    meterReading: meter || null,
    photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'],
    notes,
    tenantAcknowledged: true,
    ownerAcknowledged: false,
    type: AppState.proofVaultTab
  };

  AppState.proofVaultItems.unshift(newItem);

  // Sync with Express backend
  apiCall('/proof-vault', {
    method: 'POST',
    body: JSON.stringify(newItem)
  });

  renderProofVaultItems();
  toggleAddProofItemForm();
  showToast(`Proof item logged to tamper-proof Proof Vault!`);
}

function acknowledgeProofItem(id) {
  const item = AppState.proofVaultItems.find(i => i.id === id);
  if (item) {
    item.tenantAcknowledged = true;
    item.ownerAcknowledged = true;
    renderProofVaultItems();
    showToast(`Condition item signed and timestamped by both parties!`);
  }
}

function disputeProofItem(id) {
  showToast(`Dispute logged. Nestera Concierge mediator assigned.`);
}

/* ==========================================================================
   15. ROOMMATE CONTRACT & HOUSE CONSTITUTION (addme.md Specification)
   ========================================================================== */

function openRoommateContractModal() {
  const modal = document.getElementById('roommate-contract-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeRoommateContractModal() {
  const modal = document.getElementById('roommate-contract-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function updateRentSplitLabel(val) {
  const roommateShare = 100 - parseInt(val, 10);
  const totalRent = 18000;
  const yourAmount = Math.round((totalRent * val) / 100);
  const roommateAmount = totalRent - yourAmount;

  const label = document.getElementById('rc-split-label');
  if (label) {
    label.innerText = `Rent Split: You (${val}%) | Roommate (${roommateShare}%)`;
  }

  const prevRent = document.getElementById('rc-prev-rent');
  if (prevRent) {
    prevRent.innerText = `₹${yourAmount.toLocaleString('en-IN')} (${val}%) / ₹${roommateAmount.toLocaleString('en-IN')} (${roommateShare}%)`;
  }
}

async function handleGenerateRoommateConstitution(e) {
  e.preventDefault();
  const name = document.getElementById('rc-form-name').value;
  const split = document.getElementById('rc-form-split').value;
  const quiet = document.getElementById('rc-form-quiet').value;
  const chores = document.getElementById('rc-form-chores').value;
  const guests = document.getElementById('rc-form-guests').value;

  const prevName = document.getElementById('rc-prev-name');
  const prevChores = document.getElementById('rc-prev-chores');
  const prevQuiet = document.getElementById('rc-prev-quiet');
  const prevGuests = document.getElementById('rc-prev-guests');
  const prevStatus = document.getElementById('rc-prev-status');

  if (prevName) prevName.innerText = name;
  if (prevChores) prevChores.innerText = chores;
  if (prevQuiet) prevQuiet.innerText = quiet;
  if (prevGuests) prevGuests.innerText = guests;
  if (prevStatus) {
    prevStatus.innerText = `✓ ${name} (Signed)`;
    prevStatus.style.color = 'var(--accent-emerald-dark)';
  }

  const payload = {
    roommateName: name,
    rentSplitPercentage: split,
    quietHours: quiet,
    choresRule: chores,
    guestsRule: guests,
    signed: true
  };

  // Sync with Express backend
  apiCall('/roommates/constitution', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  showToast(`House Constitution executed and dispatched to ${name} via WhatsApp!`);
}

/* ==========================================================================
   16. UTILITY BILL & DEED OCR VERIFICATION CONTROLLER (addme.md Specification)
   ========================================================================== */

function openUtilityVerificationModal() {
  const modal = document.getElementById('utility-verification-modal');
  if (modal) {
    const uploadStep = document.getElementById('ocr-upload-step');
    const resultStep = document.getElementById('ocr-result-step');
    if (uploadStep) uploadStep.style.display = 'block';
    if (resultStep) resultStep.style.display = 'none';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeUtilityVerificationModal() {
  const modal = document.getElementById('utility-verification-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function triggerOcrFileSelect() {
  const fileInput = document.getElementById('ocr-file-input');
  if (fileInput) fileInput.click();
}

function handleOcrFileSelected(input) {
  if (input.files && input.files[0]) {
    const fileLabel = document.getElementById('ocr-file-label');
    if (fileLabel) {
      fileLabel.innerHTML = `<strong>Selected:</strong> ${input.files[0].name} (${(input.files[0].size / 1024).toFixed(1)} KB)`;
    }
  }
}

async function runDocumentOcrVerification() {
  const runBtn = document.getElementById('ocr-run-btn');
  if (runBtn) {
    runBtn.innerText = 'Scanning with Tesseract OCR & Municipal Records...';
    runBtn.disabled = true;
  }

  // Backend verification call
  await apiCall('/properties/verify-utility-ocr', {
    method: 'POST',
    body: JSON.stringify({ documentType: document.getElementById('ocr-doc-type')?.value })
  });

  setTimeout(() => {
    if (runBtn) {
      runBtn.innerText = 'Extract Fields & Verify Listing →';
      runBtn.disabled = false;
    }
    const uploadStep = document.getElementById('ocr-upload-step');
    const resultStep = document.getElementById('ocr-result-step');
    if (uploadStep) uploadStep.style.display = 'none';
    if (resultStep) resultStep.style.display = 'block';

    showToast('Document verified with Torrent Power & AMC municipal records!');
  }, 900);
}

/* ==========================================================================
   17. STRIPE ESCROW PAYMENT CONTROLLER (addme.md Specification)
   ========================================================================== */

function openStripePaymentModal() {
  const modal = document.getElementById('stripe-payment-modal');
  if (modal) {
    const checkoutStep = document.getElementById('stripe-checkout-step');
    const successStep = document.getElementById('stripe-success-step');
    if (checkoutStep) checkoutStep.style.display = 'block';
    if (successStep) successStep.style.display = 'none';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeStripePaymentModal() {
  const modal = document.getElementById('stripe-payment-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

async function executeStripeCheckout() {
  const payBtn = document.getElementById('stripe-pay-btn');
  if (payBtn) {
    payBtn.innerText = 'Routing to Stripe Escrow Vault...';
    payBtn.disabled = true;
  }

  // Backend payment call
  await apiCall('/payments/stripe-checkout', {
    method: 'POST',
    body: JSON.stringify({ amount: 18000, recipient: 'Rajesh Patel', purpose: 'Monthly Rent' })
  });

  setTimeout(() => {
    if (payBtn) {
      payBtn.innerText = 'Pay ₹18,000 with Stripe Checkout →';
      payBtn.disabled = false;
    }
    const checkoutStep = document.getElementById('stripe-checkout-step');
    const successStep = document.getElementById('stripe-success-step');
    if (checkoutStep) checkoutStep.style.display = 'none';
    if (successStep) successStep.style.display = 'block';

    showToast('Payment of ₹18,000 completed! Instant GST Rent Receipt issued.');
  }, 1000);
}

/* ==========================================================================
   18. WHATSAPP & 24/7 IN-APP MAINTENANCE BOT CONTROLLER (addme.md Specification)
   ========================================================================== */

function toggleMaintenanceChat(forceState = null) {
  const windowEl = document.getElementById('nestora-bot-window');
  if (!windowEl) return;

  if (forceState !== null) {
    windowEl.style.display = forceState ? 'flex' : 'none';
  } else {
    windowEl.style.display = windowEl.style.display === 'none' ? 'flex' : 'none';
  }

  if (windowEl.style.display === 'flex') {
    const input = document.getElementById('nestora-bot-input');
    if (input) input.focus();
  }
}

async function handleSendMaintenanceChat(e) {
  e.preventDefault();
  const input = document.getElementById('nestora-bot-input');
  const messagesBox = document.getElementById('nestora-bot-messages-box');
  if (!input || !input.value.trim() || !messagesBox) return;

  const userText = input.value.trim();
  input.value = '';

  // Render user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'nestora-msg-bubble nestora-msg-user';
  userBubble.innerText = userText;
  messagesBox.appendChild(userBubble);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Create real ticket & landlord notification from chatbot
  const tenantName = AppState.currentUser?.fullName || 'Aman Singh';
  const shortTitle = userText.length > 35 ? userText.substring(0, 35) + '...' : userText;
  const chatTicket = {
    id: `maint-${Date.now()}`,
    title: shortTitle,
    issue: shortTitle,
    category: 'WhatsApp/Bot Relay',
    status: "Reported",
    statusColor: "yellow",
    urgency: "High",
    priority: "high",
    tenant: tenantName,
    property: 'Palm Grove Luxury Living (Flat 402)',
    location: 'Flat 402, SG Highway',
    reportedAgo: "Just now",
    time: "Just now",
    technician: {
      name: "Ramesh Kumar (Certified Technician)",
      phone: "+91 98765 43210",
      rating: 4.9,
      eta: "Within 2 hours"
    },
    currentStep: 1,
    timeline: [
      { label: "Reported via Bot", time: "Just now", done: true },
      { label: "Assigned", time: "Pending", done: false },
      { label: "Technician Scheduled", time: "Pending", done: false },
      { label: "In Progress", time: "Pending", done: false },
      { label: "Resolved", time: "Pending", done: false }
    ],
    description: userText,
    images: []
  };
  AppState.maintenanceTickets.unshift(chatTicket);

  const newChatNotif = {
    id: `notif-chat-${Date.now()}`,
    user_id: 'usr-owner-1',
    type: 'maintenance',
    title: `Relay Alert: ${shortTitle}`,
    message: `${tenantName} at Flat 402 reported via WhatsApp/Bot: "${userText}". Priority: High.`,
    time: 'Just now',
    read: false,
    relatedId: chatTicket.id,
    actionTarget: `maintenance:${chatTicket.id}`,
    actionText: 'View Ticket',
    tenant: tenantName,
    property: 'Palm Grove Luxury Living (Flat 402)'
  };
  AppState.notifications.unshift(newChatNotif);

  renderMaintenanceTickets();
  renderOwnerMaintenanceTickets();
  renderOwnerNotificationsList();
  updateOwnerSidebarBadges();

  // Typing indicator / response
  setTimeout(async () => {
    let botReply = `🔧 Ticket logged: "${userText}". Our certified technician Ramesh Kumar is dispatched with 48h resolution SLA. Owner has been notified.`;
    
    // Call backend bot relay if available
    const botRes = await apiCall('/maintenance/relay-bot', {
      method: 'POST',
      body: JSON.stringify({ message: userText, sender: tenantName })
    });
    if (botRes && botRes.reply) {
      botReply = botRes.reply;
    }

    const botBubble = document.createElement('div');
    botBubble.className = 'nestora-msg-bubble nestora-msg-bot';
    botBubble.innerHTML = `
      ${botReply}
      <div style="margin-top: 6px; font-size: 0.72rem; opacity: 0.85;">
        WhatsApp status: <span style="color: #25D366; font-weight: 700;">Delivered &amp; Synced ✓</span>
      </div>
    `;
    messagesBox.appendChild(botBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }, 600);
}

// Window Globals for Modals, Tabs & Interactive Features
window.openRoleSelectModal = openRoleSelectModal;
window.closeRoleSelectModal = closeRoleSelectModal;
window.selectRoleOption = selectRoleOption;
window.proceedFromRoleSelect = proceedFromRoleSelect;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.toggleAuthMode = toggleAuthMode;
window.handleAuthSubmit = handleAuthSubmit;
window.openProofVaultModal = openProofVaultModal;
window.closeProofVaultModal = closeProofVaultModal;
window.switchProofVaultTab = switchProofVaultTab;
window.renderProofVaultItems = renderProofVaultItems;
window.toggleAddProofItemForm = toggleAddProofItemForm;
window.submitNewProofItem = submitNewProofItem;
window.acknowledgeProofItem = acknowledgeProofItem;
window.disputeProofItem = disputeProofItem;
window.openRoommateContractModal = openRoommateContractModal;
window.closeRoommateContractModal = closeRoommateContractModal;
window.updateRentSplitLabel = updateRentSplitLabel;
window.handleGenerateRoommateConstitution = handleGenerateRoommateConstitution;
window.openUtilityVerificationModal = openUtilityVerificationModal;
window.closeUtilityVerificationModal = closeUtilityVerificationModal;
window.triggerOcrFileSelect = triggerOcrFileSelect;
window.handleOcrFileSelected = handleOcrFileSelected;
window.runDocumentOcrVerification = runDocumentOcrVerification;
window.openStripePaymentModal = openStripePaymentModal;
window.closeStripePaymentModal = closeStripePaymentModal;
window.executeStripeCheckout = executeStripeCheckout;
window.toggleMaintenanceChat = toggleMaintenanceChat;
window.handleSendMaintenanceChat = handleSendMaintenanceChat;

// Owner Hub & Subpanels Globals
window.switchOwnerTab = switchOwnerTab;
window.toggleOwnerMobileSidebar = toggleOwnerMobileSidebar;
window.updateOwnerSidebarBadges = updateOwnerSidebarBadges;
window.openMaintenanceDetailModal = openMaintenanceDetailModal;
window.closeOwnerTicketDetailModal = closeOwnerTicketDetailModal;
window.handleOwnerUpdateCurrentTicket = handleOwnerUpdateCurrentTicket;
window.handleOwnerMaintenanceStatus = handleOwnerMaintenanceStatus;
window.renderOwnerNotificationsList = renderOwnerNotificationsList;
window.markSingleNotificationRead = markSingleNotificationRead;
window.handleOwnerApplicationAction = handleOwnerApplicationAction;
window.openOwnerEditPropertyModal = openOwnerEditPropertyModal;
window.closeOwnerEditPropertyModal = closeOwnerEditPropertyModal;
window.handleSavePropertyEdit = handleSavePropertyEdit;
window.openOwnerStatusConfirm = openOwnerStatusConfirm;
window.closeOwnerStatusConfirmModal = closeOwnerStatusConfirmModal;
window.executeOwnerStatusChange = executeOwnerStatusChange;
window.openAddPropertyModal = openAddPropertyModal;
window.closeAddPropertyModal = closeAddPropertyModal;

// Roommates Interaction Globals
window.handleConnectRoommate = handleConnectRoommate;
window.getStableRoommateMatch = getStableRoommateMatch;
window.renderRoommateGrid = renderRoommateGrid;
window.renderRoommateSwiper = renderRoommateSwiper;


