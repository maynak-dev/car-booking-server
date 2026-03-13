const express = require('express');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');
const { getAllBookings, updateBookingStatus, getAllUsers, blockUser, getStats } = require('../controllers/admin.controller');
const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/block', blockUser);
router.get('/stats', getStats);
router.put('/bookings/:id/payment', updatePaymentStatus);

module.exports = router;