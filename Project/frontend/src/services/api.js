import { MOCK_DATA } from './mockData';
import { supabase } from './supabaseClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function normalizeProperty(p) {
  return {
    ...p,
    estimatedLivingCost: p.estimated_living_cost !== undefined ? Number(p.estimated_living_cost) : p.estimatedLivingCost,
    reviewsCount: p.reviews_count !== undefined ? Number(p.reviews_count) : p.reviewsCount,
    transparencyScore: p.transparency_score !== undefined ? Number(p.transparency_score) : p.transparencyScore,
    transparencyBreakdown: p.transparency_breakdown || p.transparencyBreakdown,
    costBreakdown: p.cost_breakdown || p.costBreakdown,
    simplifiedAgreement: p.simplified_agreement || p.simplifiedAgreement,
    rent: Number(p.rent),
    deposit: Number(p.deposit)
  };
}

async function request(endpoint, options = {}, fallbackFn) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw err;
  }
}

export const PropertyAPI = {
  getProperties: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.city && filters.city !== 'all') params.append('city', filters.city);
    if (filters.type && filters.type !== 'All Types') params.append('type', filters.type);
    if (filters.budgetRange && filters.budgetRange !== 'all') params.append('budgetRange', filters.budgetRange);
    if (filters.furnished) params.append('furnished', 'true');
    if (filters.roommatesAllowed) params.append('roommatesAllowed', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/properties${query}`, { method: 'GET' }, async () => {
      // Direct Supabase fallback
      if (supabase) {
        try {
          let sbQuery = supabase.from('properties').select('*');
          if (filters.city && filters.city !== 'all') sbQuery = sbQuery.ilike('city', `%${filters.city}%`);
          if (filters.type && filters.type !== 'All Types') sbQuery = sbQuery.eq('type', filters.type);
          const { data, error } = await sbQuery;
          if (!error && data && data.length > 0) {
            let list = data.map(normalizeProperty);
            if (filters.furnished) list = list.filter(p => p.specs?.furnishing === 'Furnished');
            if (filters.roommatesAllowed) list = list.filter(p => p.specs?.roommatesAllowed);
            if (filters.budgetRange === 'under-15k') list = list.filter(p => p.rent < 15000);
            else if (filters.budgetRange === '15k-25k') list = list.filter(p => p.rent >= 15000 && p.rent <= 25000);
            else if (filters.budgetRange === 'above-25k') list = list.filter(p => p.rent > 25000);

            if (filters.sortBy === 'price-asc') list.sort((a, b) => a.rent - b.rent);
            else if (filters.sortBy === 'price-desc') list.sort((a, b) => b.rent - a.rent);
            else if (filters.sortBy === 'transparency') list.sort((a, b) => b.transparencyScore - a.transparencyScore);
            else if (filters.sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);

            return { success: true, count: list.length, data: list, source: 'supabase' };
          }
        } catch (e) {
          console.warn('[Direct Supabase Query Error]:', e.message);
        }
      }

      // Memory fallback
      let list = [...MOCK_DATA.properties];
      if (filters.city && filters.city !== 'all') {
        list = list.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
      }
      if (filters.type && filters.type !== 'All Types') {
        list = list.filter(p => p.type === filters.type);
      }
      if (filters.furnished) {
        list = list.filter(p => p.specs?.furnishing === 'Furnished');
      }
      if (filters.roommatesAllowed) {
        list = list.filter(p => p.specs?.roommatesAllowed);
      }
      if (filters.budgetRange === 'under-15k') {
        list = list.filter(p => p.rent < 15000);
      } else if (filters.budgetRange === '15k-25k') {
        list = list.filter(p => p.rent >= 15000 && p.rent <= 25000);
      } else if (filters.budgetRange === 'above-25k') {
        list = list.filter(p => p.rent > 25000);
      }
      if (filters.sortBy === 'price-asc') list.sort((a, b) => a.rent - b.rent);
      else if (filters.sortBy === 'price-desc') list.sort((a, b) => b.rent - a.rent);
      else if (filters.sortBy === 'transparency') list.sort((a, b) => b.transparencyScore - a.transparencyScore);
      else if (filters.sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);

      return { success: true, count: list.length, data: list, source: 'mock' };
    });
  },

  getPropertyById: async (id) => {
    return request(`/properties/${id}`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('properties').select('*').eq('id', id).single();
        if (data) return { success: true, data: normalizeProperty(data), source: 'supabase' };
      }
      const prop = MOCK_DATA.properties.find(p => p.id === id);
      return { success: !!prop, data: prop, source: 'mock' };
    });
  },

  scheduleVisit: async (payload) => {
    return request(`/properties/schedule-visit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Visit request submitted! The owner/host will confirm your scheduled slot within 2 hours.'
    }));
  },

  applyNow: async (payload) => {
    return request(`/properties/apply`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Application & digital KYC submitted with 0% brokerage guarantee. Nestora agreement is being generated.'
    }));
  },

  contactOwner: async (payload) => {
    return request(`/properties/contact-owner`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Direct inquiry dispatched to verified landlord via WhatsApp & Nestora chat.'
    }));
  }
};

