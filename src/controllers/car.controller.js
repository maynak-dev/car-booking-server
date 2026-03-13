// src/controllers/car.controller.js
const prisma = require('../prisma');
const fs = require('fs');
const path = require('path');

// Helper to convert file buffer to base64
const fileToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

// Helper to save file locally (development only)
const saveFileLocally = (file) => {
  const uploadDir = 'uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filename = `${Date.now()}-${file.originalname}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, file.buffer);
  return `/uploads/${filename}`;
};

exports.getCars = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, fuel, seats, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (type) filters.type = type;
    if (fuel) filters.fuelType = fuel;
    if (seats) filters.seats = parseInt(seats);
    if (minPrice || maxPrice) {
      filters.pricePerDay = {};
      if (minPrice) filters.pricePerDay.gte = parseFloat(minPrice);
      if (maxPrice) filters.pricePerDay.lte = parseFloat(maxPrice);
    }

    const cars = await prisma.car.findMany({
      where: filters,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    const total = await prisma.car.count({ where: filters });
    res.json({ cars, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCar = async (req, res) => {
  try {
    const { name, brand, model, year, licensePlate, type, fuelType, transmission, seats, pricePerDay, description, isAvailable } = req.body;
    
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (process.env.NODE_ENV === 'production') {
          // In production: store as base64
          const base64 = fileToBase64(file);
          imageUrls.push(base64);
        } else {
          // In development: save locally
          const localUrl = saveFileLocally(file);
          imageUrls.push(localUrl);
        }
      }
    }

    const car = await prisma.car.create({
      data: {
        name,
        brand,
        model,
        year: parseInt(year),
        licensePlate,
        type,
        fuelType,
        transmission,
        seats: parseInt(seats),
        pricePerDay: parseFloat(pricePerDay),
        description,
        images: JSON.stringify(imageUrls),
        isAvailable: isAvailable === 'true'
      }
    });
    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, brand, model, year, licensePlate, type, fuelType, 
      transmission, seats, pricePerDay, description, isAvailable, 
      existingImages 
    } = req.body;

    // Parse existing images (they are either URLs or base64 strings)
    let imageUrls = existingImages ? JSON.parse(existingImages) : [];

    // Process new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (process.env.NODE_ENV === 'production') {
          const base64 = fileToBase64(file);
          imageUrls.push(base64);
        } else {
          const localUrl = saveFileLocally(file);
          imageUrls.push(localUrl);
        }
      }
    }

    const car = await prisma.car.update({
      where: { id },
      data: {
        name,
        brand,
        model,
        year: year ? parseInt(year) : undefined,
        licensePlate,
        type,
        fuelType,
        transmission,
        seats: seats ? parseInt(seats) : undefined,
        pricePerDay: pricePerDay ? parseFloat(pricePerDay) : undefined,
        description,
        images: JSON.stringify(imageUrls),
        isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined
      }
    });
    res.json(car);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    await prisma.car.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};