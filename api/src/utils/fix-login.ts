import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:UQgmJTSpyilSBAugUlEWAJNtnyYGagXx@postgres.railway.internal:5432/railway'
    }
  }
});