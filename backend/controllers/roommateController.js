const supabase = require('../config/supabase');
const Roommate = require('../models/Roommate');
const fs = require('fs');
const path = require('path');

const defaultRoommates = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/data.json'), 'utf-8')).roommates;

function normalizeRoommate(r) {
  return {
    ...r,
    budgetValue: r.budget_value !== undefined ? Number(r.budget_value) : r.budgetValue,
    preferredLocations: r.preferred_locations || r.preferredLocations,
    moveInDate: r.move_in_date || r.moveInDate,
    compatibilityBreakdown: r.compatibility_breakdown || r.compatibilityBreakdown,
    lookingFor: r.looking_for || r.lookingFor,
    whyCompatible: r.why_compatible || r.whyCompatible
  };
}

// GET /api/roommates
exports.getRoommates = async (req, res) => {
  try {
    let roommates = [];

    if (supabase) {
      const { data, error } = await supabase.from('roommates').select('*');
      if (!error && data && data.length > 0) {
        roommates = data.map(normalizeRoommate);
      }
    }

    if (roommates.length === 0) {
      try {
        roommates = await Roommate.find({});
      } catch (err) {
        roommates = defaultRoommates;
      }
    }

    if (!roommates || roommates.length === 0) {
      roommates = defaultRoommates;
    }
    return res.json({ success: true, count: roommates.length, data: roommates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/roommates/:id
exports.getRoommateById = async (req, res) => {
  try {
    const { id } = req.params;
    let roommate = null;

    if (supabase) {
      const { data } = await supabase.from('roommates').select('*').eq('id', id).single();
      if (data) roommate = normalizeRoommate(data);
    }

    if (!roommate) {
      try {
        roommate = await Roommate.findOne({ id });
      } catch (err) {
        roommate = defaultRoommates.find(r => r.id === id);
      }
    }

    if (!roommate) {
      roommate = defaultRoommates.find(r => r.id === id);
    }

    if (!roommate) {
      return res.status(404).json({ success: false, message: 'Roommate profile not found' });
    }
    return res.json({ success: true, data: roommate });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/roommates/swipe
exports.swipeAction = async (req, res) => {
  try {
    const { roommateId, action } = req.body;
    return res.json({
      success: true,
      action,
      roommateId,
      matched: action === 'match',
      message: action === 'match'
        ? `It's a Match! You and this roommate have compatible habits.`
        : `Skipped profile.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/roommates/preferences/:userId?
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    if (!supabase) {
      return res.status(503).json({ success: false, message: 'Database service unavailable' });
    }

    let query = supabase.from('roommate_preferences').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query.order('updated_at', { ascending: false }).limit(1);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (!data || data.length === 0) {
      return res.json({ success: true, data: null, message: 'No preferences found' });
    }

    return res.json({ success: true, data: data[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/roommates/preferences
exports.savePreferences = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ success: false, message: 'Database service unavailable' });
    }

    const payload = req.body;
    if (!payload) {
      return res.status(400).json({ success: false, message: 'Missing preference payload' });
    }

    const prefData = {
      user_id: payload.user_id || payload.userId || null,
      food_preference: payload.food_preference || 'Pure Vegetarian',
      food_preference_flexibility: payload.food_preference_flexibility || 'No',
      smoking_frequency: payload.smoking_frequency || 'Not at all',
      drinking_frequency: payload.drinking_frequency || 'Not at all',
      eating_out_frequency: payload.eating_out_frequency || 'Occasionally',
      monthly_budget: Number(payload.monthly_budget) || 12000,
      personality_type: payload.personality_type || 'Ambivert',
      relationship_status: payload.relationship_status || 'Single',
      roommate_relationship_preference: payload.roommate_relationship_preference || 'Friendly but independent',
      biggest_roommate_concern: payload.biggest_roommate_concern || 'Poor cleanliness',
      study_location_preference: payload.study_location_preference || 'In the room',
      sleep_schedule: payload.sleep_schedule || '11 PM–12 AM',
      sleep_environment_preference: payload.sleep_environment_preference || 'A little bit of noise is fine.',
      roommate_gender_preference: payload.roommate_gender_preference || 'Any',
      roommate_age_preference: payload.roommate_age_preference || '17–25',
      occupation: payload.occupation || 'Student',
      pet_preference: payload.pet_preference || 'Doesn\'t matter',
      cleanliness_level: payload.cleanliness_level || 'Reasonably tidy',
      personal_space_importance: payload.personal_space_importance || 'Quite important',
      quiz_completed: true,
      updated_at: new Date().toISOString()
    };

    let result;
    if (prefData.user_id) {
      // Upsert by user_id
      const { data, error } = await supabase
        .from('roommate_preferences')
        .upsert(prefData, { onConflict: 'user_id' })
        .select();
      if (error) throw error;
      result = data?.[0] || prefData;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('roommate_preferences')
        .insert(prefData)
        .select();
      if (error) throw error;
      result = data?.[0] || prefData;
    }

    return res.json({
      success: true,
      message: 'Roommate preferences saved successfully',
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

