const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chargersRoutes = require('./routes/chargers');
const bookingsRoutes = require('./routes/bookings');
const reviewsRoutes = require('./routes/reviews');
const notificationsRoutes = require('./routes/notifications');
const hostRoutes = require('./routes/host');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chargers', chargersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ChargeNear P2P EV Charging API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root friendly API info
app.get('/', (req, res) => {
  res.json({
    name: 'ChargeNear Backend API',
    tagline: 'Every Plug Can Power a Ride.',
    docs: '/api/health'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`⚡ ChargeNear Server running on port ${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
});

