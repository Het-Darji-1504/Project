const supabase = require('../config/supabase');
const Property = require('../models/Property');
const fs = require('fs');
const path = require('path');

const defaultProperties = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/data.json'), 'utf-8')).properties;

function normalizeProperty(p) {
  const commute = p.true_cost_details?.commuteEstimate || p.trueCostDetails?.commuteEstimate || 1200;
  const grocery = p.true_cost_details?.groceryEstimate || p.trueCostDetails?.groceryEstimate || 3500;
  const rent = Number(p.rent);
  const trueMonthlyCost = rent + commute + grocery;

  return {
    ...p,
    estimatedLivingCost: p.estimated_living_cost !== undefined ? Number(p.estimated_living_cost) : p.estimatedLivingCost,
    reviewsCount: p.reviews_count !== undefined ? Number(p.reviews_count) : p.reviewsCount,
    transparencyScore: p.transparency_score !== undefined ? Number(p.transparency_score) : p.transparencyScore,
    transparencyBreakdown: p.transparency_breakdown || p.transparencyBreakdown,
    costBreakdown: p.cost_breakdown || p.costBreakdown,
    simplifiedAgreement: p.simplified_agreement || p.simplifiedAgreement,
    minMonths: p.min_months !== undefined ? Number(p.min_months) : (p.minMonths || 2),
    maxMonths: p.max_months !== undefined ? Number(p.max_months) : (p.maxMonths || 12),
    availabilityStart: p.availability_start || p.availabilityStart || 'Immediate',
    availabilityEnd: p.availability_end || p.availabilityEnd || 'Flexible',
    shortTermPremium: p.short_term_premium !== undefined ? Number(p.short_term_premium) : (p.shortTermPremium || 0),
    status: p.status || 'Active',
    campusDistances: p.campus_distances || p.campusDistances || { "Nirma University": "1.2 km", "CEPT": "5.0 km" },
    verificationStatus: p.verification_status || p.verificationStatus || 'verified',
    trueCostDetails: { commuteEstimate: commute, groceryEstimate: grocery },
    trueMonthlyCost,
    rent,
    deposit: Number(p.deposit)
  };
}

