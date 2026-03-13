const express = require('express');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');
const { 
  getAllBookings, 
  updateBookingStatus, 
  updatePaymentStatus,  
  getAllUsers, 
  blockUser, 
  getStats 
} = require('../controllers/admin.controller');
const router = express.Router();

// All routes below require admin authentication
router.use(authenticate, authorizeAdmin);

router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.put('/bookings/:id/payment', updatePaymentStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/block', blockUser);
router.get('/stats', getStats);

module.exports = router;