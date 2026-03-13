const express = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  register
);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;