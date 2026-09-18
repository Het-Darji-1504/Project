const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  priority: { type: String, enum: ['urgent', 'important', 'social', 'success', 'info'], default: 'info' },
  type: { type: String, default: 'system' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, default: 'Just now' },
  read: { type: Boolean, default: false },
  actionText: { type: String, default: 'View' },
  actionTarget: { type: String, default: 'landing' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
