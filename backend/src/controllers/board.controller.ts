import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getBoard = async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Board not found" });
    }
    id = id.toString();
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: { tasks: { orderBy: { createdAt: "desc" } } },
        },
      },
    });
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Board found", data: board });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getBoardStats = async (req: Request, res: Response) => {
  let { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ success: false, message: "Id required" });
    }
    id = id.toString();
    const stats = await prisma.task.groupBy({
      by: ["columnId"],
      where: { column: { boardId: id } },
      _count: { id: true },
    });
    return res
      .status(200)
      .json({ success: true, message: "Stats found", data: stats });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
