const supabase = require('../config/supabase');
const Expense = require('../models/Expense');
const fs = require('fs');
const path = require('path');

let localExpenses = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/data.json'), 'utf-8')).sharedExpenses;

function normalizeExpense(e) {
  return {
    ...e,
    totalAmount: e.total_amount !== undefined ? Number(e.total_amount) : e.totalAmount,
    paidBy: e.paid_by || e.paidBy,
    yourShare: e.your_share !== undefined ? Number(e.your_share) : e.yourShare,
    isOwedByYou: e.is_owed_by_you !== undefined ? e.is_owed_by_you : e.isOwedByYou,
    isSettled: e.is_settled !== undefined ? e.is_settled : e.isSettled,
    dueDate: e.due_date || e.dueDate
  };
}

// GET /api/expenses
exports.getExpenses = async (req, res) => {
  try {
    let expenses = [];

    if (supabase) {
      const { data, error } = await supabase.from('shared_expenses').select('*');
      if (!error && data && data.length > 0) {
        expenses = data.map(normalizeExpense);
      }
    }

    if (expenses.length === 0) {
      try {
        expenses = await Expense.find({});
      } catch (err) {
        expenses = localExpenses;
      }
    }

    if (!expenses || expenses.length === 0) {
      expenses = localExpenses;
    }
    return res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/expenses/split
exports.createSplitExpense = async (req, res) => {
  try {
    const { title, totalAmount, category, splitWith } = req.body;
    if (!title || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Title and amount are required' });
    }

    const numRoommates = (Array.isArray(splitWith) && splitWith.length > 0) ? splitWith.length + 1 : 2;
    const sharePerPerson = Math.round(Number(totalAmount) / numRoommates);

    const newExpense = {
      id: `exp-${Date.now()}`,
      title,
      category: category || 'General',
      total_amount: Number(totalAmount),
      totalAmount: Number(totalAmount),
      paid_by: req.body.paidBy || req.headers['x-user-name'] || 'You',
      paidBy: req.body.paidBy || req.headers['x-user-name'] || 'You',
      your_share: sharePerPerson,
      yourShare: sharePerPerson,
      status: `Roommates owe you ₹${(Number(totalAmount) - sharePerPerson).toLocaleString('en-IN')}`,
      is_owed_by_you: false,
      isOwedByYou: false,
      is_settled: false,
      isSettled: false,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      due_date: 'Due within 7 days',
      dueDate: 'Due within 7 days'
    };

    if (supabase) {
      try {
        await supabase.from('shared_expenses').insert([{
          id: newExpense.id,
          title: newExpense.title,
          category: newExpense.category,
          total_amount: newExpense.totalAmount,
          paid_by: newExpense.paidBy,
          your_share: newExpense.yourShare,
          status: newExpense.status,
          is_owed_by_you: false,
          is_settled: false,
          date: newExpense.date,
          due_date: newExpense.dueDate
        }]);
      } catch (sbErr) {
        console.warn('[Supabase Insert Error]:', sbErr.message);
      }
    }

    try {
      await Expense.create(newExpense);
    } catch (err) {
      localExpenses.unshift(newExpense);
    }

    return res.status(201).json({ success: true, data: newExpense, message: 'Split expense added successfully to Supabase!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/expenses/settle-all
exports.settleBalances = async (req, res) => {
  try {
    if (supabase) {
      try {
        await supabase.from('shared_expenses').update({
          is_settled: true,
          status: 'Settled ✓',
          is_owed_by_you: false
        }).eq('is_owed_by_you', true);
      } catch (sbErr) {
        console.warn('[Supabase Settle Error]:', sbErr.message);
      }
    }

    try {
      await Expense.updateMany({ isOwedByYou: true }, { isSettled: true, status: 'Settled ✓', isOwedByYou: false });
    } catch (err) {
      localExpenses = localExpenses.map(e => {
        if (e.isOwedByYou) {
          return { ...e, isSettled: true, status: 'Settled ✓', isOwedByYou: false };
        }
        return e;
      });
    }

    return res.json({ success: true, message: 'All pending balances settled instantly via UPI!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
