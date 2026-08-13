import { Priority } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const createTask = async (req: Request, res: Response) => {
  const { title, description, priority, columnId } = req.body;
  try {
    if (!title || title.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Title required" });
    }
    if (title.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Title must be more than 2 characters.",
      });
    }
    if (priority !== undefined && !Object.values(Priority).includes(priority)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid priority" });
    }
    if (!columnId) {
      return res
        .status(400)
        .json({ success: false, message: "Column id required" });
    }
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        priority,
        description,
        columnId,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  let id = req.params.id;
  const { title, description, priority } = req.body;
  try {
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Task id required" });
    }
    if (title !== undefined && title.trim() === "") {
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    if (priority !== undefined && !Object.values(Priority).includes(priority)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid priority" });
    }
    id = id.toString();
    const task = await prisma.task.update({
      where: { id },
      data: { title, description, priority },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const moveTask = async (req: Request, res: Response) => {
  let id = req.params.id;
  const { columnId } = req.body;
  try {
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Task id required" });
    }
    if (!columnId) {
      return res
        .status(400)
        .json({ success: false, message: "Column id required" });
    }
    id = id.toString();
    const task = await prisma.task.update({
      where: { id },
      data: { columnId },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Column change successfully",
      data: task,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  let id = req.params.id;
  if (!id) {
    return res.status(400).json({ success: false, message: "Id required" });
  }
  try {
    id = id.toString();
    await prisma.task.delete({
      where: { id },
    });
    return res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getTasksByPriority = async (req: Request, res: Response) => {
  const { priority } = req.query;
  try {
    if (priority !== undefined) {
      const normalized = String(priority).toUpperCase();
      if (!Object.values(Priority).includes(normalized as Priority)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid priority value" });
      }
      const tasks = await prisma.task.findMany({
        where: { priority: normalized as Priority },
        orderBy: { createdAt: "desc" },
      });
      return res
        .status(200)
        .json({ success: true, message: "Tasks found", data: tasks });
    }

    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res
      .status(200)
      .json({ success: true, message: "Tasks found", data: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
