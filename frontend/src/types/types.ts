export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  columnId: string;
  createdAt: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  columnId: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: Priority;
}