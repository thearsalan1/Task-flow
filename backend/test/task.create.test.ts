import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { createTestBoard, cleanupTestBoard } from "./setup.helper.js";

describe("POST /tasks", () => {
  let boardId: string;
  let columnId: string;

  beforeAll(async () => {
    const { board, colA } = await createTestBoard();
    boardId = board.id;
    columnId = colA.id;
  });

  afterAll(async () => {
    await cleanupTestBoard(boardId);
  });

  it("fails to create a task with an empty title", async () => {
    const res = await request(app).post("/tasks").send({ title: "", columnId });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("creates a task successfully with a valid title", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Write tests", columnId });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Write tests");
  });
});
