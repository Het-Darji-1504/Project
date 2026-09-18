const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  status: { type: String, default: 'Reported' },
  statusColor: { type: String, default: 'yellow' },
  urgency: { type: String, default: 'Medium' },
  reportedAgo: { type: String, default: 'Just now' },
  technician: {
    name: { type: String, default: 'Assigning soon...' },
    phone: { type: String, default: '' },
    rating: { type: Number, default: 5.0 },
    eta: { type: String, default: 'Within 24 hours' }
  },
  currentStep: { type: Number, default: 1 },
  timeline: [{
    label: { type: String, required: true },
    time: { type: String, required: true },
    done: { type: Boolean, default: false }
  }],
  description: { type: String, default: '' },
  location: { type: String, default: 'Unit Flat 402' },
  images: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
