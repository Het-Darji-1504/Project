const mongoose = require('mongoose');

const ownerPropertySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  locality: { type: String, required: true },
  tenant: { type: String, default: 'Vacant' },
  rent: { type: Number, required: true },
  status: { type: String, enum: ['Occupied', 'Available', 'Maintenance'], default: 'Available' },
  paymentStatus: { type: String, default: 'Listed' },
  maintenanceStatus: { type: String, default: 'Clear' },
  leaseExpiry: { type: String, default: '11 Months' }
}, {
  timestamps: true
});

module.exports = mongoose.model('OwnerProperty', ownerPropertySchema);