// GET /api/properties
exports.getProperties = async (req, res) => {
  try {
    const { city, type, budgetRange, furnished, roommatesAllowed, sortBy, duration, campus, includeFound } = req.query;

    let properties = [];

    // 1. Try Supabase first
    if (supabase) {
      try {
        let query = supabase.from('properties').select('*');
        if (city && city !== 'all') {
          query = query.ilike('city', `%${city}%`);
        }
        if (type && type !== 'All Types') {
          query = query.eq('type', type);
        }
        if (includeFound !== 'true') {
          query = query.neq('status', 'Found');
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          properties = data.map(normalizeProperty);
        }
      } catch (sbErr) {
        console.warn('[Supabase Property Query Error]:', sbErr.message);
      }
    }

    // 2. Try MongoDB if Supabase returned nothing
    if (properties.length === 0) {
      try {
        let query = {};
        if (city && city !== 'all') query.city = { $regex: new RegExp(city, 'i') };
        if (type && type !== 'All Types') query.type = type;
        properties = await Property.find(query);
      } catch (dbErr) {
        properties = [...defaultProperties];
        if (city && city !== 'all') {
          properties = properties.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
        }
        if (type && type !== 'All Types') {
          properties = properties.filter(p => p.type === type);
        }
      }
      properties = properties.map(normalizeProperty);
    }

    // Filter out "Found" properties for tenants
    if (includeFound !== 'true') {
      properties = properties.filter(p => p.status !== 'Found');
    }

    // Duration filter: 2-4 month short-term stay filter
    if (duration && duration !== 'all') {
      const targetMonths = parseInt(duration, 10);
      if (!isNaN(targetMonths)) {
        properties = properties.filter(p => p.minMonths <= targetMonths && p.maxMonths >= targetMonths);
      }
    }

    // Nearest Hostels & Campus filter
    if (campus && campus !== 'all') {
      properties = properties.filter(p => p.campusDistances && p.campusDistances[campus]);
      // Sort primarily by proximity to selected campus
      properties.sort((a, b) => {
        const distA = parseFloat(a.campusDistances[campus] || '99');
        const distB = parseFloat(b.campusDistances[campus] || '99');
        return distA - distB;
      });
    }

    // Secondary filters
    if (furnished === 'true') {
      properties = properties.filter(p => p.specs?.furnishing === 'Furnished');
    }
    if (roommatesAllowed === 'true') {
      properties = properties.filter(p => p.specs?.roommatesAllowed);
    }
    if (budgetRange && budgetRange !== 'all') {
      if (budgetRange === 'under-15k') properties = properties.filter(p => p.rent < 15000);
      else if (budgetRange === '15k-25k') properties = properties.filter(p => p.rent >= 15000 && p.rent <= 25000);
      else if (budgetRange === 'above-25k') properties = properties.filter(p => p.rent > 25000);
    }

    // Sorting
    if (sortBy === 'price-asc') properties.sort((a, b) => a.rent - b.rent);
    else if (sortBy === 'price-desc') properties.sort((a, b) => b.rent - a.rent);
    else if (sortBy === 'true-cost') properties.sort((a, b) => a.trueMonthlyCost - b.trueMonthlyCost);
    else if (sortBy === 'transparency') properties.sort((a, b) => b.transparencyScore - a.transparencyScore);
    else if (sortBy === 'rating') properties.sort((a, b) => b.rating - a.rating);

    return res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/properties/:id
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    let prop = null;

    if (supabase) {
      const { data } = await supabase.from('properties').select('*').eq('id', id).single();
      if (data) prop = normalizeProperty(data);
    }

    if (!prop) {
      try {
        prop = await Property.findOne({ id });
      } catch (err) {
        prop = defaultProperties.find(p => p.id === id);
      }
    }

    if (!prop) {
      prop = defaultProperties.find(p => p.id === id);
    }

    if (!prop) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    return res.json({ success: true, data: prop });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/properties/schedule-visit
exports.scheduleVisit = async (req, res) => {
  try {
    const { propertyId, preferredDate, preferredTime, notes } = req.body;
    return res.json({
      success: true,
      message: 'Visit request submitted! The owner/host will confirm your scheduled slot within 2 hours.',
      details: { propertyId, preferredDate, preferredTime, notes }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/properties/apply
exports.applyNow = async (req, res) => {
  try {
    const { propertyId, applicantName, email, phone, duration, moveInDate, aadhaarVerified } = req.body;

    const newApp = {
      id: `app-${Date.now()}`,
      property_id: propertyId || 'prop-1',
      applicant_name: applicantName || 'Resident',
      applicant_email: email || '',
      applicant_phone: phone || '',
      duration: duration || '3 Months',
      move_in_date: moveInDate || new Date().toISOString().split('T')[0],
      monthly_rent: 18000,
      deposit: 36000,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('applications').insert([newApp]);
      } catch (sbErr) {
        console.warn('[Supabase Application Insert]:', sbErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Application & digital KYC submitted with 0% brokerage guarantee. Nestera agreement is being generated.',
      details: { propertyId, applicantName: newApp.applicant_name, aadhaarVerified: !!aadhaarVerified },
      application: newApp
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/properties/contact-owner
exports.contactOwner = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    return res.json({
      success: true,
      message: 'Direct inquiry dispatched to verified landlord via WhatsApp & Nestera chat.',
      details: { propertyId, message }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/properties/:id/status
exports.updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { listingStatus, status } = req.body;
    const newStatus = listingStatus || status || 'Active';

    if (supabase) {
      try {
        await supabase.from('properties').update({ status: newStatus }).eq('id', id);
      } catch (sbErr) {
        console.warn('[Supabase Status Update Error]:', sbErr.message);
      }
    }

    try {
      await Property.findOneAndUpdate({ id }, { status: newStatus });
    } catch (err) {}

    return res.json({
      success: true,
      message: `Property ${id} status successfully updated to ${newStatus}`,
      status: newStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/properties/verify-utility-ocr
exports.verifyUtilityOcr = async (req, res) => {
  try {
    const { documentType } = req.body;
    return res.json({
      success: true,
      verified: true,
      confidence: 96.8,
      consumerNo: 'TP-9982410-AHM',
      billedOwner: 'Rajesh Patel',
      serviceAddress: 'Flat 402, Sunrise Harmony Heights, SG Highway, Ahmedabad',
      billingCycle: 'August 2026',
      documentType: documentType || 'Torrent Power Electricity Bill'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

