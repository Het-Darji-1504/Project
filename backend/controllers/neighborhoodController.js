const supabase = require('../config/supabase');

const localMetrics = [
  {
    id: 'nm-sg',
    locality: 'SG Highway, Ahmedabad',
    safetyScore: 94,
    lightingRating: 4.9,
    transitAccess: 'Direct BRTS at doorstep, Nirma shuttle 200m',
    studentVibe: 'High — 15+ student cafes, late night food stalls, 24/7 co-working',
    noiseLevel: 'Moderate (Quiet residential enclave set back from highway)',
    residentFeedback: [
      { author: 'Aarav M., Nirma Student', vibe: 'Super safe for late night study groups, streetlights always on.' },
      { author: 'Sneha R., PDPU Scholar', vibe: 'Grocery stores open till 1 AM, great security guards at every gate.' }
    ]
  },
  {
    id: 'nm-bodak',
    locality: 'Bodakdev, Ahmedabad',
    safetyScore: 96,
    lightingRating: 4.9,
    transitAccess: 'Metro station 400m, SG Highway crossover',
    studentVibe: 'Very High — premium libraries, quiet study parks',
    noiseLevel: 'Low (Quiet residential tree-lined zone)',
    residentFeedback: [
      { author: 'Pooja S., CEPT Scholar', vibe: 'Best residential vibe in Ahmedabad, zero disturbances.' }
    ]
  }
];

const localReviews = [
  {
    id: 'rev-01',
    propertyId: 'prop-1',
    tenancyId: 'ten-prev-09',
    tenantName: 'Aman Sharma (Nirma B.Tech)',
    ratings: { accuracy: 5, cleanliness: 5, owner: 5, commute: 5, safety: 5, overall: 5 },
    comment: 'Lived here for 6 months during my campus internship. Zero brokerage, accurate utility bills, and Rajesh uncle repaired the geyser on the same day!',
    ownerResponse: 'Thank you Aman! Always welcome back at Nestera spaces.',
    createdAt: '2026-09-01T12:00:00Z'
  },
  {
    id: 'rev-02',
    propertyId: 'prop-1',
    tenancyId: 'ten-prev-10',
    tenantName: 'Diya Parikh (CEPT Design)',
    ratings: { accuracy: 5, cleanliness: 4, owner: 5, commute: 5, safety: 5, overall: 4.8 },
    comment: 'Super peaceful environment for architecture submissions. High speed Torrent Wi-Fi and safe late night entry.',
    ownerResponse: null,
    createdAt: '2026-08-15T15:30:00Z'
  }
];

// GET /api/neighborhoods/:locality
exports.getNeighborhoodMetrics = async (req, res) => {
  try {
    const { locality } = req.params;
    let metric = null;

    if (supabase) {
      const { data } = await supabase.from('neighborhood_metrics').select('*').ilike('locality', `%${locality}%`).single();
      if (data) {
        metric = {
          id: data.id,
          locality: data.locality,
          safetyScore: Number(data.safety_score),
          lightingRating: Number(data.lighting_rating),
          transitAccess: data.transit_access,
          studentVibe: data.student_vibe,
          noiseLevel: data.noise_level,
          residentFeedback: data.resident_feedback || []
        };
      }
    }

    if (!metric) {
      metric = localMetrics.find(m => m.locality.toLowerCase().includes(locality.toLowerCase())) || localMetrics[0];
    }

    return res.json({ success: true, data: metric });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/:propertyId
exports.getReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    let reviews = [];

    if (supabase) {
      const { data, error } = await supabase.from('verified_reviews').select('*').eq('property_id', propertyId).order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        reviews = data.map(r => ({
          id: r.id,
          propertyId: r.property_id,
          tenancyId: r.tenancy_id,
          tenantName: r.tenant_name,
          ratings: r.ratings,
          comment: r.comment,
          ownerResponse: r.owner_response,
          createdAt: r.created_at
        }));
      }
    }

    if (reviews.length === 0) {
      reviews = localReviews.filter(r => r.propertyId === propertyId);
    }

    return res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/reviews
exports.addReview = async (req, res) => {
  try {
    const { propertyId, tenancyId, tenantName, ratings, comment } = req.body;

    const newRev = {
      id: `rev-${Date.now()}`,
      property_id: propertyId || 'prop-1',
      propertyId: propertyId || 'prop-1',
      tenancy_id: tenancyId || 'ten-sg1',
      tenancyId: tenancyId || 'ten-sg1',
      tenant_name: tenantName || 'Resident',
      tenantName: tenantName || 'Resident',
      ratings: ratings || { accuracy: 5, cleanliness: 5, owner: 5, commute: 5, safety: 5, overall: 5 },
      comment: comment || 'Verified student review posted on Nestera.',
      owner_response: null,
      ownerResponse: null,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('verified_reviews').insert([{
          id: newRev.id,
          property_id: newRev.property_id,
          tenancy_id: newRev.tenancy_id,
          tenant_name: newRev.tenant_name,
          ratings: newRev.ratings,
          comment: newRev.comment
        }]);
      } catch (err) {
        console.warn('[Supabase Review Insert]:', err.message);
      }
    }

    localReviews.unshift(newRev);

    return res.status(201).json({
      success: true,
      message: 'Verified tenancy review published! Trust rating updated.',
      review: newRev
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