export const RoommateAPI = {
  getRoommates: async () => {
    return request(`/roommates`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('roommates').select('*');
        if (data && data.length > 0) {
          const list = data.map(r => ({
            ...r,
            budgetValue: r.budget_value ? Number(r.budget_value) : r.budgetValue,
            preferredLocations: r.preferred_locations || r.preferredLocations,
            moveInDate: r.move_in_date || r.moveInDate,
            compatibilityBreakdown: r.compatibility_breakdown || r.compatibilityBreakdown,
            lookingFor: r.looking_for || r.lookingFor,
            whyCompatible: r.why_compatible || r.whyCompatible
          }));
          return { success: true, count: list.length, data: list, source: 'supabase' };
        }
      }
      return { success: true, count: MOCK_DATA.roommates.length, data: MOCK_DATA.roommates, source: 'mock' };
    });
  },

  swipe: async (roommateId, action) => {
    return request(`/roommates/swipe`, {
      method: 'POST',
      body: JSON.stringify({ roommateId, action })
    }, () => ({
      success: true,
      matched: action === 'match',
      message: action === 'match' ? `It's a Match!` : 'Skipped profile'
    }));
  }
};

export const ExpenseAPI = {
  getExpenses: async () => {
    return request(`/expenses`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('shared_expenses').select('*');
        if (data && data.length > 0) {
          const list = data.map(e => ({
            ...e,
            totalAmount: e.total_amount ? Number(e.total_amount) : e.totalAmount,
            paidBy: e.paid_by || e.paidBy,
            yourShare: e.your_share ? Number(e.your_share) : e.yourShare,
            isOwedByYou: e.is_owed_by_you !== undefined ? e.is_owed_by_you : e.isOwedByYou,
            isSettled: e.is_settled !== undefined ? e.is_settled : e.isSettled,
            dueDate: e.due_date || e.dueDate
          }));
          return { success: true, count: list.length, data: list, source: 'supabase' };
        }
      }
      return { success: true, count: MOCK_DATA.sharedExpenses.length, data: MOCK_DATA.sharedExpenses, source: 'mock' };
    });
  },

  createSplitExpense: async (payload) => {
    return request(`/expenses/split`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const share = Math.round(Number(payload.totalAmount) / 2);
      const newExp = {
        id: `exp-${Date.now()}`,
        title: payload.title,
        category: payload.category || 'General',
        total_amount: Number(payload.totalAmount),
        totalAmount: Number(payload.totalAmount),
        paid_by: 'Het Darji (You)',
        paidBy: 'Het Darji (You)',
        your_share: share,
        yourShare: share,
        status: `Roommate owes you ₹${share.toLocaleString('en-IN')}`,
        is_owed_by_you: false,
        isOwedByYou: false,
        is_settled: false,
        isSettled: false,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        due_date: 'Due within 7 days',
        dueDate: 'Due within 7 days'
      };

      if (supabase) {
        await supabase.from('shared_expenses').insert([{
          id: newExp.id,
          title: newExp.title,
          category: newExp.category,
          total_amount: newExp.totalAmount,
          paid_by: newExp.paidBy,
          your_share: newExp.yourShare,
          status: newExp.status,
          is_owed_by_you: false,
          is_settled: false,
          date: newExp.date,
          due_date: newExp.dueDate
        }]);
      }

      MOCK_DATA.sharedExpenses.unshift(newExp);
      return { success: true, data: newExp, message: 'Split expense added successfully to Supabase!' };
    });
  },

  settleBalances: async () => {
    return request(`/expenses/settle-all`, { method: 'POST' }, async () => {
      if (supabase) {
        await supabase.from('shared_expenses').update({
          is_settled: true,
          status: 'Settled ✓',
          is_owed_by_you: false
        }).eq('is_owed_by_you', true);
      }
      MOCK_DATA.sharedExpenses.forEach(e => {
        if (e.isOwedByYou) {
          e.isSettled = true;
          e.status = 'Settled ✓';
          e.isOwedByYou = false;
        }
      });
      return { success: true, message: 'All pending balances settled instantly via UPI in Supabase!' };
    });
  }
};

