const express = require('express');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');
const { getCars, getCarById, createCar, updateCar, deleteCar } = require('../controllers/car.controller');
const upload = require('../utils/upload');
const router = express.Router();

router.get('/', getCars);
router.get('/:id', getCarById);
router.post('/', authenticate, authorizeAdmin, upload.array('images', 10), createCar);
router.put('/:id', authenticate, authorizeAdmin, upload.array('images', 10), updateCar);
router.delete('/:id', authenticate, authorizeAdmin, deleteCar);

module.exports = router;