const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/roommates', require('./routes/roommateRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/valuation', require('./routes/valuationRoutes'));
app.use('/api/agreement', require('./routes/agreementRoutes'));
app.use('/api/proof-vault', require('./routes/proofVaultRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/maintenance', require('./routes/botRoutes'));
app.use('/api/maintenance-bot', require('./routes/botRoutes'));

app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/verification', require('./routes/verificationRoutes'));
app.use('/api/neighborhoods', require('./routes/neighborhoodRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Nestera PropTech REST API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Nestera PropTech API backend server!',
    documentation: '/api/health',
    endpoints: [
      '/api/properties',
      '/api/roommates',
      '/api/expenses',
      '/api/tickets',
      '/api/notifications',
      '/api/owner/dashboard',
      '/api/valuation/calculate',
      '/api/agreement/clauses'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Nestera PropTech API Server running on port ${PORT}`);
  console.log(`📡 Ready for Next.js frontend requests from ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});
