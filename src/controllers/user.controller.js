// src/controllers/user.controller.js
const prisma = require('../prisma');

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, phone: true, role: true, isActive: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, phone },
      select: { id: true, email: true, name: true, phone: true, role: true }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};