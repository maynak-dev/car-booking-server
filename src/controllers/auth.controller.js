// src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');   // <-- changed

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'USER'
      }
    });
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user.id, email, name, role: user.role }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.refresh = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const { accessToken } = generateTokens(user.userId, user.role);
    res.json({ accessToken });
  });
};

exports.logout = (req, res) => {
  res.sendStatus(200);
};