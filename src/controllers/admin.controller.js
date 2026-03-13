// src/controllers/admin.controller.js
const prisma = require('../prisma');

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { user: { select: { email: true, name: true } }, car: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// NEW: Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { paymentStatus }
    });
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalCars = await prisma.car.count();
    const totalBookings = await prisma.booking.count();
    const totalUsers = await prisma.user.count();
    const revenue = await prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'CONFIRMED' }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyBookings = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true
    });

    res.json({
      totalCars,
      totalBookings,
      totalUsers,
      revenue: revenue._sum.totalPrice || 0,
      dailyBookings: dailyBookings.map(d => ({
        date: d.createdAt.toISOString().split('T')[0],
        count: d._count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};