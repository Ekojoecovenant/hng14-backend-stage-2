import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in .env');
}

// const pool = new Pool({ connectionString });
const adapter = new PrismaNeon({ connectionString });

const prisma = new PrismaClient({
  adapter,
  // log: ['query', 'info', 'warn', 'error'],
});

export default prisma;