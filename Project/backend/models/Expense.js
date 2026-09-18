const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  totalAmount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  yourShare: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  isOwedByYou: { type: Boolean, default: false },
  isSettled: { type: Boolean, default: false },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  dueDate: { type: String, default: 'Upcoming' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
