import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { createTestBoard, cleanupTestBoard } from "./setup.helper.js";

describe("Board stats query (groupBy)", () => {
  let boardId: string;

  beforeAll(async () => {
    const { board, colA, colB } = await createTestBoard();
    boardId = board.id;

    await prisma.task.createMany({
      data: [
        { title: "T1", columnId: colA.id },
        { title: "T2", columnId: colA.id },
        { title: "T3", columnId: colB.id },
      ],
    });
  });

  afterAll(async () => {
    await cleanupTestBoard(boardId);
  });

  it("returns correct task count per column", async () => {
    const stats = await prisma.task.groupBy({
      by: ["columnId"],
      where: { column: { boardId } },
      _count: { id: true },
    });

    const total = stats.reduce((sum, s) => sum + s._count.id, 0);
    expect(total).toBe(3);
    expect(stats).toHaveLength(2);
  });
});
