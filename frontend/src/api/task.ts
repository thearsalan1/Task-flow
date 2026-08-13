import type { ApiResponse, CreateTaskPayload, UpdateTaskPayload, Task } from "../types/types";
import { api } from "./client";

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const res = await api.post<ApiResponse<Task>>(`/tasks`, payload);
  return res.data.data;
};

export const updateTask = async (
  id: string,
  payload: UpdateTaskPayload,
): Promise<Task> => {
  const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
  return res.data.data;
};

export const moveTask = async (id: string, columnId: string): Promise<Task> => {
  const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/move`, { columnId });
  return res.data.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};