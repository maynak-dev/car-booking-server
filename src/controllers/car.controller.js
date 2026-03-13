const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    const { name, brand, model, year, licensePlate, type, fuelType, transmission, seats, pricePerDay, description } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const car = await prisma.car.create({
      data: {
        name, brand, model, year: parseInt(year), licensePlate,
        type, fuelType, transmission, seats: parseInt(seats),
        pricePerDay: parseFloat(pricePerDay), description,
        images: JSON.stringify(images)
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
    const { name, brand, model, year, licensePlate, type, fuelType, transmission, seats, pricePerDay, description } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : undefined;
    const car = await prisma.car.update({
      where: { id },
      data: {
        name, brand, model, year: year ? parseInt(year) : undefined,
        licensePlate, type, fuelType, transmission,
        seats: seats ? parseInt(seats) : undefined,
        pricePerDay: pricePerDay ? parseFloat(pricePerDay) : undefined,
        description,
        images: images ? JSON.stringify(images) : undefined
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