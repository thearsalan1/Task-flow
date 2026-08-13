import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { createTestBoard, cleanupTestBoard } from "./setup.helper.js";

describe("PATCH /tasks/:id/move", () => {
  let boardId: string;
  let colAId: string;
  let colBId: string;
  let taskId: string;

  beforeAll(async () => {
    const { board, colA, colB } = await createTestBoard();
    boardId = board.id;
    colAId = colA.id;
    colBId = colB.id;

    const task = await prisma.task.create({
      data: { title: "Move me", columnId: colAId },
    });
    taskId = task.id;
  });

  afterAll(async () => {
    await cleanupTestBoard(boardId);
  });

  it("moves a task to a different column", async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}/move`)
      .send({ columnId: colBId });

    expect(res.status).toBe(200);
    expect(res.body.data.columnId).toBe(colBId);

    // DB mein bhi confirm karo actually update hua
    const updated = await prisma.task.findUnique({ where: { id: taskId } });
    expect(updated?.columnId).toBe(colBId);
  });
});
