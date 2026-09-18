const mongoose = require('mongoose');

const roommateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  role: { type: String, default: 'Student' },
  institution: { type: String, default: '' },
  avatar: { type: String, default: '' },
  budget: { type: String, default: '' },
  budgetValue: { type: Number, required: true },
  preferredLocations: [{ type: String }],
  moveInDate: { type: String, default: '' },
  verified: { type: Boolean, default: true },
  compatibility: { type: Number, default: 85 },
  compatibilityBreakdown: {
    lifestyle: { type: Number, default: 85 },
    budget: { type: Number, default: 85 },
    location: { type: Number, default: 85 },
    moveInDate: { type: Number, default: 85 }
  },
  lifestyle: {
    schedule: { type: String, default: '' },
    workStyle: { type: String, default: '' },
    socialLevel: { type: String, default: '' },
    cleanliness: { type: String, default: '' },
    smoking: { type: String, default: 'Non-smoker' },
    pets: { type: String, default: 'Pet-friendly' },
    food: { type: String, default: 'Vegetarian' },
    cooking: { type: String, default: '' }
  },
  about: { type: String, default: '' },
  lookingFor: [{ type: String }],
  whyCompatible: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Roommate', roommateSchema);
