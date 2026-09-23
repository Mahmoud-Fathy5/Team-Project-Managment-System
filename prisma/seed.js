import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Mahmoud Fathy',
      email: 'mahmoud@gmail.com',
      age: 20,
      password: passwordHash,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Mohamed Osama',
      email: 'Mohamed@gmail.com',
      age: 32,
      password: passwordHash,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'FlowChart sim',
      description: 'Computer engineering programming technique project',
      ownerId: user1.id,
      projectMembers: {
        create: [{ userId: user1.id }, { userId: user2.id }],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        name: 'Make classes design UML',
        description: 'make a digarm to show the design for the project',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project.id,
        assignedToId: user1.id,
      },
      {
        name: 'create classes',
        description: 'create the classes and their setters/getters',
        priority: 'HIGH',
        status: 'INPROGRESS',
        projectId: project.id,
        assignedToId: user2.id,
      },
      {
        name: 'testing',
        description: 'test the project',
        priority: 'LOW',
        status: 'TODO',
        projectId: project.id,
        assignedToId: user2.id,
      },
    ],
  });
  console.log('db seeded');
}
main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