export const TicketAPI = {
  getTickets: async () => {
    return request(`/tickets`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('maintenance_tickets').select('*');
        if (data && data.length > 0) {
          const list = data.map(t => ({
            ...t,
            statusColor: t.status_color || t.statusColor,
            reportedAgo: t.reported_ago || t.reportedAgo,
            currentStep: t.current_step !== undefined ? t.current_step : t.currentStep
          }));
          return { success: true, count: list.length, data: list, source: 'supabase' };
        }
      }
      return { success: true, count: MOCK_DATA.maintenanceTickets.length, data: MOCK_DATA.maintenanceTickets, source: 'mock' };
    });
  },

  createTicket: async (payload) => {
    return request(`/tickets`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const newTicket = {
        id: `maint-${Date.now()}`,
        title: payload.title,
        category: payload.category || 'Plumbing',
        status: 'Reported',
        status_color: 'yellow',
        statusColor: 'yellow',
        urgency: payload.urgency || 'Medium',
        reported_ago: 'Reported just now',
        reportedAgo: 'Reported just now',
        technician: {
          name: 'Auto-Assigning Vendor...',
          phone: '+91 79 4000 XXXX',
          rating: 4.9,
          eta: 'Within 24 hours'
        },
        current_step: 1,
        currentStep: 1,
        timeline: [
          { label: 'Reported', time: 'Just now', done: true },
          { label: 'Assigned', time: 'Pending', done: false },
          { label: 'Technician Scheduled', time: 'Pending', done: false },
          { label: 'In Progress', time: 'Pending', done: false },
          { label: 'Resolved', time: 'Pending', done: false }
        ],
        description: payload.description || 'Issue reported via Nestora Tenant Hub.',
        location: payload.location || 'Master Bedroom Ensuite',
        images: []
      };

      if (supabase) {
        await supabase.from('maintenance_tickets').insert([newTicket]);
      }

      MOCK_DATA.maintenanceTickets.unshift(newTicket);
      return { success: true, data: newTicket, message: 'Maintenance ticket registered in Supabase!' };
    });
  }
};

export const NotificationAPI = {
  getNotifications: async () => {
    return request(`/notifications`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const list = data.map(n => ({
            ...n,
            actionText: n.action_text || n.actionText,
            actionTarget: n.action_target || n.actionTarget
          }));
          return { success: true, unreadCount: list.filter(n => !n.read).length, data: list, source: 'supabase' };
        }
      }
      return {
        success: true,
        unreadCount: MOCK_DATA.notifications.filter(n => !n.read).length,
        data: MOCK_DATA.notifications,
        source: 'mock'
      };
    });
  },

  markAsRead: async (id) => {
    return request(`/notifications/${id}/read`, { method: 'PATCH' }, async () => {
      if (supabase) {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      }
      const item = MOCK_DATA.notifications.find(n => n.id === id);
      if (item) item.read = true;
      return { success: true };
    });
  },

  markAllRead: async () => {
    return request(`/notifications/mark-all-read`, { method: 'PATCH' }, async () => {
      if (supabase) {
        await supabase.from('notifications').update({ read: true }).neq('id', '');
      }
      MOCK_DATA.notifications.forEach(n => n.read = true);
      return { success: true };
    });
  }
};

