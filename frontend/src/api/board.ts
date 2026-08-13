import { type ApiResponse, type Board } from "../types/types";
import { api } from "./client";

export const fetchBoard = async (boardId: string): Promise<Board> => {
  const res = await api.get<ApiResponse<Board>>(`/boards/${boardId}`);
  return res.data.data;
};
