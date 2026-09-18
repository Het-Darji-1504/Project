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
