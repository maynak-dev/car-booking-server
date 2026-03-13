const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv/config');

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in environment');
  process.exit(1);
}

// Set up the PostgreSQL connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Initialize PrismaClient with the adapter (required for Prisma v7)
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional – comment out if you want to keep data)
  await prisma.booking.deleteMany({});
  await prisma.car.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Cleared old data');

  // ---------- Users ----------
  // Admin password set to 'admin1234' as requested
  const hashedPasswordAdmin = await bcrypt.hash('admin1234', 10);
  const hashedPasswordUser = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPasswordAdmin,
      name: 'Admin User',
      phone: '+1234567890',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  const users = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        password: hashedPasswordUser,
        name: `Regular User ${i}`,
        phone: `+12345678${i}`,
        role: 'USER',
        isActive: true,
      },
    });
    users.push(user);
    console.log(`Created user: ${user.email}`);
  }

  // ---------- Cars ----------
  const carData = [
    {
      name: 'Toyota Camry',
      brand: 'Toyota',
      model: 'Camry',
      year: 2022,
      licensePlate: 'ABC123',
      type: 'SEDAN',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      seats: 5,
      pricePerDay: 45,
      description: 'Comfortable and reliable sedan, perfect for city driving.',
      images: JSON.stringify(['/uploads/camry1.jpg', '/uploads/camry2.jpg']),
      isAvailable: true,
    },
    {
      name: 'Honda CR-V',
      brand: 'Honda',
      model: 'CR-V',
      year: 2023,
      licensePlate: 'DEF456',
      type: 'SUV',
      fuelType: 'HYBRID',
      transmission: 'AUTOMATIC',
      seats: 5,
      pricePerDay: 65,
      description: 'Spacious SUV with great fuel economy.',
      images: JSON.stringify(['/uploads/crv1.jpg', '/uploads/crv2.jpg']),
      isAvailable: true,
    },
    {
      name: 'Ford Mustang',
      brand: 'Ford',
      model: 'Mustang',
      year: 2021,
      licensePlate: 'GHI789',
      type: 'COUPE',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      seats: 4,
      pricePerDay: 80,
      description: 'Iconic American muscle car – feel the power.',
      images: JSON.stringify(['/uploads/mustang1.jpg', '/uploads/mustang2.jpg']),
      isAvailable: true,
    },
    {
      name: 'Tesla Model 3',
      brand: 'Tesla',
      model: 'Model 3',
      year: 2023,
      licensePlate: 'JKL012',
      type: 'SEDAN',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      seats: 5,
      pricePerDay: 70,
      description: 'All-electric with autopilot and premium interior.',
      images: JSON.stringify(['/uploads/tesla1.jpg', '/uploads/tesla2.jpg']),
      isAvailable: true,
    },
    {
      name: 'Chevrolet Suburban',
      brand: 'Chevrolet',
      model: 'Suburban',
      year: 2022,
      licensePlate: 'MNO345',
      type: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      seats: 8,
      pricePerDay: 95,
      description: 'Massive SUV for family trips and heavy luggage.',
      images: JSON.stringify(['/uploads/suburban1.jpg', '/uploads/suburban2.jpg']),
      isAvailable: true,
    },
    {
      name: 'BMW X5',
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      licensePlate: 'PQR678',
      type: 'SUV',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      seats: 5,
      pricePerDay: 120,
      description: 'Luxury SUV with top-notch performance.',
      images: JSON.stringify(['/uploads/bmwx5-1.jpg', '/uploads/bmwx5-2.jpg']),
      isAvailable: true,
    },
    {
      name: 'Audi A4',
      brand: 'Audi',
      model: 'A4',
      year: 2022,
      licensePlate: 'STU901',
      type: 'SEDAN',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      seats: 5,
      pricePerDay: 55,
      description: 'Sleek and sophisticated sedan.',
      images: JSON.stringify(['/uploads/audia4-1.jpg', '/uploads/audia4-2.jpg']),
      isAvailable: true,
    },
    {
      name: 'Volkswagen Golf',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2021,
      licensePlate: 'VWX234',
      type: 'HATCHBACK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      seats: 5,
      pricePerDay: 40,
      description: 'Practical and fun to drive hatchback.',
      images: JSON.stringify(['/uploads/golf1.jpg', '/uploads/golf2.jpg']),
      isAvailable: true,
    },
    {
      name: 'Porsche 911',
      brand: 'Porsche',
      model: '911',
      year: 2023,
      licensePlate: 'YZA567',
      type: 'COUPE',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      seats: 4,
      pricePerDay: 200,
      description: 'Ultimate sports car experience.',
      images: JSON.stringify(['/uploads/porsche1.jpg', '/uploads/porsche2.jpg']),
      isAvailable: true,
    },
    {
      name: 'Jeep Wrangler',
      brand: 'Jeep',
      model: 'Wrangler',
      year: 2022,
      licensePlate: 'BCD890',
      type: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      seats: 5,
      pricePerDay: 75,
      description: 'Off-road ready, open-air freedom.',
      images: JSON.stringify(['/uploads/jeep1.jpg', '/uploads/jeep2.jpg']),
      isAvailable: true,
    },
  ];

  const cars = [];
  for (const car of carData) {
    const createdCar = await prisma.car.create({ data: car });
    cars.push(createdCar);
    console.log(`Created car: ${createdCar.name} (${createdCar.licensePlate})`);
  }

  // ---------- Bookings ----------
  const bookingsData = [
    {
      userIndex: 0,
      carIndex: 0,
      startDate: new Date('2026-04-10'),
      endDate: new Date('2026-04-15'),
    },
    {
      userIndex: 1,
      carIndex: 1,
      startDate: new Date('2026-04-12'),
      endDate: new Date('2026-04-18'),
    },
    {
      userIndex: 2,
      carIndex: 2,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-07'),
    },
    {
      userIndex: 3,
      carIndex: 3,
      startDate: new Date('2026-05-05'),
      endDate: new Date('2026-05-10'),
    },
    {
      userIndex: 4,
      carIndex: 4,
      startDate: new Date('2026-05-15'),
      endDate: new Date('2026-05-20'),
    },
    {
      userIndex: 0,
      carIndex: 5,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-05'),
    },
    {
      userIndex: 1,
      carIndex: 6,
      startDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-15'),
    },
    {
      userIndex: 2,
      carIndex: 7,
      startDate: new Date('2026-06-20'),
      endDate: new Date('2026-06-25'),
    },
    {
      userIndex: 3,
      carIndex: 8,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-07'),
    },
    {
      userIndex: 4,
      carIndex: 9,
      startDate: new Date('2026-07-10'),
      endDate: new Date('2026-07-15'),
    },
    {
      userIndex: 0,
      carIndex: 0,
      startDate: new Date('2026-07-20'),
      endDate: new Date('2026-07-25'),
    },
    {
      userIndex: 1,
      carIndex: 1,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-07'),
    },
    {
      userIndex: 2,
      carIndex: 2,
      startDate: new Date('2026-08-10'),
      endDate: new Date('2026-08-15'),
    },
    {
      userIndex: 3,
      carIndex: 3,
      startDate: new Date('2026-08-20'),
      endDate: new Date('2026-08-25'),
    },
    {
      userIndex: 4,
      carIndex: 4,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-07'),
    },
  ];

  for (const booking of bookingsData) {
    const user = users[booking.userIndex % users.length];
    const car = cars[booking.carIndex % cars.length];
    const days = Math.ceil((booking.endDate - booking.startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.pricePerDay;

    const createdBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        carId: car.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
    });
    console.log(`Created booking: ${user.name} booked ${car.name} from ${booking.startDate.toISOString().split('T')[0]} to ${booking.endDate.toISOString().split('T')[0]}`);
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });