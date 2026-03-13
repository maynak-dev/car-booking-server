const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const carRoutes = require('./src/routes/car.routes');
const bookingRoutes = require('./src/routes/booking.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();

// ===== Dynamic CORS Configuration =====
const allowedOrigins = [
  'https://car-booking-client-nu.vercel.app',
  'https://car-booking-admin-za6s.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check explicit list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any Vercel preview URL for admin
    const adminPreviewRegex = /^https:\/\/car-booking-admin-.*-maynak-deys-projects\.vercel\.app$/;
    if (adminPreviewRegex.test(origin)) {
      return callback(null, true);
    }

    // Allow any Vercel preview URL for client
    const clientPreviewRegex = /^https:\/\/car-booking-client-.*-maynak-deys-projects\.vercel\.app$/;
    if (clientPreviewRegex.test(origin)) {
      return callback(null, true);
    }

    // If none match, reject
    callback(new Error('CORS policy does not allow access from this origin.'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// ===== Other Middleware =====
app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

// Serve uploads only in development (in production, use a cloud storage)
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// ===== Error Handling =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ===== Export for Vercel =====
module.exports = app;

// ===== Local Development =====
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}