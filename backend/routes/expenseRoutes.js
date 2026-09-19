const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.get('/', expenseController.getExpenses);
router.post('/split', expenseController.createSplitExpense);
router.post('/settle-all', expenseController.settleBalances);

module.exports = router;
