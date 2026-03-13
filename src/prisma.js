// src/prisma.js
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create a connection pool using the DATABASE_URL from environment
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Instantiate PrismaClient with the adapter (required for Prisma v7)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;