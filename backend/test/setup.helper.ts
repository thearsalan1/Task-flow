import { prisma } from "../src/lib/prisma.js";

export async function createTestBoard() {
  const board = await prisma.board.create({
    data: { name: "__TEST_BOARD__" },
  });

  const colA = await prisma.column.create({
    data: { name: "Test To Do", order: 1, boardId: board.id },
  });
  const colB = await prisma.column.create({
    data: { name: "Test Done", order: 2, boardId: board.id },
  });

  return { board, colA, colB };
}

export async function cleanupTestBoard(boardId: string) {
  await prisma.task.deleteMany({ where: { column: { boardId } } });
  await prisma.column.deleteMany({ where: { boardId } });
  await prisma.board.delete({ where: { id: boardId } });
}