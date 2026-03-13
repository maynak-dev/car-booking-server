// src/controllers/booking.controller.js
const prisma = require('../prisma');

exports.checkAvailability = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.query;
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing parameters' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) return res.status(400).json({ message: 'End date must be after start date' });

    const conflicting = await prisma.booking.findFirst({
      where: {
        carId,
        status: { not: 'CANCELLED' },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    });
    res.json({ available: !conflicting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const userId = req.user.userId;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const conflicting = await prisma.booking.findFirst({
      where: {
        carId,
        status: { not: 'CANCELLED' },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    });
    if (conflicting) return res.status(400).json({ message: 'Car not available for selected dates' });

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.pricePerDay;

    const booking = await prisma.booking.create({
      data: {
        userId,
        carId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      }
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      include: { car: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== req.user.userId) return res.sendStatus(403);

    await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};