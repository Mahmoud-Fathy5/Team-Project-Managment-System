import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('DB connected');
  } catch (err) {
    console.log(`DB connection error ${err}`);
  }
};

const disConnectDB = async () => await prisma.$disconnect();

export { prisma, connectDB, disConnectDB };
