import { useState } from "react";
import {
  type Column as ColumnType,
  type Task,
  type Priority,
} from "../types/types";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import { createTask } from "../api/task";

interface Props {
  column: ColumnType;
  priorityFilter: Priority | "ALL";
  searchQuery: string;
  allColumns: ColumnType[];
  onTaskChanged: () => void;
}

export default function ColumnView({
  column,
  priorityFilter,
  allColumns,
  searchQuery,
  onTaskChanged,
}: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const visibleTasks = column.tasks
    .filter((t) => priorityFilter === "ALL" || t.priority === priorityFilter)
    .filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase().trim()),
    );

  const handleCreate = async (data: {
    title: string;
    description?: string;
    priority?: Priority;
  }) => {
    setCreating(true);
    setCreateError(null);
    try {
      await createTask({ ...data, columnId: column.id });
      setShowCreateModal(false);
      onTaskChanged();
    } catch (err) {
      setCreateError("Couldn't create the task. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-3 w-86 flex-shrink-0 flex flex-col max-h-[calc(100vh-140px)] hover:shadow-blue-950 shadow-xl  transition-all duration-600 ">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium text-blue-950">{column.name}</h2>
        <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
          {visibleTasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-74 hide-scrollbar">
        {visibleTasks.length === 0 && (
          <p className="text-xs text-gray-400 text-center p-9">No tasks</p>
        )}
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            allColumns={allColumns}
            onTaskChanged={onTaskChanged}
          />
        ))}
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="text-sm text-white hover:bg-blue-900 rounded py-1.5 transition cursor-pointer bg-blue-950 rounded-2xl"
      >
        + Add task
      </button>

      {showCreateModal && (
        <TaskModal
          mode="create"
          onClose={() => {
            setShowCreateModal(false);
            setCreateError(null);
          }}
          onSubmit={handleCreate}
          submitting={creating}
          error={createError}
        />
      )}
    </div>
  );
}
