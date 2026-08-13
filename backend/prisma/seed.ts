import { PrismaClient, Priority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // purana data clear karo (dobara run karne pe duplicate na bane)
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();

  const board = await prisma.board.create({
    data: { name: "TaskFlow Demo Board" },
  });

  const todo = await prisma.column.create({
    data: { name: "To Do", order: 1, boardId: board.id },
  });
  const inProgress = await prisma.column.create({
    data: { name: "In Progress", order: 2, boardId: board.id },
  });
  const done = await prisma.column.create({
    data: { name: "Done", order: 3, boardId: board.id },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Set up project repo",
        priority: Priority.LOW,
        columnId: todo.id,
      },
      {
        title: "Design database schema",
        description: "Board, Column, Task tables",
        priority: Priority.HIGH,
        columnId: todo.id,
      },
      {
        title: "Build API routes",
        priority: Priority.MEDIUM,
        columnId: inProgress.id,
      },
      {
        title: "Write backend tests",
        priority: Priority.HIGH,
        columnId: inProgress.id,
      },
      {
        title: "Init Prisma + Neon",
        description: "Connected DB and ran first migration",
        priority: Priority.MEDIUM,
        columnId: done.id,
      },
      {
        title: "Push initial commit",
        priority: Priority.LOW,
        columnId: done.id,
      },
    ],
  });

  console.log("Seed complete:", { board: board.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
