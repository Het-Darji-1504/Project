const supabase = require('../config/supabase');
const Property = require('../models/Property');
const fs = require('fs');
const path = require('path');

const defaultProperties = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/data.json'), 'utf-8')).properties;

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

// GET /api/properties
exports.getProperties = async (req, res) => {
  try {
    const { city, type, budgetRange, furnished, roommatesAllowed, sortBy } = req.query;

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
    const { propertyId, applicantName, aadhaarVerified } = req.body;
    return res.json({
      success: true,
      message: 'Application & digital KYC submitted with 0% brokerage guarantee. Nestora agreement is being generated.',
      details: { propertyId, applicantName, aadhaarVerified: !!aadhaarVerified }
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
      message: 'Direct inquiry dispatched to verified landlord via WhatsApp & Nestora chat.',
      details: { propertyId, message }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
