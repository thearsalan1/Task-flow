import { useState } from "react";
import {type Task,type Column,type Priority } from "../types/types";
import { updateTask, deleteTask, moveTask } from "../api/task";
import TaskModal from "./TaskModal";

interface Props {
  task: Task;
  allColumns: Column[];
  onTaskChanged: () => void;
}

const priorityStyles: Record<Priority, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};

export default function TaskCard({ task, allColumns, onTaskChanged }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const handleEdit = async (data: {
    title: string;
    description?: string;
    priority?: Priority;
  }) => {
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateTask(task.id, data);
      setShowEditModal(false);
      onTaskChanged();
    } catch (err) {
      setEditError("Couldn't save changes. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteTask(task.id);
      onTaskChanged();
    } catch (err) {
      setActionError("Couldn't delete the task.");
      setDeleting(false);
    }
  };

  const handleMove = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newColumnId = e.target.value;
    if (newColumnId === task.columnId) return;
    setMoving(true);
    setActionError(null);
    try {
      await moveTask(task.id, newColumnId);
      onTaskChanged();
    } catch (err) {
      setActionError("Couldn't move the task.");
      setMoving(false);
    }
  };

  return (
    <div className="bg-white rounded-md p-3 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-800">{task.title}</h3>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}

      {actionError && <p className="text-xs text-red-600 mt-2">{actionError}</p>}

      <div className="flex items-center justify-between mt-3 gap-2">
        <select
          value={task.columnId}
          onChange={handleMove}
          disabled={moving}
          className="text-xs border border-gray-300 rounded px-1.5 py-1 flex-1"
        >
          {allColumns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowEditModal(true)}
          className="text-xs text-white  bg-blue-950 rounded-2xl px-2 "
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-gray-500 hover:text-red-600"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </div>

      {showEditModal && (
        <TaskModal
          mode="edit"
          initialData={task}
          onClose={() => {
            setShowEditModal(false);
            setEditError(null);
          }}
          onSubmit={handleEdit}
          submitting={editSubmitting}
          error={editError}
        />
      )}
    </div>
  );
}