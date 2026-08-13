import { useEffect, useState } from "react";
import { fetchBoard } from "../api/board";
import { type Board as BoardType, type Priority } from "../types/types";
import PriorityFilter from "./PriorityFilter";
import ColumnView from "./Column";

const BOARD_ID = import.meta.env.VITE_BOARD_ID as string;

export default function Board() {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");

  const loadBoard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBoard(BOARD_ID);
      setBoard(data);
    } catch (err) {
      setError("Couldn't load the board. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadBoard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="flex flex-col min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-blue-950">{board.name}</h1>
        <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />
      </div>

      {/* Grid section */}
      <div className="flex justify-center p-10">
        <div className="grid grid-cols-3 gap-6 w-[80%]">
          {board.columns.map((col) => (
            <ColumnView
              key={col.id}
              column={col}
              priorityFilter={priorityFilter}
              allColumns={board.columns}
              onTaskChanged={loadBoard}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
