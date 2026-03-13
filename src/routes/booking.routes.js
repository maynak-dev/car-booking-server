const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { createBooking, getUserBookings, cancelBooking, checkAvailability } = require('../controllers/booking.controller');
const router = express.Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getUserBookings);
router.put('/:id/cancel', authenticate, cancelBooking);
router.get('/check-availability', checkAvailability);

module.exports = router;