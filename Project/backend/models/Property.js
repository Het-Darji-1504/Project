const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  city: { type: String, required: true },
  locality: { type: String, required: true },
  distance: { type: String, default: '' },
  coordinates: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 }
  },
  images: [{ type: String }],
  rent: { type: Number, required: true },
  deposit: { type: Number, required: true },
  estimatedLivingCost: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  verified: { type: Boolean, default: true },
  transparencyScore: { type: Number, default: 90 },
  transparencyBreakdown: {
    pricing: { type: Number, default: 90 },
    agreement: { type: Number, default: 90 },
    owner: { type: Number, default: 90 },
    maintenance: { type: Number, default: 90 },
    physical: { type: Number, default: 90 }
  },
  specs: {
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    area: { type: String, default: '' },
    furnishing: { type: String, default: 'Furnished' },
    facing: { type: String, default: 'North' },
    floor: { type: String, default: '' },
    moveInDate: { type: String, default: 'Immediate' },
    roommatesAllowed: { type: Boolean, default: true }
  },
  amenities: [{ type: String }],
  costBreakdown: {
    rent: { type: Number, required: true },
    electricity: { type: Number, default: 1000 },
    internet: { type: Number, default: 600 },
    maintenance: { type: Number, default: 800 },
    water: { type: Number, default: 200 },
    other: { type: Number, default: 500 }
  },
  owner: {
    name: { type: String, required: true },
    verified: { type: Boolean, default: true },
    phone: { type: String, default: '' },
    responseRate: { type: String, default: '95%' },
    responseTime: { type: String, default: '< 15 mins' },
    experience: { type: String, default: 'Verified Host' }
  },
  simplifiedAgreement: {
    rentAmount: { type: String, default: '' },
    depositRefund: { type: String, default: '' },
    noticePeriod: { type: String, default: '' },
    lockInPeriod: { type: String, default: '' },
    maintenanceRule: { type: String, default: '' },
    guestPolicy: { type: String, default: '' }
  },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);