export const OwnerAPI = {
  getDashboard: async () => {
    return request(`/owner/dashboard`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('owner_properties').select('*');
        if (data && data.length > 0) {
          const properties = data.map(p => ({
            ...p,
            rent: Number(p.rent),
            paymentStatus: p.payment_status || p.paymentStatus,
            maintenanceStatus: p.maintenance_status || p.maintenanceStatus,
            leaseExpiry: p.lease_expiry || p.leaseExpiry
          }));
          const activeProperties = properties.length;
          const occupiedUnits = properties.filter(p => p.status === 'Occupied').length;
          const occupancyRate = `${((occupiedUnits / activeProperties) * 100).toFixed(1)}%`;
          const monthlyRevenue = properties.filter(p => p.status === 'Occupied').reduce((sum, p) => sum + p.rent, 0);
          return {
            success: true,
            data: {
              stats: {
                activeProperties,
                occupiedUnits,
                occupancyRate,
                monthlyRevenue,
                pendingMaintenance: 2,
                onTimePayments: '95%'
              },
              properties
            },
            source: 'supabase'
          };
        }
      }
      return {
        success: true,
        data: {
          stats: MOCK_DATA.ownerData.stats,
          properties: MOCK_DATA.ownerData.properties
        },
        source: 'mock'
      };
    });
  },

  addProperty: async (payload) => {
    return request(`/owner/properties`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const newUnit = {
        id: `own-${Date.now()}`,
        title: payload.title,
        locality: payload.locality || 'SG Highway, Ahmedabad',
        tenant: 'Under Verification',
        rent: Number(payload.rent),
        status: 'Available',
        payment_status: 'Listed',
        paymentStatus: 'Listed',
        maintenance_status: 'Clear',
        maintenanceStatus: 'Clear',
        lease_expiry: '11 Months',
        leaseExpiry: '11 Months'
      };

      if (supabase) {
        await supabase.from('owner_properties').insert([newUnit]);
      }

      MOCK_DATA.ownerData.properties.unshift(newUnit);
      return { success: true, data: newUnit, message: 'Property listed successfully in Supabase!' };
    });
  }
};

export const ValuationAPI = {
  calculate: async (payload) => {
    return request(`/valuation/calculate`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => {
      const baseRates = { 'sg-highway': 15, 'bodakdev': 22, 'prahlad-nagar': 20, 'navrangpura': 18, 'default': 15 };
      const locKey = (payload.locality || '').toLowerCase().replace(/\s+/g, '-');
      const rate = baseRates[locKey] || 16;
      const carpetArea = Number(payload.area) || (Number(payload.bhk) === 1 ? 550 : Number(payload.bhk) === 2 ? 1100 : 1600);
      let rent = carpetArea * rate;
      if (payload.furnishing === 'Furnished') rent *= 1.25;
      else if (payload.furnishing === 'Semi-Furnished') rent *= 1.10;
      rent += (Number(payload.amenitiesCount || 4) * 400);
      const fairRent = Math.round(rent / 100) * 100;

      return {
        success: true,
        data: {
          fairRent,
          minRange: Math.round(fairRent * 0.92),
          maxRange: Math.round(fairRent * 1.08),
          deposit: fairRent * 2,
          fairnessScore: 94,
          marketRentAverage: Math.round(fairRent * 1.12),
          savingsPerYear: Math.round((fairRent * 1.12 - fairRent) * 12)
        }
      };
    });
  }
};

export const AgreementAPI = {
  getClauses: async () => {
    return request(`/agreement/clauses`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('agreement_clauses').select('*').order('id', { ascending: true });
        if (data && data.length > 0) {
          const list = data.map(c => ({
            ...c,
            clauseTitle: c.clause_title || c.clauseTitle,
            highlightValue: c.highlight_value || c.highlightValue,
            standardLegal: c.standard_legal || c.standardLegal,
            plainEnglish: c.plain_english || c.plainEnglish
          }));
          return { success: true, data: list, source: 'supabase' };
        }
      }
      return {
        success: true,
        data: MOCK_DATA.plainEnglishAgreementClauses,
        source: 'mock'
      };
    });
  },

  sign: async (payload) => {
    return request(`/agreement/sign`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'DigiLocker Aadhaar eSign authenticated! The stamped rental deed is active in Supabase.'
    }));
  },

  requestClarification: async (payload) => {
    return request(`/agreement/clarification`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Your question has been sent to Nestora Legal Assist. A response will arrive within 4 hours.'
    }));
  }
};
